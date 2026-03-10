/**
 * Tipos para el módulo ATO (Account Takeover) - Portal Koin
 */

export const ATO_EVENT_TYPES = [
  "LOGIN", "CHANGE_PASSWORD", "SIGN_UP", "CHANGE_PROFILE", "RESET_PASSWORD",
  "GENERAL_CHECKPOINT", "ATTEMPT_ADD_CARD_EVALUATION",
] as const;
export type AtoEventType = (typeof ATO_EVENT_TYPES)[number];

export type FinalDecision = "ALLOW" | "CHALLENGE" | "BLOCK";
export type Severity = "low" | "medium" | "high" | "critical";
export type UserStatus = "active" | "blocked" | "under_review" | "dormant";
export type AuthMethod = "password" | "passkey" | "otp" | "idv" | "step_up" | "none";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type TrustLevel = "unknown" | "low" | "medium" | "high" | "trusted";

export interface RiskSignal {
  id: string;
  code: string;
  name: string;
  description: string;
  severity: Severity;
  weight: number;
  category: "device" | "identity" | "behavior" | "network" | "velocity";
}

export interface Device {
  id: string;
  fingerprint: string;
  userAgent: string;
  ip?: string;
  country?: string;
  city?: string;
  firstSeen: string;
  lastSeen: string;
  isTrusted: boolean;
  deviceReuseCount?: number;
  riskFlags?: string[];
}

export interface TrustedDevice {
  deviceId: string;
  userId: string;
  addedAt: string;
  addedVia: AuthMethod;
  label?: string;
}

export interface Card {
  id: string;
  lastFour: string;
  brand: string;
  addedAt: string;
  isVerified: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  lastFour: string;
  type: string;
  addedAt: string;
  isVerified: boolean;
}

export interface AuthAttempt {
  id: string;
  timestamp: string;
  method: AuthMethod;
  success: boolean;
  eventId?: string;
  mfaChallenge?: boolean;
  passkeyUsed?: boolean;
}

export interface AtoEvent {
  eventId: string;
  timestamp: string;
  merchant: string;
  merchantId: string;
  environment: "production" | "sandbox";
  eventType: AtoEventType;
  userId: string;
  merchantUserId?: string;
  email?: string;
  phone?: string;
  document?: string;
  deviceId: string;
  fingerprint?: string;
  riskScore: number;
  finalDecision: FinalDecision;
  severity: Severity;
  triggeredSignals: RiskSignal[];
  authMethod: AuthMethod;
  mfaStatus: "not_required" | "passed" | "failed" | "pending" | "skipped";
  passkeyStatus: "present" | "not_present" | "not_applicable";
  userStatus: UserStatus;
  networkLinkCount: number;
  payload?: Record<string, unknown>;
  explanation?: string;
  relatedEventIds?: string[];
  relatedUserIds?: string[];
}

export interface AtoUser {
  userId: string;
  merchantUserId?: string;
  merchant: string;
  email?: string;
  phone?: string;
  document?: string;
  currentStatus: UserStatus;
  riskLevel: RiskLevel;
  trustLevel: TrustLevel;
  firstSeen: string;
  lastSeen: string;
  totalEvents: number;
  devicesCount: number;
  trustedDevicesCount: number;
  cardsCount: number;
  bankAccountsCount: number;
  mfaAdoption: boolean;
  passkeyAdoption: boolean;
  lastAuthMethod?: AuthMethod;
  blocked: boolean;
  linkedUsersCount: number;
  devices: Device[];
  trustedDevices: TrustedDevice[];
  cards: Card[];
  bankAccounts: BankAccount[];
  authHistory: AuthAttempt[];
  recentEventIds: string[];
  linkedIdentityIds?: string[];
  notes?: { at: string; by: string; text: string }[];
}

export type GraphNodeType = "User" | "Email" | "Phone" | "Document" | "Device" | "Event";
export type GraphEdgeType = "used_by" | "registered_with" | "authenticated_with" | "linked_to" | "observed_in_event";

export interface GraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  data?: Record<string, unknown>;
  riskScore?: number;
  isSuspicious?: boolean;
  linkCount?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: GraphEdgeType;
  eventId?: string;
  timestamp?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface MetricSeries {
  name: string;
  data: { date: string; value: number }[];
  previousPeriod?: { date: string; value: number }[];
}

export interface SavedView {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  columns: string[];
  isDefault?: boolean;
}

export interface DashboardKpis {
  totalEvents: number;
  totalEventsDelta: number;
  highRiskRate: number;
  highRiskRateDelta: number;
  blockedRate: number;
  blockedRateDelta: number;
  challengeRate: number;
  challengeRateDelta: number;
  usersUnderWatch: number;
  usersUnderWatchDelta: number;
  uniqueUsersAffected: number;
  uniqueUsersAffectedDelta: number;
  blockedUsersCount?: number;
  mfaChallengeRate?: number;
  mfaSuccessRate?: number;
  passkeyAdoptionRate?: number;
  reusedDeviceRate?: number;
  suspiciousClustersCount?: number;
}

export interface TopReusedDevice {
  deviceId: string;
  eventCount: number;
  userCount: number;
}

export interface TopSignalCount {
  signalCode: string;
  signalName: string;
  count: number;
}

export interface InsightItem {
  id: string;
  type: "alert" | "trend" | "anomaly" | "recommendation";
  title: string;
  description: string;
  severity: Severity;
  at: string;
  entityType?: "event" | "user" | "device";
  entityId?: string;
  link?: string;
}
