# Refactor Portal Koin – Resumen

## 1. Prototipo navegable

- **URL base:** `/` redirige a `/antifraude/proteccion-cuenta`.
- **Producto:** Antifraude (Pagos deshabilitado en UI).
- **Submódulos:** Transacciones, Protección de Cuenta, Contracargos.
- **Protección de Cuenta:** Overview, Eventos, Usuarios, Red, Métricas (todas navegables).
- **Transacciones:** Búsqueda y Métricas como placeholders.
- **Contracargos:** una sola pantalla placeholder.

## 2. Estructura de páginas y componentes

### Nuevos o modificados

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/antifraude/proteccion-cuenta` | `OverviewPage` | Dashboard con KPIs, insights, eventos de alto riesgo, usuarios en observación |
| `/antifraude/proteccion-cuenta/eventos` | `EventsListPage` | Listado y filtros de eventos |
| `/antifraude/proteccion-cuenta/eventos/:id` | `EventDetailPage` | Detalle de evento |
| `/antifraude/proteccion-cuenta/usuarios` | `UsersListPage` | Listado de usuarios |
| `/antifraude/proteccion-cuenta/usuarios/:id` | `UserDetailPage` | Detalle de usuario |
| `/antifraude/proteccion-cuenta/red` | `NetworkPage` | Grafo de vínculos (rediseñado) |
| `/antifraude/proteccion-cuenta/metricas` | `MetricsPage` | KPIs y gráficos por categoría |
| `/antifraude/transacciones/*` | `TransaccionesPlaceholderPage` | Tabs Búsqueda / Métricas (placeholder) |
| `/antifraude/contracargos` | `ContracargosPlaceholderPage` | Placeholder |

### Layout y navegación

- **`Layout`:** Sin sidebar; solo `KoinHeader` + `SubnavProteccionCuenta` + `<main><Outlet /></main>`.
- **`KoinHeader`:** Header superior en dos filas:
  - Fila 1: logo Koin, selector de producto (Pagos / Antifraude), controles derecha (moneda, idioma, timezone, notificaciones, settings, avatar).
  - Fila 2: submódulos Antifraude (Transacciones, Protección de Cuenta, Contracargos).
- **`SubnavProteccionCuenta`:** Tabs internas (Overview, Eventos, Usuarios, Red, Métricas) cuando la ruta es Protección de Cuenta.
- **`src/config/routes.ts`:** Rutas centralizadas para enlaces y redirects.

### Componentes que siguen en uso

- `PageHeader`, `Breadcrumbs`, `SectionHeader`, `KPICard`, `Badge`, charts, etc., con rutas y textos actualizados a “Protección de Cuenta”.

### Componentes que ya no se usan en el layout

- `PortalSidebar`, `PortalHeader`, `ModuleTabs` (reemplazados por `KoinHeader` y `SubnavProteccionCuenta`). Se pueden borrar o dejar por referencia.

## 3. Decisiones de diseño

- **Navegación:** Todo en header superior; jerarquía producto → submódulo → sección (tabs/breadcrumbs).
- **Colores Koin:** Header fondo `#0f1214` (koin-header), activos y CTAs en verde `#14DD3E` (koin-green). Acentos en blanco/gris claro sobre el header.
- **Contenido:** Fondo gris claro, cards blancas, bordes y sombras suaves (tokens tipo Untitled UI: `rounded-untitled-*`, `shadow-untitled-*`).
- **Tipografía:** Inter; jerarquía clara y estilo enterprise.
- **Identidad:** Consola antifraude alineada con Koin, no un SaaS genérico con sidebar.

## 4. Mejoras en la vista Red

- **Solo 6 tipos de nodos:** User, Device, Email, Phone, Document, Event (eliminados Card y BankAccount).
- **Prioridad visual:** User (más grande y destacado), luego Device, luego Email/Phone/Document, luego Event. Tamaños y pesos distintos por tipo.
- **Leyenda:** Panel superior izquierdo con ícono y color por tipo.
- **Barra de controles:** Modo “Centrada en usuario” / “Centrada en atributo” y filtros (tipo de evento, severidad, solo sospechosos, dispositivos compartidos).
- **Menos ruido:** Límite de nodos/aristas en el mock (50 nodos, 80 aristas) y mayor espaciado en el layout del grafo.
- **Panel derecho (detalle del nodo):** Tipo, valor, riesgo, número de relaciones, usuarios y eventos vinculados, aviso si es sospechoso, CTAs “Ver usuario” / “Ver evento”.
- **Colores por tipo:** Paleta sobria (teal User, naranja Device, azul/verde/amarillo atributos, gris Event).
- **Controles:** Zoom, centrado y minimapa de ReactFlow.

## 5. Untitled UI React

- Se mantiene **React + TypeScript + Tailwind** y la estética de Untitled UI mediante tokens en `tailwind.config.js` (radius, shadow, tipografía).
- Los componentes actuales (header, tabs, cards, badges, inputs, tablas) son propios del prototipo y están alineados visualmente con ese sistema y con Koin.
- Para usar **componentes copiados de Untitled UI React** (botones, tabs, dropdowns, tablas oficiales), hay que añadirlos con el CLI del proyecto, por ejemplo:  
  `npx untitledui@latest add button tabs dropdown table`  
  y luego sustituir o envolver los componentes actuales por los de Untitled UI.

## 6. Próximos pasos recomendados

1. Añadir componentes de Untitled UI React vía CLI donde se quiera máxima consistencia con la librería (botones, tabs, tablas, empty states).
2. Conectar filtros de la vista Red con datos reales (eventType, severity, profundidad, solo sospechosos, etc.).
3. Implementar “Vista centrada en usuario” y “Vista centrada en atributo” con consultas distintas al grafo (p. ej. subgrafo por userId o por deviceId/email).
4. Añadir tabla inferior opcional en Red con relaciones relevantes (lista de aristas o nodos seleccionados).
5. Sustituir placeholders de Transacciones y Contracargos por vistas reales cuando existan backend y especificación.
