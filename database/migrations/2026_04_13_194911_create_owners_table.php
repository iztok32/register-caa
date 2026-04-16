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
        Schema::create('owners', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('empic_id')->unique();
            
            // Person
            $table->string('person_last_name')->nullable();
            $table->string('person_first_name')->nullable();
            $table->string('person_trade_register_no')->nullable();
            $table->string('person_street')->nullable();
            $table->string('person_street_no')->nullable();
            $table->string('person_city')->nullable();
            $table->string('person_zip_code')->nullable();
            $table->string('person_country')->nullable();
            $table->text('person_address')->nullable();
            
            // Organisation
            $table->string('organisation_name')->nullable();
            $table->string('organisation_name2')->nullable();
            $table->string('organisation_trade_register_no')->nullable();
            $table->string('organisation_eu_vatin')->nullable();
            $table->string('organisation_street')->nullable();
            $table->string('organisation_street_no')->nullable();
            $table->string('organisation_city')->nullable();
            $table->string('organisation_zip_code')->nullable();
            $table->string('organisation_country')->nullable();
            $table->text('organisation_address')->nullable();
            
            // Other
            $table->string('vatin')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('owners');
    }
};
