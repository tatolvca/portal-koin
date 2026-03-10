import type { AtoUser, Device, TrustedDevice, Card, BankAccount, AuthAttempt } from "@/types/ato";

const MERCHANTS = ["Koin Pay", "Koin Store", "Koin Banking"];
const STATUSES: AtoUser["currentStatus"][] = ["active", "blocked", "under_review", "dormant"];
const RISK_LEVELS: AtoUser["riskLevel"][] = ["low", "medium", "high", "critical"];
const TRUST_LEVELS: AtoUser["trustLevel"][] = ["unknown", "low", "medium", "high", "trusted"];

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}
function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}
function ts(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

export function buildMockUsers(count: number): AtoUser[] {
  const users: AtoUser[] = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 17 + 11;
    const userId = `usr-${String(1000 + i).padStart(4, "0")}`;
    const blocked = pick(STATUSES, seed) === "blocked";
    const riskLevel = pick(RISK_LEVELS, seed + 1);
    const devicesCount = Math.floor(seededRandom(seed + 2) * 4) + 1;
    const trustedCount = Math.min(Math.floor(seededRandom(seed + 3) * devicesCount), devicesCount);
    const cardsCount = Math.floor(seededRandom(seed + 4) * 3);
    const bankCount = Math.floor(seededRandom(seed + 5) * 2);
    const mfaAdoption = seededRandom(seed + 6) > 0.35;
    const passkeyAdoption = seededRandom(seed + 7) > 0.5;
    const linkedCount = riskLevel === "high" || riskLevel === "critical" ? Math.floor(seededRandom(seed + 8) * 5) + 1 : 0;
    const devices: Device[] = Array.from({ length: devicesCount }, (_, j) => ({
      id: `dev-${userId}-${j}`,
      fingerprint: `fp-${userId}-${j}`,
      userAgent: j === 0 ? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0" : "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/605.1",
      ip: `192.168.${i}.${j + 1}`,
      country: "BR",
      city: j === 0 ? "São Paulo" : "Rio de Janeiro",
      firstSeen: ts(30 + j * 5),
      lastSeen: ts(j),
      isTrusted: j < trustedCount,
      deviceReuseCount: riskLevel === "high" ? 2 + j : undefined,
      riskFlags: riskLevel === "critical" ? ["reuse", "vpn"] : undefined,
    }));
    const trustedDevices: TrustedDevice[] = devices.filter((d) => d.isTrusted).slice(0, 2).map((d, j) => ({
      deviceId: d.id,
      userId,
      addedAt: d.firstSeen,
      addedVia: "password" as const,
      label: j === 0 ? "Laptop principal" : "Celular",
    }));
    const cards: Card[] = Array.from({ length: cardsCount }, (_, j) => ({
      id: `card-${userId}-${j}`,
      lastFour: String(1000 + j * 1111).slice(-4),
      brand: pick(["Visa", "Mastercard"], seed + j),
      addedAt: ts(20 - j * 5),
      isVerified: true,
    }));
    const bankAccounts: BankAccount[] = Array.from({ length: bankCount }, (_, j) => ({
      id: `bank-${userId}-${j}`,
      bankName: pick(["Banco Koin", "Itaú", "Bradesco"], seed + j + 10),
      lastFour: String(2000 + j).slice(-4),
      type: "checking",
      addedAt: ts(25 - j),
      isVerified: true,
    }));
    const authHistory: AuthAttempt[] = [
      { id: `auth-${userId}-1`, timestamp: ts(1), method: "password", success: true },
      ...(mfaAdoption ? [{ id: `auth-${userId}-2`, timestamp: ts(0), method: "otp" as const, success: true, mfaChallenge: true }] : []),
      ...(passkeyAdoption ? [{ id: `auth-${userId}-3`, timestamp: ts(0), method: "passkey" as const, success: true, passkeyUsed: true }] : []),
    ].slice(0, 5) as AuthAttempt[];
    users.push({
      userId,
      merchantUserId: `ext-${userId}`,
      merchant: pick(MERCHANTS, seed + 20),
      email: `user-${userId.slice(4)}@example.com`,
      phone: `+55119${String(8000000 + i).padStart(7, "0")}`,
      document: `DOC-${userId.toUpperCase().replace("usr-", "")}`,
      currentStatus: blocked ? "blocked" : pick(STATUSES, seed + 21),
      riskLevel,
      trustLevel: pick(TRUST_LEVELS, seed + 22),
      firstSeen: ts(90),
      lastSeen: ts(0),
      totalEvents: Math.floor(seededRandom(seed + 23) * 50) + 5,
      devicesCount,
      trustedDevicesCount: trustedCount,
      cardsCount,
      bankAccountsCount: bankCount,
      mfaAdoption,
      passkeyAdoption,
      lastAuthMethod: passkeyAdoption ? "passkey" : mfaAdoption ? "otp" : "password",
      blocked,
      linkedUsersCount: linkedCount,
      devices,
      trustedDevices,
      cards,
      bankAccounts,
      authHistory,
      recentEventIds: [],
      notes: i % 5 === 0 ? [{ at: ts(2), by: "analyst-1", text: "Usuario en observación por dispositivo reutilizado." }] : undefined,
    });
  }
  return users;
}
export function getUserById(users: AtoUser[], userId: string): AtoUser | undefined {
  return users.find((u) => u.userId === userId);
}
export function getUsersUnderWatch(users: AtoUser[], limit: number): AtoUser[] {
  return users.filter((u) => u.currentStatus === "under_review" || u.riskLevel === "high" || u.riskLevel === "critical").slice(0, limit);
}
export function getBlockedUsers(users: AtoUser[]): AtoUser[] {
  return users.filter((u) => u.blocked);
}
