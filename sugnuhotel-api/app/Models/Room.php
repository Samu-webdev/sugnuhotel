<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Room extends Model
{
    protected $fillable = [
        'room_number', 'room_type_id', 'floor', 'price_per_night', 'max_occupancy', 'status',
    ];

    public function roomType()
    {
        return $this->belongsTo(RoomType::class);
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }

    public function images()
    {
        return $this->hasMany(RoomImage::class);
    }

    public function amenities()
    {
        return $this->hasMany(RoomAmenity::class);
    }

    /**
     * C'est LE cœur anti double-booking : une chambre est considérée
     * disponible pour [checkIn, checkOut) si aucune réservation active
     * (pending/confirmed/checked_in) ne chevauche cette période.
     *
     * Deux périodes [A_in, A_out) et [B_in, B_out) se chevauchent si :
     *   A_in < B_out  ET  A_out > B_in
     * (comparaison classique de recouvrement d'intervalles)
     */
    public function scopeAvailableBetween($query, Carbon $checkIn, Carbon $checkOut)
    {
        return $query->where('status', '!=', 'out_of_service')
            ->whereDoesntHave('reservations', function ($q) use ($checkIn, $checkOut) {
                $q->whereIn('status', ['pending', 'confirmed', 'checked_in'])
                  ->where('check_in_date', '<', $checkOut)
                  ->where('check_out_date', '>', $checkIn);
            });
    }
}
