import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    ArrowLeft, Plane, Building2, User, CalendarDays,
    Hash, ShieldCheck, Wrench,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AircraftData {
    empic_id: number;
    registration_mark: string | null;
    manufacturer: string | null;
    type: string | null;
    serial_number: string | null;
    construction_year: number | null;
    status: string | null;
    registered_on: string | null;
    deregistered_on: string | null;
    active_mortgages: number;
}

interface OwnerEntry {
    id: number;
    role: string | null;
    is_closed: boolean;
    effective_start: string | null;
    end_date: string | null;
    ownership_percentage: string | null;
    owner: {
        empic_id: number;
        name: string;
        type: 'person' | 'organisation';
    } | null;
}

interface Props extends PageProps {
    aircraft: AircraftData;
    ownershipHistory: OwnerEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function periodLabel(start: string | null, end: string | null, isClosed: boolean): string {
    if (!isClosed) return `${formatDate(start)} – ${'\u2022'}`;
    return `${formatDate(start)} – ${formatDate(end)}`;
}

const STATUS_STYLES: Record<string, string> = {
    Registered:   'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Deregistered: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function RoleIcon({ role }: { role: string | null }) {
    const r = (role ?? '').toLowerCase();
    if (r.includes('operator')) return <Wrench className="h-3.5 w-3.5 text-violet-500" />;
    return <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />;
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
    if (value == null || value === '') return null;
    return (
        <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-border last:border-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{String(value)}</dd>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Show({ aircraft, ownershipHistory }: Props) {
    const { t } = useTranslation();

    const activeEntries = ownershipHistory.filter(e => !e.is_closed);
    const closedEntries = ownershipHistory.filter(e => e.is_closed);
    const statusClass = STATUS_STYLES[aircraft.status ?? ''] ?? 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground';

    return (
        <AuthenticatedLayout>
            <Head title={aircraft.registration_mark ?? `EMPIC ${aircraft.empic_id}`} />

            <div className="flex flex-col gap-5 p-4 pt-0">

                <div>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.get(route('aircraft.index'))}>
                        <ArrowLeft className="h-4 w-4" />
                        {t('Back to list')}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* ── Aircraft info ──────────────────────────────────── */}
                    <div className="lg:col-span-1 rounded-xl border bg-card p-5">

                        {/* Header */}
                        <div className="flex items-start gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                <Plane className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-2xl font-bold tracking-wide text-primary leading-tight">
                                    {aircraft.registration_mark ?? '—'}
                                </h2>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusClass}`}>
                                        {aircraft.status ?? t('Unknown')}
                                    </span>
                                    {aircraft.active_mortgages > 0 && (
                                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                            {aircraft.active_mortgages}× {t('mortgage')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <dl className="space-y-0.5">
                            <InfoRow label={t('Manufacturer')} value={aircraft.manufacturer} />
                            <InfoRow label={t('Type')} value={aircraft.type} />
                            <InfoRow label={t('Serial No.')} value={aircraft.serial_number} />
                            <InfoRow label={t('Construction year')} value={aircraft.construction_year} />
                            <InfoRow label={t('Registered on')} value={formatDate(aircraft.registered_on)} />
                            {aircraft.deregistered_on && (
                                <InfoRow label={t('Deregistered on')} value={formatDate(aircraft.deregistered_on)} />
                            )}
                        </dl>

                        <div className="mt-3 pt-3 border-t flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                            <Hash className="h-3 w-3" />
                            EMPIC {aircraft.empic_id}
                        </div>
                    </div>

                    {/* ── Ownership history ──────────────────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Active */}
                        <div className="rounded-xl border bg-card">
                            <div className="px-5 py-4 border-b flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">{t('Active owners & operators')}</h3>
                                {activeEntries.length > 0 && (
                                    <Badge className="ml-1">{activeEntries.length}</Badge>
                                )}
                            </div>

                            {activeEntries.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    {t('No active owners or operators recorded.')}
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="font-semibold">{t('Name')}</TableHead>
                                            <TableHead className="font-semibold">{t('Role')}</TableHead>
                                            <TableHead className="font-semibold">{t('Since')}</TableHead>
                                            <TableHead className="font-semibold text-right">%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeEntries.map((e) => (
                                            <TableRow
                                                key={e.id}
                                                className="hover:bg-muted/30 cursor-pointer"
                                                onClick={() => e.owner && router.get(route('owners.show', { empicId: e.owner.empic_id }))}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {e.owner?.type === 'organisation'
                                                            ? <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                            : <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                        }
                                                        <span className="font-medium">{e.owner?.name ?? '—'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <RoleIcon role={e.role} />
                                                        <span className="text-sm">{e.role ?? '—'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {formatDate(e.effective_start)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {e.ownership_percentage ? `${e.ownership_percentage}%` : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>

                        {/* Historical */}
                        {closedEntries.length > 0 && (
                            <div className="rounded-xl border bg-card">
                                <div className="px-5 py-4 border-b flex items-center gap-2 text-muted-foreground">
                                    <CalendarDays className="h-4 w-4" />
                                    <h3 className="font-semibold">{t('Historical owners & operators')}</h3>
                                    <Badge variant="outline" className="ml-1">{closedEntries.length}</Badge>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="font-semibold">{t('Name')}</TableHead>
                                            <TableHead className="font-semibold">{t('Role')}</TableHead>
                                            <TableHead className="font-semibold">{t('Period')}</TableHead>
                                            <TableHead className="font-semibold text-right">%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {closedEntries.map((e) => (
                                            <TableRow
                                                key={e.id}
                                                className="opacity-60 hover:opacity-100 hover:bg-muted/30 cursor-pointer transition-opacity"
                                                onClick={() => e.owner && router.get(route('owners.show', { empicId: e.owner.empic_id }))}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {e.owner?.type === 'organisation'
                                                            ? <Building2 className="h-3.5 w-3.5 shrink-0" />
                                                            : <User className="h-3.5 w-3.5 shrink-0" />
                                                        }
                                                        <span className="font-medium">{e.owner?.name ?? '—'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <RoleIcon role={e.role} />
                                                        <span className="text-sm">{e.role ?? '—'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {formatDate(e.effective_start)} – {formatDate(e.end_date)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm">
                                                    {e.ownership_percentage ? `${e.ownership_percentage}%` : '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
