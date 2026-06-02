<?php

namespace App\Http\Controllers;

use App\Models\AircraftSearchIndex;
use App\Models\Owner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $search = $request->input('search', '');

        $stats = [
            'aircraft_total'       => AircraftSearchIndex::count(),
            'aircraft_registered'  => AircraftSearchIndex::where('status', 'Registered')->count(),
            'owners_persons'       => Owner::whereNotNull('person_last_name')->whereNull('organisation_name')->count(),
            'owners_organisations' => Owner::whereNotNull('organisation_name')->count(),
        ];

        $searchResults = null;

        if (strlen(trim($search)) >= 2) {
            $term = mb_strtolower(trim($search));

            $searchResults = AircraftSearchIndex::where('search_text', 'LIKE', "%{$term}%")
                ->limit(15)
                ->get(['empic_id', 'registration_mark', 'manufacturer', 'type', 'serial_number', 'status', 'current_owners']);
        }

        // Users with only the basic 'user' role cannot see ownership/operator data
        $canViewOwnership = !$user->hasRole('user');

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'search' => $search,
            'searchResults' => $searchResults,
            'previousLoginAt' => session('auth.previous_login_at'),
            'canViewOwnership' => $canViewOwnership,
        ]);
    }
}
