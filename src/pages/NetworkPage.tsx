import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
const ForceGraph2D = lazy(() => import('react-force-graph-2d').then((m) => ({ default: m.default })))
import { Link } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { PageHeader } from '@/components/portal/PageHeader'
import { mockGraph } from '@/mocks'
import {
  getSubgraphFromFocus,
  getDefaultFocusUser,
  getDefaultFocusEntity,
  getDefaultFocusSuspicious,
} from '@/mocks/graph'
import type { GraphData, GraphNode, GraphNodeType } from '@/types/ato'
import { User, Smartphone, Mail, Phone, FileText, Zap, AlertTriangle } from 'lucide-react'

const NODE_TYPES: GraphNodeType[] = ['User', 'Device', 'Email', 'Phone', 'Document', 'Event']

const NODE_COLORS: Record<string, string> = {
  User: '#0f766e',
  Device: '#c2410c',
  Email: '#0369a1',
  Phone: '#15803d',
  Document: '#a16207',
  Event: '#6b7280',
}

const NODE_RADIUS: Record<string, number> = {
  User: 28,
  Device: 22,
  Email: 18,
  Phone: 18,
  Document: 18,
  Event: 14,
}

const NODE_ICONS: Record<string, string> = {
  User: 'U',
  Device: 'D',
  Email: 'E',
  Phone: 'P',
  Document: 'Doc',
  Event: '•',
}

type ViewMode = 'user' | 'entity' | 'suspicious'
type FilterState = {
  focusType: string
  eventType: string
  severity: string
  relationDepth: number
  onlySuspicious: boolean
  onlySharedDevices: boolean
  onlySignupClusters: boolean
  onlyPasswordReset: boolean
  onlyRiskyLogins: boolean
  highRiskOnly: boolean
}

function filterSubgraph(graph: GraphData, _filters: FilterState): GraphData {
  const maxNodes = 60
  const maxEdges = 100
  const nodes = graph.nodes.slice(0, maxNodes)
  const nodeIds = new Set(nodes.map((n) => n.id))
  const edges = graph.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)).slice(0, maxEdges)
  return { nodes, edges }
}

