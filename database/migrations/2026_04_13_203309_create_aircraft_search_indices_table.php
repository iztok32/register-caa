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
        Schema::create('aircraft_search_indices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empic_id')->unique();
            $table->string('registration_mark')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('type')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('status')->nullable();
            $table->json('current_owners')->nullable();
            $table->text('search_text')->nullable()->fulltext();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aircraft_search_indices');
    }
};
