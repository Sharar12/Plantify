<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SpecialistConsultationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plant_name' => 'required|string|max:150',
            'symptoms' => 'required|array|min:1',
            'symptoms.*' => 'string|max:100',
            'notes' => 'nullable|string|max:1000',
            'photos' => 'nullable|array|max:4',
            'photos.*' => 'image|mimes:jpeg,png,webp|max:5120',
        ];
    }
}
