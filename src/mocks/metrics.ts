import type { MetricSeries } from "@/types/ato";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}
function generateSeries(name: string, base: number, variance: number, points: number, trend: number): MetricSeries {
  const data: { date: string; value: number }[] = [];
  const d = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(d);
    date.setDate(date.getDate() - (points - i));
    const value = Math.round(base + (seededRandom(i * 7) * variance) + trend * i);
    data.push({ date: date.toISOString().slice(0, 10), value: Math.max(0, value) });
  }
  return { name, data };
}

export const MOCK_METRICS = {
  attack: {
    totalAtoEvents: generateSeries("Total ATO events", 1200, 200, 14, 5),
    highRiskRate: generateSeries("High risk %", 12, 3, 14, 0.2),
    blockedRate: generateSeries("Blocked %", 3, 1, 14, 0),
    repeatedDeviceRate: generateSeries("Repeated device rate %", 18, 5, 14, 0.5),
    suspiciousClusters: generateSeries("Suspicious clusters", 8, 2, 14, 0.2),
    uniqueAttackedUsers: generateSeries("Unique attacked users", 420, 80, 14, 3),
    eventTypeBreakdown: [
      { name: "LOGIN", value: 520, fill: "#6366f1" },
      { name: "SIGN_UP", value: 280, fill: "#8b5cf6" },
      { name: "RESET_PASSWORD", value: 180, fill: "#a78bfa" },
      { name: "CHANGE_PASSWORD", value: 120, fill: "#c4b5fd" },
    ],
    severitySplit: [
      { name: "Alto", value: 14, fill: "#f59e0b" },
      { name: "Crítico", value: 3, fill: "#dc2626" },
      { name: "Medio", value: 28, fill: "#6b7280" },
    ],
    decisionSplit: [
      { name: "ALLOW", value: 82, fill: "#10b981" },
      { name: "CHALLENGE", value: 12, fill: "#f59e0b" },
      { name: "BLOCK", value: 6, fill: "#ef4444" },
    ],
    topRiskyDevices: [
      { id: "dev-r1", events: 45, riskScore: 94 },
      { id: "dev-r2", events: 32, riskScore: 88 },
      { id: "dev-r3", events: 28, riskScore: 85 },
    ],
  },
  authentication: {
    mfaChallengeRate: generateSeries("MFA challenge rate %", 25, 5, 14, 1),
    mfaSuccessRate: generateSeries("MFA success rate %", 88, 4, 14, 0),
    mfaFailRate: generateSeries("MFA fail rate %", 4, 1.5, 14, -0.1),
    passkeyAdoption: generateSeries("Passkey adoption %", 35, 8, 14, 2),
    frictionRate: generateSeries("Friction rate %", 18, 4, 14, -0.2),
    stepUpRate: generateSeries("Step-up rate %", 22, 5, 14, 0.5),
    authMethodMix: [
      { name: "Password", value: 52, fill: "#3b82f6" },
      { name: "Passkey", value: 28, fill: "#0ea5e9" },
      { name: "OTP", value: 14, fill: "#38bdf8" },
      { name: "Step-up", value: 6, fill: "#7dd3fc" },
    ],
  },
  userIdentity: {
    activeUsers: generateSeries("Active users", 12000, 1500, 14, 50),
    newUsers: generateSeries("New users", 350, 80, 14, 5),
    blockedUsers: generateSeries("Blocked users", 45, 15, 14, 1),
    usersUnderReview: generateSeries("Users under review", 120, 30, 14, -5),
    trustedUsers: generateSeries("Trusted users", 9800, 800, 14, 40),
    linkedIdentitiesPerUser: generateSeries("Linked identities per user", 2.2, 0.4, 14, 0.02),
    usersWithReusedDevice: generateSeries("Users with reused device", 180, 40, 14, 2),
    suspiciousClusterCount: generateSeries("Suspicious clusters", 8, 3, 14, 0),
    usersByStatus: [
      { name: "Activos", value: 12000, fill: "#0d9488" },
      { name: "Trusted", value: 9800, fill: "#14b8a6" },
      { name: "Under review", value: 120, fill: "#f59e0b" },
      { name: "Blocked", value: 45, fill: "#ef4444" },
    ],
    topSuspiciousUsers: [
      { userId: "usr-s1", events: 28, riskScore: 91 },
      { userId: "usr-s2", events: 22, riskScore: 88 },
      { userId: "usr-s3", events: 19, riskScore: 85 },
    ],
  },
  operations: {
    alertsGenerated: generateSeries("Alerts generated", 250, 60, 14, 5),
    analystReviewQueue: generateSeries("Review queue size", 85, 25, 14, -3),
    avgTimeToDecision: generateSeries("Avg time to decision (min)", 8, 3, 14, 0),
    avgTimeToUnblock: generateSeries("Avg time to unblock (min)", 22, 8, 14, -1),
    manualInterventionRate: generateSeries("Manual intervention %", 5, 2, 14, 0),
    topSignalsVolume: generateSeries("Top signals volume", 520, 100, 14, 10),
    casesBySeverityCritical: generateSeries("Cases severity critical", 15, 5, 14, 0),
    topTriggeredSignals: [
      { name: "DEVICE_REUSE", count: 340 },
      { name: "NEW_DEVICE", count: 280 },
      { name: "MFA_FAIL", count: 120 },
      { name: "PHONE_REUSE", count: 95 },
      { name: "VELOCITY_EMAIL", count: 88 },
    ],
  },
  network: {
    mostConnectedDevices: [
      { id: "dev-cluster-1", count: 12, riskScore: 92 },
      { id: "dev-cluster-2", count: 8, riskScore: 78 },
      { id: "dev-single-1", count: 5, riskScore: 65 },
      { id: "dev-cluster-3", count: 4, riskScore: 72 },
    ],
    mostSharedPhones: [
      { id: "ph-1", users: 6, events: 24 },
      { id: "ph-2", users: 4, events: 18 },
    ],
    mostSharedDocuments: [
      { id: "doc-1", users: 3, events: 12 },
    ],
    suspiciousEntityCount: generateSeries("Suspicious entity count", 12, 4, 14, 0.5),
    clusterGrowth: generateSeries("Cluster growth", 3, 1, 14, 0.2),
    crossUserSharedIdentityRate: generateSeries("Cross-user shared identity %", 8, 2, 14, 0.3),
  },
};

