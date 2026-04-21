<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plant;
use App\Models\Category;
use Illuminate\Http\Request;

class PlantController extends Controller
{
    /**
     * Display a listing of approved plants for guests and customers
     */
    public function index(Request $request)
    {
        $query = Plant::with(['category', 'images'])
            ->approved()
            ->available();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('common_name', 'LIKE', "%{$search}%")
                  ->orWhere('scientific_name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filter by categories
        if ($request->has('categories')) {
            $categories = explode(',', $request->categories);
            $query->whereIn('category_id', $categories);
        }

        // Sort
        $sortField = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        $allowedSorts = ['common_name', 'purchase_price', 'rental_price', 'created_at', 'stock_quantity'];
        
        if (in_array($sortField, $allowedSorts)) {
            $query->orderBy($sortField, $sortOrder);
        }

        $perPage = $request->get('per_page', 12);
        $plants = $query->paginate($perPage);

        // Add average rating and review count to each plant
        $plants->getCollection()->transform(function ($plant) {
            $plant->average_rating = round($plant->reviews()->avg('rating') ?? 0, 1);
            $plant->review_count = $plant->reviews()->count();
            return $plant;
        });

        return response()->json($plants);
    }

    /**
     * Display the specified plant details
     */
    public function show($id)
    {
        $plant = Plant::with([
            'category',
            'images' => function ($query) {
                $query->orderBy('sort_order');
            },
            'reviews.user',
            'questions.user',
            'questions.answerer',
            'comments.user',
            'comments.replies.user'
        ])->findOrFail($id);

        $plant->average_rating = round($plant->reviews()->avg('rating') ?? 0, 1);
        $plant->review_count = $plant->reviews()->count();

        return response()->json($plant);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        $categories = Category::withCount('plants')->get();
        return response()->json($categories);
    }

    /**
     * Get overview stats for guests
     */
    public function stats()
    {
        $totalPlants = Plant::approved()->count();
        $totalCategories = Category::count();

        return response()->json([
            'total_plants' => $totalPlants,
            'total_categories' => $totalCategories,
        ]);
    }
}
