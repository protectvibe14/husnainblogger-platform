/**
 * Text-to-Video Generator — browser client (Lane D, fal.ai only, redesigned).
 *
 * UI order: gradient header -> key-vault card -> styled tool form ->
 * Generate -> live poll progress -> <video controls> result card +
 * Download -> errors. No-key state explains what unlocking needs.
 * Keys are never logged; user text via textContent.
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

  // --- styles ---------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-t2v-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-t2v-header {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-t2v-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-t2v-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-t2v-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-t2v-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-t2v-textarea, .hb-t2v-select {
      width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
      border: 2px solid #e2e8f0; border-radius: 10px; background: #fff;
      box-sizing: border-box; color: #1e293b;
    }
    .hb-t2v-textarea:focus, .hb-t2v-select:focus { outline: none; border-color: #ec4899; }
    .hb-t2v-textarea { min-height: 104px; resize: vertical; }
    .hb-t2v-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
    @media (max-width: 640px) { .hb-t2v-grid { grid-template-columns: 1fr; } }
    .hb-t2v-sample {
      font-size: 13px; color: #db2777; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-t2v-actions { display: flex; gap: 12px; margin-top: 18px; }
    .hb-t2v-generate {
      flex: 1; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-t2v-generate:hover:not(:disabled) { opacity: .92; }
    .hb-t2v-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-t2v-cancel {
      padding: 16px 24px; font-size: 16px; font-weight: 700; color: #b91c1c;
      background: #fef2f2; border: 2px solid #fecaca; border-radius: 12px; cursor: pointer;
    }
    .hb-t2v-cancel:hover { background: #fee2e2; }
    .hb-t2v-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-t2v-progress > div {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #ec4899, #8b5cf6);
      transition: width .3s;
    }
    .hb-t2v-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-t2v-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-t2v-result {
      background: linear-gradient(135deg, #fdf4ff 0%, #faf5ff 100%);
      border: 1px solid #e9d5ff; border-radius: 14px; padding: 20px;
    }
    .hb-t2v-result h3 { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #6d28d9; }
    .hb-t2v-result video {
      width: 100%; border-radius: 10px; background: #0f172a;
    }
    .hb-t2v-result-actions { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
    .hb-t2v-dl {
      padding: 12px 28px; font-size: 16px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border: none; border-radius: 10px; cursor: pointer;
    }
    .hb-t2v-dl:hover { opacity: .92; }
    .hb-t2v-open {
      display: inline-block; padding: 12px 24px; font-size: 15px; font-weight: 700;
      color: #6d28d9; background: #f5f3ff; border: 2px solid #ddd6fe;
      border-radius: 10px; text-decoration: none;
    }
    .hb-t2v-open:hover { background: #ede9fe; }
    .hb-t2v-nokey h3 { margin: 0 0 8px; font-size: 16px; color: #1e293b; }
    .hb-t2v-nokey p { font-size: 14px; color: #475569; margin: 0 0 8px; }
    .hb-t2v-getkey {
      display: inline-block; padding: 10px 22px; font-size: 14px; font-weight: 700;
      color: #fff; background: #0284c7; border-radius: 10px; text-decoration: none;
    }
    .hb-t2v-getkey:hover { background: #0369a1; }
    .hb-t2v-cost { font-size: 13px; color: #64748b; margin: 0; text-align: center; }
    @media (max-width: 640px) { .hb-t2v-header { padding: 18px; } }
  `;
  root.appendChild(style);

  const wrap = el("div", "hb-t2v-wrap");
  root.appendChild(wrap);

  // --- header -----------------------------------------------------------------
  const header = el("div", "hb-t2v-header");
  header.appendChild(el("h3", "", "🎬 Text-to-Video Generator"));
  header.appendChild(
    el("p", "", "Describe the shot — get an MP4 video clip back, playable right here and downloadable."),
  );
  wrap.appendChild(header);

  let pollController: AbortController | null = null;

  // --- key vault --------------------------------------------------------------
  const vaultCard = el("div", "hb-t2v-card");
  vaultCard.appendChild(el("label", "hb-t2v-label", "🔑 API key"));
  const vaultBox = el("div", "");
  vaultCard.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers: ["falai"],
    intro: "Video generation bills YOUR fal.ai account per second — the priciest category. Paste a key, press Save, then Generate.",
  });
  wrap.appendChild(vaultCard);

  const noKeyBox = el("div", "hb-t2v-card hb-t2v-nokey");
  wrap.appendChild(noKeyBox);

  // --- form ---------------------------------------------------------------------
  const formCard = el("div", "hb-t2v-card");
  const promptLabel = el("label", "hb-t2v-label", "🎥 Video prompt");
  promptLabel.htmlFor = "hb-t2v-prompt";
  formCard.appendChild(promptLabel);
  const promptInput = el("textarea", "hb-t2v-textarea") as HTMLTextAreaElement;
  promptInput.id = "hb-t2v-prompt";
  promptInput.rows = 4;
  promptInput.placeholder = "e.g. slow aerial shot over a misty pine forest at sunrise, cinematic";
  promptInput.setAttribute("aria-label", "Video prompt");
  formCard.appendChild(promptInput);
  const sampleBtn = el("button", "hb-t2v-sample", "✨ Try a sample prompt") as HTMLButtonElement;
  sampleBtn.addEventListener("click", () => {
    promptInput.value =
      "Slow aerial shot over a misty pine forest at sunrise, golden light breaking through the fog, cinematic drone move";
  });
  formCard.appendChild(sampleBtn);

  const grid = el("div", "hb-t2v-grid");
  const durWrap = el("div", "");
  const durLabel = el("label", "hb-t2v-label", "⏱ Duration");
  durLabel.htmlFor = "hb-t2v-dur";
  durWrap.appendChild(durLabel);
  const durInput = el("select", "hb-t2v-select") as HTMLSelectElement;
  durInput.id = "hb-t2v-dur";
  for (const d of VIDEO_DURATIONS) {
    const opt = el("option", "", d) as HTMLOptionElement;
    opt.value = d;
    durInput.appendChild(opt);
  }
  durInput.value = "6s";
  durWrap.appendChild(durInput);
  grid.appendChild(durWrap);

  const aspWrap = el("div", "");
  const aspLabel = el("label", "hb-t2v-label", "🖼 Aspect ratio");
  aspLabel.htmlFor = "hb-t2v-asp";
  aspWrap.appendChild(aspLabel);
  const aspInput = el("select", "hb-t2v-select") as HTMLSelectElement;
  aspInput.id = "hb-t2v-asp";
  for (const a of VIDEO_ASPECTS) {
    const opt = el("option", "", a) as HTMLOptionElement;
    opt.value = a;
    aspInput.appendChild(opt);
  }
  aspInput.value = "16:9";
  aspWrap.appendChild(aspInput);
  grid.appendChild(aspWrap);
  formCard.appendChild(grid);

  const actions = el("div", "hb-t2v-actions");
  const genBtn = el("button", "hb-t2v-generate", "🎬 Generate video") as HTMLButtonElement;
  genBtn.type = "button";
  const cancelBtn = el("button", "hb-t2v-cancel", "Cancel") as HTMLButtonElement;
  cancelBtn.type = "button";
  cancelBtn.hidden = true;
  actions.appendChild(genBtn);
  actions.appendChild(cancelBtn);
  formCard.appendChild(actions);
  wrap.appendChild(formCard);

  // --- progress -------------------------------------------------------------------
  const progress = el("div", "hb-t2v-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  const progressBar = el("div", "");
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const statusBox = el("p", "hb-t2v-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);
  const errorBox = el("div", "hb-t2v-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  // --- result -----------------------------------------------------------------------
  const resultBox = el("div", "hb-t2v-result");
  resultBox.hidden = true;
  wrap.appendChild(resultBox);

  const costNote = el(
    "p",
    "hb-t2v-cost",
    "A 6–8 second clip can cost over a dollar on fal.ai — check your dashboard before generating in volume.",
  );
  wrap.appendChild(costNote);

  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }
  function setProgress(fraction: number, msg: string): void {
    progress.hidden = false;
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    progressBar.style.width = pct + "%";
    setStatus(msg);
  }
  function hideProgress(): void {
    progress.hidden = true;
    progressBar.style.width = "0%";
  }
  function setBusy(busy: boolean): void {
    genBtn.disabled = busy;
    promptInput.disabled = busy;
    durInput.disabled = busy;
    aspInput.disabled = busy;
    cancelBtn.hidden = !busy;
    if (busy) setProgress(0.05, "Submitting…");
  }

  function showResult(videoUrl: string): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    resultBox.appendChild(el("h3", "", "🎉 Your video is ready"));
    const video = el("video", "") as HTMLVideoElement;
    video.src = videoUrl;
    video.controls = true;
    video.preload = "metadata";
    video.setAttribute("playsinline", "");
    resultBox.appendChild(video);
    const row = el("div", "hb-t2v-result-actions");
    const dl = el("button", "hb-t2v-dl", "⬇ Download MP4") as HTMLButtonElement;
    dl.type = "button";
    dl.addEventListener("click", () => {
      const stamp = new Date().toISOString().slice(0, 10);
      void downloadUrl(videoUrl, `ai-video-${stamp}.mp4`).catch(() => {
        setError("Download failed — try playing the video and using your browser's save option.");
      });
    });
    const open = el("a", "hb-t2v-open", "Open video") as HTMLAnchorElement;
    open.href = videoUrl;
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    row.appendChild(dl);
    row.appendChild(open);
    resultBox.appendChild(row);
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
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
    noKeyBox.appendChild(el("h3", "", cfg.noKeyHeadline ?? "Save an API key to unlock"));
    noKeyBox.appendChild(el("p", "", cfg.noKeyBody ?? "Paste a key above, press Save, then Generate."));
    if (info) {
      noKeyBox.appendChild(el("p", "", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-t2v-getkey", `Get a ${info.name} key`);
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    noKeyBox.appendChild(
      el("p", "", "Paste → Save → Generate works immediately. Nothing else to configure."),
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
        const url = await pollVideoUrl({ key, requestId, signal, onStatus: (m) => setProgress(0.3, m) });
        hideProgress();
        setStatus("");
        showResult(url);
      } catch (err) {
        hideProgress();
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
