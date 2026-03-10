# Entregable: Refactor UX Portal Antifraude Koin

## 1. Prototipo navegable

El prototipo queda navegable con la siguiente estructura:

- **Raíz** `/` → redirige a `/antifraude/overview`
- **Nivel 1 (producto):** Pagos (deshabilitado) | **Antifraude**
- **Nivel 2 (módulos Antifraude):** Overview | Transacciones | Protección de Cuenta | Contracargos
- **Overview global** `/antifraude/overview`: vista resumen con enlaces a Transacciones, Protección de Cuenta, Contracargos
- **Transacciones** `/antifraude/transacciones/*`: tabs Búsqueda | Métricas (placeholders)
- **Protección de Cuenta** `/antifraude/proteccion-cuenta/*`: tabs Overview | Eventos | Usuarios | Red | Métricas
- **Contracargos** `/antifraude/contracargos/*`: subnav Casos | Métricas (placeholders)

---

## 2. Estructura final de páginas y componentes

### Rutas (`src/config/routes.ts`)

| Ruta | Página | Descripción |
|------|--------|-------------|
| `/antifraude/overview` | `AntifraudeOverviewPage` | Dashboard global Antifraude, enlaces a módulos |
| `/antifraude/transacciones/*` | `TransaccionesPlaceholderPage` | Búsqueda / Métricas placeholder |
| `/antifraude/proteccion-cuenta` | `OverviewPage` | Overview del módulo: KPIs, filtros, top devices/señales, insights, eventos alto riesgo, usuarios observación |
| `/antifraude/proteccion-cuenta/eventos` | `EventsListPage` | Tabla enterprise de eventos con columnas ampliadas y quick filters |
| `/antifraude/proteccion-cuenta/eventos/:id` | `EventDetailPage` | Consola de investigación: header, resumen, señales, journey, user/device snapshot, relacionados, mini red, audit |
| `/antifraude/proteccion-cuenta/usuarios` | `UsersListPage` | Tabla usuarios con columnas y quick filters ampliados |
| `/antifraude/proteccion-cuenta/usuarios/:id` | `UserDetailPage` | Detalle usuario (Identity 360): resumen, trust/risk, dispositivos, auth, eventos, notas |
| `/antifraude/proteccion-cuenta/red` | `NetworkPage` | Grafo solo User/Email/Phone/Document/Device/Event, leyenda, filtros, side panel |
| `/antifraude/proteccion-cuenta/metricas` | `MetricsPage` | Tabs Attack, Autenticación, Usuario/Identidad, Operaciones, Red |
| `/antifraude/contracargos/*` | `ContracargosPlaceholderPage` | Casos | Métricas placeholder |

### Componentes de layout

- **`KoinHeader`**: logo Koin (blanco), selector Pagos | Antifraude, submódulos Overview | Transacciones | Protección de Cuenta | Contracargos, controles derecha (moneda, idioma, timezone, notificaciones, settings, avatar).
- **`SubnavProteccionCuenta`**: se muestra solo en rutas bajo Protección de Cuenta; tabs Overview, Eventos, Usuarios, Red, Métricas con íconos.
- **`SubnavContracargos`**: se muestra solo en Contracargos; tabs Casos, Métricas.
- **`Layout`**: sin sidebar; contenedor centrado `max-w-[1600px]`, header + subnavs + `<main><Outlet /></main>`.

### Componentes compartidos (estilo Untitled UI / Koin)

- `PageHeader`, `Breadcrumbs`, `SectionHeader`, `KPICard`, `Badge`, charts (`EventsOverTimeChart`, `EventTypeDistributionChart`), etc.

---

## 3. Decisiones de producto

