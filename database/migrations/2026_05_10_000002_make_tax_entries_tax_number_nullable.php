<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // tax_number can be null for AJPES PRS entries (which have matična številka, not davčna številka)
        Schema::table('tax_entries', function (Blueprint $table) {
            $table->string('tax_number', 20)->nullable()->change();
        });

        // Drop the old non-partial unique index and recreate as partial (NULLs excluded)
        \DB::statement('DROP INDEX IF EXISTS tax_entries_tax_number_idx');
        \DB::statement('CREATE UNIQUE INDEX IF NOT EXISTS tax_entries_tax_number_unique ON tax_entries (tax_number) WHERE tax_number IS NOT NULL');
    }

    public function down(): void
    {
        \DB::statement('DROP INDEX IF EXISTS tax_entries_tax_number_unique');

        Schema::table('tax_entries', function (Blueprint $table) {
            $table->string('tax_number', 20)->nullable(false)->change();
        });

        \DB::statement('CREATE UNIQUE INDEX tax_entries_tax_number_idx ON tax_entries (tax_number)');
    }
};
