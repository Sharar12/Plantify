<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrganicFertilizersAndPotsSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'name' => 'TerraCotta Artisan Clay Pot (18cm)',
                'scientific_name' => null,
                'price' => 380.00,
                'stock' => 50,
                'light_requirement' => 'medium',
                'watering_frequency' => 'weekly',
                'difficulty' => 'easy',
                'is_pet_friendly' => true,
                'description' => 'Breathable unglazed porous Italian terracotta clay pot with bottom drainage hole.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Organic Vermicompost Soil Conditioner (5kg)',
                'scientific_name' => null,
                'price' => 190.00,
                'stock' => 100,
                'light_requirement' => 'medium',
                'watering_frequency' => 'weekly',
                'difficulty' => 'easy',
                'is_pet_friendly' => true,
                'description' => 'Nutrient-rich earthworm castings packed with beneficial soil microbes and humic acid.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('plants')->insertOrIgnore($products);
    }
}
