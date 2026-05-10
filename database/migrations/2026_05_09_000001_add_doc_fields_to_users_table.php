<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('doc_name')->nullable()->after('last_login_at');
            $table->string('doc_address')->nullable()->after('doc_name');
            $table->string('doc_post_num', 20)->nullable()->after('doc_address');
            $table->string('doc_post_office')->nullable()->after('doc_post_num');
            $table->string('doc_tax', 50)->nullable()->after('doc_post_office');
            $table->text('doc_legal_basis')->nullable()->after('doc_tax');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['doc_name', 'doc_address', 'doc_post_num', 'doc_post_office', 'doc_tax', 'doc_legal_basis']);
        });
    }
};
