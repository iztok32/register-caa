<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthenticatedSessionController extends Controller
{
    /**
     * Show the two-factor authentication challenge view.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (!$user->hasEnabledTwoFactor()) {
            return redirect()->route('dashboard');
        }

        if ($request->session()->get('auth.two_factor_confirmed')) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/TwoFactor', [
            'recoveryMode' => false,
        ]);
    }

    /**
     * Verify the two-factor authentication code.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        // Try TOTP code first
        if ($request->filled('code')) {
            $request->validate([
                'code' => ['required', 'string'],
            ]);

            $google2fa = new Google2FA();
            $valid = $google2fa->verifyKey(
                $user->twoFactorSecretKey(),
                str_replace(' ', '', $request->code),
                2 // window of 2 time steps (60 sec tolerance)
            );

            if ($valid) {
                $request->session()->put('auth.two_factor_confirmed', true);
                return redirect()->intended(route('dashboard', absolute: false));
            }

            throw ValidationException::withMessages([
                'code' => [__('The provided two-factor authentication code was invalid.')],
            ]);
        }

        // Try recovery code
        if ($request->filled('recovery_code')) {
            $request->validate([
                'recovery_code' => ['required', 'string'],
            ]);

            $recoveryCodes = $user->twoFactorRecoveryCodes();
            $inputCode = trim($request->recovery_code);

            $index = array_search($inputCode, $recoveryCodes);

            if ($index === false) {
                throw ValidationException::withMessages([
                    'recovery_code' => [__('The provided two-factor recovery code was invalid.')],
                ]);
            }

            // Remove used recovery code
            unset($recoveryCodes[$index]);
            $user->two_factor_recovery_codes = encrypt(json_encode(array_values($recoveryCodes)));
            $user->save();

            $request->session()->put('auth.two_factor_confirmed', true);
            return redirect()->intended(route('dashboard', absolute: false));
        }

        throw ValidationException::withMessages([
            'code' => [__('Please provide a two-factor authentication code.')],
        ]);
    }
}
