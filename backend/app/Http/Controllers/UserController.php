<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * Get all users
     */
    public function index()
    {
        return response()->json(User::all());
    }

    /**
     * Create a new user (admin only)
     */
     public function store(Request $request)
     {
         $request->validate([
             'name' => 'required|string|max:255',
'phone' => 'required|string|max:11|regex:/^[0-9]+$/',
              'email' => 'required|string|email|max:255|unique:users',
              'password' => 'required|string|min:8',
              'role' => 'required|in:customer,specialist,delivery,admin',
             'address' => 'nullable|string',
         ]);

         $user = User::create([
             'name' => $request->name,
             'phone' => $request->phone,
             'email' => $request->email,
             'password' => Hash::make($request->password),
             'role' => $request->role,
             'address' => $request->address,
         ]);

         return response()->json([
             'message' => 'User created successfully',
             'user' => $user,
         ], 201);
     }

    /**
     * Update a user
     */
     public function update(Request $request, $id)
     {
         $user = User::findOrFail($id);

         $request->validate([
             'name' => 'sometimes|required|string|max:255',
             'phone' => 'sometimes|required|string|max:11|regex:/^[0-9]+$/',
             'email' => 'sometimes|required|string|email|max:255|unique:users,email,' . $id,
             'role' => 'sometimes|required|in:customer,specialist,delivery,admin',
             'address' => 'nullable|string',
         ]);

         if ($request->has('name')) {
             $user->name = $request->name;
         }
         if ($request->has('phone')) {
             $user->phone = $request->phone;
         }
         if ($request->has('email')) {
             $user->email = $request->email;
         }
         if ($request->has('role')) {
             $user->role = $request->role;
         }
         if ($request->has('address')) {
             $user->address = $request->address;
         }

         $user->save();

         return response()->json([
             'message' => 'User updated successfully',
             'user' => $user,
         ]);
     }

    /**
     * Delete a user (admin only)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deletion of admin users
        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Cannot delete admin user'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