- **Jerarquía:** producto (Antifraude) → módulo (Overview, Transacciones, Protección de Cuenta, Contracargos) → sección (p. ej. Eventos, Usuarios, Red). Navegación solo en header superior; sin sidebar.
- **Overview global:** primera entrada de Antifraude es Overview, que resume el dominio y enlaza a cada módulo. El producto activo sigue siendo Antifraude.
- **Protección de Cuenta:** modelo “Evento = lo que ocurrió ahora, Usuario = identidad en el tiempo, Red = cómo se conectan” reflejado en copy y breadcrumbs.
- **Event Detail:** pensado como consola de investigación: header con acciones (ver usuario, abrir red, marcar revisión, bloquear), resumen del evento, riesgo y señales, authentication journey, user snapshot, device snapshot, eventos relacionados, mini red (placeholder), audit (placeholder).
- **Look & feel:** header oscuro (Koin), verde `#00A343` para acentos, estados activos en blanco en el header; contenido en superficies claras, cards y tablas legibles, tipografía Inter.

---

## 4. Jerarquía de navegación

- **Nivel 1 – Header superior:** Pagos | Antifraude (Antifraude activo con estilo verde).
- **Nivel 2 – Misma barra:** Overview | Transacciones | Protección de Cuenta | Contracargos. Activo con borde y texto blanco.
- **Nivel 3 – Subnav contextual:**
  - En **Protección de Cuenta:** barra blanca con tabs Overview, Eventos, Usuarios, Red, Métricas (subrayado verde en activo).
  - En **Contracargos:** barra blanca con Casos, Métricas.
  - En **Transacciones:** tabs internas en la página (Búsqueda, Métricas).
- **Breadcrumbs** en cada vista: Antifraude → [módulo] → [sección] → [detalle si aplica].

---

## 5. Legibilidad de la vista Red

- **Tipos de nodo:** solo User, Email, Phone, Document, Device, Event (eliminados Card y BankAccount).
- **Prioridad visual:** User (más grande), Device (destacado), Email/Phone/Document (atributos), Event (más pequeño y contextual). Tamaño y peso por tipo.
- **Leyenda:** panel superior izquierdo con ícono y color por tipo.
- **Filtros:** tipo de evento, severidad, solo sospechosos, dispositivos compartidos; barra superior con modo “Centrada en usuario” / “Centrada en atributo”.
- **Menos ruido:** límite de nodos/aristas en el mock (50/80), mayor espaciado en el layout.
- **Panel derecho:** al seleccionar un nodo se muestra tipo, valor, riesgo, nº de relaciones, usuarios y eventos vinculados, aviso si es sospechoso, CTAs “Ver usuario” / “Ver evento”.
- **Colores por tipo:** paleta sobria (teal User, naranja Device, etc.); nodos sospechosos en rojo.

---

## 6. Próximos pasos recomendados

1. **Untitled UI React:** instalar componentes vía CLI (`npx untitledui@latest add button tabs table dropdown ...`) y sustituir o envolver tablas, tabs, inputs y dropdowns para alinear 100% con la librería.
2. **User Detail Identity 360:** ampliar UserDetailPage con más secciones (linked identities, timeline de auth más rica, notas/audit) y posible drawer o tabs adicionales.
3. **Filtros funcionales:** conectar filtros de Overview y listados (fecha, merchant, tipo, severidad) con lógica de filtrado real o API.
4. **Red – modos:** implementar lógica de “vista centrada en usuario” vs “vista centrada en atributo” (subgrafos distintos según contexto).
5. **Métricas – drill-down:** enlazar KPIs/gráficos a listados filtrados (eventos o usuarios) para simular drill-down.
6. **Transacciones y Contracargos:** reemplazar placeholders por vistas reales cuando existan especificación y datos.

---

## 7. Datos mock

- **Eventos:** 120 (≥100).
- **Usuarios:** 35 (≥30).
- **Clusters y device reuse:** dispositivos compartidos (`dev-cluster-*`), emails/teléfonos/documentos reutilizados en `mocks/events.ts` y `users.ts`.
- **Señales:** `MOCK_SIGNALS` con 14 señales; eventos con `triggeredSignals`; Overview con “Top señales disparadas” y “Top dispositivos reutilizados”.
- **KPIs ampliados:** `mockDashboardKpis` incluye blockedUsersCount, mfaChallengeRate, mfaSuccessRate, passkeyAdoptionRate, reusedDeviceRate, suspiciousClustersCount.
