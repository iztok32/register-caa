import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Globe, ShieldCheck } from 'lucide-react';

interface Setting {
    key: string;
    type: string;
    value: boolean | string;
    group: string;
}

interface Props {
    settings: Record<string, Setting>;
}

export default function Index({ settings }: Props) {
    const { t } = useTranslation();

    const handleToggle = (key: string, value: boolean) => {
        router.patch(route('settings.update', key), { value }, {
            preserveScroll: true,
        });
    };

    const getBool = (key: string): boolean => {
        const s = settings[key];
        if (!s) return false;
        return s.value === true || s.value === '1';
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('System Settings')}
                </h2>
            }
        >
            <Head title={t('System Settings')} />

            <div className="space-y-6">
                {/* Access Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{t('Access Settings')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingRow
                            label={t('Public access enabled')}
                            description={t('Public access description')}
                            checked={getBool('public_access_enabled')}
                            onToggle={(v) => handleToggle('public_access_enabled', v)}
                        />
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{t('Security Settings')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SettingRow
                            label={t('Global 2FA required')}
                            description={t('Global 2FA description')}
                            checked={getBool('two_factor_required_global')}
                            onToggle={(v) => handleToggle('two_factor_required_global', v)}
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}

function SettingRow({
    label,
    description,
    checked,
    onToggle,
}: {
    label: string;
    description: string;
    checked: boolean;
    onToggle: (value: boolean) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between gap-4 py-2">
            <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{label}</p>
                    <Badge variant={checked ? 'default' : 'secondary'} className="text-xs">
                        {checked ? t('Enabled') : t('Disabled')}
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Switch
                checked={checked}
                onCheckedChange={onToggle}
            />
        </div>
    );
}
