<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Setting;
use App\Models\TwoFactorResetRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class TwoFactorResetRequestController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'message' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();

        // Prevent duplicate pending requests
        $existing = TwoFactorResetRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return back()->with('reset_requested', true);
        }

        $resetRequest = TwoFactorResetRequest::create([
            'user_id' => $user->id,
            'message' => $request->message,
            'status'  => 'pending',
        ]);

        $this->notifyOperators($user, $resetRequest->message);

        return back()->with('reset_requested', true);
    }

    private function notifyOperators(User $user, ?string $message): void
    {
        $notificationEmails = json_decode(Setting::get('notification_emails', '[]'), true) ?? [];

        if (empty($notificationEmails)) {
            return;
        }

        $subject   = 'Zahtevek za ponastavitev 2FA — ' . $user->name;
        $portalUrl = config('app.url') . '/users';

        // Portal + email notifications for each operator
        $operators = User::whereIn('email', $notificationEmails)->get();

        foreach ($operators as $operator) {
            // In-app portal notification
            Notification::create([
                'sender_id'    => null,
                'recipient_id' => $operator->id,
                'type'         => 'portal',
                'subject'      => $subject,
                'message'      => "Uporabnik {$user->name} ({$user->email}) je zahteval ponastavitev dvostopenjske avtentikacije. Zahtevek je na čakanju v upravljanju z uporabniki.",
                'status'       => 'sent',
                'sent_at'      => now(),
            ]);

            // Email notification
            try {
                Mail::view('emails.two_factor_reset_request', [
                    'user'      => $user,
                    'message'   => $message,
                    'portalUrl' => $portalUrl,
                ], function ($mail) use ($operator, $subject) {
                    $mail->to($operator->email, $operator->name)
                         ->subject($subject);
                });

                Notification::create([
                    'sender_id'       => null,
                    'recipient_id'    => $operator->id,
                    'recipient_email' => $operator->email,
                    'type'            => 'email',
                    'subject'         => $subject,
                    'message'         => "Zahtevek za ponastavitev 2FA za uporabnika {$user->name}.",
                    'status'          => 'sent',
                    'sent_at'         => now(),
                ]);
            } catch (\Exception $e) {
                Notification::create([
                    'sender_id'       => null,
                    'recipient_id'    => $operator->id,
                    'recipient_email' => $operator->email,
                    'type'            => 'email',
                    'subject'         => $subject,
                    'message'         => "Zahtevek za ponastavitev 2FA za uporabnika {$user->name}.",
                    'status'          => 'failed',
                    'error_message'   => $e->getMessage(),
                ]);
            }
        }
    }
}
