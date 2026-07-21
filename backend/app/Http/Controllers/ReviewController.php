<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Plant;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index($plantId)
    {
        $reviews = Review::where('plant_id', $plantId)->with('user:id,name')->orderBy('created_at', 'desc')->get();
        return response()->json($reviews);
    }

    public function store(Request $request, $plantId)
    {
        $validated = $request->validate([
            'stars' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $userId = $request->input('user_id');
        
        $hasPurchased = OrderItem::where('plant_id', $plantId)
            ->whereHas('order', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->exists();

        if (!$hasPurchased) {
            return response()->json([
                'message' => 'You can only review plants you have purchased'
            ], 403);
        }

        $existingReview = Review::where('plant_id', $plantId)
            ->where('user_id', $userId)
            ->first();

        if ($existingReview) {
            $existingReview->update([
                'stars' => $validated['stars'],
                'comment' => $validated['comment'],
            ]);
            $existingReview->save();
        } else {
            $validated['plant_id'] = $plantId;
            $validated['user_id'] = $userId;
            $existingReview = Review::create($validated);
        }

        $this->updatePlantRating($plantId);

        return response()->json($existingReview, 201);
    }

    private function updatePlantRating($plantId)
    {
        $reviews = Review::where('plant_id', $plantId)->get();
        if ($reviews->count() > 0) {
            $avgRating = $reviews->avg('stars');
            Plant::where('id', $plantId)->update([
                'average_rating' => $avgRating,
                'reviews_count' => $reviews->count()
            ]);
        }
    }
}