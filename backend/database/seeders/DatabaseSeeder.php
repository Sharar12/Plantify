<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            PlantSeeder::class,
        ]);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        \App\Models\User::create([
            'name' => 'Plant Specialist',
            'email' => 'p@gmail.com',
            'phone' => '1234567890',
            'password' => bcrypt('11111111'),
            'role' => 'specialist',
        ]);
    }
}
