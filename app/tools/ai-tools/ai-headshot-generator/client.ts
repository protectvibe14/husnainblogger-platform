/**
 * AI Headshot Generator — browser client (Lane D).
 *
 * UI order: key-vault card → provider tabs → selfie upload + style →
 * Generate → progress/status → result + Download → errors.
 * OpenRouter edits YOUR selfie (likeness-preserving); HF and fal.ai
 * generate from text (disclosed — will not look like you).
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
  buildOpenRouterHeadshotEditRequest,
  parseOpenRouterImageResponse,
  buildHfHeadshotRequest,
  parseHfImageStatus,
  buildFalHeadshotSubmitRequest,
  parseFalSubmitResponse,
  buildFalStatusRequest,
  parseFalStatusResponse,
  buildFalResultRequest,
  parseFalImageResult,
  HEADSHOT_STYLES,
  type HeadshotProviderId,
  type HeadshotStyle,
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

const POLL_MAX_MS = 10 * 60 * 1000;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

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
    const req = buildFalStatusRequest({ key: args.key, requestId: args.requestId });
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
            ? "Generating your headshot…"
            : "Finishing up…",
    );
    if (st === "COMPLETED") {
      const rreq = buildFalResultRequest({ key: args.key, requestId: args.requestId });
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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Could not read the image file."));
    reader.readAsDataURL(file);
  });
}

export function mountAiTool(ctx: AiClientContext): () => void {
  const root = ctx.mountEl;
  root.innerHTML = "";
  const wrap = el("div", "hb-ai-tool");
  root.appendChild(wrap);

  const providers = getProviders();
  let active: HeadshotProviderId = providers[0];
  let pollController: AbortController | null = null;
  let selfieDataUrl: string | null = null;

  const vaultBox = el("div", "hb-ai-section");
  wrap.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers,
    intro: "Generation is billed to YOUR provider account. Only OpenRouter edits your actual photo — HF and fal.ai generate from text.",
  });

  const noKeyBox = el("div", "hb-ai-section hb-ai-nokey");
  wrap.appendChild(noKeyBox);

  const tabsBox = el("div", "hb-ai-section");
  wrap.appendChild(tabsBox);

  const formBox = el("div", "hb-ai-section");
  wrap.appendChild(formBox);

  const likenessNote = el("p", "hb-ai-note");
  formBox.appendChild(likenessNote);

  formBox.appendChild(el("label", "hb-ai-label", "Your photo (selfie)"));
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";
  formBox.appendChild(fileInput);
  const preview = el("img", "hb-ai-preview") as HTMLImageElement;
  preview.hidden = true;
  preview.alt = "Your uploaded selfie preview";
  formBox.appendChild(preview);
  formBox.appendChild(el("p", "hb-ai-hint", "Clear, front-facing selfie. Max 10 MB. Sent only to the provider you pick."));

  formBox.appendChild(el("label", "hb-ai-label", "Headshot style"));
  const styleInput = el("select", "hb-ai-input hb-ai-select") as HTMLSelectElement;
  for (const s of HEADSHOT_STYLES) {
    const opt = el("option", "", s) as HTMLOptionElement;
    opt.value = s;
    styleInput.appendChild(opt);
  }
  styleInput.value = "corporate";
  formBox.appendChild(styleInput);

  const actions = el("div", "hb-ai-actions");
  const genBtn = el("button", "hb-btn hb-btn--primary", "Generate headshot");
  genBtn.type = "button";
  const cancelBtn = el("button", "hb-btn hb-btn--ghost", "Cancel");
  cancelBtn.type = "button";
  cancelBtn.hidden = true;
  actions.appendChild(genBtn);
  actions.appendChild(cancelBtn);
  formBox.appendChild(actions);

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
    fileInput.disabled = busy;
    styleInput.disabled = busy;
    cancelBtn.hidden = !busy;
  }

  function renderLikenessNote(): void {
    likenessNote.textContent =
      active === "openrouter"
        ? "OpenRouter route: edits YOUR uploaded photo — the headshot keeps your face."
        : "Heads up: this route generates a headshot from text only — it will NOT look like you. Pick OpenRouter for a likeness-preserving edit.";
  }

  function showResult(imageUrl: string, providerId: HeadshotProviderId): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    const info = getProviderInfo(providerId);
    resultBox.appendChild(el("h3", "hb-ai-result__title", "Your headshot"));
    if (info) resultBox.appendChild(el("p", "hb-ai-result__meta", `Generated with ${info.name}`));
    const img = el("img", "hb-ai-result__image") as HTMLImageElement;
    img.src = imageUrl;
    img.alt = "AI-generated headshot";
    img.loading = "lazy";
    resultBox.appendChild(img);
    const row = el("div", "hb-ai-actions");
    const dl = el("button", "hb-btn hb-btn--primary", "Download headshot");
    dl.type = "button";
    dl.addEventListener("click", () => {
      const stamp = new Date().toISOString().slice(0, 10);
      void downloadUrl(imageUrl, `ai-headshot-${stamp}.jpg`).catch(() => {
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
    if (getKey(active)) {
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
    noKeyBox.appendChild(el("p", "hb-ai-nokey__hint", "Paste → Save → Generate works immediately. Nothing else to configure."));
  }

  function renderTabs(): void {
    tabsBox.innerHTML = "";
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
        if (pollController) return;
        active = p;
        renderTabs();
        renderNoKey();
        renderLikenessNote();
      });
      row.appendChild(tab);
    }
    tabsBox.appendChild(row);
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) {
      selfieDataUrl = null;
      preview.hidden = true;
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("That image is over 10 MB — pick a smaller file.");
      fileInput.value = "";
      return;
    }
    setError(null);
    void fileToDataUrl(file)
      .then((url) => {
        selfieDataUrl = url;
        preview.src = url;
        preview.hidden = false;
      })
      .catch((err) => setError((err as Error).message));
  });

  async function runOpenRouter(key: string, dataUrl: string, style: HeadshotStyle): Promise<string> {
    const req = buildOpenRouterHeadshotEditRequest({ key, selfieDataUrl: dataUrl, style });
    let res: Response;
    try {
      res = await fetch(req.url, { method: req.method, headers: req.headers, body: JSON.stringify(req.body) });
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

  async function runHf(key: string, style: HeadshotStyle): Promise<string> {
    const req = buildHfHeadshotRequest({ key, style });
    let res: Response;
    try {
      res = await fetch(req.url, { method: req.method, headers: req.headers, body: JSON.stringify(req.body) });
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
    return URL.createObjectURL(await res.blob());
  }

  async function runFal(key: string, style: HeadshotStyle, signal: AbortSignal): Promise<string> {
    const req = buildFalHeadshotSubmitRequest({ key, style });
    let res: Response;
    try {
      res = await fetch(req.url, { method: req.method, headers: req.headers, body: JSON.stringify(req.body), signal });
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
      const style = (styleInput.value as HeadshotStyle) || "corporate";
      const v = validateInputs({ style, provider: active, hasImage: !!selfieDataUrl });
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
        if (active === "openrouter") url = await runOpenRouter(key, selfieDataUrl as string, style);
        else if (active === "hf-inference") url = await runHf(key, style);
        else url = await runFal(key, style, signal);
        setStatus("");
        showResult(url, active);
      } catch (err) {
        if (signal.aborted || (err as Error)?.message === "cancelled") {
          setStatus("Cancelled.");
        } else if ((err as Error)?.message === "timeout") {
          setError("The job ran longer than 10 minutes and was stopped. Check your fal.ai dashboard — it may still finish there.");
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

  const unsubscribe = onKeyChange(() => {
    renderNoKey();
  });

  renderTabs();
  renderNoKey();
  renderLikenessNote();
  return () => {
    unsubscribe();
    pollController?.abort();
  };
}
