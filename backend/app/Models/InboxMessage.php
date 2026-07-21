<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InboxMessage extends Model
{
    protected $table = 'inbox_messages';
    protected $fillable = ['user_id', 'order_id', 'title', 'message', 'refund_amount', 'refund_code', 'is_read'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
