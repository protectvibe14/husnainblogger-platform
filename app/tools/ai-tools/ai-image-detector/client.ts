/**
 * AI Image Detector — browser client (Lane D, redesigned).
 *
 * Flow: gradient header -> styled drop zone upload + preview ->
 * LOCAL byte scan (works without any key; never leaves the browser) ->
 * signals cards with honest meanings -> key-vault card ->
 * optional Hive cloud check (scores + "no detector is definitive" banner) ->
 * errors. Keys are never logged; user text via textContent.
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
  scanImageBytes,
  validateImageFile,
  buildHiveRequest,
  parseHiveResponse,
  classifyFetchError,
  type ImageSignal,
  type HiveScores,
} from "./logic.ts";

const PROVIDER_ID = "hive";

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

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = "";

  // --- styles -------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-id-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-id-header {
      background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-id-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-id-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-id-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-id-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 10px;
    }
    .hb-id-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease;
      background: #f8fafc;
    }
    .hb-id-drop:hover, .hb-id-drop.hb-id-dragover {
      border-color: #0f766e; background: #f0fdfa;
    }
    .hb-id-drop.hb-id-has-image { padding: 12px; }
    .hb-id-icon { font-size: 40px; margin-bottom: 8px; }
    .hb-id-title { font-size: 17px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-id-hint { font-size: 13px; color: #64748b; margin: 0; }
    .hb-id-browse {
      display: inline-block; margin-top: 12px; padding: 10px 22px;
      background: #0f766e; color: #fff; border: none; border-radius: 8px;
      font-size: 15px; font-weight: 600; cursor: pointer;
    }
    .hb-id-browse:hover { background: #0d5c56; }
    .hb-id-preview { max-width: 100%; max-height: 240px; border-radius: 10px; margin: 0 auto; display: block; }
    .hb-id-filename { font-size: 13px; color: #475569; margin-top: 8px; word-break: break-all; }
    .hb-id-change {
      font-size: 13px; color: #0f766e; background: none; border: none;
      cursor: pointer; text-decoration: underline; margin-top: 4px;
    }
    .hb-id-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
    .hb-id-note { font-size: 13px; color: #64748b; margin: 0 0 14px; }
    .hb-id-note--warn {
      background: #fffbeb; border: 1px solid #fde68a; color: #92400e;
      border-radius: 8px; padding: 10px 14px; font-weight: 600;
    }
    .hb-id-signals { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
    .hb-id-signal {
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 12px 14px;
    }
    .hb-id-signal strong { display: block; font-size: 14px; color: #1e293b; margin-bottom: 4px; }
    .hb-id-signal p { margin: 0; font-size: 13px; color: #475569; line-height: 1.5; }
    .hb-id-scores { display: flex; flex-direction: column; gap: 12px; }
    .hb-id-score-row { display: flex; align-items: center; gap: 12px; }
    .hb-id-score-label { flex: 0 0 150px; font-size: 14px; font-weight: 600; color: #1e293b; }
    .hb-id-score-bar { flex: 1; height: 12px; background: #e2e8f0; border-radius: 6px; overflow: hidden; }
    .hb-id-score-fill { height: 100%; background: linear-gradient(90deg, #0f766e, #14b8a6); transition: width .4s; }
    .hb-id-score-pct { flex: 0 0 52px; text-align: right; font-size: 14px; font-weight: 700; color: #0f766e; }
    .hb-id-actions { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
    .hb-id-btn {
      padding: 14px 28px; font-size: 16px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-id-btn:hover:not(:disabled) { opacity: .92; }
    .hb-id-btn:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-id-btn--ghost {
      padding: 10px 22px; font-size: 14px; font-weight: 600;
      background: #fff; color: #0f766e; border: 2px solid #0f766e;
      border-radius: 8px; cursor: pointer;
    }
    .hb-id-btn--ghost:hover { background: #f0fdfa; }
    .hb-id-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-id-progress > div {
      height: 100%; width: 30%; border-radius: 5px;
      background: linear-gradient(90deg, #0f766e, #14b8a6);
      animation: hb-id-slide 1.1s ease-in-out infinite;
    }
    @keyframes hb-id-slide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
    .hb-id-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-id-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-id-nokey-title { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
    .hb-id-nokey-body { font-size: 14px; color: #475569; margin: 0 0 8px; }
    .hb-id-nokey-cost { font-size: 13px; color: #0f766e; font-weight: 600; margin: 0 0 10px; }
    .hb-id-key-link {
      display: inline-block; padding: 10px 22px; background: #fff; color: #0f766e;
      border: 2px solid #0f766e; border-radius: 8px; font-size: 14px;
      font-weight: 700; text-decoration: none;
    }
    .hb-id-key-link:hover { background: #f0fdfa; }
    @media (max-width: 640px) {
      .hb-id-header { padding: 18px; }
      .hb-id-card { padding: 16px; }
      .hb-id-score-label { flex-basis: 120px; }
    }
  `;
  root.appendChild(style);

  const wrap = el("div", "hb-id-wrap");
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el("div", "hb-id-header");
  header.appendChild(el("h3", "", "🔍 AI Image Detector"));
  header.appendChild(
    el(
      "p",
      "",
      "Local metadata forensics — EXIF, XMP, C2PA, no-metadata signals, never a verdict. Plus an optional Hive cloud check.",
    ),
  );
  wrap.appendChild(header);

  let imageFile: File | null = null;
  let objectUrl: string | null = null;
  let inFlight = false;

  // --- upload + local scan ----------------------------------------------------
  const uploadCard = el("div", "hb-id-card");
  uploadCard.appendChild(el("label", "hb-id-label", "Image to check"));

  const drop = el("div", "hb-id-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload an image: drag and drop, or click to browse");
  const icon = el("div", "hb-id-icon", "🖼️");
  const dtitle = el("p", "hb-id-title", "Drop your image here");
  const dsub = el("p", "hb-id-hint", "or click to browse — JPEG, PNG, or WebP up to 10 MB");
  const browseBtn = el("button", "hb-id-browse", "Choose image");
  browseBtn.type = "button";
  drop.appendChild(icon);
  drop.appendChild(dtitle);
  drop.appendChild(dsub);
  drop.appendChild(browseBtn);
  uploadCard.appendChild(drop);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;
  uploadCard.appendChild(fileInput);

  uploadCard.appendChild(
    el(
      "p",
      "hb-id-hint",
      "The local scan runs entirely in your browser — the file never leaves your device.",
    ),
  );
  wrap.appendChild(uploadCard);

  // --- local results ------------------------------------------------------------
  const localBox = el("div", "hb-id-card");
  localBox.hidden = true;
  wrap.appendChild(localBox);

  // --- Hive key vault (optional) ---------------------------------------------------
  const vaultCard = el("div", "hb-id-card");
  renderKeyVault(vaultCard, {
    providers: [PROVIDER_ID],
    intro:
      "Optional: run Hive's cloud AI-image detection as a second opinion. Your key stays in your browser.",
  });
  wrap.appendChild(vaultCard);

  const noKeyBox = el("div", "hb-id-card");
  wrap.appendChild(noKeyBox);

  const cloudCard = el("div", "hb-id-card");
  const cloudBtn = el("button", "hb-id-btn", "☁️ Run Hive cloud check");
  cloudBtn.type = "button";
  cloudBtn.disabled = true;
  cloudCard.appendChild(cloudBtn);
  wrap.appendChild(cloudCard);

  // --- progress + status + error ------------------------------------------------------
  const progress = el("div", "hb-id-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  progress.appendChild(el("div", ""));
  wrap.appendChild(progress);

  const statusBox = el("p", "hb-id-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);

  const errorBox = el("div", "hb-id-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  const cloudBox = el("div", "hb-id-card");
  cloudBox.hidden = true;
  wrap.appendChild(cloudBox);

  // --- helpers --------------------------------------------------------------------------
  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setError(text: string | null): void {
    progress.hidden = true;
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }
  function setBusy(b: boolean): void {
    inFlight = b;
    cloudBtn.disabled = b || !imageFile || !getStoredKey();
    if (b) {
      progress.hidden = false;
    } else {
      progress.hidden = true;
    }
  }

  function getStoredKey(): string | null {
    return ctx.getKey(PROVIDER_ID) ?? getKey(PROVIDER_ID);
  }

  function showDropEmpty(): void {
    drop.classList.remove("hb-id-has-image");
    drop.innerHTML = "";
    drop.appendChild(icon);
    drop.appendChild(dtitle);
    drop.appendChild(dsub);
    drop.appendChild(browseBtn);
  }

  function showDropPreview(url: string, name: string): void {
    drop.classList.add("hb-id-has-image");
    drop.innerHTML = "";
    const preview = document.createElement("img");
    preview.src = url;
    preview.className = "hb-id-preview";
    preview.alt = "Uploaded image preview";
    drop.appendChild(preview);
    drop.appendChild(el("p", "hb-id-filename", name));
    const change = el("button", "hb-id-change", "Choose a different image");
    change.type = "button";
    change.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    drop.appendChild(change);
  }

  function renderSignals(signals: ImageSignal[], format: string): void {
    localBox.innerHTML = "";
    localBox.hidden = false;
    localBox.appendChild(
      el("p", "hb-id-result-title", "Local metadata forensics — " + format.toUpperCase()),
    );
    localBox.appendChild(
      el(
        "p",
        "hb-id-note",
        "Signals, not proof. This tool never says an image is definitively AI-generated or real.",
      ),
    );
    const list = el("ul", "hb-id-signals");
    for (const s of signals) {
      const item = el("li", "hb-id-signal");
      item.appendChild(el("strong", "", s.label));
      item.appendChild(el("p", "", s.meaning));
      list.appendChild(item);
    }
    localBox.appendChild(list);
    const row = el("div", "hb-id-actions");
    const copy = el("button", "hb-id-btn--ghost", "Copy findings");
    copy.type = "button";
    copy.addEventListener("click", () => {
      const text = signals.map((s) => "- " + s.label + ": " + s.meaning).join("\n");
      void navigator.clipboard
        .writeText("Image forensics (" + format.toUpperCase() + ") — signals, not proof:\n" + text)
        .catch(() => undefined);
      copy.textContent = "Copied ✓";
      setTimeout(() => {
        copy.textContent = "Copy findings";
      }, 1500);
    });
    row.appendChild(copy);
    localBox.appendChild(row);
    localBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderHiveScores(scores: HiveScores): void {
    cloudBox.innerHTML = "";
    cloudBox.hidden = false;
    cloudBox.appendChild(el("p", "hb-id-result-title", "☁️ Hive cloud check"));
    cloudBox.appendChild(
      el(
        "p",
        "hb-id-note hb-id-note--warn",
        "No detector is definitive — treat these scores as one hint among many, never as proof.",
      ),
    );
    const aiPct = Math.round(scores.aiGenerated * 100);
    const notPct = Math.round(scores.notAiGenerated * 100);
    const list = el("div", "hb-id-scores");
    const mk = (label: string, pct: number): HTMLElement => {
      const row = el("div", "hb-id-score-row");
      row.appendChild(el("span", "hb-id-score-label", label));
      const bar = el("div", "hb-id-score-bar");
      const fill = el("div", "hb-id-score-fill");
      fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el("span", "hb-id-score-pct", pct + "%"));
      return row;
    };
    list.appendChild(mk("AI-generated score", aiPct));
    list.appendChild(mk("Not-AI score", notPct));
    cloudBox.appendChild(list);
    cloudBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderNoKey(): void {
    noKeyBox.innerHTML = "";
    const info = getProviderInfo(PROVIDER_ID);
    if (getStoredKey()) {
      noKeyBox.hidden = true;
      cloudBtn.disabled = inFlight || !imageFile;
      return;
    }
    noKeyBox.hidden = false;
    const cfg = ctx.config;
    noKeyBox.appendChild(el("p", "hb-id-nokey-title", cfg.noKeyHeadline ?? "Local scan works without a key"));
    noKeyBox.appendChild(
      el("p", "hb-id-nokey-body", cfg.noKeyBody ?? "Upload an image above — the local scan works now."),
    );
    if (info) {
      noKeyBox.appendChild(el("p", "hb-id-nokey-cost", info.freeTier + " " + info.costNote));
      const link = el("a", "hb-id-key-link", "Get a " + info.name + " key");
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    cloudBtn.disabled = inFlight || !imageFile || !getStoredKey();
  }

  function pickFile(f: File | null): void {
    setError(null);
    cloudBox.hidden = true;
    cloudBox.innerHTML = "";
    if (!f) return;
    const v = validateImageFile({ mimeType: f.type, sizeBytes: f.size });
    if (!v.ok) {
      setError(v.errors.join(" "));
      fileInput.value = "";
      imageFile = null;
      localBox.hidden = true;
      showDropEmpty();
      renderNoKey();
      return;
    }
    imageFile = f;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(f);
    showDropPreview(objectUrl, f.name);
    setStatus("Scanning image bytes locally…");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const buf = reader.result as ArrayBuffer;
        const result = scanImageBytes(new Uint8Array(buf));
        setStatus("");
        renderSignals(result.signals, result.format);
      } catch {
        setStatus("");
        setError("Could not scan this image. Try a different file.");
      }
    };
    reader.onerror = () => {
      setStatus("");
      setError("Could not read the image file.");
    };
    reader.readAsArrayBuffer(f);
    renderNoKey();
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
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("hb-id-dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hb-id-dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hb-id-dragover");
    pickFile(e.dataTransfer?.files?.[0] ?? null);
  });
  fileInput.addEventListener("change", () => pickFile(fileInput.files?.[0] ?? null));

  // --- Hive cloud check ---
  cloudBtn.addEventListener("click", () => {
    void (async () => {
      setError(null);
      const key = getStoredKey();
      if (!key) {
        renderNoKey();
        setError("Save a Hive key in the key vault above first — or just use the local scan, which needs no key.");
        return;
      }
      if (!imageFile) {
        setError("Upload an image first.");
        return;
      }
      setBusy(true);
      setStatus("Running Hive cloud check…");
      try {
        const req = buildHiveRequest({ key });
        const form = new FormData();
        form.append("media", imageFile, imageFile.name);
        form.append("model", "ai_generated_detection");
        const res = await fetch(req.url, { method: req.method, headers: req.headers, body: form });
        const json: unknown = await res.json().catch(() => null);
        const out = parseHiveResponse(res.status, json);
        if (!out.ok) {
          const mapped = humanizeHttpStatus(res.status, "Hive");
          throw new Error(mapped ?? out.message ?? "Hive check failed.");
        }
        setStatus("");
        renderHiveScores((out.data as Record<string, unknown>)["scores"] as HiveScores);
      } catch (err) {
        const kind = classifyFetchError((err as Error)?.message ?? "");
        setError(
          kind === "cors-blocked"
            ? humanizeFetchError(err, "Hive")
            : (err as Error)?.message ?? "Hive check failed.",
        );
      } finally {
        setBusy(false);
        setStatus("");
      }
    })();
  });

  onKeyChange(() => {
    renderNoKey();
  });

  renderNoKey();
}
