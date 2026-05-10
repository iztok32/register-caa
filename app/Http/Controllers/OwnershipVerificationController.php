<?php

namespace App\Http\Controllers;

use App\Models\AircraftOwner;
use App\Models\Owner;
use App\Models\TaxEntry;
use App\Services\InetisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class OwnershipVerificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('OwnershipVerification/Index', [
            'applicant' => [
                'name'      => $user->doc_name ?? $user->name ?? '',
                'address'   => $user->doc_address ?? '',
                'postNum'   => $user->doc_post_num ?? '',
                'postOffice'=> $user->doc_post_office ?? '',
                'tax'       => $user->doc_tax ?? '',
                'legal'     => $user->doc_legal_basis ?? '',
            ],
        ]);
    }

    public function saveApplicant(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'      => 'required|string|max:255',
            'address'   => 'required|string|max:255',
            'postNum'   => 'required|string|max:20',
            'postOffice'=> 'required|string|max:100',
            'tax'       => 'nullable|string|max:50',
            'legal'     => 'nullable|string',
        ]);

        $request->user()->update([
            'doc_name'        => $data['name'],
            'doc_address'     => $data['address'],
            'doc_post_num'    => $data['postNum'],
            'doc_post_office' => $data['postOffice'],
            'doc_tax'         => $data['tax'] ?? null,
            'doc_legal_basis' => $data['legal'] ?? null,
        ]);

        return response()->json(['ok' => true]);
    }

    public function searchSubject(Request $request, InetisService $inetis): JsonResponse
    {
        $q = trim($request->input('q', ''));

        if (strlen($q) < 2) {
            return response()->json([]);
        }

        $term = mb_strtolower($q);
        $results = collect();

        // ── 1. Search aircraft owners (EMPIC register) ────────────────────
        $owners = Owner::where(function ($query) use ($term) {
            $query->whereRaw('LOWER(organisation_name) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(organisation_name2) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(person_last_name) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(person_first_name) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(vatin) LIKE ?', ["%{$term}%"])
                  ->orWhereRaw('LOWER(organisation_eu_vatin) LIKE ?', ["%{$term}%"]);
        })
        ->limit(10)
        ->get()
        ->map(function (Owner $o) {
            $isOrg  = (bool) $o->organisation_name;
            $street = $isOrg
                ? trim(($o->organisation_street ?? '') . ' ' . ($o->organisation_street_no ?? ''))
                : trim(($o->person_street ?? '') . ' ' . ($o->person_street_no ?? ''));

            return [
                'empic_id'            => $o->empic_id,
                'display_name'        => $o->display_name,
                'owner_type'          => $o->owner_type,
                'address'             => $street,
                'zip_code'            => $isOrg ? ($o->organisation_zip_code ?? '') : ($o->person_zip_code ?? ''),
                'city'                => $isOrg ? ($o->organisation_city ?? '')     : ($o->person_city ?? ''),
                'tax'                 => $o->vatin ?? $o->organisation_eu_vatin ?? '',
                'registration_number' => null,
                'source'              => 'register',
            ];
        });

        $results = $results->merge($owners);

        // ── 2. Search local tax_entries (AJPES import) ────────────────────
        $taxEntries = TaxEntry::search($term)
            ->limit(15)
            ->get()
            ->map(fn(TaxEntry $e) => [
                'empic_id'            => null,
                'display_name'        => $e->name,
                'owner_type'          => 'organisation',
                'address'             => $e->street ?? '',
                'zip_code'            => $e->zip_code ?? '',
                'city'                => $e->city ?? '',
                'tax'                 => $e->tax_number,
                'registration_number' => $e->registration_number,
                'source'              => 'ajpes',
            ]);

        // Merge, deduplicate by tax_number or registration_number (prefer register entries first)
        $taxMap = [];
        foreach ($results as $entry) {
            $key = $entry['tax'] ?: ('empic:' . ($entry['empic_id'] ?? uniqid()));
            $taxMap[$key] = $entry;
        }
        foreach ($taxEntries as $entry) {
            $key = $entry['tax'] ?: ('reg:' . ($entry['registration_number'] ?? uniqid()));
            if (!isset($taxMap[$key])) {
                $taxMap[$key] = $entry;
            }
        }

        // ── 3. INETIS fallback — only when local results are few ──────────
        if (count($taxMap) < 3) {
            $inetisResults = $inetis->search($q);
            foreach ($inetisResults as $r) {
                if ($r['tax_number'] && !isset($taxMap[$r['tax_number']])) {
                    $taxMap[$r['tax_number']] = [
                        'empic_id'            => null,
                        'display_name'        => $r['name'],
                        'owner_type'          => 'organisation',
                        'address'             => $r['street'] ?? '',
                        'zip_code'            => $r['zip_code'] ?? '',
                        'city'                => $r['city'] ?? '',
                        'tax'                 => $r['tax_number'],
                        'registration_number' => null,
                        'source'              => 'inetis',
                    ];
                }
            }
        }

        return response()->json(array_values(array_slice($taxMap, 0, 20)));
    }

    public function getAircraftForOwner(Request $request): JsonResponse
    {
        $empicId = $request->integer('empic_id', 0) ?: null;

        if (!$empicId) {
            return response()->json(['aircraft' => []]);
        }

        $aircraft = AircraftOwner::with('aircraft')
            ->where('owner_empic_id', $empicId)
            ->where('is_closed', false)
            ->get()
            ->map(fn($ao) => [
                'registration_mark' => $ao->aircraft?->registration_mark,
                'manufacturer'      => $ao->aircraft?->manufacturer,
                'type'              => $ao->aircraft?->type,
            ])
            ->filter(fn($a) => $a['registration_mark'] !== null)
            ->values();

        return response()->json(['aircraft' => $aircraft]);
    }

    public function sendRequest(Request $request): JsonResponse
    {
        $data = $request->validate([
            'applicant'          => 'required|array',
            'applicant.name'     => 'required|string',
            'applicant.address'  => 'required|string',
            'subject'            => 'required|array',
            'subject.display_name' => 'required|string',
            'aircraft'           => 'required|array',
        ]);

        $applicant = $data['applicant'];
        $subject   = $data['subject'];
        $aircraft  = $data['aircraft'];

        try {
            $html = view('emails.ownership_request', compact('applicant', 'subject', 'aircraft'))->render();

            Mail::html($html, function ($mail) {
                $mail->to(config('mail.caa_request_to', 'breda.marinsek@caa.si'))
                     ->subject('Zahtevek za poizvedbo o lastniku zrakoplova');
            });

            return response()->json(['ok' => true]);
        } catch (\Exception $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function printDocument(Request $request)
    {
        $applicant = json_decode($request->input('applicant', '{}'), true) ?? [];
        $subject   = json_decode($request->input('subject', '{}'), true) ?? [];
        $date      = now()->format('d.m.Y');
        $refNum    = 'eCAA-' . now()->format('Y') . '-' . strtoupper(substr(md5($request->user()->id . now()->timestamp), 0, 6));

        return view('ownership_verification.document', compact('applicant', 'subject', 'date', 'refNum'));
    }
}
