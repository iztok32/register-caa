<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('navigation_items')->insert([
            'type'          => 'users',
            'title_key'     => 'Zahteva za kvalificiran dostop',
            'url'           => '/qualification-request',
            'icon'          => 'UserCheck',
            'metadata'      => json_encode([]),
            'sort_order'    => 1,
            'is_active'     => true,
            'permission'    => null,
            'allowed_roles' => json_encode(['user']),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('navigation_items')
            ->where('type', 'users')
            ->where('url', '/qualification-request')
            ->delete();
    }
};
