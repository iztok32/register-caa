import { useRef, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/lib/i18n';
import { PageProps } from '@/types';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import {
    ArrowLeft, Building2, CheckCircle, ChevronRight,
    FileText, Loader2, Plane, Printer, Search, Send, User,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Applicant {
    name: string;
    address: string;
    postNum: string;
    postOffice: string;
    tax: string;
    legal: string;
}

interface Subject {
    empic_id: number | null;
    display_name: string;
    owner_type: 'organisation' | 'person';
    address: string;
    zip_code: string;
    city: string;
    tax: string | null;
    registration_number: string | null;
    source: string;
}

interface AircraftResult {
    registration_mark: string;
    manufacturer: string | null;
    type: string | null;
}

interface Props extends PageProps {
    applicant: Applicant;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function csrfToken(): string {
    return (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content ?? '';
}

async function apiFetch(url: string, options?: RequestInit) {
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
        },
        ...options,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
    const steps = [
        { n: 1 as const, label: 'Vlagatelj' },
        { n: 2 as const, label: 'Poizvedenec' },
        { n: 3 as const, label: 'Rezultat' },
    ];
    return (
        <div className="flex items-center gap-2 mb-6">
            {steps.map((s, i) => (
                <div key={s.n} className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full transition-colors
                        ${step === s.n
                            ? 'bg-primary text-primary-foreground'
                            : step > s.n
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'}`}>
                        {step > s.n
                            ? <CheckCircle className="h-3.5 w-3.5" />
                            : <span className="text-xs">{s.n}</span>}
                        <span className="hidden sm:inline text-xs">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Index({ applicant: initialApplicant }: Props) {
    const { t } = useTranslation();

    const [step, setStep]               = useState<1 | 2 | 3>(1);
    const [applicant, setApplicant]     = useState<Applicant>(initialApplicant);
    const [errors, setErrors]           = useState<Partial<Record<keyof Applicant, string>>>({});
    const [subject, setSubject]         = useState<Subject | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Subject[]>([]);
    const [aircraft, setAircraft]       = useState<AircraftResult[]>([]);
    const [loading, setLoading]         = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [sendError, setSendError]     = useState<string | null>(null);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Step 1 ───────────────────────────────────────────────────────────────

    function validateApplicant(): boolean {
        const e: Partial<Record<keyof Applicant, string>> = {};
        if (!applicant.name.trim())       e.name       = t('Required');
        if (!applicant.address.trim())    e.address    = t('Required');
        if (!applicant.postNum.trim())    e.postNum    = t('Required');
        if (!applicant.postOffice.trim()) e.postOffice = t('Required');
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleStep1Next() {
        if (!validateApplicant()) return;
        setLoading(true);
        try {
            await apiFetch(route('ownership-verification.save-applicant'), {
                method: 'POST',
                body: JSON.stringify(applicant),
            });
            setStep(2);
        } finally {
            setLoading(false);
        }
    }

    // ── Step 2 ───────────────────────────────────────────────────────────────

    function handleSearchInput(q: string) {
        setSearchQuery(q);
        setSubject(null);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        if (q.length < 2) { setSearchResults([]); return; }

        searchTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await apiFetch(
                    route('ownership-verification.search-subject') + '?q=' + encodeURIComponent(q)
                );
                setSearchResults(Array.isArray(data) ? data : []);
            } finally {
                setLoading(false);
            }
        }, 400);
    }

    function selectSubject(s: Subject) {
        setSubject(s);
        setSearchQuery(s.display_name);
        setSearchResults([]);
    }

    async function handleStep2Next() {
        if (!subject) return;
        setLoading(true);
        try {
            const data = await apiFetch(
                route('ownership-verification.get-aircraft') + '?empic_id=' + subject.empic_id
            );
            setAircraft(data.aircraft ?? []);
            setStep(3);
        } finally {
            setLoading(false);
        }
    }

    // ── Step 3 ───────────────────────────────────────────────────────────────

    async function handleSendRequest() {
        setSendError(null);
        setLoading(true);
        try {
            const result = await apiFetch(route('ownership-verification.send-request'), {
                method: 'POST',
                body: JSON.stringify({ applicant, subject, aircraft }),
            });
            if (result.ok) {
                setRequestSent(true);
            } else {
                setSendError(result.error ?? t('An error occurred. Please try again.'));
            }
        } catch {
            setSendError(t('An error occurred. Please try again.'));
        } finally {
            setLoading(false);
        }
    }

    function handlePrintDocument() {
        const params = new URLSearchParams({
            applicant: JSON.stringify(applicant),
            subject: JSON.stringify(subject),
        });
        window.open(route('ownership-verification.print-document') + '?' + params.toString(), '_blank');
    }

    function startNewInquiry() {
        setStep(1);
        setSubject(null);
        setSearchQuery('');
        setSearchResults([]);
        setAircraft([]);
        setRequestSent(false);
        setSendError(null);
    }

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <AuthenticatedLayout>
            <Head title={t('Ownership Verification')} />

            <div className="flex flex-col gap-5 p-4 pt-0 max-w-2xl mx-auto w-full">
                <div className="rounded-xl border bg-card p-6">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6 pb-5 border-b">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{t('Ownership Verification')}</h1>
                            <p className="text-sm text-muted-foreground">{t('Aircraft ownership inquiry')}</p>
                        </div>
                    </div>

                    <StepIndicator step={step} />

                    {/* ── STEP 1: Applicant ─────────────────────────────── */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                {t('Your details')}
                            </p>

                            <div className="space-y-1">
                                <Label htmlFor="app-name">{t('Full name or company name')} *</Label>
                                <Input
                                    id="app-name"
                                    value={applicant.name}
                                    onChange={e => setApplicant(a => ({ ...a, name: e.target.value }))}
                                    className={errors.name ? 'border-destructive' : ''}
                                />
                                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="app-address">{t('Street address')} *</Label>
                                <Input
                                    id="app-address"
                                    value={applicant.address}
                                    onChange={e => setApplicant(a => ({ ...a, address: e.target.value }))}
                                    className={errors.address ? 'border-destructive' : ''}
                                    placeholder="Ulica 12"
                                />
                                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="app-postnum">{t('ZIP code')} *</Label>
                                    <Input
                                        id="app-postnum"
                                        value={applicant.postNum}
                                        onChange={e => setApplicant(a => ({ ...a, postNum: e.target.value }))}
                                        className={errors.postNum ? 'border-destructive' : ''}
                                        placeholder="1000"
                                    />
                                    {errors.postNum && <p className="text-xs text-destructive">{errors.postNum}</p>}
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label htmlFor="app-postoffice">{t('City')} *</Label>
                                    <Input
                                        id="app-postoffice"
                                        value={applicant.postOffice}
                                        onChange={e => setApplicant(a => ({ ...a, postOffice: e.target.value }))}
                                        className={errors.postOffice ? 'border-destructive' : ''}
                                        placeholder="Ljubljana"
                                    />
                                    {errors.postOffice && <p className="text-xs text-destructive">{errors.postOffice}</p>}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="app-tax">{t('Tax number')}</Label>
                                <Input
                                    id="app-tax"
                                    value={applicant.tax}
                                    onChange={e => setApplicant(a => ({ ...a, tax: e.target.value }))}
                                    placeholder="SI12345678"
                                />
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="app-legal">{t('Legal basis')}</Label>
                                <Textarea
                                    id="app-legal"
                                    rows={3}
                                    value={applicant.legal}
                                    onChange={e => setApplicant(a => ({ ...a, legal: e.target.value }))}
                                    placeholder={t('e.g. Article 5 of the Aviation Act...')}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleStep1Next} disabled={loading} className="gap-1">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('Next')}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Subject search ────────────────────────── */}
                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                {t('Subject of inquiry')}
                            </p>

                            <div className="space-y-1 relative">
                                <Label htmlFor="subject-search">{t('Search by name or tax number')}</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                                    <Input
                                        id="subject-search"
                                        value={searchQuery}
                                        onChange={e => handleSearchInput(e.target.value)}
                                        className="pl-9 pr-9"
                                        placeholder="ACME d.o.o. ali SI12345678"
                                        autoComplete="off"
                                    />
                                    {loading && (
                                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>

                                {/* Dropdown results */}
                                {searchResults.length > 0 && (
                                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-background border rounded-lg shadow-xl max-h-72 overflow-y-auto">
                                        {searchResults.map((s, i) => (
                                            <button
                                                key={s.empic_id != null ? `empic-${s.empic_id}` : s.tax ? `tax-${s.tax}` : `idx-${i}`}
                                                type="button"
                                                className="w-full text-left px-4 py-3 hover:bg-muted/60 border-b last:border-0 flex items-start gap-2.5 transition-colors"
                                                onClick={() => selectSubject(s)}
                                            >
                                                {s.owner_type === 'organisation'
                                                    ? <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                    : <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                                                }
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm truncate">{s.display_name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {[s.address, s.zip_code, s.city].filter(Boolean).join(', ')}
                                                        {s.tax ? ` · ${s.tax}` : ''}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searchQuery.length >= 2 && searchResults.length === 0 && !loading && !subject && (
                                    <p className="text-xs text-muted-foreground mt-1.5">{t('No results found. Try a different search term.')}</p>
                                )}
                            </div>

                            {/* Selected subject card */}
                            {subject && (
                                <div className="rounded-lg bg-muted/40 border p-4 flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm">{subject.display_name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {[subject.address, subject.zip_code, subject.city].filter(Boolean).join(', ')}
                                        </p>
                                        {subject.tax && (
                                            <p className="text-xs text-muted-foreground">
                                                {t('Tax number')}: {subject.tax}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between pt-2">
                                <Button variant="ghost" onClick={() => setStep(1)} className="gap-1">
                                    <ArrowLeft className="h-4 w-4" />
                                    {t('Back')}
                                </Button>
                                <Button onClick={handleStep2Next} disabled={!subject || loading} className="gap-1">
                                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {t('Next')}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Results ───────────────────────────────── */}
                    {step === 3 && (
                        <div className="flex flex-col gap-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                {t('Results')}
                            </p>

                            {/* Subject summary */}
                            <div className="rounded-lg border bg-muted/20 p-4">
                                <p className="text-xs text-muted-foreground mb-1">{t('Aircraft registered to')}:</p>
                                <p className="font-semibold">{subject?.display_name}</p>
                                {subject?.tax && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{t('Tax number')}: {subject.tax}</p>
                                )}
                            </div>

                            {/* Aircraft list */}
                            {aircraft.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">{t('Aircraft found')} ({aircraft.length}):</p>
                                    {aircraft.map((a, i) => (
                                        <div key={i} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                                            <Plane className="h-4 w-4 text-primary shrink-0" />
                                            <div>
                                                <p className="font-semibold text-sm font-mono">{a.registration_mark}</p>
                                                {(a.manufacturer || a.type) && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {[a.manufacturer, a.type].filter(Boolean).join(' ')}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10 p-4 text-center">
                                    <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                                        {t('No aircraft found in the register for this subject.')}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {!requestSent ? (
                                <div className="flex flex-col gap-3 pt-1">
                                    {sendError && (
                                        <p className="text-sm text-destructive">{sendError}</p>
                                    )}
                                    {aircraft.length > 0 ? (
                                        <Button onClick={handleSendRequest} disabled={loading} className="gap-2 w-full sm:w-auto sm:self-end">
                                            {loading
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : <Send className="h-4 w-4" />
                                            }
                                            {t('Send request to CAA')}
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={handlePrintDocument} className="gap-2 w-full sm:w-auto sm:self-end">
                                            <Printer className="h-4 w-4" />
                                            {t('Open printable document')}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-4 flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                                    <p className="text-sm font-medium text-green-800 dark:text-green-400">
                                        {t('Request sent successfully!')}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between pt-2 border-t">
                                {!requestSent ? (
                                    <Button variant="ghost" onClick={() => setStep(2)} className="gap-1">
                                        <ArrowLeft className="h-4 w-4" />
                                        {t('Back')}
                                    </Button>
                                ) : (
                                    <div />
                                )}
                                <Button variant="outline" size="sm" onClick={startNewInquiry}>
                                    {t('New inquiry')}
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
