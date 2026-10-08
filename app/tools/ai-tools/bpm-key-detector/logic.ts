/**
 * BPM & Key Detector — pure config + DSP math (inventory tool-545), zero
 * imports, zero network, zero DOM.
 *
 * HONESTY CONTRACT: there is NO model — getModelConfig() returns null.
 * client.ts decodes audio with the Web Audio API, builds an onset envelope
 * (spectral flux), estimates tempo by autocorrelation of that envelope, and
 * estimates key by correlating a chromagram against Krumhansl profiles.
 * BPM is labeled ±3% estimate; key is labeled "best guess".
 */

/** Local re-declaration (zero-import rule); mirrors lib/ai/types.ts. */
export interface AiModelInfo {
  id: string;
  task: string;
  sizeMb: number;
  license: string;
  dtype?: string;
  notes?: string;
}

export function getModelConfig(): AiModelInfo | null {
  return null; // no model — Web Audio DSP only
}

export function getDisclosures(): string[] {
  return [
    "No AI model — tempo and key are estimated with classic signal processing in your browser.",
    "BPM is an estimate (±3%): works best on music with a clear, steady beat; rubato or half-time feels can fool it.",
    "Key is a best guess from Krumhansl chroma correlation — enharmonic and modal ambiguity is normal.",
    "Your audio is decoded locally and never uploaded.",
  ];
}

export const HEADLINE =
  "Detect a track's tempo and musical key with on-device audio analysis — BPM estimate and key best-guess, nothing uploaded.";

export const MAX_FILE_MB = 50;
export const MAX_SECONDS = 120;

export const NOTE_NAMES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;

/** Krumhansl-Schmuckler key profiles. */
export const KRUMHANSL_MAJOR = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
export const KRUMHANSL_MINOR = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

export interface BpmEstimate {
  bpm: number;
  confidence: number; // 0..1, peak autocorrelation relative strength
}

export interface KeyEstimate {
  key: string; // e.g. "C major"
  correlation: number; // -1..1
}

/**
 * Estimate BPM from an onset envelope via normalized autocorrelation.
 * envelope: onset strength per frame; envRate: frames per second.
 * Searches 60–200 BPM; parabolic interpolation refines the peak lag.
 * Returns null when the envelope is too flat to read.
 */
export function autocorrBpm(envelope: number[], envRate: number): BpmEstimate | null {
  const n = envelope.length;
  if (n < 8 || envRate <= 0) return null;
  const mean = envelope.reduce((s, v) => s + v, 0) / n;
  const centered = envelope.map((v) => v - mean);
  const energy = centered.reduce((s, v) => s + v * v, 0);
  if (energy === 0) return null;

  const minLag = Math.max(2, Math.floor((60 / 200) * envRate));
  const maxLag = Math.min(n - 1, Math.ceil((60 / 60) * envRate));
  if (maxLag <= minLag) return null;

  const corr = new Array<number>(maxLag + 1).fill(0);
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) s += centered[i] * centered[i + lag];
    corr[lag] = s / energy;
  }

  // Prefer the earliest strong peak (avoids octave/half-time errors):
  // accept a peak only if it beats its neighbors and is >= 0.3 of the max.
  let maxCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) maxCorr = Math.max(maxCorr, corr[lag]);
  if (maxCorr <= 0) return null;

  let bestLag = -1;
  for (let lag = minLag + 1; lag < maxLag; lag++) {
    if (corr[lag] > corr[lag - 1] && corr[lag] >= corr[lag + 1] && corr[lag] >= maxCorr * 0.3) {
      bestLag = lag;
      break;
    }
  }
  if (bestLag === -1) {
    bestLag = minLag;
    for (let lag = minLag; lag <= maxLag; lag++) {
      if (corr[lag] > corr[bestLag]) bestLag = lag;
    }
  }

  // Parabolic interpolation for sub-frame precision.
  let refined = bestLag;
  if (bestLag > minLag && bestLag < maxLag) {
    const y0 = corr[bestLag - 1];
    const y1 = corr[bestLag];
    const y2 = corr[bestLag + 1];
    const denom = y0 - 2 * y1 + y2;
    if (denom !== 0) refined = bestLag + (0.5 * (y0 - y2)) / denom;
  }

  const bpm = (60 * envRate) / refined;
  // Confidence: peak strength relative to the average correlation.
  let avg = 0;
  let count = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    avg += corr[lag];
    count++;
  }
  avg /= count;
  const confidence = Math.min(1, Math.max(0, maxCorr / Math.max(1e-9, avg * 4)));
  return { bpm: Math.round(bpm * 10) / 10, confidence: Math.round(confidence * 1000) / 1000 };
}

/** Pearson correlation of two length-12 vectors. */
function pearson(a: number[], b: number[]): number {
  const ma = a.reduce((s, v) => s + v, 0) / 12;
  const mb = b.reduce((s, v) => s + v, 0) / 12;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < 12; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) * (a[i] - ma);
    db += (b[i] - mb) * (b[i] - mb);
  }
  if (da === 0 || db === 0) return 0;
  return num / (Math.sqrt(da) * Math.sqrt(db));
}

/**
 * Estimate key by correlating a 12-bin chromagram against the Krumhansl
 * major/minor profiles rotated through all 12 tonics. Pure, deterministic.
 */
export function detectKey(chroma: number[]): KeyEstimate | null {
  if (!Array.isArray(chroma) || chroma.length !== 12) return null;
  if (chroma.every((v) => v === 0)) return null;

  let best: KeyEstimate = { key: "C major", correlation: -2 };
  for (let tonic = 0; tonic < 12; tonic++) {
    // Rotate the profile so index 0 aligns with the tonic: pitch class
    // `tonic` gets profile[0], pitch class (tonic+1) gets profile[1], etc.
    const profMaj = Array.from({ length: 12 }, (_, i) => KRUMHANSL_MAJOR[(i - tonic + 12) % 12]);
    const profMin = Array.from({ length: 12 }, (_, i) => KRUMHANSL_MINOR[(i - tonic + 12) % 12]);
    const cMaj = pearson(chroma, profMaj);
    const cMin = pearson(chroma, profMin);
    if (cMaj > best.correlation) best = { key: `${NOTE_NAMES[tonic]} major`, correlation: cMaj };
    if (cMin > best.correlation) best = { key: `${NOTE_NAMES[tonic]} minor`, correlation: cMin };
  }
  return { key: best.key, correlation: Math.round(best.correlation * 1000) / 1000 };
}

/**
 * Validate the upload descriptor the client passes in.
 * values.fileName: string, required. values.fileSizeMb: number, <= MAX_FILE_MB.
 */
export function validateInputs(values: Record<string, unknown>): {
  ok: boolean;
  error?: string;
} {
  const name = values["fileName"];
  if (typeof name !== "string" || name.trim().length === 0) {
    return { ok: false, error: "Please choose an audio file first." };
  }
  const size = values["fileSizeMb"];
  if (typeof size !== "number" || !Number.isFinite(size) || size <= 0) {
    return { ok: false, error: "Could not read the file size — please try another file." };
  }
  if (size > MAX_FILE_MB) {
    return { ok: false, error: `Audio is too large — keep it under ${MAX_FILE_MB} MB.` };
  }
  return { ok: true };
}
