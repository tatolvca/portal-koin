/**
 * Rutas centralizadas del Portal Koin.
 * Producto activo: Antifraude.
 * Nivel 2: Overview (global), Transacciones, Protección de Cuenta, Contracargos.
 */
export const ROUTES = {
  antifraude: {
    base: '/antifraude',
    overview: '/antifraude/overview',
    transacciones: '/antifraude/transacciones',
    transaccionesBusqueda: '/antifraude/transacciones/busqueda',
    transaccionesMetricas: '/antifraude/transacciones/metricas',
    proteccionCuenta: '/antifraude/proteccion-cuenta',
    proteccionCuentaOverview: '/antifraude/proteccion-cuenta',
    proteccionCuentaEventos: '/antifraude/proteccion-cuenta/eventos',
    proteccionCuentaUsuarios: '/antifraude/proteccion-cuenta/usuarios',
    proteccionCuentaRed: '/antifraude/proteccion-cuenta/red',
    proteccionCuentaMetricas: '/antifraude/proteccion-cuenta/metricas',
    contracargos: '/antifraude/contracargos',
    contracargosCasos: '/antifraude/contracargos/casos',
    contracargosMetricas: '/antifraude/contracargos/metricas',
  },
} as const

export const PROTECCION_CUENTA_PATHS = [
  ROUTES.antifraude.proteccionCuentaOverview,
  ROUTES.antifraude.proteccionCuentaEventos,
  ROUTES.antifraude.proteccionCuentaUsuarios,
  ROUTES.antifraude.proteccionCuentaRed,
  ROUTES.antifraude.proteccionCuentaMetricas,
] as const
