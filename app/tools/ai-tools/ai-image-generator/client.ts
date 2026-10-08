/**
 * AI Image Generator — browser client (Lane D).
 *
 * UI order: key-vault card → provider tabs → tool form → Generate →
 * progress/status → result + Download + Open full size → errors.
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
  type ImageProviderId,
  type ImageAspect,
} from "./logic.ts";

// ---------------------------------------------------------------------------
// Tiny DOM helpers (textContent-only; never innerHTML with user data)
// ---------------------------------------------------------------------------

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
        ? `Queued — position ${pos}…`
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

export function mountAiTool(ctx: AiClientContext): () => void {
  const root = ctx.mountEl;
  root.innerHTML = "";
  const wrap = el("div", "hb-ai-tool");
  root.appendChild(wrap);

  const providers = getProviders();
  let active: ImageProviderId = providers[0];
  let pollController: AbortController | null = null;

  // --- key vault ---
  const vaultBox = el("div", "hb-ai-section");
  wrap.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers,
    intro: "Generation is billed to YOUR provider account. Paste a key, press Save, then Generate — it works immediately.",
  });

  // --- no-key state ---
  const noKeyBox = el("div", "hb-ai-section hb-ai-nokey");
  wrap.appendChild(noKeyBox);

  // --- provider tabs ---
  const tabsBox = el("div", "hb-ai-section");
  wrap.appendChild(tabsBox);

  // --- form ---
  const formBox = el("div", "hb-ai-section");
  wrap.appendChild(formBox);

  const promptLabel = el("label", "hb-ai-label", "Image prompt");
  const promptInput = el("textarea", "hb-ai-input hb-ai-textarea") as HTMLTextAreaElement;
  promptInput.rows = 4;
  promptInput.placeholder = "e.g. a cozy bookshop interior at dusk, warm lamplight, watercolor style";
  promptInput.setAttribute("aria-label", "Image prompt");
  formBox.appendChild(promptLabel);
  formBox.appendChild(promptInput);

  const aspectLabel = el("label", "hb-ai-label", "Aspect ratio");
  const aspectInput = el("select", "hb-ai-input hb-ai-select") as HTMLSelectElement;
  for (const a of IMAGE_ASPECTS) {
    const opt = el("option", "", a) as HTMLOptionElement;
    opt.value = a;
    aspectInput.appendChild(opt);
  }
  aspectInput.value = "landscape";
  formBox.appendChild(aspectLabel);
  formBox.appendChild(aspectInput);

  const actions = el("div", "hb-ai-actions");
  const genBtn = el("button", "hb-btn hb-btn--primary", "Generate image");
  genBtn.type = "button";
  const cancelBtn = el("button", "hb-btn hb-btn--ghost", "Cancel");
  cancelBtn.type = "button";
  cancelBtn.hidden = true;
  actions.appendChild(genBtn);
  actions.appendChild(cancelBtn);
  formBox.appendChild(actions);

  // --- status + error + result ---
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
  function setBusy(busy: boolean): void {
    genBtn.disabled = busy;
    promptInput.disabled = busy;
    aspectInput.disabled = busy;
    cancelBtn.hidden = !busy;
  }

  function showResult(imageUrl: string, providerId: ImageProviderId): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    const info = getProviderInfo(providerId);
    resultBox.appendChild(el("h3", "hb-ai-result__title", "Your image"));
    if (info) resultBox.appendChild(el("p", "hb-ai-result__meta", `Generated with ${info.name}`));
    const img = el("img", "hb-ai-result__image") as HTMLImageElement;
    img.src = imageUrl;
    img.alt = "AI-generated image";
    img.loading = "lazy";
    resultBox.appendChild(img);
    const row = el("div", "hb-ai-actions");
    const dl = el("button", "hb-btn hb-btn--primary", "Download image");
    dl.type = "button";
    dl.addEventListener("click", () => {
      const stamp = new Date().toISOString().slice(0, 10);
      void downloadUrl(imageUrl, `ai-image-${stamp}.jpg`).catch(() => {
        setError("Download failed — try opening the full-size image instead.");
      });
    });
    const open = el("a", "hb-btn hb-btn--ghost", "Open full size");
    open.href = imageUrl;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    row.appendChild(dl);
    row.appendChild(open);
    resultBox.appendChild(row);
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
    noKeyBox.appendChild(el("h3", "hb-ai-nokey__title", cfg.noKeyHeadline ?? "Save an API key to unlock"));
    noKeyBox.appendChild(el("p", "hb-ai-nokey__body", cfg.noKeyBody ?? "Paste a key above, press Save, then Generate."));
    if (info) {
      noKeyBox.appendChild(el("p", "hb-ai-nokey__cost", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-btn hb-btn--secondary", `Get a ${info.name} key`);
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    noKeyBox.appendChild(
      el("p", "hb-ai-nokey__hint", "Paste → Save → Generate works immediately. Nothing else to configure."),
    );
  }

  function renderTabs(): void {
    tabsBox.innerHTML = "";
    if (providers.length < 2) return;
    tabsBox.appendChild(el("span", "hb-ai-label", "Provider"));
    const row = el("div", "hb-ai-tabs");
    row.setAttribute("role", "tablist");
    for (const p of providers) {
      const info = getProviderInfo(p);
      const tab = el("button", "hb-ai-tab" + (p === active ? " is-active" : ""), info?.name ?? p);
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", p === active ? "true" : "false");
      tab.addEventListener("click", () => {
        if (pollController) return; // don't switch mid-generation
        active = p;
        renderTabs();
        renderNoKey();
      });
      row.appendChild(tab);
    }
    tabsBox.appendChild(row);
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
      throw new Error(mapped ?? out.message ?? `OpenRouter returned HTTP ${res.status}.`);
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
      throw new Error(out.ok ? "Unexpected Hugging Face response." : (mapped ?? out.message ?? `HTTP ${res.status}`));
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
          setError("The job ran longer than 10 minutes and was stopped. Check your fal.ai dashboard — it may still finish there.");
        } else {
          const kind = classifyFetchError((err as Error)?.message ?? "");
          setError(kind === "cors-blocked" ? humanizeFetchError(err, getProviderInfo(active)?.name ?? active) : (err as Error)?.message ?? "Generation failed.");
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

  const unsubscribe = onKeyChange(() => {
    renderNoKey();
  });

  renderTabs();
  renderNoKey();
  return () => {
    unsubscribe();
    pollController?.abort();
  };
}
