/**
 * client.ts — AI Audio Transcriber (tool-510), Lane A (redesigned).
 *
 * Flow: gradient header -> drop-zone card + model card -> big gradient
 * Transcribe button -> progress + status -> transcript card (editable
 * textarea + copy + .txt download). Pipeline: audio upload -> decode to
 * 16 kHz mono in-browser -> pipeline('automatic-speech-recognition',
 * verified Whisper model, 30 s chunks, 5 s stride). All on-device.
 * Honest errors only. User data rendered via textContent only.
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

  // --- styles ---------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-tr-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-tr-header {
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-tr-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-tr-header p { margin: 0; font-size: 14px; opacity: .9; }
    .hb-tr-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-tr-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-tr-drop {
      border: 2px dashed #9aa4b2; border-radius: 12px; padding: 32px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease;
      background: #f8fafc;
    }
    .hb-tr-drop:hover, .hb-tr-drop.hb-tr-dragover {
      border-color: #0ea5e9; background: #f0f9ff;
    }
    .hb-tr-drop-icon { font-size: 38px; margin-bottom: 8px; }
    .hb-tr-drop-title { font-size: 16px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-tr-drop-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-tr-browse {
      display: inline-block; margin-top: 12px; padding: 10px 22px;
      background: #0ea5e9; color: #fff; border: none; border-radius: 8px;
      font-size: 15px; font-weight: 600; cursor: pointer;
    }
    .hb-tr-browse:hover { background: #0284c7; }
    .hb-tr-filename {
      font-size: 14px; font-weight: 600; color: #0369a1; margin: 10px 0 0;
      word-break: break-all;
    }
    .hb-tr-select {
      width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
      border: 2px solid #e2e8f0; border-radius: 10px; background: #fff;
      box-sizing: border-box;
    }
    .hb-tr-select:focus { outline: none; border-color: #0ea5e9; }
    .hb-tr-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-tr-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-tr-generate:hover:not(:disabled) { opacity: .92; }
    .hb-tr-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-tr-progress {
      height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;
    }
    .hb-tr-progress > div {
      height: 100%; background: linear-gradient(90deg, #0ea5e9, #6366f1);
      width: 0%; transition: width .3s;
    }
    .hb-tr-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-tr-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-tr-result-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #eef2ff 100%);
      border-radius: 14px; padding: 20px;
    }
    .hb-tr-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-tr-textarea {
      width: 100%; min-height: 200px; padding: 14px; font-size: 15px; line-height: 1.6;
      border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical;
      font-family: inherit; box-sizing: border-box; background: #fff;
    }
    .hb-tr-textarea:focus { outline: none; border-color: #0ea5e9; }
    .hb-tr-actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
    .hb-tr-copy {
      padding: 12px 24px; background: #16a34a; color: #fff; border: none;
      border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer;
    }
    .hb-tr-copy:hover { background: #15803d; }
    .hb-tr-dl {
      display: inline-block; padding: 12px 24px; background: #0ea5e9; color: #fff;
      border-radius: 10px; font-size: 15px; font-weight: 700; text-decoration: none;
    }
    .hb-tr-dl:hover { background: #0284c7; }
    @media (max-width: 640px) {
      .hb-tr-header { padding: 18px; }
      .hb-tr-header h3 { font-size: 18px; }
      .hb-tr-card, .hb-tr-result-card { padding: 16px; }
      .hb-tr-drop { padding: 24px 14px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-tr-wrap');
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el('div', 'hb-tr-header');
  header.appendChild(el('h3', '', '🎙️ AI Audio Transcriber'));
  header.appendChild(el('p', '', 'Upload your audio — get an editable transcript in minutes. Whisper runs 100% on your device; your audio is never uploaded.'));
  wrap.appendChild(header);

  // --- upload card ----------------------------------------------------------
  const uploadCard = el('div', 'hb-tr-card');
  uploadCard.appendChild(el('label', 'hb-tr-label', '🎵 Audio file *'));
  const drop = el('div', 'hb-tr-drop');
  drop.setAttribute('role', 'button');
  drop.tabIndex = 0;
  drop.setAttribute('aria-label', 'Upload an audio file: drag and drop, or press Enter to browse');
  const dropIcon = el('div', 'hb-tr-drop-icon', '🎧');
  const dropTitle = el('p', 'hb-tr-drop-title', 'Drag & drop your audio here');
  const dropSub = el('p', 'hb-tr-drop-sub', 'or click to browse — MP3, WAV, M4A, OGG, WEBM, FLAC up to ' + MAX_FILE_MB + ' MB');
  const browseBtn = el('button', 'hb-tr-browse', 'Choose audio file');
  browseBtn.type = 'button';
  drop.appendChild(dropIcon);
  drop.appendChild(dropTitle);
  drop.appendChild(dropSub);
  drop.appendChild(browseBtn);
  const fileName = el('p', 'hb-tr-filename');
  drop.appendChild(fileName);
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = getAllowedMimes().join(',');
  fileInput.hidden = true;
  drop.appendChild(fileInput);
  uploadCard.appendChild(drop);
  wrap.appendChild(uploadCard);

  // --- model card -----------------------------------------------------------
  const modelCard = el('div', 'hb-tr-card');
  const modelLabel = el('label', 'hb-tr-label', '🤖 Transcription model');
  modelLabel.htmlFor = 'hb-ai-tr-model';
  modelCard.appendChild(modelLabel);
  const modelSel = el('select', 'hb-tr-select');
  modelSel.id = 'hb-ai-tr-model';
  for (const id of ['tiny', 'base']) {
    const opt = getModelOption(id);
    const o = document.createElement('option');
    o.value = id;
    o.textContent = opt?.label ?? id;
    modelSel.appendChild(o);
  }
  modelCard.appendChild(modelSel);
  modelCard.appendChild(el('p', 'hb-tr-hint', 'Tiny (~39 MB) is fast — good for clear voice memos. Base (~74 MB) is more accurate on longer recordings. The model downloads once, then is cached.'));
  wrap.appendChild(modelCard);

  // --- generate -------------------------------------------------------------
  const runBtn = el('button', 'hb-tr-generate', '✨ Transcribe audio');
  runBtn.type = 'button';
  runBtn.disabled = true;
  wrap.appendChild(runBtn);

  const progress = el('div', 'hb-tr-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-tr-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-tr-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result ---------------------------------------------------------------
  const result = el('div', 'hb-tr-result-card');
  result.hidden = true;
  result.appendChild(el('p', 'hb-tr-result-title', '📝 Transcript (editable)'));
  const transcriptBox = el('textarea', 'hb-tr-textarea') as HTMLTextAreaElement;
  transcriptBox.id = 'hb-ai-tr-output';
  transcriptBox.rows = 12;
  transcriptBox.placeholder = 'Your transcript appears here.';
  result.appendChild(transcriptBox);
  const outActions = el('div', 'hb-tr-actions');
  const copyBtn = el('button', 'hb-tr-copy', '📋 Copy transcript');
  copyBtn.type = 'button';
  const dlBtn = document.createElement('a');
  dlBtn.className = 'hb-tr-dl';
  dlBtn.textContent = '⬇ Download .txt';
  dlBtn.setAttribute('download', 'transcript.txt');
  outActions.appendChild(copyBtn);
  outActions.appendChild(dlBtn);
  result.appendChild(outActions);
  wrap.appendChild(result);

  // --- state ------------------------------------------------------------------
  let file: File | null = null;
  let resultUrl: string | null = null;

  function showError(msg: string): void {
    hideProgress();
    status.textContent = '';
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
    status.textContent = 'Audio ready — click "Transcribe audio".';
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
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('hb-tr-dragover');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('hb-tr-dragover'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('hb-tr-dragover');
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
        copyBtn.textContent = 'Copied ✓';
        window.setTimeout(() => {
          copyBtn.textContent = '📋 Copy transcript';
        }, 1500);
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
      dlBtn.setAttribute(
        'download',
        currentFile.name.replace(/\.[^.]+$/, '') + '-transcript.txt',
      );
      result.hidden = false;
      hideProgress();
      status.textContent = 'Done — transcribed on your device. Edit freely, then copy or download.';
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
