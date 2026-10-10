/**
 * BPM & Key Detector — client.ts (redesigned) (inventory tool-545).
 * Upload audio -> Web Audio decode -> mono downmix -> STFT (compact
 * radix-2 FFT) -> spectral-flux onset envelope -> autocorrelation BPM
 * (logic.ts) + averaged chromagram -> Krumhansl key (logic.ts).
 * No model, no network — honest DSP only.
 */
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import {
  validateInputs,
  autocorrBpm,
  detectKey,
  getDisclosures,
  MAX_SECONDS,
} from "./logic.ts";

const ACCENT = "#4f46e5";
const ACCENT_DARK = "#06b6d4";
const ACCENT_SOFT = "rgba(79, 70, 229, .12)";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** In-place radix-2 FFT on real/imag arrays (length must be a power of 2). */
function fft(real: Float64Array, imag: Float64Array): void {
  const n = real.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      const tr = real[i]; real[i] = real[j]; real[j] = tr;
      const ti = imag[i]; imag[i] = imag[j]; imag[j] = ti;
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cwr = 1;
      let cwi = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = real[i + k];
        const ui = imag[i + k];
        const vr = real[i + k + len / 2] * cwr - imag[i + k + len / 2] * cwi;
        const vi = real[i + k + len / 2] * cwi + imag[i + k + len / 2] * cwr;
        real[i + k] = ur + vr;
        imag[i + k] = ui + vi;
        real[i + k + len / 2] = ur - vr;
        imag[i + k + len / 2] = ui - vi;
        const nwr = cwr * wr - cwi * wi;
        cwi = cwr * wi + cwi * wr;
        cwr = nwr;
      }
    }
  }
}

/** Downmix to mono and resample to targetRate by linear interpolation. */
function toMonoAtRate(buffer: AudioBuffer, targetRate: number): Float32Array {
  const srcRate = buffer.sampleRate;
  const channels = buffer.numberOfChannels;
  const len = buffer.length;
  const mono = new Float32Array(len);
  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) mono[i] += data[i] / channels;
  }
  if (srcRate === targetRate) return mono;
  const ratio = srcRate / targetRate;
  const outLen = Math.floor(len / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const i0 = Math.floor(pos);
    const i1 = Math.min(len - 1, i0 + 1);
    const f = pos - i0;
    out[i] = mono[i0] * (1 - f) + mono[i1] * f;
  }
  return out;
}

interface Analysis {
  envelope: number[];
  envRate: number;
  chroma: number[];
}

