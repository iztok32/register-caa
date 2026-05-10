import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Search, Bell, Clock, Plane, Building2, User,
    Users, ShieldCheck, TrendingUp, FileText, Hash,
    CalendarDays, Wrench,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OwnerEntry {
    role: string;
    is_closed: boolean;
    name: string;
    type: string; // 'person' | 'organisation'
    effective_start: string | null;
    end_date: string | null;
    ownership_percentage: string | null;
    owner_empic_id: number | null;
}

interface AircraftResult {
    empic_id: number;
    registration_mark: string | null;
    manufacturer: string | null;
    type: string | null;
    serial_number: string | null;
    status: string | null;
    current_owners: OwnerEntry[] | null;
}

interface Stats {
    aircraft_total: number;
    aircraft_registered: number;
    owners_total: number;
    owners_persons: number;
    owners_organisations: number;
    active_registrations: number;
}

interface Props extends PageProps {
    stats: Stats;
    search: string;
    searchResults: AircraftResult[] | null;
    previousLoginAt: string | null;
    canViewOwnership: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

const STATUS_STYLES: Record<string, string> = {
    Registered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Deregistered: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Aircraft card ────────────────────────────────────────────────────────────

function AircraftCard({ aircraft, canViewOwnership }: {
    aircraft: AircraftResult;
    canViewOwnership: boolean;
}) {
    const activeOwners = (aircraft.current_owners ?? []).filter(o => !o.is_closed);
    const owners    = activeOwners.filter(o => o.role?.toLowerCase().includes('owner'));
    const operators = activeOwners.filter(o => o.role?.toLowerCase().includes('operator'));
    const others    = activeOwners.filter(o =>
        !o.role?.toLowerCase().includes('owner') && !o.role?.toLowerCase().includes('operator')
    );

    const statusClass = STATUS_STYLES[aircraft.status ?? ''] ?? 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground';

    return (
        <div
            onClick={() => router.get(route('aircraft.show', { empicId: aircraft.empic_id }))}
            className="group cursor-pointer rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-150 overflow-hidden"
        >
            {/* Header strip */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 group-hover:bg-primary/5 transition-colors">
                <span className="text-lg font-bold tracking-wide text-primary">
                    {aircraft.registration_mark ?? '—'}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}>
                    {aircraft.status ?? 'Unknown'}
                </span>
            </div>

            {/* Body */}
            <div className="px-4 py-3 space-y-3">
                {/* Manufacturer / Type */}
                <div className="flex items-start gap-2">
                    <Plane className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight truncate">{aircraft.manufacturer ?? '—'}</p>
                        <p className="text-xs text-muted-foreground truncate">{aircraft.type ?? '—'}</p>
                    </div>
                </div>

                {/* Serial + EMPIC */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {aircraft.serial_number && (
                        <span className="flex items-center gap-1 font-mono">
                            <Hash className="h-3 w-3" />
                            {aircraft.serial_number}
                        </span>
                    )}
                    <span className="flex items-center gap-1 font-mono ml-auto opacity-60">
                        EMPIC {aircraft.empic_id}
                    </span>
                </div>

                {/* Owners / Operators */}
                {canViewOwnership && activeOwners.length > 0 && (
                    <div className="border-t pt-2.5 space-y-2">
                        {owners.map((o, i) => (
                            <OwnerRow key={i} entry={o} color="blue" />
                        ))}
                        {operators.map((o, i) => (
                            <OwnerRow key={i} entry={o} color="violet" />
                        ))}
                        {others.map((o, i) => (
                            <OwnerRow key={i} entry={o} color="gray" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const COLOR_STYLES = {
    blue:   'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300',
    gray:   'bg-muted text-muted-foreground',
};

function OwnerRow({ entry, color }: { entry: OwnerEntry; color: 'blue' | 'violet' | 'gray' }) {
    const isOperator = entry.role?.toLowerCase().includes('operator');
    const since = formatDate(entry.effective_start);
    const pct = entry.ownership_percentage ? `${entry.ownership_percentage}%` : null;

    return (
        <div className="flex items-start gap-2">
            <span className={`inline-flex items-center gap-1 text-xs shrink-0 mt-0.5 px-1.5 py-0.5 rounded-full font-medium ${COLOR_STYLES[color]}`}>
                {isOperator
                    ? <Wrench className="h-3 w-3" />
                    : entry.type === 'organisation' ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />
                }
                {entry.role}
            </span>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-tight truncate">{entry.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {since && (
                        <span className="flex items-center gap-0.5">
                            <CalendarDays className="h-3 w-3" />
                            {since}
                        </span>
                    )}
                    {pct && !isOperator && (
                        <span className="font-mono">{pct}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard({ stats, search: initialSearch, searchResults, previousLoginAt, canViewOwnership }: Props) {
    const { t } = useTranslation();
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    const unread = user?.unread_notifications_count ?? 0;

    const [searchTerm, setSearchTerm] = useState(initialSearch ?? '');

    useEffect(() => {
        const id = setTimeout(() => {
            if (searchTerm !== initialSearch) {
                router.get(
                    route('dashboard'),
                    { search: searchTerm || undefined },
                    { preserveState: true, preserveScroll: true, replace: true, only: ['searchResults', 'search'] }
                );
            }
        }, 400);
        return () => clearTimeout(id);
    }, [searchTerm]);

    const searched = searchTerm.trim().length >= 2;
    const hasResults = searchResults !== null && searchResults.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title={t('Dashboard')} />

            <div className="flex flex-col gap-5 p-4 pt-0">

                {/* ── Welcome banner ─────────────────────────────────────── */}
                <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
                    <CardContent className="py-4 px-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-xl font-bold">
                                    {t('Welcome back')}, <span className="text-primary">{user?.name}</span>!
                                </h1>
                                {previousLoginAt && (
                                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {t('Last login')}: {formatDateTime(previousLoginAt)}
                                    </span>
                                )}
                            </div>
                            {unread > 0 ? (
                                <button
                                    onClick={() => router.get(route('notifications.inbox'))}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors w-fit"
                                >
                                    <Bell className="h-4 w-4" />
                                    {unread} {t('unread notifications')}
                                </button>
                            ) : (
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Bell className="h-3.5 w-3.5" />
                                    {t('No unread notifications')}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* ── Main grid ──────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* ── Search panel (2/3) ─────────────────────────────── */}
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
                                        placeholder={t('Search by registration, manufacturer, type, serial number, owner...')}
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Empty state */}
                                {!searched && (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                            <Plane className="h-7 w-7 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{t('Search the public aircraft register')}</p>
                                            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                                                {t('Enter at least 2 characters — search by registration mark, aircraft type, manufacturer, serial number')}
                                                {canViewOwnership && ` ${t('or owner name')}`}.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* No results */}
                                {searched && !hasResults && (
                                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            {t('No aircraft found for')} &ldquo;<strong>{searchTerm}</strong>&rdquo;
                                        </p>
                                    </div>
                                )}

                                {/* Results grid */}
                                {hasResults && (
                                    <div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {(searchResults as AircraftResult[]).map(a => (
                                                <AircraftCard
                                                    key={a.empic_id}
                                                    aircraft={a}
                                                    canViewOwnership={canViewOwnership}
                                                />
                                            ))}
                                        </div>
                                        {searchResults!.length === 15 && (
                                            <p className="text-xs text-muted-foreground text-center mt-4">
                                                {t('Showing first 15 results.')}{' '}
                                                <button
                                                    className="underline hover:text-primary"
                                                    onClick={() => router.get(route('aircraft.index', { search: searchTerm }))}
                                                >
                                                    {t('View all results')}
                                                </button>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* ── Stats panel (1/3) ──────────────────────────────── */}
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
                                <StatTile icon={FileText} label={t('Active registrations')} value={stats.active_registrations} />

                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide pt-2">
                                    {t('Owners & Operators')}
                                </p>
                                <StatTile icon={Users} label={t('Total')} value={stats.owners_total} />
                                <StatTile icon={User} label={t('Persons')} value={stats.owners_persons} />
                                <StatTile icon={Building2} label={t('Organisations')} value={stats.owners_organisations} />
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
