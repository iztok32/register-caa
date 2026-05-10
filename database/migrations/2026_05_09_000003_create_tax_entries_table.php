<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_entries', function (Blueprint $table) {
            $table->id();
            $table->string('tax_number', 20)->unique();
            $table->string('name', 500);
            $table->string('name_short', 255)->nullable();
            $table->string('street', 255)->nullable();
            $table->string('zip_code', 10)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('source', 20)->default('ajpes'); // ajpes | inetis | manual
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();
        });

        // Full-text index for fast search on name and tax_number
        \DB::statement("CREATE INDEX tax_entries_search_idx ON tax_entries USING gin(to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(tax_number,'')))");
        \DB::statement("CREATE INDEX tax_entries_tax_number_idx ON tax_entries (tax_number)");
        \DB::statement("CREATE INDEX tax_entries_name_lower_idx ON tax_entries (lower(name) varchar_pattern_ops)");
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_entries');
    }
};
