import { useParams, Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { Badge } from '@/components/portal/Badge'
import { SectionHeader } from '@/components/portal/SectionHeader'
import { PageHeader } from '@/components/portal/PageHeader'
import { getEventById, getUserById, getEventsByUserId, mockEvents, mockUsers } from '@/mocks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Clock, User, GitBranch } from 'lucide-react'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const event = id ? getEventById(mockEvents, id) : undefined
  if (!event) return <div className="p-6">Evento no encontrado.</div>

  const user = getUserById(mockUsers, event.userId)
  const sameUserEvents = getEventsByUserId(mockEvents, event.userId).filter((e) => e.eventId !== event.eventId).slice(0, 5)
  const sameDeviceEvents = mockEvents.filter((e) => e.deviceId === event.deviceId && e.eventId !== event.eventId).slice(0, 5)

  const breadcrumbs = [
    { label: 'Antifraude', href: ROUTES.antifraude.overview },
    { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta },
    { label: 'Eventos', href: ROUTES.antifraude.proteccionCuentaEventos },
    { label: event.eventId },
  ]

  const journeySteps = [
    { label: 'Evento iniciado', at: event.timestamp, type: 'start' },
    ...(event.finalDecision === 'CHALLENGE' ? [{ label: 'Riesgo evaluado · MFA desafiado', at: event.timestamp, type: 'challenge' as const }] : []),
    ...(event.mfaStatus === 'failed' ? [{ label: 'MFA fallido', at: event.timestamp, type: 'mfa_fail' as const }] : []),
    ...(event.mfaStatus === 'passed' ? [{ label: 'MFA pasado', at: event.timestamp, type: 'mfa_ok' as const }] : []),
    { label: `Decisión: ${event.finalDecision}`, at: event.timestamp, type: 'decision' as const },
  ]

  return (
    <>
      <PageHeader
        title={event.eventId}
        description={`${event.eventType} · ${event.merchant}`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${event.userId}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <User className="h-4 w-4" /> Ver usuario
            </Link>
            <Link to={ROUTES.antifraude.proteccionCuentaRed} className="inline-flex items-center gap-2 rounded-lg bg-koin-header px-3 py-2 text-sm font-medium text-white hover:bg-gray-800">
              <GitBranch className="h-4 w-4" /> Abrir en red
            </Link>
            <button type="button" className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Marcar para revisión</button>
            <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-100">Bloquear usuario</button>
          </div>
        }
      />

      {/* Header resumen: tipo, score, decisión, severidad, merchant, timestamp */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
        <div>
          <p className="text-xs font-medium text-gray-500">Tipo</p>
          <p className="font-semibold text-gray-900">{event.eventType}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Score</p>
          <p className="text-xl font-semibold text-gray-900">{event.riskScore}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Decisión</p>
          <Badge variant="decision" decision={event.finalDecision}>{event.finalDecision}</Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Severidad</p>
          <Badge variant="severity" severity={event.severity}>{event.severity}</Badge>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Merchant</p>
          <p className="text-gray-900">{event.merchant}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Fecha y hora</p>
          <p className="text-gray-900">{format(new Date(event.timestamp), "d MMM yyyy HH:mm:ss", { locale: es })}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Event Summary */}
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
            <SectionHeader title="Resumen del evento" description="Identidad y contexto" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">User ID</p>
                <Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${event.userId}`} className="font-medium text-koin-green hover:underline">{event.userId}</Link>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Email</p>
                <p className="truncate text-sm text-gray-900">{event.email ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Teléfono</p>
                <p className="text-sm text-gray-900">{event.phone ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Documento</p>
                <p className="truncate text-sm font-mono text-gray-900">{event.document ?? '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Dispositivo</p>
                <p className="truncate font-mono text-sm text-gray-900">{event.deviceId}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Método de auth</p>
                <p className="text-sm text-gray-900">{event.authMethod}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">MFA</p>
                <p className="text-sm text-gray-900">{event.mfaStatus}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-500">Passkey</p>
                <p className="text-sm text-gray-900">{event.passkeyStatus}</p>
              </div>
            </div>
          </section>

          {/* Risk & Signals */}
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
            <SectionHeader title="Riesgo y señales" description="Señales disparadas y razón del riesgo" />
            <ul className="mt-3 space-y-2">
              {event.triggeredSignals.length === 0 ? (
                <li className="text-sm text-gray-500">Ninguna señal disparada en este evento.</li>
              ) : (
                event.triggeredSignals.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className="ml-2 text-xs text-gray-500">{s.code}</span>
                      {s.description && <p className="mt-0.5 text-xs text-gray-500">{s.description}</p>}
                    </div>
                    <Badge variant="severity" severity={s.severity}>{s.severity}</Badge>
                  </li>
                ))
              )}
            </ul>
          </section>

          {/* Authentication Journey */}
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
            <SectionHeader title="Authentication Journey" description="Timeline del flujo de autenticación" />
            <ul className="mt-4 space-y-3">
              {journeySteps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <Clock className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{step.label}</p>
                    <p className="text-xs text-gray-500">{format(new Date(step.at), 'HH:mm:ss', { locale: es })}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* User Snapshot */}
          {user && (
            <section className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
              <SectionHeader
                title="User Snapshot"
                description="Identidad a lo largo del tiempo"
                action={<Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${user.userId}`} className="text-sm font-medium text-koin-green hover:text-koin-green-hover">Ver perfil completo</Link>}
              />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Estado</p>
                  <Badge variant="status" status={user.currentStatus}>{user.currentStatus}</Badge>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Riesgo</p>
                  <Badge variant="risk" riskLevel={user.riskLevel}>{user.riskLevel}</Badge>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">First seen</p>
                  <p className="text-sm text-gray-900">{format(new Date(user.firstSeen), 'd MMM yyyy', { locale: es })}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Last seen</p>
                  <p className="text-sm text-gray-900">{format(new Date(user.lastSeen), 'd MMM yyyy', { locale: es })}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Dispositivos</p>
                  <p className="text-sm font-medium text-gray-900">{user.devicesCount}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">MFA adoption</p>
                  <p className="text-sm text-gray-900">{user.mfaAdoption ? 'Sí' : 'No'}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Passkey</p>
                  <p className="text-sm text-gray-900">{user.passkeyAdoption ? 'Sí' : 'No'}</p>
                </div>
                <div className="rounded-lg border border-gray-100 p-3">
                  <p className="text-xs text-gray-500">Usuarios vinculados</p>
                  <p className="text-sm font-medium text-gray-900">{user.linkedUsersCount}</p>
                </div>
              </div>
            </section>
          )}

          {/* Device Snapshot */}
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
            <SectionHeader title="Device Snapshot" description="Dispositivo asociado al evento" />
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Device ID</p>
                <p className="font-mono text-sm font-medium text-gray-900">{event.deviceId}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Vínculos en red</p>
                <p className="text-sm font-medium text-gray-900">{event.networkLinkCount ?? 0}</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Fingerprint</p>
                <p className="truncate font-mono text-xs text-gray-900">{event.fingerprint ?? '—'}</p>
              </div>
            </div>
          </section>

          {/* Related Events */}
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
            <SectionHeader title="Eventos relacionados" description="Mismo usuario o mismo dispositivo" action={<Link to={`${ROUTES.antifraude.proteccionCuentaEventos}?userId=${event.userId}`} className="text-sm font-medium text-koin-green hover:text-koin-green-hover">Ver todos</Link>} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 font-medium text-gray-700">Evento</th>
                    <th className="pb-2 font-medium text-gray-700">Tipo</th>
                    <th className="pb-2 font-medium text-gray-700">Score</th>
                    <th className="pb-2 font-medium text-gray-700">Decisión</th>
                    <th className="pb-2 font-medium text-gray-700">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sameUserEvents, ...sameDeviceEvents].slice(0, 6).map((e) => (
                    <tr key={e.eventId} className="border-b border-gray-100">
                      <td className="py-2"><Link to={`${ROUTES.antifraude.proteccionCuentaEventos}/${e.eventId}`} className="font-medium text-koin-green hover:underline">{e.eventId}</Link></td>
                      <td className="py-2 text-gray-600">{e.eventType}</td>
                      <td className="py-2"><Badge variant="severity" severity={e.severity}>{e.riskScore}</Badge></td>
                      <td className="py-2"><Badge variant="decision" decision={e.finalDecision}>{e.finalDecision}</Badge></td>
                      <td className="py-2 text-gray-500">{format(new Date(e.timestamp), 'd MMM HH:mm', { locale: es })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mini Network placeholder */}
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
            <SectionHeader title="Red asociada" description="Vista resumida del grafo" action={<Link to={ROUTES.antifraude.proteccionCuentaRed} className="text-sm font-medium text-koin-green hover:text-koin-green-hover">Abrir red completa</Link>} />
            <div className="mt-4 flex h-32 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
              Mini grafo (placeholder). Abre la vista Red para explorar vínculos.
            </div>
          </section>

          {/* Audit / Timeline placeholder */}
          <section className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
            <SectionHeader title="Audit / Timeline" description="Acciones del sistema y del analista" />
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li className="flex gap-2"><Clock className="h-4 w-4 shrink-0 text-gray-400" /> Evento evaluado · {format(new Date(event.timestamp), "d MMM HH:mm:ss", { locale: es })}</li>
              <li className="flex gap-2 text-gray-500">Sin acciones manuales registradas.</li>
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-untitled-xl border border-gray-200 bg-white p-4 shadow-untitled-sm">
            <h3 className="text-sm font-semibold text-gray-900">Acciones (mock)</h3>
            <div className="mt-3 space-y-2">
              <button type="button" className="w-full rounded-lg border border-gray-200 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Marcar para revisión</button>
              <button type="button" className="w-full rounded-lg border border-amber-200 bg-amber-50 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100">Solicitar MFA</button>
              <button type="button" className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-medium text-red-800 hover:bg-red-100">Bloquear usuario</button>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
