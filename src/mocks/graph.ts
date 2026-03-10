import type { GraphData, GraphNode, GraphEdge, AtoEvent, AtoUser } from "@/types/ato";

function nodeId(type: string, id: string): string {
  return `${type.toLowerCase()}-${id}`;
}

export function buildGraphFromEventsAndUsers(events: AtoEvent[], users: AtoUser[]): GraphData {
  const nodesMap = new Map<string, GraphNode>();
  const edgesMap = new Map<string, GraphEdge>();
  users.forEach((u) => {
    const id = nodeId("User", u.userId);
    if (!nodesMap.has(id)) {
      nodesMap.set(id, {
        id,
        type: "User",
        label: u.email ?? u.userId,
        data: { userId: u.userId, riskLevel: u.riskLevel },
        riskScore: u.riskLevel === "critical" ? 90 : u.riskLevel === "high" ? 70 : 40,
        isSuspicious: u.riskLevel === "high" || u.riskLevel === "critical",
        linkCount: u.linkedUsersCount + u.devicesCount,
      });
    }
  });
  events.slice(0, 80).forEach((e) => {
    const eventNodeId = nodeId("Event", e.eventId);
    if (!nodesMap.has(eventNodeId)) {
      nodesMap.set(eventNodeId, {
        id: eventNodeId,
        type: "Event",
        label: `${e.eventType} · ${e.eventId.slice(-6)}`,
        data: { eventId: e.eventId, eventType: e.eventType },
        riskScore: e.riskScore,
        isSuspicious: e.finalDecision === "BLOCK" || e.riskScore >= 70,
      });
    }
    const userNodeId = nodeId("User", e.userId);
    if (nodesMap.has(userNodeId)) {
      const edgeId = `e-${e.eventId}-${e.userId}`;
      if (!edgesMap.has(edgeId)) {
        edgesMap.set(edgeId, { id: edgeId, source: userNodeId, target: eventNodeId, type: "observed_in_event", eventId: e.eventId, timestamp: e.timestamp });
      }
    }
    if (e.email) {
      const emailId = nodeId("Email", e.email);
      if (!nodesMap.has(emailId)) nodesMap.set(emailId, { id: emailId, type: "Email", label: e.email, linkCount: e.networkLinkCount });
      const edgeE = `e-email-${e.eventId}-${e.email}`;
      if (!edgesMap.has(edgeE)) edgesMap.set(edgeE, { id: edgeE, source: eventNodeId, target: emailId, type: "registered_with" });
    }
    const devId = nodeId("Device", e.deviceId);
    if (!nodesMap.has(devId)) nodesMap.set(devId, { id: devId, type: "Device", label: e.deviceId.slice(0, 12) + "...", linkCount: e.networkLinkCount, isSuspicious: (e.networkLinkCount ?? 0) > 3 });
    const edgeD = `e-dev-${e.eventId}-${e.deviceId}`;
    if (!edgesMap.has(edgeD)) edgesMap.set(edgeD, { id: edgeD, source: eventNodeId, target: devId, type: "used_by" });
    if (e.phone) {
      const phoneId = nodeId("Phone", e.phone);
      if (!nodesMap.has(phoneId)) nodesMap.set(phoneId, { id: phoneId, type: "Phone", label: e.phone, linkCount: e.networkLinkCount });
      if (!edgesMap.has(`e-phone-${e.eventId}-${e.phone}`)) edgesMap.set(`e-phone-${e.eventId}-${e.phone}`, { id: `e-phone-${e.eventId}-${e.phone}`, source: eventNodeId, target: phoneId, type: "registered_with" });
    }
    if (e.document) {
      const docId = nodeId("Document", e.document);
      if (!nodesMap.has(docId)) nodesMap.set(docId, { id: docId, type: "Document", label: e.document.slice(0, 12) + "...", linkCount: e.networkLinkCount });
      const edgeDoc = `e-doc-${e.eventId}-${e.document}`;
      if (!edgesMap.has(edgeDoc)) edgesMap.set(edgeDoc, { id: edgeDoc, source: eventNodeId, target: docId, type: "registered_with" });
    }
  });
  return { nodes: Array.from(nodesMap.values()), edges: Array.from(edgesMap.values()) };
}

export function getSubgraphForUser(graph: GraphData, userId: string, depth: number): GraphData {
  const userNodeId = `user-${userId}`;
  const reached = new Set<string>([userNodeId]);
  for (let d = 0; d < depth; d++) {
    graph.edges.forEach((edge) => {
      if (reached.has(edge.source)) reached.add(edge.target);
      if (reached.has(edge.target)) reached.add(edge.source);
    });
  }
  return { nodes: graph.nodes.filter((n) => reached.has(n.id)), edges: graph.edges.filter((e) => reached.has(e.source) && reached.has(e.target)) };
}

export function getSubgraphForEvent(graph: GraphData, eventId: string): GraphData {
  const eventNodeId = `event-${eventId}`;
  const related = new Set<string>([eventNodeId]);
  graph.edges.forEach((edge) => {
    if (edge.source === eventNodeId || edge.target === eventNodeId) { related.add(edge.source); related.add(edge.target); }
  });
  return { nodes: graph.nodes.filter((n) => related.has(n.id)), edges: graph.edges.filter((e) => related.has(e.source) && related.has(e.target)) };
}

const ALLOWED_TYPES = new Set<GraphNode["type"]>(["User", "Device", "Email", "Phone", "Document", "Event"]);

/** Subgrafo desde un nodo foco hasta `depth` saltos. Solo tipos permitidos (sin Card/BankAccount). */
export function getSubgraphFromFocus(graph: GraphData, focusNodeId: string | null, depth: number): GraphData {
  const allowedNodes = graph.nodes.filter((n) => ALLOWED_TYPES.has(n.type));
  const seedId = focusNodeId ?? allowedNodes.find((n) => n.type === "User")?.id ?? allowedNodes[0]?.id;
  if (!seedId) return { nodes: [], edges: [] };
  const reached = new Set<string>([seedId]);
  for (let d = 0; d < depth; d++) {
    graph.edges.forEach((e) => {
      if (reached.has(e.source)) reached.add(e.target);
      if (reached.has(e.target)) reached.add(e.source);
    });
  }
  const nodes = allowedNodes.filter((n) => reached.has(n.id));
  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
  return { nodes, edges };
}

/** Nodo id sugerido para modo user-centered (primer usuario con varias conexiones). */
export function getDefaultFocusUser(graph: GraphData): string | null {
  const userNode = graph.nodes.find((n) => n.type === "User" && (n.linkCount ?? 0) >= 2);
  return userNode?.id ?? graph.nodes.find((n) => n.type === "User")?.id ?? null;
}

/** Nodo id sugerido para entity-centered (device/email con muchas conexiones). */
export function getDefaultFocusEntity(graph: GraphData): string | null {
  const entity = graph.nodes.find((n) => (n.type === "Device" || n.type === "Email") && (n.linkCount ?? 0) >= 2);
  return entity?.id ?? graph.nodes.find((n) => n.type === "Device" || n.type === "Email")?.id ?? null;
}

/** Nodo id sugerido para suspicious cluster. */
export function getDefaultFocusSuspicious(graph: GraphData): string | null {
  return graph.nodes.find((n) => n.isSuspicious)?.id ?? null;
}
