<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Reservation extends Model
{
    protected $fillable = [
        'reservation_number', 'user_id', 'room_id', 'check_in_date', 'check_out_date',
        'number_of_adults', 'number_of_children', 'total_price', 'status', 'special_requests',
    ];

    protected function casts(): array
    {
        return [
            'check_in_date' => 'date',
            'check_out_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class, 'reservation_services')
            ->withPivot(['quantity', 'price'])
            ->withTimestamps();
    }

    // Nombre de nuits, recalculé à la volée avec Carbon
    public function nights(): int
    {
        return (int) $this->check_in_date->diffInDays($this->check_out_date);
    }

    // Utilisé dans les vues pour distinguer "à venir / en cours / passées"
    public function timeStatus(): string
    {
        $today = Carbon::today();

        if ($this->status === 'cancelled') {
            return 'cancelled';
        }
        if ($this->check_out_date->lt($today) || $this->status === 'checked_out') {
            return 'past';
        }
        if ($this->check_in_date->lte($today) && $this->check_out_date->gte($today)) {
            return 'current';
        }
        return 'upcoming';
    }
}