/** STFT -> spectral-flux onset envelope + averaged chromagram. */
function analyze(samples: Float32Array, sampleRate: number): Analysis {
  const N = 2048;
  const hop = 512;
  const real = new Float64Array(N);
  const imag = new Float64Array(N);
  const hann = new Float64Array(N);
  for (let i = 0; i < N; i++) hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / N));

  const envelope: number[] = [];
  const chroma = new Array<number>(12).fill(0);
  let chromaFrames = 0;
  let prevMag: Float64Array | null = null;

  for (let start = 0; start + N <= samples.length; start += hop) {
    for (let i = 0; i < N; i++) {
      real[i] = samples[start + i] * hann[i];
      imag[i] = 0;
    }
    fft(real, imag);
    const mag = new Float64Array(N / 2);
    for (let k = 0; k < N / 2; k++) mag[k] = Math.hypot(real[k], imag[k]);

    // Spectral flux (half-wave rectified) -> onset envelope.
    if (prevMag) {
      let flux = 0;
      for (let k = 1; k < N / 2; k++) {
        const d = mag[k] - prevMag[k];
        if (d > 0) flux += d;
      }
      envelope.push(flux);
    } else {
      envelope.push(0);
    }
    prevMag = mag;

    // Chroma: map bins 55Hz..4kHz to pitch classes, weight by magnitude.
    let frameEnergy = 0;
    for (let k = 1; k < N / 2; k++) {
      const freq = (k * sampleRate) / N;
      if (freq < 55 || freq > 4000) continue;
      const midi = 69 + 12 * (Math.log(freq / 440) / Math.LN2);
      const pc = ((Math.round(midi) % 12) + 12) % 12;
      chroma[pc] += mag[k];
      frameEnergy += mag[k];
    }
    if (frameEnergy > 0) chromaFrames++;
  }

  if (chromaFrames > 0) {
    const max = Math.max(...chroma, 1e-9);
    for (let i = 0; i < 12; i++) chroma[i] /= max;
  }
  return { envelope, envRate: sampleRate / hop, chroma };
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const host = ctx.mountEl;
  host.innerHTML = "";

  // --- styles -------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-bpm-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-bpm-header {
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-bpm-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-bpm-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-bpm-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .hb-bpm-card > h4 { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-bpm-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease;
      background: #f8fafc;
    }
    .hb-bpm-drop:hover, .hb-bpm-drop.hb-bpm-dragover {
      border-color: ${ACCENT}; background: ${ACCENT_SOFT};
    }
    .hb-bpm-drop.hb-bpm-has-file { padding: 14px; }
    .hb-bpm-icon { font-size: 40px; margin-bottom: 8px; }
    .hb-bpm-title { font-size: 17px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-bpm-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-bpm-browse {
      display: inline-block; margin-top: 12px; padding: 10px 22px;
      background: ${ACCENT}; color: #fff; border: none; border-radius: 8px;
      font-size: 15px; font-weight: 600; cursor: pointer;
    }
    .hb-bpm-browse:hover { background: ${ACCENT_DARK}; }
    .hb-bpm-filename { font-size: 14px; font-weight: 600; color: #1e293b; margin: 8px 0 0; word-break: break-all; }
    .hb-bpm-filemeta { font-size: 13px; color: #64748b; margin: 4px 0 0; }
    .hb-bpm-change {
      font-size: 13px; color: ${ACCENT}; background: none; border: none;
      cursor: pointer; text-decoration: underline; margin-top: 6px;
    }
    .hb-bpm-run {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-bpm-run:hover:not(:disabled) { opacity: .92; }
    .hb-bpm-run:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-bpm-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-bpm-progress > div {
      height: 100%; width: 30%; border-radius: 5px;
      background: linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK});
      animation: hb-bpm-slide 1.2s ease-in-out infinite;
    }
    @keyframes hb-bpm-slide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
    .hb-bpm-status { font-size: 14px; color: #475569; margin: 0; text-align: center; min-height: 20px; }
    .hb-bpm-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-bpm-result {
      background: linear-gradient(135deg, #eef2ff 0%, #ecfeff 100%);
      border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-bpm-result > h4 { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-bpm-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 600px) { .hb-bpm-stats { grid-template-columns: 1fr; } }
    .hb-bpm-stat {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
      padding: 18px; text-align: center;
    }
    .hb-bpm-stat .hb-bpm-stat-label { font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
    .hb-bpm-stat .hb-bpm-stat-value { font-size: 34px; font-weight: 800; color: ${ACCENT}; line-height: 1.1; }
    .hb-bpm-stat .hb-bpm-stat-sub { font-size: 13px; color: #64748b; margin-top: 6px; }
    .hb-bpm-note { font-size: 13px; color: #64748b; margin: 0; }
    @media (max-width: 640px) {
      .hb-bpm-header { padding: 18px; }
      .hb-bpm-card { padding: 16px; }
    }
  `;
  host.appendChild(style);

  const wrap = el("div", "hb-bpm-wrap");
  host.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el("div", "hb-bpm-header");
  header.appendChild(el("h3", "", "🎵 BPM & Key Detector"));
  header.appendChild(
    el("p", "", "Find any track's tempo and musical key right in your browser — on-device analysis, nothing uploaded."),
  );
  wrap.appendChild(header);

  // --- upload card ------------------------------------------------------------
  const uploadCard = el("div", "hb-bpm-card");
  uploadCard.appendChild(el("h4", "", "🎧 Your audio file"));

  const drop = el("div", "hb-bpm-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload an audio file: drag and drop, or click to browse");

  const icon = el("div", "hb-bpm-icon", "🎶");
  const title = el("p", "hb-bpm-title", "Drop your audio here");
  const sub = el("p", "hb-bpm-sub", "MP3, WAV, OGG — up to 50 MB. First 2 minutes are analyzed.");
  const browseBtn = el("button", "hb-bpm-browse", "Choose audio");
  browseBtn.type = "button";

  drop.append(icon, title, sub, browseBtn);
  uploadCard.appendChild(drop);
  wrap.appendChild(uploadCard);

  const fileInput = el("input", "") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "audio/*";
  fileInput.hidden = true;
  wrap.appendChild(fileInput);

  // --- run ----------------------------------------------------------------------
  const runBtn = el("button", "hb-bpm-run", "🎵 Detect BPM & key") as HTMLButtonElement;
  runBtn.type = "button";
  runBtn.disabled = true;
  wrap.appendChild(runBtn);

  const progress = el("div", "hb-bpm-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  progress.appendChild(el("div", ""));
  wrap.appendChild(progress);

  const status = el("p", "hb-bpm-status");
  status.setAttribute("role", "status");
  wrap.appendChild(status);

  const errorBox = el("div", "hb-bpm-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  // --- result ---------------------------------------------------------------------
  const resultBox = el("div", "hb-bpm-result");
  resultBox.hidden = true;
  resultBox.appendChild(el("h4", "", "📊 Analysis results"));
  const stats = el("div", "hb-bpm-stats");
  const bpmStat = el("div", "hb-bpm-stat");
  bpmStat.appendChild(el("p", "hb-bpm-stat-label", "Tempo"));
  const bpmValue = el("p", "hb-bpm-stat-value", "—");
  bpmStat.appendChild(bpmValue);
  const bpmSub = el("p", "hb-bpm-stat-sub", "");
  bpmStat.appendChild(bpmSub);
  const keyStat = el("div", "hb-bpm-stat");
  keyStat.appendChild(el("p", "hb-bpm-stat-label", "Musical key"));
  const keyValue = el("p", "hb-bpm-stat-value", "—");
  keyStat.appendChild(keyValue);
  const keySub = el("p", "hb-bpm-stat-sub", "");
  keyStat.appendChild(keySub);
  stats.append(bpmStat, keyStat);
  resultBox.appendChild(stats);
  wrap.appendChild(resultBox);

  const noteBox = el("p", "hb-bpm-note", getDisclosures()[1]);
  wrap.appendChild(noteBox);

  // --- state ----------------------------------------------------------------------
  let file: File | null = null;

  function showError(msg: string): void {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    resultBox.hidden = true;
  }
  function hideError(): void {
    errorBox.hidden = true;
    errorBox.textContent = "";
  }
  function setBusy(b: boolean, msg: string): void {
    progress.hidden = !b;
    status.textContent = msg;
  }

  function showDropEmpty(): void {
    drop.classList.remove("hb-bpm-has-file");
    drop.innerHTML = "";
    drop.append(icon, title, sub, browseBtn);
  }

  function showDropFile(f: File): void {
    drop.classList.add("hb-bpm-has-file");
    drop.innerHTML = "";
    const fileIcon = el("div", "hb-bpm-icon", "🎵");
    const fname = el("p", "hb-bpm-filename", f.name);
    const fmeta = el("p", "hb-bpm-filemeta", (f.size / (1024 * 1024)).toFixed(1) + " MB");
    const change = el("button", "hb-bpm-change", "Choose a different file");
    change.type = "button";
    change.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    drop.append(fileIcon, fname, fmeta, change);
  }

  function pickFile(f: File | null): void {
    hideError();
    resultBox.hidden = true;
    if (!f) return;
    const check = validateInputs({
      fileName: f.name,
      fileSizeMb: f.size / (1024 * 1024),
    });
    if (!check.ok) {
      showError(check.error ?? "Please choose an audio file first.");
      return;
    }
    file = f;
    showDropFile(f);
    runBtn.disabled = false;
    status.textContent = "Audio ready — click Detect BPM & key.";
  }

  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("hb-bpm-dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hb-bpm-dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hb-bpm-dragover");
    const f = e.dataTransfer?.files?.[0];
    pickFile(f ?? null);
  });
  fileInput.addEventListener("change", () => pickFile(fileInput.files?.[0] ?? null));

  runBtn.addEventListener("click", async () => {
    hideError();
    resultBox.hidden = true;
    const f = file ?? fileInput.files?.[0];
    const check = validateInputs({
      fileName: f?.name,
      fileSizeMb: f ? f.size / (1024 * 1024) : undefined,
    });
    if (!check.ok) {
      showError(check.error ?? "Please choose an audio file first.");
      return;
    }

    runBtn.disabled = true;
    setBusy(true, "Decoding audio…");
    try {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) throw new Error("Web Audio is not supported in this browser.");
      const audioCtx = new AudioCtx();
      const bytes = await (f as File).arrayBuffer();
      const buffer = await audioCtx.decodeAudioData(bytes);
      await audioCtx.close();

      const targetRate = 22050;
      let samples = toMonoAtRate(buffer, targetRate);
      const maxLen = Math.floor(targetRate * MAX_SECONDS);
      if (samples.length > maxLen) samples = samples.slice(0, maxLen);

      setBusy(true, "Analyzing tempo and key…");
      // Yield so the status paints before the heavy loop.
      await new Promise((r) => setTimeout(r, 30));
      const { envelope, envRate, chroma } = analyze(samples, targetRate);

      const bpmEst = autocorrBpm(envelope, envRate);
      const keyEst = detectKey(chroma);

      if (!bpmEst) {
        setBusy(false, '');
        showError("Could not find a steady beat — try a track with a clearer rhythm.");
        return;
      }
      bpmValue.textContent = String(bpmEst.bpm);
      bpmSub.textContent = `BPM (estimate ±3% · confidence ${(bpmEst.confidence * 100).toFixed(0)}%)`;
      if (keyEst) {
        keyValue.textContent = keyEst.key;
        keySub.textContent = `best guess · correlation ${keyEst.correlation.toFixed(2)}`;
      } else {
        keyValue.textContent = "—";
        keySub.textContent = "could not determine a clear key";
      }
      resultBox.hidden = false;
      setBusy(false, "Done — verify by ear for anything critical.");
      resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (err) {
      showError(
        err instanceof Error
          ? `Analysis failed: ${err.message}`
          : "Analysis failed — please try a different audio file.",
      );
      setBusy(false, "");
    } finally {
      runBtn.disabled = false;
    }
  });
}
