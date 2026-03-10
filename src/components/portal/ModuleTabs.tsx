import { Link, useLocation } from 'react-router-dom'

export function ModuleTabs() {
  const location = useLocation()
  const atoActive = location.pathname.startsWith('/ato')

  return (
    <div className="border-b border-gray-200 bg-gray-50/80 px-6">
      <nav className="flex gap-1" aria-label="Módulos">
        <Link
          to="/ato"
          className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            atoActive ? 'border-brand-600 text-brand-700' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
          }`}
        >
          Account Protection (ATO)
        </Link>
        <span className="border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-400">
          Transaccional (próximamente)
        </span>
      </nav>
    </div>
  )
}
