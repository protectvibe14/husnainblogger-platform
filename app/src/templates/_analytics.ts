/**
 * _analytics.ts — client-side analytics hook helpers for tool templates.
 *
 * NOTE (2026-10-01): docs/architecture/ANALYTICS_HOOKS.md does not exist yet
 * (MA5 owns it). Until it lands, templates use THIS taxonomy, fired as
 * `CustomEvent('hb:analytics')` on window with `detail = { event, ... }`.
 * MA5's snippet listens for that event and forwards to the real transport.
 * No network calls happen here — zero-cost, zero-backend rule preserved.
 *
 * Two integration styles:
 *  1. Declarative: add `data-analytics-event="tool_copy"` (+ optional
 *     `data-analytics-*` extra params) to any button/link. A single delegated
 *     listener (initAnalyticsDelegation, called once by ToolShell) fires it.
 *  2. Programmatic: call `trackEvent(name, params)` from template runtime
 *     code (used for tool_view, tool_run, tool_error — not click-driven).
 */

export const ANALYTICS_EVENT_NAME = 'hb:analytics';

/** Event taxonomy (proposed; MA5 to ratify in ANALYTICS_HOOKS.md). */
export const TOOL_EVENTS = {
  /** Fired once per page view when the tool island mounts. */
  VIEW: 'tool_view',
  /** Fired on every successful run. Params: outputCount. */
  RUN: 'tool_run',
  /** Fired when validation blocks a submit. Params: errorCount. */
  VALIDATION_ERROR: 'tool_validation_error',
  /** Fired when tool logic throws/returns !ok. Params: stage. */
  ERROR: 'tool_error',
  /** Fired on copy. Params: what. */
  COPY: 'tool_copy',
  /** Fired on download. Params: format. */
  DOWNLOAD: 'tool_download',
  /** Fired on reset. */
  RESET: 'tool_reset',
  /** Fired on share-link copy. Params: ok. */
  SHARE: 'tool_share',
  /** Fired when a "try it" example is used. Params: exampleIndex. */
  EXAMPLE_USE: 'tool_example_use',
} as const;

export type ToolEventName =
  (typeof TOOL_EVENTS)[keyof typeof TOOL_EVENTS] | string;

export interface AnalyticsContext {
  toolId: string;
  toolType: string;
  toolName: string;
}

let context: AnalyticsContext = { toolId: '', toolType: '', toolName: '' };

/** Called once per page by the template mount code. */
export function setAnalyticsContext(ctx: AnalyticsContext): void {
  context = ctx;
}

/**
 * Fire an analytics event. Safe to call before any snippet loads —
 * listeners attached later miss earlier events by design (no queueing,
 * keeps this dependency-free).
 */
export function trackEvent(
  event: ToolEventName,
  params: Record<string, unknown> = {},
): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(
      new CustomEvent(ANALYTICS_EVENT_NAME, {
        detail: { event, ...context, ...params },
      }),
    );
  } catch {
    /* analytics must never break the tool */
  }
}

let delegationInstalled = false;

/**
 * Install the single delegated click listener for
 * `[data-analytics-event]`. Idempotent — safe to call from every shell.
 *
 * Supported attributes:
 *  - data-analytics-event="tool_copy"      (required)
 *  - data-analytics-what="keyword list"    (optional extra params: any
 *    data-analytics-* attribute is forwarded, dasherized key preserved)
 */
export function initAnalyticsDelegation(): void {
  if (delegationInstalled || typeof document === 'undefined') return;
  delegationInstalled = true;
  document.addEventListener('click', (ev) => {
    const el = (ev.target as HTMLElement).closest?.(
      '[data-analytics-event]',
    ) as HTMLElement | null;
    if (!el) return;
    const params: Record<string, unknown> = {};
    for (const attr of Array.from(el.attributes)) {
      if (
        attr.name.startsWith('data-analytics-') &&
        attr.name !== 'data-analytics-event'
      ) {
        params[attr.name.slice('data-analytics-'.length)] = attr.value;
      }
    }
    trackEvent(el.getAttribute('data-analytics-event') || 'unknown', params);
  });
}
