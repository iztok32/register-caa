<?php

namespace App\Http\Controllers;

use App\Models\AircraftSearchIndex;
use App\Models\Owner;
use App\Models\SearchLog;
use App\Models\Setting;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class PublicController extends Controller
{
    public function index(Request $request)
    {
        if (!Setting::getBool('public_access_enabled')) {
            return Inertia::render('Welcome', [
                'canLogin'       => Route::has('login'),
                'canRegister'    => Route::has('register'),
                'laravelVersion' => Application::VERSION,
                'phpVersion'     => PHP_VERSION,
            ]);
        }

        $stats = [
            'aircraft_total'       => AircraftSearchIndex::count(),
            'aircraft_registered'  => AircraftSearchIndex::where('status', 'Registered')->count(),
            'owners_persons'       => Owner::whereNotNull('person_last_name')->whereNull('organisation_name')->count(),
            'owners_organisations' => Owner::whereNotNull('organisation_name')->count(),
        ];

        $search        = trim($request->input('search', ''));
        $searchResults = null;
        $rateLimited   = false;

        $minChars   = max(1, (int) Setting::get('search_min_chars', 3));
        $maxResults = max(1, (int) Setting::get('search_max_results', 20));

        if (mb_strlen($search) >= $minChars) {
            $ip          = $request->ip();
            $perMinute   = max(1, (int) Setting::get('search_rate_per_minute', 30));
            $perHour     = max(1, (int) Setting::get('search_rate_per_hour', 200));
            $minuteKey   = "search_rate:{$ip}:m:" . date('YmdHi');
            $hourKey     = "search_rate:{$ip}:h:" . date('YmdH');

            $minuteCount = (int) Cache::get($minuteKey, 0);
            $hourCount   = (int) Cache::get($hourKey, 0);

            if ($minuteCount >= $perMinute || $hourCount >= $perHour) {
                $rateLimited = true;
                SearchLog::create([
                    'ip_address'    => $ip,
                    'user_id'       => $request->user()?->id,
                    'query'         => $search,
                    'results_count' => 0,
                    'is_blocked'    => true,
                ]);
            } else {
                Cache::put($minuteKey, $minuteCount + 1, 60);
                Cache::put($hourKey,   $hourCount   + 1, 3600);

                $term = mb_strtolower($search);

                $searchResults = AircraftSearchIndex::where(function ($q) use ($term) {
                    $q->whereRaw('LOWER(registration_mark) LIKE ?', ["%{$term}%"])
                      ->orWhereRaw('LOWER(manufacturer) LIKE ?', ["%{$term}%"])
                      ->orWhereRaw('LOWER(type) LIKE ?', ["%{$term}%"]);
                })
                ->limit($maxResults)
                ->get(['empic_id', 'registration_mark', 'manufacturer', 'type', 'serial_number', 'status']);

                SearchLog::create([
                    'ip_address'    => $ip,
                    'user_id'       => $request->user()?->id,
                    'query'         => $search,
                    'results_count' => $searchResults->count(),
                    'is_blocked'    => false,
                ]);
            }
        }

        return Inertia::render('PublicSearch', [
            'canLogin'      => Route::has('login'),
            'canRegister'   => Route::has('register'),
            'stats'         => $stats,
            'search'        => $search,
            'searchResults' => $searchResults,
            'rateLimited'   => $rateLimited,
            'minChars'      => $minChars,
        ]);
    }
}
