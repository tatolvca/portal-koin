import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Calendar, Users, GitBranch, BarChart3, Shield, Settings } from 'lucide-react'

const nav = [
  { href: '/ato', label: 'Overview', icon: LayoutDashboard },
  { href: '/ato/events', label: 'Events', icon: Calendar },
  { href: '/ato/users', label: 'Users', icon: Users },
  { href: '/ato/network', label: 'Network / Graph', icon: GitBranch },
  { href: '/ato/metrics', label: 'Metrics', icon: BarChart3 },
  { href: '#', label: 'Rules / Signals', icon: Shield },
  { href: '#', label: 'Settings', icon: Settings },
]

export function PortalSidebar() {
  const location = useLocation()

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-untitled-sm">
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        <span className="text-sm font-semibold text-gray-900">Portal Koin</span>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {nav.map((item) => {
          const isActive = item.href !== '#' && (location.pathname === item.href || location.pathname.startsWith(item.href + '/'))
          const Icon = item.icon
          const content = (
            <>
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-brand-600' : 'text-gray-500'}`} />
              <span className="truncate text-sm font-medium">{item.label}</span>
            </>
          )
          const className = `flex items-center gap-3 rounded-untitled-lg px-3 py-2.5 transition-colors ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-50'}`
          if (item.href === '#') {
            return <div key={item.label} className={className + ' cursor-not-allowed opacity-60'}>{content}</div>
          }
          return <Link key={item.label} to={item.href} className={className}>{content}</Link>
        })}
      </nav>
      <div className="border-t border-gray-200 p-3">
        <p className="text-xs text-gray-500">Account Protection (ATO)</p>
        <p className="text-xs text-gray-400">Portal Koin v1</p>
      </div>
    </aside>
  )
}
