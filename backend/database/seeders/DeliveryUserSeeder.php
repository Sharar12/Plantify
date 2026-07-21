<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DeliveryUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create delivery user if not exists
        if (!User::where('email', 'D@gmail.com')->exists()) {
            User::create([
                'name' => 'Delivery User',
                'email' => 'D@gmail.com',
                'phone' => '1234567890',
                'password' => Hash::make('11111111'),
                'role' => 'delivery',
            ]);
        }

        // Create admin user if not exists
        if (!User::where('email', 'AA@gmail.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'email' => 'AA@gmail.com',
                'phone' => '9876543210',
                'password' => Hash::make('11111111'),
                'role' => 'admin',
            ]);
        }
    }
}
