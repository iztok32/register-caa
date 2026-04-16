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
        Schema::create('aircraft', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empic_id')->unique();
            $table->string('registration_mark')->nullable();
            $table->string('status')->nullable();
            $table->date('registered_on')->nullable();
            $table->date('deregistered_on')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('type')->nullable();
            $table->string('serial_number')->nullable();
            $table->integer('construction_year')->nullable();
            $table->integer('active_mortgages')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aircraft');
    }
};
