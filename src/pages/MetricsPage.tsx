import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ROUTES } from '@/config/routes'
import { PageHeader } from '@/components/portal/PageHeader'
import { MOCK_METRICS, METRICS_KPIS, METRICS_INSIGHTS } from '@/mocks'
import type { KpiCardData, TrendDirection } from '@/mocks/metrics'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

const TABS = ['Attack', 'Autenticación', 'Usuario / Identidad', 'Operaciones', 'Red'] as const
type TabId = (typeof TABS)[number]

const DATE_RANGE_OPTIONS = [
  { value: 7, label: 'Últimos 7 días' },
  { value: 14, label: 'Últimos 14 días' },
  { value: 30, label: 'Últimos 30 días' },
] as const

const TAB_PALETTE: Record<TabId, { primary: string; light: string; chart: string; chartSecondary: string }> = {
  Attack: { primary: '#7c3aed', light: '#f5f3ff', chart: '#8b5cf6', chartSecondary: '#dc2626' },
  Autenticación: { primary: '#2563eb', light: '#eff6ff', chart: '#3b82f6', chartSecondary: '#0ea5e9' },
  'Usuario / Identidad': { primary: '#0d9488', light: '#f0fdfa', chart: '#14b8a6', chartSecondary: '#2dd4bf' },
  Operaciones: { primary: '#ea580c', light: '#fff7ed', chart: '#f97316', chartSecondary: '#fb923c' },
  Red: { primary: '#7e22ce', light: '#faf5ff', chart: '#a855f7', chartSecondary: '#06b6d4' },
}

function KpiCard({ kpi, accentColor }: { kpi: KpiCardData; accentColor: string }) {
  const arr = kpi.sparkline
  const maxSpark = Math.max(...arr, 1)
  const len = arr.length
  const points = arr.map((v, i) => ({ x: (i / Math.max(len - 1, 1)) * 100, y: 100 - (v / maxSpark) * 85 }))
  const sparkPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const tooltipText = [kpi.label, kpi.microcopy].filter(Boolean).join(' · ')
  return (
    <div
      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
      title={tooltipText}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{kpi.label}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold text-gray-900 tabular-nums">{kpi.value}</span>
        <span
          className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
            kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : kpi.trend === 'down' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {kpi.trend === 'up' && <TrendingUp className="h-3 w-3" />}
          {kpi.trend === 'down' && <TrendingDown className="h-3 w-3" />}
          {kpi.trend === 'neutral' && <Minus className="h-3 w-3" />}
          {typeof kpi.delta === 'number' && (kpi.delta > 0 ? '+' : '')}
          {kpi.delta}
          {typeof kpi.delta === 'number' && (kpi.label.includes('%') || kpi.microcopy?.includes('pp') ? ' pp' : '%')}
        </span>
      </div>
      {kpi.microcopy && <p className="mt-0.5 text-xs text-gray-500">{kpi.microcopy}</p>}
      <div className="mt-3 h-9 w-full" title={tooltipText}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
          <path
            d={sparkPath}
            fill="none"
            stroke={accentColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.9}
          />
        </svg>
      </div>
    </div>
  )
}

