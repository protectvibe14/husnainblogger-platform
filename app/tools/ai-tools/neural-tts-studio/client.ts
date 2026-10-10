/**
 * client.ts — Neural TTS Studio (tool-507), Lane A.
 *
 * Flow: textarea + voice select + speed slider -> Generate ->
 * loadKokoroTTS (cached) -> chunked synthesis -> stitched WAV ->
 * audio player + download button. All on-device. Errors are honest
 * (no fake results ever). User text is injected via textContent only.
 */
import type {
  AiClientContext,
} from '../../../src/lib/ai/types.ts';
import type { ModelLoadProgress } from '../../../src/lib/ai/model-loader.ts';
import { loadKokoroTTS } from '../../../src/lib/ai/model-loader.ts';
import {
  validateInputs,
  getModelConfig,
  KOKORO_VOICES,
  TEXT_MAX_CHARS,
  SPEED_MIN,
  SPEED_MAX,
} from './logic.ts';

/** Minimal shape of the kokoro-js KokoroTTS instance we rely on. */
interface KokoroAudio {
  data: Float32Array;
  sampling_rate: number;
  toBlob: () => Blob | Promise<Blob>;
}
interface KokoroTtsInstance {
  generate(text: string, opts: { voice: string; speed: number }): Promise<KokoroAudio>;
}

/** Kokoro's phoneme context is limited, so long text goes in ~400-char chunks. */
const CHUNK_CHARS = 400;
/** Brief pause stitched between chunks (seconds). */
const CHUNK_GAP_SEC = 0.15;

let cachedTts: KokoroTtsInstance | null = null;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/** Split text on sentence boundaries, hard-splitting overlong sentences. */
export function splitTextForTts(text: string, maxChars = CHUNK_CHARS): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const sentences = normalized.match(/[^.!?;]+[.!?;]+["'”’)]?|\S[^.!?;]*$/g) ?? [normalized];
  const chunks: string[] = [];
  let current = '';
  for (const raw of sentences) {
    const s = raw.trim();
    if (!s) continue;
    const candidate = current ? current + ' ' + s : s;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }
    if (current) {
      chunks.push(current);
      current = '';
    }
    let rest = s;
    while (rest.length > maxChars) {
      chunks.push(rest.slice(0, maxChars));
      rest = rest.slice(maxChars).trim();
    }
    current = rest;
  }
  if (current) chunks.push(current);
  return chunks;
}