export type TrendDirection = "up" | "down" | "neutral";

export interface KpiCardData {
  label: string;
  value: string | number;
  delta: number;
  trend: TrendDirection;
  sparkline: number[];
  microcopy?: string;
}

export interface MetricInsight {
  id: string;
  text: string;
  trend?: TrendDirection;
}

function lastValue(series: MetricSeries): number {
  return series.data.length ? series.data[series.data.length - 1].value : 0;
}
function prevValue(series: MetricSeries): number {
  return series.data.length >= 2 ? series.data[series.data.length - 2].value : lastValue(series);
}
function deltaPct(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
function spark(series: MetricSeries, points = 7): number[] {
  const d = series.data;
  const step = Math.max(1, Math.floor(d.length / points));
  return d.filter((_, i) => i % step === 0).map((x) => x.value);
}

const A = MOCK_METRICS.attack;
const Auth = MOCK_METRICS.authentication;
const U = MOCK_METRICS.userIdentity;
const O = MOCK_METRICS.operations;
const N = MOCK_METRICS.network;

export const METRICS_KPIS: Record<string, KpiCardData[]> = {
  Attack: [
    { label: "Total ATO events", value: lastValue(A.totalAtoEvents), delta: deltaPct(lastValue(A.totalAtoEvents), prevValue(A.totalAtoEvents)), trend: "up", sparkline: spark(A.totalAtoEvents), microcopy: "vs. período anterior" },
    { label: "High risk rate", value: `${lastValue(A.highRiskRate).toFixed(1)}%`, delta: lastValue(A.highRiskRate) - prevValue(A.highRiskRate), trend: lastValue(A.highRiskRate) >= prevValue(A.highRiskRate) ? "up" : "down", sparkline: spark(A.highRiskRate), microcopy: "pp vs. ant." },
    { label: "Blocked %", value: `${lastValue(A.blockedRate).toFixed(1)}%`, delta: deltaPct(lastValue(A.blockedRate), prevValue(A.blockedRate)), trend: "neutral", sparkline: spark(A.blockedRate) },
    { label: "Reused device rate", value: `${lastValue(A.repeatedDeviceRate).toFixed(1)}%`, delta: lastValue(A.repeatedDeviceRate) - prevValue(A.repeatedDeviceRate), trend: "up", sparkline: spark(A.repeatedDeviceRate) },
    { label: "Suspicious clusters", value: lastValue(A.suspiciousClusters), delta: lastValue(A.suspiciousClusters) - prevValue(A.suspiciousClusters), trend: "neutral", sparkline: spark(A.suspiciousClusters) },
    { label: "Unique attacked users", value: lastValue(A.uniqueAttackedUsers), delta: deltaPct(lastValue(A.uniqueAttackedUsers), prevValue(A.uniqueAttackedUsers)), trend: "up", sparkline: spark(A.uniqueAttackedUsers) },
  ],
  Autenticación: [
    { label: "MFA challenge rate", value: `${lastValue(Auth.mfaChallengeRate).toFixed(1)}%`, delta: lastValue(Auth.mfaChallengeRate) - prevValue(Auth.mfaChallengeRate), trend: "up", sparkline: spark(Auth.mfaChallengeRate) },
    { label: "MFA success rate", value: `${lastValue(Auth.mfaSuccessRate).toFixed(1)}%`, delta: lastValue(Auth.mfaSuccessRate) - prevValue(Auth.mfaSuccessRate), trend: "neutral", sparkline: spark(Auth.mfaSuccessRate), microcopy: "estable" },
    { label: "MFA fail rate", value: `${lastValue(Auth.mfaFailRate).toFixed(1)}%`, delta: lastValue(Auth.mfaFailRate) - prevValue(Auth.mfaFailRate), trend: "down", sparkline: spark(Auth.mfaFailRate) },
    { label: "Passkey adoption", value: `${lastValue(Auth.passkeyAdoption).toFixed(1)}%`, delta: lastValue(Auth.passkeyAdoption) - prevValue(Auth.passkeyAdoption), trend: "up", sparkline: spark(Auth.passkeyAdoption) },
    { label: "Friction rate", value: `${lastValue(Auth.frictionRate).toFixed(1)}%`, delta: lastValue(Auth.frictionRate) - prevValue(Auth.frictionRate), trend: "down", sparkline: spark(Auth.frictionRate) },
    { label: "Step-up rate", value: `${lastValue(Auth.stepUpRate).toFixed(1)}%`, delta: lastValue(Auth.stepUpRate) - prevValue(Auth.stepUpRate), trend: "up", sparkline: spark(Auth.stepUpRate) },
  ],
  "Usuario / Identidad": [
    { label: "Active users", value: lastValue(U.activeUsers).toLocaleString(), delta: deltaPct(lastValue(U.activeUsers), prevValue(U.activeUsers)), trend: "up", sparkline: spark(U.activeUsers) },
    { label: "Blocked users", value: lastValue(U.blockedUsers), delta: lastValue(U.blockedUsers) - prevValue(U.blockedUsers), trend: "up", sparkline: spark(U.blockedUsers) },
    { label: "Users under review", value: lastValue(U.usersUnderReview), delta: lastValue(U.usersUnderReview) - prevValue(U.usersUnderReview), trend: "down", sparkline: spark(U.usersUnderReview) },
    { label: "Trusted users", value: lastValue(U.trustedUsers).toLocaleString(), delta: deltaPct(lastValue(U.trustedUsers), prevValue(U.trustedUsers)), trend: "up", sparkline: spark(U.trustedUsers) },
    { label: "Linked identities/user", value: lastValue(U.linkedIdentitiesPerUser).toFixed(1), delta: lastValue(U.linkedIdentitiesPerUser) - prevValue(U.linkedIdentitiesPerUser), trend: "neutral", sparkline: spark(U.linkedIdentitiesPerUser) },
    { label: "Users with reused device", value: lastValue(U.usersWithReusedDevice), delta: lastValue(U.usersWithReusedDevice) - prevValue(U.usersWithReusedDevice), trend: "up", sparkline: spark(U.usersWithReusedDevice) },
  ],
  Operaciones: [
    { label: "Alerts generated", value: lastValue(O.alertsGenerated), delta: deltaPct(lastValue(O.alertsGenerated), prevValue(O.alertsGenerated)), trend: "up", sparkline: spark(O.alertsGenerated) },
    { label: "Review queue", value: lastValue(O.analystReviewQueue), delta: lastValue(O.analystReviewQueue) - prevValue(O.analystReviewQueue), trend: "down", sparkline: spark(O.analystReviewQueue) },
    { label: "Avg time to decision", value: `${lastValue(O.avgTimeToDecision)} min`, delta: lastValue(O.avgTimeToDecision) - prevValue(O.avgTimeToDecision), trend: "neutral", sparkline: spark(O.avgTimeToDecision) },
    { label: "Avg time to unblock", value: `${lastValue(O.avgTimeToUnblock)} min`, delta: lastValue(O.avgTimeToUnblock) - prevValue(O.avgTimeToUnblock), trend: "down", sparkline: spark(O.avgTimeToUnblock) },
    { label: "Manual intervention %", value: `${lastValue(O.manualInterventionRate).toFixed(1)}%`, delta: lastValue(O.manualInterventionRate) - prevValue(O.manualInterventionRate), trend: "down", sparkline: spark(O.manualInterventionRate), microcopy: "vs. ant." },
    { label: "Top signals volume", value: lastValue(O.topSignalsVolume), delta: deltaPct(lastValue(O.topSignalsVolume), prevValue(O.topSignalsVolume)), trend: "up", sparkline: spark(O.topSignalsVolume) },
  ],
  Red: [
    { label: "Cluster growth", value: lastValue(N.clusterGrowth).toFixed(1), delta: lastValue(N.clusterGrowth) - prevValue(N.clusterGrowth), trend: "up", sparkline: spark(N.clusterGrowth) },
    { label: "Cross-user shared identity %", value: `${lastValue(N.crossUserSharedIdentityRate).toFixed(1)}%`, delta: lastValue(N.crossUserSharedIdentityRate) - prevValue(N.crossUserSharedIdentityRate), trend: "up", sparkline: spark(N.crossUserSharedIdentityRate) },
    { label: "Most connected devices", value: N.mostConnectedDevices.length, delta: 0, trend: "neutral", sparkline: [12, 8, 5, 4], microcopy: "entidades" },
    { label: "Most shared phones", value: N.mostSharedPhones.length, delta: 0, trend: "neutral", sparkline: [6, 4] },
    { label: "Most shared documents", value: N.mostSharedDocuments.length, delta: 0, trend: "neutral", sparkline: [3] },
    { label: "Suspicious entity count", value: lastValue(N.suspiciousEntityCount), delta: lastValue(N.suspiciousEntityCount) - prevValue(N.suspiciousEntityCount), trend: "up", sparkline: spark(N.suspiciousEntityCount) },
  ],
};

export const METRICS_INSIGHTS: Record<string, MetricInsight[]> = {
  Attack: [
    { id: "a1", text: "High risk rate subió +3.1 pp vs. período anterior. Revisar picos en LOGIN.", trend: "up" },
    { id: "a2", text: "Device reuse concentrado en SIGN_UP (62% de reutilización en altas).", trend: "neutral" },
    { id: "a3", text: "Blocked % estable en 3.2%. Sin anomalías en decisión.", trend: "neutral" },
    { id: "a4", text: "2 clusters nuevos detectados. 1 dispositivo con 12 cuentas vinculadas.", trend: "up" },
  ],
  Autenticación: [
    { id: "b1", text: "MFA success rate estable en 88%. Tasa de fallo por debajo del 5%.", trend: "neutral" },
    { id: "b2", text: "Passkey adoption +2.1 pp. Crecimiento sostenido en el período.", trend: "up" },
    { id: "b3", text: "Friction rate bajó 0.4 pp. Menos abandonos en challenge.", trend: "down" },
    { id: "b4", text: "Step-up rate dentro de rango esperado (22%). Sin picos anómalos.", trend: "neutral" },
  ],
  "Usuario / Identidad": [
    { id: "c1", text: "Users under review bajaron 5 en la semana. Cola de revisión en descenso.", trend: "down" },
    { id: "c2", text: "Trusted users +0.4% vs. ant. Crecimiento de base confiable.", trend: "up" },
    { id: "c3", text: "3 usuarios con riesgo alto en revisión. Priorizar usr-s1 (91 risk).", trend: "neutral" },
  ],
  Operaciones: [
    { id: "d1", text: "Manual intervention bajó 1.4 pp. Más resolución automática.", trend: "down" },
    { id: "d2", text: "Review queue se redujo en 3 casos. Tiempo medio a decisión ~8 min.", trend: "down" },
    { id: "d3", text: "Avg time to decision estable ~8 min. Dentro de SLA.", trend: "neutral" },
    { id: "d4", text: "DEVICE_REUSE lidera señales (340). Seguido por NEW_DEVICE (280).", trend: "neutral" },
  ],
  Red: [
    { id: "e1", text: "Se detectaron 2 clusters nuevos. Crecimiento de entidades compartidas.", trend: "up" },
    { id: "e2", text: "Cross-user shared identity +0.3 pp. Monitorear dispositivos con >5 usuarios.", trend: "up" },
    { id: "e3", text: "3 dispositivos con >5 conexiones. dev-cluster-1 con risk score 92.", trend: "neutral" },
    { id: "e4", text: "Ver vista Red para grafo de relaciones y centrar en cluster sospechoso.", trend: "neutral" },
  ],
};
