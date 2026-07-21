<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Order extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'total_price',
        'plant_ids',
        'status',
        'payment_method',
        'billing_address',
        'transaction_id',
        'payment_status',
    ];

    protected $casts = [
        'plant_ids' => 'array',
        'total_price' => 'decimal:2',
        'billing_address' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->id)) {
                do {
                    $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    $id = '';
                    for ($i = 0; $i < 5; $i++) {
                        $id .= $characters[random_int(0, 35)];
                    }
                } while (static::where('id', $id)->exists());

                $order->id = $id;
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
