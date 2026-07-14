/**
 * Simple in-memory cache for WeddingDataProvider data.
 * Allows the admin dashboard to restore immediately when navigating back,
 * while still fetching fresh data in the background.
 */
interface CachedData {
  guests: any[];
  wishes: any[];
  photos: any[];
  settings: any;
  bankName: string;
  bankAccount: string;
  bankQR: string;
  giftEnabled: boolean;
  programSchedule: any[];
  settingsId: string | null;
  timestamp: number;
}

const cache = new Map<string, CachedData>();
const MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

export function getCachedAdminData(ownerUserId: string): CachedData | null {
  const entry = cache.get(ownerUserId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > MAX_AGE_MS) {
    cache.delete(ownerUserId);
    return null;
  }
  return entry;
}

export function setCachedAdminData(ownerUserId: string, data: Omit<CachedData, 'timestamp'>) {
  cache.set(ownerUserId, { ...data, timestamp: Date.now() });
}

export function clearCachedAdminData(ownerUserId: string) {
  cache.delete(ownerUserId);
}