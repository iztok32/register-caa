import { useState } from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import { cn } from '@/lib/utils'
import { Button } from '@/Components/ui/button'
import { Card, CardContent } from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/Components/ui/field'
import InputError from '@/Components/InputError'
import { useTranslation } from '@/lib/i18n'
import GuestLayout from '@/Layouts/GuestLayout'
import { ShieldCheck, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react'

type Mode = 'code' | 'recovery' | 'request'

export default function TwoFactor() {
    const { t } = useTranslation()
    const { props } = usePage<{ flash: { reset_requested?: boolean } }>()
    const [mode, setMode] = useState<Mode>('code')

    const codeForm     = useForm({ code: '' })
    const recoveryForm = useForm({ recovery_code: '' })
    const requestForm  = useForm({ message: '' })

    const submitCode = (e: React.FormEvent) => {
        e.preventDefault()
        codeForm.post(route('two-factor.challenge'), {
            onFinish: () => codeForm.reset(),
        })
    }

    const submitRecovery = (e: React.FormEvent) => {
        e.preventDefault()
        recoveryForm.post(route('two-factor.challenge'), {
            onFinish: () => recoveryForm.reset(),
        })
    }

    const submitRequest = (e: React.FormEvent) => {
        e.preventDefault()
        requestForm.post(route('two-factor.reset-request'), {
            onFinish: () => requestForm.reset(),
        })
    }

    const resetRequested = props.flash?.reset_requested === true

    return (
        <GuestLayout>
            <Head title={t('Two-Factor Authentication')} />
            <div className={cn('flex flex-col gap-6')}>
                <Card className="overflow-hidden p-0 dark:bg-card">
                    <CardContent className="grid p-0 md:grid-cols-2 shadow-lg dark:bg-background">

                        {/* ── Mode: TOTP code ── */}
                        {mode === 'code' && (
                            <form className="p-6 md:p-8" onSubmit={submitCode}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <ShieldCheck className="h-6 w-6" />
                                        </div>
                                        <h1 className="text-2xl font-bold">{t('Two-Factor Authentication')}</h1>
                                        <p className="text-balance text-sm text-muted-foreground">
                                            {t('Enter the code from your authenticator app.')}
                                        </p>
                                    </div>

                                    <Field>
                                        <FieldLabel htmlFor="code">{t('Authentication Code')}</FieldLabel>
                                        <Input
                                            id="code"
                                            name="code"
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            value={codeForm.data.code}
                                            onChange={(e) => codeForm.setData('code', e.target.value)}
                                            placeholder="000 000"
                                            required
                                            autoFocus
                                            disabled={codeForm.processing}
                                            className="text-center tracking-widest text-lg"
                                        />
                                        <InputError message={codeForm.errors.code} className="mt-2" />
                                    </Field>

                                    <Button type="submit" className="w-full" disabled={codeForm.processing}>
                                        {codeForm.processing ? t('Verifying...') : t('Verify')}
                                    </Button>

                                    <div className="flex flex-col items-center gap-1.5 text-center">
                                        <button type="button" onClick={() => setMode('recovery')}
                                            className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary">
                                            {t('Use a recovery code')}
                                        </button>
                                        <button type="button" onClick={() => setMode('request')}
                                            className="text-xs text-muted-foreground/70 underline-offset-4 hover:underline hover:text-primary">
                                            {t('Lost phone and recovery codes?')}
                                        </button>
                                    </div>
                                </FieldGroup>
                            </form>
                        )}

                        {/* ── Mode: Recovery code ── */}
                        {mode === 'recovery' && (
                            <form className="p-6 md:p-8" onSubmit={submitRecovery}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30">
                                            <KeyRound className="h-6 w-6" />
                                        </div>
                                        <h1 className="text-2xl font-bold">{t('Recovery Code')}</h1>
                                        <p className="text-balance text-sm text-muted-foreground">
                                            {t('Enter one of your emergency recovery codes.')}
                                        </p>
                                    </div>

                                    <Field>
                                        <FieldLabel htmlFor="recovery_code">{t('Recovery Code')}</FieldLabel>
                                        <Input
                                            id="recovery_code"
                                            name="recovery_code"
                                            type="text"
                                            autoComplete="off"
                                            value={recoveryForm.data.recovery_code}
                                            onChange={(e) => recoveryForm.setData('recovery_code', e.target.value)}
                                            placeholder="xxxxx-xxxxx-xxxxx"
                                            required
                                            autoFocus
                                            disabled={recoveryForm.processing}
                                            className="font-mono"
                                        />
                                        <InputError message={recoveryForm.errors.recovery_code} className="mt-2" />
                                    </Field>

                                    <Button type="submit" className="w-full" disabled={recoveryForm.processing}>
                                        {recoveryForm.processing ? t('Verifying...') : t('Verify')}
                                    </Button>

                                    <div className="flex flex-col items-center gap-1.5 text-center">
                                        <button type="button" onClick={() => setMode('code')}
                                            className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary">
                                            {t('Use an authentication code')}
                                        </button>
                                        <button type="button" onClick={() => setMode('request')}
                                            className="text-xs text-muted-foreground/70 underline-offset-4 hover:underline hover:text-primary">
                                            {t('Lost phone and recovery codes?')}
                                        </button>
                                    </div>
                                </FieldGroup>
                            </form>
                        )}

                        {/* ── Mode: Request reset ── */}
                        {mode === 'request' && (
                            <form className="p-6 md:p-8" onSubmit={submitRequest}>
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30">
                                            <AlertTriangle className="h-6 w-6" />
                                        </div>
                                        <h1 className="text-2xl font-bold">{t('Request 2FA Reset')}</h1>
                                        <p className="text-balance text-sm text-muted-foreground">
                                            {t('An operator will verify your identity and reset your 2FA. This may take some time.')}
                                        </p>
                                    </div>

                                    {resetRequested ? (
                                        <div className="flex flex-col items-center gap-3 py-4 text-center">
                                            <CheckCircle2 className="h-10 w-10 text-green-500" />
                                            <p className="text-sm font-medium">{t('Request sent successfully.')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {t('The operator has been notified. Please wait for confirmation.')}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <Field>
                                                <FieldLabel htmlFor="message">{t('Message (optional)')}</FieldLabel>
                                                <textarea
                                                    id="message"
                                                    value={requestForm.data.message}
                                                    onChange={(e) => requestForm.setData('message', e.target.value)}
                                                    placeholder={t('Briefly describe your situation...')}
                                                    disabled={requestForm.processing}
                                                    maxLength={500}
                                                    rows={3}
                                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                                />
                                                <InputError message={requestForm.errors.message} className="mt-2" />
                                            </Field>

                                            <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
                                                {t('For security, the operator will contact you to verify your identity before resetting.')}
                                            </div>

                                            <Button type="submit" className="w-full" disabled={requestForm.processing}>
                                                {requestForm.processing ? t('Sending...') : t('Send Reset Request')}
                                            </Button>
                                        </>
                                    )}

                                    <button type="button" onClick={() => setMode('code')}
                                        className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary text-center w-full">
                                        {t('Back to authentication')}
                                    </button>
                                </FieldGroup>
                            </form>
                        )}

                        <div className="relative hidden bg-muted md:block bg-black">
                            <img
                                src="/images/login-bg.jpg"
                                alt="Background"
                                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </GuestLayout>
    )
}
