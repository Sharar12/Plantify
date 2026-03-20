<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlantStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'light_requirement' => 'required|in:low,medium,high',
            'watering_frequency' => 'required|in:daily,biweekly,weekly,dry_out',
            'is_pet_friendly' => 'boolean',
            'difficulty' => 'required|in:easy,moderate,expert',
            'description' => 'required|string',
        ];
    }
}
