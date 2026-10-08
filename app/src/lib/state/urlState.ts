/**
 * state/urlState.ts
 *
 * Framework-agnostic helpers for shareable tool state in the URL query string.
 *
 * Rules (see docs/architecture/VALIDATION.md):
 * - Only primitive values (string | number | boolean), safe keys
 *   ([a-zA-Z][a-zA-Z0-9_]*). Anything else is a programmer error.
 * - State lives in ONE query param (default "s") as base64url(JSON).
 * - Hard length cap: a full share URL must stay under MAX_SHAREABLE_URL_LENGTH
 *   (2000 chars). Warn above URL_STATE_WARN_LENGTH (1800).
 * - decode* functions NEVER throw: malformed input → null, and the tool
 *   shows the INVALID_SHARED_STATE friendly message instead.
 * - Works in browsers and Node (btoa/atob are available in both).
 */

export const MAX_SHAREABLE_URL_LENGTH = 2000;
export const URL_STATE_WARN_LENGTH = 1800;
export const DEFAULT_STATE_PARAM = 's';

export type ToolStateValue = string | number | boolean;
export type ToolState = Record<string, ToolStateValue>;

const SAFE_KEY = /^[a-zA-Z][a-zA-Z0-9_]*$/;

function isToolStateValue(value: unknown): value is ToolStateValue {
  const t = typeof value;
  return t === 'string' || t === 'number' || t === 'boolean';
}

function isValidStateObject(value: unknown): value is ToolState {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  for (const key of Object.keys(value)) {
    if (!SAFE_KEY.test(key)) return false;
    if (!isToolStateValue((value as Record<string, unknown>)[key])) {
      return false;
    }
  }
  return true;
}

/** Unicode-safe base64url encode. */
function encodeBase64Url(text: string): string {
  const base64 = btoa(unescape(encodeURIComponent(text)));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Unicode-safe base64url decode. Returns null on any failure. */
function decodeBase64Url(encoded: string): string | null {
  try {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad === 2) base64 += '==';
    else if (pad === 3) base64 += '=';
    else if (pad !== 0) return null;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Encode tool state to a URL-safe string for the "s" query param.
 * @throws Error on programmer errors (unsafe keys, non-primitive values).
 *   Catching this is the framework wrapper's job; it indicates a bug,
 *   not user input.
 */
export function encodeToolState(state: ToolState): string {
  if (!isValidStateObject(state)) {
    throw new Error(
      'encodeToolState: state must be an object with safe keys ' +
        '([a-zA-Z][a-zA-Z0-9_]*) and primitive values (string|number|boolean).'
    );
  }
  return encodeBase64Url(JSON.stringify(state));
}

/**
 * Decode a state string back to an object. NEVER throws — returns null
 * for malformed/tampered input so the tool can show a friendly message.
 */
export function decodeToolState(encoded: string): ToolState | null {
  if (typeof encoded !== 'string' || encoded.length === 0) return null;
  const json = decodeBase64Url(encoded);
  if (json === null) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    return isValidStateObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export interface ShareLinkResult {
  /** Full shareable URL. */
  url: string;
  /** False when the URL would exceed the hard length cap. */
  ok: boolean;
  /** Present when the URL is getting long but still usable. */
  warning?: string;
}

/**
 * Build a shareable URL for the current tool state.
 * Returns ok:false (no exception) when the URL would be too long —
 * the tool should then tell the user the state is too large to share
 * (e.g. pasted text too long) instead of producing a broken link.
 */
export function buildShareLink(
  baseUrl: string,
  state: ToolState,
  paramName: string = DEFAULT_STATE_PARAM
): ShareLinkResult {
  const encoded = encodeToolState(state);
  const separator = baseUrl.includes('?') ? '&' : '?';
  const url = `${baseUrl}${separator}${paramName}=${encoded}`;
  if (url.length > MAX_SHAREABLE_URL_LENGTH) {
    return {
      url,
      ok: false,
      warning:
        'This result is too large to share as a link. Copy the result text instead.',
    };
  }
  if (url.length > URL_STATE_WARN_LENGTH) {
    return {
      url,
      ok: true,
      warning:
        'This share link is getting long; some apps may truncate it.',
    };
  }
  return { url, ok: true };
}

/**
 * Read tool state from a query string (e.g. location.search).
 * Returns null when the param is missing or invalid — never throws.
 */
export function parseToolStateFromQuery(
  queryString: string,
  paramName: string = DEFAULT_STATE_PARAM
): ToolState | null {
  try {
    const query = queryString.startsWith('?')
      ? queryString.slice(1)
      : queryString;
    const params = new URLSearchParams(query);
    const encoded = params.get(paramName);
    if (!encoded) return null;
    return decodeToolState(encoded);
  } catch {
    return null;
  }
}

/**
 * Serialize state WITHOUT encoding, for frameworks that manage the
 * query string themselves. Same validation rules as encodeToolState.
 */
export function stateToParams(
  state: ToolState,
  paramName: string = DEFAULT_STATE_PARAM
): string {
  const encoded = encodeToolState(state);
  return `${encodeURIComponent(paramName)}=${encoded}`;
}
