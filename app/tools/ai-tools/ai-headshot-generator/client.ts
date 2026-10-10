/**
 * AI Headshot Generator — browser client (Lane D, redesigned).
 *
 * UI order: gradient header -> key-vault card -> no-key card ->
 * provider tabs card -> selfie upload + style card -> big gradient
 * Generate button -> progress/status -> result card + Download.
 *
 * OpenRouter edits YOUR selfie (likeness-preserving); HF and fal.ai
 * generate from text (disclosed — will not look like you).
 * User data rendered via textContent only.
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

  // --- styles ---------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-hs-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-hs-header {
      background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-hs-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-hs-header p { margin: 0; font-size: 14px; opacity: .9; }
    .hb-hs-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-hs-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-hs-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
    .hb-hs-tab {
      padding: 10px 18px; border: 2px solid #e2e8f0; border-radius: 10px;
      background: #fff; font-size: 14px; font-weight: 600; color: #475569;
      cursor: pointer;
    }
    .hb-hs-tab:hover { border-color: #f59e0b; }
    .hb-hs-tab.is-active {
      border-color: #b45309; background: #fffbeb; color: #92400e;
    }
    .hb-hs-note {
      font-size: 13px; color: #92400e; background: #fffbeb;
      border: 1px solid #fde68a; border-radius: 8px; padding: 10px 14px;
      margin: 0 0 12px;
    }
    .hb-hs-drop {
      border: 2px dashed #9aa4b2; border-radius: 12px; padding: 28px 18px;
      text-align: center; cursor: pointer; transition: all .2s ease;
      background: #f8fafc;
    }
    .hb-hs-drop:hover, .hb-hs-drop.hb-hs-dragover {
      border-color: #f59e0b; background: #fffbeb;
    }
    .hb-hs-drop-icon { font-size: 34px; margin-bottom: 6px; }
    .hb-hs-drop-title { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-hs-drop-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-hs-preview { max-width: 100%; max-height: 220px; border-radius: 10px; margin: 12px auto 0; display: block; }
    .hb-hs-select {
      width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
      border: 2px solid #e2e8f0; border-radius: 10px; background: #fff;
      box-sizing: border-box; margin-top: 4px;
    }
    .hb-hs-select:focus { outline: none; border-color: #f59e0b; }
    .hb-hs-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-hs-actions { display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap; }
    .hb-hs-generate {
      flex: 1; min-width: 200px; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #b45309 0%, #f59e0b 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-hs-generate:hover:not(:disabled) { opacity: .92; }
    .hb-hs-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-hs-cancel {
      padding: 16px 24px; font-size: 16px; font-weight: 600; color: #b91c1c;
      background: #fff; border: 2px solid #fecaca; border-radius: 12px; cursor: pointer;
    }
    .hb-hs-cancel:hover { background: #fef2f2; }
    .hb-hs-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-hs-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-hs-nokey { text-align: center; }
    .hb-hs-nokey h3 { margin: 0 0 8px; font-size: 17px; color: #1e293b; }
    .hb-hs-nokey p { margin: 0 0 8px; font-size: 14px; color: #475569; }
    .hb-hs-nokey .hb-hs-keylink {
      display: inline-block; margin: 8px 0; padding: 12px 24px;
      background: #b45309; color: #fff; border-radius: 10px; font-size: 15px;
      font-weight: 700; text-decoration: none;
    }
    .hb-hs-nokey .hb-hs-keylink:hover { background: #92400e; }
    .hb-hs-result-card {
      background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
      border-radius: 14px; padding: 20px; text-align: center;
    }
    .hb-hs-result-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .hb-hs-result-meta { font-size: 13px; color: #92400e; margin: 0 0 14px; }
    .hb-hs-result-image {
      max-width: 100%; max-height: 420px; border-radius: 12px;
      border: 1px solid #fde68a; display: block; margin: 0 auto 16px;
    }
    .hb-hs-result-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
    .hb-hs-dl {
      padding: 12px 28px; background: #16a34a; color: #fff; border: none;
      border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer;
    }
    .hb-hs-dl:hover { background: #15803d; }
    .hb-hs-open {
      display: inline-block; padding: 12px 24px; background: #fff; color: #92400e;
      border: 2px solid #f59e0b; border-radius: 10px; font-size: 15px;
      font-weight: 700; text-decoration: none;
    }
    .hb-hs-open:hover { background: #fffbeb; }
    @media (max-width: 640px) {
      .hb-hs-header { padding: 18px; }
      .hb-hs-header h3 { font-size: 18px; }
      .hb-hs-card, .hb-hs-result-card { padding: 16px; }
      .hb-hs-generate { min-width: 100%; }
    }
  `;
  root.appendChild(style);

  const wrap = el("div", "hb-hs-wrap");
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el("div", "hb-hs-header");
  header.appendChild(el("h3", "", "🧑‍💼 AI Headshot Generator"));
  header.appendChild(el("p", "", "Turn a selfie into a professional headshot — or generate one from text. Pick a provider, upload, pick a style, generate."));
  wrap.appendChild(header);

  const providers = getProviders();
  let active: HeadshotProviderId = providers[0];
  let pollController: AbortController | null = null;
  let selfieDataUrl: string | null = null;

  // --- key vault card -------------------------------------------------------
  const vaultCard = el("div", "hb-hs-card");
  wrap.appendChild(vaultCard);
  renderKeyVault(vaultCard, {
    providers,
    intro: "Generation is billed to YOUR provider account. Only OpenRouter edits your actual photo — HF and fal.ai generate from text.",
  });

  // --- no-key card ----------------------------------------------------------
  const noKeyBox = el("div", "hb-hs-card hb-hs-nokey");
  wrap.appendChild(noKeyBox);

  // --- provider tabs card ---------------------------------------------------
  const tabsCard = el("div", "hb-hs-card");
  const tabsBox = el("div", "");
  tabsCard.appendChild(tabsBox);
  wrap.appendChild(tabsCard);

  // --- form card ------------------------------------------------------------
  const formBox = el("div", "hb-hs-card");
  wrap.appendChild(formBox);

  const likenessNote = el("p", "hb-hs-note");
  formBox.appendChild(likenessNote);

  formBox.appendChild(el("label", "hb-hs-label", "📸 Your photo (selfie)"));
  const drop = el("div", "hb-hs-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload your selfie: drag and drop, or press Enter to browse");
  drop.appendChild(el("div", "hb-hs-drop-icon", "🤳"));
  drop.appendChild(el("p", "hb-hs-drop-title", "Drop your selfie here"));
  drop.appendChild(el("p", "hb-hs-drop-sub", "or click to browse — clear, front-facing photo, max 10 MB"));
  const fileInput = el("input", "") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  drop.appendChild(fileInput);
  const preview = el("img", "hb-hs-preview") as HTMLImageElement;
  preview.hidden = true;
  preview.alt = "Your uploaded selfie preview";
  drop.appendChild(preview);
  formBox.appendChild(drop);
  formBox.appendChild(el("p", "hb-hs-hint", "Your selfie is sent only to the provider you pick — never to our servers."));

  formBox.appendChild(el("label", "hb-hs-label", "🎨 Headshot style"));
  const styleInput = el("select", "hb-hs-select") as HTMLSelectElement;
  for (const s of HEADSHOT_STYLES) {
    const opt = el("option", "", s) as HTMLOptionElement;
    opt.value = s;
    styleInput.appendChild(opt);
  }
  styleInput.value = "corporate";
  formBox.appendChild(styleInput);

  const actions = el("div", "hb-hs-actions");
  const genBtn = el("button", "hb-hs-generate", "✨ Generate headshot");
  genBtn.type = "button";
  const cancelBtn = el("button", "hb-hs-cancel", "Cancel");
  cancelBtn.type = "button";
  cancelBtn.hidden = true;
  actions.appendChild(genBtn);
  actions.appendChild(cancelBtn);
  formBox.appendChild(actions);

  // --- status / error / result ----------------------------------------------
  const statusBox = el("p", "hb-hs-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);

  const errorBox = el("div", "hb-hs-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  const resultBox = el("div", "hb-hs-result-card");
  resultBox.hidden = true;
  wrap.appendChild(resultBox);

  // --- behavior (unchanged logic) -------------------------------------------
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
    resultBox.appendChild(el("h3", "hb-hs-result-title", "✨ Your headshot"));
    if (info) resultBox.appendChild(el("p", "hb-hs-result-meta", `Generated with ${info.name}`));
    const img = el("img", "hb-hs-result-image") as HTMLImageElement;
    img.src = imageUrl;
    img.alt = "AI-generated headshot";
    img.loading = "lazy";
    resultBox.appendChild(img);
    const row = el("div", "hb-hs-result-actions");
    const dl = el("button", "hb-hs-dl", "⬇ Download headshot");
    dl.type = "button";
    dl.addEventListener("click", () => {
      const stamp = new Date().toISOString().slice(0, 10);
      void downloadUrl(imageUrl, `ai-headshot-${stamp}.jpg`).catch(() => {
        setError("Download failed — try opening the full-size image instead.");
      });
    });
    const open = el("a", "hb-hs-open", "Open full size");
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
    if (getKey(active)) {
      noKeyBox.hidden = true;
      return;
    }
    noKeyBox.hidden = false;
    const cfg = ctx.config;
    noKeyBox.appendChild(el("h3", "", cfg.noKeyHeadline ?? "Save an API key to unlock"));
    noKeyBox.appendChild(el("p", "", cfg.noKeyBody ?? "Paste a key above, press Save, then Generate."));
    if (info) {
      noKeyBox.appendChild(el("p", "", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-hs-keylink", `Get a ${info.name} key`);
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    noKeyBox.appendChild(el("p", "", "Paste → Save → Generate works immediately. Nothing else to configure."));
  }

  function renderTabs(): void {
    tabsBox.innerHTML = "";
    tabsBox.appendChild(el("span", "hb-hs-label", "🤖 Provider"));
    const row = el("div", "hb-hs-tabs");
    row.setAttribute("role", "tablist");
    for (const p of providers) {
      const info = getProviderInfo(p);
      const tab = el("button", "hb-hs-tab" + (p === active ? " is-active" : ""), info?.name ?? p);
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

  function pickSelfie(file: File | undefined | null): void {
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
  }

  fileInput.addEventListener("change", () => pickSelfie(fileInput.files?.[0] ?? null));
  drop.addEventListener("click", (e) => {
    if (e.target !== fileInput) fileInput.click();
  });
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("hb-hs-dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hb-hs-dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hb-hs-dragover");
    pickSelfie(e.dataTransfer?.files?.[0] ?? null);
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
