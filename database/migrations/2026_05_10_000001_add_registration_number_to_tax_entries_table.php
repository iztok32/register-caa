<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tax_entries', function (Blueprint $table) {
            $table->string('registration_number', 20)->nullable()->after('tax_number');
        });
    }

    public function down(): void
    {
        Schema::table('tax_entries', function (Blueprint $table) {
            $table->dropColumn('registration_number');
        });
    }
};
