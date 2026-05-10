import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Search, Plane } from 'lucide-react';

interface OwnerData {
    role: string;
    is_closed: boolean;
    name: string;
    type: string;
}

interface Aircraft {
    id: number;
    empic_id: number;
    registration_mark: string | null;
    manufacturer: string | null;
    type: string | null;
    serial_number: string | null;
    status: string | null;
    current_owners: OwnerData[] | null;
}

interface Props extends PageProps {
    aircrafts: {
        data: Aircraft[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: { search: string };
}

const STATUS_STYLES: Record<string, string> = {
    Registered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    Deregistered: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function Index({ aircrafts, filters }: Props) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    useEffect(() => {
        const id = setTimeout(() => {
            if (searchTerm !== filters.search) {
                router.get(route('aircraft.index'), { search: searchTerm }, {
                    preserveState: true, preserveScroll: true, replace: true,
                });
            }
        }, 500);
        return () => clearTimeout(id);
    }, [searchTerm, filters.search]);

    return (
        <AuthenticatedLayout>
            <Head title={t('Aircraft Register')} />

            <div className="flex flex-col gap-4 p-4 pt-0">

                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Plane className="h-5 w-5 text-primary" />
                        {t('Aircraft Register')}
                    </h2>
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            autoFocus
                            className="pl-9"
                            placeholder={t('Search by registration, type, owner...')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="font-semibold">{t('Registration')}</TableHead>
                                <TableHead className="font-semibold">{t('Manufacturer & Type')}</TableHead>
                                <TableHead className="font-semibold">{t('Serial No.')}</TableHead>
                                <TableHead className="font-semibold">{t('Status')}</TableHead>
                                <TableHead className="font-semibold">{t('Owners / Operators')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {aircrafts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        {t('No aircraft found.')}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                aircrafts.data.map((aircraft) => (
                                    <TableRow
                                        key={aircraft.id}
                                        className="hover:bg-muted/30 cursor-pointer"
                                        onClick={() => router.get(route('aircraft.show', { empicId: aircraft.empic_id }))}
                                    >
                                        <TableCell className="font-semibold text-primary">
                                            {aircraft.registration_mark || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{aircraft.manufacturer}</div>
                                            <div className="text-xs text-muted-foreground">{aircraft.type}</div>
                                        </TableCell>
                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                            {aircraft.serial_number || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[aircraft.status ?? ''] ?? 'bg-gray-100 text-gray-700 dark:bg-muted dark:text-muted-foreground'}`}>
                                                {aircraft.status || t('Unknown')}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {aircraft.current_owners && aircraft.current_owners.filter(o => !o.is_closed).length > 0 ? (
                                                <div className="space-y-0.5">
                                                    {aircraft.current_owners.filter(o => !o.is_closed).map((o, i) => (
                                                        <div key={i} className="text-sm flex items-center gap-1.5">
                                                            <span className="text-foreground">{o.name}</span>
                                                            <span className="text-muted-foreground text-xs">({o.role})</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs">{t('No recorded owners')}</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {aircrafts.total > aircrafts.data.length && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            {t('Showing')} {((aircrafts.current_page - 1) * 20) + 1}–{Math.min(aircrafts.current_page * 20, aircrafts.total)} {t('of')} {aircrafts.total}
                        </span>
                        <div className="flex gap-1">
                            {aircrafts.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, { search: searchTerm }, { preserveState: true })}
                                    className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-primary text-primary-foreground' : link.url ? 'bg-card border hover:bg-muted' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
