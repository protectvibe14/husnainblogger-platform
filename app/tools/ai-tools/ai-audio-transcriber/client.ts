/**
 * client.ts — AI Audio Transcriber (tool-510), Lane A.
 *
 * Flow: audio upload + tiny/base select -> decode to 16 kHz mono in-browser ->
 * pipeline('automatic-speech-recognition', verified Whisper model, 30 s chunks,
 * 5 s stride) -> transcript in editable textarea + copy + .txt download.
 * All on-device. Honest errors only.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import type { ModelLoadProgress } from '../../../src/lib/ai/model-loader.ts';
import { loadPipeline } from '../../../src/lib/ai/model-loader.ts';
import {
  validateInputs,
  getModelOption,
  getAllowedMimes,
  MAX_FILE_MB,
} from './logic.ts';

/** Minimal ASR pipeline-callable shape. */
type AsrPipe = (
  audio: Float32Array,
  opts: { chunk_length_s: number; stride_length_s: number },
) => Promise<{ text: string }>;

const pipeCache: Record<string, AsrPipe> = {};

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

/** Decode an audio file and resample to 16 kHz mono Float32 — no network. */
async function decodeTo16kHz(file: File): Promise<Float32Array> {
  const buffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext;
  const actx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await actx.decodeAudioData(buffer);
  } catch {
    throw new Error('Could not decode that audio file. Try MP3, WAV, M4A, OGG, WEBM or FLAC.');
  } finally {
    void actx.close();
  }
  if (!Number.isFinite(decoded.duration) || decoded.duration <= 0) {
    throw new Error('That audio file has no playable content.');
  }
  const targetRate = 16000;
  const length = Math.max(1, Math.ceil(decoded.duration * targetRate));
  const offline = new OfflineAudioContext(1, length, targetRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start(0);
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = '';

  // --- upload -------------------------------------------------------------
  const fileLabel = el('label', 'hb-ai-label', 'Audio file *');
  fileLabel.htmlFor = 'hb-ai-tr-file';
  root.appendChild(fileLabel);

  const drop = el('div', 'hb-ai-field');
  drop.setAttribute('role', 'button');
  drop.tabIndex = 0;
  drop.setAttribute('aria-label', 'Upload an audio file: drag and drop, or press Enter to browse');
  drop.appendChild(el('p', 'hb-ai-status', 'Drag & drop an audio file here, or click to browse (MP3, WAV, M4A, OGG, WEBM, FLAC — up to ' + MAX_FILE_MB + ' MB).'));
  const fileName = el('p', 'hb-ai-status');
  drop.appendChild(fileName);
  const fileInput = el('input', 'hb-ai-input') as HTMLInputElement;
  fileInput.type = 'file';
  fileInput.id = 'hb-ai-tr-file';
  fileInput.accept = getAllowedMimes().join(',');
  fileInput.hidden = true;
  drop.appendChild(fileInput);
  root.appendChild(drop);

  const modelLabel = el('label', 'hb-ai-label', 'Model');
  modelLabel.htmlFor = 'hb-ai-tr-model';
  root.appendChild(modelLabel);
  const modelSel = el('select', 'hb-ai-select');
  modelSel.id = 'hb-ai-tr-model';
  for (const id of ['tiny', 'base']) {
    const opt = getModelOption(id);
    const o = document.createElement('option');
    o.value = id;
    o.textContent = opt?.label ?? id;
    modelSel.appendChild(o);
  }
  root.appendChild(modelSel);

  const actions = el('div', 'hb-ai-actions');
  const runBtn = el('button', 'hb-btn hb-btn--primary', 'Transcribe');
  runBtn.type = 'button';
  runBtn.disabled = true;
  actions.appendChild(runBtn);
  root.appendChild(actions);

  const progress = el('div', 'hb-ai-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
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
  const transcriptLabel = el('label', 'hb-ai-label', 'Transcript (editable)');
  transcriptLabel.htmlFor = 'hb-ai-tr-output';
  result.appendChild(transcriptLabel);
  const transcriptBox = el('textarea', 'hb-ai-textarea') as HTMLTextAreaElement;
  transcriptBox.id = 'hb-ai-tr-output';
  transcriptBox.rows = 12;
  transcriptBox.placeholder = 'Your transcript appears here.';
  result.appendChild(transcriptBox);
  const outActions = el('div', 'hb-ai-actions');
  const copyBtn = el('button', 'hb-btn hb-btn--ghost', 'Copy text');
  copyBtn.type = 'button';
  const dlBtn = el('a', 'hb-btn hb-btn--ghost', 'Download .txt');
  dlBtn.setAttribute('download', 'transcript.txt');
  outActions.appendChild(copyBtn);
  outActions.appendChild(dlBtn);
  result.appendChild(outActions);
  root.appendChild(result);

  // --- state --------------------------------------------------------------
  let file: File | null = null;
  let resultUrl: string | null = null;

  function showError(msg: string): void {
    errBox.textContent = msg;
    errBox.hidden = false;
    result.hidden = true;
  }
  function setProgress(fraction: number, label: string): void {
    progress.hidden = false;
    progressBar.style.width = Math.max(0, Math.min(100, Math.round(fraction * 100))) + '%';
    status.textContent = label;
  }
  function hideProgress(): void {
    progress.hidden = true;
    progressBar.style.width = '0%';
  }

  function pickFile(f: File | undefined | null): void {
    if (!f) return;
    file = f;
    fileName.textContent = 'Selected: ' + f.name;
    runBtn.disabled = false;
    errBox.hidden = true;
    result.hidden = true;
  }

  drop.addEventListener('click', (e) => {
    if (e.target !== fileInput) fileInput.click();
  });
  drop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener('dragover', (e) => e.preventDefault());
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    pickFile(e.dataTransfer?.files?.[0] ?? null);
  });
  fileInput.addEventListener('change', () => pickFile(fileInput.files?.[0] ?? null));

  async function getPipe(modelId: string): Promise<AsrPipe> {
    if (pipeCache[modelId]) return pipeCache[modelId];
    const opt = getModelOption(modelSel.value);
    const model = opt?.modelId ?? 'Xenova/whisper-tiny';
    const pipe = (await loadPipeline('automatic-speech-recognition', model, {
      onProgress: (p: ModelLoadProgress) => setProgress(p.fraction < 0 ? 0 : p.fraction, p.status),
    })) as unknown as AsrPipe;
    if (typeof pipe !== 'function') throw new Error('The AI model did not start correctly.');
    pipeCache[modelId] = pipe;
    return pipe;
  }

  runBtn.addEventListener('click', () => {
    void run();
  });

  copyBtn.addEventListener('click', () => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(transcriptBox.value);
        status.textContent = 'Transcript copied to clipboard.';
      } catch {
        status.textContent = 'Copy failed — select the text manually and press Ctrl/Cmd+C.';
      }
    })();
  });

  async function run(): Promise<void> {
    errBox.hidden = true;
    result.hidden = true;
    if (!file) {
      showError('Choose an audio file first.');
      return;
    }
    const currentFile = file;

    const v = validateInputs({
      file: { name: currentFile.name, sizeBytes: currentFile.size, mimeType: currentFile.type },
      model: modelSel.value,
    });
    if (!v.ok) {
      showError(v.errors.join(' '));
      return;
    }

    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = 'Transcribing…';
    try {
      setProgress(0.02, 'Decoding audio…');
      const audio = await decodeTo16kHz(currentFile);
      const pipe = await getPipe(modelSel.value);
      setProgress(0.15, 'Transcribing with AI — long audio can take a few minutes on CPU…');
      const out = await pipe(audio, { chunk_length_s: 30, stride_length_s: 5 });
      const text = typeof out?.text === 'string' ? out.text.trim() : '';
      if (!text) {
        throw new Error('The model returned no text. The audio may contain no clear speech.');
      }
      setProgress(0.98, 'Done.');
      transcriptBox.value = text;
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      dlBtn.setAttribute('href', resultUrl);
      result.hidden = false;
      hideProgress();
      status.textContent = 'Done — transcribed on your device.';
    } catch (err) {
      hideProgress();
      const msg = err instanceof Error ? err.message : String(err);
      if (/Could not load the AI model/i.test(msg)) {
        showError(msg);
      } else {
        showError('Transcription failed: ' + msg + ' Your audio was never uploaded — try another file or reload.');
      }
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
    }
  }
}
