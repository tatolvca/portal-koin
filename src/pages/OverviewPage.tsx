import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { ROUTES } from '@/config/routes'
import { PageHeader } from '@/components/portal/PageHeader'
import { Badge } from '@/components/portal/Badge'
import { SectionHeader } from '@/components/portal/SectionHeader'
import {
  mockDashboardKpis,
  mockInsights,
  mockEvents,
  mockUsers,
  getHighRiskEvents,
  getUsersUnderWatch,
  getTopReusedDevicesOverview,
  getTopTriggeredSignalsOverview,
} from '@/mocks'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

const ACCENT = { primary: '#0d9488', light: '#f0fdfa', chart: '#14b8a6', chartSecondary: '#f59e0b' }

function aggregateEventsByDay(events: typeof mockEvents) {
  const byDay: Record<string, { count: number; highRisk: number }> = {}
  events.forEach((e) => {
    const day = e.timestamp.slice(0, 10)
    if (!byDay[day]) byDay[day] = { count: 0, highRisk: 0 }
    byDay[day].count += 1
    if (e.riskScore >= 65) byDay[day].highRisk += 1
  })
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date, ...v }))
}

function aggregateByEventType(events: typeof mockEvents) {
  const byType: Record<string, number> = {}
  events.forEach((e) => { byType[e.eventType] = (byType[e.eventType] ?? 0) + 1 })
  return Object.entries(byType)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
}

type Trend = 'up' | 'down' | 'neutral'

