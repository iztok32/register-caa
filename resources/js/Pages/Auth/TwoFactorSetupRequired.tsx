import { useState, useEffect } from 'react'
import { Head, useForm, router } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Input } from '@/Components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/Components/ui/field'
import InputError from '@/Components/InputError'
import { useTranslation } from '@/lib/i18n'
import GuestLayout from '@/Layouts/GuestLayout'
import { ShieldCheck, Copy, CheckCircle2 } from 'lucide-react'
import axios from 'axios'

interface Props {
    hasSecret: boolean
}

export default function TwoFactorSetupRequired({ hasSecret }: Props) {
    const { t } = useTranslation()
    const [step, setStep] = useState<'intro' | 'qr' | 'confirm' | 'recovery'>('intro')
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

    // If secret already generated (page reload), go to qr step
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
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-2">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <ShieldCheck className="h-7 w-7" />
                            </div>
                        </div>
                        <CardTitle>{t('Two-Factor Authentication Required')}</CardTitle>
                        <CardDescription>
                            {t('Your account requires two-factor authentication. Please complete the setup to continue.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 'intro' && (
                            <FieldGroup>
                                <p className="text-sm text-muted-foreground text-center mb-4">
                                    {t('You will need an authenticator app such as Google Authenticator or Authy to complete this setup.')}
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

                        {step === 'qr' && (
                            <form onSubmit={handleConfirm}>
                                <FieldGroup>
                                    <p className="text-sm text-muted-foreground text-center">
                                        {t('Scan the QR code below with your authenticator app, then enter the 6-digit code to confirm.')}
                                    </p>

                                    {qrCode && (
                                        <div
                                            className="flex justify-center p-4 bg-white rounded-lg"
                                            dangerouslySetInnerHTML={{ __html: qrCode }}
                                        />
                                    )}

                                    {secretKey && (
                                        <div className="text-center">
                                            <p className="text-xs text-muted-foreground mb-1">{t('Or enter the code manually:')}</p>
                                            <code className="text-sm font-mono bg-muted px-3 py-1 rounded select-all">{secretKey}</code>
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

                        {step === 'recovery' && (
                            <FieldGroup>
                                <div className="flex items-center gap-2 text-green-600 justify-center mb-2">
                                    <CheckCircle2 className="h-5 w-5" />
                                    <span className="font-medium">{t('Two-factor authentication enabled!')}</span>
                                </div>

                                <p className="text-sm text-muted-foreground text-center">
                                    {t('Save these recovery codes in a safe place. Each code can only be used once if you lose access to your authenticator app.')}
                                </p>

                                <div className="bg-muted rounded-lg p-4 font-mono text-sm space-y-1">
                                    {recoveryCodes.map((code, i) => (
                                        <div key={i} className="text-center">{code}</div>
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
