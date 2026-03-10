import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/portal/Badge'
import { SectionHeader } from '@/components/portal/SectionHeader'
import { PageHeader } from '@/components/portal/PageHeader'
import { mockUsers } from '@/mocks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

const QUICK_FILTERS = [
  { key: 'blocked', label: 'Bloqueados' },
  { key: 'under_watch', label: 'En observación' },
  { key: 'reused_device', label: 'Device reutilizado' },
  { key: 'no_mfa', label: 'Sin MFA' },
  { key: 'no_passkey', label: 'Sin passkey' },
  { key: 'high_link', label: 'Alta densidad vínculos' },
  { key: 'new_users', label: 'Usuarios nuevos' },
  { key: 'dormant', label: 'Dormant' },
]
const PAGE_SIZE = 15

export function UsersListPage() {
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const filtered = useMemo(() => {
    let list = mockUsers
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((u) => u.userId.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q))
    }
    if (quickFilter === 'blocked') list = list.filter((u) => u.blocked || u.currentStatus === 'blocked')
    if (quickFilter === 'under_watch') list = list.filter((u) => u.currentStatus === 'under_review' || u.riskLevel === 'high' || u.riskLevel === 'critical')
    if (quickFilter === 'reused_device') list = list.filter((u) => u.devicesCount > 0 && u.devices.some((d) => (d.deviceReuseCount ?? 0) > 1))
    if (quickFilter === 'no_mfa') list = list.filter((u) => !u.mfaAdoption)
    if (quickFilter === 'no_passkey') list = list.filter((u) => !u.passkeyAdoption)
    if (quickFilter === 'high_link') list = list.filter((u) => u.linkedUsersCount > 2)
    if (quickFilter === 'new_users') list = list.filter((u) => u.totalEvents <= 3)
    if (quickFilter === 'dormant') list = list.filter((u) => u.currentStatus === 'dormant')
    return list
  }, [search, quickFilter])
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pageUsers = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <>
      <PageHeader title="Usuarios" description="Usuario = identidad a lo largo del tiempo. Bóveda de identidades." breadcrumbs={[{ label: 'Antifraude', href: ROUTES.antifraude.overview }, { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta }, { label: 'Usuarios', href: ROUTES.antifraude.proteccionCuentaUsuarios }]} />
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="search" placeholder="Buscar por userId, email, teléfono..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="w-80 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-300" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_FILTERS.map((f) => (
            <button key={f.key} type="button" onClick={() => { setQuickFilter(quickFilter === f.key ? null : f.key); setPage(0) }} className={`rounded-full px-3 py-1.5 text-xs font-medium ${quickFilter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{f.label}</button>
          ))}
        </div>
        <div className="rounded-untitled-xl border border-gray-200 bg-white shadow-untitled-sm">
          <div className="border-b border-gray-200 px-4 py-3"><SectionHeader title={`${filtered.length} usuarios`} /></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">User ID</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Email</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Estado</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Riesgo</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Trust</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">First / Last</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Eventos</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Devices</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">MFA</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Passkey</th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-left font-medium text-gray-700">Links</th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((u) => (
                  <tr key={u.userId} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-4 py-2.5"><Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${u.userId}`} className="font-medium text-koin-green hover:underline">{u.userId}</Link></td>
                    <td className="max-w-[10rem] truncate px-4 py-2.5 text-gray-600" title={u.email}>{u.email ?? '—'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5"><Badge variant="status" status={u.currentStatus}>{u.currentStatus}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-2.5"><Badge variant="risk" riskLevel={u.riskLevel}>{u.riskLevel}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{u.trustLevel}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{format(new Date(u.firstSeen), 'd MMM', { locale: es })} / {format(new Date(u.lastSeen), 'd MMM', { locale: es })}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{u.totalEvents}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{u.devicesCount}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{u.mfaAdoption ? 'Sí' : 'No'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{u.passkeyAdoption ? 'Sí' : 'No'}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-600">{u.linkedUsersCount}</td>
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