function OverviewKpiCard({
  label,
  value,
  delta,
  trend,
  sparkline,
  microcopy,
}: {
  label: string
  value: string | number
  delta?: number
  trend?: Trend
  sparkline: number[]
  microcopy?: string
}) {
  const maxSpark = Math.max(...sparkline, 1)
  const sparkPath = sparkline
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / Math.max(sparkline.length - 1, 1)) * 100} ${100 - (v / maxSpark) * 80}`)
    .join(' ')
  const t = trend ?? (delta != null ? (delta >= 0 ? 'up' : 'down') : 'neutral')
  return (
    <div
      className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderLeftWidth: 3, borderLeftColor: ACCENT.primary }}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-semibold text-gray-900 tabular-nums">{value}</span>
        {delta != null && (
          <span
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              t === 'up' ? 'bg-emerald-50 text-emerald-700' : t === 'down' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {t === 'up' && <TrendingUp className="h-3 w-3" />}
            {t === 'down' && <TrendingDown className="h-3 w-3" />}
            {t === 'neutral' && <Minus className="h-3 w-3" />}
            {delta > 0 ? '+' : ''}{delta}%
          </span>
        )}
      </div>
      {microcopy && <p className="mt-0.5 text-xs text-gray-500">{microcopy}</p>}
      <div className="mt-3 h-8 w-full">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
          <path
            d={sparkPath}
            fill="none"
            stroke={ACCENT.primary}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  )
}

export function OverviewPage() {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d')
  const kpis = mockDashboardKpis
  const highRiskEvents = getHighRiskEvents(mockEvents, 10)
  const usersUnderWatch = getUsersUnderWatch(mockUsers, 10)
  const eventsByDay = aggregateEventsByDay(mockEvents)
  const eventsByType = aggregateByEventType(mockEvents)
  const topDevices = getTopReusedDevicesOverview(8)
  const topSignals = getTopTriggeredSignalsOverview(8)

  const kpiConfig = [
    { label: 'Total eventos', value: kpis.totalEvents, delta: kpis.totalEventsDelta, trend: 'up' as Trend, sparkline: eventsByDay.map((d) => d.count), microcopy: 'vs período anterior' },
    { label: 'Tasa alto riesgo %', value: kpis.highRiskRate.toFixed(1), delta: kpis.highRiskRateDelta, trend: (kpis.highRiskRateDelta >= 0 ? 'up' : 'down') as Trend, sparkline: eventsByDay.map((d) => d.count ? (d.highRisk / d.count) * 100 : 0), microcopy: 'eventos con score ≥ 65' },
    { label: 'Tasa bloqueo %', value: kpis.blockedRate.toFixed(1), delta: kpis.blockedRateDelta, trend: 'neutral' as Trend, sparkline: eventsByDay.length ? eventsByDay.map(() => kpis.blockedRate) : [kpis.blockedRate], microcopy: 'decisión BLOCK' },
    { label: 'Tasa challenge %', value: kpis.challengeRate.toFixed(1), delta: kpis.challengeRateDelta, trend: 'up' as Trend, sparkline: eventsByDay.length ? eventsByDay.map(() => kpis.challengeRate) : [kpis.challengeRate] },
    { label: 'Usuarios bloqueados', value: kpis.blockedUsersCount ?? 0, sparkline: [kpis.blockedUsersCount ?? 0], trend: 'neutral' as Trend },
    { label: 'MFA challenge %', value: (kpis.mfaChallengeRate ?? 0).toFixed(1), sparkline: eventsByDay.length ? eventsByDay.map(() => kpis.mfaChallengeRate ?? 0) : [kpis.mfaChallengeRate ?? 0], trend: 'neutral' as Trend },
    { label: 'MFA success %', value: (kpis.mfaSuccessRate ?? 0).toFixed(1), sparkline: eventsByDay.length ? eventsByDay.map(() => kpis.mfaSuccessRate ?? 0) : [kpis.mfaSuccessRate ?? 0], trend: 'neutral' as Trend },
    { label: 'Passkey adoption %', value: (kpis.passkeyAdoptionRate ?? 0).toFixed(1), sparkline: eventsByDay.length ? eventsByDay.map((_, i) => (kpis.passkeyAdoptionRate ?? 0) + i * 0.5) : [kpis.passkeyAdoptionRate ?? 0], trend: 'up' as Trend },
    { label: 'Device reuse %', value: (kpis.reusedDeviceRate ?? 0).toFixed(1), sparkline: eventsByDay.map(() => kpis.reusedDeviceRate ?? 0), trend: 'neutral' as Trend },
    { label: 'En observación', value: kpis.usersUnderWatch, delta: kpis.usersUnderWatchDelta, trend: (kpis.usersUnderWatchDelta != null && kpis.usersUnderWatchDelta < 0 ? 'down' : 'up') as Trend, sparkline: eventsByDay.length ? eventsByDay.map((_, i) => Math.max(0, (kpis.usersUnderWatch ?? 0) - i * 2)) : [kpis.usersUnderWatch], microcopy: 'usuarios bajo revisión' },
    { label: 'Usuarios únicos', value: kpis.uniqueUsersAffected, delta: kpis.uniqueUsersAffectedDelta, trend: 'up' as Trend, sparkline: eventsByDay.map((d) => d.count).slice(-7), microcopy: 'afectados por eventos' },
    { label: 'Clusters sospechosos', value: kpis.suspiciousClustersCount ?? 0, sparkline: [kpis.suspiciousClustersCount ?? 0, (kpis.suspiciousClustersCount ?? 0) - 1, kpis.suspiciousClustersCount ?? 0], trend: 'neutral' as Trend },
  ]

  return (
    <>
      <PageHeader
        title="Protección de Cuenta"
        description="Evento = lo que ocurrió ahora. Usuario = identidad en el tiempo. Red = cómo se conectan."
        breadcrumbs={[{ label: 'Antifraude', href: ROUTES.antifraude.overview }, { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta }]}
        actions={
          <>
            <Link to={ROUTES.antifraude.proteccionCuentaEventos} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Ver eventos
            </Link>
            <Link to={ROUTES.antifraude.proteccionCuentaMetricas} className="rounded-lg bg-koin-header px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
              Métricas
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200/80 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-medium text-gray-700">Período:</span>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as '24h' | '7d' | '30d')}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300"
        >
          <option value="24h">Últimas 24h</option>
          <option value="7d">Últimos 7 días</option>
          <option value="30d">Últimos 30 días</option>
        </select>
        <span className="border-l border-gray-200 pl-3 text-sm text-gray-500">Filtros:</span>
        <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
          <option>Todos los merchants</option>
        </select>
        <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
          <option>Todos los tipos</option>
        </select>
        <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm">
          <option>Todas las severidades</option>
        </select>
      </div>

      {/* Fila 1: KPI cards */}
      <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {kpiConfig.map((k) => (
          <OverviewKpiCard
            key={k.label}
            label={k.label}
            value={k.value}
            delta={k.delta}
            trend={k.trend}
            sparkline={k.sparkline}
            microcopy={k.microcopy}
          />
        ))}
      </section>

      {/* Fila 2: Hero chart + Insights */}
      <section className="mb-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-h-[320px] rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">Eventos en el tiempo</h3>
          <p className="mt-0.5 text-xs text-gray-500">Volumen total y eventos de alto riesgo (score ≥ 65)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={eventsByDay} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="overviewFillCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT.chart} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={ACCENT.chart} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="overviewFillHighRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={ACCENT.chartSecondary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={ACCENT.chartSecondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="date" tickFormatter={(v) => format(parseISO(v), 'd MMM', { locale: es })} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={36} />
                <Tooltip labelFormatter={(v) => format(parseISO(v), 'd MMM yyyy', { locale: es })} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" name="Eventos" stroke={ACCENT.chart} fill="url(#overviewFillCount)" strokeWidth={2} />
                <Area type="monotone" dataKey="highRisk" name="Alto riesgo" stroke={ACCENT.chartSecondary} fill="url(#overviewFillHighRisk)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm" style={{ background: ACCENT.chart }} /> Total</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-sm" style={{ background: ACCENT.chartSecondary }} /> Alto riesgo</span>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Insights automáticos</h3>
          <p className="mt-0.5 text-xs text-gray-500">Alertas y tendencias recientes</p>
          <ul className="mt-3 space-y-2">
            {mockInsights.slice(0, 4).map((ins) => (
              <li key={ins.id} className="flex items-start gap-2 text-sm">
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: ins.severity === 'critical' ? '#ef4444' : ins.severity === 'high' ? '#f59e0b' : ACCENT.primary }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900">{ins.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{ins.description}</p>
                  {ins.link && (
                    <Link to={ins.link} className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-koin-green hover:underline">
                      Ver <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Fila 3: Dos visualizaciones secundarias */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Distribución por tipo de evento</h3>
          <p className="mt-0.5 text-xs text-gray-500">Volumen por tipo en el período</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsByType} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="type" width={90} tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Bar dataKey="count" name="Eventos" fill={ACCENT.chart} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Top dispositivos reutilizados</h3>
          <p className="mt-0.5 text-xs text-gray-500">Mismo device en varios usuarios o muchos eventos</p>
          <div className="mt-3 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDevices} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis type="category" dataKey="deviceId" width={100} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip formatter={(v: unknown) => (typeof v === 'number' ? v : Number(v))} />
                <Bar dataKey="eventCount" name="Eventos" fill={ACCENT.chart} radius={[0, 4, 4, 0]} />
                <Bar dataKey="userCount" name="Usuarios" fill={ACCENT.chartSecondary} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-end">
            <Link to={ROUTES.antifraude.proteccionCuentaRed} className="text-sm font-medium text-koin-green hover:underline">
              Ver en red
            </Link>
          </div>
        </div>
      </section>

      {/* Fila 4: Tablas Top dispositivos + Top señales */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-200/80 px-5 py-4">
            <SectionHeader title="Top dispositivos reutilizados" description="Mismo device en varios usuarios" action={<Link to={ROUTES.antifraude.proteccionCuentaRed} className="text-sm font-medium text-koin-green hover:text-koin-green-hover">Ver en red</Link>} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Dispositivo</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Eventos</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Usuarios</th>
                </tr>
              </thead>
              <tbody>
                {topDevices.map((d) => (
                  <tr key={d.deviceId} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-3 font-mono text-gray-900">{d.deviceId}</td>
                    <td className="px-5 py-3 text-gray-600">{d.eventCount}</td>
                    <td className="px-5 py-3 text-gray-600">{d.userCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-200/80 px-5 py-4">
            <SectionHeader title="Top señales disparadas" description="Razones de riesgo más frecuentes" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Señal</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Veces</th>
                </tr>
              </thead>
              <tbody>
                {topSignals.map((s) => (
                  <tr key={s.signalCode} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-gray-900">{s.signalName}</td>
                    <td className="px-5 py-3 text-gray-600">{s.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Fila 5: Eventos alto riesgo + Usuarios observación */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-200/80 px-5 py-4">
            <SectionHeader title="Eventos de alto riesgo" description="Score ≥ 65" action={<Link to={`${ROUTES.antifraude.proteccionCuentaEventos}?risk=high`} className="text-sm font-medium text-koin-green hover:text-koin-green-hover">Ver todos</Link>} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Evento</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Tipo</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Score</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Decisión</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {highRiskEvents.map((e) => (
                  <tr key={e.eventId} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-3"><Link to={`${ROUTES.antifraude.proteccionCuentaEventos}/${e.eventId}`} className="font-medium text-koin-green hover:underline">{e.eventId}</Link></td>
                    <td className="px-5 py-3 text-gray-600">{e.eventType}</td>
                    <td className="px-5 py-3"><Badge variant="severity" severity={e.severity}>{e.riskScore}</Badge></td>
                    <td className="px-5 py-3"><Badge variant="decision" decision={e.finalDecision}>{e.finalDecision}</Badge></td>
                    <td className="px-5 py-3 text-gray-500">{format(new Date(e.timestamp), 'd MMM HH:mm', { locale: es })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm">
          <div className="border-b border-gray-200/80 px-5 py-4">
            <SectionHeader title="Usuarios en observación" action={<Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}?watch=1`} className="text-sm font-medium text-koin-green hover:text-koin-green-hover">Ver todos</Link>} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Usuario</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Email</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Estado</th>
                  <th className="px-5 py-3 text-left font-medium text-gray-600">Riesgo</th>
                </tr>
              </thead>
              <tbody>
                {usersUnderWatch.map((u) => (
                  <tr key={u.userId} className="border-b border-gray-100 transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-3"><Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${u.userId}`} className="font-medium text-koin-green hover:underline">{u.userId}</Link></td>
                    <td className="px-5 py-3 text-gray-600">{u.email}</td>
                    <td className="px-5 py-3"><Badge variant="status" status={u.currentStatus}>{u.currentStatus}</Badge></td>
                    <td className="px-5 py-3"><Badge variant="risk" riskLevel={u.riskLevel}>{u.riskLevel}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
