<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wishlist extends Model
{
    protected $fillable = ['user_id', 'plant_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }
}