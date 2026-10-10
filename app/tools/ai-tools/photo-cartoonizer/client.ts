/**
 * Photo Cartoonizer — browser client (redesigned, Lane D).
 *
 * UI order: gradient header → key-vault card → no-key card →
 * provider tabs → photo upload + style → Generate → progress/status →
 * result + Download → errors.
 * OpenRouter cartoonizes YOUR photo; HF and fal.ai generate a cartoon
 * illustration from text (disclosed).
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
  buildOpenRouterCartoonEditRequest,
  parseOpenRouterImageResponse,
  buildHfCartoonRequest,
  parseHfImageStatus,
  buildFalCartoonSubmitRequest,
  parseFalSubmitResponse,
  buildFalStatusRequest,
  parseFalStatusResponse,
  buildFalResultRequest,
  parseFalImageResult,
  CARTOON_STYLES,
  type CartoonProviderId,
  type CartoonStyle,
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
            ? "Cartoonizing…"
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

  const style = document.createElement("style");
  style.textContent = `
    .hb-ctn-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-ctn-header {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-ctn-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-ctn-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-ctn-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-ctn-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .hb-ctn-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .hb-ctn-tab {
      padding: 10px 18px; border-radius: 10px; border: 2px solid #e2e8f0;
      background: #fff; font-size: 14px; font-weight: 600; color: #475569; cursor: pointer;
    }
    .hb-ctn-tab:hover { border-color: #ec4899; color: #ec4899; }
    .hb-ctn-tab.is-active {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border-color: transparent; color: #fff;
    }
    .hb-ctn-note {
      font-size: 13px; color: #92400e; background: #fffbeb; border: 1px solid #fde68a;
      border-radius: 10px; padding: 10px 14px; margin: 0 0 16px; line-height: 1.5;
    }
    .hb-ctn-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 28px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease; background: #f8fafc;
    }
    .hb-ctn-drop:hover { border-color: #ec4899; background: #fdf2f8; }
    .hb-ctn-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-ctn-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-ctn-preview { max-width: 100%; max-height: 220px; border-radius: 10px; margin: 12px auto 0; display: block; }
    .hb-ctn-select {
      width: 100%; padding: 12px; font-size: 15px; border: 2px solid #e2e8f0;
      border-radius: 10px; background: #fff; box-sizing: border-box; color: #1e293b;
      margin-bottom: 16px;
    }
    .hb-ctn-select:focus { outline: none; border-color: #ec4899; }
    .hb-ctn-hint { font-size: 13px; color: #64748b; margin: -10px 0 16px; }
    .hb-ctn-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .hb-ctn-generate {
      flex: 1; min-width: 200px; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-ctn-generate:hover:not(:disabled) { opacity: .92; }
    .hb-ctn-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-ctn-cancel {
      padding: 16px 24px; font-size: 16px; font-weight: 700; color: #64748b;
      background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer;
    }
    .hb-ctn-cancel:hover { border-color: #f43f5e; color: #f43f5e; }
    .hb-ctn-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-ctn-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-ctn-result {
      background: linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 100%);
      border-radius: 14px; padding: 20px; text-align: center; border: 1px solid #f9a8d4;
    }
    .hb-ctn-result img {
      max-width: 100%; max-height: 460px; border-radius: 12px;
      border: 1px solid #e2e8f0; display: block; margin: 0 auto 14px;
    }
    .hb-ctn-result-meta { font-size: 13px; color: #64748b; margin: 0 0 12px; }
    .hb-ctn-dl {
      display: inline-block; padding: 12px 28px; background: #16a34a; color: #fff;
      border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; border: none; margin-right: 8px;
    }
    .hb-ctn-dl:hover { background: #15803d; }
    .hb-ctn-open {
      display: inline-block; padding: 10px 24px; background: #fff; color: #8b5cf6;
      border: 2px solid #c4b5fd; border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;
    }
    .hb-ctn-open:hover { background: #f5f3ff; }
    @media (max-width: 640px) { .hb-ctn-header { padding: 18px; } }
  `;
  root.appendChild(style);

  const wrap = el("div", "hb-ctn-wrap");
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------------
  const header = el("div", "hb-ctn-header");
  header.appendChild(el("h3", "", "🎨 Photo Cartoonizer"));
  header.appendChild(el("p", "", "Turn your photo into a cartoon — or generate a cartoon illustration from text. Billed to YOUR provider account."));
  wrap.appendChild(header);

  // --- key vault --------------------------------------------------------------------
  const vaultCard = el("div", "hb-ctn-card");
  wrap.appendChild(vaultCard);

  const noKeyCard = el("div", "hb-ctn-card");
  wrap.appendChild(noKeyCard);

  // --- provider tabs ------------------------------------------------------------------
  const tabsCard = el("div", "hb-ctn-card");
  wrap.appendChild(tabsCard);

  // --- form -----------------------------------------------------------------------------
  const formCard = el("div", "hb-ctn-card");
  wrap.appendChild(formCard);

  const status = el("p", "hb-ctn-status");
  wrap.appendChild(status);
  const errorBox = el("div", "hb-ctn-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);
  const resultBox = el("div", "hb-ctn-result");
  resultBox.hidden = true;
  wrap.appendChild(resultBox);

  const providers = getProviders();
  let active: CartoonProviderId = providers[0];
  let pollController: AbortController | null = null;
  let photoDataUrl: string | null = null;

  renderKeyVault(vaultCard, {
    providers,
    intro: "Generation is billed to YOUR provider account. Only OpenRouter restyles your actual photo — HF and fal.ai draw from text.",
  });

  function setStatus(text: string): void {
    status.textContent = text;
  }
  function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }

  function showResult(imageUrl: string, providerId: CartoonProviderId): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    const info = getProviderInfo(providerId);
    resultBox.appendChild(el("p", "hb-ctn-label", "🎉 Your cartoon"));
    if (info) resultBox.appendChild(el("p", "hb-ctn-result-meta", "Generated with " + info.name));
    const img = el("img", "") as HTMLImageElement;
    img.src = imageUrl;
    img.alt = "Cartoonized image";
    img.loading = "lazy";
    resultBox.appendChild(img);
    const row = el("div", "hb-ctn-actions");
    const dl = el("button", "hb-ctn-dl", "⬇ Download cartoon") as HTMLButtonElement;
    dl.type = "button";
    dl.addEventListener("click", () => {
      const stamp = new Date().toISOString().slice(0, 10);
      void downloadUrl(imageUrl, `photo-cartoon-${stamp}.jpg`).catch(() => {
        setError("Download failed — try opening the full-size image instead.");
      });
    });
    const open = el("a", "hb-ctn-open", "Open full size") as HTMLAnchorElement;
    open.href = imageUrl;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    row.appendChild(dl);
    row.appendChild(open);
    resultBox.appendChild(row);
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderNoKey(): void {
    noKeyCard.innerHTML = "";
    const info = getProviderInfo(active);
    if (getKey(active)) {
      noKeyCard.hidden = true;
      return;
    }
    noKeyCard.hidden = false;
    const cfg = ctx.config;
    noKeyCard.appendChild(el("p", "hb-ctn-label", cfg.noKeyHeadline ?? "🔑 Save an API key to unlock"));
    noKeyCard.appendChild(el("p", "hb-ctn-hint", cfg.noKeyBody ?? "Paste a key above, press Save, then Generate."));
    if (info) {
      noKeyCard.appendChild(el("p", "hb-ctn-result-meta", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-ctn-open", `Get a ${info.name} key`) as HTMLAnchorElement;
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyCard.appendChild(link);
    }
    noKeyCard.appendChild(el("p", "hb-ctn-hint", "Paste → Save → Generate works immediately. Nothing else to configure."));
  }

  function renderTabs(): void {
    tabsCard.innerHTML = "";
    tabsCard.appendChild(el("span", "hb-ctn-label", "⚡ Provider"));
    const row = el("div", "hb-ctn-tabs");
    row.setAttribute("role", "tablist");
    for (const p of providers) {
      const info = getProviderInfo(p);
      const tab = el("button", "hb-ctn-tab" + (p === active ? " is-active" : ""), info?.name ?? p) as HTMLButtonElement;
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", p === active ? "true" : "false");
      tab.addEventListener("click", () => {
        if (pollController) return;
        active = p;
        renderTabs();
        renderNoKey();
        renderRouteNote();
      });
      row.appendChild(tab);
    }
    tabsCard.appendChild(row);
  }

  const routeNote = el("p", "hb-ctn-note");
  function renderRouteNote(): void {
    routeNote.textContent =
      active === "openrouter"
        ? "OpenRouter route: restyles YOUR uploaded photo as a cartoon."
        : "Heads up: this route draws a cartoon illustration from text — it will NOT be your photo in cartoon form. Pick OpenRouter to restyle your photo.";
  }

  // --- form fields --------------------------------------------------------------------
  formCard.appendChild(routeNote);
  formCard.appendChild(el("label", "hb-ctn-label", "📷 Your photo"));

  const drop = el("div", "hb-ctn-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload a photo: click to browse");
  drop.appendChild(el("p", "hb-ctn-title", "Click to choose a photo"));
  drop.appendChild(el("p", "hb-ctn-sub", "Bright, clear photos with a visible subject. Max 10 MB."));
  const fileInput = el("input", "") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  drop.appendChild(fileInput);
  const preview = el("img", "hb-ctn-preview") as HTMLImageElement;
  preview.hidden = true;
  preview.alt = "Your uploaded photo preview";
  drop.appendChild(preview);
  formCard.appendChild(drop);

  formCard.appendChild(el("label", "hb-ctn-label", "🎭 Cartoon style"));
  const styleInput = el("select", "hb-ctn-select") as HTMLSelectElement;
  for (const s of CARTOON_STYLES) {
    const opt = el("option", "", s) as HTMLOptionElement;
    opt.value = s;
    styleInput.appendChild(opt);
  }
  styleInput.value = "3d animated";
  formCard.appendChild(styleInput);
  formCard.appendChild(el("p", "hb-ctn-hint", "Only OpenRouter applies this style to your photo — HF and fal.ai interpret the style as a text prompt."));

  const actions = el("div", "hb-ctn-actions");
  const genBtn = el("button", "hb-ctn-generate", "🎨 Cartoonize") as HTMLButtonElement;
  genBtn.type = "button";
  const cancelBtn = el("button", "hb-ctn-cancel", "Cancel") as HTMLButtonElement;
  cancelBtn.type = "button";
  cancelBtn.hidden = true;
  actions.appendChild(genBtn);
  actions.appendChild(cancelBtn);
  formCard.appendChild(actions);

  function setBusy(busy: boolean): void {
    genBtn.disabled = busy;
    fileInput.disabled = busy;
    styleInput.disabled = busy;
    cancelBtn.hidden = !busy;
  }

  drop.addEventListener("click", (e) => {
    if (e.target !== fileInput) fileInput.click();
  });
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener("dragover", (e) => e.preventDefault());
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  });

  function handleFile(file: File): void {
    if (file.size > MAX_FILE_BYTES) {
      setError("That image is over 10 MB — pick a smaller file.");
      fileInput.value = "";
      return;
    }
    setError(null);
    void fileToDataUrl(file)
      .then((url) => {
        photoDataUrl = url;
        preview.src = url;
        preview.hidden = false;
      })
      .catch((err) => setError((err as Error).message));
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) {
      photoDataUrl = null;
      preview.hidden = true;
      return;
    }
    handleFile(file);
  });

  async function runOpenRouter(key: string, dataUrl: string, style: CartoonStyle): Promise<string> {
    const req = buildOpenRouterCartoonEditRequest({ key, photoDataUrl: dataUrl, style });
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

  async function runHf(key: string, style: CartoonStyle): Promise<string> {
    const req = buildHfCartoonRequest({ key, style });
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

  async function runFal(key: string, style: CartoonStyle, signal: AbortSignal): Promise<string> {
    const req = buildFalCartoonSubmitRequest({ key, style });
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
      const style = (styleInput.value as CartoonStyle) || "3d animated";
      const v = validateInputs({ style, provider: active, hasImage: !!photoDataUrl });
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
        if (active === "openrouter") url = await runOpenRouter(key, photoDataUrl as string, style);
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
  renderRouteNote();
  return () => {
    unsubscribe();
    pollController?.abort();
  };
}
