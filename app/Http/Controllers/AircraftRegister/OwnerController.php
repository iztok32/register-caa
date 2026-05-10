<?php

namespace App\Http\Controllers\AircraftRegister;

use App\Http\Controllers\Controller;
use App\Models\Owner;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OwnerController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $type = $request->input('type'); // 'person', 'organisation', or null

        $query = Owner::query()
            ->withCount([
                'aircraftOwners as active_aircraft_count' => fn ($q) => $q->where('is_closed', false),
            ]);

        if ($search) {
            $term = mb_strtolower(trim($search));
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(person_last_name) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(person_first_name) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(organisation_name) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(organisation_name2) LIKE ?', ["%{$term}%"])
                  ->orWhere('empic_id', 'LIKE', "%{$term}%")
                  ->orWhereRaw('LOWER(person_city) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(organisation_city) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(vatin) LIKE ?', ["%{$term}%"]);
            });
        }

        if ($type === 'person') {
            $query->whereNotNull('person_last_name');
        } elseif ($type === 'organisation') {
            $query->whereNotNull('organisation_name');
        }

        $owners = $query->orderBy('empic_id')->paginate(20)->withQueryString();

        return Inertia::render('AircraftRegister/Owners/Index', [
            'owners'  => $owners,
            'filters' => ['search' => $search, 'type' => $type],
        ]);
    }

    public function show(int $empicId)
    {
        $owner = Owner::where('empic_id', $empicId)->firstOrFail();

        $aircraftOwners = $owner->aircraftOwners()
            ->with('aircraft')
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
                    'aircraft' => $ao->aircraft ? [
                        'empic_id'          => $ao->aircraft->empic_id,
                        'registration_mark' => $ao->aircraft->registration_mark,
                        'manufacturer'      => $ao->aircraft->manufacturer,
                        'type'              => $ao->aircraft->type,
                        'serial_number'     => $ao->aircraft->serial_number,
                        'status'            => $ao->aircraft->status,
                    ] : null,
                ];
            });

        return Inertia::render('AircraftRegister/Owners/Show', [
            'owner'          => $owner,
            'aircraftOwners' => $aircraftOwners,
        ]);
    }
}
