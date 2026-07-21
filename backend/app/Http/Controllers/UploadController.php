<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    /**
     * Handle file upload and return storage path
     */
    public function store(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'file' => 'required|file|max:10240|mimes:jpeg,jpg,png,gif,webp'
        ]);

        // Check if file exists
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }
        
        $file = $request->file('file');
        
        // Check if file is valid
        if (!$file->isValid()) {
            return response()->json(['error' => 'Invalid file'], 400);
        }
        
        // Store file in public disk
        $path = $file->store('uploads', 'public');
        
        return response()->json([
            'path' => $path,
            'url' => Storage::url($path),
        ]);
    }
}
