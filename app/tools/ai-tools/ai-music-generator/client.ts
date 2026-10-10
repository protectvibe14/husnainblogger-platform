/**
 * AI Music Generator — browser client (Lane D, custom Suno-compatible API, redesigned).
 *
 * Flow: gradient header -> key card (base URL + key, stay in browser) ->
 * prompt + instrumental -> Generate -> progress + status -> poll
 * record-info (backoff + Cancel, 10-min cap) -> two track cards with audio
 * players + Download MP3 -> errors.
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

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = "";

  // --- styles -------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-mu-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-mu-header {
      background: linear-gradient(135deg, #a21caf 0%, #ec4899 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-mu-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-mu-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-mu-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-mu-card h3 { margin: 0 0 8px; font-size: 16px; font-weight: 700; color: #1e293b; }
    .hb-mu-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin: 16px 0 8px;
    }
    .hb-mu-label:first-of-type { margin-top: 0; }
    .hb-mu-input, .hb-mu-textarea {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px;
      box-sizing: border-box; font-family: inherit; background: #fff; color: #0f172a;
    }
    .hb-mu-textarea { min-height: 90px; resize: vertical; }
    .hb-mu-input:focus, .hb-mu-textarea:focus { outline: none; border-color: #a21caf; }
    .hb-mu-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-mu-intro { font-size: 13px; color: #64748b; margin: 0 0 6px; line-height: 1.5; }
    .hb-mu-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-mu-check { display: flex; align-items: center; gap: 10px; margin-top: 14px; font-size: 15px; color: #1e293b; cursor: pointer; }
    .hb-mu-check input { width: 18px; height: 18px; accent-color: #a21caf; }
    .hb-mu-row { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
    .hb-mu-btn {
      padding: 12px 26px; font-size: 15px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #a21caf 0%, #ec4899 100%);
      border: none; border-radius: 10px; cursor: pointer;
    }
    .hb-mu-btn:hover { opacity: .92; }
    .hb-mu-btn--ghost {
      padding: 12px 26px; font-size: 15px; font-weight: 700;
      background: #fff; color: #a21caf; border: 2px solid #a21caf;
      border-radius: 10px; cursor: pointer;
    }
    .hb-mu-btn--ghost:hover { background: #fdf4ff; }
    .hb-mu-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #a21caf 0%, #ec4899 100%);
      border: none; border-radius: 12px; cursor: pointer; margin-top: 18px;
    }
    .hb-mu-generate:hover:not(:disabled) { opacity: .92; }
    .hb-mu-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-mu-note { font-size: 13px; color: #059669; font-weight: 600; margin: 10px 0 0; min-height: 18px; }
    .hb-mu-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-mu-progress > div {
      height: 100%; width: 30%; border-radius: 5px;
      background: linear-gradient(90deg, #a21caf, #ec4899);
      animation: hb-mu-slide 1.1s ease-in-out infinite;
    }
    @keyframes hb-mu-slide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
    .hb-mu-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-mu-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-mu-result { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .hb-mu-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 14px; }
    .hb-mu-track {
      background: linear-gradient(135deg, #fdf4ff 0%, #fce7f3 100%);
      border: 1px solid #f5d0fe; border-radius: 12px; padding: 16px;
      margin-bottom: 12px;
    }
    .hb-mu-track:last-child { margin-bottom: 0; }
    .hb-mu-track-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 10px; }
    .hb-mu-track audio { width: 100%; margin-bottom: 10px; }
    @media (max-width: 640px) {
      .hb-mu-header { padding: 18px; }
      .hb-mu-card { padding: 16px; }
      .hb-mu-generate { font-size: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el("div", "hb-mu-wrap");
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el("div", "hb-mu-header");
  header.appendChild(el("h3", "", "🎵 AI Music Generator"));
  header.appendChild(
    el("p", "", "Describe the vibe — get two songs. Powered by a Suno-compatible API with your own key."),
  );
  wrap.appendChild(header);

  let pollTimer: number | null = null;
  let pollStart = 0;
  let cancelled = false;

  // --- custom key card (provider not in registry) ---
  const vaultCard = el("div", "hb-mu-card");
  wrap.appendChild(vaultCard);
  vaultCard.appendChild(el("h3", "", "🔑 Your compatible-API key"));
  vaultCard.appendChild(
    el(
      "p",
      "hb-mu-intro",
      "Suno offers no official API — this tool uses the widely-used third-party Suno-compatible convention. Paste your provider's base URL + key; both stay in your browser only.",
    ),
  );

  vaultCard.appendChild(el("label", "hb-mu-label", "API base URL"));
  const baseInput = el("input", "hb-mu-input") as HTMLInputElement;
  baseInput.type = "url";
  baseInput.placeholder = "e.g. https://api.sunoapi.org";
  baseInput.value = getEndpoint();
  baseInput.setAttribute("aria-label", "Compatible API base URL");
  vaultCard.appendChild(baseInput);

  vaultCard.appendChild(el("label", "hb-mu-label", "API key"));
  const keyInput = el("input", "hb-mu-input") as HTMLInputElement;
  keyInput.type = "password";
  keyInput.placeholder = "Paste your API key";
  keyInput.autocomplete = "off";
  keyInput.setAttribute("aria-label", "API key");
  if (getKey(PROVIDER_ID)) keyInput.placeholder = "Key saved ✓ — paste to replace";
  vaultCard.appendChild(keyInput);

  const vaultRow = el("div", "hb-mu-row");
  const saveBtn = el("button", "hb-mu-btn", "Save key");
  saveBtn.type = "button";
  const clearBtn = el("button", "hb-mu-btn--ghost", "Clear");
  clearBtn.type = "button";
  vaultRow.appendChild(saveBtn);
  vaultRow.appendChild(clearBtn);
  vaultCard.appendChild(vaultRow);
  const vaultMsg = el("p", "hb-mu-note");
  vaultCard.appendChild(vaultMsg);

  const noKeyBox = el("div", "hb-mu-card");
  wrap.appendChild(noKeyBox);

  // --- generation form ---
  const formCard = el("div", "hb-mu-card");
  wrap.appendChild(formCard);
  const promptLabel = el("label", "hb-mu-label", "Describe the music *");
  promptLabel.htmlFor = "hb-mu-prompt";
  formCard.appendChild(promptLabel);
  const promptInput = el("textarea", "hb-mu-textarea") as HTMLTextAreaElement;
  promptInput.id = "hb-mu-prompt";
  promptInput.rows = 3;
  promptInput.placeholder = "e.g. An upbeat pop song about summer mornings, acoustic guitar and warm vocals";
  promptInput.maxLength = 500;
  promptInput.setAttribute("aria-label", "Describe the music");
  formCard.appendChild(promptInput);
  const count = el("p", "hb-mu-count", "0 / 500 characters");
  formCard.appendChild(count);
  promptInput.addEventListener("input", () => {
    const n = promptInput.value.trim().length;
    count.textContent = n.toLocaleString("en-US") + " / 500 characters";
  });
  const sampleBtn = el("button", "hb-mu-btn--ghost", "✨ Try a sample");
  sampleBtn.type = "button";
  sampleBtn.style.marginTop = "8px";
  sampleBtn.addEventListener("click", () => {
    promptInput.value = "An upbeat pop song about summer mornings, acoustic guitar and warm vocals";
    promptInput.dispatchEvent(new Event("input"));
    errorBox.hidden = true;
  });
  formCard.appendChild(sampleBtn);

  const instWrap = el("label", "hb-mu-check");
  const instInput = document.createElement("input");
  instInput.type = "checkbox";
  instWrap.appendChild(instInput);
  instWrap.appendChild(el("span", "", "Instrumental (no vocals)"));
  formCard.appendChild(instWrap);

  const formRow = el("div", "hb-mu-row");
  const genBtn = el("button", "hb-mu-btn", "🎵 Generate");
  genBtn.type = "button";
  const cancelBtn = el("button", "hb-mu-btn--ghost", "Cancel");
  cancelBtn.type = "button";
  cancelBtn.hidden = true;
  formRow.appendChild(genBtn);
  formRow.appendChild(cancelBtn);
  formCard.appendChild(formRow);

  // --- progress + status + error -----------------------------------------------------
  const progress = el("div", "hb-mu-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  progress.appendChild(el("div", ""));
  wrap.appendChild(progress);

  const statusBox = el("p", "hb-mu-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);

  const errorBox = el("div", "hb-mu-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  const resultBox = el("div", "hb-mu-result");
  resultBox.hidden = true;
  wrap.appendChild(resultBox);

  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setError(text: string | null): void {
    progress.hidden = true;
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }
  function setBusy(b: boolean): void {
    genBtn.disabled = b;
    cancelBtn.hidden = !b;
    progress.hidden = !b;
  }

  function showTracks(tracks: MusicTrack[]): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    resultBox.appendChild(el("p", "hb-mu-result-title", "🎶 Your songs"));
    tracks.forEach((t, i) => {
      const card = el("div", "hb-mu-track");
      card.appendChild(el("p", "hb-mu-track-title", t.title || "Variation " + (i + 1)));
      const audio = document.createElement("audio");
      audio.src = t.audioUrl;
      audio.controls = true;
      audio.preload = "metadata";
      card.appendChild(audio);
      const row = el("div", "hb-mu-row");
      row.style.marginTop = "0";
      const dl = el("button", "hb-mu-btn", "⬇ Download MP3");
      dl.type = "button";
      dl.addEventListener("click", () => {
        downloadAudio(t.audioUrl, "song-" + (i + 1) + "-" + new Date().toISOString().slice(0, 10) + ".mp3");
      });
      row.appendChild(dl);
      card.appendChild(row);
      resultBox.appendChild(card);
    });
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  async function downloadAudio(url: string, filename: string): Promise<void> {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
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
    noKeyBox.appendChild(el("h3", "", cfg.noKeyHeadline ?? "Save your key to unlock"));
    noKeyBox.appendChild(el("p", "hb-mu-hint", cfg.noKeyBody ?? "Save your key above first."));
    noKeyBox.appendChild(
      el("p", "hb-mu-hint", "Save → Generate → two songs in a few minutes → download MP3."),
    );
  }

  // --- key card wiring ---
  saveBtn.addEventListener("click", () => {
    vaultMsg.textContent = "";
    const base = normalizeBaseUrl(baseInput.value);
    const key = keyInput.value.trim();
    if (!base || !/^https?:\/\/.+\..+/.test(base)) {
      vaultMsg.textContent = "Paste your provider's base URL first (must start with http:// or https://).";
      vaultMsg.style.color = "#b91c1c";
      return;
    }
    if (!key && !getKey(PROVIDER_ID)) {
      vaultMsg.textContent = "Paste your API key, then press Save key.";
      vaultMsg.style.color = "#b91c1c";
      return;
    }
    setEndpoint(base);
    if (key) setKey(PROVIDER_ID, key);
    keyInput.value = "";
    keyInput.placeholder = "Key saved ✓ — paste to replace";
    vaultMsg.style.color = "#059669";
    vaultMsg.textContent = "Saved ✓ — your key and base URL stay in this browser only.";
    renderNoKey();
  });
  clearBtn.addEventListener("click", () => {
    clearKey(PROVIDER_ID);
    clearEndpoint();
    baseInput.value = "";
    keyInput.placeholder = "Paste your API key";
    vaultMsg.style.color = "#64748b";
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
    progress.hidden = true;
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

  onKeyChange(() => {
    renderNoKey();
  });

  renderNoKey();
}
