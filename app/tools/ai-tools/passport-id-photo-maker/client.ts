/**
 * client.ts — Passport/ID Photo Maker (tool-514), Lane A.
 *
 * Flow: portrait upload + size select (US/UK/Schengen/India) -> RMBG-1.4
 * foreground mask -> cutout composited on a pure-white canvas at the chosen
 * official dimensions (@300 dpi, 8% margin) -> preview + JPG download.
 * Dimensions only — no compliance claims. All on-device. Honest errors only.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import type { ModelLoadProgress } from '../../../src/lib/ai/model-loader.ts';
import { loadPipeline } from '../../../src/lib/ai/model-loader.ts';
import {
  validateInputs,
  getModelConfig,
  getPhotoSize,
  getAllowedMimes,
  PHOTO_SIZES,
  MAX_FILE_MB,
} from './logic.ts';

/** Minimal pipeline-callable shape. */
type Segmenter = (image: string) => Promise<unknown>;
interface MaskResult {
  label?: string;
  score?: number;
  mask?: { toCanvas: () => HTMLCanvasElement };
}

let segmenter: Segmenter | null = null;

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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read that image file.'));
    img.src = url;
  });
}

/** Apply the model's foreground mask as the alpha channel of the original. */
function cutout(img: HTMLImageElement, maskCanvas: HTMLCanvasElement): HTMLCanvasElement {
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
    rgb.data[i + 3] = mask.data[i];
  }
  ctx.putImageData(rgb, 0, 0);
  return canvas;
}

/** Place the cutout on a pure-white canvas at the target size (8% margin). */
function composeIdPhoto(cut: HTMLCanvasElement, width: number, height: number): HTMLCanvasElement {
  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const ctx = out.getContext('2d');
  if (!ctx) throw new Error('Your browser could not create an image canvas.');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  const maxW = width * 0.92;
  const maxH = height * 0.92;
  const scale = Math.min(maxW / cut.width, maxH / cut.height);
  const dw = Math.round(cut.width * scale);
  const dh = Math.round(cut.height * scale);
  ctx.drawImage(cut, Math.round((width - dw) / 2), Math.round((height - dh) / 2), dw, dh);
  return out;
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = '';
  const cfg = getModelConfig();

  // --- upload -------------------------------------------------------------
  const fileLabel = el('label', 'hb-ai-label', 'Portrait photo *');
  fileLabel.htmlFor = 'hb-ai-id-file';
  root.appendChild(fileLabel);

  const drop = el('div', 'hb-ai-field');
  drop.setAttribute('role', 'button');
  drop.tabIndex = 0;
  drop.setAttribute('aria-label', 'Upload a portrait photo: drag and drop, or press Enter to browse');
  drop.appendChild(el('p', 'hb-ai-status', 'Drag & drop a front-facing portrait here, or click to browse (JPG, PNG, WEBP — up to ' + MAX_FILE_MB + ' MB).'));
  const fileName = el('p', 'hb-ai-status');
  drop.appendChild(fileName);
  const fileInput = el('input', 'hb-ai-input') as HTMLInputElement;
  fileInput.type = 'file';
  fileInput.id = 'hb-ai-id-file';
  fileInput.accept = getAllowedMimes().join(',');
  fileInput.hidden = true;
  drop.appendChild(fileInput);
  root.appendChild(drop);

  const sizeLabel = el('label', 'hb-ai-label', 'Photo size');
  sizeLabel.htmlFor = 'hb-ai-id-size';
  root.appendChild(sizeLabel);
  const sizeSel = el('select', 'hb-ai-select');
  sizeSel.id = 'hb-ai-id-size';
  for (const s of PHOTO_SIZES) {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.label + ' — ' + s.width + '×' + s.height + ' px';
    sizeSel.appendChild(o);
  }
  root.appendChild(sizeSel);
  root.appendChild(el('p', 'hb-ai-status', 'Dimensions only — check your country\u2019s current official photo requirements before submitting.'));

  const actions = el('div', 'hb-ai-actions');
  const runBtn = el('button', 'hb-btn hb-btn--primary', 'Make ID photo');
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
  const outImg = el('img', '');
  outImg.alt = 'ID photo on a pure white background';
  result.appendChild(outImg);
  const dlActions = el('div', 'hb-ai-actions');
  const dlBtn = el('a', 'hb-btn hb-btn--ghost', 'Download JPG');
  dlBtn.setAttribute('download', 'id-photo.jpg');
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
    pickFile(e.dataTransfer?.files?.[0] ?? null);
  });
  fileInput.addEventListener('change', () => pickFile(fileInput.files?.[0] ?? null));

  async function getSegmenter(): Promise<Segmenter> {
    if (segmenter) return segmenter;
    const pipe = (await loadPipeline('image-segmentation', cfg.modelId, {
      dtype: 'q8',
      onProgress: (p: ModelLoadProgress) => setProgress(p.fraction < 0 ? 0 : p.fraction, p.status),
    })) as unknown as Segmenter;
    if (typeof pipe !== 'function') throw new Error('The AI model did not start correctly.');
    segmenter = pipe;
    return pipe;
  }

  runBtn.addEventListener('click', () => {
    void run();
  });

  async function run(): Promise<void> {
    errBox.hidden = true;
    result.hidden = true;
    if (!file || !objectUrl) {
      showError('Choose a portrait photo first.');
      return;
    }
    const currentFile = file;
    const currentUrl = objectUrl;
    const size = getPhotoSize(sizeSel.value);
    if (!size) {
      showError('Pick a photo size (US, UK/Schengen or India).');
      return;
    }

    let img: HTMLImageElement;
    try {
      img = await loadImage(currentUrl);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not read that image file.');
      return;
    }

    const v = validateInputs({
      file: {
        name: currentFile.name,
        sizeBytes: currentFile.size,
        mimeType: currentFile.type,
        width: img.naturalWidth,
        height: img.naturalHeight,
      },
      size: size.id,
    });
    if (!v.ok) {
      showError(v.errors.join(' '));
      return;
    }

    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = 'Processing…';
    try {
      const seg = await getSegmenter();
      setProgress(0.05, 'Cutting out your portrait…');
      const raw = (await seg(currentUrl)) as unknown;
      const entries = (Array.isArray(raw) ? raw : [raw]) as MaskResult[];
      const withMask = entries.find((e) => e && typeof e === 'object' && e.mask && typeof e.mask.toCanvas === 'function');
      if (!withMask || !withMask.mask) {
        throw new Error('The model returned no foreground mask for this photo.');
      }
      setProgress(0.85, 'Compositing at ' + size.width + '×' + size.height + '…');
      const cut = cutout(img, withMask.mask.toCanvas());
      const out = composeIdPhoto(cut, size.width, size.height);
      const blob = await new Promise<Blob | null>((resolve) => out.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) throw new Error('Could not encode the result.');
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl = URL.createObjectURL(blob);
      outImg.src = resultUrl;
      dlBtn.setAttribute('href', resultUrl);
      dlBtn.setAttribute('download', 'id-photo-' + size.id + '.jpg');
      result.hidden = false;
      hideProgress();
      status.textContent =
        'Done — ' + size.width + '×' + size.height + ' px white-background photo, made on your device. ' +
        'Check your country\u2019s official requirements before submitting.';
    } catch (err) {
      hideProgress();
      const msg = err instanceof Error ? err.message : String(err);
      if (/Could not load the AI model/i.test(msg)) {
        showError(msg);
      } else {
        showError('Processing failed: ' + msg + ' Your photo was never uploaded — try another photo or reload.');
      }
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
    }
  }
}
