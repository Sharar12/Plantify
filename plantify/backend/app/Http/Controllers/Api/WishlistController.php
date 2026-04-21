<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * Display the user's wishlist
     */
    public function index(Request $request)
    {
        $wishlists = $request->user()
            ->wishlists()
            ->with(['plant' => fn($q) => $q->with('images')])
            ->paginate(12);

        return response()->json($wishlists);
    }

    /**
     * Add a plant to wishlist
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plant_id' => ['required', 'exists:plants,id'],
        ]);

        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'plant_id' => $validated['plant_id'],
        ]);

        return response()->json([
            'message' => 'Plant added to wishlist',
            'wishlist' => $wishlist->load('plant'),
        ], 201);
    }

    /**
     * Remove a plant from wishlist
     */
    public function destroy(Request $request, $plantId)
    {
        $wishlist = Wishlist::where('user_id', $request->user()->id)
            ->where('plant_id', $plantId)
            ->firstOrFail();

        $wishlist->delete();

        return response()->json([
            'message' => 'Plant removed from wishlist',
        ]);
    }
}
