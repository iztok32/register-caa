<?php

namespace App\Http\Controllers\AircraftRegister;

use App\Http\Controllers\Controller;
use App\Models\Aircraft;
use App\Models\AircraftSearchIndex;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AircraftController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $canViewOwnership = $this->canViewOwnership($request->user());

        $query = AircraftSearchIndex::query();

        if ($search) {
            $searchTerm = mb_strtolower(trim($search));
            $query->where('search_text', 'LIKE', "%{$searchTerm}%");
        }

        $aircrafts = $query->paginate(20)->withQueryString();

        if (!$canViewOwnership) {
            $aircrafts->through(fn($item) => tap($item, fn($i) => $i->current_owners = null));
        }

        return Inertia::render('AircraftRegister/Aircraft/Index', [
            'aircrafts'        => $aircrafts,
            'filters'          => ['search' => $search],
            'canViewOwnership' => $canViewOwnership,
        ]);
    }

    public function show(Request $request, int $empicId)
    {
        $canViewOwnership = $this->canViewOwnership($request->user());
        $aircraft = Aircraft::where('empic_id', $empicId)->firstOrFail();

        $ownershipHistory = $canViewOwnership
            ? $aircraft->aircraftOwners()
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
                })
            : collect();

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
            'canViewOwnership' => $canViewOwnership,
        ]);
    }

    private function canViewOwnership(?User $user): bool
    {
        if (!$user) return false;
        return match(true) {
            $user->hasRole('user')           => false,
            $user->hasRole('qualified-user') => (bool) $user->two_factor_required,
            default                          => true,
        };
    }
}
