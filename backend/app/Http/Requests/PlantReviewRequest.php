<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlantReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plant_id' => 'required|exists:plants,id',
            'rating' => 'required|integer|min:1|max:5',
            'plant_health_rating' => 'required|integer|min:1|max:5',
            'packaging_rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
        ];
    }
}
