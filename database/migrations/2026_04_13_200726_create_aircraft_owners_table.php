<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('aircraft_owners', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('aircraft_registration_id')->index();
            $table->unsignedBigInteger('owner_empic_id')->index();
            $table->string('role')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->date('operator_since')->nullable();
            $table->date('owner_since')->nullable();
            $table->decimal('ownership_percentage', 5, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aircraft_owners');
    }
};
