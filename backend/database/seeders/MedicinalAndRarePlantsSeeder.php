<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MedicinalAndRarePlantsSeeder extends Seeder
{
    public function run(): void
    {
        $plants = [
            [
                'name' => 'Aloe Vera Barbadensis',
                'scientific_name' => 'Aloe barbadensis Miller',
                'price' => 250.00,
                'stock' => 30,
                'light_requirement' => 'high',
                'watering_frequency' => 'dry_out',
                'difficulty' => 'easy',
                'is_pet_friendly' => false,
                'description' => 'Renowned healing succulent with soothing gel for skin and air-purifying qualities.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Holy Basil (Tulsi)',
                'scientific_name' => 'Ocimum sanctum',
                'price' => 150.00,
                'stock' => 45,
                'light_requirement' => 'high',
                'watering_frequency' => 'daily',
                'difficulty' => 'easy',
                'is_pet_friendly' => true,
                'description' => 'Sacred medicinal plant widely revered for immune-boosting herbal teas and aroma.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('plants')->insertOrIgnore($plants);
    }
}
