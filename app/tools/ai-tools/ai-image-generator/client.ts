/**
 * AI Image Generator — browser client (Lane D, redesigned).
 *
 * Flow: gradient header -> key-vault card -> provider tabs -> prompt +
 * aspect form -> Generate -> progress + status -> result card with
 * Download + Open full size -> errors.
 * No-key state explains exactly what unlocking needs. Keys are never logged;
 * all user text is rendered via textContent.
 */

import {
  renderKeyVault,
  onKeyChange,
  getKey,
  humanizeFetchError,
  humanizeHttpStatus,
} from "../../../src/lib/ai/key-vault.ts";
import { getProviderInfo } from "../../../src/lib/ai/providers.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import {
  getProviders,
  validateInputs,
  classifyFetchError,
  buildOpenRouterImageRequest,
  parseOpenRouterImageResponse,
  buildHfImageRequest,
  parseHfImageStatus,
  buildFalImageSubmitRequest,
  parseFalSubmitResponse,
  buildFalStatusRequest,
  parseFalStatusResponse,
  buildFalResultRequest,
  parseFalImageResult,
  FAL_FLUX_SCHNELL_MODEL,
  IMAGE_ASPECTS,
  PROMPT_MAX,
  type ImageProviderId,
  type ImageAspect,
} from "./logic.ts";

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

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error("cancelled"));
    const t = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(t);
      reject(new Error("cancelled"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

const POLL_MAX_MS = 10 * 60 * 1000; // ~10 minute cap

/** Poll a fal.ai queue job until COMPLETED; returns the image URL. */
async function pollFalImageUrl(args: {
  key: string;
  requestId: string;
  signal: AbortSignal;
  onStatus: (label: string) => void;
}): Promise<string> {
  const deadline = Date.now() + POLL_MAX_MS;
  let delay = 2000;
  for (;;) {
    if (args.signal.aborted) throw new Error("cancelled");
    if (Date.now() > deadline) throw new Error("timeout");
    const req = buildFalStatusRequest({
      modelId: FAL_FLUX_SCHNELL_MODEL,
      key: args.key,
      requestId: args.requestId,
    });
    let res: Response;
    try {
      res = await fetch(req.url, { method: req.method, headers: req.headers, signal: args.signal });
    } catch (err) {
      if (args.signal.aborted) throw new Error("cancelled");
      throw new Error(humanizeFetchError(err, "fal.ai"));
    }
    const json: unknown = await res.json().catch(() => null);
    const out = parseFalStatusResponse(res.status, json);
    if (!out.ok) throw new Error(out.message ?? "Status check failed.");
    const st = String((out.data as Record<string, unknown>)["queueStatus"] ?? "UNKNOWN");
    const pos = (out.data as Record<string, unknown>)["queuePosition"];
    args.onStatus(
      st === "IN_QUEUE" && typeof pos === "number"
        ? "Queued — position " + pos + "…"
        : st === "IN_QUEUE"
          ? "Queued…"
          : st === "IN_PROGRESS"
            ? "Generating your image…"
            : "Finishing up…",
    );
    if (st === "COMPLETED") {
      const rreq = buildFalResultRequest({
        modelId: FAL_FLUX_SCHNELL_MODEL,
        key: args.key,
        requestId: args.requestId,
      });
      let rres: Response;
      try {
        rres = await fetch(rreq.url, { method: rreq.method, headers: rreq.headers, signal: args.signal });
      } catch (err) {
        if (args.signal.aborted) throw new Error("cancelled");
        throw new Error(humanizeFetchError(err, "fal.ai"));
      }
      const rjson: unknown = await rres.json().catch(() => null);
      const rout = parseFalImageResult(rres.status, rjson);
      if (!rout.ok) throw new Error(rout.message ?? "Result fetch failed.");
      return String((rout.data as Record<string, unknown>)["imageUrl"] ?? "");
    }
    await sleep(Math.min(delay, 5000), args.signal);
    delay = Math.min(delay * 1.6, 5000);
  }
}

/** Download helper: data: URL → anchor; https: → fetch→blob→anchor; fallback → new tab. */
async function downloadUrl(url: string, filename: string): Promise<void> {
  if (url.startsWith("data:")) {
    const a = el("a", "");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return;
  }
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
    setTimeout(() => URL.revokeObjectURL(obj), 10_000);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = "";

  // --- styles -------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-ig-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-ig-header {
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-ig-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-ig-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-ig-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-ig-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin: 16px 0 8px;
    }
    .hb-ig-label:first-of-type { margin-top: 0; }
    .hb-ig-textarea, .hb-ig-select {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px;
      box-sizing: border-box; font-family: inherit; background: #fff; color: #0f172a;
    }
    .hb-ig-textarea { min-height: 110px; resize: vertical; }
    .hb-ig-textarea:focus, .hb-ig-select:focus { outline: none; border-color: #7c3aed; }
    .hb-ig-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-ig-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-ig-sample {
      font-size: 13px; color: #7c3aed; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-ig-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .hb-ig-tab {
      padding: 10px 18px; font-size: 14px; font-weight: 600;
      border: 2px solid #e2e8f0; border-radius: 999px; background: #fff;
      color: #475569; cursor: pointer;
    }
    .hb-ig-tab:hover { border-color: #7c3aed; color: #7c3aed; }
    .hb-ig-tab.is-active {
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      border-color: transparent; color: #fff;
    }
    .hb-ig-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 18px; }
    .hb-ig-generate {
      flex: 1; min-width: 200px; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-ig-generate:hover:not(:disabled) { opacity: .92; }
    .hb-ig-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-ig-cancel {
      padding: 16px 24px; font-size: 16px; font-weight: 700;
      background: #fff; color: #7c3aed; border: 2px solid #7c3aed;
      border-radius: 12px; cursor: pointer;
    }
    .hb-ig-cancel:hover { background: #f5f3ff; }
    .hb-ig-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-ig-progress > div {
      height: 100%; width: 30%; border-radius: 5px;
      background: linear-gradient(90deg, #7c3aed, #4f46e5);
      animation: hb-ig-slide 1.1s ease-in-out infinite;
    }
    @keyframes hb-ig-slide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
    .hb-ig-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-ig-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-ig-result { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .hb-ig-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .hb-ig-result-meta { font-size: 13px; color: #64748b; margin: 0 0 12px; }
    .hb-ig-image {
      width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; display: block;
      background: #f8fafc;
    }
    .hb-ig-result-actions { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
    .hb-ig-dl {
      padding: 12px 28px; font-size: 16px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      border: none; border-radius: 10px; cursor: pointer;
    }
    .hb-ig-dl:hover { opacity: .92; }
    .hb-ig-open {
      display: inline-block; padding: 12px 28px; font-size: 16px; font-weight: 700;
      background: #fff; color: #7c3aed; border: 2px solid #7c3aed;
      border-radius: 10px; text-decoration: none;
    }
    .hb-ig-open:hover { background: #f5f3ff; }
    .hb-ig-nokey-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
    .hb-ig-nokey-body { font-size: 14px; color: #475569; margin: 0 0 8px; }
    .hb-ig-nokey-cost { font-size: 13px; color: #7c3aed; font-weight: 600; margin: 0 0 10px; }
    .hb-ig-key-link {
      display: inline-block; padding: 10px 22px; background: #fff; color: #7c3aed;
      border: 2px solid #7c3aed; border-radius: 8px; font-size: 14px;
      font-weight: 700; text-decoration: none;
    }
    .hb-ig-key-link:hover { background: #f5f3ff; }
    @media (max-width: 640px) {
      .hb-ig-header { padding: 18px; }
      .hb-ig-card { padding: 16px; }
      .hb-ig-generate { font-size: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el("div", "hb-ig-wrap");
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el("div", "hb-ig-header");
  header.appendChild(el("h3", "", "🎨 AI Image Generator"));
  header.appendChild(
    el("p", "", "Describe it, get it — AI images generated with your own key, shown right on the page."),
  );
  wrap.appendChild(header);

  const providers = getProviders();
  let active: ImageProviderId = providers[0];
  let pollController: AbortController | null = null;

  // --- key vault ------------------------------------------------------------
  const vaultCard = el("div", "hb-ig-card");
  renderKeyVault(vaultCard, {
    providers,
    intro:
      "Generation is billed to YOUR provider account. Paste a key, press Save, then Generate — it works immediately.",
  });
  wrap.appendChild(vaultCard);

  // --- no-key state -----------------------------------------------------------
  const noKeyBox = el("div", "hb-ig-card");
  wrap.appendChild(noKeyBox);

  // --- provider tabs ------------------------------------------------------------
  const tabsCard = el("div", "hb-ig-card");
  tabsCard.appendChild(el("label", "hb-ig-label", "Provider"));
  const tabsRow = el("div", "hb-ig-tabs");
  tabsRow.setAttribute("role", "tablist");
  tabsCard.appendChild(tabsRow);
  wrap.appendChild(tabsCard);

  // --- form -------------------------------------------------------------------------
  const formCard = el("div", "hb-ig-card");
  const promptLabel = el("label", "hb-ig-label", "Image prompt *");
  promptLabel.htmlFor = "hb-ig-prompt";
  formCard.appendChild(promptLabel);
  const promptInput = el("textarea", "hb-ig-textarea") as HTMLTextAreaElement;
  promptInput.id = "hb-ig-prompt";
  promptInput.rows = 4;
  promptInput.maxLength = PROMPT_MAX + 200;
  promptInput.placeholder = "e.g. a cozy bookshop interior at dusk, warm lamplight, watercolor style";
  promptInput.setAttribute("aria-label", "Image prompt");
  formCard.appendChild(promptInput);
  const count = el("p", "hb-ig-count", "0 / " + PROMPT_MAX.toLocaleString("en-US") + " characters");
  formCard.appendChild(count);
  promptInput.addEventListener("input", () => {
    const n = promptInput.value.trim().length;
    count.textContent = n.toLocaleString("en-US") + " / " + PROMPT_MAX.toLocaleString("en-US") + " characters";
  });
  const sampleBtn = el("button", "hb-ig-sample", "✨ Try a sample prompt");
  sampleBtn.type = "button";
  sampleBtn.addEventListener("click", () => {
    promptInput.value =
      "A cozy bookshop interior at dusk, warm lamplight glowing over wooden shelves stacked with books, watercolor style, soft brushstrokes";
    promptInput.dispatchEvent(new Event("input"));
    errorBox.hidden = true;
  });
  formCard.appendChild(sampleBtn);

  const aspectLabel = el("label", "hb-ig-label", "Aspect ratio");
  aspectLabel.htmlFor = "hb-ig-aspect";
  formCard.appendChild(aspectLabel);
  const aspectInput = el("select", "hb-ig-select") as HTMLSelectElement;
  aspectInput.id = "hb-ig-aspect";
  for (const a of IMAGE_ASPECTS) {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a.charAt(0).toUpperCase() + a.slice(1);
    aspectInput.appendChild(opt);
  }
  aspectInput.value = "landscape";
  formCard.appendChild(aspectInput);

  const actions = el("div", "hb-ig-row");
  const genBtn = el("button", "hb-ig-generate", "✨ Generate image");
  genBtn.type = "button";
  const cancelBtn = el("button", "hb-ig-cancel", "Cancel");
  cancelBtn.type = "button";
  cancelBtn.hidden = true;
  actions.appendChild(genBtn);
  actions.appendChild(cancelBtn);
  formCard.appendChild(actions);
  wrap.appendChild(formCard);

  // --- progress + status + error -----------------------------------------------------
  const progress = el("div", "hb-ig-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  progress.appendChild(el("div", ""));
  wrap.appendChild(progress);

  const statusBox = el("p", "hb-ig-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);

  const errorBox = el("div", "hb-ig-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  const resultBox = el("div", "hb-ig-result");
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
  function setBusy(busy: boolean): void {
    genBtn.disabled = busy;
    promptInput.disabled = busy;
    aspectInput.disabled = busy;
    cancelBtn.hidden = !busy;
    progress.hidden = !busy;
  }

  function showResult(imageUrl: string, providerId: ImageProviderId): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    const info = getProviderInfo(providerId);
    resultBox.appendChild(el("p", "hb-ig-result-title", "🖼️ Your image"));
    if (info) resultBox.appendChild(el("p", "hb-ig-result-meta", "Generated with " + info.name));
    const img = document.createElement("img");
    img.src = imageUrl;
    img.className = "hb-ig-image";
    img.alt = "AI-generated image";
    img.loading = "lazy";
    resultBox.appendChild(img);
    const row = el("div", "hb-ig-result-actions");
    const dl = el("button", "hb-ig-dl", "⬇ Download image");
    dl.type = "button";
    dl.addEventListener("click", () => {
      const stamp = new Date().toISOString().slice(0, 10);
      void downloadUrl(imageUrl, "ai-image-" + stamp + ".jpg").catch(() => {
        setError("Download failed — try opening the full-size image instead.");
      });
    });
    const open = el("a", "hb-ig-open", "Open full size");
    open.href = imageUrl;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    row.appendChild(dl);
    row.appendChild(open);
    resultBox.appendChild(row);
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderNoKey(): void {
    noKeyBox.innerHTML = "";
    const info = getProviderInfo(active);
    const hasKey = !!getKey(active);
    if (hasKey) {
      noKeyBox.hidden = true;
      return;
    }
    noKeyBox.hidden = false;
    const cfg = ctx.config;
    noKeyBox.appendChild(el("p", "hb-ig-nokey-title", cfg.noKeyHeadline ?? "Save an API key to unlock"));
    noKeyBox.appendChild(
      el("p", "hb-ig-nokey-body", cfg.noKeyBody ?? "Paste a key above, press Save, then Generate."),
    );
    if (info) {
      noKeyBox.appendChild(el("p", "hb-ig-nokey-cost", info.freeTier + " " + info.costNote));
      const link = el("a", "hb-ig-key-link", "Get a " + info.name + " key");
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    noKeyBox.appendChild(el("p", "hb-ig-hint", "Paste → Save → Generate works immediately. Nothing else to configure."));
  }

  function renderTabs(): void {
    tabsRow.innerHTML = "";
    if (providers.length < 2) {
      tabsCard.hidden = true;
      return;
    }
    tabsCard.hidden = false;
    for (const p of providers) {
      const info = getProviderInfo(p);
      const tab = el("button", "hb-ig-tab" + (p === active ? " is-active" : ""), info?.name ?? p);
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", p === active ? "true" : "false");
      tab.addEventListener("click", () => {
        if (pollController) return; // don't switch mid-generation
        active = p;
        renderTabs();
        renderNoKey();
      });
      tabsRow.appendChild(tab);
    }
  }

  async function runOpenRouter(key: string, prompt: string): Promise<string> {
    const req = buildOpenRouterImageRequest({ key, prompt });
    let res: Response;
    try {
      res = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
      });
    } catch (err) {
      throw new Error(humanizeFetchError(err, "OpenRouter"));
    }
    if (!res.ok) {
      const mapped = humanizeHttpStatus(res.status, "OpenRouter");
      const json: unknown = await res.json().catch(() => null);
      const out = parseOpenRouterImageResponse(res.status, json);
      throw new Error(mapped ?? out.message ?? "OpenRouter returned HTTP " + res.status + ".");
    }
    const json: unknown = await res.json().catch(() => null);
    const out = parseOpenRouterImageResponse(res.status, json);
    if (!out.ok) throw new Error(out.message ?? "Generation failed.");
    return String((out.data as Record<string, unknown>)["imageUrl"] ?? "");
  }

  async function runHf(key: string, prompt: string): Promise<string> {
    const req = buildHfImageRequest({ key, prompt });
    let res: Response;
    try {
      res = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
      });
    } catch (err) {
      throw new Error(humanizeFetchError(err, "Hugging Face"));
    }
    const contentType = res.headers.get("content-type") ?? "";
    if (!res.ok || !/^image\//i.test(contentType)) {
      const json: unknown = await res.json().catch(() => null);
      const out = parseHfImageStatus(res.status, json, contentType);
      const mapped = humanizeHttpStatus(res.status, "Hugging Face");
      throw new Error(out.ok ? "Unexpected Hugging Face response." : (mapped ?? out.message ?? "HTTP " + res.status));
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  }

  async function runFal(key: string, prompt: string, aspect: ImageAspect, signal: AbortSignal): Promise<string> {
    const req = buildFalImageSubmitRequest({ key, prompt, aspect });
    let res: Response;
    try {
      res = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body),
        signal,
      });
    } catch (err) {
      if (signal.aborted) throw new Error("cancelled");
      throw new Error(humanizeFetchError(err, "fal.ai"));
    }
    const json: unknown = await res.json().catch(() => null);
    const out = parseFalSubmitResponse(res.status, json);
    if (!out.ok) {
      const mapped = humanizeHttpStatus(res.status, "fal.ai");
      throw new Error(mapped ?? out.message ?? "fal.ai rejected the request.");
    }
    const requestId = String((out.data as Record<string, unknown>)["requestId"] ?? "");
    setStatus("Submitted — waiting in the fal.ai queue…");
    return pollFalImageUrl({ key, requestId, signal, onStatus: setStatus });
  }

  genBtn.addEventListener("click", () => {
    void (async () => {
      setError(null);
      resultBox.hidden = true;
      resultBox.innerHTML = "";
      const key = ctx.getKey(active) ?? getKey(active);
      if (!key) {
        renderNoKey();
        setError("No API key saved for this provider yet — paste one in the key vault above and press Save.");
        return;
      }
      const prompt = promptInput.value.trim();
      const aspect = (aspectInput.value as ImageAspect) || "landscape";
      const v = validateInputs({ prompt, aspect });
      if (!v.ok) {
        setError(v.errors.join(" "));
        return;
      }
      pollController = new AbortController();
      const signal = pollController.signal;
      setBusy(true);
      setStatus("Sending to " + (getProviderInfo(active)?.name ?? active) + "…");
      try {
        let url: string;
        if (active === "openrouter") url = await runOpenRouter(key, prompt);
        else if (active === "hf-inference") url = await runHf(key, prompt);
        else url = await runFal(key, prompt, aspect, signal);
        setStatus("");
        showResult(url, active);
      } catch (err) {
        if (signal.aborted || (err as Error)?.message === "cancelled") {
          setStatus("Cancelled.");
        } else if ((err as Error)?.message === "timeout") {
          setError(
            "The job ran longer than 10 minutes and was stopped. Check your fal.ai dashboard — it may still finish there.",
          );
        } else {
          const kind = classifyFetchError((err as Error)?.message ?? "");
          setError(
            kind === "cors-blocked"
              ? humanizeFetchError(err, getProviderInfo(active)?.name ?? active)
              : (err as Error)?.message ?? "Generation failed.",
          );
        }
      } finally {
        pollController = null;
        setBusy(false);
      }
    })();
  });

  cancelBtn.addEventListener("click", () => {
    pollController?.abort();
  });

  onKeyChange(() => {
    renderNoKey();
  });

  renderTabs();
  renderNoKey();
}
