import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Building2, User, ArrowLeft, Plane, CalendarDays } from 'lucide-react';

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
    start_date: string | null;
    end_date: string | null;
    operator_since: string | null;
    owner_since: string | null;
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
    if (!value) return null;
    return (
        <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-gray-100 dark:border-border last:border-0">
            <dt className="text-sm text-gray-500 dark:text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium text-gray-900 dark:text-foreground">{value}</dd>
        </div>
    );
}

export default function Show({ owner, aircraftOwners }: Props) {
    const { t } = useTranslation();
    const isOrganisation = ownerType(owner) === 'organisation';

    const activeEntries = aircraftOwners.filter(ao => !ao.is_closed);
    const closedEntries = aircraftOwners.filter(ao => ao.is_closed);

    return (
        <AuthenticatedLayout>
            <Head title={ownerName(owner)} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Back button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => router.get(route('owners.index'))}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('Back to list')}
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Owner details card */}
                        <div className="lg:col-span-1 bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-card">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                                        {isOrganisation
                                            ? <Building2 className="h-6 w-6" />
                                            : <User className="h-6 w-6" />
                                        }
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
                                            <InfoRow label="Trade Register No." value={owner.organisation_trade_register_no} />
                                            <InfoRow label="EU VAT IN" value={owner.organisation_eu_vatin} />
                                            <InfoRow label="Address" value={owner.organisation_address ||
                                                [owner.organisation_street, owner.organisation_street_no].filter(Boolean).join(' ')} />
                                            <InfoRow label="City" value={[owner.organisation_zip_code, owner.organisation_city].filter(Boolean).join(' ')} />
                                            <InfoRow label="Country" value={owner.organisation_country} />
                                        </>
                                    ) : (
                                        <>
                                            <InfoRow label="Trade Register No." value={owner.person_trade_register_no} />
                                            <InfoRow label="Address" value={owner.person_address ||
                                                [owner.person_street, owner.person_street_no].filter(Boolean).join(' ')} />
                                            <InfoRow label="City" value={[owner.person_zip_code, owner.person_city].filter(Boolean).join(' ')} />
                                            <InfoRow label="Country" value={owner.person_country} />
                                        </>
                                    )}
                                    <InfoRow label="VAT" value={owner.vatin} />
                                </dl>
                            </div>
                        </div>

                        {/* Aircraft list */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Active aircraft */}
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-card">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Plane className="h-5 w-5 text-primary" />
                                        {t('Active Aircraft')}
                                        {activeEntries.length > 0 && (
                                            <Badge className="ml-1">{activeEntries.length}</Badge>
                                        )}
                                    </h3>

                                    {activeEntries.length === 0 ? (
                                        <p className="text-sm text-muted-foreground py-4 text-center">
                                            {t('No active aircraft.')}
                                        </p>
                                    ) : (
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50/50 dark:bg-muted/30">
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
                                                            className="hover:bg-gray-50/50 dark:hover:bg-muted/30 cursor-pointer"
                                                            onClick={() => ao.aircraft && router.get(route('aircraft.index', { search: ao.aircraft.registration_mark }))}
                                                        >
                                                            <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                                                                {ao.aircraft?.registration_mark || '—'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{ao.aircraft?.manufacturer}</div>
                                                                <div className="text-xs text-muted-foreground">{ao.aircraft?.type}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {ao.role && (
                                                                    <Badge variant="outline" className="text-xs">{ao.role}</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                <div className="flex items-center gap-1">
                                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                                    {ao.owner_since || ao.operator_since || ao.start_date || '—'}
                                                                </div>
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

                            {/* Historical aircraft */}
                            {closedEntries.length > 0 && (
                                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg dark:bg-card">
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
                                            <Plane className="h-5 w-5" />
                                            {t('Historical Aircraft')}
                                            <Badge variant="outline" className="ml-1">{closedEntries.length}</Badge>
                                        </h3>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-gray-50/50 dark:bg-muted/30">
                                                        <TableHead className="font-semibold">{t('Registration')}</TableHead>
                                                        <TableHead className="font-semibold">{t('Manufacturer & Type')}</TableHead>
                                                        <TableHead className="font-semibold">{t('Role')}</TableHead>
                                                        <TableHead className="font-semibold">{t('Period')}</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {closedEntries.map((ao) => (
                                                        <TableRow key={ao.id} className="opacity-60">
                                                            <TableCell className="font-medium">
                                                                {ao.aircraft?.registration_mark || '—'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium">{ao.aircraft?.manufacturer}</div>
                                                                <div className="text-xs text-muted-foreground">{ao.aircraft?.type}</div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {ao.role && (
                                                                    <Badge variant="outline" className="text-xs">{ao.role}</Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {ao.start_date || ao.owner_since} – {ao.end_date || '—'}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
