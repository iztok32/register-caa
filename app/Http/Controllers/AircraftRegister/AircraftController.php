<?php

namespace App\Http\Controllers\AircraftRegister;

use App\Http\Controllers\Controller;
use App\Models\Aircraft;
use App\Models\AircraftSearchIndex;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AircraftController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = AircraftSearchIndex::query();

        if ($search) {
            $searchTerm = mb_strtolower(trim($search));
            $query->where('search_text', 'LIKE', "%{$searchTerm}%");
        }

        $aircrafts = $query->paginate(20)->withQueryString();

        return Inertia::render('AircraftRegister/Aircraft/Index', [
            'aircrafts' => $aircrafts,
            'filters'   => ['search' => $search],
        ]);
    }

    public function show(int $empicId)
    {
        $aircraft = Aircraft::where('empic_id', $empicId)->firstOrFail();

        $ownershipHistory = $aircraft->aircraftOwners()
            ->with('owner')
            ->orderByRaw('is_closed ASC')
            ->orderByRaw("COALESCE(
                CASE WHEN LOWER(role) LIKE '%operator%' THEN operator_since ELSE NULL END,
                CASE WHEN LOWER(role) LIKE '%owner%' THEN owner_since ELSE NULL END,
                start_date
            ) DESC NULLS LAST")
            ->get()
            ->map(function ($ao) {
                $role = strtolower($ao->role ?? '');
                $effectiveStart = str_contains($role, 'operator')
                    ? ($ao->operator_since ?? $ao->start_date)
                    : ($ao->owner_since ?? $ao->start_date);

                return [
                    'id'                   => $ao->id,
                    'role'                 => $ao->role,
                    'is_closed'            => $ao->is_closed,
                    'effective_start'      => $effectiveStart?->format('Y-m-d'),
                    'end_date'             => $ao->end_date?->format('Y-m-d'),
                    'ownership_percentage' => $ao->ownership_percentage,
                    'owner' => $ao->owner ? [
                        'empic_id'     => $ao->owner->empic_id,
                        'name'         => $ao->owner->display_name,
                        'type'         => $ao->owner->owner_type,
                    ] : null,
                ];
            });

        return Inertia::render('AircraftRegister/Aircraft/Show', [
            'aircraft' => [
                'empic_id'          => $aircraft->empic_id,
                'registration_mark' => $aircraft->registration_mark,
                'manufacturer'      => $aircraft->manufacturer,
                'type'              => $aircraft->type,
                'serial_number'     => $aircraft->serial_number,
                'construction_year' => $aircraft->construction_year,
                'status'            => $aircraft->status,
                'registered_on'     => $aircraft->registered_on?->format('Y-m-d'),
                'deregistered_on'   => $aircraft->deregistered_on?->format('Y-m-d'),
                'active_mortgages'  => $aircraft->active_mortgages,
            ],
            'ownershipHistory' => $ownershipHistory,
        ]);
    }
}
