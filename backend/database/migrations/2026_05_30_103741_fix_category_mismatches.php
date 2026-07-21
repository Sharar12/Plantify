<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add missing categories that plants actually use
        DB::table('categories')->insertOrIgnore([
            ['name' => 'Air Purifying', 'description' => 'Plants known for filtering air pollutants', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tropical', 'description' => 'Plants originating from tropical climates', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Trailing', 'description' => 'Plants that naturally trail or vine', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // 2. Fix 'Succulent' (singular) → 'Succulents' (plural) to match the categories table
        DB::table('plants')
            ->where('category', 'Succulent')
            ->update(['category' => 'Succulents']);
    }

    public function down(): void
    {
        // Remove the added categories
        DB::table('categories')
            ->whereIn('name', ['Air Purifying', 'Tropical', 'Trailing'])
            ->delete();

        // Revert plant category change
        DB::table('plants')
            ->where('category', 'Succulents')
            ->update(['category' => 'Succulent']);
    }
};
