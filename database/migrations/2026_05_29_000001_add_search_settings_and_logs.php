<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_logs', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 45)->index();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('query', 255)->nullable();
            $table->unsignedSmallInteger('results_count')->default(0);
            $table->boolean('is_blocked')->default(false);
            $table->timestamp('created_at')->useCurrent()->index();
        });

        DB::table('settings')->insert([
            [
                'key'        => 'search_rate_per_minute',
                'type'       => 'integer',
                'value'      => '30',
                'group'      => 'search',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'search_rate_per_hour',
                'type'       => 'integer',
                'value'      => '200',
                'group'      => 'search',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'search_max_results',
                'type'       => 'integer',
                'value'      => '20',
                'group'      => 'search',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'search_min_chars',
                'type'       => 'integer',
                'value'      => '3',
                'group'      => 'search',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('search_logs');
        DB::table('settings')->whereIn('key', [
            'search_rate_per_minute',
            'search_rate_per_hour',
            'search_max_results',
            'search_min_chars',
        ])->delete();
    }
};
