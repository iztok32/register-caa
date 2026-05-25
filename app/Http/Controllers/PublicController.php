<?php

namespace App\Http\Controllers;

use App\Models\AircraftSearchIndex;
use App\Models\Owner;
use App\Models\Setting;
use Illuminate\Foundation\Application;
use Illuminate\Http\Request;
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

        $search = $request->input('search', '');
        $searchResults = null;

        if (mb_strlen(trim($search)) >= 2) {
            $term = mb_strtolower(trim($search));

            $searchResults = AircraftSearchIndex::where(function ($q) use ($term) {
                $q->whereRaw('LOWER(registration_mark) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(manufacturer) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(type) LIKE ?', ["%{$term}%"]);
            })
            ->limit(15)
            ->get(['empic_id', 'registration_mark', 'manufacturer', 'type', 'serial_number', 'status']);
        }

        return Inertia::render('PublicSearch', [
            'canLogin'      => Route::has('login'),
            'canRegister'   => Route::has('register'),
            'stats'         => $stats,
            'search'        => $search,
            'searchResults' => $searchResults,
        ]);
    }
}
