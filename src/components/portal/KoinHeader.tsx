import { Link, useLocation } from 'react-router-dom'
import { Bell, Settings, ChevronDown, Globe, DollarSign, Clock, CreditCard, Shield, FileWarning, Wallet, LayoutDashboard } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const PRODUCTS: Array<{ id: string; label: string; href: string; icon: typeof Wallet; disabled?: boolean }> = [
  { id: 'pagos', label: 'Pagos', href: '#', disabled: true, icon: Wallet },
  { id: 'antifraude', label: 'Antifraude', href: ROUTES.antifraude.overview, icon: Shield },
]

/** Nivel 2: Overview (global), Transacciones, Protección de Cuenta, Contracargos */
const SUBMODULES = [
  { label: 'Overview', href: ROUTES.antifraude.overview, icon: LayoutDashboard },
  { label: 'Transacciones', href: ROUTES.antifraude.transacciones, icon: CreditCard },
  { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta, icon: Shield },
  { label: 'Contracargos', href: ROUTES.antifraude.contracargos, icon: FileWarning },
] as const

export function KoinHeader() {
  const location = useLocation()

  const isAntifraude = location.pathname.startsWith(ROUTES.antifraude.base)
  const isOverview = location.pathname === ROUTES.antifraude.overview
  const isTransacciones = location.pathname.startsWith(ROUTES.antifraude.transacciones)
  const isProteccionCuenta = location.pathname.startsWith(ROUTES.antifraude.proteccionCuenta)
  const isContracargos = location.pathname.startsWith(ROUTES.antifraude.contracargos)

  return (
    <header className="sticky top-0 z-50 border-b border-koin-headerBorder bg-koin-header text-white shadow-lg">
      {/* Fila superior: logo + producto + controles derecha */}
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link to={ROUTES.antifraude.overview} className="flex items-center gap-2 shrink-0" aria-label="Koin - Inicio">
            <img src="/koin-white.svg" alt="Koin" className="h-7 w-auto" />
          </Link>
          <nav className="hidden items-center gap-0.5 rounded-lg bg-white/5 p-0.5 sm:flex" aria-label="Producto">
            {PRODUCTS.map((p) => {
              const active = p.id === 'antifraude' && isAntifraude
              const Icon = p.icon
              if (p.disabled) {
                return (
                  <span key={p.id} className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-white/40 cursor-not-allowed">
                    <Icon className="h-4 w-4 shrink-0" />
                    {p.label}
                  </span>
                )
              }
              return (
                <Link
                  key={p.id}
                  to={p.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? 'text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  style={active ? { backgroundColor: 'var(--koin-green, #00A343)' } : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {p.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white" title="Moneda">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">USD</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
          <button type="button" className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white" title="Idioma">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">ES</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
          <button type="button" className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-white/70 hover:bg-white/10 hover:text-white md:flex" title="Zona horaria">
            <Clock className="h-4 w-4" />
            <span>UTC-3</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </button>
          <button type="button" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Configuración">
            <Settings className="h-5 w-5" />
          </button>
          <button type="button" className="ml-1 flex items-center gap-2 rounded-lg py-1.5 pl-2 pr-2 text-left text-sm text-white/90 hover:bg-white/10">
            <div className="h-8 w-8 rounded-full bg-koin-green/20 flex items-center justify-center text-koin-green font-semibold text-sm">J</div>
            <ChevronDown className="h-3.5 w-3.5 text-white/60" />
          </button>
        </div>
      </div>
      {/* Submódulos de Antifraude */}
      <div className="border-t border-koin-headerBorder px-4 lg:px-6">
        <nav className="flex gap-0.5" aria-label="Submódulos Antifraude">
          {SUBMODULES.map((s) => {
            const active =
              (s.href === ROUTES.antifraude.overview && isOverview) ||
              (s.href === ROUTES.antifraude.transacciones && isTransacciones) ||
              (s.href === ROUTES.antifraude.proteccionCuenta && isProteccionCuenta) ||
              (s.href === ROUTES.antifraude.contracargos && isContracargos)
            const Icon = s.icon
            return (
              <Link
                key={s.href}
                to={s.href}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'border-white text-white'
                    : 'border-transparent text-white/60 hover:border-white/20 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {s.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
