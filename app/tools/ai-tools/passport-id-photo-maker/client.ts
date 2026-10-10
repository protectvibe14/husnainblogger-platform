/**
 * client.ts — Passport/ID Photo Maker (redesigned, tool-514), Lane A.
 *
 * Flow: drag-drop portrait upload with preview + size select ->
 * RMBG-1.4 foreground mask -> cutout composited on a pure-white canvas
 * at the chosen official dimensions (@300 dpi, 8% margin) -> preview +
 * JPG download. Dimensions only — no compliance claims. All on-device.
 * Honest errors only.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import type { ModelLoadProgress } from '../../../src/lib/ai/model-loader.ts';
import { loadPipeline } from '../../../src/lib/ai/model-loader.ts';
import {
  validateInputs,
  getModelConfig,
  getPhotoSize,
  getAllowedMimes,
  getDisclosures,
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

  const style = document.createElement('style');
  style.textContent = `
    .hb-idp-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-idp-header {
      background: linear-gradient(135deg, #4f46e5 0%, #1e40af 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-idp-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-idp-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-idp-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-idp-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .hb-idp-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease; background: #f8fafc;
    }
    .hb-idp-drop:hover, .hb-idp-drop.hb-idp-dragover { border-color: #4f46e5; background: #eef2ff; }
    .hb-idp-drop.hb-idp-has-image { padding: 12px; }
    .hb-idp-icon { font-size: 40px; margin-bottom: 8px; }
    .hb-idp-title { font-size: 17px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-idp-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-idp-preview { max-width: 100%; max-height: 240px; border-radius: 10px; margin: 0 auto; display: block; }
    .hb-idp-filename { font-size: 13px; color: #475569; margin-top: 8px; word-break: break-all; }
    .hb-idp-change { font-size: 13px; color: #4f46e5; background: none; border: none; cursor: pointer; text-decoration: underline; margin-top: 4px; }
    .hb-idp-select {
      width: 100%; padding: 12px; font-size: 15px; border: 2px solid #e2e8f0;
      border-radius: 10px; background: #fff; box-sizing: border-box; color: #1e293b;
    }
    .hb-idp-select:focus { outline: none; border-color: #4f46e5; }
    .hb-idp-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-idp-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #4f46e5 0%, #1e40af 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-idp-generate:hover:not(:disabled) { opacity: .92; }
    .hb-idp-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-idp-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-idp-progress > div { height: 100%; background: linear-gradient(90deg, #4f46e5, #1e40af); width: 0%; transition: width .3s; }
    .hb-idp-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-idp-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-idp-result {
      background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
      border-radius: 14px; padding: 20px; text-align: center; border: 1px solid #c7d2fe;
    }
    .hb-idp-result img {
      max-width: 100%; max-height: 420px; border-radius: 10px;
      border: 1px solid #e2e8f0; background: #fff; display: block; margin: 0 auto 14px;
    }
    .hb-idp-dl {
      display: inline-block; padding: 12px 28px; background: #16a34a; color: #fff;
      border-radius: 10px; font-size: 16px; font-weight: 700; text-decoration: none;
    }
    .hb-idp-dl:hover { background: #15803d; }
    .hb-idp-note { font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.6; }
    @media (max-width: 640px) { .hb-idp-header { padding: 18px; } }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-idp-wrap');
  root.appendChild(wrap);

  // --- header --------------------------------------------------------------------
  const header = el('div', 'hb-idp-header');
  header.appendChild(el('h3', '', '🪪 Passport / ID Photo Maker'));
  header.appendChild(el('p', '', 'Cut your portrait out with AI and drop it on a pure-white background at official dimensions — all on your device.'));
  wrap.appendChild(header);

  // --- upload ----------------------------------------------------------------------
  const upCard = el('div', 'hb-idp-card');
  upCard.appendChild(el('label', 'hb-idp-label', '📷 Your portrait photo'));
  const drop = el('div', 'hb-idp-drop');
  drop.setAttribute('role', 'button');
  drop.tabIndex = 0;
  drop.setAttribute('aria-label', 'Upload a portrait photo: drag and drop, or press Enter to browse');
  const icon = el('div', 'hb-idp-icon', '🧑');
  const title = el('p', 'hb-idp-title', 'Drop a front-facing portrait here');
  const sub = el('p', 'hb-idp-sub', 'or click to browse — JPG, PNG, WEBP up to ' + MAX_FILE_MB + ' MB');
  drop.append(icon, title, sub);
  upCard.appendChild(drop);
  const fileInput = el('input', '') as HTMLInputElement;
  fileInput.type = 'file';
  fileInput.accept = getAllowedMimes().join(',');
  fileInput.hidden = true;
  upCard.appendChild(fileInput);
  upCard.appendChild(el('p', 'hb-idp-hint', 'Tip: plain background, face centered, good lighting. The AI cuts out the background for you.'));
  wrap.appendChild(upCard);

  // --- size --------------------------------------------------------------------------
  const sizeCard = el('div', 'hb-idp-card');
  const sizeLabel = el('label', 'hb-idp-label', '📐 Photo size');
  sizeLabel.htmlFor = 'hb-ai-id-size';
  sizeCard.appendChild(sizeLabel);
  const sizeSel = el('select', 'hb-idp-select');
  sizeSel.id = 'hb-ai-id-size';
  for (const s of PHOTO_SIZES) {
    const o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.label + ' — ' + s.width + '×' + s.height + ' px';
    sizeSel.appendChild(o);
  }
  sizeCard.appendChild(sizeSel);
  sizeCard.appendChild(el('p', 'hb-idp-hint', 'Dimensions only — check your country’s current official photo requirements before submitting.'));
  wrap.appendChild(sizeCard);

  // --- action ---------------------------------------------------------------------------
  const runBtn = el('button', 'hb-idp-generate', '✨ Make ID photo') as HTMLButtonElement;
  runBtn.type = 'button';
  runBtn.disabled = true;
  wrap.appendChild(runBtn);

  const progress = el('div', 'hb-idp-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-idp-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-idp-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result ------------------------------------------------------------------------------
  const result = el('div', 'hb-idp-result');
  result.hidden = true;
  result.appendChild(el('p', 'hb-idp-label', '🎉 Your ID photo is ready'));
  const outImg = document.createElement('img');
  outImg.alt = 'ID photo on a pure white background';
  result.appendChild(outImg);
  const dlBtn = document.createElement('a');
  dlBtn.className = 'hb-idp-dl';
  dlBtn.textContent = '⬇ Download JPG';
  dlBtn.setAttribute('download', 'id-photo.jpg');
  result.appendChild(dlBtn);
  wrap.appendChild(result);

  const note = el('p', 'hb-idp-note', getDisclosures().join(' '));
  wrap.appendChild(note);

  // --- state ----------------------------------------------------------------------------------
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

  function showDropPreview(url: string, name: string): void {
    drop.classList.add('hb-idp-has-image');
    drop.innerHTML = '';
    const preview = document.createElement('img');
    preview.src = url;
    preview.className = 'hb-idp-preview';
    preview.alt = 'Selected portrait preview';
    const fname = el('p', 'hb-idp-filename', name);
    const change = el('button', 'hb-idp-change', 'Choose a different photo');
    change.type = 'button';
    change.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    drop.append(preview, fname, change);
  }

  function pickFile(f: File | undefined | null): void {
    if (!f) return;
    file = f;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(f);
    showDropPreview(objectUrl, f.name);
    runBtn.disabled = false;
    errBox.hidden = true;
    result.hidden = true;
    status.textContent = 'Portrait ready — pick a size and click “Make ID photo”.';
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
        'Done — ' + size.width + '×' + size.height + ' px white-background photo, made on your device. 🎉';
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
