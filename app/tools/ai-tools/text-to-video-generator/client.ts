/**
 * Text-to-Video Generator — browser client (Lane D, fal.ai only).
 *
 * UI order: key-vault card → tool form → Generate → live poll status →
 * <video controls> + Download → errors. No-key state explains what
 * unlocking needs. Keys are never logged; user text via textContent.
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
  validateInputs,
  classifyFetchError,
  buildT2vSubmitRequest,
  parseFalSubmitResponse,
  buildFalStatusRequest,
  parseFalStatusResponse,
  buildFalResultRequest,
  parseFalVideoResult,
  VIDEO_DURATIONS,
  VIDEO_ASPECTS,
  type VideoDuration,
  type VideoAspect,
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

async function pollVideoUrl(args: {
  key: string;
  requestId: string;
  signal: AbortSignal;
  onStatus: (label: string) => void;
}): Promise<string> {
  const deadline = Date.now() + POLL_MAX_MS;
  let delay = 3000;
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
        ? `Queued — position ${pos}. Video can take a few minutes…`
        : st === "IN_QUEUE"
          ? "Queued — video can take a few minutes…"
          : st === "IN_PROGRESS"
            ? "Rendering your video…"
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
      const rout = parseFalVideoResult(rres.status, rjson);
      if (!rout.ok) throw new Error(rout.message ?? "Result fetch failed.");
      return String((rout.data as Record<string, unknown>)["videoUrl"] ?? "");
    }
    await sleep(Math.min(delay, 5000), args.signal);
    delay = Math.min(delay * 1.6, 5000);
  }
}

async function downloadUrl(url: string, filename: string): Promise<void> {
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

export function mountAiTool(ctx: AiClientContext): () => void {
  const root = ctx.mountEl;
  root.innerHTML = "";
  const wrap = el("div", "hb-ai-tool");
  root.appendChild(wrap);

  let pollController: AbortController | null = null;

  const vaultBox = el("div", "hb-ai-section");
  wrap.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers: ["falai"],
    intro: "Video generation bills YOUR fal.ai account per second — the priciest category. Paste a key, press Save, then Generate.",
  });

  const noKeyBox = el("div", "hb-ai-section hb-ai-nokey");
  wrap.appendChild(noKeyBox);

  const formBox = el("div", "hb-ai-section");
  wrap.appendChild(formBox);

  const promptLabel = el("label", "hb-ai-label", "Video prompt");
  const promptInput = el("textarea", "hb-ai-input hb-ai-textarea") as HTMLTextAreaElement;
  promptInput.rows = 4;
  promptInput.placeholder = "e.g. slow aerial shot over a misty pine forest at sunrise, cinematic";
  promptInput.setAttribute("aria-label", "Video prompt");
  formBox.appendChild(promptLabel);
  formBox.appendChild(promptInput);

  const row2 = el("div", "hb-ai-row");
  const durWrap = el("div", "hb-ai-field");
  durWrap.appendChild(el("label", "hb-ai-label", "Duration"));
  const durInput = el("select", "hb-ai-input hb-ai-select") as HTMLSelectElement;
  for (const d of VIDEO_DURATIONS) {
    const opt = el("option", "", d) as HTMLOptionElement;
    opt.value = d;
    durInput.appendChild(opt);
  }
  durInput.value = "6s";
  durWrap.appendChild(durInput);
  const aspWrap = el("div", "hb-ai-field");
  aspWrap.appendChild(el("label", "hb-ai-label", "Aspect ratio"));
  const aspInput = el("select", "hb-ai-input hb-ai-select") as HTMLSelectElement;
  for (const a of VIDEO_ASPECTS) {
    const opt = el("option", "", a) as HTMLOptionElement;
    opt.value = a;
    aspInput.appendChild(opt);
  }
  aspInput.value = "16:9";
  aspWrap.appendChild(aspInput);
  row2.appendChild(durWrap);
  row2.appendChild(aspWrap);
  formBox.appendChild(row2);

  const actions = el("div", "hb-ai-actions");
  const genBtn = el("button", "hb-btn hb-btn--primary", "Generate video");
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
    promptInput.disabled = busy;
    durInput.disabled = busy;
    aspInput.disabled = busy;
    cancelBtn.hidden = !busy;
  }

  function showResult(videoUrl: string): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    resultBox.appendChild(el("h3", "hb-ai-result__title", "Your video"));
    const video = el("video", "hb-ai-result__video") as HTMLVideoElement;
    video.src = videoUrl;
    video.controls = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    resultBox.appendChild(video);
    const row = el("div", "hb-ai-actions");
    const dl = el("button", "hb-btn hb-btn--primary", "Download MP4");
    dl.type = "button";
    dl.addEventListener("click", () => {
      const stamp = new Date().toISOString().slice(0, 10);
      void downloadUrl(videoUrl, `ai-video-${stamp}.mp4`).catch(() => {
        setError("Download failed — try playing the video and using your browser's save option.");
      });
    });
    const open = el("a", "hb-btn hb-btn--ghost", "Open video");
    open.href = videoUrl;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    row.appendChild(dl);
    row.appendChild(open);
    resultBox.appendChild(row);
  }

  function renderNoKey(): void {
    noKeyBox.innerHTML = "";
    const info = getProviderInfo("falai");
    if (getKey("falai")) {
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

  genBtn.addEventListener("click", () => {
    void (async () => {
      setError(null);
      resultBox.hidden = true;
      resultBox.innerHTML = "";
      const key = ctx.getKey("falai") ?? getKey("falai");
      if (!key) {
        renderNoKey();
        setError("No fal.ai key saved yet — paste one in the key vault above and press Save.");
        return;
      }
      const prompt = promptInput.value.trim();
      const duration = (durInput.value as VideoDuration) || "6s";
      const aspect = (aspInput.value as VideoAspect) || "16:9";
      const v = validateInputs({ prompt, duration, aspect });
      if (!v.ok) {
        setError(v.errors.join(" "));
        return;
      }
      pollController = new AbortController();
      const signal = pollController.signal;
      setBusy(true);
      setStatus("Submitting to fal.ai (Veo 3)…");
      try {
        const req = buildT2vSubmitRequest({ key, prompt, duration, aspect });
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
        const url = await pollVideoUrl({ key, requestId, signal, onStatus: setStatus });
        setStatus("");
        showResult(url);
      } catch (err) {
        if (signal.aborted || (err as Error)?.message === "cancelled") {
          setStatus("Cancelled.");
        } else if ((err as Error)?.message === "timeout") {
          setError("The job ran longer than 10 minutes and was stopped. Check your fal.ai dashboard — it may still finish there.");
        } else {
          const kind = classifyFetchError((err as Error)?.message ?? "");
          setError(
            kind === "cors-blocked"
              ? humanizeFetchError(err, "fal.ai")
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

  renderNoKey();
  return () => {
    unsubscribe();
    pollController?.abort();
  };
}
