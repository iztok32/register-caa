<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->keyBy('key')->map(fn($s) => [
            'key'   => $s->key,
            'type'  => $s->type,
            'value' => match ($s->type) {
                'boolean' => (bool) filter_var($s->value, FILTER_VALIDATE_BOOLEAN),
                'json'    => json_decode($s->value ?? '[]', true) ?? [],
                default   => $s->value,
            },
            'group' => $s->group,
        ]);

        $notificationEmailOptions = User::whereHas('roles', fn($q) => $q->whereIn('slug', ['admin', 'operator']))
            ->whereNotNull('email')
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        $signaturePath = Setting::get('signature_image');
        $signatureUrl  = $signaturePath ? Storage::disk('public')->url($signaturePath) : null;

        return Inertia::render('Core/Settings/Index', [
            'settings'                 => $settings,
            'notificationEmailOptions' => $notificationEmailOptions,
            'signatureImageUrl'        => $signatureUrl,
        ]);
    }

    public function storeSignatureImage(Request $request)
    {
        $request->validate([
            'image' => ['required', 'file', 'image', 'max:4096', 'mimes:jpg,jpeg,png,webp'],
        ]);

        $old = Setting::get('signature_image');
        if ($old) {
            Storage::disk('public')->delete($old);
        }

        $path = $request->file('image')->storeAs(
            'settings',
            'signature_image.' . $request->file('image')->extension(),
            'public'
        );

        Setting::set('signature_image', $path);

        return redirect()->back()->with('success', 'Signature image uploaded.');
    }

    public function deleteSignatureImage()
    {
        $path = Setting::get('signature_image');
        if ($path) {
            Storage::disk('public')->delete($path);
            Setting::set('signature_image', '');
        }

        return redirect()->back()->with('success', 'Signature image deleted.');
    }

    public function update(Request $request, string $key)
    {
        $setting = Setting::findOrFail($key);

        $validated = $request->validate([
            'value' => 'present',
        ]);

        $value = match ($setting->type) {
            'boolean' => filter_var($validated['value'], FILTER_VALIDATE_BOOLEAN) ? '1' : '0',
            'json'    => json_encode($validated['value'] ?? []),
            default   => (string) $validated['value'],
        };

        Setting::set($key, $value);

        return redirect()->back()->with('success', 'Setting updated successfully.');
    }
}
