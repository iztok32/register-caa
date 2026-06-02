import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'
import { Head } from '@inertiajs/react'
import { useTranslation } from '@/lib/i18n'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Badge } from '@/Components/ui/badge'
import { Search, ShieldAlert, Users, BarChart2, Clock, TrendingUp } from 'lucide-react'

interface Summary {
    today_total: number
    today_blocked: number
    today_unique_ips: number
    month_total: number
}

interface DailyRow {
    date: string
    total: number
    blocked: number
}

interface QueryRow {
    query: string
    count: number
}

interface IpRow {
    ip_address: string
    total: number
    blocked: number
}

interface RecentRow {
    id: number
    ip_address: string
    query: string | null
    results_count: number
    is_blocked: boolean
    created_at: string
}

interface Props {
    summary: Summary
    daily: DailyRow[]
    topQueries: QueryRow[]
    topIps: IpRow[]
    recent: RecentRow[]
}

function SummaryCard({ icon: Icon, label, value, sub, danger }: {
    icon: React.ElementType
    label: string
    value: number
    sub?: string
    danger?: boolean
}) {
    return (
        <Card>
            <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className={`text-3xl font-bold mt-1 ${danger && value > 0 ? 'text-destructive' : ''}`}>
                            {value.toLocaleString()}
                        </p>
                        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                    </div>
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${
                        danger && value > 0 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                    }`}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function DailyChart({ data }: { data: DailyRow[] }) {
    const { t } = useTranslation()
    if (!data.length) return null
    const maxTotal = Math.max(...data.map(d => d.total), 1)

    return (
        <div className="space-y-2">
            {data.map(row => (
                <div key={row.date} className="flex items-center gap-3 text-sm">
                    <span className="w-24 shrink-0 text-xs text-muted-foreground tabular-nums">
                        {new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 flex items-center gap-1.5 h-6">
                        <div
                            className="h-5 rounded bg-primary/70 transition-all"
                            style={{ width: `${(row.total / maxTotal) * 100}%`, minWidth: row.total > 0 ? 4 : 0 }}
                        />
                        {row.blocked > 0 && (
                            <div
                                className="h-5 rounded bg-destructive/60 transition-all"
                                style={{ width: `${(row.blocked / maxTotal) * 100}%`, minWidth: 4 }}
                            />
                        )}
                    </div>
                    <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{row.total}</span>
                    {row.blocked > 0 && (
                        <span className="w-10 text-right text-xs tabular-nums text-destructive">-{row.blocked}</span>
                    )}
                </div>
            ))}
            <div className="flex gap-4 pt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded bg-primary/70" />
                    {t('Searches')}
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="inline-block w-3 h-3 rounded bg-destructive/60" />
                    {t('Blocked')}
                </span>
            </div>
        </div>
    )
}

export default function Index({ summary, daily, topQueries, topIps, recent }: Props) {
    const { t } = useTranslation()

    const blockedPct = summary.today_total > 0
        ? Math.round(summary.today_blocked / summary.today_total * 100)
        : 0

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    {t('Search Statistics')}
                </h2>
            }
        >
            <Head title={t('Search Statistics')} />

            <div className="space-y-6">

                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard icon={Search}     label={t('Searches today')}      value={summary.today_total} />
                    <SummaryCard icon={ShieldAlert} label={t('Blocked today')}       value={summary.today_blocked}
                        sub={blockedPct > 0 ? `${blockedPct}%` : undefined} danger />
                    <SummaryCard icon={Users}       label={t('Unique IPs today')}    value={summary.today_unique_ips} />
                    <SummaryCard icon={TrendingUp}  label={t('Searches this month')} value={summary.month_total} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Daily chart */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <BarChart2 className="h-4 w-4 text-primary" />
                                {t('Last 14 days')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {daily.length === 0
                                ? <p className="text-sm text-muted-foreground">{t('No data yet.')}</p>
                                : <DailyChart data={daily} />
                            }
                        </CardContent>
                    </Card>

                    {/* Top queries */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Search className="h-4 w-4 text-primary" />
                                {t('Top search terms (last 7 days)')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topQueries.length === 0
                                ? <p className="text-sm text-muted-foreground">{t('No data yet.')}</p>
                                : (
                                    <div className="space-y-1.5">
                                        {topQueries.map((q, i) => (
                                            <div key={i} className="flex items-center justify-between gap-2 py-1 border-b last:border-0">
                                                <span className="text-sm font-mono truncate">{q.query}</span>
                                                <Badge variant="secondary" className="shrink-0">{q.count}×</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </CardContent>
                    </Card>

                    {/* Top IPs */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                {t('Top IPs (last 7 days)')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {topIps.length === 0
                                ? <p className="text-sm text-muted-foreground">{t('No data yet.')}</p>
                                : (
                                    <div className="space-y-1.5">
                                        {topIps.map((ip, i) => (
                                            <div key={i} className="flex items-center justify-between gap-2 py-1 border-b last:border-0">
                                                <span className="text-sm font-mono">{ip.ip_address}</span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <Badge variant="secondary">{ip.total}×</Badge>
                                                    {ip.blocked > 0 && (
                                                        <Badge variant="destructive">{ip.blocked} {t('blocked')}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )
                            }
                        </CardContent>
                    </Card>

                    {/* Recent searches */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                {t('Recent searches')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {recent.length === 0
                                ? <p className="text-sm text-muted-foreground px-6 py-4">{t('No data yet.')}</p>
                                : (
                                    <div className="overflow-auto max-h-80">
                                        <table className="w-full text-xs">
                                            <thead className="bg-muted/50 sticky top-0">
                                                <tr>
                                                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('Time')}</th>
                                                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">IP</th>
                                                    <th className="text-left px-4 py-2 font-medium text-muted-foreground">{t('Query')}</th>
                                                    <th className="text-right px-4 py-2 font-medium text-muted-foreground">{t('Results')}</th>
                                                    <th className="text-center px-4 py-2 font-medium text-muted-foreground">{t('Status')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recent.map(row => (
                                                    <tr key={row.id} className={`border-t ${row.is_blocked ? 'bg-destructive/5' : ''}`}>
                                                        <td className="px-4 py-1.5 text-muted-foreground tabular-nums whitespace-nowrap">
                                                            {new Date(row.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                        </td>
                                                        <td className="px-4 py-1.5 font-mono">{row.ip_address}</td>
                                                        <td className="px-4 py-1.5 max-w-[180px] truncate">{row.query ?? '—'}</td>
                                                        <td className="px-4 py-1.5 text-right tabular-nums">{row.is_blocked ? '—' : row.results_count}</td>
                                                        <td className="px-4 py-1.5 text-center">
                                                            {row.is_blocked
                                                                ? <Badge variant="destructive" className="text-[10px] px-1.5">{t('Blocked')}</Badge>
                                                                : <Badge variant="secondary" className="text-[10px] px-1.5">{t('OK')}</Badge>
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )
                            }
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    )
}
