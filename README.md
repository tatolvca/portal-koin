# Portal Koin – Account Protection (ATO)

Aplicación independiente del **Portal Koin**, módulo **Protección de Cuenta (ATO)**. No forma parte de Skillia ni de ningún otro proyecto; es un prototipo standalone.

## Cómo correr

```bash
cd portal-koin
npm install
npm run dev
```

Abre **http://localhost:5173** (Vite). La ruta por defecto redirige a `/ato` (Overview).

## Rutas

- **/** → redirige a `/ato`
- **/ato** – Overview / Dashboard
- **/ato/events** – Lista de eventos
- **/ato/events/:id** – Detalle de evento
- **/ato/users** – Lista de usuarios
- **/ato/users/:id** – Detalle de usuario
- **/ato/network** – Vista de red/grafo
- **/ato/metrics** – Métricas ATO

## Stack

- **Vite** + **React 18** + **TypeScript**
- **Tailwind CSS**
- **React Router** (v6/v7)
- **Recharts** (gráficos)
- **@xyflow/react** (grafo de red)
- **Zustand** (opcional)
- **date-fns** + **lucide-react**

## Estructura

```
portal-koin/
├── src/
│   ├── components/       # Layout, Sidebar, Header, KPICard, Badge, etc.
│   ├── pages/            # OverviewPage, EventsListPage, EventDetailPage, etc.
│   ├── mocks/            # events, users, graph, metrics, signals
│   ├── types/            # ato.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## Datos

Todo funciona con **mocks** en `src/mocks/`. No hay backend. Puedes sustituir más adelante por llamadas a la API de Koin.

## Separación de Skillia

Este repositorio/carpeta **no depende de Skillia**. Para usar el Portal Koin:

1. Clona o copia la carpeta `portal-koin` donde quieras.
2. `npm install` y `npm run dev` dentro de `portal-koin`.

Si antes tenías el portal dentro de Skillia, ahí se puede eliminar la ruta `/portal`, los componentes en `src/components/portal` y el enlace “Portal Koin” del navbar de Skillia.
