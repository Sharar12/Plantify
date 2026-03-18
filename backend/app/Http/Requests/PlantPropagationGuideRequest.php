<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PlantPropagationGuideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plant_id' => 'required|exists:plants,id',
            'method' => 'required|in:stem_cutting,division,leaf_cutting,air_layering,water_propagation',
            'difficulty' => 'required|in:easy,moderate,hard',
            'rooting_time_weeks' => 'required|integer|min:1|max:16',
            'step_by_step_instructions' => 'required|array|min:2',
            'step_by_step_instructions.*' => 'required|string|min:5|max:300',
        ];
    }
}
