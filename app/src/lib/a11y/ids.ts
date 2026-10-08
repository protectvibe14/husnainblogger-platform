/**
 * ids.ts — per-instance id namespacing for components.
 * Owner: MA1-DesignSystem.
 *
 * ACCESSIBILITY.md R4: component reuse without namespacing produces
 * duplicate ids (two forms, two "results" sections), which breaks every
 * for/aria-describedby association on the page. Every component that emits
 * an id MUST derive it from nextId() unless the caller passes an explicit
 * id — and callers are responsible for that id's uniqueness.
 *
 * Astro-only: server-rendered per page. The counter is module-scoped, so
 * ids are unique within a page render. (Client islands that need ids
 * should use their own counter — see docs/architecture/DESIGN_SYSTEM.md.)
 */

let counter = 0;

/** Return a unique id like `hb-field-3`. */
export function nextId(prefix = "hb"): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/** Reset the counter — test-only hook (MA4). */
export function __resetIdCounter(): void {
  counter = 0;
}
