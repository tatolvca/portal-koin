import { Search, Bell, ChevronDown } from 'lucide-react'

export function PortalHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-untitled-xs">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-80 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar eventos, usuarios, IDs..."
            className="w-full rounded-untitled-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm placeholder:text-gray-500 focus:border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-untitled-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none">
            <option>Últimas 24h</option>
            <option>Últimos 7 días</option>
            <option>Últimos 30 días</option>
          </select>
          <select className="rounded-untitled-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-brand-300 focus:outline-none">
            <option>Todos los merchants</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100" aria-label="Notificaciones">
          <Bell className="h-5 w-5" />
        </button>
        <span className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-600">
          Portal Koin <ChevronDown className="h-4 w-4" />
        </span>
      </div>
    </header>
  )
}
