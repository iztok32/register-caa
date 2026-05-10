<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('navigation_items')->insert([
            'type'          => 'settings',
            'title_key'     => 'Ownership Verification',
            'url'           => '/ownership-verification',
            'icon'          => 'FileSearch',
            'metadata'      => json_encode([]),
            'sort_order'    => 3,
            'is_active'     => true,
            'permission'    => null,
            'allowed_roles' => json_encode(['superadmin', 'admin', 'operator', 'qualified-user']),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Shift existing items that were at sort_order >= 3 (admin-only settings) up by 1
        DB::table('navigation_items')
            ->where('type', 'settings')
            ->whereIn('title_key', [
                'Pravice modulov',
                'Pravice uporabniških skupin',
                'Uporabniške skupine',
                'Moduli',
                'Ureja SuperAdmin',
            ])
            ->increment('sort_order');
    }

    public function down(): void
    {
        DB::table('navigation_items')
            ->where('type', 'settings')
            ->where('url', '/ownership-verification')
            ->delete();

        DB::table('navigation_items')
            ->where('type', 'settings')
            ->whereIn('title_key', [
                'Pravice modulov',
                'Pravice uporabniških skupin',
                'Uporabniške skupine',
                'Moduli',
                'Ureja SuperAdmin',
            ])
            ->decrement('sort_order');
    }
};
