/** Preferencias de almacenamiento opcional; ausencia de consentimiento equivale a rechazo. */
export const COOKIE_PREFERENCES_KEY = "vecidya:cookie-preferences:v2";
export const COOKIE_PREFERENCES_EVENT = "vecidya:cookie-preferences-changed";
export type CookieCategory = "analytics" | "marketing";
export type CookiePreferences = Readonly<{ version: 2; necessary: true; analytics: boolean; marketing: boolean; savedAt: string }>;

export function parseCookiePreferences(raw: string | null): CookiePreferences | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
    const record = value as Record<string, unknown>;
    if (record.version !== 2 || record.necessary !== true || typeof record.analytics !== "boolean" || typeof record.marketing !== "boolean" || typeof record.savedAt !== "string" || !Number.isFinite(Date.parse(record.savedAt)) || Date.parse(record.savedAt) > Date.now() + 60_000) return null;
    return { version: 2, necessary: true, analytics: record.analytics, marketing: record.marketing, savedAt: record.savedAt };
  } catch { return null; }
}

export function readCookiePreferences(storage: Pick<Storage, "getItem">): CookiePreferences | null {
  try { return parseCookiePreferences(storage.getItem(COOKIE_PREFERENCES_KEY)); }
  catch { return null; }
}

export function canUseOptionalCookies(category: CookieCategory, storage: Pick<Storage, "getItem">): boolean {
  return readCookiePreferences(storage)?.[category] === true;
}

export function createCookiePreferences(analytics: boolean, marketing: boolean, date = new Date()): CookiePreferences {
  return { version: 2, necessary: true, analytics, marketing, savedAt: date.toISOString() };
}
