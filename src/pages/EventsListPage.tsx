import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { Search, Save, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/portal/Badge'
import { SectionHeader } from '@/components/portal/SectionHeader'
import { PageHeader } from '@/components/portal/PageHeader'
import { mockEvents, mockSavedViews } from '@/mocks'
import type { AtoEvent } from '@/types/ato'
import { format } from 'date-fns'
import es from 'date-fns/locale/es'

const QUICK_FILTERS = [
  { key: 'high_risk', label: 'Alto riesgo' },
  { key: 'blocked', label: 'Bloqueados' },
  { key: 'mfa_failed', label: 'MFA fallido' },
  { key: 'no_passkey', label: 'Sin passkey' },
  { key: 'device_reused', label: 'Device reutilizado' },
  { key: 'multiple_signups', label: 'Múltiples signup mismo device' },
  { key: 'reset_password', label: 'Reset password' },
  { key: 'suspicious', label: 'Solo sospechosos' },
]
const PAGE_SIZE = 15

export function EventsListPage() {
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const filtered = useMemo(() => {
    let list = mockEvents
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((e) => e.eventId.toLowerCase().includes(q) || e.userId.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.eventType.toLowerCase().includes(q))
    }
    if (quickFilter === 'high_risk') list = list.filter((e) => e.riskScore >= 65)
    if (quickFilter === 'blocked') list = list.filter((e) => e.finalDecision === 'BLOCK')
    if (quickFilter === 'mfa_failed') list = list.filter((e) => e.mfaStatus === 'failed')
    if (quickFilter === 'no_passkey') list = list.filter((e) => e.passkeyStatus !== 'present')
    if (quickFilter === 'device_reused') list = list.filter((e) => (e.networkLinkCount ?? 0) > 2)
    if (quickFilter === 'multiple_signups') list = list.filter((e) => e.eventType === 'SIGN_UP' && (e.networkLinkCount ?? 0) > 1)
    if (quickFilter === 'reset_password') list = list.filter((e) => e.eventType === 'RESET_PASSWORD')
    if (quickFilter === 'suspicious') list = list.filter((e) => e.riskScore >= 65 || e.finalDecision === 'BLOCK')
    return list
  }, [search, quickFilter])
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageEvents = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <>
      <PageHeader title="Eventos" description="Evento = lo que ocurrió ahora. Explorador de eventos ATO." breadcrumbs={[{ label: 'Antifraude', href: ROUTES.antifraude.overview }, { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta }, { label: 'Eventos', href: ROUTES.antifraude.proteccionCuentaEventos }]} />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="search" placeholder="Buscar por eventId, userId, email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="w-80 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300" />
          </div>
          <select className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
            <option value="">Vistas guardadas</option>
            {mockSavedViews.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => (
            <button key={f.key} type="button" onClick={() => { setQuickFilter(quickFilter === f.key ? null : f.key); setPage(0) }} className={`rounded-full px-3 py-1.5 text-xs font-medium ${quickFilter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>
          ))}
        </div>
        <div className="rounded-untitled-xl border border-gray-200 bg-white shadow-untitled-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <SectionHeader title={`${filtered.length} eventos`} action={<button type="button" className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Save className="h-4 w-4" /> Guardar vista</button>} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Event ID</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Fecha</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Merchant</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Tipo</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">User ID</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Email</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Device</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Score</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Decisión</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Auth</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">MFA</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Passkey</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Links</th>
                </tr>
              </thead>
              <tbody>
                {pageEvents.map((e) => (
                  <tr key={e.eventId} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-4 py-2.5"><Link to={`${ROUTES.antifraude.proteccionCuentaEventos}/${e.eventId}`} className="font-medium text-koin-green hover:underline">{e.eventId}</Link></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{format(new Date(e.timestamp), 'd MMM HH:mm', { locale: es })}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{e.merchant}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{e.eventType}</td>
                    <td className="whitespace-nowrap px-4 py-2.5"><Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${e.userId}`} className="text-koin-green hover:underline">{e.userId}</Link></td>
                    <td className="max-w-[120px] truncate px-4 py-2.5 text-gray-600" title={e.email}>{e.email ?? '—'}</td>
                    <td className="max-w-[100px] truncate px-4 py-2.5 font-mono text-xs text-gray-600" title={e.deviceId}>{e.deviceId}</td>
                    <td className="whitespace-nowrap px-4 py-2.5"><Badge variant="severity" severity={e.severity}>{e.riskScore}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-2.5"><Badge variant="decision" decision={e.finalDecision}>{e.finalDecision}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{e.authMethod}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{e.mfaStatus}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{e.passkeyStatus}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{e.networkLinkCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-500">Mostrando {page * PAGE_SIZE + 1}-{Math.min((page + 1) * PAGE_SIZE, filtered.length)} de {filtered.length}</p>
            <div className="flex gap-1">
              <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="h-4 w-4" /></button>
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
