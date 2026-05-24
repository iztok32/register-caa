<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('old_users', function (Blueprint $table) {
            $table->integer('users_old_id')->primary();
            $table->string('users_old_name')->nullable();
            $table->string('users_old_surname')->nullable();
            $table->string('users_old_address')->nullable();
            $table->string('users_old_postnum', 20)->nullable();
            $table->string('users_old_postname')->nullable();
            $table->string('users_old_email')->nullable();
            $table->string('users_old_username')->nullable();
            $table->text('users_old_password')->nullable();
            $table->integer('users_old_roles_id')->nullable();
            $table->integer('users_old_process_id')->nullable();
            $table->integer('users_old_department_id')->nullable();
            $table->integer('users_old_companies_id')->nullable();
            $table->timestamp('users_old_date_created')->nullable();
            $table->timestamp('users_old_date_modified')->nullable();
            $table->integer('users_old_modifiedby_id')->nullable();
            $table->smallInteger('users_old_email_comfirmed')->nullable();
            $table->timestamp('users_old_email_comfirmed_date')->nullable();
            $table->text('users_old_comfirmed_coda')->nullable();
            $table->timestamp('users_old_last_login')->nullable();
            $table->string('users_old_title')->nullable();
            $table->string('users_old_tax')->nullable();
            $table->smallInteger('users_old_is_auto_password')->default(0);
            $table->smallInteger('users_old_active')->default(0);
            $table->integer('users_old_parent_id')->nullable();
            $table->smallInteger('users_old_request_qualification')->default(0);
            $table->smallInteger('users_old_request_qualification_approved')->default(0);
            $table->integer('users_old_request_qualification_approved_user_id')->nullable();
            $table->timestamp('users_old_request_qualification_approved_date')->nullable();
            $table->string('users_old_doc_title')->nullable();
            $table->string('users_old_doc_address')->nullable();
            $table->string('users_old_doc_postnum', 20)->nullable();
            $table->string('users_old_doc_postoffice')->nullable();
            $table->string('users_old_doc_tax')->nullable();
            $table->string('users_old_doc_maticna', 30)->nullable();
            $table->string('users_old_doc_kontakt')->nullable();
            $table->text('users_old_doc_pravna_podlaga')->nullable();
        });

        $this->importData();
    }

    public function down(): void
    {
        Schema::dropIfExists('old_users');
    }

    private function importData(): void
    {
        $file = database_path('users.sql');

        if (!file_exists($file)) {
            return;
        }

        $sql = file_get_contents($file);

        // Replace MySQL table name with the PostgreSQL table name
        $sql = str_replace('`users_old`', 'old_users', $sql);

        // Remove MySQL backtick quoting
        $sql = str_replace('`', '', $sql);

        // Execute all statements at once (PDO::exec supports multiple statements)
        DB::unprepared($sql);
    }
};
