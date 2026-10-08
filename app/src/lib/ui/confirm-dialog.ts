/**
 * confirm-dialog.ts — promise API for the ConfirmDialog component.
 * Owner: MA1-DesignSystem. Framework-agnostic.
 *
 * ACCESSIBILITY.md R12: tool templates MUST NOT build their own confirm
 * dialogs — this is the single primitive (native <dialog>: free focus trap,
 * Esc handling, backdrop). Use for destructive/irreversible actions
 * (invoice delete, builder "clear all", 3.3.4) and for reset-confirmation
 * when user-entered data would be lost (§4.5).
 *
 * Focus is returned to the invoking control on close (2.1.2).
 */

export async function openConfirmDialog(id: string): Promise<boolean> {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  if (!dialog || dialog.tagName !== "DIALOG") {
    throw new Error(`openConfirmDialog: no <dialog> with id "${id}"`);
  }
  const invoker = document.activeElement as HTMLElement | null;

  return new Promise((resolve) => {
    let settled = false;
    const done = (value: boolean) => {
      if (settled) return;
      settled = true;
      dialog.close();
      dialog.removeEventListener("close", onClose);
      // Return focus to the control that opened the dialog.
      invoker?.focus?.();
      resolve(value);
    };
    const onClose = () => done(dialog.returnValue === "confirm");

    dialog.addEventListener("close", onClose);
    dialog
      .querySelectorAll("[data-confirm-value]")
      .forEach((btn) =>
        btn.addEventListener(
          "click",
          () => done((btn as HTMLElement).dataset.confirmValue === "confirm"),
          { once: true },
        ),
      );
    // Esc / backdrop dismissal resolves false via the close handler.
    dialog.showModal();
  });
}
