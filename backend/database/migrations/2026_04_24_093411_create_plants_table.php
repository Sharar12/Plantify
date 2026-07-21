<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('scientific_name')->nullable();
            $table->string('category');
            $table->decimal('price', 8, 2);
            $table->string('thumbnail')->nullable();
            $table->integer('stock')->default(0);
            $table->decimal('average_rating', 3, 2)->default(0);
            $table->integer('reviews_count')->default(0);
            $table->integer('sold')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plants');
    }
};
