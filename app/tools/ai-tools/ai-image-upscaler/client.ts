/**
 * client.ts — AI Image Upscaler (tool-509), Lane A.
 *
 * Flow: image upload + 2x/4x select -> downscale input to <=1024 px ->
 * pipeline('image-to-image', verified Swin2SR model, fp32) -> RawImage ->
 * before/after preview + PNG download. All on-device. Honest errors only.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import type { ModelLoadProgress } from '../../../src/lib/ai/model-loader.ts';
import { loadPipeline } from '../../../src/lib/ai/model-loader.ts';
import {
  validateInputs,
  getScaleOption,
  getAllowedMimes,
  MAX_FILE_MB,
  MAX_DIMENSION_PX,
} from './logic.ts';

/** Minimal pipeline-callable shape. */
type Upscaler = (image: string) => Promise<unknown>;
/** Minimal RawImage shape returned by the image-to-image pipeline. */
interface RawImageOut {
  width: number;
  height: number;
  toCanvas: () => HTMLCanvasElement;
}

const upscalerCache: Record<string, Upscaler> = {};

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

/** Load an image from a blob URL, downscaling to MAX_DIMENSION_PX per side. */
function prepareInput(url: string): Promise<{ url: string; width: number; height: number; downscaled: boolean }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w <= MAX_DIMENSION_PX && h <= MAX_DIMENSION_PX) {
        resolve({ url, width: w, height: h, downscaled: false });
        return;
      }
      const scale = Math.min(MAX_DIMENSION_PX / w, MAX_DIMENSION_PX / h);
      const cw = Math.max(1, Math.round(w * scale));
      const ch = Math.max(1, Math.round(h * scale));
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Your browser could not create an image canvas.'));
        return;
      }
      ctx.drawImage(img, 0, 0, cw, ch);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not prepare the input image.'));
          return;
        }
        resolve({ url: URL.createObjectURL(blob), width: cw, height: ch, downscaled: true });
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('Could not read that image file.'));
    img.src = url;
  });
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = '';

  // --- upload -------------------------------------------------------------
  const fileLabel = el('label', 'hb-ai-label', 'Image file *');
  fileLabel.htmlFor = 'hb-ai-up-file';
  root.appendChild(fileLabel);

  const drop = el('div', 'hb-ai-field');
  drop.setAttribute('role', 'button');
  drop.tabIndex = 0;
  drop.setAttribute('aria-label', 'Upload an image: drag and drop, or press Enter to browse');
  drop.appendChild(el('p', 'hb-ai-status', 'Drag & drop an image here, or click to browse (JPG, PNG, WEBP — up to ' + MAX_FILE_MB + ' MB).'));
  const fileName = el('p', 'hb-ai-status');
  drop.appendChild(fileName);
  const fileInput = el('input', 'hb-ai-input') as HTMLInputElement;
  fileInput.type = 'file';
  fileInput.id = 'hb-ai-up-file';
  fileInput.accept = getAllowedMimes().join(',');
  fileInput.hidden = true;
  drop.appendChild(fileInput);
  root.appendChild(drop);

  const scaleLabel = el('label', 'hb-ai-label', 'Upscale factor');
  scaleLabel.htmlFor = 'hb-ai-up-scale';
  root.appendChild(scaleLabel);
  const scaleSel = el('select', 'hb-ai-select');
  scaleSel.id = 'hb-ai-up-scale';
  for (const id of ['2x', '4x']) {
    const opt = getScaleOption(id);
    const o = document.createElement('option');
    o.value = id;
    o.textContent = (opt?.label ?? id) + ' — ~' + (opt?.sizeMb ?? '?') + ' MB model, one-time download';
    scaleSel.appendChild(o);
  }
  scaleSel.value = '4x';
  root.appendChild(scaleSel);

  const actions = el('div', 'hb-ai-actions');
  const runBtn = el('button', 'hb-btn hb-btn--primary', 'Upscale image');
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
  const beforeImg = el('img', '');
  beforeImg.alt = 'Original image';
  const afterImg = el('img', '');
  afterImg.alt = 'Upscaled image';
  const pair = el('div', 'hb-ai-actions');
  pair.appendChild(beforeImg);
  pair.appendChild(afterImg);
  result.appendChild(pair);
  const dimsP = el('p', 'hb-ai-status');
  result.appendChild(dimsP);
  const dlActions = el('div', 'hb-ai-actions');
  const dlBtn = el('a', 'hb-btn hb-btn--ghost', 'Download upscaled PNG');
  dlBtn.setAttribute('download', 'upscaled.png');
  dlActions.appendChild(dlBtn);
  result.appendChild(dlActions);
  root.appendChild(result);

  // --- state --------------------------------------------------------------
  let file: File | null = null;
  let objectUrl: string | null = null;
  let resultUrl: string | null = null;
  let preparedUrl: string | null = null;

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
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(f);
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

  async function getUpscaler(scaleId: string): Promise<Upscaler> {
    if (upscalerCache[scaleId]) return upscalerCache[scaleId];
    const opt = getScaleOption(scaleId);
    if (!opt) throw new Error('Unknown upscale factor.');
    const pipe = (await loadPipeline('image-to-image', opt.modelId, {
      dtype: 'fp32',
      onProgress: (p: ModelLoadProgress) => setProgress(p.fraction < 0 ? 0 : p.fraction, p.status),
    })) as unknown as Upscaler;
    if (typeof pipe !== 'function') throw new Error('The AI model did not start correctly.');
    upscalerCache[scaleId] = pipe;
    return pipe;
  }

  runBtn.addEventListener('click', () => {
    void run();
  });

  async function run(): Promise<void> {
    errBox.hidden = true;
    result.hidden = true;
    if (!file || !objectUrl) {
      showError('Choose an image file first.');
      return;
    }
    const currentFile = file;
    const currentUrl = objectUrl;
    const scaleId = scaleSel.value;

    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = 'Upscaling…';
    try {
      setProgress(0.02, 'Preparing image…');
      if (preparedUrl && preparedUrl !== currentUrl) URL.revokeObjectURL(preparedUrl);
      const prepared = await prepareInput(currentUrl);
      preparedUrl = prepared.downscaled ? prepared.url : null;
      if (prepared.downscaled) {
        status.textContent =
          'Input was ' + prepared.width + '×' + prepared.height + ' after downscaling to the 1024 px limit.';
      }

      const v = validateInputs({
        file: {
          name: currentFile.name,
          sizeBytes: currentFile.size,
          mimeType: currentFile.type,
          width: prepared.width,
          height: prepared.height,
        },
        scale: scaleId,
      });
      if (!v.ok) {
        showError(v.errors.join(' '));
        return;
      }

      const upscaler = await getUpscaler(scaleId);
      setProgress(0.1, 'Upscaling with AI — this can take a few minutes on CPU-only devices…');
      const raw = (await upscaler(prepared.url)) as unknown as RawImageOut;
      if (!raw || typeof raw.toCanvas !== 'function' || !Number.isFinite(raw.width)) {
        throw new Error('The model returned an unusable result.');
      }
      setProgress(0.95, 'Encoding PNG…');
      const outCanvas = raw.toCanvas();
      const blob = await new Promise<Blob | null>((resolve) => outCanvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not encode the PNG result.');
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl = URL.createObjectURL(blob);
      beforeImg.src = prepared.url;
      afterImg.src = resultUrl;
      dimsP.textContent =
        'Input: ' + prepared.width + '×' + prepared.height + ' → Output: ' + raw.width + '×' + raw.height +
        ' (' + scaleId + ') · generated on your device.';
      dlBtn.setAttribute('href', resultUrl);
      dlBtn.setAttribute('download', 'upscaled-' + scaleId + '.png');
      result.hidden = false;
      hideProgress();
      status.textContent = 'Done — image upscaled on your device.';
    } catch (err) {
      hideProgress();
      const msg = err instanceof Error ? err.message : String(err);
      if (/Could not load the AI model/i.test(msg)) {
        showError(msg);
      } else {
        showError('Upscaling failed: ' + msg + ' Your image was never uploaded — try another image or reload.');
      }
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
    }
  }
}
