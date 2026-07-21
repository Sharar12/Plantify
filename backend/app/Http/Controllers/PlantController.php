<?php

namespace App\Http\Controllers;

use App\Models\Plant;
use Illuminate\Http\Request;

class PlantController extends Controller
{
    public function index()
    {
        return response()->json(Plant::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'category' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'care_tips' => 'nullable|string',
            'stock' => 'integer|min:0',
            'thumbnail' => 'nullable|string',
            'specialist_id' => 'nullable|integer',
            'images' => 'nullable',
        ]);

        $images = $request->input('images');
        if (is_string($images)) {
            $images = json_decode($images, true);
        }
        if (is_array($images)) {
            $validated['images'] = json_encode($images);
        }

        $plant = Plant::create($validated);
        return response()->json($plant, 201);
    }

    public function update(Request $request, $id)
    {
        $plant = Plant::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'category' => 'string|max:255',
            'price' => 'numeric|min:0',
            'description' => 'nullable|string',
            'care_tips' => 'nullable|string',
            'stock' => 'integer|min:0',
            'thumbnail' => 'nullable|string',
            'images' => 'nullable',
        ]);

        $images = $request->input('images');
        if (is_string($images)) {
            $images = json_decode($images, true);
        }
        if (is_array($images)) {
            $validated['images'] = json_encode($images);
        }

        $plant->update($validated);
        return response()->json($plant);
    }

    public function destroy($id)
    {
        $plant = Plant::findOrFail($id);
        $plant->delete();
        return response()->json(['message' => 'Plant deleted successfully']);
    }
}
