<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// Une API Resource définit précisément la "forme" du JSON renvoyé au frontend :
// on ne renvoie jamais un modèle Eloquent brut (qui exposerait password_hash, timestamps internes, etc.)
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'phone' => $this->phone,
            'address' => $this->address,
        ];
    }
}
