<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('settings')->insert([
            'key'        => 'notification_emails',
            'type'       => 'json',
            'value'      => '[]',
            'group'      => 'notifications',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('settings')->where('key', 'notification_emails')->delete();
    }
};
