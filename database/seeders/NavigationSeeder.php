<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NavigationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Teams
        \App\Models\NavigationItem::create([
            'type' => 'team',
            'title_key' => 'Acme Inc',
            'icon' => 'GalleryVerticalEnd',
            'metadata' => ['plan' => 'Enterprise'],
            'sort_order' => 1,
        ]);
        \App\Models\NavigationItem::create([
            'type' => 'team',
            'title_key' => 'Acme Corp.',
            'icon' => 'AudioWaveform',
            'metadata' => ['plan' => 'Startup'],
            'sort_order' => 2,
        ]);
        \App\Models\NavigationItem::create([
            'type' => 'team',
            'title_key' => 'Evil Corp.',
            'icon' => 'Command',
            'metadata' => ['plan' => 'Free'],
            'sort_order' => 3,
        ]);

        // Main Nav - Playground
        $playground = \App\Models\NavigationItem::create([
            'type' => 'main',
            'title_key' => 'Playground',
            'icon' => 'SquareTerminal',
            'sort_order' => 1,
        ]);
        $playground->children()->create(['title_key' => 'History', 'url' => '#', 'sort_order' => 1]);
        $playground->children()->create(['title_key' => 'Starred', 'url' => '#', 'sort_order' => 2]);
        $playground->children()->create(['title_key' => 'Settings', 'url' => '#', 'sort_order' => 3]);

        // Main Nav - Models
        $models = \App\Models\NavigationItem::create([
            'type' => 'main',
            'title_key' => 'Models',
            'icon' => 'Bot',
            'sort_order' => 2,
        ]);
        $models->children()->create(['title_key' => 'Genesis', 'url' => '#', 'sort_order' => 1]);
        $models->children()->create(['title_key' => 'Explorer', 'url' => '#', 'sort_order' => 2]);
        $models->children()->create(['title_key' => 'Quantum', 'url' => '#', 'sort_order' => 3]);

        // Main Nav - Documentation
        $docs = \App\Models\NavigationItem::create([
            'type' => 'main',
            'title_key' => 'Documentation',
            'icon' => 'BookOpen',
            'sort_order' => 3,
        ]);
        $docs->children()->create(['title_key' => 'Introduction', 'url' => '#', 'sort_order' => 1]);
        $docs->children()->create(['title_key' => 'Get Started', 'url' => '#', 'sort_order' => 2]);
        $docs->children()->create(['title_key' => 'Tutorials', 'url' => '#', 'sort_order' => 3]);
        $docs->children()->create(['title_key' => 'Changelog', 'url' => '#', 'sort_order' => 4]);

        // Main Nav - Settings
        $settings = \App\Models\NavigationItem::create([
            'type' => 'main',
            'title_key' => 'Settings',
            'icon' => 'Settings2',
            'sort_order' => 4,
        ]);
        $settings->children()->create(['title_key' => 'General', 'url' => '#', 'sort_order' => 1]);
        $settings->children()->create(['title_key' => 'Team', 'url' => '#', 'sort_order' => 2]);
        $settings->children()->create(['title_key' => 'Billing', 'url' => '#', 'sort_order' => 3]);
        $settings->children()->create(['title_key' => 'Limits', 'url' => '#', 'sort_order' => 4]);

        // Projects
        \App\Models\NavigationItem::create([
            'type' => 'project',
            'title_key' => 'Design Engineering',
            'url' => '#',
            'icon' => 'Frame',
            'sort_order' => 1,
        ]);
        \App\Models\NavigationItem::create([
            'type' => 'project',
            'title_key' => 'Sales & Marketing',
            'url' => '#',
            'icon' => 'PieChart',
            'sort_order' => 2,
        ]);
        \App\Models\NavigationItem::create([
            'type' => 'project',
            'title_key' => 'Travel',
            'url' => '#',
            'icon' => 'Map',
            'sort_order' => 3,
        ]);
    }
}
