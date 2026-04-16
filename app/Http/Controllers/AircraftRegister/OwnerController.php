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
        $type = $request->input('type'); // 'person', 'organisation', or null for all

        $query = Owner::query()
            ->withCount([
                'aircraftOwners as active_aircraft_count' => function ($q) {
                    $q->where('is_closed', false);
                },
            ]);

        if ($search) {
            $searchTerm = mb_strtolower(trim($search));
            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(person_last_name) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(person_first_name) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(organisation_name) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(organisation_name2) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhere('empic_id', 'LIKE', "%{$searchTerm}%")
                  ->orWhereRaw('LOWER(person_city) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(organisation_city) LIKE ?', ["%{$searchTerm}%"])
                  ->orWhereRaw('LOWER(vatin) LIKE ?', ["%{$searchTerm}%"]);
            });
        }

        if ($type === 'person') {
            $query->whereNotNull('person_last_name');
        } elseif ($type === 'organisation') {
            $query->whereNotNull('organisation_name');
        }

        $owners = $query->orderBy('empic_id')->paginate(20)->withQueryString();

        return Inertia::render('AircraftRegister/Owners/Index', [
            'owners' => $owners,
            'filters' => [
                'search' => $search,
                'type' => $type,
            ],
        ]);
    }

    public function show(Request $request, int $empicId)
    {
        $owner = Owner::where('empic_id', $empicId)->firstOrFail();

        $aircraftOwners = $owner->aircraftOwners()
            ->with('aircraft')
            ->orderByRaw('is_closed ASC')
            ->orderByDesc('start_date')
            ->get()
            ->map(function ($ao) {
                return [
                    'id' => $ao->id,
                    'role' => $ao->role,
                    'is_closed' => $ao->is_closed,
                    'start_date' => $ao->start_date,
                    'end_date' => $ao->end_date,
                    'operator_since' => $ao->operator_since,
                    'owner_since' => $ao->owner_since,
                    'ownership_percentage' => $ao->ownership_percentage,
                    'aircraft' => $ao->aircraft ? [
                        'empic_id' => $ao->aircraft->empic_id,
                        'registration_mark' => $ao->aircraft->registration_mark,
                        'manufacturer' => $ao->aircraft->manufacturer,
                        'type' => $ao->aircraft->type,
                        'serial_number' => $ao->aircraft->serial_number,
                        'status' => $ao->aircraft->status,
                    ] : null,
                ];
            });

        return Inertia::render('AircraftRegister/Owners/Show', [
            'owner' => $owner,
            'aircraftOwners' => $aircraftOwners,
        ]);
    }
}
