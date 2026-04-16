import { useState } from 'react'
import { useForm, router } from '@inertiajs/react'
import { useTranslation } from '@/lib/i18n'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Field, FieldGroup, FieldLabel } from '@/Components/ui/field'
import InputError from '@/Components/InputError'
import { CheckCircle2, ShieldCheck, ShieldOff, Copy, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react'
import axios from 'axios'

interface Props {
    enabled: boolean
    required: boolean
    hasSecret: boolean
}

export default function TwoFactorAuthenticationForm({ enabled, required, hasSecret }: Props) {
    const { t } = useTranslation()
    const [showSetup, setShowSetup] = useState(hasSecret && !enabled)
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [secretKey, setSecretKey] = useState<string | null>(null)
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false)
    const [copied, setCopied] = useState(false)

    const enableForm = useForm({})
    const confirmForm = useForm({ code: '' })
    const disableForm = useForm({ password: '' })
    const [showDisableForm, setShowDisableForm] = useState(false)

    const handleEnable = () => {
        enableForm.post(route('two-factor.setup.enable'), {
            onSuccess: async () => {
                await loadQrAndKey()
                setShowSetup(true)
            },
        })
    }

    const loadQrAndKey = async () => {
        const qrRes = await axios.get(route('two-factor.setup.qr-code'), {
            responseType: 'text',
            headers: { Accept: 'image/svg+xml' },
        })
        setQrCode(qrRes.data)

        const keyRes = await axios.get(route('two-factor.setup.secret-key'))
        setSecretKey(keyRes.data.secret_key)
    }

    const handleConfirm = (e: React.FormEvent) => {
        e.preventDefault()
        confirmForm.post(route('two-factor.setup.confirm'), {
            onSuccess: () => {
                setShowSetup(false)
                confirmForm.reset()
                router.reload({ only: ['twoFactor'] })
            },
        })
    }

    const handleDisable = (e: React.FormEvent) => {
        e.preventDefault()
        disableForm.post(route('two-factor.setup.disable'), {
            onSuccess: () => {
                setShowDisableForm(false)
                setShowSetup(false)
                setQrCode(null)
                setSecretKey(null)
                setRecoveryCodes([])
                disableForm.reset()
                router.reload({ only: ['twoFactor'] })
            },
        })
    }

    const loadRecoveryCodes = async () => {
        const res = await axios.get(route('two-factor.setup.recovery-codes'))
        setRecoveryCodes(res.data.recovery_codes)
        setShowRecoveryCodes(true)
    }

    const handleRegenerateCodes = () => {
        router.post(route('two-factor.setup.recovery-codes.regenerate'), {}, {
            onSuccess: () => loadRecoveryCodes(),
        })
    }

    const copyRecoveryCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">{t('Two-Factor Authentication')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {t('Add additional security to your account using an authenticator app.')}
                </p>
            </div>

            {required && !enabled && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        {t('Two-factor authentication is required for your account. Please enable it to ensure continued access.')}
                    </p>
                </div>
            )}

            {/* Status Badge */}
            <div className="flex items-center gap-3">
                {enabled ? (
                    <div className="flex items-center gap-2 text-green-600">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="font-medium text-sm">{t('Two-factor authentication is enabled.')}</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <ShieldOff className="h-5 w-5" />
                        <span className="text-sm">{t('Two-factor authentication is not enabled.')}</span>
                    </div>
                )}
            </div>

            {/* Enable / Setup flow */}
            {!enabled && !showSetup && (
                <Button onClick={handleEnable} disabled={enableForm.processing} className="gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {enableForm.processing ? t('Preparing...') : t('Enable Two-Factor Authentication')}
                </Button>
            )}

            {/* QR Code setup */}
            {!enabled && showSetup && (
                <div className="space-y-4 border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                        {t('Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code to confirm.')}
                    </p>

                    {qrCode && (
                        <div
                            className="flex justify-center p-4 bg-white rounded-lg w-fit mx-auto"
                            dangerouslySetInnerHTML={{ __html: qrCode }}
                        />
                    )}

                    {secretKey && (
                        <div className="text-center">
                            <p className="text-xs text-muted-foreground mb-1">{t('Manual entry key:')}</p>
                            <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded select-all block w-fit mx-auto">{secretKey}</code>
                        </div>
                    )}

                    <form onSubmit={handleConfirm} className="space-y-3">
                        <Field>
                            <FieldLabel htmlFor="confirm_code">{t('Confirmation Code')}</FieldLabel>
                            <Input
                                id="confirm_code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                value={confirmForm.data.code}
                                onChange={(e) => confirmForm.setData('code', e.target.value)}
                                placeholder="000 000"
                                disabled={confirmForm.processing}
                                className="text-center tracking-widest text-lg max-w-[200px]"
                            />
                            <InputError message={confirmForm.errors.code} className="mt-1" />
                        </Field>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={confirmForm.processing}>
                                {confirmForm.processing ? t('Confirming...') : t('Confirm')}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowSetup(false)}
                            >
                                {t('Cancel')}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Recovery codes section */}
            {enabled && (
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={showRecoveryCodes ? () => setShowRecoveryCodes(false) : loadRecoveryCodes}
                            type="button"
                        >
                            <KeyRound className="h-4 w-4" />
                            {showRecoveryCodes ? t('Hide recovery codes') : t('Show recovery codes')}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={handleRegenerateCodes}
                            type="button"
                        >
                            <RefreshCw className="h-4 w-4" />
                            {t('Regenerate')}
                        </Button>
                    </div>

                    {showRecoveryCodes && recoveryCodes.length > 0 && (
                        <div className="space-y-2">
                            <div className="bg-muted rounded-lg p-4 font-mono text-sm grid grid-cols-2 gap-1">
                                {recoveryCodes.map((code, i) => (
                                    <div key={i}>{code}</div>
                                ))}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={copyRecoveryCodes}
                                type="button"
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        {t('Copied!')}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4" />
                                        {t('Copy codes')}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* Disable 2FA */}
            {enabled && (
                <div className="border-t pt-4">
                    {!showDisableForm ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowDisableForm(true)}
                            type="button"
                        >
                            <ShieldOff className="h-4 w-4" />
                            {t('Disable Two-Factor Authentication')}
                        </Button>
                    ) : (
                        <form onSubmit={handleDisable} className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                {t('Confirm your password to disable two-factor authentication.')}
                            </p>
                            <Field>
                                <FieldLabel htmlFor="disable_password">{t('Password')}</FieldLabel>
                                <Input
                                    id="disable_password"
                                    type="password"
                                    value={disableForm.data.password}
                                    onChange={(e) => disableForm.setData('password', e.target.value)}
                                    autoComplete="current-password"
                                    disabled={disableForm.processing}
                                    className="max-w-xs"
                                />
                                <InputError message={disableForm.errors.password} className="mt-1" />
                            </Field>
                            <div className="flex gap-2">
                                <Button variant="destructive" type="submit" size="sm" disabled={disableForm.processing}>
                                    {disableForm.processing ? t('Disabling...') : t('Disable')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setShowDisableForm(false); disableForm.reset() }}
                                >
                                    {t('Cancel')}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    )
}
