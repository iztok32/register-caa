<?php

namespace App\Http\Controllers\Core;

use App\Http\Controllers\Controller;
use App\Models\SearchLog;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SearchStatisticsController extends Controller
{
    public function index()
    {
        $today     = now()->startOfDay();
        $yesterday = now()->subDay()->startOfDay();
        $week      = now()->subDays(6)->startOfDay();
        $month     = now()->startOfMonth();

        // Summary cards
        $summary = [
            'today_total'    => SearchLog::where('created_at', '>=', $today)->count(),
            'today_blocked'  => SearchLog::where('created_at', '>=', $today)->where('is_blocked', true)->count(),
            'today_unique_ips' => SearchLog::where('created_at', '>=', $today)->distinct('ip_address')->count('ip_address'),
            'month_total'    => SearchLog::where('created_at', '>=', $month)->count(),
        ];

        // Searches per day — last 14 days
        $daily = SearchLog::select(
                DB::raw("DATE(created_at) as date"),
                DB::raw("COUNT(*) as total"),
                DB::raw("SUM(CASE WHEN is_blocked THEN 1 ELSE 0 END) as blocked")
            )
            ->where('created_at', '>=', now()->subDays(13)->startOfDay())
            ->groupBy(DB::raw("DATE(created_at)"))
            ->orderBy('date')
            ->get();

        // Top search queries (last 7 days, non-blocked)
        $topQueries = SearchLog::select('query', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $week)
            ->where('is_blocked', false)
            ->whereNotNull('query')
            ->where('query', '!=', '')
            ->groupBy('query')
            ->orderByDesc('count')
            ->limit(15)
            ->get();

        // Top IPs (last 7 days)
        $topIps = SearchLog::select(
                'ip_address',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN is_blocked THEN 1 ELSE 0 END) as blocked")
            )
            ->where('created_at', '>=', $week)
            ->groupBy('ip_address')
            ->orderByDesc('total')
            ->limit(15)
            ->get();

        // Recent searches (last 50)
        $recent = SearchLog::orderByDesc('created_at')->limit(50)->get();

        return Inertia::render('Core/SearchStatistics/Index', [
            'summary'    => $summary,
            'daily'      => $daily,
            'topQueries' => $topQueries,
            'topIps'     => $topIps,
            'recent'     => $recent,
        ]);
    }
}
