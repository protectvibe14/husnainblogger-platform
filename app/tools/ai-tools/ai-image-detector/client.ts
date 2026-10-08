/**
 * AI Image Detector — browser client (Lane D).
 *
 * Flow: image upload → LOCAL byte scan (works without any key; never
 * leaves the browser) → signals list with honest meanings → optional Hive
 * key-vault + cloud check (multipart, scores + "no detector is definitive"
 * banner) → errors. Keys are never logged; user text via textContent.
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

export function mountAiTool(ctx: AiClientContext): () => void {
  const root = ctx.mountEl;
  root.innerHTML = "";
  const wrap = el("div", "hb-ai-tool");
  root.appendChild(wrap);

  let imageFile: File | null = null;
  let inFlight = false;

  // --- upload + local scan ---
  const uploadBox = el("div", "hb-ai-section");
  wrap.appendChild(uploadBox);
  uploadBox.appendChild(el("label", "hb-ai-label", "Image to check"));
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "image/*";
  uploadBox.appendChild(fileInput);
  uploadBox.appendChild(
    el("p", "hb-ai-hint", "JPEG, PNG, or WebP — max 10 MB. The local scan runs in your browser; the file never leaves your device."),
  );
  const preview = el("img", "hb-ai-media__preview");
  preview.hidden = true;
  preview.alt = "Uploaded image preview";
  uploadBox.appendChild(preview);

  // --- local results ---
  const localBox = el("div", "hb-ai-section hb-ai-result");
  localBox.hidden = true;
  wrap.appendChild(localBox);

  // --- Hive key vault (optional) ---
  const vaultBox = el("div", "hb-ai-section");
  wrap.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers: [PROVIDER_ID],
    intro: "Optional: run Hive's cloud AI-image detection as a second opinion. Your key stays in your browser.",
  });

  const noKeyBox = el("div", "hb-ai-section hb-ai-nokey");
  wrap.appendChild(noKeyBox);

  const cloudRow = el("div", "hb-ai-section hb-ai-actions");
  const cloudBtn = el("button", "hb-btn hb-btn--secondary", "Run Hive cloud check");
  cloudBtn.type = "button";
  cloudBtn.disabled = true;
  cloudRow.appendChild(cloudBtn);
  wrap.appendChild(cloudRow);

  const statusBox = el("div", "hb-ai-section hb-ai-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);
  const errorBox = el("div", "hb-ai-section hb-ai-error");
  errorBox.hidden = true;
  wrap.appendChild(errorBox);
  const cloudBox = el("div", "hb-ai-section hb-ai-result");
  cloudBox.hidden = true;
  wrap.appendChild(cloudBox);

  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }
  function setBusy(b: boolean): void {
    inFlight = b;
    cloudBtn.disabled = b || !imageFile || !getStoredKey();
  }

  function getStoredKey(): string | null {
    return ctx.getKey(PROVIDER_ID) ?? getKey(PROVIDER_ID);
  }

  function renderSignals(signals: ImageSignal[], format: string): void {
    localBox.innerHTML = "";
    localBox.hidden = false;
    localBox.appendChild(el("h3", "hb-ai-result__title", `Local metadata forensics — ${format.toUpperCase()}`));
    localBox.appendChild(
      el("p", "hb-ai-result__note", "Signals, not proof. This tool never says an image is definitively AI-generated or real."),
    );
    const list = el("ul", "hb-ai-signal__list");
    for (const s of signals) {
      const item = el("li", "hb-ai-signal__item");
      item.appendChild(el("strong", "hb-ai-signal__label", s.label));
      item.appendChild(el("p", "hb-ai-signal__meaning", s.meaning));
      list.appendChild(item);
    }
    localBox.appendChild(list);
    const copyRow = el("div", "hb-ai-actions");
    const copy = el("button", "hb-btn hb-btn--ghost", "Copy findings");
    copy.type = "button";
    copy.addEventListener("click", () => {
      const text = signals.map((s) => `- ${s.label}: ${s.meaning}`).join("\n");
      void navigator.clipboard.writeText(`Image forensics (${format.toUpperCase()}) — signals, not proof:\n${text}`).catch(() => undefined);
      copy.textContent = "Copied ✓";
      setTimeout(() => {
        copy.textContent = "Copy findings";
      }, 1500);
    });
    copyRow.appendChild(copy);
    localBox.appendChild(copyRow);
  }

  function renderHiveScores(scores: HiveScores): void {
    cloudBox.innerHTML = "";
    cloudBox.hidden = false;
    cloudBox.appendChild(el("h3", "hb-ai-result__title", "Hive cloud check"));
    cloudBox.appendChild(
      el(
        "p",
        "hb-ai-result__note hb-ai-result__note--warn",
        "No detector is definitive — treat these scores as one hint among many, never as proof.",
      ),
    );
    const aiPct = Math.round(scores.aiGenerated * 100);
    const notPct = Math.round(scores.notAiGenerated * 100);
    const wrap2 = el("div", "hb-ai-scores");
    const mk = (label: string, pct: number): HTMLElement => {
      const row = el("div", "hb-ai-scores__row");
      row.appendChild(el("span", "hb-ai-scores__label", label));
      const bar = el("div", "hb-ai-scores__bar");
      const fill = el("div", "hb-ai-scores__fill");
      fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
      bar.appendChild(fill);
      row.appendChild(bar);
      row.appendChild(el("span", "hb-ai-scores__pct", `${pct}%`));
      return row;
    };
    wrap2.appendChild(mk("AI-generated score", aiPct));
    wrap2.appendChild(mk("Not-AI score", notPct));
    cloudBox.appendChild(wrap2);
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
    noKeyBox.appendChild(el("h3", "hb-ai-nokey__title", cfg.noKeyHeadline ?? "Local scan works without a key"));
    noKeyBox.appendChild(el("p", "hb-ai-nokey__body", cfg.noKeyBody ?? "Upload an image above — the local scan works now."));
    if (info) {
      noKeyBox.appendChild(el("p", "hb-ai-nokey__cost", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-btn hb-btn--secondary", `Get a ${info.name} key`);
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    cloudBtn.disabled = inFlight || !imageFile || !getStoredKey();
  }

  // --- upload + local scan ---
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    setError(null);
    cloudBox.hidden = true;
    cloudBox.innerHTML = "";
    const v = validateImageFile({ mimeType: file.type, sizeBytes: file.size });
    if (!v.ok) {
      setError(v.errors.join(" "));
      fileInput.value = "";
      imageFile = null;
      localBox.hidden = true;
      preview.hidden = true;
      renderNoKey();
      return;
    }
    imageFile = file;
    const obj = URL.createObjectURL(file);
    preview.src = obj;
    preview.hidden = false;
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
    reader.readAsArrayBuffer(file);
    renderNoKey();
  });

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
          kind === "cors-blocked" ? humanizeFetchError(err, "Hive") : (err as Error)?.message ?? "Hive check failed.",
        );
      } finally {
        setBusy(false);
        setStatus("");
      }
    })();
  });

  const unsubscribe = onKeyChange(() => {
    renderNoKey();
  });

  renderNoKey();
  return () => {
    unsubscribe();
  };
}
