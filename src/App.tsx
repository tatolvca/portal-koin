import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { OverviewPage } from './pages/OverviewPage'
import { EventsListPage } from './pages/EventsListPage'
import { EventDetailPage } from './pages/EventDetailPage'
import { UsersListPage } from './pages/UsersListPage'
import { UserDetailPage } from './pages/UserDetailPage'
import { NetworkPage } from './pages/NetworkPage'
import { MetricsPage } from './pages/MetricsPage'
import { TransaccionesPlaceholderPage } from './pages/TransaccionesPlaceholderPage'
import { ContracargosPlaceholderPage } from './pages/ContracargosPlaceholderPage'
import { AntifraudeOverviewPage } from './pages/AntifraudeOverviewPage'
import { ROUTES } from './config/routes'

/** Redirige rutas antiguas /ato/* a /antifraude/proteccion-cuenta/* */
function RedirectAto() {
  const location = useLocation()
  const path = location.pathname
  if (path === '/ato' || path === '/ato/') return <Navigate to={ROUTES.antifraude.proteccionCuenta} replace />
  if (path === '/ato/network') return <Navigate to={ROUTES.antifraude.proteccionCuentaRed} replace />
  if (path === '/ato/events') return <Navigate to={ROUTES.antifraude.proteccionCuentaEventos} replace />
  if (path === '/ato/users') return <Navigate to={ROUTES.antifraude.proteccionCuentaUsuarios} replace />
  if (path === '/ato/metrics') return <Navigate to={ROUTES.antifraude.proteccionCuentaMetricas} replace />
  if (path.startsWith('/ato/events/')) {
    const id = path.slice('/ato/events/'.length)
    return <Navigate to={`${ROUTES.antifraude.proteccionCuentaEventos}/${id}`} replace />
  }
  if (path.startsWith('/ato/users/')) {
    const id = path.slice('/ato/users/'.length)
    return <Navigate to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${id}`} replace />
  }
  return <Navigate to={ROUTES.antifraude.proteccionCuenta} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={ROUTES.antifraude.overview} replace />} />
        {/* Redirecciones desde rutas antiguas /ato/* */}
        <Route path="ato" element={<RedirectAto />} />
        <Route path="ato/*" element={<RedirectAto />} />
        {/* Antifraude: Overview global */}
        <Route path="antifraude/overview" element={<AntifraudeOverviewPage />} />
        {/* Transacciones (placeholders) */}
        <Route path="antifraude/transacciones/*" element={<TransaccionesPlaceholderPage />} />
        {/* Protección de Cuenta */}
        <Route path="antifraude/proteccion-cuenta" element={<OverviewPage />} />
        <Route path="antifraude/proteccion-cuenta/eventos" element={<EventsListPage />} />
        <Route path="antifraude/proteccion-cuenta/eventos/:id" element={<EventDetailPage />} />
        <Route path="antifraude/proteccion-cuenta/usuarios" element={<UsersListPage />} />
        <Route path="antifraude/proteccion-cuenta/usuarios/:id" element={<UserDetailPage />} />
        <Route path="antifraude/proteccion-cuenta/red" element={<NetworkPage />} />
        <Route path="antifraude/proteccion-cuenta/metricas" element={<MetricsPage />} />
        {/* Contracargos (placeholders: Casos / Métricas) */}
        <Route path="antifraude/contracargos/*" element={<ContracargosPlaceholderPage />} />
      </Route>
    </Routes>
  )
}