export function NetworkPage() {
  const fgRef = useRef<{ centerAt: (x: number, y: number, t: number) => void } | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('user')
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    focusType: 'all',
    eventType: 'all',
    severity: 'all',
    relationDepth: 1,
    onlySuspicious: false,
    onlySharedDevices: false,
    onlySignupClusters: false,
    onlyPasswordReset: false,
    onlyRiskyLogins: false,
    highRiskOnly: false,
  })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [selectedGraphNode, setSelectedGraphNode] = useState<{ id?: string | number; x?: number; y?: number } | null>(null)
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)

  const effectiveFocusId = useMemo(() => {
    if (focusNodeId) return focusNodeId
    if (viewMode === 'user') return getDefaultFocusUser(mockGraph)
    if (viewMode === 'entity') return getDefaultFocusEntity(mockGraph)
    return getDefaultFocusSuspicious(mockGraph)
  }, [focusNodeId, viewMode])

  const subgraph = useMemo(() => {
    const raw = getSubgraphFromFocus(mockGraph, effectiveFocusId, filters.relationDepth)
    return filterSubgraph(raw, filters)
  }, [effectiveFocusId, filters])

  const graphData = useMemo(() => {
    const nodes = subgraph.nodes.map((n) => ({
      ...n,
      val: NODE_RADIUS[n.type] ?? 14,
      color: NODE_COLORS[n.type] ?? '#6b7280',
    }))
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))
    const links = subgraph.edges.map((e) => ({
      source: nodeMap.get(e.source) ?? e.source,
      target: nodeMap.get(e.target) ?? e.target,
      id: e.id,
    }))
    return { nodes, links }
  }, [subgraph])

  const highlightSet = useMemo(() => {
    const id = hoverNodeId ?? selectedNode?.id
    if (!id) return { nodes: new Set<string>(), links: new Set<string>() }
    const nodeIds = new Set<string>([id])
    subgraph.edges.forEach((e) => {
      if (e.source === id || e.target === id) {
        nodeIds.add(e.source)
        nodeIds.add(e.target)
      }
    })
    const linkIds = new Set(
      subgraph.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target)).map((e) => e.id)
    )
    return { nodes: nodeIds, links: linkIds }
  }, [hoverNodeId, selectedNode?.id, subgraph.edges])

  const nodeColor = useCallback(
    (node: { id?: string | number; color?: string }) => {
      const id = node.id != null ? String(node.id) : ''
      const active = highlightSet.nodes.size === 0 || highlightSet.nodes.has(id)
      return active ? (node.color ?? '#6b7280') : '#d1d5db'
    },
    [highlightSet.nodes]
  )

  const nodeOpacity = useCallback(
    (node: { id?: string | number }) => {
      const id = node.id != null ? String(node.id) : ''
      return highlightSet.nodes.size === 0 || highlightSet.nodes.has(id) ? 1 : 0.25
    },
    [highlightSet.nodes]
  )

  const getLinkId = useCallback((link: { id?: string; source?: unknown; target?: unknown }): string => {
    if (link.id) return String(link.id)
    const src = link.source
    const tgt = link.target
    const s = typeof src === 'object' && src !== null && 'id' in src ? String((src as { id: unknown }).id) : String(src ?? '')
    const t = typeof tgt === 'object' && tgt !== null && 'id' in tgt ? String((tgt as { id: unknown }).id) : String(tgt ?? '')
    return `${s}-${t}`
  }, [])

  const linkColor = useCallback(
    (link: { id?: string; source?: unknown; target?: unknown }) => {
      const lid = getLinkId(link)
      const active = highlightSet.links.size === 0 || highlightSet.links.has(lid)
      return active ? 'rgba(100,116,139,0.7)' : 'rgba(200,200,200,0.2)'
    },
    [highlightSet.links, getLinkId]
  )

  const linkWidth = useCallback(
    (link: { id?: string; source?: unknown; target?: unknown }) => {
      const lid = getLinkId(link)
      return highlightSet.links.size === 0 || highlightSet.links.has(lid) ? 1.5 : 0.5
    },
    [highlightSet.links, getLinkId]
  )

  const nodeCanvasObject = useCallback(
    (node: { id?: string | number; x?: number; y?: number; val?: number; color?: string; type?: string; label?: string }, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const rawLabel = node.label ?? String(node.id ?? '')
      const label = rawLabel.length > 12 ? `${rawLabel.slice(0, 12)}…` : rawLabel
      const r = Math.max(4, (node.val ?? 14) / (globalScale > 4 ? globalScale / 4 : 1))
      const opacity = nodeOpacity(node)
      ctx.globalAlpha = opacity
      ctx.beginPath()
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI)
      ctx.fillStyle = node.color ?? '#6b7280'
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.font = `${node.type === 'User' ? '600' : '500'} 11px system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#fff'
      ctx.fillText(NODE_ICONS[node.type as string] ?? '?', node.x ?? 0, node.y ?? 0)
      if (globalScale >= 2.5) {
        ctx.font = '10px system-ui, sans-serif'
        ctx.fillStyle = '#374151'
        ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + r + 10)
      }
    },
    [nodeOpacity]
  )

  const nodeLabel = useCallback((node: { id?: string | number; type?: string; label?: string }) => {
    return `${node.type ?? 'Node'}: ${node.label ?? String(node.id ?? '')}`
  }, [])

  const onNodeClick = useCallback(
    (node: { id?: string | number; x?: number; y?: number }) => {
      const id = node.id != null ? String(node.id) : ''
      const graphNode = mockGraph.nodes.find((n) => n.id === id)
      setSelectedNode(graphNode ?? null)
      setSelectedGraphNode(node)
    },
    []
  )

  const onNodeHover = useCallback((node: { id?: string | number } | null) => {
    setHoverNodeId(node?.id != null ? String(node.id) : null)
  }, [])

  const centerOnNode = useCallback(() => {
    if (selectedGraphNode && typeof selectedGraphNode.x === 'number' && typeof selectedGraphNode.y === 'number') {
      fgRef.current?.centerAt(selectedGraphNode.x, selectedGraphNode.y, 400)
    }
  }, [selectedGraphNode])

  const relatedEvents = useMemo(() => {
    if (!selectedNode) return []
    const ids: string[] = []
    mockGraph.edges.forEach((e) => {
      if (e.source === selectedNode.id || e.target === selectedNode.id) {
        const other = e.source === selectedNode.id ? e.target : e.source
        if (other.startsWith('event-')) ids.push(other.replace('event-', ''))
        else if (e.eventId) ids.push(e.eventId)
      }
    })
    return [...new Set(ids)]
  }, [selectedNode])

  const relatedUsers = useMemo(() => {
    if (!selectedNode) return []
    const ids = new Set<string>()
    mockGraph.edges.forEach((e) => {
      if (e.source === selectedNode.id || e.target === selectedNode.id) {
        const other = e.source === selectedNode.id ? e.target : e.source
        if (other.startsWith('user-')) ids.add(other.replace('user-', ''))
      }
    })
    return Array.from(ids)
  }, [selectedNode])

  useEffect(() => {
    setFocusNodeId(null)
    setSelectedNode(null)
    setSelectedGraphNode(null)
  }, [viewMode])

  return (
    <>
      <PageHeader
        title="Red"
        description="Vínculos entre usuarios, dispositivos y atributos. Detección de reutilización y clusters."
        breadcrumbs={[
          { label: 'Protección de Cuenta', href: ROUTES.antifraude.proteccionCuenta },
          { label: 'Red', href: ROUTES.antifraude.proteccionCuentaRed },
        ]}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-untitled-lg border border-gray-200 bg-white px-4 py-3 shadow-untitled-xs">
        <span className="text-sm font-medium text-gray-700">Vista:</span>
        <div className="flex rounded-lg border border-gray-200 p-0.5">
          {(
            [
              ['user', 'Centrada en usuario'],
              ['entity', 'Centrada en entidad'],
              ['suspicious', 'Cluster sospechoso'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${viewMode === mode ? 'bg-koin-green text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="border-l border-gray-200 pl-3 text-sm text-gray-500">Filtros:</span>
        <select
          value={filters.focusType}
          onChange={(e) => setFilters((f) => ({ ...f, focusType: e.target.value }))}
          className="rounded-untitled-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700"
        >
          <option value="all">Tipo foco</option>
          {NODE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={filters.eventType}
          onChange={(e) => setFilters((f) => ({ ...f, eventType: e.target.value }))}
          className="rounded-untitled-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700"
        >
          <option value="all">Tipo de evento</option>
          <option value="sign_up">Sign up</option>
          <option value="login">Login</option>
          <option value="reset_password">Reset password</option>
        </select>
        <select
          value={filters.severity}
          onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
          className="rounded-untitled-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700"
        >
          <option value="all">Severidad</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
        <select
          value={filters.relationDepth}
          onChange={(e) => setFilters((f) => ({ ...f, relationDepth: Number(e.target.value) }))}
          className="rounded-untitled-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700"
        >
          <option value={1}>Profundidad 1</option>
          <option value={2}>Profundidad 2</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.onlySuspicious}
            onChange={(e) => setFilters((f) => ({ ...f, onlySuspicious: e.target.checked }))}
            className="rounded border-gray-300 text-koin-green focus:ring-koin-green"
          />
          Solo sospechosos
        </label>
        <span className="border-l border-gray-200 pl-3 text-xs text-gray-500">Quick:</span>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.onlySharedDevices}
            onChange={(e) => setFilters((f) => ({ ...f, onlySharedDevices: e.target.checked }))}
            className="rounded border-gray-300 text-koin-green focus:ring-koin-green"
          />
          Dispositivos compartidos
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.onlySignupClusters}
            onChange={(e) => setFilters((f) => ({ ...f, onlySignupClusters: e.target.checked }))}
            className="rounded border-gray-300 text-koin-green focus:ring-koin-green"
          />
          Clusters signup
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.onlyPasswordReset}
            onChange={(e) => setFilters((f) => ({ ...f, onlyPasswordReset: e.target.checked }))}
            className="rounded border-gray-300 text-koin-green focus:ring-koin-green"
          />
          Reset password
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.onlyRiskyLogins}
            onChange={(e) => setFilters((f) => ({ ...f, onlyRiskyLogins: e.target.checked }))}
            className="rounded border-gray-300 text-koin-green focus:ring-koin-green"
          />
          Logins riesgosos
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.highRiskOnly}
            onChange={(e) => setFilters((f) => ({ ...f, highRiskOnly: e.target.checked }))}
            className="rounded border-gray-300 text-koin-green focus:ring-koin-green"
          />
          Solo alto riesgo
        </label>
      </div>

      <div className="flex gap-4">
        <div className="min-h-[560px] flex-1 overflow-hidden rounded-untitled-xl border border-gray-200 bg-white shadow-untitled-sm">
          <Suspense fallback={<div className="flex min-h-[560px] items-center justify-center text-gray-500">Cargando grafo…</div>}>
            <ForceGraph2D
              ref={fgRef as never}
              graphData={graphData}
              nodeVal={((n: { val?: number }) => n?.val ?? 14) as (n: unknown) => number}
              nodeColor={nodeColor}
              nodeCanvasObject={nodeCanvasObject}
              nodeLabel={nodeLabel}
              linkColor={linkColor as (link: unknown) => string}
              linkWidth={linkWidth as (link: unknown) => number}
              linkCurvature={0.15}
              linkDirectionalParticles={0}
              onNodeClick={onNodeClick}
              onNodeHover={onNodeHover}
              cooldownTicks={100}
              d3AlphaDecay={0.02}
              d3AlphaMin={0.2}
              enableNodeDrag
              enableZoomInteraction
              enablePanInteraction
            />
          </Suspense>
        </div>

        <aside className="w-80 shrink-0 rounded-untitled-xl border border-gray-200 bg-white shadow-untitled-sm">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900">Detalle del nodo</h3>
            <p className="mt-0.5 text-xs text-gray-500">Clic en un nodo para ver relaciones y acciones.</p>
          </div>
          <div className="p-4">
            {selectedNode ? (
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-white"
                    style={{ background: NODE_COLORS[selectedNode.type] ?? '#6b7280' }}
                  >
                    {selectedNode.type === 'User' && <User className="h-4 w-4" />}
                    {selectedNode.type === 'Device' && <Smartphone className="h-4 w-4" />}
                    {selectedNode.type === 'Email' && <Mail className="h-4 w-4" />}
                    {selectedNode.type === 'Phone' && <Phone className="h-4 w-4" />}
                    {selectedNode.type === 'Document' && <FileText className="h-4 w-4" />}
                    {selectedNode.type === 'Event' && <Zap className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900">{selectedNode.type}</p>
                    <p className="truncate text-xs text-gray-500" title={selectedNode.label}>{selectedNode.label}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                  <dt className="text-gray-500">ID</dt>
                  <dd className="truncate font-mono text-xs" title={selectedNode.id}>{selectedNode.id}</dd>
                  {selectedNode.riskScore != null && (
                    <>
                      <dt className="text-gray-500">Riesgo</dt>
                      <dd>{selectedNode.riskScore}%</dd>
                    </>
                  )}
                  {selectedNode.linkCount != null && (
                    <>
                      <dt className="text-gray-500">Relaciones</dt>
                      <dd>{selectedNode.linkCount}</dd>
                    </>
                  )}
                </dl>
                {selectedNode.isSuspicious && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 px-2.5 py-2 text-red-800">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span className="text-xs font-medium">Nodo marcado como sospechoso</span>
                  </div>
                )}
                {relatedUsers.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Usuarios vinculados</p>
                    <ul className="space-y-0.5">
                      {relatedUsers.slice(0, 5).map((uid) => (
                        <li key={uid}>
                          <Link to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${uid}`} className="font-medium text-koin-green hover:underline">
                            {uid}
                          </Link>
                        </li>
                      ))}
                      {relatedUsers.length > 5 && <li className="text-gray-500">+{relatedUsers.length - 5} más</li>}
                    </ul>
                  </div>
                )}
                {relatedEvents.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-500">Eventos vinculados</p>
                    <ul className="space-y-0.5">
                      {relatedEvents.slice(0, 5).map((eid) => (
                        <li key={eid}>
                          <Link to={`${ROUTES.antifraude.proteccionCuentaEventos}/${eid}`} className="font-medium text-koin-green hover:underline">
                            {eid}
                          </Link>
                        </li>
                      ))}
                      {relatedEvents.length > 5 && <li className="text-gray-500">+{relatedEvents.length - 5} más</li>}
                    </ul>
                  </div>
                )}
                <div className="flex flex-col gap-2 border-t border-gray-100 pt-2">
                  <button
                    type="button"
                    onClick={centerOnNode}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Centrar en nodo
                  </button>
                  {selectedNode.type === 'User' && typeof selectedNode.data?.userId === 'string' && (
                    <Link
                      to={`${ROUTES.antifraude.proteccionCuentaUsuarios}/${selectedNode.data.userId}`}
                      className="rounded-lg bg-koin-header px-3 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Ver usuario
                    </Link>
                  )}
                  {selectedNode.type === 'Event' && typeof selectedNode.data?.eventId === 'string' && (
                    <Link
                      to={`${ROUTES.antifraude.proteccionCuentaEventos}/${selectedNode.data.eventId}`}
                      className="rounded-lg bg-koin-header px-3 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
                    >
                      Ver evento
                    </Link>
                  )}
                  {relatedEvents.length > 0 && (
                    <Link
                      to={ROUTES.antifraude.proteccionCuentaEventos}
                      className="rounded-lg border border-koin-green px-3 py-2 text-center text-sm font-medium text-koin-green hover:bg-teal-50"
                    >
                      Ver eventos relacionados
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Haz clic en un nodo del grafo para ver su detalle, relaciones y acceder al usuario o evento.</p>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 rounded-untitled-lg border border-gray-200 bg-white px-4 py-3 shadow-untitled-xs">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Leyenda</p>
        {NODE_TYPES.map((type) => (
          <div key={type} className="flex items-center gap-2 text-sm">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-white"
              style={{ background: NODE_COLORS[type] }}
            >
              {type === 'User' && <User className="h-3.5 w-3.5" />}
              {type === 'Device' && <Smartphone className="h-3.5 w-3.5" />}
              {type === 'Email' && <Mail className="h-3.5 w-3.5" />}
              {type === 'Phone' && <Phone className="h-3.5 w-3.5" />}
              {type === 'Document' && <FileText className="h-3.5 w-3.5" />}
              {type === 'Event' && <Zap className="h-3.5 w-3.5" />}
            </span>
            <span className="text-gray-700">{type}</span>
          </div>
        ))}
      </div>
    </>
  )
}
