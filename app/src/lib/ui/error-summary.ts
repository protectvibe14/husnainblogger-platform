/**
 * error-summary.ts — behavior helpers for the ErrorSummary component.
 * Owner: MA1-DesignSystem. Framework-agnostic; used by island scripts.
 *
 * The validation contract (ACCESSIBILITY.md §4.1, D4):
 *  - ≥2 invalid fields: render the summary (role="alert"), move focus to
 *    the summary heading, each link jumps to its field.
 *  - 1 invalid field: NO summary — focus moves to the field itself.
 *
 * Error strings MUST suggest the fix (3.3.3) — the Validation agent owns
 * message text; this module only renders it.
 */

export interface FieldError {
  /** id of the invalid input (link target). */
  fieldId: string;
  /** Human label of the field, e.g. "Email". */
  label: string;
  /** Suggestion-carrying message, e.g. "Enter a valid email address." */
  message: string;
}

function headingOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector("[data-error-summary-heading]");
}

function listOf(container: HTMLElement): HTMLElement | null {
  return container.querySelector("[data-error-summary-list]");
}

/**
 * Populate + reveal the summary and move focus to its heading.
 * Returns false when the container is malformed (template bug).
 */
export function showErrorSummary(
  container: HTMLElement,
  errors: FieldError[],
): boolean {
  const heading = headingOf(container);
  const list = listOf(container);
  if (!heading || !list || errors.length === 0) return false;

  const n = errors.length;
  heading.textContent =
    n === 1 ? "There is 1 problem" : `There are ${n} problems`;
  list.innerHTML = "";
  for (const err of errors) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${err.fieldId}`;
    // Link text names the field AND the fix (3.3.1, 3.3.3).
    a.textContent = `${err.label}: ${err.message}`;
    // Jump-to-field that also moves keyboard focus (not just scroll).
    a.addEventListener("click", (e) => {
      const field = document.getElementById(err.fieldId);
      if (field) {
        e.preventDefault();
        field.focus({ preventScroll: false });
        field.scrollIntoView({ block: "center" });
      }
    });
    li.appendChild(a);
    list.appendChild(li);
  }
  container.hidden = false;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus();
  return true;
}

/** Hide + empty the summary (call on successful submit / reset). */
export function clearErrorSummary(container: HTMLElement): void {
  const list = listOf(container);
  if (list) list.innerHTML = "";
  container.hidden = true;
}
