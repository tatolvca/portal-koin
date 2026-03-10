import { Routes, Route, Navigate } from 'react-router-dom'
import { PageHeader } from '@/components/portal/PageHeader'
import { ROUTES } from '@/config/routes'

function PlaceholderBlock({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-untitled-xl border border-gray-200 bg-white p-8 text-center shadow-untitled-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </div>
  )
}

export function ContracargosPlaceholderPage() {
  return (
    <>
      <PageHeader
        title="Contracargos"
        description="Casos y métricas de disputas. En producción: gestión completa."
        breadcrumbs={[
          { label: 'Antifraude', href: ROUTES.antifraude.overview },
          { label: 'Contracargos', href: ROUTES.antifraude.contracargos },
        ]}
      />
      <Routes>
        <Route index element={<Navigate to={ROUTES.antifraude.contracargosCasos} replace />} />
        <Route path="casos" element={<PlaceholderBlock title="Casos de contracargos" description="Vista placeholder. Aquí iría la lista y detalle de casos de disputa." />} />
        <Route path="metricas" element={<PlaceholderBlock title="Métricas de contracargos" description="Vista placeholder. Aquí irían KPIs y gráficos del módulo." />} />
      </Routes>
    </>
  )
}
