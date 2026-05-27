<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();

        // Store previous login time in session before updating
        $request->session()->put('auth.previous_login_at', $user->last_login_at);
        $user->last_login_at = now();
        $user->saveQuietly();

        // If 2FA is required (per-user or globally) but not set up → redirect to forced setup
        $twoFactorRequired = $user->two_factor_required || Setting::getBool('two_factor_required_global');
        if ($twoFactorRequired && !$user->hasEnabledTwoFactor()) {
            return redirect()->route('two-factor.setup');
        }

        // If user has 2FA enabled → redirect to challenge
        if ($user->hasEnabledTwoFactor()) {
            return redirect()->route('two-factor.challenge');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