/** Encode mono 16-bit PCM samples as a WAV blob. */
export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const n = samples.length;
  const buffer = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buffer);
  const writeAscii = (offset: number, s: string): void => {
    for (let i = 0; i < s.length; i++) v.setUint8(offset + i, s.charCodeAt(i));
  };
  writeAscii(0, 'RIFF');
  v.setUint32(4, 36 + n * 2, true);
  writeAscii(8, 'WAVE');
  writeAscii(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  writeAscii(36, 'data');
  v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

/** Extract PCM samples from a kokoro-js audio object, with blob-decode fallback. */
async function extractSamples(audio: KokoroAudio): Promise<{ samples: Float32Array; sampleRate: number }> {
  if (audio.data instanceof Float32Array && audio.data.length > 0 && Number.isFinite(audio.sampling_rate)) {
    return { samples: audio.data, sampleRate: audio.sampling_rate };
  }
  const maybe = audio.toBlob();
  const blob = maybe instanceof Blob ? maybe : await maybe;
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    return { samples: decoded.getChannelData(0), sampleRate: decoded.sampleRate };
  } finally {
    void ctx.close();
  }
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = '';
  const cfg = getModelConfig();

  // --- studio styles ---------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-tts-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-tts-header {
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-tts-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-tts-header p { margin: 0; font-size: 14px; opacity: .9; }
    .hb-tts-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-tts-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-tts-textarea {
      width: 100%; min-height: 140px; padding: 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical;
      font-family: inherit; box-sizing: border-box;
    }
    .hb-tts-textarea:focus { outline: none; border-color: #7c3aed; }
    .hb-tts-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-tts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 640px) { .hb-tts-grid { grid-template-columns: 1fr; } }
    .hb-tts-select {
      width: 100%; padding: 12px; font-size: 15px; border: 2px solid #e2e8f0;
      border-radius: 10px; background: #fff; box-sizing: border-box;
    }
    .hb-tts-select:focus { outline: none; border-color: #7c3aed; }
    .hb-tts-voice-preview { font-size: 13px; color: #64748b; margin-top: 6px; }
    .hb-tts-slider-row { display: flex; align-items: center; gap: 12px; }
    .hb-tts-slider { flex: 1; accent-color: #7c3aed; height: 6px; }
    .hb-tts-speed-val {
      font-size: 15px; font-weight: 700; color: #7c3aed; min-width: 52px;
      text-align: center; background: #f5f3ff; padding: 6px 10px; border-radius: 8px;
    }
    .hb-tts-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-tts-generate:hover:not(:disabled) { opacity: .92; }
    .hb-tts-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-tts-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-tts-progress > div { height: 100%; background: linear-gradient(90deg, #7c3aed, #4f46e5); width: 0%; transition: width .3s; }
    .hb-tts-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-tts-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-tts-player {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      border-radius: 14px; padding: 20px; text-align: center;
    }
    .hb-tts-player audio { width: 100%; margin-bottom: 12px; }
    .hb-tts-dl {
      display: inline-block; padding: 12px 28px; background: #16a34a; color: #fff;
      border-radius: 10px; font-size: 16px; font-weight: 700; text-decoration: none;
    }
    .hb-tts-dl:hover { background: #15803d; }
    .hb-tts-sample { font-size: 13px; color: #7c3aed; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0; }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-tts-wrap');
  root.appendChild(wrap);

  // --- header -------------------------------------------------------------------
  const header = el('div', 'hb-tts-header');
  const hTitle = el('h3', '', '🎙️ Neural TTS Studio');
  const hSub = el('p', '', 'Type it. Pick a voice. Hear it speak — 100% in your browser, nothing uploaded.');
  header.appendChild(hTitle);
  header.appendChild(hSub);
  wrap.appendChild(header);

  // --- text card ------------------------------------------------------------------
  const textCard = el('div', 'hb-tts-card');
  const textLabel = el('label', 'hb-tts-label', '✍️ Your text');
  textLabel.htmlFor = 'hb-ai-tts-text';
  textCard.appendChild(textLabel);
  const textArea = el('textarea', 'hb-tts-textarea') as HTMLTextAreaElement;
  textArea.id = 'hb-ai-tts-text';
  textArea.rows = 6;
  textArea.maxLength = TEXT_MAX_CHARS + 100;
  textArea.placeholder = 'Type or paste your script here… e.g. "Welcome to my channel! Today I\'ll show you…"';
  textCard.appendChild(textArea);
  const count = el('p', 'hb-tts-count', '0 / ' + TEXT_MAX_CHARS.toLocaleString('en-US'));
  count.id = 'hb-ai-tts-count';
  textCard.appendChild(count);
  const sampleBtn = el('button', 'hb-tts-sample', '✨ Try a sample script');
  sampleBtn.type = 'button';
  sampleBtn.addEventListener('click', () => {
    textArea.value = 'Hello and welcome! This is a sample of neural text to speech, running entirely in your browser. Pick a different voice to hear how each one sounds.';
    textArea.dispatchEvent(new Event('input'));
  });
  textCard.appendChild(sampleBtn);
  wrap.appendChild(textCard);

  // --- voice + speed ---------------------------------------------------------------
  const grid = el('div', 'hb-tts-grid');
  const voiceCard = el('div', 'hb-tts-card');
  const voiceLabel = el('label', 'hb-tts-label', '🎭 Voice');
  voiceLabel.htmlFor = 'hb-ai-tts-voice';
  voiceCard.appendChild(voiceLabel);
  const voiceSel = el('select', 'hb-tts-select') as HTMLSelectElement;
  voiceSel.id = 'hb-ai-tts-voice';
  for (const v of KOKORO_VOICES) {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.label;
    voiceSel.appendChild(opt);
  }
  voiceCard.appendChild(voiceSel);
  const voiceHint = el('p', 'hb-tts-voice-preview', '10 natural voices — US & UK, male & female.');
  voiceCard.appendChild(voiceHint);
  grid.appendChild(voiceCard);

  const speedCard = el('div', 'hb-tts-card');
  const speedLabel = el('label', 'hb-tts-label', '⚡ Speed');
  speedLabel.htmlFor = 'hb-ai-tts-speed';
  speedCard.appendChild(speedLabel);
  const sliderRow = el('div', 'hb-tts-slider-row');
  const speed = el('input', 'hb-tts-slider') as HTMLInputElement;
  speed.id = 'hb-ai-tts-speed';
  speed.type = 'range';
  speed.min = String(SPEED_MIN);
  speed.max = String(SPEED_MAX);
  speed.step = '0.05';
  speed.value = '1';
  const speedVal = el('span', 'hb-tts-speed-val', '1.00x');
  speed.addEventListener('input', () => {
    speedVal.textContent = Number(speed.value).toFixed(2) + 'x';
  });
  sliderRow.appendChild(speed);
  sliderRow.appendChild(speedVal);
  speedCard.appendChild(sliderRow);
  const speedHint = el('p', 'hb-tts-voice-preview', '0.5x = slow & dramatic, 2.0x = fast & energetic.');
  speedCard.appendChild(speedHint);
  grid.appendChild(speedCard);
  wrap.appendChild(grid);

  // --- generate ----------------------------------------------------------------------
  const genBtn = el('button', 'hb-tts-generate', '🔊 Generate speech');
  genBtn.type = 'button';
  wrap.appendChild(genBtn);

  const progress = el('div', 'hb-tts-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-tts-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-tts-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

const result = el('div', 'hb-tts-player');
  result.hidden = true;
  const resultTitle = el('p', 'hb-tts-label', '🎧 Your audio is ready!');
  resultTitle.style.textAlign = 'center';
  result.appendChild(resultTitle);
  const audioEl = document.createElement('audio');
  audioEl.controls = true;
  audioEl.style.width = '100%';
  result.appendChild(audioEl);
  const dlBtn = document.createElement('a');
  dlBtn.className = 'hb-tts-dl';
  dlBtn.textContent = '⬇ Download WAV';
  dlBtn.setAttribute('download', 'neural-tts-studio.wav');
  result.appendChild(dlBtn);
  const durationP = el('p', 'hb-tts-voice-preview');
  durationP.style.textAlign = 'center';
  result.appendChild(durationP);
  wrap.appendChild(result);

  let currentUrl: string | null = null;

  // --- helpers ------------------------------------------------------------
  function showError(msg: string): void {
    errBox.textContent = msg;
    errBox.hidden = false;
    result.hidden = true;
  }
  function setProgress(fraction: number, label: string): void {
    progress.hidden = false;
    const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    progressBar.style.width = pct + '%';
    progress.setAttribute('aria-valuenow', String(pct));
    status.textContent = label;
  }
  function hideProgress(): void {
    progress.hidden = true;
    progressBar.style.width = '0%';
  }

  textArea.addEventListener('input', () => {
    const n = textArea.value.trim().length;
    count.textContent = n.toLocaleString('en-US') + ' / ' + TEXT_MAX_CHARS.toLocaleString('en-US') + ' characters';
  });
  speed.addEventListener('input', () => {
    speedLabel.textContent = 'Speed: ' + Number(speed.value).toFixed(2).replace(/0$/, '') + 'x';
  });

  async function loadTts(): Promise<KokoroTtsInstance> {
    if (cachedTts) return cachedTts;
    const onProgress = (p: ModelLoadProgress): void => {
      setProgress(p.fraction < 0 ? 0 : p.fraction, p.status);
    };
    const tts = (await loadKokoroTTS({
      modelId: cfg.modelId,
      dtype: cfg.dtype ?? 'q8',
      onProgress,
    })) as unknown as KokoroTtsInstance;
    if (typeof tts.generate !== 'function') {
      throw new Error('The voice model loaded but its speech engine did not start. Please reload and try again.');
    }
    cachedTts = tts;
    return tts;
  }

  genBtn.addEventListener('click', () => {
    void run();
  });

  async function run(): Promise<void> {
    errBox.hidden = true;
    result.hidden = true;
    const v = validateInputs({
      text: textArea.value,
      voice: voiceSel.value,
      speed: Number(speed.value),
    });
    if (!v.ok) {
      showError(v.errors.join(' '));
      return;
    }
    const text = textArea.value.trim();
    const voice = voiceSel.value;
    const speedVal = Number(speed.value);

    genBtn.disabled = true;
    const origLabel = genBtn.textContent;
    genBtn.textContent = 'Generating…';

    try {
      const tts = await loadTts();
      const chunks = splitTextForTts(text);
      if (chunks.length === 0) throw new Error('Nothing to speak — enter some text first.');

      const pieces: Float32Array[] = [];
      let sampleRate = 24000;
      let total = 0;

      for (let i = 0; i < chunks.length; i++) {
        setProgress(
          i / chunks.length,
          'Synthesizing chunk ' + (i + 1) + ' of ' + chunks.length + '…',
        );
        const audio = await tts.generate(chunks[i], { voice, speed: speedVal });
        const { samples, sampleRate: sr } = await extractSamples(audio);
        if (i === 0) sampleRate = sr;
        pieces.push(samples);
        total += samples.length + (i < chunks.length - 1 ? Math.floor(sr * CHUNK_GAP_SEC) : 0);
      }

      const merged = new Float32Array(total);
      let offset = 0;
      for (let i = 0; i < pieces.length; i++) {
        merged.set(pieces[i], offset);
        offset += pieces[i].length;
        if (i < pieces.length - 1) {
          const gap = Math.floor(sampleRate * CHUNK_GAP_SEC);
          merged.fill(0, offset, offset + gap);
          offset += gap;
        }
      }

      setProgress(1, 'Encoding WAV…');
      const blob = encodeWav(merged, sampleRate);
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      currentUrl = URL.createObjectURL(blob);
      audioEl.src = currentUrl;
      dlBtn.setAttribute('href', currentUrl);
      const secs = merged.length / sampleRate;
      durationP.textContent =
        'Duration: ' + secs.toFixed(1) + 's · 24 kHz WAV · ' + (blob.size / 1024 / 1024).toFixed(1) + ' MB · generated on your device.';
      result.hidden = false;
      hideProgress();
      status.textContent = 'Done — speech generated locally.';
    } catch (err) {
      hideProgress();
      const msg = err instanceof Error ? err.message : String(err);
      if (/Could not load the voice model/i.test(msg)) {
        showError(msg);
      } else {
        showError(
          'Speech generation failed: ' + msg + ' Nothing was uploaded — try shorter text or reload the page.',
        );
      }
    } finally {
      genBtn.disabled = false;
      genBtn.textContent = origLabel;
    }
  }
}

