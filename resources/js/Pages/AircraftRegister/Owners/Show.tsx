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
    Building2, User, ArrowLeft, Plane, CalendarDays, ShieldCheck, Wrench,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Owner {
    id: number;
    empic_id: number;
    person_last_name: string | null;
    person_first_name: string | null;
    person_trade_register_no: string | null;
    person_street: string | null;
    person_street_no: string | null;
    person_city: string | null;
    person_zip_code: string | null;
    person_country: string | null;
    person_address: string | null;
    organisation_name: string | null;
    organisation_name2: string | null;
    organisation_trade_register_no: string | null;
    organisation_eu_vatin: string | null;
    organisation_street: string | null;
    organisation_street_no: string | null;
    organisation_city: string | null;
    organisation_zip_code: string | null;
    organisation_country: string | null;
    organisation_address: string | null;
    vatin: string | null;
}

interface AircraftOwnerEntry {
    id: number;
    role: string | null;
    is_closed: boolean;
    effective_start: string | null;
    end_date: string | null;
    ownership_percentage: string | null;
    aircraft: {
        empic_id: number;
        registration_mark: string | null;
        manufacturer: string | null;
        type: string | null;
        serial_number: string | null;
        status: string | null;
    } | null;
}

interface Props extends PageProps {
    owner: Owner;
    aircraftOwners: AircraftOwnerEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ownerName(owner: Owner): string {
    if (owner.organisation_name) {
        return owner.organisation_name2
            ? `${owner.organisation_name} / ${owner.organisation_name2}`
            : owner.organisation_name;
    }
    return [owner.person_last_name, owner.person_first_name].filter(Boolean).join(' ') || `EMPIC #${owner.empic_id}`;
}

function ownerType(owner: Owner): 'organisation' | 'person' {
    return owner.organisation_name ? 'organisation' : 'person';
}

function formatDate(d: string | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' });
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-border last:border-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Show({ owner, aircraftOwners }: Props) {
    const { t } = useTranslation();
    const isOrganisation = ownerType(owner) === 'organisation';

    const activeEntries = aircraftOwners.filter(ao => !ao.is_closed);
    const closedEntries = aircraftOwners.filter(ao => ao.is_closed);

    return (
        <AuthenticatedLayout>
            <Head title={ownerName(owner)} />

            <div className="flex flex-col gap-5 p-4 pt-0">

                <div>
                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.get(route('owners.index'))}>
                        <ArrowLeft className="h-4 w-4" />
                        {t('Back to list')}
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

                    {/* ── Owner details ──────────────────────────────────── */}
                    <div className="lg:col-span-1 rounded-xl border bg-card p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                {isOrganisation ? <Building2 className="h-6 w-6" /> : <User className="h-6 w-6" />}
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg leading-tight">{ownerName(owner)}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={isOrganisation ? 'secondary' : 'outline'} className="text-xs gap-1">
                                        {isOrganisation ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                        {isOrganisation ? t('Organisation') : t('Person')}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-mono">#{owner.empic_id}</span>
                                </div>
                            </div>
                        </div>

                        <dl className="space-y-0.5">
                            {isOrganisation ? (
                                <>
                                    <InfoRow label={t('Trade Register No.')} value={owner.organisation_trade_register_no} />
                                    <InfoRow label="EU VAT IN" value={owner.organisation_eu_vatin} />
                                    <InfoRow label={t('Address')} value={
                                        owner.organisation_address ||
                                        [owner.organisation_street, owner.organisation_street_no].filter(Boolean).join(' ')
                                    } />
                                    <InfoRow label={t('City')} value={[owner.organisation_zip_code, owner.organisation_city].filter(Boolean).join(' ')} />
                                    <InfoRow label={t('Country')} value={owner.organisation_country} />
                                </>
                            ) : (
                                <>
                                    <InfoRow label={t('Trade Register No.')} value={owner.person_trade_register_no} />
                                    <InfoRow label={t('Address')} value={
                                        owner.person_address ||
                                        [owner.person_street, owner.person_street_no].filter(Boolean).join(' ')
                                    } />
                                    <InfoRow label={t('City')} value={[owner.person_zip_code, owner.person_city].filter(Boolean).join(' ')} />
                                    <InfoRow label={t('Country')} value={owner.person_country} />
                                </>
                            )}
                            <InfoRow label="VAT" value={owner.vatin} />
                        </dl>
                    </div>

                    {/* ── Aircraft list ──────────────────────────────────── */}
                    <div className="lg:col-span-2 flex flex-col gap-5">

                        {/* Active */}
                        <div className="rounded-xl border bg-card">
                            <div className="px-5 py-4 border-b flex items-center gap-2">
                                <Plane className="h-4 w-4 text-primary" />
                                <h3 className="font-semibold">{t('Active aircraft')}</h3>
                                {activeEntries.length > 0 && <Badge className="ml-1">{activeEntries.length}</Badge>}
                            </div>

                            {activeEntries.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">{t('No active aircraft.')}</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="font-semibold">{t('Registration')}</TableHead>
                                            <TableHead className="font-semibold">{t('Manufacturer & Type')}</TableHead>
                                            <TableHead className="font-semibold">{t('Role')}</TableHead>
                                            <TableHead className="font-semibold">{t('Since')}</TableHead>
                                            <TableHead className="font-semibold text-right">%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeEntries.map((ao) => (
                                            <TableRow
                                                key={ao.id}
                                                className="hover:bg-muted/30 cursor-pointer"
                                                onClick={() => ao.aircraft && router.get(route('aircraft.show', { empicId: ao.aircraft.empic_id }))}
                                            >
                                                <TableCell>
                                                    <div>
                                                        <div className="font-semibold text-primary">{ao.aircraft?.registration_mark || '—'}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{ao.aircraft?.serial_number}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{ao.aircraft?.manufacturer}</div>
                                                    <div className="text-xs text-muted-foreground">{ao.aircraft?.type}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <RoleIcon role={ao.role} />
                                                        <span className="text-sm">{ao.role ?? '—'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        {formatDate(ao.effective_start)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {ao.ownership_percentage ? `${ao.ownership_percentage}%` : '—'}
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
                                    <h3 className="font-semibold">{t('Historical aircraft')}</h3>
                                    <Badge variant="outline" className="ml-1">{closedEntries.length}</Badge>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30">
                                            <TableHead className="font-semibold">{t('Registration')}</TableHead>
                                            <TableHead className="font-semibold">{t('Manufacturer & Type')}</TableHead>
                                            <TableHead className="font-semibold">{t('Role')}</TableHead>
                                            <TableHead className="font-semibold">{t('Period')}</TableHead>
                                            <TableHead className="font-semibold text-right">%</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {closedEntries.map((ao) => (
                                            <TableRow
                                                key={ao.id}
                                                className="opacity-60 hover:opacity-100 hover:bg-muted/30 cursor-pointer transition-opacity"
                                                onClick={() => ao.aircraft && router.get(route('aircraft.show', { empicId: ao.aircraft.empic_id }))}
                                            >
                                                <TableCell>
                                                    <div>
                                                        <div className="font-semibold">{ao.aircraft?.registration_mark || '—'}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">{ao.aircraft?.serial_number}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{ao.aircraft?.manufacturer}</div>
                                                    <div className="text-xs text-muted-foreground">{ao.aircraft?.type}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <RoleIcon role={ao.role} />
                                                        <span className="text-sm">{ao.role ?? '—'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {formatDate(ao.effective_start)} – {formatDate(ao.end_date)}
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-muted-foreground">
                                                    {ao.ownership_percentage ? `${ao.ownership_percentage}%` : '—'}
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
