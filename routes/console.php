<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('app:refresh-aircraft-search-index')->daily();

// Re-import AJPES tax entries every Sunday at 02:00
Schedule::command('taxes:import')->weekly()->sundays()->at('02:00')
    ->withoutOverlapping()
    ->runInBackground()
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('taxes:import weekly job failed');
    });

// Fill in missing tax numbers via INETIS — 100 entries per hour (~35 s/run at 350ms/req)
Schedule::command('taxes:fetch-tax-numbers --limit=100')->hourly()
    ->withoutOverlapping()
    ->runInBackground()
    ->onFailure(function () {
        \Illuminate\Support\Facades\Log::error('taxes:fetch-tax-numbers hourly job failed');
    });
