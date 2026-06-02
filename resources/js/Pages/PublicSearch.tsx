import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import LanguageSwitcher from '@/Components/LanguageSwitcher';
import ThemeToggle from '@/Components/ThemeToggle';
import { useState, useEffect } from 'react';
import {
    Plane, ChevronRight, ClipboardList, Search,
    TrendingUp, ShieldCheck, User, Building2,
} from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AircraftResult {
    empic_id: number;
    registration_mark: string | null;
    manufacturer: string | null;
    type: string | null;
    serial_number: string | null;
    status: string | null;
}

interface Stats {
    aircraft_total: number;
    aircraft_registered: number;
    owners_persons: number;
    owners_organisations: number;
}

interface Props extends PageProps {
    canLogin: boolean;
    canRegister: boolean;
    stats: Stats;
    search: string;
    searchResults: AircraftResult[] | null;
    rateLimited: boolean;
    minChars: number;
}

// ─── StatTile ─────────────────────────────────────────────────────────────────

function StatTile({ icon: Icon, label, value, sub }: {
    icon: React.ElementType;
    label: string;
    value: number;
    sub?: string;
}) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{label}</p>
                <p className="text-lg font-bold leading-tight">{value.toLocaleString()}</p>
                {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
            </div>
        </div>
    );
}

// ─── AircraftCard ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
    Registered:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Deregistered: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function AircraftCard({ aircraft }: { aircraft: AircraftResult }) {
    const statusClass = STATUS_STYLES[aircraft.status ?? ''] ?? 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground';

    return (
        <div className="group cursor-pointer rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-150 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 group-hover:bg-primary/5 transition-colors">
                <span className="text-lg font-bold tracking-wide text-primary">
                    {aircraft.registration_mark ?? '—'}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}>
                    {aircraft.status ?? 'Unknown'}
                </span>
            </div>
            <div className="px-4 py-3 space-y-3">
                <div className="flex items-start gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{aircraft.manufacturer ?? '—'}</p>
                        <p className="text-xs text-muted-foreground truncate">{aircraft.type ?? '—'}</p>
                    </div>
                </div>
                {aircraft.serial_number && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-medium">S/N</span>
                        <span className="font-mono">{aircraft.serial_number}</span>
                    </p>
                )}
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PublicSearch({ auth, canLogin, canRegister, stats, search: initialSearch, searchResults, rateLimited, minChars }: Props) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(initialSearch ?? '');

    useEffect(() => {
        const id = setTimeout(() => {
            if (searchTerm !== initialSearch) {
                router.get(
                    route('home'),
                    { search: searchTerm || undefined },
                    { preserveState: true, preserveScroll: true, replace: true, only: ['searchResults', 'search', 'rateLimited'] }
                );
            }
        }, 400);
        return () => clearTimeout(id);
    }, [searchTerm]);

    const searched = searchTerm.trim().length >= minChars;
    const hasResults = searchResults !== null && searchResults.length > 0;

    return (
        <>
            <Head title="Register CAA – Civilna Letalska Agencija" />
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">

                {/* Top utility bar */}
                <div className="bg-[#003d7d] text-white text-xs">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-8">
                            <span className="opacity-75">Republika Slovenija – Civilna Letalska Agencija</span>
                            <div className="flex items-center gap-2">
                                <LanguageSwitcher />
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main header */}
                <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-20">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/images/header-logo.png"
                                    alt="Civilna Letalska Agencija"
                                    className="h-12 w-auto object-contain"
                                />
                            </div>
                            <nav className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium text-white bg-[#003d7d] hover:bg-[#002d5e] transition-colors"
                                    >
                                        <ClipboardList className="h-4 w-4" />
                                        {t('Dashboard')}
                                    </Link>
                                ) : (
                                    <>
                                        {canLogin && (
                                            <Link
                                                href={route('login')}
                                                className="px-4 py-2 rounded text-sm font-medium text-[#003d7d] dark:text-blue-400 border border-[#003d7d] dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 transition-colors"
                                            >
                                                {t('Log in')}
                                            </Link>
                                        )}
                                        {canRegister && (
                                            <Link
                                                href={route('register')}
                                                className="px-4 py-2 rounded text-sm font-medium text-white bg-[#003d7d] hover:bg-[#002d5e] transition-colors"
                                            >
                                                {t('Register')}
                                            </Link>
                                        )}
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 bg-background">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                            {/* ── Search panel (2/3) ─────────────────────── */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Search className="h-4 w-4 text-primary" />
                                            {t('Aircraft Register Search')}
                                        </CardTitle>
                                        <div className="relative mt-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                                            <Input
                                                autoFocus
                                                className="pl-9 h-11 text-base"
                                                placeholder={t('Search by registration mark, manufacturer, type...')}
                                                value={searchTerm}
                                                onChange={e => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Empty state */}
                                        {!searched && !rateLimited && (
                                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                                    <Plane className="h-7 w-7 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{t('Search the public aircraft register')}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                                        {t('Enter at least :n characters to search').replace(':n', String(minChars))}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Rate limited */}
                                        {rateLimited && (
                                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                                    <ShieldCheck className="h-7 w-7 text-orange-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{t('Too many searches')}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                                        {t('You have exceeded the search limit. Please wait a moment before searching again.')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* No results */}
                                        {searched && !rateLimited && !hasResults && (
                                            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                                <p className="text-sm text-muted-foreground">
                                                    {t('No aircraft found for')} &ldquo;<strong>{searchTerm}</strong>&rdquo;
                                                </p>
                                            </div>
                                        )}

                                        {/* Results grid */}
                                        {hasResults && !rateLimited && (
                                            <div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {(searchResults as AircraftResult[]).map(a => (
                                                        <AircraftCard key={a.empic_id} aircraft={a} />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground text-center mt-4">
                                                    {t('Showing :n results.').replace(':n', String(searchResults!.length))}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* ── Stats panel (1/3) ──────────────────────── */}
                            <div className="flex flex-col gap-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                            {t('Portal Statistics')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                            {t('Aircraft Register')}
                                        </p>
                                        <StatTile icon={Plane} label={t('Total aircraft')} value={stats.aircraft_total} />
                                        <StatTile
                                            icon={ShieldCheck}
                                            label={t('Registered')}
                                            value={stats.aircraft_registered}
                                            sub={stats.aircraft_total > 0
                                                ? `${Math.round(stats.aircraft_registered / stats.aircraft_total * 100)}%`
                                                : undefined}
                                        />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">
                                            {t('Owners & Operators')}
                                        </p>
                                        <StatTile icon={User} label={t('Persons')} value={stats.owners_persons} />
                                        <StatTile icon={Building2} label={t('Organisations')} value={stats.owners_organisations} />
                                    </CardContent>
                                </Card>
                            </div>

                        </div>
                    </div>
                </main>

                {/* Footer */}
                <footer className="bg-[#002d5e] text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <img
                                        src="/images/header-logo.png"
                                        alt="Civilna Letalska Agencija"
                                        className="h-8 w-auto object-contain"
                                    />
                                </div>
                                <p className="text-blue-200 text-xs leading-relaxed">
                                    Uradna elektronska evidenca Civilne Letalske Agencije Republike Slovenije.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-3">Kontakt</h4>
                                <ul className="space-y-1 text-sm text-blue-100">
                                    <li>Civilna Letalska Agencija</li>
                                    <li>Kotnikova ulica 19a</li>
                                    <li>1000 Ljubljana, Slovenija</li>
                                    <li className="pt-1 text-blue-300 text-xs">info@caa.si</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-3">Povezave</h4>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <a href="https://www.caa.si" target="_blank" rel="noopener noreferrer"
                                            className="text-blue-100 hover:text-white transition-colors inline-flex items-center gap-1">
                                            Spletna stran CAA <ChevronRight className="h-3 w-3" />
                                        </a>
                                    </li>
                                    <li>
                                        <a href="https://www.easa.europa.eu" target="_blank" rel="noopener noreferrer"
                                            className="text-blue-100 hover:text-white transition-colors inline-flex items-center gap-1">
                                            EASA <ChevronRight className="h-3 w-3" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-blue-300">
                            <span>© {new Date().getFullYear()} Civilna Letalska Agencija – Republika Slovenija</span>
                            <span>Vse pravice pridržane</span>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
