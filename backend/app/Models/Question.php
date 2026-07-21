<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    protected $table = 'questions';
    protected $fillable = ['customer_id', 'plant_id', 'specialist_id', 'question', 'answer'];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function specialist()
    {
        return $this->belongsTo(User::class, 'specialist_id');
    }

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }
}