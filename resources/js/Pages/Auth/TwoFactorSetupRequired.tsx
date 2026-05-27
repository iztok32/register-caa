import { useState, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/Components/ui/field'
import InputError from '@/Components/InputError'
import { useTranslation } from '@/lib/i18n'
import GuestLayout from '@/Layouts/GuestLayout'
import { ShieldCheck, Smartphone, ScanLine, KeyRound, Copy, CheckCircle2, Check } from 'lucide-react'
import axios from 'axios'

interface Props {
    hasSecret: boolean
}

type Step = 'intro' | 'qr' | 'recovery'

const STEPS = [
    { key: 'intro',    icon: Smartphone, labelKey: 'Install app' },
    { key: 'qr',       icon: ScanLine,   labelKey: 'Scan & confirm' },
    { key: 'recovery', icon: KeyRound,   labelKey: 'Recovery codes' },
] as const

function StepIndicator({ current }: { current: Step }) {
    const { t } = useTranslation()
    const currentIndex = STEPS.findIndex(s => s.key === current)

    return (
        <div className="flex items-center justify-center gap-0 mb-6">
            {STEPS.map((step, index) => {
                const Icon = step.icon
                const done = index < currentIndex
                const active = index === currentIndex

                return (
                    <div key={step.key} className="flex items-center">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                                done
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : active
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-muted-foreground/30 bg-muted text-muted-foreground'
                            }`}>
                                {done
                                    ? <Check className="h-4 w-4" />
                                    : <Icon className="h-4 w-4" />
                                }
                            </div>
                            <span className={`text-xs font-medium whitespace-nowrap ${
                                active ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                                {t(step.labelKey)}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className={`h-0.5 w-12 mb-4 mx-1 transition-colors ${
                                index < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20'
                            }`} />
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default function TwoFactorSetupRequired({ hasSecret }: Props) {
    const { t } = useTranslation()
    const [step, setStep] = useState<Step>('intro')
    const [qrCode, setQrCode] = useState<string | null>(null)
    const [secretKey, setSecretKey] = useState<string | null>(null)
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
    const [copied, setCopied] = useState(false)

    const enableForm = useForm({})
    const confirmForm = useForm({ code: '' })

    const handleEnable = () => {
        enableForm.post(route('two-factor.setup.enable'), {
            onSuccess: () => {
                loadQrCode()
                setStep('qr')
            },
        })
    }

    const loadQrCode = async () => {
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
                loadRecoveryCodes()
                setStep('recovery')
            },
        })
    }

    const loadRecoveryCodes = async () => {
        const res = await axios.get(route('two-factor.setup.recovery-codes'))
        setRecoveryCodes(res.data.recovery_codes)
    }

    const copyRecoveryCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join('\n'))
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleFinish = () => {
        router.visit(route('dashboard'))
    }

    useEffect(() => {
        if (hasSecret) {
            loadQrCode()
            setStep('qr')
        }
    }, [hasSecret])

    return (
        <GuestLayout>
            <Head title={t('Set Up Two-Factor Authentication')} />
            <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                        </div>
                        <CardTitle>{t('Two-Factor Authentication Required')}</CardTitle>
                        <CardDescription>
                            {t('Your account requires two-factor authentication. Please complete the setup to continue.')}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <StepIndicator current={step} />

                        {/* ── Korak 1: Namestitev aplikacije ── */}
                        {step === 'intro' && (
                            <FieldGroup>
                                <div className="rounded-lg bg-muted/50 border p-4 space-y-3 text-sm">
                                    <p className="font-medium">{t('What you need:')}</p>
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            {t('A smartphone with an authenticator app')}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            {t('Recommended: Google Authenticator, Authy or Microsoft Authenticator')}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                            {t('The app is free and available on iOS and Android')}
                                        </li>
                                    </ul>
                                </div>
                                <p className="text-xs text-muted-foreground text-center">
                                    {t('After setup, you will confirm each login with a 6-digit code from the app.')}
                                </p>
                                <Button
                                    className="w-full"
                                    onClick={handleEnable}
                                    disabled={enableForm.processing}
                                >
                                    {enableForm.processing ? t('Preparing...') : t('Begin Setup')}
                                </Button>
                            </FieldGroup>
                        )}

                        {/* ── Korak 2: Skeniranje QR kode ── */}
                        {step === 'qr' && (
                            <form onSubmit={handleConfirm}>
                                <FieldGroup>
                                    <div className="rounded-lg bg-muted/50 border p-4 space-y-2 text-sm text-muted-foreground">
                                        <p className="font-medium text-foreground">{t('Instructions:')}</p>
                                        <ol className="space-y-1.5 list-decimal list-inside">
                                            <li>{t('Open your authenticator app')}</li>
                                            <li>{t('Tap "Add account" or the + button')}</li>
                                            <li>{t('Scan the QR code below')}</li>
                                            <li>{t('Enter the 6-digit code shown in the app')}</li>
                                        </ol>
                                    </div>

                                    {qrCode && (
                                        <div
                                            className="flex justify-center p-4 bg-white rounded-lg border"
                                            dangerouslySetInnerHTML={{ __html: qrCode }}
                                        />
                                    )}

                                    {secretKey && (
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground mb-1">
                                                {t('Cannot scan? Enter the code manually:')}
                                            </p>
                                            <code className="text-sm font-mono bg-muted px-3 py-1.5 rounded select-all block text-center break-all">
                                                {secretKey}
                                            </code>
                                        </div>
                                    )}

                                    <Field>
                                        <FieldLabel htmlFor="code">{t('Confirmation Code')}</FieldLabel>
                                        <Input
                                            id="code"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            value={confirmForm.data.code}
                                            onChange={(e) => confirmForm.setData('code', e.target.value)}
                                            placeholder="000 000"
                                            autoFocus
                                            disabled={confirmForm.processing}
                                            className="text-center tracking-widest text-lg"
                                        />
                                        <InputError message={confirmForm.errors.code} className="mt-2" />
                                    </Field>

                                    <Button type="submit" className="w-full" disabled={confirmForm.processing}>
                                        {confirmForm.processing ? t('Confirming...') : t('Confirm & Activate')}
                                    </Button>
                                </FieldGroup>
                            </form>
                        )}

                        {/* ── Korak 3: Varnostne kode ── */}
                        {step === 'recovery' && (
                            <FieldGroup>
                                <div className="flex items-center gap-2 text-green-600 justify-center mb-1">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">{t('Two-factor authentication enabled!')}</span>
                                </div>

                                <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-sm space-y-1.5">
                                    <p className="font-medium text-amber-800 dark:text-amber-300">
                                        {t('Important — save your recovery codes!')}
                                    </p>
                                    <p className="text-amber-700 dark:text-amber-400 text-xs">
                                        {t('If you lose access to your authenticator app, you can use one of these codes to log in. Each code can only be used once.')}
                                    </p>
                                </div>

                                <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
                                    {recoveryCodes.map((code, i) => (
                                        <div key={i} className="text-center tracking-wider">{code}</div>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full gap-2"
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
                                            {t('Copy recovery codes')}
                                        </>
                                    )}
                                </Button>

                                <Button className="w-full" onClick={handleFinish}>
                                    {t('Continue to Dashboard')}
                                </Button>
                            </FieldGroup>
                        )}
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    )
}
