<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('doc_contact')->nullable()->after('doc_tax');
            $table->string('doc_registration', 20)->nullable()->after('doc_tax');
            $table->timestamp('qualification_requested_at')->nullable()->after('doc_legal_basis');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['doc_contact', 'doc_registration', 'qualification_requested_at']);
        });
    }
};
