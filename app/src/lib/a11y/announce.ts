/**
 * announce.ts — shared live-region announcer.
 * Owner: MA1-DesignSystem.
 *
 * Framework-agnostic (vanilla TS, no Astro/Preact dependency). This is the
 * ONLY sanctioned way to send status messages to assistive technology.
 * Direct `aria-live` markup in tool templates / tool code is a lint error
 * (ACCESSIBILITY.md R5).
 *
 * Contract:
 *  - Exactly one polite region + one assertive region per page, rendered by
 *    the shell template (ToolPageLayout) near the top of <main>:
 *      <div id="hb-live-polite" class="hb-live-region" role="status"></div>
 *      <div id="hb-live-assertive" class="hb-live-region" role="alert"></div>
 *  - Tool code calls announce.polite("…") / announce.assertive("…").
 *  - Polite: "Results ready", "Copied", "Download started", progress done.
 *    NEVER interrupts current speech.
 *  - Assertive: ONLY for progress-blocking errors ("Generation failed",
 *    clipboard failure fallback, quota blockers). Abuse trains users to
 *    ignore it.
 *
 * Reliability notes:
 *  - Regions must exist in the DOM BEFORE the message text is set. Call
 *    initAnnouncer() once at page/island boot (idempotent). If announce()
 *    is called before init, it creates the regions itself and defers the
 *    message to the next animation frame so screen readers reliably pick
 *    it up — but templates should still render the regions in markup.
 *  - Throttle: keep announcements to ≤ 1 per ~2s (debounced previews,
 *    progress %). This module does not throttle; callers own the cadence
 *    (ACCESSIBILITY.md §4.3).
 */

export const POLITE_REGION_ID = "hb-live-polite";
export const ASSERTIVE_REGION_ID = "hb-live-assertive";

type Politeness = "polite" | "assertive";

function regionId(kind: Politeness): string {
  return kind === "polite" ? POLITE_REGION_ID : ASSERTIVE_REGION_ID;
}

function getRegion(kind: Politeness, doc: Document): HTMLElement | null {
  return doc.getElementById(regionId(kind));
}

function createRegion(kind: Politeness, doc: Document): HTMLElement {
  const el = doc.createElement("div");
  el.id = regionId(kind);
  el.className = "hb-live-region";
  if (kind === "polite") {
    el.setAttribute("role", "status");
  } else {
    el.setAttribute("role", "alert");
  }
  // Regions live near the top of <main> so "Copied" toasts / result
  // announcements are discoverable in the accessibility tree order.
  const main = doc.querySelector("main");
  if (main && main.firstChild) {
    main.insertBefore(el, main.firstChild);
  } else {
    doc.body.prepend(el);
  }
  return el;
}

/**
 * Ensure both live regions exist. Idempotent — safe to call from every
 * island's boot code. Templates SHOULD still render the regions in static
 * markup (they are then found, not created).
 */
export function initAnnouncer(doc: Document = document): void {
  (["polite", "assertive"] as Politeness[]).forEach((kind) => {
    if (!getRegion(kind, doc)) createRegion(kind, doc);
  });
}

function setMessage(kind: Politeness, message: string, doc: Document): void {
  let region = getRegion(kind, doc);
  let created = false;
  if (!region) {
    region = createRegion(kind, doc);
    created = true;
  }
  // Clear-then-set forces re-announcement of repeated identical messages.
  // When the region was just created, defer the set by a frame: an empty
  // region injected in the same tick as its message is not reliably
  // announced by all screen readers.
  const apply = () => {
    if (!region) return;
    region.textContent = "";
    // Force a DOM mutation beat between clear and set.
    requestAnimationFrame(() => {
      if (region) region.textContent = message;
    });
  };
  if (created) {
    requestAnimationFrame(apply);
  } else {
    apply();
  }
}

/** Clear a region (e.g. dismiss a stale status before a new run). */
export function clearAnnouncement(
  kind: Politeness,
  doc: Document = document,
): void {
  const region = getRegion(kind, doc);
  if (region) region.textContent = "";
}

export const announce = {
  /**
   * Polite status: results ready, copied, download started, form cleared,
   * progress complete. Does not interrupt the user.
   */
  polite(message: string, doc: Document = document): void {
    if (!message) return;
    setMessage("polite", message, doc);
  },

  /**
   * Assertive: progress-BLOCKING errors only (error summary is rendered
   * with role="alert" by ErrorSummary — do NOT also announce it here).
   * Examples: "Generation failed", clipboard-denied fallback instructions.
   */
  assertive(message: string, doc: Document = document): void {
    if (!message) return;
    setMessage("assertive", message, doc);
  },
};
