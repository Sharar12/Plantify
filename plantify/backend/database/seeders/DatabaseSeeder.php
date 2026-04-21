<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

return new class extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        DB::table('users')->insert([
            [
                'name' => 'Admin User',
                'email' => 'admin@plantify.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Plant Specialist
            [
                'name' => 'Plant Specialist',
                'email' => 'specialist@plantify.com',
                'password' => Hash::make('password123'),
                'role' => 'plant_specialist',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Delivery Partner
            [
                'name' => 'Delivery Partner',
                'email' => 'delivery@plantify.com',
                'password' => Hash::make('password123'),
                'role' => 'delivery_partner',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            // Customer
            [
                'name' => 'Customer User',
                'email' => 'customer@plantify.com',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'email_verified_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        // Create Categories
        DB::table('categories')->insert([
            ['name' => 'Indoor Plants', 'slug' => 'indoor-plants', 'description' => 'Plants suitable for indoor environments', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Outdoor Plants', 'slug' => 'outdoor-plants', 'description' => 'Plants for outdoor gardens and landscapes', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Succulents', 'slug' => 'succulents', 'description' => 'Low-maintenance succulent plants', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Flowering Plants', 'slug' => 'flowering-plants', 'description' => 'Beautiful flowering plants', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Ferns', 'slug' => 'ferns', 'description' => 'Lush fern varieties', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
            ['name' => 'Palms', 'slug' => 'palms', 'description' => 'Tropical palm plants', 'created_at' => Carbon::now(), 'updated_at' => Carbon::now()],
        ]);

        // Sample Plants
        $adminId = DB::table('users')->where('email', 'admin@plantify.com')->value('id');
        $indoorCategoryId = DB::table('categories')->where('slug', 'indoor-plants')->value('id');
        $succulentCategoryId = DB::table('categories')->where('slug', 'succulents')->value('id');

        DB::table('plants')->insert([
            [
                'common_name' => 'Snake Plant',
                'scientific_name' => 'Sansevieria trifasciata',
                'description' => 'A hardy succulent with upright, sword-like leaves. Perfect for beginners and low-light conditions.',
                'category_id' => $indoorCategoryId,
                'care_tips' => 'Water sparingly, allow soil to dry between waterings. Tolerates low light but prefers indirect light.',
                'purchase_price' => 25.99,
                'rental_price' => 8.99,
                'availability_type' => 'both',
                'delivery_timeframe_days' => 5,
                'stock_quantity' => 50,
                'status' => 'approved',
                'created_by' => $adminId,
                'approved_by' => $adminId,
                'approved_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'common_name' => 'Monstera',
                'scientific_name' => 'Monstera deliciosa',
                'description' => 'Popular tropical plant with distinctive split leaves. Adds a dramatic touch to any space.',
                'category_id' => $indoorCategoryId,
                'care_tips' => 'Water when top inch of soil is dry. Prefers bright, indirect light. Mist regularly for humidity.',
                'purchase_price' => 45.99,
                'rental_price' => 15.99,
                'availability_type' => 'both',
                'delivery_timeframe_days' => 7,
                'stock_quantity' => 30,
                'status' => 'approved',
                'created_by' => $adminId,
                'approved_by' => $adminId,
                'approved_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'common_name' => 'Aloe Vera',
                'scientific_name' => 'Aloe barbadensis miller',
                'description' => 'Medicinal succulent with thick, fleshy leaves. Great for burns and skin care.',
                'category_id' => $succulentCategoryId,
                'care_tips' => 'Water deeply but infrequently. Needs bright, direct sunlight. Well-draining soil is essential.',
                'purchase_price' => 18.99,
                'rental_price' => 6.99,
                'availability_type' => 'both',
                'delivery_timeframe_days' => 5,
                'stock_quantity' => 75,
                'status' => 'approved',
                'created_by' => $adminId,
                'approved_by' => $adminId,
                'approved_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        // Sample Reviews
        $customerId = DB::table('users')->where('email', 'customer@plantify.com')->value('id');
        $snakePlantId = DB::table('plants')->where('common_name', 'Snake Plant')->value('id');

        DB::table('reviews')->insert([
            [
                'plant_id' => $snakePlantId,
                'user_id' => $customerId,
                'rating' => 5,
                'title' => 'Perfect for my office!',
                'comment' => 'This snake plant is thriving in my low-light office. Very happy with the purchase.',
                'is_verified_purchase' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);

        // Sample Questions
        DB::table('questions')->insert([
            [
                'plant_id' => $snakePlantId,
                'user_id' => $customerId,
                'question' => 'How often should I water this plant?',
                'answer' => 'Water your Snake Plant every 2-3 weeks, allowing the soil to dry completely between waterings.',
                'answered_by' => $adminId,
                'answered_at' => Carbon::now(),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ]);
    }
};
