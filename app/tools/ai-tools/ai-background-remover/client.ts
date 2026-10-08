/**
 * client.ts — AI Background Remover (tool-508), Lane A.
 *
 * Flow: image upload (drag-drop or browse) + quality select ->
 * pipeline('image-segmentation', 'briaai/RMBG-1.4') -> foreground mask ->
 * canvas composite (original RGB + mask alpha) -> before/after preview +
 * transparent PNG download. All on-device. Honest errors only.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import type { ModelLoadProgress } from '../../../src/lib/ai/model-loader.ts';
import { loadPipeline } from '../../../src/lib/ai/model-loader.ts';
import {
  validateInputs,
  getModelConfig,
  getAllowedMimes,
  MAX_FILE_MB,
} from './logic.ts';

/** Minimal pipeline-callable shape. */
type Segmenter = (image: string) => Promise<unknown>;
/** Minimal mask canvas shape returned by the image-segmentation pipeline. */
interface MaskResult {
  label?: string;
  score?: number;
  mask?: { toCanvas: () => HTMLCanvasElement };
}

const QUALITY_DTYPE: Record<string, string> = { balanced: 'q8', best: 'fp32' };
const segmenterCache: Record<string, Segmenter> = {};

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

function loadImageDims(url: string): Promise<{ width: number; height: number; img: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, img });
    img.onerror = () => reject(new Error('Could not read that image file.'));
    img.src = url;
  });
}

/**
 * Composite the original image with the model's foreground mask.
 * Mask luminance becomes the alpha channel at the original resolution.
 */
function compositeTransparent(
  img: HTMLImageElement,
  maskCanvas: HTMLCanvasElement,
): HTMLCanvasElement {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create an image canvas.');
  ctx.drawImage(img, 0, 0);

  const maskScaled = document.createElement('canvas');
  maskScaled.width = w;
  maskScaled.height = h;
  const mctx = maskScaled.getContext('2d');
  if (!mctx) throw new Error('Your browser could not create an image canvas.');
  mctx.drawImage(maskCanvas, 0, 0, w, h);

  const rgb = ctx.getImageData(0, 0, w, h);
  const mask = mctx.getImageData(0, 0, w, h);
  for (let i = 0; i < rgb.data.length; i += 4) {
    rgb.data[i + 3] = mask.data[i]; // red channel = foreground strength
  }
  ctx.putImageData(rgb, 0, 0);
  return canvas;
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = '';
  const cfg = getModelConfig();

  // --- upload -------------------------------------------------------------
  const fileLabel = el('label', 'hb-ai-label', 'Image file *');
  fileLabel.htmlFor = 'hb-ai-bg-file';
  root.appendChild(fileLabel);

  const drop = el('div', 'hb-ai-field');
  drop.setAttribute('role', 'button');
  drop.tabIndex = 0;
  drop.setAttribute('aria-label', 'Upload an image: drag and drop, or press Enter to browse');
  const dropHint = el('p', 'hb-ai-status', 'Drag & drop an image here, or click to browse (JPG, PNG, WEBP, GIF — up to ' + MAX_FILE_MB + ' MB).');
  drop.appendChild(dropHint);
  const fileName = el('p', 'hb-ai-status');
  drop.appendChild(fileName);
  const fileInput = el('input', 'hb-ai-input') as HTMLInputElement;
  fileInput.type = 'file';
  fileInput.id = 'hb-ai-bg-file';
  fileInput.accept = getAllowedMimes().join(',');
  fileInput.hidden = true;
  drop.appendChild(fileInput);
  root.appendChild(drop);

  const qualityLabel = el('label', 'hb-ai-label', 'Quality');
  qualityLabel.htmlFor = 'hb-ai-bg-quality';
  root.appendChild(qualityLabel);
  const qualitySel = el('select', 'hb-ai-select');
  qualitySel.id = 'hb-ai-bg-quality';
  const qBalanced = document.createElement('option');
  qBalanced.value = 'balanced';
  qBalanced.textContent = 'Balanced — ~44 MB download, fast';
  const qBest = document.createElement('option');
  qBest.value = 'best';
  qBest.textContent = 'Best — ~176 MB download, cleaner edges';
  qualitySel.appendChild(qBalanced);
  qualitySel.appendChild(qBest);
  root.appendChild(qualitySel);

  const actions = el('div', 'hb-ai-actions');
  const runBtn = el('button', 'hb-btn hb-btn--primary', 'Remove background');
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
  afterImg.alt = 'Image with background removed';
  const pair = el('div', 'hb-ai-actions');
  pair.appendChild(beforeImg);
  pair.appendChild(afterImg);
  result.appendChild(pair);
  const dlActions = el('div', 'hb-ai-actions');
  const dlBtn = el('a', 'hb-btn hb-btn--ghost', 'Download transparent PNG');
  dlBtn.setAttribute('download', 'background-removed.png');
  dlActions.appendChild(dlBtn);
  result.appendChild(dlActions);
  root.appendChild(result);

  // --- state --------------------------------------------------------------
  let file: File | null = null;
  let objectUrl: string | null = null;
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
    const f = e.dataTransfer?.files?.[0];
    pickFile(f ?? null);
  });
  fileInput.addEventListener('change', () => pickFile(fileInput.files?.[0] ?? null));

  async function getSegmenter(quality: string): Promise<Segmenter> {
    const key = quality;
    if (segmenterCache[key]) return segmenterCache[key];
    const dtype = QUALITY_DTYPE[quality] ?? 'q8';
    const pipe = (await loadPipeline('image-segmentation', cfg.modelId, {
      dtype,
      onProgress: (p: ModelLoadProgress) => setProgress(p.fraction < 0 ? 0 : p.fraction, p.status),
    })) as unknown as Segmenter;
    if (typeof pipe !== 'function') throw new Error('The AI model did not start correctly.');
    segmenterCache[key] = pipe;
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

    let dims: { width: number; height: number; img: HTMLImageElement };
    try {
      dims = await loadImageDims(currentUrl);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not read that image file.');
      return;
    }

    const v = validateInputs({
      file: {
        name: currentFile.name,
        sizeBytes: currentFile.size,
        mimeType: currentFile.type,
        width: dims.width,
        height: dims.height,
      },
    });
    if (!v.ok) {
      showError(v.errors.join(' '));
      return;
    }

    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = 'Removing…';
    try {
      const segmenter = await getSegmenter(qualitySel.value);
      setProgress(0.05, 'Analyzing image…');
      const raw = (await segmenter(currentUrl)) as unknown;
      const entries = (Array.isArray(raw) ? raw : [raw]) as MaskResult[];
      const withMask = entries.find((e) => e && typeof e === 'object' && e.mask && typeof e.mask.toCanvas === 'function');
      if (!withMask || !withMask.mask) {
        throw new Error('The model returned no foreground mask for this image.');
      }
      setProgress(0.85, 'Compositing transparent PNG…');
      const out = compositeTransparent(dims.img, withMask.mask.toCanvas());
      const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Could not encode the PNG result.');
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl = URL.createObjectURL(blob);
      beforeImg.src = currentUrl;
      afterImg.src = resultUrl;
      dlBtn.setAttribute('href', resultUrl);
      result.hidden = false;
      hideProgress();
      status.textContent = 'Done — background removed on your device.';
    } catch (err) {
      hideProgress();
      const msg = err instanceof Error ? err.message : String(err);
      if (/Could not load the AI model/i.test(msg)) {
        showError(msg);
      } else {
        showError('Background removal failed: ' + msg + ' Your image was never uploaded — try another image or reload.');
      }
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
    }
  }
}
