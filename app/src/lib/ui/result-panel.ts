/**
 * result-panel.ts — behavior helpers for the ResultPanel component.
 * Owner: MA1-DesignSystem. Framework-agnostic; used by island scripts.
 *
 * The generate-flow contract (ACCESSIBILITY.md §3.9, R6):
 *   1. island sets state to "loading"  -> polite "Generating…" (visible spinner)
 *   2. island renders results, sets state to "ready"
 *   3. island calls resultsReady(panel) -> focus moves to the results heading
 *      (tabindex="-1") AND announce.polite("<heading> ready") — no inline
 *      aria-live in tool code, ever.
 */

export type ResultState = "empty" | "loading" | "ready" | "error";

export interface ResultsReadyOptions {
  /** Override the polite announcement; defaults to "<heading text> ready". */
  announcement?: string;
  /** Move focus to the heading. Default true (§3.9). Set false only when the
   *  user's context must not move (e.g. debounced live preview). */
  moveFocus?: boolean;
}

function headingOf(panel: HTMLElement): HTMLElement | null {
  return panel.querySelector("[data-result-heading]");
}

/** Switch the panel's data-state (empty | loading | ready | error). */
export function setResultState(panel: HTMLElement, state: ResultState): void {
  panel.dataset.state = state;
}

/**
 * Call after results render. Moves focus to the results heading and makes
 * the polite "ready" announcement. Returns false when the panel has no
 * heading (a template bug — MA4 flags it).
 */
export function resultsReady(
  panel: HTMLElement,
  options: ResultsReadyOptions = {},
): boolean {
  const heading = headingOf(panel);
  if (!heading) return false;
  setResultState(panel, "ready");
  const { announcement, moveFocus = true } = options;
  if (moveFocus) {
    // Ensure the heading is focusable even if the template omitted tabindex.
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: false });
  }
  // Polite announcement via the shared announcer (dynamic import keeps the
  // announcer out of bundles that never announce).
  const msg = announcement ?? `${(heading.textContent ?? "Results").trim()} ready.`;
  import("../a11y/announce").then(({ announce }) => announce.polite(msg));
  return true;
}

/** Focus the results heading without announcing (e.g. error state review). */
export function focusResultHeading(panel: HTMLElement): boolean {
  const heading = headingOf(panel);
  if (!heading) return false;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus();
  return true;
}
