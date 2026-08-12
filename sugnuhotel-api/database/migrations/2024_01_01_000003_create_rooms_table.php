<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->foreignId('room_type_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('floor');
            $table->decimal('price_per_night', 8, 2);
            $table->unsignedInteger('max_occupancy');
            $table->enum('status', ['available', 'occupied', 'maintenance', 'out_of_service'])
                  ->default('available');
            $table->timestamps();

            $table->index(['room_type_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};
