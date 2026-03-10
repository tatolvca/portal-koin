import type { RiskSignal } from "@/types/ato";

export const MOCK_SIGNALS: RiskSignal[] = [
  { id: "sig-1", code: "DEVICE_REUSE", name: "Device reuse", description: "Device seen with multiple accounts", severity: "high", weight: 0.25, category: "device" },
  { id: "sig-2", code: "NEW_DEVICE", name: "New device", description: "First time this device for user", severity: "medium", weight: 0.15, category: "device" },
  { id: "sig-3", code: "IMPOSSIBLE_TRAVEL", name: "Impossible travel", description: "Location change inconsistent with time", severity: "critical", weight: 0.35, category: "behavior" },
  { id: "sig-4", code: "VELOCITY_EMAIL", name: "Email velocity", description: "Same email in many events in short time", severity: "high", weight: 0.22, category: "velocity" },
  { id: "sig-5", code: "PHONE_REUSE", name: "Phone reuse", description: "Phone linked to multiple users", severity: "high", weight: 0.2, category: "identity" },
  { id: "sig-6", code: "DOC_REUSE", name: "Document reuse", description: "Document linked to multiple users", severity: "critical", weight: 0.3, category: "identity" },
  { id: "sig-7", code: "MFA_FAIL", name: "MFA failure", description: "Multi-factor authentication failed", severity: "high", weight: 0.28, category: "behavior" },
  { id: "sig-8", code: "NO_PASSKEY", name: "No passkey", description: "High-risk event without passkey", severity: "medium", weight: 0.12, category: "behavior" },
  { id: "sig-9", code: "RESET_PASSWORD_SPIKE", name: "Reset password spike", description: "Unusual volume of password resets", severity: "medium", weight: 0.18, category: "velocity" },
  { id: "sig-10", code: "PROFILE_CHANGE_RISK", name: "Risky profile change", description: "Sensitive profile fields changed", severity: "medium", weight: 0.16, category: "behavior" },
  { id: "sig-11", code: "SIGNUP_SAME_DEVICE", name: "Multiple signups same device", description: "Several sign_ups from same device", severity: "critical", weight: 0.32, category: "device" },
  { id: "sig-12", code: "DORMANT_REACTIVATION", name: "Dormant then reactivated", description: "Long inactive account suddenly active", severity: "medium", weight: 0.14, category: "behavior" },
  { id: "sig-13", code: "HIGH_LINK_DENSITY", name: "High link density", description: "User shares many attributes with others", severity: "high", weight: 0.2, category: "network" },
  { id: "sig-14", code: "NEW_TRUSTED_DEVICE", name: "New trusted device", description: "Device recently marked as trusted", severity: "low", weight: 0.05, category: "device" },
];

export function getSignalsByIds(ids: string[]): RiskSignal[] {
  return ids.map((id) => MOCK_SIGNALS.find((s) => s.id === id)).filter(Boolean) as RiskSignal[];
}

export function getRandomSignals(count: number, severity?: RiskSignal["severity"]): RiskSignal[] {
  const pool = severity ? MOCK_SIGNALS.filter((s) => s.severity === severity) : MOCK_SIGNALS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
