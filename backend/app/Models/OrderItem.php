<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'plant_id',
        'quantity',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function plant()
    {
        return $this->belongsTo(Plant::class);
    }
}
