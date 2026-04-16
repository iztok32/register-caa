import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Search, Building2, User, Plane } from 'lucide-react';

interface Owner {
    id: number;
    empic_id: number;
    person_last_name: string | null;
    person_first_name: string | null;
    person_city: string | null;
    person_country: string | null;
    organisation_name: string | null;
    organisation_name2: string | null;
    organisation_city: string | null;
    organisation_country: string | null;
    vatin: string | null;
    active_aircraft_count: number;
}

interface Props extends PageProps {
    owners: {
        data: Owner[];
        links: any[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string;
        type: string | null;
    };
}

function ownerName(owner: Owner): string {
    if (owner.organisation_name) {
        return owner.organisation_name2
            ? `${owner.organisation_name} / ${owner.organisation_name2}`
            : owner.organisation_name;
    }
    if (owner.person_last_name || owner.person_first_name) {
        return [owner.person_last_name, owner.person_first_name].filter(Boolean).join(' ');
    }
    return `EMPIC #${owner.empic_id}`;
}

function ownerLocation(owner: Owner): string {
    const city = owner.organisation_name ? owner.organisation_city : owner.person_city;
    const country = owner.organisation_name ? owner.organisation_country : owner.person_country;
    return [city, country].filter(Boolean).join(', ');
}

function ownerType(owner: Owner): 'organisation' | 'person' {
    return owner.organisation_name ? 'organisation' : 'person';
}

export default function Index({ owners, filters }: Props) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [activeType, setActiveType] = useState<string | null>(filters.type ?? null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== filters.search || activeType !== filters.type) {
                router.get(
                    route('owners.index'),
                    { search: searchTerm || undefined, type: activeType || undefined },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, activeType]);

    const handleTypeFilter = (type: string | null) => {
        setActiveType(type);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Owners & Operators" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg flex flex-col dark:bg-card">
                        <div className="p-6 border-b border-gray-200 dark:border-border">

                            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                                <h2 className="text-2xl font-semibold leading-tight text-gray-800 dark:text-foreground">
                                    Owners & Operators
                                </h2>
                                <div className="flex items-center gap-3">
                                    {/* Type filter */}
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant={activeType === null ? 'default' : 'outline'}
                                            onClick={() => handleTypeFilter(null)}
                                        >
                                            {t('All')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={activeType === 'person' ? 'default' : 'outline'}
                                            onClick={() => handleTypeFilter('person')}
                                            className="gap-1.5"
                                        >
                                            <User className="h-3.5 w-3.5" />
                                            {t('Persons')}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={activeType === 'organisation' ? 'default' : 'outline'}
                                            onClick={() => handleTypeFilter('organisation')}
                                            className="gap-1.5"
                                        >
                                            <Building2 className="h-3.5 w-3.5" />
                                            {t('Organisations')}
                                        </Button>
                                    </div>
                                    {/* Search */}
                                    <div className="relative w-72">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="Search by name, city, VAT..."
                                            className="pl-10 h-10 w-full"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 dark:bg-muted/30">
                                            <TableHead className="font-semibold text-gray-900 dark:text-foreground">EMPIC ID</TableHead>
                                            <TableHead className="font-semibold text-gray-900 dark:text-foreground">{t('Type')}</TableHead>
                                            <TableHead className="font-semibold text-gray-900 dark:text-foreground">{t('Name')}</TableHead>
                                            <TableHead className="font-semibold text-gray-900 dark:text-foreground">{t('Location')}</TableHead>
                                            <TableHead className="font-semibold text-gray-900 dark:text-foreground">VAT / Reg.</TableHead>
                                            <TableHead className="font-semibold text-gray-900 dark:text-foreground text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Plane className="h-4 w-4" />
                                                    {t('Aircraft')}
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {owners.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                                    No owners or operators found matching your search.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            owners.data.map((owner) => (
                                                <TableRow
                                                    key={owner.id}
                                                    className="hover:bg-gray-50/50 dark:hover:bg-muted/30 cursor-pointer"
                                                    onClick={() => router.get(route('owners.show', owner.empic_id))}
                                                >
                                                    <TableCell className="font-mono text-sm text-gray-600 dark:text-muted-foreground">
                                                        {owner.empic_id}
                                                    </TableCell>
                                                    <TableCell>
                                                        {ownerType(owner) === 'organisation' ? (
                                                            <Badge variant="secondary" className="gap-1 text-xs">
                                                                <Building2 className="h-3 w-3" />
                                                                {t('Organisation')}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="gap-1 text-xs">
                                                                <User className="h-3 w-3" />
                                                                {t('Person')}
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-blue-600 dark:text-blue-400">
                                                        {ownerName(owner)}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 dark:text-muted-foreground">
                                                        {ownerLocation(owner) || '—'}
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 dark:text-muted-foreground font-mono text-sm">
                                                        {owner.vatin || '—'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {owner.active_aircraft_count > 0 ? (
                                                            <Badge variant="default" className="text-xs">
                                                                {owner.active_aircraft_count}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">0</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {owners.total > owners.data.length && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Showing {((owners.current_page - 1) * 20) + 1} to {Math.min(owners.current_page * 20, owners.total)} of {owners.total} entries
                                    </div>
                                    <div className="flex gap-1">
                                        {owners.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => link.url && router.get(link.url, { search: searchTerm, type: activeType || undefined }, { preserveState: true })}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                            ? 'bg-white text-gray-700 hover:bg-gray-50 border dark:bg-card dark:text-foreground dark:border-border'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-muted'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
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
