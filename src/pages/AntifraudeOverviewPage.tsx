import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { PageHeader } from '@/components/portal/PageHeader'
import { CreditCard, Shield, FileWarning } from 'lucide-react'

const MODULES = [
  { label: 'Transacciones', href: ROUTES.antifraude.transacciones, description: 'Búsqueda y métricas de transacciones.', icon: CreditCard },
  { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta, description: 'Eventos, usuarios, red y métricas ATO.', icon: Shield },
  { label: 'Contracargos', href: ROUTES.antifraude.contracargos, description: 'Casos y métricas de disputas.', icon: FileWarning },
] as const

export function AntifraudeOverviewPage() {
  return (
    <>
      <PageHeader
        title="Antifraude"
        description="Vista global del dominio antifraude. Navega a cada módulo para el detalle."
        breadcrumbs={[{ label: 'Antifraude', href: ROUTES.antifraude.overview }]}
      />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => {
          const Icon = m.icon
          return (
            <Link
              key={m.href}
              to={m.href}
              className="flex flex-col gap-3 rounded-untitled-xl border border-gray-200 bg-white p-5 shadow-untitled-sm transition-shadow hover:shadow-untitled-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{m.label}</h2>
                <p className="mt-1 text-sm text-gray-500">{m.description}</p>
              </div>
              <span className="text-sm font-medium text-koin-green">Entrar →</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
