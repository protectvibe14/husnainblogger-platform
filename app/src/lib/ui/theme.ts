/**
 * theme.ts — light/dark theme management.
 * Owner: MA1-DesignSystem. Framework-agnostic.
 *
 * Contract:
 *  - The active theme is `document.documentElement.dataset.theme`
 *    ("light" | "dark"); tokens.css re-anchors every --color-* token under
 *    `:root[data-theme="dark"]`. Components NEVER branch on theme.
 *  - Preference is stored in localStorage under `hb:v1:theme` (the reserved
 *    namespace from ARCHITECTURE.md §5 — preferences only, never tool inputs).
 *  - No stored preference -> follow the OS (prefers-color-scheme).
 *  - BaseLayout calls initTheme() as early as possible (inline head script)
 *    to avoid a theme flash; the toggle UI calls setTheme().
 */

export type Theme = "light" | "dark";

const STORAGE_KEY = "hb:v1:theme";
const THEME_ATTR = "data-theme";

function systemTheme(): Theme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

/** Read the effective theme: stored preference, else OS, else light. */
export function getTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* storage unavailable — fall through to system */
  }
  return systemTheme();
}

/**
 * Apply a theme to <html>. Idempotent. Also keeps `color-scheme` in sync
 * (tokens.css sets it per theme; this is the no-JS-safe fallback path).
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute(THEME_ATTR, theme);
}

/** Persist + apply. Called by the theme toggle. */
export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — still apply for the session */
  }
  applyTheme(theme);
}

/** Boot: resolve the effective theme and apply it. Call once per page. */
export function initTheme(): Theme {
  const theme = getTheme();
  applyTheme(theme);
  return theme;
}

/** The inline head snippet BaseLayout inlines (documented here, owned there):
 *
 * <script is:inline>
 *   try {
 *     var t = localStorage.getItem('hb:v1:theme');
 *     if (t !== 'light' && t !== 'dark') {
 *       t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
 *     }
 *     document.documentElement.setAttribute('data-theme', t);
 *   } catch (e) { document.documentElement.setAttribute('data-theme', 'light'); }
 * </script>
 */
export const HEAD_SNIPPET_NOTE = "see comment above";
