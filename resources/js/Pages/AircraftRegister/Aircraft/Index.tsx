import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import { useState, useCallback, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Search } from 'lucide-react';

interface OwnerData {
    role: string;
    is_closed: boolean;
    name: string;
    type: string;
}

interface Aircraft {
    id: number;
    empic_id: number;
    registration_mark: string;
    manufacturer: string;
    type: string;
    serial_number: string;
    status: string;
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
    filters: {
        search: string;
    };
}

export default function Index({ aircrafts, filters }: Props) {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== filters.search) {
                router.get(
                    route('aircraft.index'),
                    { search: searchTerm },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters.search]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Aircraft Register" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg flex flex-col">
                        <div className="p-6 bg-white border-b border-gray-200">
                            
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold leading-tight text-gray-800">
                                    Aircraft Register
                                </h2>
                                <div className="relative w-72">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <Input
                                        type="text"
                                        placeholder="Search by registration, type, aircraft owner..."
                                        className="pl-10 h-10 w-full"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead className="font-semibold text-gray-900">Registration</TableHead>
                                            <TableHead className="font-semibold text-gray-900">Manufacturer & Type</TableHead>
                                            <TableHead className="font-semibold text-gray-900">Serial No.</TableHead>
                                            <TableHead className="font-semibold text-gray-900">Status</TableHead>
                                            <TableHead className="font-semibold text-gray-900">Owners / Operators</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {aircrafts.data.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                                    No aircraft found matching your search.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            aircrafts.data.map((aircraft) => (
                                                <TableRow key={aircraft.id} className="hover:bg-gray-50/50">
                                                    <TableCell className="font-medium text-blue-600">
                                                        {aircraft.registration_mark}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">{aircraft.manufacturer}</div>
                                                        <div className="text-sm text-gray-500">{aircraft.type}</div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600">
                                                        {aircraft.serial_number}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            aircraft.status === 'Registered' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {aircraft.status || 'Unknown'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {aircraft.current_owners && aircraft.current_owners.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {aircraft.current_owners.map((owner, idx) => (
                                                                    <div key={idx} className="text-sm">
                                                                        <span className="text-gray-900">{owner.name}</span>
                                                                        <span className="text-gray-500 ml-1 text-xs">({owner.role})</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">No recorded owners</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination (simple rendering) */}
                            {aircrafts.total > aircrafts.data.length && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-500">
                                        Showing {((aircrafts.current_page - 1) * 20) + 1} to {Math.min(aircrafts.current_page * 20, aircrafts.total)} of {aircrafts.total} entries
                                    </div>
                                    <div className="flex gap-1">
                                        {aircrafts.links.map((link, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => link.url && router.get(link.url, { search: searchTerm }, { preserveState: true })}
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                            ? 'bg-white text-gray-700 hover:bg-gray-50 border'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
