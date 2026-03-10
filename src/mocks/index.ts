import { buildMockUsers, getUsersUnderWatch } from "./users";
import { buildMockEvents } from "./events";
import { buildGraphFromEventsAndUsers } from "./graph";
import type { AtoEvent, AtoUser, GraphData, DashboardKpis, InsightItem, TopReusedDevice, TopSignalCount } from "@/types/ato";
import { MOCK_SIGNALS } from "./signals";
import { ROUTES } from "@/config/routes";

const USERS = buildMockUsers(35);
const USER_IDS = USERS.map((u) => u.userId);
const EVENTS = buildMockEvents(USER_IDS, 120);
const GRAPH = buildGraphFromEventsAndUsers(EVENTS, USERS);

function getTopReusedDevices(events: AtoEvent[], limit: number): TopReusedDevice[] {
  const byDevice = new Map<string, { events: number; users: Set<string> }>();
  events.forEach((e) => {
    const cur = byDevice.get(e.deviceId) ?? { events: 0, users: new Set<string>() };
    cur.events += 1;
    cur.users.add(e.userId);
    byDevice.set(e.deviceId, cur);
  });
  return Array.from(byDevice.entries())
    .filter(([, v]) => v.users.size > 1 || v.events > 3)
    .map(([deviceId, v]) => ({ deviceId, eventCount: v.events, userCount: v.users.size }))
    .sort((a, b) => b.userCount - a.userCount || b.eventCount - a.eventCount)
    .slice(0, limit);
}

function getTopTriggeredSignals(events: AtoEvent[], limit: number): TopSignalCount[] {
  const counts = new Map<string, number>();
  events.forEach((e) => {
    e.triggeredSignals.forEach((s) => {
      counts.set(s.code, (counts.get(s.code) ?? 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([code, count]) => ({
      code,
      count,
      name: MOCK_SIGNALS.find((x) => x.code === code)?.name ?? code,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map(({ code, count, name }) => ({ signalCode: code, signalName: name, count }));
}

export const mockUsers: AtoUser[] = USERS;
export const mockEvents: AtoEvent[] = EVENTS;
export const mockGraph: GraphData = GRAPH;

export { buildGraphFromEventsAndUsers, getSubgraphForUser, getSubgraphForEvent } from "./graph";
export { getEventById, getEventsByUserId, getHighRiskEvents } from "./events";
export { getUserById, getUsersUnderWatch, getBlockedUsers } from "./users";
export { MOCK_SIGNALS, getSignalsByIds, getRandomSignals } from "./signals";
export { MOCK_METRICS, METRICS_KPIS, METRICS_INSIGHTS } from "./metrics";

const challengedEvents = EVENTS.filter((e) => e.finalDecision === "CHALLENGE" || e.mfaStatus !== "not_required");
const mfaChallenged = EVENTS.filter((e) => e.mfaStatus === "passed" || e.mfaStatus === "failed");
const mfaPassed = EVENTS.filter((e) => e.mfaStatus === "passed");
const passkeyPresent = EVENTS.filter((e) => e.passkeyStatus === "present");
const deviceReuseCount = getTopReusedDevices(EVENTS, 100).reduce((acc, d) => acc + d.eventCount, 0);
const blockedUsers = USERS.filter((u) => u.blocked || u.currentStatus === "blocked").length;

export const mockDashboardKpis: DashboardKpis = {
  totalEvents: EVENTS.length,
  totalEventsDelta: 4.2,
  highRiskRate: (EVENTS.filter((e) => e.riskScore >= 65).length / EVENTS.length) * 100,
  highRiskRateDelta: -1.2,
  blockedRate: (EVENTS.filter((e) => e.finalDecision === "BLOCK").length / EVENTS.length) * 100,
  blockedRateDelta: 0.3,
  challengeRate: (EVENTS.filter((e) => e.finalDecision === "CHALLENGE").length / EVENTS.length) * 100,
  challengeRateDelta: 2.1,
  usersUnderWatch: getUsersUnderWatch(USERS, 100).length,
  usersUnderWatchDelta: -2,
  uniqueUsersAffected: new Set(EVENTS.map((e) => e.userId)).size,
  uniqueUsersAffectedDelta: 1.5,
  blockedUsersCount: blockedUsers,
  mfaChallengeRate: EVENTS.length ? (challengedEvents.length / EVENTS.length) * 100 : 0,
  mfaSuccessRate: mfaChallenged.length ? (mfaPassed.length / mfaChallenged.length) * 100 : 0,
  passkeyAdoptionRate: EVENTS.length ? (passkeyPresent.length / EVENTS.length) * 100 : 0,
  reusedDeviceRate: EVENTS.length ? (deviceReuseCount / EVENTS.length) * 100 : 0,
  suspiciousClustersCount: getTopReusedDevices(EVENTS, 50).filter((d) => d.userCount >= 2).length,
};

export function getTopReusedDevicesOverview(limit = 10): TopReusedDevice[] {
  return getTopReusedDevices(EVENTS, limit);
}

export function getTopTriggeredSignalsOverview(limit = 10): TopSignalCount[] {
  return getTopTriggeredSignals(EVENTS, limit);
}

export const mockInsights: InsightItem[] = [
  { id: "ins-1", type: "anomaly", title: "Pico de RESET_PASSWORD", description: "Volumen de reset password 2.5x por encima del promedio en las últimas 24h.", severity: "medium", at: new Date().toISOString(), entityType: "event", link: `${ROUTES.antifraude.proteccionCuentaEventos}?quick=reset_password_spike` },
  { id: "ins-2", type: "alert", title: "Dispositivo dev-cluster-1 con 12 cuentas", description: "Un mismo dispositivo asociado a 12 usuarios distintos. Revisar cluster.", severity: "critical", at: new Date().toISOString(), entityType: "device", entityId: "dev-cluster-1", link: ROUTES.antifraude.proteccionCuentaRed },
  { id: "ins-3", type: "trend", title: "Sube adopción de passkey", description: "Passkey adoption +3% vs período anterior.", severity: "low", at: new Date().toISOString() },
  { id: "ins-4", type: "recommendation", title: "Revisar cola de revisión", description: "85 casos en cola. Considerar priorizar por severidad.", severity: "low", at: new Date().toISOString(), link: `${ROUTES.antifraude.proteccionCuentaEventos}?decision=CHALLENGE` },
];

export const mockSavedViews = [
  { id: "v1", name: "Alto riesgo hoy", filters: { riskMin: 70 }, columns: ["eventId", "timestamp", "eventType", "riskScore", "finalDecision"], isDefault: false },
  { id: "v2", name: "Bloqueados", filters: { finalDecision: "BLOCK" }, columns: ["eventId", "timestamp", "userId", "email", "finalDecision"], isDefault: false },
  { id: "v3", name: "MFA fallido", filters: { mfaStatus: "failed" }, columns: ["eventId", "timestamp", "userId", "mfaStatus", "riskScore"], isDefault: false },
];
