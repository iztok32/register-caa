<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ImportOldUsersCommand extends Command
{
    protected $signature = 'users:import-old {--dry-run : Preview without making changes}';
    protected $description = 'Import users from old_users into users table';

    // old roles_id → new roles.id
    private const ROLE_MAP = [
        1 => 1, // superadmin
        2 => 3, // user (Javni dostop)
        3 => 5, // operator (CAA upravljalec)
        4 => 4, // qualified-user (Kvalificiran uporabnik)
        5 => 2, // admin (CAA Administrator)
    ];

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('[DRY RUN] No changes will be made.');
        }

        $existingEmails = DB::table('users')
            ->pluck('email')
            ->map(fn($e) => strtolower(trim($e)))
            ->flip()
            ->all();

        $rows = DB::table('old_users')->orderBy('users_old_id')->get();

        $imported  = 0;
        $skipped   = 0;
        $noEmail   = 0;

        foreach ($rows as $row) {
            $email = strtolower(trim($row->users_old_email ?? ''));

            if ($email === '') {
                $noEmail++;
                continue;
            }

            if (isset($existingEmails[$email])) {
                $skipped++;
                $this->line("  <fg=yellow>SKIP</>  {$email} (email already exists)");
                continue;
            }

            $name = trim(($row->users_old_name ?? '') . ' ' . ($row->users_old_surname ?? ''));
            if ($name === '') {
                $name = $email;
            }

            $emailVerifiedAt = ($row->users_old_email_comfirmed && $row->users_old_email_comfirmed_date)
                ? $row->users_old_email_comfirmed_date
                : null;

            $qualificationRequestedAt = $row->users_old_request_qualification
                ? ($row->users_old_request_qualification_approved_date ?? $row->users_old_date_modified)
                : null;

            $docTax = $row->users_old_doc_tax
                ? mb_substr(trim($row->users_old_doc_tax), 0, 50)
                : null;

            $userData = [
                'name'                       => $name,
                'email'                       => $email,
                'password'                    => Hash::make(Str::random(32)),
                'is_active'                   => (bool) $row->users_old_active,
                'email_verified_at'           => $emailVerifiedAt,
                'created_at'                  => $row->users_old_date_created,
                'updated_at'                  => $row->users_old_date_modified ?? $row->users_old_date_created,
                'last_login_at'               => $row->users_old_last_login,
                'doc_name'                    => $row->users_old_doc_title ?: null,
                'doc_address'                 => $row->users_old_doc_address ?: null,
                'doc_post_num'                => $row->users_old_doc_postnum ?: null,
                'doc_post_office'             => $row->users_old_doc_postoffice ?: null,
                'doc_tax'                     => $docTax ?: null,
                'doc_registration'            => $row->users_old_doc_maticna ?: null,
                'doc_contact'                 => $row->users_old_doc_kontakt ?: null,
                'doc_legal_basis'             => $row->users_old_doc_pravna_podlaga ?: null,
                'qualification_requested_at'  => $qualificationRequestedAt,
                'two_factor_required'         => false,
            ];

            $newRoleId = self::ROLE_MAP[$row->users_old_roles_id] ?? 3; // default: user

            $this->line("  <fg=green>IMPORT</> {$email} ({$name}) → role_id={$newRoleId}");

            if (!$dryRun) {
                $userId = DB::table('users')->insertGetId($userData);

                DB::table('role_user')->insert([
                    'role_id'    => $newRoleId,
                    'user_id'    => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $existingEmails[$email] = true;
            }

            $imported++;
        }

        $this->newLine();
        $this->info("Done.");
        $this->table(['', 'Count'], [
            ['Imported',      $imported],
            ['Skipped (duplicate email)', $skipped],
            ['Skipped (no email)',         $noEmail],
        ]);

        if ($dryRun) {
            $this->warn('DRY RUN — nothing was saved.');
        }

        return self::SUCCESS;
    }
}
