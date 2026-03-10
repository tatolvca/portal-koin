import type { AtoEvent, FinalDecision, Severity, AtoEventType } from "@/types/ato";
import { getRandomSignals } from "./signals";

const MERCHANTS = ["Koin Pay", "Koin Store", "Koin Banking", "Partner A"];
const ENVS: AtoEvent["environment"][] = ["production", "sandbox"];
const EVENT_TYPES: AtoEventType[] = [
  "LOGIN", "CHANGE_PASSWORD", "SIGN_UP", "CHANGE_PROFILE", "RESET_PASSWORD",
  "GENERAL_CHECKPOINT", "ATTEMPT_ADD_CARD_EVALUATION",
];
const SHARED_DEVICES = ["dev-cluster-1", "dev-cluster-2", "dev-cluster-3", "dev-single-1"];
const SHARED_EMAILS = ["reused@test.com", "multi@test.com"];
const SHARED_PHONES = ["+5511999990001", "+5511999990002"];
const SHARED_DOCS = ["DOC-SHARED-001", "DOC-SHARED-002"];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}
function ts(daysAgo: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(seededRandom(daysAgo * 7) * 60), 0, 0);
  return d.toISOString();
}

export function buildMockEvents(userIds: string[], count: number): AtoEvent[] {
  const events: AtoEvent[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 13 + 7;
    const riskScore = Math.floor(seededRandom(seed) * 85) + 5;
    const decision: FinalDecision = riskScore >= 75 ? "BLOCK" : riskScore >= 50 ? "CHALLENGE" : "ALLOW";
    const severity: Severity = riskScore >= 75 ? "critical" : riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low";
    const numSignals = Math.floor(seededRandom(seed + 1) * 4) + (riskScore > 60 ? 2 : 0);
    const signals = getRandomSignals(numSignals).slice(0, 5);
    const eventType = pick(EVENT_TYPES, seed + 2);
    const daysAgo = Math.floor(seededRandom(seed + 3) * 14);
    const hour = Math.floor(seededRandom(seed + 4) * 24);
    const userId = pick(userIds, seed + 5);
    const useSharedDevice = seededRandom(seed + 6) > 0.6;
    const useSharedEmail = eventType === "SIGN_UP" && seededRandom(seed + 7) > 0.7;
    const deviceId = useSharedDevice ? pick(SHARED_DEVICES, seed + 8) : `dev-${userId.slice(0, 8)}-${i}`;
    const email = useSharedEmail ? pick(SHARED_EMAILS, seed + 9) : `user-${userId.slice(0, 6)}@example.com`;
    const phone = useSharedEmail ? pick(SHARED_PHONES, seed + 10) : `+55119${String(i).padStart(7, "0")}`;
    const document = useSharedEmail && seededRandom(seed + 11) > 0.5 ? pick(SHARED_DOCS, seed + 12) : `DOC-${userId.slice(0, 8).toUpperCase()}`;
    const mfaStatus = decision === "CHALLENGE" ? (seededRandom(seed + 13) > 0.5 ? "passed" : "failed") : "not_required";
    const passkeyStatus = seededRandom(seed + 14) > 0.6 ? "present" : "not_present";
    events.push({
      eventId: `evt-${String(10000 + i).padStart(6, "0")}`,
      timestamp: ts(daysAgo, hour),
      merchant: pick(MERCHANTS, seed + 15),
      merchantId: `mch-${pick(["1", "2", "3"], seed + 16)}`,
      environment: pick(ENVS, seed + 17),
      eventType,
      userId,
      merchantUserId: `ext-${userId.slice(0, 8)}`,
      email,
      phone,
      document,
      deviceId,
      fingerprint: `fp-${deviceId}-${daysAgo}`,
      riskScore,
      finalDecision: decision,
      severity,
      triggeredSignals: signals,
      authMethod: passkeyStatus === "present" ? "passkey" : "password",
      mfaStatus: mfaStatus as AtoEvent["mfaStatus"],
      passkeyStatus: passkeyStatus as AtoEvent["passkeyStatus"],
      userStatus: riskScore > 70 && seededRandom(seed + 18) > 0.6 ? "blocked" : "active",
      networkLinkCount: useSharedDevice || useSharedEmail ? Math.floor(seededRandom(seed + 19) * 8) + 2 : 0,
      relatedEventIds: i > 2 ? [events[Math.max(0, i - 2)]?.eventId].filter(Boolean) : undefined,
      relatedUserIds: useSharedEmail ? userIds.filter((u) => u !== userId).slice(0, 3) : undefined,
    });
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getEventById(events: AtoEvent[], eventId: string): AtoEvent | undefined {
  return events.find((e) => e.eventId === eventId);
}
export function getEventsByUserId(events: AtoEvent[], userId: string): AtoEvent[] {
  return events.filter((e) => e.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
export function getHighRiskEvents(events: AtoEvent[], limit: number): AtoEvent[] {
  return events.filter((e) => e.riskScore >= 65).slice(0, limit);
}
