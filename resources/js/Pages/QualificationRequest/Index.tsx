import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import { CheckCircle2, Clock, Loader2, Send, UserCheck } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Applicant {
    name: string;
    address: string;
    postNum: string;
    postOffice: string;
    tax: string;
    registration: string;
    contact: string;
    legal: string;
}

interface Props extends PageProps {
    isQualified: boolean;
    requestedAt: string | null;
    userEmail: string;
    applicant: Applicant;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

async function apiFetch(url: string, body: unknown) {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── Field component ─────────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {children}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Index({ isQualified, requestedAt, userEmail, applicant: initial }: Props) {
    const { t } = useTranslation();

    const [form, setForm] = useState<Applicant>({ ...initial });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Partial<Record<keyof Applicant, string>>>({});

    const set = (key: keyof Applicant) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm(f => ({ ...f, [key]: e.target.value }));
        setValidationErrors(v => ({ ...v, [key]: undefined }));
    };

    const validate = (): boolean => {
        const errs: Partial<Record<keyof Applicant, string>> = {};
        if (!form.name.trim()) errs.name = t('Required');
        if (!form.address.trim()) errs.address = t('Required');
        if (!form.postNum.trim()) errs.postNum = t('Required');
        if (!form.postOffice.trim()) errs.postOffice = t('Required');
        if (!form.contact.trim()) errs.contact = t('Required');
        if (!form.legal.trim()) errs.legal = t('Required');
        setValidationErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setSubmitting(true);
        setError(null);
        try {
            await apiFetch(route('qualification-request.store'), form);
            setSubmitted(true);
        } catch {
            setError(t('An error occurred. Please try again.'));
        } finally {
            setSubmitting(false);
        }
    };

    // ── Already qualified ──────────────────────────────────────────────────────
    if (isQualified) {
        return (
            <AuthenticatedLayout>
                <Head title={t('Qualified User Request')} />
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold">{t('You already have qualified user access.')}</h2>
                    <p className="text-sm text-muted-foreground">{t('You can use the ownership verification module.')}</p>
                </div>
            </AuthenticatedLayout>
        );
    }

    const isPending = !submitted && !!requestedAt;
    const isSuccess = submitted;

    if (isSuccess || isPending) {
        return (
            <AuthenticatedLayout>
                <Head title={t('Qualified User Request')} />
                <div className="flex flex-col items-center justify-center py-16 gap-4 max-w-lg mx-auto text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold">{t('Your request has been submitted.')}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t('We will review your request and notify you at')} <strong>{userEmail}</strong>.
                    </p>
                    {isPending && (
                        <p className="text-xs text-muted-foreground">
                            {t('Submitted on')}: {requestedAt}
                        </p>
                    )}
                </div>
            </AuthenticatedLayout>
        );
    }

    // ── Form ───────────────────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout>
            <Head title={t('Qualified User Request')} />

            <div className="max-w-2xl mx-auto flex flex-col gap-6 p-4 pt-0">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">{t('Request Qualified User Access')}</h2>
                        <p className="text-sm text-muted-foreground">{t('Fill in your details to request access to ownership verification.')}</p>
                    </div>
                </div>

                {/* Form card */}
                <div className="rounded-xl border bg-card p-6 flex flex-col gap-5">

                    {/* Organisation / name */}
                    <Field label={t('Organization or full name')} required>
                        <Input
                            value={form.name}
                            onChange={set('name')}
                            placeholder={t('e.g. Aviacija d.o.o. or Janez Novak')}
                            className={validationErrors.name ? 'border-destructive' : ''}
                        />
                        {validationErrors.name && <p className="text-xs text-destructive">{validationErrors.name}</p>}
                    </Field>

                    {/* Address */}
                    <Field label={t('Street and house number')} required>
                        <Input
                            value={form.address}
                            onChange={set('address')}
                            placeholder={t('e.g. Dunajska cesta 1')}
                            className={validationErrors.address ? 'border-destructive' : ''}
                        />
                        {validationErrors.address && <p className="text-xs text-destructive">{validationErrors.address}</p>}
                    </Field>

                    {/* Post num + post office */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label={t('Postal code')} required>
                            <Input
                                value={form.postNum}
                                onChange={set('postNum')}
                                placeholder="1000"
                                className={validationErrors.postNum ? 'border-destructive' : ''}
                            />
                            {validationErrors.postNum && <p className="text-xs text-destructive">{validationErrors.postNum}</p>}
                        </Field>
                        <Field label={t('City')} required>
                            <Input
                                value={form.postOffice}
                                onChange={set('postOffice')}
                                placeholder={t('e.g. Ljubljana')}
                                className={validationErrors.postOffice ? 'border-destructive' : ''}
                            />
                            {validationErrors.postOffice && <p className="text-xs text-destructive">{validationErrors.postOffice}</p>}
                        </Field>
                    </div>

                    {/* Tax + registration */}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label={t('Tax number (VAT)')}>
                            <Input
                                value={form.tax}
                                onChange={set('tax')}
                                placeholder="SI12345678"
                            />
                        </Field>
                        <Field label={t('Registration number')}>
                            <Input
                                value={form.registration}
                                onChange={set('registration')}
                                placeholder={t('e.g. 1234567000')}
                            />
                        </Field>
                    </div>

                    {/* Contact person */}
                    <Field label={t('Contact person')} required>
                        <Input
                            value={form.contact}
                            onChange={set('contact')}
                            placeholder={t('Full name of the contact person')}
                            className={validationErrors.contact ? 'border-destructive' : ''}
                        />
                        {validationErrors.contact && <p className="text-xs text-destructive">{validationErrors.contact}</p>}
                    </Field>

                    {/* Legal basis */}
                    <Field label={t('Legal basis / purpose of inquiry')} required>
                        <Textarea
                            value={form.legal}
                            onChange={set('legal')}
                            rows={4}
                            placeholder={t('Describe the legal basis and purpose for which you need access to aircraft ownership data...')}
                            className={validationErrors.legal ? 'border-destructive' : ''}
                        />
                        {validationErrors.legal && <p className="text-xs text-destructive">{validationErrors.legal}</p>}
                    </Field>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleSubmit} disabled={submitting} className="gap-2 min-w-36">
                            {submitting
                                ? <><Loader2 className="h-4 w-4 animate-spin" />{t('Sending...')}</>
                                : <><Send className="h-4 w-4" />{t('Submit request')}</>
                            }
                        </Button>
                    </div>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                    {t('After reviewing your request, we will notify you at')} <strong>{userEmail}</strong>.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
