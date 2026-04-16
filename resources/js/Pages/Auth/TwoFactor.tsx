import { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { cn } from '@/lib/utils'
import { Button } from '@/Components/ui/button'
import { Card, CardContent } from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/Components/ui/field'
import InputError from '@/Components/InputError'
import { useTranslation } from '@/lib/i18n'
import GuestLayout from '@/Layouts/GuestLayout'
import { ShieldCheck, KeyRound } from 'lucide-react'

export default function TwoFactor() {
    const { t } = useTranslation()
    const [recoveryMode, setRecoveryMode] = useState(false)

    const codeForm = useForm({ code: '' })
    const recoveryForm = useForm({ recovery_code: '' })

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

    return (
        <GuestLayout>
            <Head title={t('Two-Factor Authentication')} />
            <div className={cn('flex flex-col gap-6')}>
                <Card className="overflow-hidden p-0 dark:bg-card">
                    <CardContent className="grid p-0 md:grid-cols-2 shadow-lg dark:bg-background">
                        {!recoveryMode ? (
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

                                    <Field>
                                        <Button type="submit" className="w-full" disabled={codeForm.processing}>
                                            {codeForm.processing ? t('Verifying...') : t('Verify')}
                                        </Button>
                                    </Field>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setRecoveryMode(true)}
                                            className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary"
                                        >
                                            {t('Use a recovery code')}
                                        </button>
                                    </div>
                                </FieldGroup>
                            </form>
                        ) : (
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

                                    <Field>
                                        <Button type="submit" className="w-full" disabled={recoveryForm.processing}>
                                            {recoveryForm.processing ? t('Verifying...') : t('Verify')}
                                        </Button>
                                    </Field>

                                    <div className="text-center">
                                        <button
                                            type="button"
                                            onClick={() => setRecoveryMode(false)}
                                            className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-primary"
                                        >
                                            {t('Use an authentication code')}
                                        </button>
                                    </div>
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
