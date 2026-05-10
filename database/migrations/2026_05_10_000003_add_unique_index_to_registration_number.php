<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS tax_entries_registration_number_unique ON tax_entries (registration_number) WHERE registration_number IS NOT NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS tax_entries_registration_number_unique');
    }
};
