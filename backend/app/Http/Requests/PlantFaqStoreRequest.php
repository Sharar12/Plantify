<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlantFaqStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plant_id' => 'nullable|exists:plants,id',
            'question' => 'required|string|min:5|max:300',
            'answer' => 'required|string|min:10|max:1000',
            'category' => 'required|in:watering,light,fertilizer,troubleshooting',
        ];
    }
}
