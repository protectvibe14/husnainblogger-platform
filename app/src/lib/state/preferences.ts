/**
 * state/preferences.ts
 *
 * Framework-agnostic localStorage wrapper for NON-SENSITIVE user
 * preferences ONLY (theme, units, last-visited category, dismissed hints).
 *
 * Hard rules:
 * - NEVER store tool inputs needed for correctness here; those live in
 *   component state or the URL (shareable).
 * - NEVER store anything sensitive. (The platform has no secrets, auth
 *   tokens, or PII by design — keep it that way.)
 * - NEVER store fake "live" data.
 * - All access is try/catch: private browsing / disabled storage must
 *   never break a tool. Failures return the fallback silently.
 * - Keys are namespaced ("hb_pref_") so tools can't collide.
 */

const KEY_PREFIX = 'hb_pref_';

/** Preference keys the platform is allowed to use. Extend deliberately. */
export type PreferenceKey =
  | 'theme' // 'light' | 'dark' | 'system'
  | 'units' // 'metric' | 'imperial'
  | 'lastCategory'
  | 'dismissedHints'; // string[]

function storageAvailable(): boolean {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function namespaced(key: PreferenceKey): string {
  return `${KEY_PREFIX}${key}`;
}

/** Read a preference. Returns `fallback` when missing/unreadable/invalid. */
export function getPreference<T>(key: PreferenceKey, fallback: T): T {
  if (!storageAvailable()) return fallback;
  try {
    const raw = localStorage.getItem(namespaced(key));
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Write a preference. Silently ignored when storage is unavailable. */
export function setPreference(key: PreferenceKey, value: unknown): void {
  if (!storageAvailable()) return;
  try {
    localStorage.setItem(namespaced(key), JSON.stringify(value));
  } catch {
    // Quota exceeded / disabled storage: preferences are best-effort.
  }
}

/** Remove a preference. Silently ignored when storage is unavailable. */
export function removePreference(key: PreferenceKey): void {
  if (!storageAvailable()) return;
  try {
    localStorage.removeItem(namespaced(key));
  } catch {
    // best-effort
  }
}
