<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReservationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // le contrôle "client connecté" se fait via le middleware 'auth' sur la route
    }

    public function rules(): array
    {
        return [
            'room_id' => ['required', 'exists:rooms,id'],
            'check_in_date' => ['required', 'date', 'after_or_equal:today'],
            'check_out_date' => ['required', 'date', 'after:check_in_date'],
            'number_of_adults' => ['required', 'integer', 'min:1'],
            'number_of_children' => ['nullable', 'integer', 'min:0'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
            'services' => ['nullable', 'array'],
            'services.*' => ['exists:services,id'],
            'quantities' => ['nullable', 'array'],
        ];
    }

    /**
     * Validation "métier" additionnelle : la capacité de la chambre doit être respectée.
     * withValidator permet d'ajouter des règles qui dépendent de plusieurs champs
     * ou de données en base, ce qu'on ne peut pas exprimer avec un simple tableau de règles.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $room = \App\Models\Room::find($this->room_id);
            if ($room) {
                $totalGuests = (int) $this->number_of_adults + (int) ($this->number_of_children ?? 0);
                if ($totalGuests > $room->max_occupancy) {
                    $validator->errors()->add(
                        'number_of_adults',
                        "Cette chambre accepte au maximum {$room->max_occupancy} personne(s)."
                    );
                }
            }
        });
    }
}
