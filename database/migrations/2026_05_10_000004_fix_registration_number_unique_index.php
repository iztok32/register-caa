<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Replace partial unique index with a standard unique index.
        // PostgreSQL treats NULL != NULL so multiple NULL rows are allowed even with UNIQUE.
        // A standard index is required for Laravel's upsert() ON CONFLICT clause.
        DB::statement('DROP INDEX IF EXISTS tax_entries_registration_number_unique');
        Schema::table('tax_entries', function (Blueprint $table) {
            $table->unique('registration_number');
        });
    }

    public function down(): void
    {
        Schema::table('tax_entries', function (Blueprint $table) {
            $table->dropUnique(['registration_number']);
        });
        DB::statement('CREATE UNIQUE INDEX tax_entries_registration_number_unique ON tax_entries (registration_number) WHERE registration_number IS NOT NULL');
    }
};
