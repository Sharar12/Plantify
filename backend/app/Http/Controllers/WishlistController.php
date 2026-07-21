<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $wishlists = Wishlist::where('user_id', $userId)
            ->with('plant')
            ->orderBy('created_at', 'desc')
            ->get();
        
        $plants = $wishlists->pluck('plant')->filter();
        return response()->json($plants);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'plant_id' => 'required|integer',
        ]);

        $exists = Wishlist::where('user_id', $validated['user_id'])
            ->where('plant_id', $validated['plant_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Plant already in wishlist'], 400);
        }

        $wishlist = Wishlist::create($validated);
        return response()->json($wishlist, 201);
    }

    public function destroy(Request $request, $plantId)
    {
        $userId = $request->query('user_id');
        
        Wishlist::where('user_id', $userId)
            ->where('plant_id', $plantId)
            ->delete();

        return response()->json(['message' => 'Removed from wishlist']);
    }

    public function check(Request $request, $plantId)
    {
        $userId = $request->query('user_id');
        
        $exists = Wishlist::where('user_id', $userId)
            ->where('plant_id', $plantId)
            ->exists();

        return response()->json(['in_wishlist' => $exists]);
    }
}