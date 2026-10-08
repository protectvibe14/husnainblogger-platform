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

  // --- form ---------------------------------------------------------------
  const textLabel = el('label', 'hb-ai-label', 'Text to speak *');
  textLabel.htmlFor = 'hb-ai-tts-text';
  root.appendChild(textLabel);
  const textArea = el('textarea', 'hb-ai-textarea');
  textArea.id = 'hb-ai-tts-text';
  textArea.rows = 6;
  textArea.maxLength = TEXT_MAX_CHARS + 100;
  textArea.placeholder = 'Type or paste up to 5,000 characters…';
  textArea.setAttribute('aria-describedby', 'hb-ai-tts-count');
  root.appendChild(textArea);
  const count = el('p', 'hb-ai-status', '0 / ' + TEXT_MAX_CHARS.toLocaleString('en-US') + ' characters');
  count.id = 'hb-ai-tts-count';
  root.appendChild(count);

  const voiceLabel = el('label', 'hb-ai-label', 'Voice *');
  voiceLabel.htmlFor = 'hb-ai-tts-voice';
  root.appendChild(voiceLabel);
  const voiceSel = el('select', 'hb-ai-select');
  voiceSel.id = 'hb-ai-tts-voice';
  for (const v of KOKORO_VOICES) {
    const opt = document.createElement('option');
    opt.value = v.id;
    opt.textContent = v.label;
    voiceSel.appendChild(opt);
  }
  root.appendChild(voiceSel);

  const speedLabel = el('label', 'hb-ai-label', 'Speed: 1.0x');
  speedLabel.htmlFor = 'hb-ai-tts-speed';
  root.appendChild(speedLabel);
  const speed = el('input', 'hb-ai-input') as HTMLInputElement;
  speed.id = 'hb-ai-tts-speed';
  speed.type = 'range';
  speed.min = String(SPEED_MIN);
  speed.max = String(SPEED_MAX);
  speed.step = '0.05';
  speed.value = '1';
  root.appendChild(speed);

  const actions = el('div', 'hb-ai-actions');
  const genBtn = el('button', 'hb-btn hb-btn--primary', 'Generate speech');
  genBtn.type = 'button';
  actions.appendChild(genBtn);
  root.appendChild(actions);

  const progress = el('div', 'hb-ai-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  progress.setAttribute('aria-valuemin', '0');
  progress.setAttribute('aria-valuemax', '100');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  root.appendChild(progress);

  const status = el('p', 'hb-ai-status');
  root.appendChild(status);

  const errBox = el('div', 'hb-ai-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  root.appendChild(errBox);

  const result = el('div', 'hb-ai-result');
  result.hidden = true;
  const audioEl = el('audio', '');
  audioEl.controls = true;
  result.appendChild(audioEl);
  const resultActions = el('div', 'hb-ai-actions');
  const dlBtn = el('a', 'hb-btn hb-btn--ghost', 'Download WAV');
  dlBtn.setAttribute('download', 'neural-tts-studio.wav');
  resultActions.appendChild(dlBtn);
  result.appendChild(resultActions);
  const durationP = el('p', 'hb-ai-status');
  result.appendChild(durationP);
  root.appendChild(result);

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

