import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Plus } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/Components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import PermissionCard from './Partials/PermissionCard';
import PermissionForm from './Partials/PermissionForm';

interface Permission {
    id: number;
    name: string;
    slug: string;
    module: string;
    created_at: string;
    updated_at: string;
}

interface ModulePermissions {
    module: string;
    standard: Permission[];
    custom: Permission[];
}

interface Props {
    groupedPermissions: ModulePermissions[];
    standardPermissions: string[];
}

export default function Index({ groupedPermissions, standardPermissions }: Props) {
    const { t } = useTranslation();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | undefined>(undefined);
    const [selectedModule, setSelectedModule] = useState<string | undefined>(undefined);

    const handleCreate = (module?: string) => {
        setEditingPermission(undefined);
        setSelectedModule(module);
        setIsSheetOpen(true);
    };

    const handleEdit = (permission: Permission) => {
        setEditingPermission(permission);
        setSelectedModule(permission.module);
        setIsSheetOpen(true);
    };

    const handleCloseSheet = () => {
        setIsSheetOpen(false);
        setEditingPermission(undefined);
        setSelectedModule(undefined);
    };

    // Get all unique modules
    const allModules = groupedPermissions.map(g => g.module);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Permissions Management')}
                </h2>
            }
        >
            <Head title={t('Permissions')} />

            <div className="space-y-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle>{t('Module Permissions')}</CardTitle>
                        <Button onClick={() => handleCreate()} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('Add Custom Permission')}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {groupedPermissions.length > 0 ? (
                                groupedPermissions.map((moduleData) => (
                                    <PermissionCard
                                        key={moduleData.module}
                                        moduleData={moduleData}
                                        standardPermissions={standardPermissions}
                                        onEdit={handleEdit}
                                        onAddCustom={handleCreate}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    {t('No permissions found. Start by adding a custom permission.')}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent side="right" className="sm:max-w-[500px] overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>
                            {editingPermission ? t('Edit Permission') : t('Add Custom Permission')}
                        </SheetTitle>
                        <SheetDescription>
                            {t('Configure the permission here. Click save when you\'re done.')}
                        </SheetDescription>
                    </SheetHeader>
                    <PermissionForm
                        permission={editingPermission}
                        selectedModule={selectedModule}
                        allModules={allModules}
                        onSuccess={handleCloseSheet}
                    />
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
