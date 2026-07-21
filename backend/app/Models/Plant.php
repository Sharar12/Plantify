<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    protected $fillable = [
        'name',
        'scientific_name',
        'category',
        'price',
        'thumbnail',
        'stock',
        'status',
        'average_rating',
        'reviews_count',
        'sold',
        'description',
        'care_tips',
        'images',
        'specialist_id',
    ];

    protected $casts = [
        'price' => 'float',
        'average_rating' => 'float',
    ];
}
