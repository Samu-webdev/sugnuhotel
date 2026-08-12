<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchAvailabilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // recherche publique, accessible à tout visiteur
    }

    public function rules(): array
    {
        return [
            // "after_or_equal:today" empêche une date de check-in dans le passé
            'check_in_date' => ['required', 'date', 'after_or_equal:today'],
            // "after:check_in_date" garantit une nuitée d'au moins 1 jour -> dates cohérentes
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'adults' => ['required', 'integer', 'min:1', 'max:10'],
            'children' => ['nullable', 'integer', 'min:0', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'check_in_date.after_or_equal' => "La date d'arrivée ne peut pas être dans le passé.",
            'check_out_date.after' => "La date de départ doit être après la date d'arrivée.",
        ];
    }
}
