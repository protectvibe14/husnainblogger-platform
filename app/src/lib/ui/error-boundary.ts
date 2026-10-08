/**
 * error-boundary.ts — island error contract for ToolErrorBoundary.
 * Owner: MA1-DesignSystem. Framework-agnostic.
 *
 * How it works:
 *  1. Every interactive island wraps its boot code in try/catch. On failure
 *     it calls reportIslandError(boundaryEl, { island, message }) — or simply
 *     dispatches `new CustomEvent("hb:island-error", { bubbles: true,
 *     detail: { island, message } })` from anywhere inside the boundary.
 *  2. The boundary (ToolErrorBoundary.astro) catches the bubbling event,
 *     reveals its fallback panel (role="alert"), and KEEPS the island's DOM
 *     in place — user inputs are preserved, the page never goes blank.
 *  3. "Try again" re-runs retry handlers registered via onIslandRetry(), then
 *     re-dispatches "hb:island-retry" for islands that re-boot on the event.
 *     If no handler is registered, the button still offers the pre-filled
 *     report link — it never pretends a retry happened.
 *  4. window "error"/"unhandledrejection" events whose target is inside the
 *     boundary are also captured (capture phase) as a backstop.
 */

export interface IslandErrorDetail {
  /** Island name, e.g. "hashtag-generator". */
  island: string;
  /** Short, user-safe message (no stack traces to users). */
  message: string;
}

export const ISLAND_ERROR_EVENT = "hb:island-error";
export const ISLAND_RETRY_EVENT = "hb:island-retry";

type RetryHandler = () => void | Promise<void>;
const retryHandlers = new Map<string, Set<RetryHandler>>();

/** Islands register their re-boot logic; the boundary's Retry calls these. */
export function onIslandRetry(island: string, handler: RetryHandler): void {
  let set = retryHandlers.get(island);
  if (!set) {
    set = new Set();
    retryHandlers.set(island, set);
  }
  set.add(handler);
}

export function getRetryHandlers(island: string): RetryHandler[] {
  return Array.from(retryHandlers.get(island) ?? []);
}

/** Report a failure from inside a boundary element. */
export function reportIslandError(
  boundary: HTMLElement,
  detail: IslandErrorDetail,
): void {
  boundary.dispatchEvent(
    new CustomEvent<IslandErrorDetail>(ISLAND_ERROR_EVENT, {
      bubbles: true,
      detail,
    }),
  );
}
