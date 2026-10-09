/**
 * lib/admin-auth.ts — session-scoped admin authentication.
 * Owner: Admin / Security.
 *
 * SECURITY MODEL (static site, no backend):
 * - The GitHub PAT is kept in `sessionStorage` ONLY — it dies with the
 *   tab/window and is never written to disk (unlike localStorage).
 * - Sessions expire: absolute TTL 8h from login, plus 30min idle timeout.
 * - Expiry is fail-closed: storage is cleared before any error is thrown.
 * - Legacy localStorage keys (`hb_admin_token`, `hb_admin_session`) are
 *   deleted on the login page — old forever-lived tokens must not linger.
 *
 * This does NOT protect against XSS running in the admin origin itself
 * (no client-side scheme can); it shrinks the token theft window from
 * "indefinite on disk" to "this tab, this session". The remaining
 * mitigations are operational: repo-scoped fine-grained PAT, never use
 * on shared machines, rotate on suspected compromise.
 */

const AUTH_KEY = "hb_admin_auth";
const LEGACY_KEYS = ["hb_admin_token", "hb_admin_session"];

const ABSOLUTE_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const IDLE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const IDLE_CHECK_MS = 60 * 1000; // re-check every minute

interface AuthSession {
  repo: string;
  at: number; // login timestamp (ms)
  lastActive: number; // last activity timestamp (ms)
}

let idleTimer: number | null = null;
let listenersArmed = false;

function readSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as AuthSession;
    if (!s || typeof s.at !== "number" || typeof s.lastActive !== "number") return null;
    return s;
  } catch {
    return null;
  }
}

function writeSession(s: AuthSession): void {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify(s));
}

/** Token stored under a separate key from the session metadata. */
function tokenKey(): string {
  return AUTH_KEY + ":token";
}

export function clearLegacyStorage(): void {
  for (const k of LEGACY_KEYS) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* storage unavailable — nothing to clean */
    }
  }
}

export function login(token: string, repo: string): void {
  const now = Date.now();
  writeSession({ repo, at: now, lastActive: now });
  try {
    sessionStorage.setItem(tokenKey(), token);
  } catch {
    throw new Error("Could not store session (storage unavailable).");
  }
  armIdleTracking();
}

export function logout(): void {
  try {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(tokenKey());
  } catch {
    /* ignore */
  }
  if (idleTimer !== null) {
    clearInterval(idleTimer);
    idleTimer = null;
  }
  listenersArmed = false;
}

/** Fail-closed validity check. Clears storage when the session is dead. */
export function isLoggedIn(): boolean {
  const s = readSession();
  let token: string | null = null;
  try {
    token = sessionStorage.getItem(tokenKey());
  } catch {
    token = null;
  }
  if (!s || !token) {
    return false;
  }
  const now = Date.now();
  if (now - s.at > ABSOLUTE_TTL_MS || now - s.lastActive > IDLE_TTL_MS) {
    logout();
    return false;
  }
  return true;
}

/** Returns the PAT, refreshing the idle clock. Throws when not logged in. */
export function getToken(): string {
  if (!isLoggedIn()) {
    throw new Error("Not logged in or session expired. Please sign in again.");
  }
  touch();
  const t = sessionStorage.getItem(tokenKey());
  if (!t) {
    logout();
    throw new Error("Not logged in.");
  }
  return t;
}

export function getSessionRepo(): string | null {
  const s = readSession();
  return s ? s.repo : null;
}

/** Refresh the idle timestamp (called on user activity + token use). */
export function touch(): void {
  const s = readSession();
  if (!s) return;
  s.lastActive = Date.now();
  writeSession(s);
}

function onActivity(): void {
  if (!isLoggedIn()) return;
  touch();
}

function armIdleTracking(): void {
  if (listenersArmed) return;
  listenersArmed = true;
  const events = ["click", "keydown", "scroll", "touchstart"];
  for (const ev of events) {
    window.addEventListener(ev, onActivity, { passive: true });
  }
  idleTimer = window.setInterval(() => {
    // Auto-logout when the idle TTL lapses, even in a background tab.
    if (!isLoggedIn()) {
      if (
        window.location.pathname.startsWith("/admin/") &&
        !window.location.pathname.startsWith("/admin/login")
      ) {
        window.location.href = "/admin/login/";
      }
    }
  }, IDLE_CHECK_MS);
}

// If a session survived (same tab reloaded), re-arm idle tracking.
if (typeof window !== "undefined" && readSession()) {
  armIdleTracking();
}
