<?php

namespace App\Http\Middleware;

use App\Models\NavigationItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'locale' => app()->getLocale(),
            'availableLocales' => config('app.available_locales'),
            'navigation' => [
                'main' => NavigationItem::where('type', 'main')->whereNull('parent_id')->where('is_active', true)->with(['children' => function($query) {
                    $query->where('is_active', true)->orderBy('sort_order');
                }])->orderBy('sort_order')->get(),
                'teams' => NavigationItem::where('type', 'team')->where('is_active', true)->orderBy('sort_order')->get(),
                'projects' => NavigationItem::where('type', 'project')->where('is_active', true)->orderBy('sort_order')->get(),
            ],
            'translations' => array_merge(
                is_file(base_path("lang/".app()->getLocale().".json")) 
                    ? json_decode(file_get_contents(base_path("lang/".app()->getLocale().".json")), true) 
                    : [],
                // Add PHP-based translations if needed, but here we focus on JSON for React
            ),
        ];
    }
}