function InsightsPanel({
  insights,
  accentColor,
  periodLabel,
}: {
  insights: { id: string; text: string; trend?: TrendDirection }[]
  accentColor: string
  periodLabel: string
}) {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">Insights automáticos</h3>
      <p className="mt-0.5 text-xs text-gray-500">{periodLabel} · vs. período anterior</p>
      <ul className="mt-3 space-y-2">
        {insights.map((i) => (
          <li key={i.id} className="flex items-start gap-2 text-sm">
            <span
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{
                background: i.trend === 'up' ? '#10b981' : i.trend === 'down' ? '#ef4444' : accentColor,
              }}
            />
            <span className="text-gray-700">{i.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChartTooltipContent({
  label,
  payload,
  formatter,
}: {
  label?: string | number
  payload?: readonly { value?: unknown }[]
  formatter?: (v: unknown) => string
}) {
  if (!payload?.length) return null
  const v = payload[0]?.value
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      {label != null && <p className="text-xs text-gray-500">{String(label)}</p>}
      <p className="font-semibold text-gray-900">{formatter ? formatter(v) : String(v ?? '')}</p>
    </div>
  )
}

export function MetricsPage() {
  const [tab, setTab] = useState<TabId>('Attack')
  const [dateRangeDays, setDateRangeDays] = useState<7 | 14 | 30>(14)
  const palette = TAB_PALETTE[tab]
  const kpis = METRICS_KPIS[tab] ?? []
  const insights = METRICS_INSIGHTS[tab] ?? []
  const periodLabel = DATE_RANGE_OPTIONS.find((o) => o.value === dateRangeDays)?.label ?? 'Últimos 14 días'

  /** Recorta las series temporales al número de días seleccionado (los datos mock tienen 14 puntos). */
  const sliceSeries = <T extends { date: string; value?: number }>(data: T[]): T[] =>
    data.slice(-dateRangeDays)

  return (
    <>
      <PageHeader
        title="Métricas"
        description="Métricas de Protección de Cuenta: ataque, autenticación, identidad, operaciones y red."
        breadcrumbs={[
          { label: 'Antifraude', href: ROUTES.antifraude.overview },
          { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta },
          { label: 'Métricas', href: ROUTES.antifraude.proteccionCuentaMetricas },
        ]}
        actions={
          <>
            <Link
              to={ROUTES.antifraude.proteccionCuentaEventos}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Ver eventos
            </Link>
            <button
              type="button"
              title={`Exportar métricas · ${periodLabel}`}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Exportar (mock)
            </button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-600">Período:</label>
        <select
          value={dateRangeDays}
          onChange={(e) => setDateRangeDays(Number(e.target.value) as 7 | 14 | 30)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          {DATE_RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-t-lg border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
              style={tab === t ? { borderBottomColor: palette.primary } : undefined}
            >
              {t}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6 space-y-6">
        {/* Fila 1: KPI cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} kpi={kpi} accentColor={palette.primary} />
          ))}
        </section>

        {/* Fila 2: Hero chart + Insights */}
        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-h-[320px] rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
            {tab === 'Attack' && (
              <>
                <h3 className="text-base font-semibold text-gray-900">Volumen de eventos y riesgo alto</h3>
                <p className="mt-0.5 text-xs text-gray-500">{periodLabel} · comparativa</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sliceSeries(MOCK_METRICS.attack.totalAtoEvents.data)}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="heroAttack" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={palette.chart} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={palette.chart} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e5e7eb' }}
                      />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} width={32} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} width={32} />
                      <Tooltip
                        content={<ChartTooltipContent formatter={(v: unknown) => (typeof v === 'number' ? v.toLocaleString() : String(v ?? ''))} />}
                        labelFormatter={(v) => format(parseISO(v), 'd MMM yyyy', { locale: es })}
                      />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="value"
                        stroke={palette.chart}
                        strokeWidth={1.8}
                        fill="url(#heroAttack)"
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="value"
                        data={sliceSeries(MOCK_METRICS.attack.highRiskRate.data)}
                        stroke={palette.chartSecondary}
                        strokeWidth={1.8}
                        dot={false}
                        name="High risk %"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-4 rounded-sm" style={{ background: palette.chart }} />
                    Total eventos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-4" style={{ background: palette.chartSecondary, borderTop: `2px solid ${palette.chartSecondary}` }} />
                    High risk %
                  </span>
                </div>
              </>
            )}
            {tab === 'Autenticación' && (
              <>
                <h3 className="text-base font-semibold text-gray-900">Challenge rate y success rate MFA</h3>
                <p className="mt-0.5 text-xs text-gray-500">{periodLabel}</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sliceSeries(MOCK_METRICS.authentication.mfaChallengeRate.data).map((d, i) => ({
                        ...d,
                        success: sliceSeries(MOCK_METRICS.authentication.mfaSuccessRate.data)[i]?.value,
                      }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={36} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
                      <Tooltip
                        content={({ payload, label }) => (
                          <ChartTooltipContent
                            label={label != null ? format(parseISO(String(label)), 'd MMM', { locale: es }) : undefined}
                            payload={payload}
                            formatter={(v) => `${v}%`}
                          />
                        )}
                      />
                      <Line type="monotone" dataKey="value" stroke={palette.chart} strokeWidth={1.8} dot={false} name="Challenge rate %" />
                      <Line type="monotone" dataKey="success" stroke={palette.chartSecondary} strokeWidth={1.8} dot={false} name="Success rate %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            {tab === 'Usuario / Identidad' && (
              <>
                <h3 className="text-base font-semibold text-gray-900">Usuarios por estado</h3>
                <p className="mt-0.5 text-xs text-gray-500">Evolución bloqueados, trusted y under review</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sliceSeries(MOCK_METRICS.userIdentity.blockedUsers.data).map((d, i) => ({
                        date: d.date,
                        blocked: d.value,
                        underReview: sliceSeries(MOCK_METRICS.userIdentity.usersUnderReview.data)[i]?.value ?? 0,
                        trusted: Math.round((sliceSeries(MOCK_METRICS.userIdentity.trustedUsers.data)[i]?.value ?? 0) / 100),
                      }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={36} />
                      <Tooltip labelFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} />
                      <Area type="monotone" dataKey="trusted" stackId="1" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} name="Trusted (÷100)" />
                      <Area type="monotone" dataKey="underReview" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} name="Under review" />
                      <Area type="monotone" dataKey="blocked" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} name="Blocked" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            {tab === 'Operaciones' && (
              <>
                <h3 className="text-base font-semibold text-gray-900">Alertas y cola de revisión</h3>
                <p className="mt-0.5 text-xs text-gray-500">{periodLabel}</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sliceSeries(MOCK_METRICS.operations.alertsGenerated.data).map((d, i) => ({
                        ...d,
                        queue: sliceSeries(MOCK_METRICS.operations.analystReviewQueue.data)[i]?.value,
                      }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={36} />
                      <Tooltip labelFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} />
                      <Line type="monotone" dataKey="value" stroke={palette.chart} strokeWidth={1.8} dot={false} name="Alertas" />
                      <Line type="monotone" dataKey="queue" stroke={palette.chartSecondary} strokeWidth={1.8} dot={false} name="Cola revisión" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            {tab === 'Red' && (
              <>
                <h3 className="text-base font-semibold text-gray-900">Crecimiento de clusters e identidad compartida</h3>
                <p className="mt-0.5 text-xs text-gray-500">{periodLabel}</p>
                <div className="mt-4 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sliceSeries(MOCK_METRICS.network.clusterGrowth.data).map((d, i) => ({
                        ...d,
                        shared: sliceSeries(MOCK_METRICS.network.crossUserSharedIdentityRate.data)[i]?.value,
                      }))}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })}
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                      />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#6b7280' }} width={36} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} width={36} tickFormatter={(v) => `${v}%`} />
                      <Tooltip labelFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} />
                      <Line yAxisId="left" type="monotone" dataKey="value" stroke={palette.chart} strokeWidth={1.8} dot={false} name="Cluster growth" />
                      <Line yAxisId="right" type="monotone" dataKey="shared" stroke={palette.chartSecondary} strokeWidth={1.8} dot={false} name="Shared identity %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
          <InsightsPanel insights={insights} accentColor={palette.primary} periodLabel={periodLabel} />
        </section>

        {/* Fila 3: Dos visualizaciones secundarias */}
        <section className="grid gap-6 lg:grid-cols-2">
          {tab === 'Attack' && (
            <>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Breakdown por tipo de evento</h3>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_METRICS.attack.eventTypeBreakdown} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? v.toLocaleString() : String(v ?? ''))} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="#8b5cf6" name="Eventos" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Severidad / Decisión</h3>
                <div className="mt-3 flex gap-6">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Por severidad</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={MOCK_METRICS.attack.severitySplit} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={2}>
                          {MOCK_METRICS.attack.severitySplit.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? v : String(v ?? ''))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Por decisión</p>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={MOCK_METRICS.attack.decisionSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={2}>
                          {MOCK_METRICS.attack.decisionSplit.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? `${v}%` : String(v ?? ''))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}
          {tab === 'Autenticación' && (
            <>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Adopción Passkey</h3>
                <p className="mt-0.5 text-xs text-gray-500">% de eventos con passkey</p>
                <div className="mt-4 flex items-center justify-center">
                  <div className="relative inline-flex items-center justify-center">
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Passkey', value: MOCK_METRICS.authentication.passkeyAdoption.data[MOCK_METRICS.authentication.passkeyAdoption.data.length - 1]?.value ?? 35, fill: palette.chart },
                            { name: 'Otros', value: 100 - (MOCK_METRICS.authentication.passkeyAdoption.data[MOCK_METRICS.authentication.passkeyAdoption.data.length - 1]?.value ?? 35), fill: '#e5e7eb' },
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <Cell fill={palette.chart} />
                          <Cell fill="#e5e7eb" />
                        </Pie>
                        <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? `${v}%` : String(v ?? ''))} />
                      </PieChart>
                    </ResponsiveContainer>
                    <span className="absolute text-2xl font-semibold text-gray-900">
                      {MOCK_METRICS.authentication.passkeyAdoption.data[MOCK_METRICS.authentication.passkeyAdoption.data.length - 1]?.value ?? 35}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Mix de métodos de autenticación</h3>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_METRICS.authentication.authMethodMix} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={36} />
                      <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? `${v}%` : String(v ?? ''))} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {MOCK_METRICS.authentication.authMethodMix.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
          {tab === 'Usuario / Identidad' && (
            <>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Identidades vinculadas por usuario</h3>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sliceSeries(MOCK_METRICS.userIdentity.linkedIdentitiesPerUser.data)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} width={36} domain={['auto', 'auto']} />
                      <Tooltip labelFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} formatter={(v: unknown) => (typeof v === 'number' ? v.toFixed(1) : String(v ?? ''))} />
                      <Line type="monotone" dataKey="value" stroke={palette.chart} strokeWidth={1.8} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Distribución por estado</h3>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={MOCK_METRICS.userIdentity.usersByStatus}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {MOCK_METRICS.userIdentity.usersByStatus.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? v.toLocaleString() : String(v ?? ''))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
          {tab === 'Operaciones' && (
            <>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Tiempo promedio a decisión</h3>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sliceSeries(MOCK_METRICS.operations.avgTimeToDecision.data)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="opsTime" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={palette.chart} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={palette.chart} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="date" tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} width={36} tickFormatter={(v) => `${v} min`} />
                      <Tooltip labelFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} formatter={(v: unknown) => (typeof v === 'number' ? `${v} min` : String(v ?? ''))} />
                      <Area type="monotone" dataKey="value" stroke={palette.chart} strokeWidth={1.8} fill="url(#opsTime)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Top señales disparadas</h3>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_METRICS.operations.topTriggeredSignals} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]} fill={palette.chart} name="Cantidad" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
          {tab === 'Red' && (
            <>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Dispositivos más conectados</h3>
                <div className="mt-3 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_METRICS.network.mostConnectedDevices} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 11 }} width={36} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]} fill={palette.chart} name="Conexiones" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Entidades compartidas</h3>
                <p className="mt-0.5 text-xs text-gray-500">Phones y documentos más compartidos</p>
                <div className="mt-3 flex flex-col gap-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500">Phones</p>
                    {MOCK_METRICS.network.mostSharedPhones.map((p) => (
                      <div key={p.id} className="mt-1 flex items-center justify-between text-sm">
                        <span className="font-mono text-gray-700">{p.id}</span>
                        <span className="text-gray-600">{p.users} usuarios · {p.events} eventos</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Documents</p>
                    {MOCK_METRICS.network.mostSharedDocuments.map((d) => (
                      <div key={d.id} className="mt-1 flex items-center justify-between text-sm">
                        <span className="font-mono text-gray-700">{d.id}</span>
                        <span className="text-gray-600">{d.users} usuarios · {d.events} eventos</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Fila 4: Tabla / ranking */}
        <section>
          {tab === 'Attack' && (
            <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">Dispositivos más riesgosos</h3>
              <p className="mt-0.5 text-xs text-gray-500">Por eventos y risk score</p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-gray-600">Device ID</th>
                    <th className="pb-3 font-medium text-gray-600">Eventos</th>
                    <th className="pb-3 font-medium text-gray-600">Risk score</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_METRICS.attack.topRiskyDevices.map((d) => (
                    <tr key={d.id} className="border-b border-gray-100">
                      <td className="py-3 font-mono text-gray-900">{d.id}</td>
                      <td className="py-3 text-gray-600">{d.events}</td>
                      <td className="py-3 font-semibold text-red-600">{d.riskScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'Usuario / Identidad' && (
            <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">Usuarios más sospechosos</h3>
              <p className="mt-0.5 text-xs text-gray-500">Por eventos y risk score</p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-gray-600">User ID</th>
                    <th className="pb-3 font-medium text-gray-600">Eventos</th>
                    <th className="pb-3 font-medium text-gray-600">Risk score</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_METRICS.userIdentity.topSuspiciousUsers.map((u) => (
                    <tr key={u.userId} className="border-b border-gray-100">
                      <td className="py-3">
                        <Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${u.userId}`} className="font-mono text-koin-green hover:underline">
                          {u.userId}
                        </Link>
                      </td>
                      <td className="py-3 text-gray-600">{u.events}</td>
                      <td className="py-3 font-semibold text-red-600">{u.riskScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'Operaciones' && (
            <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">Top señales disparadas</h3>
              <p className="mt-0.5 text-xs text-gray-500">Volumen en el período</p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-gray-600">Señal</th>
                    <th className="pb-3 font-medium text-gray-600">Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_METRICS.operations.topTriggeredSignals.map((s) => (
                    <tr key={s.name} className="border-b border-gray-100">
                      <td className="py-3 font-mono text-gray-900">{s.name}</td>
                      <td className="py-3 text-gray-600">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === 'Red' && (
            <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-gray-900">Dispositivos más conectados</h3>
              <p className="mt-0.5 text-xs text-gray-500">Risk score y conexiones</p>
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 font-medium text-gray-600">Device ID</th>
                    <th className="pb-3 font-medium text-gray-600">Conexiones</th>
                    <th className="pb-3 font-medium text-gray-600">Risk score</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_METRICS.network.mostConnectedDevices.map((d) => (
                    <tr key={d.id} className="border-b border-gray-100">
                      <td className="py-3 font-mono text-gray-900">{d.id}</td>
                      <td className="py-3 text-gray-600">{d.count}</td>
                      <td className="py-3 font-semibold text-red-600">{d.riskScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 flex justify-end">
                <Link
                  to={ROUTES.antifraude.proteccionCuentaRed}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:opacity-95"
                  style={{ background: palette.primary }}
                >
                  Abrir vista Red
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
