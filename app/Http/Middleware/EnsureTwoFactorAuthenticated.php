<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTwoFactorAuthenticated
{
    /**
     * Routes that are allowed through without completing 2FA challenge.
     */
    protected array $except = [
        'two-factor.challenge',
        'two-factor.setup',
        'two-factor.setup.enable',
        'two-factor.setup.disable',
        'two-factor.setup.confirm',
        'two-factor.setup.qr-code',
        'two-factor.setup.secret-key',
        'two-factor.setup.recovery-codes',
        'two-factor.setup.recovery-codes.regenerate',
        'logout',
        'password.confirm',
        'verification.notice',
        'verification.verify',
        'verification.send',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // Allow excluded routes through
        if ($request->routeIs(...$this->except)) {
            return $next($request);
        }

        // If user requires 2FA but has not set it up yet → force setup
        if ($user->two_factor_required && !$user->hasEnabledTwoFactor()) {
            return redirect()->route('two-factor.setup');
        }

        // If user has 2FA enabled but has not passed the challenge this session → challenge
        if ($user->hasEnabledTwoFactor() && !$request->session()->get('auth.two_factor_confirmed')) {
            return redirect()->route('two-factor.challenge');
        }

        return $next($request);
    }
}
