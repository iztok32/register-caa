<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class QualificationRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user()->load('roles');

        return Inertia::render('QualificationRequest/Index', [
            'isQualified'  => $user->hasRole('qualified-user'),
            'requestedAt'  => $user->qualification_requested_at?->format('d.m.Y H:i'),
            'userEmail'    => $user->email,
            'applicant' => [
                'name'         => $user->doc_name ?? '',
                'address'      => $user->doc_address ?? '',
                'postNum'      => $user->doc_post_num ?? '',
                'postOffice'   => $user->doc_post_office ?? '',
                'tax'          => $user->doc_tax ?? '',
                'registration' => $user->doc_registration ?? '',
                'contact'      => $user->doc_contact ?? $user->name ?? '',
                'legal'        => $user->doc_legal_basis ?? '',
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'address'      => 'required|string|max:255',
            'postNum'      => 'required|string|max:20',
            'postOffice'   => 'required|string|max:100',
            'tax'          => 'nullable|string|max:50',
            'registration' => 'nullable|string|max:20',
            'contact'      => 'required|string|max:255',
            'legal'        => 'required|string',
        ]);

        $user = $request->user();

        $user->update([
            'doc_name'                  => $data['name'],
            'doc_address'               => $data['address'],
            'doc_post_num'              => $data['postNum'],
            'doc_post_office'           => $data['postOffice'],
            'doc_tax'                   => $data['tax'] ?? null,
            'doc_registration'          => $data['registration'] ?? null,
            'doc_contact'               => $data['contact'],
            'doc_legal_basis'           => $data['legal'],
            'qualification_requested_at' => now(),
        ]);

        try {
            $html = view('emails.qualification_request', [
                'user'      => $user,
                'applicant' => $data,
            ])->render();

            Mail::html($html, function ($mail) {
                $mail->to(config('mail.caa_request_to', 'breda.marinsek@caa.si'))
                     ->subject('Zahteva za kvalificiranega uporabnika');
            });
        } catch (\Exception $e) {
            Log::error('Failed to send qualification request email: ' . $e->getMessage());
        }

        return response()->json(['ok' => true]);
    }
}
