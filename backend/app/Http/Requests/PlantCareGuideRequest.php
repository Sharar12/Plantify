<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlantCareGuideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plant_id' => 'required|exists:plants,id',
            'sunlight_guidelines' => 'required|string',
            'watering_guidelines' => 'required|string',
            'soil_recommendations' => 'required|string',
            'ideal_temp_min' => 'required|integer|min:0|max:50',
            'ideal_temp_max' => 'required|integer|gte:ideal_temp_min|max:50',
            'fertilizer_schedule' => 'required|string',
        ];
    }
}
