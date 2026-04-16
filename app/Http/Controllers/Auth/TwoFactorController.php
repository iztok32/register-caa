<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    /**
     * Show the 2FA setup page (for users who are required to set up 2FA).
     */
    public function setupRequired(Request $request): \Inertia\Response|RedirectResponse
    {
        $user = $request->user();

        if (!$user->two_factor_required) {
            return redirect()->route('dashboard');
        }

        if ($user->hasEnabledTwoFactor()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/TwoFactorSetupRequired', [
            'hasSecret' => !is_null($user->two_factor_secret),
        ]);
    }

    /**
     * Enable two-factor authentication (generate secret + recovery codes).
     */
    public function enable(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasEnabledTwoFactor()) {
            return back();
        }

        $google2fa = new Google2FA();
        $secret = $google2fa->generateSecretKey();

        $user->two_factor_secret = encrypt($secret);
        $user->two_factor_recovery_codes = encrypt(json_encode($this->generateRecoveryCodes()));
        $user->two_factor_confirmed_at = null;
        $user->save();

        return back()->with('status', 'two-factor-enabled');
    }

    /**
     * Confirm two-factor authentication setup by verifying the TOTP code.
     */
    public function confirm(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!$user->two_factor_secret) {
            return back()->withErrors(['code' => 'Please enable two-factor authentication first.']);
        }

        $google2fa = new Google2FA();
        $valid = $google2fa->verifyKey(
            $user->twoFactorSecretKey(),
            str_replace(' ', '', $request->code),
            2
        );

        if (!$valid) {
            return back()->withErrors(['code' => __('The provided two-factor authentication code was invalid.')]);
        }

        $user->two_factor_confirmed_at = now();
        $user->save();

        // Mark session as 2FA confirmed after setup
        $request->session()->put('auth.two_factor_confirmed', true);

        return back()->with('status', 'two-factor-confirmed');
    }

    /**
     * Disable two-factor authentication.
     */
    public function disable(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        $user->two_factor_secret = null;
        $user->two_factor_recovery_codes = null;
        $user->two_factor_confirmed_at = null;
        $user->save();

        return back()->with('status', 'two-factor-disabled');
    }

    /**
     * Get the QR code SVG for the current user's two-factor secret.
     */
    public function qrCode(Request $request): Response
    {
        $user = $request->user();

        if (!$user->two_factor_secret) {
            abort(404);
        }

        $google2fa = new Google2FA();
        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $user->twoFactorSecretKey()
        );

        $renderer = new ImageRenderer(
            new RendererStyle(200),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);
        $svg = $writer->writeString($qrCodeUrl);

        return response($svg, 200)->header('Content-Type', 'image/svg+xml');
    }

    /**
     * Get the two-factor secret key for the current user.
     */
    public function secretKey(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->two_factor_secret) {
            abort(404);
        }

        return response()->json([
            'secret_key' => $user->twoFactorSecretKey(),
        ]);
    }

    /**
     * Get the recovery codes for the current user.
     */
    public function recoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'recovery_codes' => $user->twoFactorRecoveryCodes(),
        ]);
    }

    /**
     * Regenerate the recovery codes for the current user.
     */
    public function regenerateRecoveryCodes(Request $request): RedirectResponse
    {
        $user = $request->user();

        $user->two_factor_recovery_codes = encrypt(json_encode($this->generateRecoveryCodes()));
        $user->save();

        return back()->with('status', 'recovery-codes-regenerated');
    }

    /**
     * Generate a fresh set of recovery codes.
     */
    protected function generateRecoveryCodes(): array
    {
        return Collection::times(8, function () {
            return Str::random(5) . '-' . Str::random(5) . '-' . Str::random(5);
        })->all();
    }
}
