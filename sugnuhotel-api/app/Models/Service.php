<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['name', 'description', 'price', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function reservations()
    {
        // Relation N-N via la table pivot reservation_services,
        // avec des colonnes supplémentaires (quantity, price) accessibles via pivot()
        return $this->belongsToMany(Reservation::class, 'reservation_services')
            ->withPivot(['quantity', 'price'])
            ->withTimestamps();
    }
}
