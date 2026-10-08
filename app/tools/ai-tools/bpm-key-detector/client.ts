/**
 * BPM & Key Detector — client.ts (inventory tool-545).
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

  const intro = el(
    "p",
    "hb-ai-label",
    "Pick an audio file (MP3, WAV, OGG — under 50 MB). First 2 minutes are analyzed.",
  );
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "audio/*";

  const runBtn = el("button", "hb-btn hb-btn--primary", "Detect BPM & key") as HTMLButtonElement;
  const status = el("p", "hb-ai-status");
  status.setAttribute("role", "status");
  const errorBox = el("p", "hb-ai-error");
  errorBox.style.display = "none";

  const resultBox = el("div", "hb-ai-result");
  resultBox.style.display = "none";
  const bpmLine = el("p", "hb-ai-label", "");
  bpmLine.style.fontSize = "1.25em";
  const keyLine = el("p", "hb-ai-label", "");
  keyLine.style.fontSize = "1.25em";
  resultBox.append(bpmLine, keyLine);

  const noteBox = el("p", "hb-ai-label", getDisclosures()[1]);

  host.append(intro, fileInput, runBtn, status, errorBox, resultBox, noteBox);

  const showError = (msg: string): void => {
    errorBox.textContent = msg;
    errorBox.style.display = "";
  };

  runBtn.addEventListener("click", async () => {
    errorBox.style.display = "none";
    resultBox.style.display = "none";
    const file = fileInput.files?.[0];
    const check = validateInputs({
      fileName: file?.name,
      fileSizeMb: file ? file.size / (1024 * 1024) : undefined,
    });
    if (!check.ok) {
      showError(check.error ?? "Please choose an audio file first.");
      return;
    }

    runBtn.disabled = true;
    status.textContent = "Decoding audio…";
    try {
      const AudioCtx =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) throw new Error("Web Audio is not supported in this browser.");
      const audioCtx = new AudioCtx();
      const bytes = await (file as File).arrayBuffer();
      const buffer = await audioCtx.decodeAudioData(bytes);
      await audioCtx.close();

      const targetRate = 22050;
      let samples = toMonoAtRate(buffer, targetRate);
      const maxLen = Math.floor(targetRate * MAX_SECONDS);
      if (samples.length > maxLen) samples = samples.slice(0, maxLen);

      status.textContent = "Analyzing tempo and key…";
      // Yield so the status paints before the heavy loop.
      await new Promise((r) => setTimeout(r, 30));
      const { envelope, envRate, chroma } = analyze(samples, targetRate);

      const bpmEst = autocorrBpm(envelope, envRate);
      const keyEst = detectKey(chroma);

      if (!bpmEst) {
        showError("Could not find a steady beat — try a track with a clearer rhythm.");
        return;
      }
      bpmLine.textContent = `Tempo: ${bpmEst.bpm} BPM (estimate ±3%, confidence ${(bpmEst.confidence * 100).toFixed(0)}%)`;
      keyLine.textContent = keyEst
        ? `Key: ${keyEst.key} (best guess, correlation ${keyEst.correlation.toFixed(2)})`
        : "Key: could not determine a clear key.";
      resultBox.style.display = "";
      status.textContent = "Done — verify by ear for anything critical.";
    } catch (err) {
      showError(
        err instanceof Error
          ? `Analysis failed: ${err.message}`
          : "Analysis failed — please try a different audio file.",
      );
    } finally {
      runBtn.disabled = false;
    }
  });
}
