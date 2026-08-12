<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomType extends Model
{
    protected $fillable = ['name', 'description', 'base_price', 'max_occupancy', 'image'];

    // 1 type de chambre -> N chambres physiques
    public function rooms()
    {
        return $this->hasMany(Room::class);
    }
}
