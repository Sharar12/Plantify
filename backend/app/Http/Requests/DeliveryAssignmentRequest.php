<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeliveryAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'order_id' => 'required|exists:orders,id',
            'delivery_staff_id' => 'required|exists:users,id',
            'scheduled_date' => 'required|date|after_or_equal:today',
            'special_handling_notes' => 'nullable|string|max:500',
        ];
    }
}
