import { Link, useLocation } from 'react-router-dom'
import { FileText, BarChart3 } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const TABS = [
  { label: 'Casos', href: ROUTES.antifraude.contracargosCasos, icon: FileText },
  { label: 'Métricas', href: ROUTES.antifraude.contracargosMetricas, icon: BarChart3 },
] as const

export function SubnavContracargos() {
  const location = useLocation()
  const isContracargos = location.pathname.startsWith(ROUTES.antifraude.contracargos)
  if (!isContracargos) return null

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex gap-0.5 px-4 lg:px-6" aria-label="Contracargos">
        {TABS.map((tab) => {
          const active = location.pathname.startsWith(tab.href)
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
