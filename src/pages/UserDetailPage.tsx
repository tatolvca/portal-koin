import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { Badge } from '@/components/portal/Badge'
import { SectionHeader } from '@/components/portal/SectionHeader'
import { PageHeader } from '@/components/portal/PageHeader'
import { getUserById, getEventsByUserId, mockUsers, mockEvents } from '@/mocks'
import { format } from 'date-fns'
import es from 'date-fns/locale/es'

const TABS = ['Resumen', 'Dispositivos', 'Auth', 'Eventos', 'Notas'] as const

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [tab, setTab] = useState<(typeof TABS)[number]>('Resumen')
  const user = id ? getUserById(mockUsers, id) : undefined
  if (!user) return <div className="p-6">Usuario no encontrado.</div>

  const relatedEvents = getEventsByUserId(mockEvents, user.userId)
  const breadcrumbs = [{ label: 'Antifraude', href: ROUTES.antifraude.overview }, { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta }, { label: 'Usuarios', href: ROUTES.antifraude.proteccionCuentaUsuarios }, { label: user.userId }]

  return (
    <>
      <PageHeader title={user.userId} description={user.email ?? 'Sin email'} breadcrumbs={breadcrumbs} actions={<><Link to={ROUTES.antifraude.proteccionCuentaEventos} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Ver eventos</Link><Link to={ROUTES.antifraude.proteccionCuentaRed} className="rounded-lg bg-koin-header px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">Ver en red</Link></>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-untitled-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Identidad</p>
          <p className="mt-1 font-medium text-gray-900">{user.email ?? '—'}</p>
          <p className="text-sm text-gray-600">{user.phone ?? '—'}</p>
        </div>
        <div className="rounded-untitled-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Estado · Trust · Riesgo</p>
          <div className="mt-2 flex flex-wrap gap-2"><Badge variant="status" status={user.currentStatus}>{user.currentStatus}</Badge><span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">Trust: {user.trustLevel}</span><Badge variant="risk" riskLevel={user.riskLevel}>{user.riskLevel}</Badge></div>
        </div>
        <div className="rounded-untitled-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Actividad</p>
          <p className="mt-1 text-sm text-gray-700">{user.totalEvents} eventos · First: {format(new Date(user.firstSeen), 'd MMM yyyy', { locale: es })}</p>
        </div>
        <div className="rounded-untitled-xl border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Seguridad</p>
          <p className="mt-1 text-sm text-gray-700">MFA: {user.mfaAdoption ? 'Sí' : 'No'} · Passkey: {user.passkeyAdoption ? 'Sí' : 'No'}</p>
        </div>
      </div>
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`border-b-2 py-3 text-sm font-medium ${tab === t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>{t}</button>
          ))}
        </nav>
      </div>
      {tab === 'Resumen' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4">
            <SectionHeader title="Dispositivos" description={`${user.devicesCount} dispositivos, ${user.trustedDevicesCount} confiables`} />
            <ul className="mt-3 space-y-2">
              {user.devices.slice(0, 5).map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="font-mono text-sm">{d.id.slice(0, 20)}...</span>
                  <Badge variant="neutral">{d.isTrusted ? 'Confiado' : 'No confiado'}</Badge>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4">
            <SectionHeader title="Tarjetas y cuentas" />
            <p className="mt-2 text-sm text-gray-600">{user.cardsCount} tarjetas · {user.bankAccountsCount} cuentas bancarias</p>
          </section>
        </div>
      )}
      {tab === 'Eventos' && (
        <div className="rounded-untitled-xl border border-gray-200 bg-white p-4">
          <SectionHeader title="Eventos relacionados" description={`${relatedEvents.length} eventos`} />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 font-medium text-gray-700">Evento</th>
                  <th className="py-2 font-medium text-gray-700">Tipo</th>
                  <th className="py-2 font-medium text-gray-700">Score</th>
                  <th className="py-2 font-medium text-gray-700">Decisión</th>
                  <th className="py-2 font-medium text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {relatedEvents.slice(0, 20).map((e) => (
                  <tr key={e.eventId} className="border-b border-gray-100">
                    <td className="py-2"><Link to={`${ROUTES.antifraude.proteccionCuentaEventos}/${e.eventId}`} className="text-koin-green hover:underline">{e.eventId}</Link></td>
                    <td className="py-2 text-gray-600">{e.eventType}</td>
                    <td className="py-2"><Badge variant="severity" severity={e.severity}>{e.riskScore}</Badge></td>
                    <td className="py-2"><Badge variant="decision" decision={e.finalDecision}>{e.finalDecision}</Badge></td>
                    <td className="py-2 text-gray-600">{format(new Date(e.timestamp), 'd MMM HH:mm', { locale: es })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === 'Notas' && (
        <div className="rounded-untitled-xl border border-gray-200 bg-white p-4">
          <SectionHeader title="Notas / Auditoría" />
          {user.notes?.length ? (
            <ul className="mt-3 space-y-2">
              {user.notes.map((n, i) => (
                <li key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
                  <span className="text-gray-500">{format(new Date(n.at), 'd MMM HH:mm', { locale: es })} · {n.by}</span>
                  <p className="mt-1 text-gray-900">{n.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Sin notas.</p>
          )}
        </div>
      )}
      {(tab === 'Dispositivos' || tab === 'Auth') && (
        <div className="rounded-untitled-xl border border-gray-200 bg-white p-4">
          {tab === 'Dispositivos' && <SectionHeader title="Dispositivos" />}
          {tab === 'Auth' && <SectionHeader title="Historial de autenticación" />}
          <ul className="mt-3 space-y-2">
            {tab === 'Dispositivos' && user.devices.map((d) => (
              <li key={d.id} className="rounded-lg border border-gray-100 p-3 text-sm">{d.id} · {d.isTrusted ? 'Confiado' : 'No confiado'}</li>
            ))}
            {tab === 'Auth' && user.authHistory.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span>{a.method} · {format(new Date(a.timestamp), 'd MMM HH:mm', { locale: es })}</span>
                <Badge variant={a.success ? 'decision' : 'severity'} decision={a.success ? 'ALLOW' : undefined} severity={a.success ? undefined : 'high'}>{a.success ? 'OK' : 'Fallido'}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
