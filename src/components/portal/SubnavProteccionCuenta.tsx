import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, GitBranch, BarChart3 } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const TABS = [
  { label: 'Overview', href: ROUTES.antifraude.proteccionCuentaOverview, icon: LayoutDashboard },
  { label: 'Métricas', href: ROUTES.antifraude.proteccionCuentaMetricas, icon: BarChart3 },
  { label: 'Eventos', href: ROUTES.antifraude.proteccionCuentaEventos, icon: Calendar },
  { label: 'Usuarios', href: ROUTES.antifraude.proteccionCuentaUsuarios, icon: Users },
  { label: 'Red', href: ROUTES.antifraude.proteccionCuentaRed, icon: GitBranch },
] as const

export function SubnavProteccionCuenta() {
  const location = useLocation()
  const isProteccionCuenta = location.pathname.startsWith(ROUTES.antifraude.proteccionCuenta)
  if (!isProteccionCuenta) return null

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex gap-0.5 px-4 lg:px-6" aria-label="Protección de Cuenta">
        {TABS.map((tab) => {
          const exact = tab.href === ROUTES.antifraude.proteccionCuenta
          const active = exact ? location.pathname === tab.href : location.pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'border-koin-green text-gray-900'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
