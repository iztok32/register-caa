<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::all()->keyBy('key')->map(fn($s) => [
            'key'   => $s->key,
            'type'  => $s->type,
            'value' => $s->type === 'boolean' ? (bool) filter_var($s->value, FILTER_VALIDATE_BOOLEAN) : $s->value,
            'group' => $s->group,
        ]);

        return Inertia::render('Core/Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request, string $key)
    {
        $setting = Setting::findOrFail($key);

        $validated = $request->validate([
            'value' => 'required',
        ]);

        $value = $setting->type === 'boolean'
            ? ($validated['value'] ? '1' : '0')
            : (string) $validated['value'];

        Setting::set($key, $value);

        return redirect()->back()->with('success', 'Setting updated successfully.');
    }
}
