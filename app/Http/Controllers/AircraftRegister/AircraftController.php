<?php

namespace App\Http\Controllers\AircraftRegister;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\AircraftSearchIndex;

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
            'filters' => ['search' => $search]
        ]);
    }
}
