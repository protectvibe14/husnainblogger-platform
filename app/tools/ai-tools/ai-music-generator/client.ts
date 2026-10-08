/**
 * AI Music Generator — browser client (Lane D, custom Suno-compatible API).
 *
 * The 'custom-music-api' provider is NOT in the shared providers registry,
 * so this client builds its own key card with setKey/getKey/clearKey/
 * onKeyChange ('custom-music-api') plus the base URL in
 * 'hb-music-endpoint' (localStorage). Flow: key card → prompt +
 * instrumental → Generate → poll record-info (backoff + Cancel, 10-min
 * cap) → two audio players + Download MP3 → errors.
 * Keys are never logged; user text via textContent.
 */

import {
  getKey,
  setKey,
  clearKey,
  onKeyChange,
  humanizeFetchError,
  humanizeHttpStatus,
} from "../../../src/lib/ai/key-vault.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import {
  MUSIC_ENDPOINT_STORAGE_KEY,
  normalizeBaseUrl,
  validateInputs,
  buildGenerateRequest,
  parseGenerateResponse,
  buildRecordInfoRequest,
  parseRecordInfoResponse,
  classifyFetchError,
  type MusicTrack,
} from "./logic.ts";

const PROVIDER_ID = "custom-music-api";
const POLL_MIN_MS = 5000;
const POLL_MAX_MS = 15000;
const POLL_CAP_MS = 10 * 60 * 1000;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function getEndpoint(): string {
  try {
    return localStorage.getItem(MUSIC_ENDPOINT_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function setEndpoint(base: string): void {
  try {
    localStorage.setItem(MUSIC_ENDPOINT_STORAGE_KEY, base);
  } catch {
    /* private mode: ignore */
  }
}

function clearEndpoint(): void {
  try {
    localStorage.removeItem(MUSIC_ENDPOINT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function mountAiTool(ctx: AiClientContext): () => void {
  const root = ctx.mountEl;
  root.innerHTML = "";
  const wrap = el("div", "hb-ai-tool");
  root.appendChild(wrap);

  let pollTimer: number | null = null;
  let pollStart = 0;
  let cancelled = false;

  // --- custom key card (provider not in registry) ---
  const vaultBox = el("div", "hb-ai-section hb-ai-vault");
  wrap.appendChild(vaultBox);
  vaultBox.appendChild(el("h3", "hb-ai-vault__title", "Your compatible-API key"));
  vaultBox.appendChild(
    el(
      "p",
      "hb-ai-vault__intro",
      "Suno offers no official API — this tool uses the widely-used third-party Suno-compatible convention. Paste your provider's base URL + key; both stay in your browser only.",
    ),
  );

  vaultBox.appendChild(el("label", "hb-ai-label", "API base URL"));
  const baseInput = el("input", "hb-ai-input") as HTMLInputElement;
  baseInput.type = "url";
  baseInput.placeholder = "e.g. https://api.sunoapi.org";
  baseInput.value = getEndpoint();
  baseInput.setAttribute("aria-label", "Compatible API base URL");
  vaultBox.appendChild(baseInput);

  vaultBox.appendChild(el("label", "hb-ai-label", "API key"));
  const keyInput = el("input", "hb-ai-input") as HTMLInputElement;
  keyInput.type = "password";
  keyInput.placeholder = "Paste your API key";
  keyInput.autocomplete = "off";
  keyInput.setAttribute("aria-label", "API key");
  if (getKey(PROVIDER_ID)) keyInput.placeholder = "Key saved ✓ — paste to replace";
  vaultBox.appendChild(keyInput);

  const vaultRow = el("div", "hb-ai-actions");
  const saveBtn = el("button", "hb-btn hb-btn--primary", "Save key");
  saveBtn.type = "button";
  const clearBtn = el("button", "hb-btn hb-btn--ghost", "Clear");
  clearBtn.type = "button";
  vaultRow.appendChild(saveBtn);
  vaultRow.appendChild(clearBtn);
  vaultBox.appendChild(vaultRow);
  const vaultMsg = el("p", "hb-ai-note");
  vaultBox.appendChild(vaultMsg);

  const noKeyBox = el("div", "hb-ai-section hb-ai-nokey");
  wrap.appendChild(noKeyBox);

  // --- generation form ---
  const form = el("div", "hb-ai-section");
  wrap.appendChild(form);
  form.appendChild(el("label", "hb-ai-label", "Describe the music"));
  const promptInput = el("textarea", "hb-ai-input hb-ai-textarea") as HTMLTextAreaElement;
  promptInput.rows = 3;
  promptInput.placeholder = "e.g. An upbeat pop song about summer mornings, acoustic guitar and warm vocals";
  promptInput.maxLength = 500;
  promptInput.setAttribute("aria-label", "Describe the music");
  form.appendChild(promptInput);

  const instWrap = el("label", "hb-ai-consent");
  const instInput = el("input", "") as HTMLInputElement;
  instInput.type = "checkbox";
  instWrap.appendChild(instInput);
  instWrap.appendChild(el("span", "", "Instrumental (no vocals)"));
  form.appendChild(instWrap);

  const formRow = el("div", "hb-ai-actions");
  const genBtn = el("button", "hb-btn hb-btn--primary", "Generate");
  genBtn.type = "button";
  const cancelBtn = el("button", "hb-btn hb-btn--ghost", "Cancel");
  cancelBtn.type = "button";
  cancelBtn.hidden = true;
  formRow.appendChild(genBtn);
  formRow.appendChild(cancelBtn);
  form.appendChild(formRow);

  const statusBox = el("div", "hb-ai-section hb-ai-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);
  const errorBox = el("div", "hb-ai-section hb-ai-error");
  errorBox.hidden = true;
  wrap.appendChild(errorBox);
  const resultBox = el("div", "hb-ai-section hb-ai-result");
  resultBox.hidden = true;
  wrap.appendChild(resultBox);

  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }
  function setBusy(b: boolean): void {
    genBtn.disabled = b;
    cancelBtn.hidden = !b;
  }

  function showTracks(tracks: MusicTrack[]): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    resultBox.appendChild(el("h3", "hb-ai-result__title", "Your songs"));
    tracks.forEach((t, i) => {
      const card = el("div", "hb-ai-media__item");
      card.appendChild(el("p", "hb-ai-media__caption", t.title || `Variation ${i + 1}`));
      const audio = el("audio", "hb-ai-result__audio") as HTMLAudioElement;
      audio.src = t.audioUrl;
      audio.controls = true;
      audio.preload = "metadata";
      card.appendChild(audio);
      const row = el("div", "hb-ai-actions");
      const dl = el("button", "hb-btn hb-btn--secondary", "Download MP3");
      dl.type = "button";
      dl.addEventListener("click", () => {
        downloadAudio(t.audioUrl, `song-${i + 1}-${new Date().toISOString().slice(0, 10)}.mp3`);
      });
      row.appendChild(dl);
      card.appendChild(row);
      resultBox.appendChild(card);
    });
  }

  async function downloadAudio(url: string, filename: string): Promise<void> {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const obj = URL.createObjectURL(blob);
      const a = el("a", "");
      a.href = obj;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(obj), 30_000);
    } catch {
      window.open(url, "_blank", "noopener");
    }
  }

  function renderNoKey(): void {
    noKeyBox.innerHTML = "";
    if (getKey(PROVIDER_ID) && getEndpoint()) {
      noKeyBox.hidden = true;
      return;
    }
    noKeyBox.hidden = false;
    const cfg = ctx.config;
    noKeyBox.appendChild(el("h3", "hb-ai-nokey__title", cfg.noKeyHeadline ?? "Save your key to unlock"));
    noKeyBox.appendChild(el("p", "hb-ai-nokey__body", cfg.noKeyBody ?? "Save your key above first."));
    noKeyBox.appendChild(
      el("p", "hb-ai-nokey__hint", "Save → Generate → two songs in a few minutes → download MP3."),
    );
  }

  // --- key card wiring ---
  saveBtn.addEventListener("click", () => {
    vaultMsg.textContent = "";
    const base = normalizeBaseUrl(baseInput.value);
    const key = keyInput.value.trim();
    if (!base || !/^https?:\/\/.+\..+/.test(base)) {
      vaultMsg.textContent = "Paste your provider's base URL first (must start with http:// or https://).";
      return;
    }
    if (!key && !getKey(PROVIDER_ID)) {
      vaultMsg.textContent = "Paste your API key, then press Save key.";
      return;
    }
    setEndpoint(base);
    if (key) setKey(PROVIDER_ID, key);
    keyInput.value = "";
    keyInput.placeholder = "Key saved ✓ — paste to replace";
    vaultMsg.textContent = "Saved ✓ — your key and base URL stay in this browser only.";
    renderNoKey();
  });
  clearBtn.addEventListener("click", () => {
    clearKey(PROVIDER_ID);
    clearEndpoint();
    baseInput.value = "";
    keyInput.placeholder = "Paste your API key";
    vaultMsg.textContent = "Cleared.";
    renderNoKey();
  });

  function stopPoll(): void {
    if (pollTimer !== null) {
      window.clearTimeout(pollTimer);
      pollTimer = null;
    }
    setBusy(false);
    cancelBtn.hidden = true;
    setStatus("");
  }

  // --- generate + poll ---
  genBtn.addEventListener("click", () => {
    void (async () => {
      setError(null);
      resultBox.hidden = true;
      resultBox.innerHTML = "";
      const key = getKey(PROVIDER_ID);
      const base = normalizeBaseUrl(getEndpoint());
      if (!key || !base) {
        renderNoKey();
        setError("Save your base URL and API key above first.");
        return;
      }
      const v = validateInputs({ prompt: promptInput.value, base });
      if (!v.ok) {
        setError(v.errors.join(" "));
        return;
      }
      setBusy(true);
      cancelled = true; // replaced below
      setStatus("Creating your song…");
      try {
        const req = buildGenerateRequest({
          base,
          key,
          prompt: promptInput.value.trim(),
          instrumental: instInput.checked,
        });
        const res = await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(req.body),
        });
        const json: unknown = await res.json().catch(() => null);
        const out = parseGenerateResponse(res.status, json);
        if (!out.ok) {
          const mapped = humanizeHttpStatus(res.status, "music API");
          throw new Error(mapped ?? out.message ?? "Generation failed.");
        }
        const taskId = String((out.data as Record<string, unknown>)["taskId"] ?? "");
        pollStart = Date.now();
        cancelled = false;
        let delay = POLL_MIN_MS;
        const poll = async (): Promise<void> => {
          if (cancelled) return;
          if (Date.now() - pollStart > POLL_CAP_MS) {
            stopPoll();
            setError("Timed out after 10 minutes — the task may still finish on the provider side. Try again later.");
            return;
          }
          setStatus("Creating your song… (usually 1–3 minutes — you can Cancel anytime)");
          try {
            const sreq = buildRecordInfoRequest({ base, key, taskId });
            const sres = await fetch(sreq.url, { method: sreq.method, headers: sreq.headers });
            const sjson: unknown = await sres.json().catch(() => null);
            const sout = parseRecordInfoResponse(sres.status, sjson);
            if (!sout.ok) {
              const mapped = humanizeHttpStatus(sres.status, "music API");
              throw new Error(mapped ?? sout.message ?? "Status check failed.");
            }
            if (sout.data && (sout.data as Record<string, unknown>)["done"] === true) {
              stopPoll();
              setStatus("");
              showTracks((sout.data as unknown as { tracks: MusicTrack[] })["tracks"]);
              return;
            }
          } catch (err) {
            if (cancelled) return;
            stopPoll();
            const kind = classifyFetchError((err as Error)?.message ?? "");
            setError(
              kind === "cors-blocked"
                ? humanizeFetchError(err, "music API")
                : (err as Error)?.message ?? "Status check failed.",
            );
            return;
          }
          delay = Math.min(POLL_MAX_MS, delay + 2500);
          pollTimer = window.setTimeout(() => void poll(), delay);
        };
        await poll();
      } catch (err) {
        stopPoll();
        const kind = classifyFetchError((err as Error)?.message ?? "");
        setError(
          kind === "cors-blocked" ? humanizeFetchError(err, "music API") : (err as Error)?.message ?? "Generation failed.",
        );
      }
    })();
  });

  cancelBtn.addEventListener("click", () => {
    cancelled = true;
    stopPoll();
    setStatus("Cancelled.");
  });

  const unsubscribe = onKeyChange(() => {
    renderNoKey();
  });

  renderNoKey();
  return () => {
    cancelled = true;
    stopPoll();
    unsubscribe();
  };
}
