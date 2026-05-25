<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('type')->default('boolean'); // boolean, string, integer
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        DB::table('settings')->insert([
            [
                'key'        => 'public_access_enabled',
                'type'       => 'boolean',
                'value'      => '0',
                'group'      => 'access',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'key'        => 'two_factor_required_global',
                'type'       => 'boolean',
                'value'      => '0',
                'group'      => 'security',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // Navigation item for settings
        $maxOrder = DB::table('navigation_items')->max('sort_order') ?? 0;

        DB::table('navigation_items')->insert([
            'type'          => 'core',
            'title_key'     => 'System Settings',
            'url'           => '/settings',
            'icon'          => 'Settings',
            'allowed_roles' => json_encode(['superadmin', 'admin']),
            'is_active'     => true,
            'sort_order'    => $maxOrder + 1,
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
        DB::table('navigation_items')->where('url', '/settings')->delete();
    }
};
