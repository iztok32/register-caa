import { useState, useRef, useCallback } from 'react'
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Globe, ShieldCheck, Bell, ChevronsUpDown, Check, X, FileSignature, UploadCloud, Trash2, RefreshCw, ImageIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/Components/ui/command';

interface Setting {
    key: string
    type: string
    value: boolean | string | string[]
    group: string
}

interface EmailOption {
    id: number
    name: string
    email: string
}

interface Props {
    settings: Record<string, Setting>
    notificationEmailOptions: EmailOption[]
    signatureImageUrl: string | null
}

export default function Index({ settings, notificationEmailOptions, signatureImageUrl }: Props) {
    const { t } = useTranslation()

    const handleToggle = (key: string, value: boolean) => {
        router.patch(route('settings.update', key), { value }, {
            preserveScroll: true,
        })
    }

    const handleEmailsChange = (emails: string[]) => {
        router.patch(route('settings.update', 'notification_emails'), { value: emails }, {
            preserveScroll: true,
        })
    }

    const getBool = (key: string): boolean => {
        const s = settings[key]
        if (!s) return false
        return s.value === true || s.value === '1'
    }

    const getEmails = (): string[] => {
        const s = settings['notification_emails']
        if (!s || !Array.isArray(s.value)) return []
        return s.value as string[]
    }

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

                {/* Notification Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{t('Notification Settings')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <EmailMultiSelect
                            label={t('Notification emails')}
                            description={t('Notification emails description')}
                            options={notificationEmailOptions}
                            selected={getEmails()}
                            onChange={handleEmailsChange}
                        />
                    </CardContent>
                </Card>

                {/* Document Settings */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileSignature className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{t('Document Settings')}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <SignatureImageUpload
                            label={t('Signature and stamp image')}
                            description={t('Signature image description')}
                            currentUrl={signatureImageUrl}
                        />
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    )
}

function SettingRow({
    label,
    description,
    checked,
    onToggle,
}: {
    label: string
    description: string
    checked: boolean
    onToggle: (value: boolean) => void
}) {
    const { t } = useTranslation()

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
    )
}

function EmailMultiSelect({
    label,
    description,
    options,
    selected,
    onChange,
}: {
    label: string
    description: string
    options: EmailOption[]
    selected: string[]
    onChange: (emails: string[]) => void
}) {
    const { t } = useTranslation()
    const [open, setOpen] = useState(false)

    const toggle = (email: string) => {
        const next = selected.includes(email)
            ? selected.filter(e => e !== email)
            : [...selected, email]
        onChange(next)
    }

    const remove = (email: string, e: React.MouseEvent) => {
        e.stopPropagation()
        onChange(selected.filter(em => em !== email))
    }

    const getLabel = (email: string) => {
        const opt = options.find(o => o.email === email)
        return opt ? `${opt.name} (${opt.email})` : email
    }

    return (
        <div className="py-2 space-y-2">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-auto min-h-9 py-1.5 px-3"
                    >
                        {selected.length === 0 ? (
                            <span className="text-muted-foreground font-normal">{t('Select recipients...')}</span>
                        ) : (
                            <div className="flex flex-wrap gap-1 flex-1 text-left">
                                {selected.map(email => (
                                    <Badge key={email} variant="secondary" className="gap-1 pr-1 font-normal">
                                        {getLabel(email)}
                                        <button
                                            type="button"
                                            onClick={(e) => remove(email, e)}
                                            className="hover:text-destructive transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[480px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={t('Search users...')} />
                        <CommandList>
                            <CommandEmpty>{t('No users found.')}</CommandEmpty>
                            <CommandGroup>
                                {options.map(opt => (
                                    <CommandItem
                                        key={opt.email}
                                        value={`${opt.name} ${opt.email}`}
                                        onSelect={() => toggle(opt.email)}
                                    >
                                        <Check
                                            className={`mr-2 h-4 w-4 ${selected.includes(opt.email) ? 'opacity-100' : 'opacity-0'}`}
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm">{opt.name}</span>
                                            <span className="text-xs text-muted-foreground">{opt.email}</span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

function SignatureImageUpload({
    label,
    description,
    currentUrl,
}: {
    label: string
    description: string
    currentUrl: string | null
}) {
    const { t } = useTranslation()
    const inputRef = useRef<HTMLInputElement>(null)
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
    const MAX_MB = 4

    const validate = (file: File): string | null => {
        if (!ACCEPTED.includes(file.type)) return t('Invalid file type. Allowed: JPG, PNG, WEBP.')
        if (file.size > MAX_MB * 1024 * 1024) return t('File too large. Maximum :mb MB.').replace(':mb', String(MAX_MB))
        return null
    }

    const upload = useCallback((file: File) => {
        const err = validate(file)
        if (err) { setError(err); return }
        setError(null)
        setUploading(true)
        router.post(route('settings.signature-image.store'), { image: file }, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploading(false),
        })
    }, [])

    const handleFiles = (files: FileList | null) => {
        if (files && files[0]) upload(files[0])
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
    }

    const handleDelete = () => {
        setDeleting(true)
        router.delete(route('settings.signature-image.delete'), {
            preserveScroll: true,
            onFinish: () => setDeleting(false),
        })
    }

    return (
        <div className="py-2 space-y-3">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {currentUrl ? (
                /* ── Predogled naložene slike ── */
                <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className="flex-shrink-0 w-40 h-24 rounded border bg-white flex items-center justify-center overflow-hidden">
                        <img
                            src={currentUrl}
                            alt={label}
                            className="max-w-full max-h-full object-contain p-1"
                        />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <p className="text-sm text-muted-foreground">{t('Current signature image')}</p>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                                onClick={() => inputRef.current?.click()}
                                disabled={uploading}
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                {uploading ? t('Uploading...') : t('Replace image')}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                {deleting ? t('Deleting...') : t('Delete image')}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── Dropzone za nalaganje ── */
                <div
                    className={`relative rounded-lg border-2 border-dashed transition-colors cursor-pointer ${
                        dragging
                            ? 'border-primary bg-primary/5'
                            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
                        {uploading ? (
                            <>
                                <UploadCloud className="h-8 w-8 text-primary animate-pulse" />
                                <p className="text-sm text-muted-foreground">{t('Uploading...')}</p>
                            </>
                        ) : (
                            <>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                                    dragging ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                                }`}>
                                    <ImageIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">
                                        {t('Drop image here or')}
                                        {' '}
                                        <span className="text-primary">{t('browse')}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {t('JPG, PNG, WEBP · max :mb MB').replace(':mb', String(MAX_MB))}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <p className="text-sm text-destructive">{error}</p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED.join(',')}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
        </div>
    )
}
