/**
 * lib/ai/key-vault.ts — bring-your-own-key storage + UI for Lane B/D tools.
 *
 * Keys live ONLY in the visitor's browser (localStorage, keyed per provider).
 * They are sent directly to the chosen provider's API and never to our
 * servers (the site is static — there are no servers to send them to).
 * This module renders the key-vault card and notifies clients of changes
 * via a "hb:keyvault-change" CustomEvent on window.
 */

import { getProviderInfo, needsCorsWarning } from "./providers.ts";

const PREFIX = "hb-ai-key-";
const CHANGE_EVENT = "hb:keyvault-change";

function storageKey(providerId: string): string {
  return `${PREFIX}${providerId}`;
}

/** Read a stored key, or null. Safe to call during SSR (returns null). */
export function getKey(providerId: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const v = localStorage.getItem(storageKey(providerId));
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

/** Persist a key. Emits hb:keyvault-change. */
export function setKey(providerId: string, key: string): void {
  localStorage.setItem(storageKey(providerId), key.trim());
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { providerId, present: true } }));
}

/** Remove a key. Emits hb:keyvault-change. */
export function clearKey(providerId: string): void {
  localStorage.removeItem(storageKey(providerId));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { providerId, present: false } }));
}

/** Subscribe to key changes. Returns an unsubscribe function. */
export function onKeyChange(cb: (providerId: string, present: boolean) => void): () => void {
  const handler = (e: Event) => {
    const d = (e as CustomEvent).detail as { providerId: string; present: boolean };
    cb(d.providerId, d.present);
  };
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}

export interface KeyVaultOptions {
  /** Provider ids in the order they should appear. */
  providers: string[];
  /** Optional intro line above the vault. */
  intro?: string;
  /** Compact mode: single provider, smaller footprint. */
  compact?: boolean;
}

function el(tag: string, cls: string, text?: string): HTMLElement {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/**
 * Render the key-vault card into `container`. Idempotent — clears container first.
 * Shows per-provider: status (saved/not saved), key input with show/hide,
 * save/clear buttons, "get a free key" link, cost + CORS disclosures.
 */
export function renderKeyVault(container: HTMLElement, opts: KeyVaultOptions): void {
  container.innerHTML = "";
  const card = el("div", "hb-keyvault" + (opts.compact ? " hb-keyvault--compact" : ""));

  const title = el("h3", "hb-keyvault__title", "Your API key");
  card.appendChild(title);

  const privacy = el(
    "p",
    "hb-keyvault__privacy",
    "Stored only in this browser (localStorage). Your key is sent directly to the provider you choose — never to our servers. We run a static site with zero backend, so we cannot see or log it.",
  );
  card.appendChild(privacy);

  if (opts.intro) card.appendChild(el("p", "hb-keyvault__intro", opts.intro));

  for (const pid of opts.providers) {
    const info = getProviderInfo(pid);
    if (!info) continue;
    const row = el("div", "hb-keyvault__row");
    row.dataset.provider = pid;

    const head = el("div", "hb-keyvault__row-head");
    const nameWrap = el("div", "hb-keyvault__name-wrap");
    nameWrap.appendChild(el("strong", "hb-keyvault__name", info.name));
    const status = el("span", "hb-keyvault__status", getKey(pid) ? "Saved ✓" : "Not saved");
    status.dataset.role = "status";
    if (getKey(pid)) status.classList.add("is-saved");
    nameWrap.appendChild(status);
    head.appendChild(nameWrap);

    const getKeyLink = document.createElement("a");
    getKeyLink.href = info.keyUrl;
    getKeyLink.target = "_blank";
    getKeyLink.rel = "noopener noreferrer nofollow";
    getKeyLink.className = "hb-keyvault__getkey";
    getKeyLink.textContent = "Get a free key ↗";
    head.appendChild(getKeyLink);
    row.appendChild(head);

    const form = el("div", "hb-keyvault__form");
    const input = document.createElement("input");
    input.type = "password";
    input.placeholder = `Paste your ${info.name} key`;
    input.autocomplete = "off";
    input.spellcheck = false;
    input.className = "hb-keyvault__input";
    input.setAttribute("aria-label", `${info.name} API key`);
    form.appendChild(input);

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "hb-btn hb-btn--ghost hb-keyvault__toggle";
    toggle.textContent = "Show";
    toggle.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      toggle.textContent = show ? "Hide" : "Show";
    });
    form.appendChild(toggle);

    const save = document.createElement("button");
    save.type = "button";
    save.className = "hb-btn hb-btn--primary";
    save.textContent = "Save key";
    save.addEventListener("click", () => {
      const v = input.value.trim();
      if (!v) {
        input.focus();
        return;
      }
      setKey(pid, v);
      input.value = "";
      refresh();
    });
    form.appendChild(save);

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "hb-btn hb-btn--ghost";
    clear.textContent = "Remove";
    clear.hidden = !getKey(pid);
    clear.dataset.role = "clear";
    clear.addEventListener("click", () => {
      clearKey(pid);
      refresh();
    });
    form.appendChild(clear);
    row.appendChild(form);

    const notes = el("div", "hb-keyvault__notes");
    notes.appendChild(el("p", "hb-keyvault__note", `${info.freeTier} ${info.costNote}`));
    if (needsCorsWarning(pid)) notes.appendChild(el("p", "hb-keyvault__note hb-keyvault__note--warn", info.corsNote));
    const docs = document.createElement("a");
    docs.href = info.docsUrl;
    docs.target = "_blank";
    docs.rel = "noopener noreferrer nofollow";
    docs.className = "hb-keyvault__docs";
    docs.textContent = `${info.name} API docs ↗`;
    notes.appendChild(docs);
    row.appendChild(notes);

    card.appendChild(row);
  }

  function refresh(): void {
    renderKeyVault(container, opts);
  }

  container.appendChild(card);
}

/**
 * Narrow a fetch failure into a human message. Pass the caught error and the
 * provider id; returns a user-safe string (never dumps raw response bodies).
 */
export function humanizeFetchError(err: unknown, providerName: string): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
    return (
      `Your browser could not reach ${providerName}. This usually means the provider ` +
      `blocks direct browser calls (CORS) or you are offline. Try a different provider, ` +
      `or run the same request from your own computer with the same key.`
    );
  }
  if (/timed out|abort/i.test(msg)) {
    return `The request to ${providerName} timed out. Try again — image and video models can take a minute or more.`;
  }
  return `Something went wrong calling ${providerName}: ${msg.slice(0, 220)}`;
}

/**
 * Map an HTTP status to a human message for key-based provider calls.
 * Returns null when the status is not an error we translate (caller handles body).
 */
export function humanizeHttpStatus(status: number, providerName: string): string | null {
  if (status === 401 || status === 403) {
    return (
      `Your ${providerName} key was rejected (HTTP ${status}). Double-check the key — ` +
      `copy it again from the provider dashboard and re-save it above.`
    );
  }
  if (status === 402) {
    return `Your ${providerName} account needs billing or credits (HTTP 402). Add credits on the provider dashboard, then try again.`;
  }
  if (status === 429) {
    return `Rate limit hit on ${providerName} (HTTP 429). Wait a minute and try again, or check your plan's quotas.`;
  }
  if (status >= 500) {
    return `${providerName} had a server error (HTTP ${status}). Nothing is wrong with your key — wait and retry.`;
  }
  return null;
}
