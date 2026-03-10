import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { PageHeader } from '@/components/portal/PageHeader'
import { Search, BarChart3 } from 'lucide-react'

const TABS = [
  { label: 'Búsqueda', href: ROUTES.antifraude.transaccionesBusqueda, icon: Search },
  { label: 'Métricas', href: ROUTES.antifraude.transaccionesMetricas, icon: BarChart3 },
] as const

function PlaceholderContent({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-untitled-xl border border-gray-200 bg-white p-8 text-center shadow-untitled-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </div>
  )
}

function TransaccionesLayout() {
  const location = useLocation()
  return (
    <>
      <PageHeader
        title="Transacciones"
        description="Módulo de transacciones. En producción: búsqueda y métricas."
        breadcrumbs={[
          { label: 'Antifraude', href: ROUTES.antifraude.proteccionCuenta },
          { label: 'Transacciones', href: ROUTES.antifraude.transacciones },
        ]}
      />
      <div className="mb-4 flex gap-0.5 border-b border-gray-200">
        {TABS.map((tab) => {
          const active = location.pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium ${
                active ? 'border-koin-green text-koin-green' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          )
        })}
      </div>
      <Routes>
        <Route index element={<Navigate to={ROUTES.antifraude.transaccionesBusqueda} replace />} />
        <Route path={ROUTES.antifraude.transaccionesBusqueda} element={<PlaceholderContent title="Búsqueda de transacciones" description="Vista placeholder. Aquí iría el explorador de transacciones." />} />
        <Route path={ROUTES.antifraude.transaccionesMetricas} element={<PlaceholderContent title="Métricas de transacciones" description="Vista placeholder. Aquí irían KPIs y gráficos de transacciones." />} />
      </Routes>
    </>
  )
}

export function TransaccionesPlaceholderPage() {
  return <TransaccionesLayout />
}
