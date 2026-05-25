<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cache', function (Blueprint $table) {
            // PostgreSQL requires a unique constraint on 'key' for ON CONFLICT upsert
            if (!$this->hasUniqueIndex('cache', 'key')) {
                $table->unique('key');
            }
        });
    }

    public function down(): void
    {
        Schema::table('cache', function (Blueprint $table) {
            $table->dropUnique(['key']);
        });
    }

    private function hasUniqueIndex(string $table, string $column): bool
    {
        $indexes = \Illuminate\Support\Facades\DB::select(
            "SELECT indexname FROM pg_indexes
             WHERE tablename = ? AND indexdef LIKE '%UNIQUE%' AND indexdef LIKE ?",
            [$table, "%($column)%"]
        );

        return count($indexes) > 0;
    }
};
