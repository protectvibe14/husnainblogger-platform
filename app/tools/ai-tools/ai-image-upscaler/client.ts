/**
 * client.ts — AI Image Upscaler (tool-509), Lane A (redesigned).
 *
 * Flow: gradient header -> styled drag-drop upload zone with preview ->
 * 2x/4x select -> downscale input to <=1024 px ->
 * pipeline('image-to-image', verified Swin2SR model, fp32) -> RawImage ->
 * before/after comparison card + PNG download. All on-device. Honest errors only.
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

  // --- styles -------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-iu-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-iu-header {
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-iu-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-iu-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-iu-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-iu-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 10px;
    }
    .hb-iu-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease;
      background: #f8fafc;
    }
    .hb-iu-drop:hover, .hb-iu-drop.hb-iu-dragover {
      border-color: #1d4ed8; background: #eff6ff;
    }
    .hb-iu-drop.hb-iu-has-image { padding: 12px; }
    .hb-iu-icon { font-size: 40px; margin-bottom: 8px; }
    .hb-iu-title { font-size: 17px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-iu-hint { font-size: 13px; color: #64748b; margin: 0; }
    .hb-iu-browse {
      display: inline-block; margin-top: 12px; padding: 10px 22px;
      background: #1d4ed8; color: #fff; border: none; border-radius: 8px;
      font-size: 15px; font-weight: 600; cursor: pointer;
    }
    .hb-iu-browse:hover { background: #1e40af; }
    .hb-iu-preview { max-width: 100%; max-height: 240px; border-radius: 10px; margin: 0 auto; display: block; }
    .hb-iu-filename { font-size: 13px; color: #475569; margin-top: 8px; word-break: break-all; }
    .hb-iu-change {
      font-size: 13px; color: #1d4ed8; background: none; border: none;
      cursor: pointer; text-decoration: underline; margin-top: 4px;
    }
    .hb-iu-select {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px;
      box-sizing: border-box; font-family: inherit; background: #fff; color: #0f172a;
    }
    .hb-iu-select:focus { outline: none; border-color: #1d4ed8; }
    .hb-iu-run {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-iu-run:hover:not(:disabled) { opacity: .92; }
    .hb-iu-run:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-iu-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-iu-progress > div {
      height: 100%; background: linear-gradient(90deg, #1d4ed8, #3b82f6);
      width: 0%; transition: width .3s;
    }
    .hb-iu-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-iu-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-iu-result { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .hb-iu-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-iu-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 640px) {
      .hb-iu-compare { grid-template-columns: 1fr; }
      .hb-iu-header { padding: 18px; }
      .hb-iu-card { padding: 16px; }
      .hb-iu-run { font-size: 16px; }
    }
    .hb-iu-compare figure { margin: 0; }
    .hb-iu-compare img {
      width: 100%; border-radius: 10px; border: 1px solid #e2e8f0; display: block;
    }
    .hb-iu-compare figcaption { font-size: 13px; font-weight: 600; color: #475569; margin-top: 6px; text-align: center; }
    .hb-iu-dims { font-size: 13px; color: #64748b; margin: 12px 0 0; text-align: center; }
    .hb-iu-dl {
      display: inline-block; margin-top: 14px; padding: 12px 28px;
      background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); color: #fff;
      border-radius: 10px; font-size: 16px; font-weight: 700; text-decoration: none; text-align: center;
    }
    .hb-iu-dl:hover { opacity: .92; }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-iu-wrap');
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el('div', 'hb-iu-header');
  header.appendChild(el('h3', '', '🔎 AI Image Upscaler'));
  header.appendChild(el('p', '', 'Sharp 2x/4x upscaling, free — the AI model runs 100% in your browser, nothing uploaded.'));
  wrap.appendChild(header);

  // --- upload -------------------------------------------------------------------
  const uploadCard = el('div', 'hb-iu-card');
  const fileLabel = el('label', 'hb-iu-label', 'Image file *');
  fileLabel.htmlFor = 'hb-iu-file';
  uploadCard.appendChild(fileLabel);

  const drop = el('div', 'hb-iu-drop');
  drop.setAttribute('role', 'button');
  drop.tabIndex = 0;
  drop.setAttribute('aria-label', 'Upload an image: drag and drop, or press Enter to browse');
  const icon = el('div', 'hb-iu-icon', '🖼️');
  const dtitle = el('p', 'hb-iu-title', 'Drop your image here');
  const dsub = el('p', 'hb-iu-hint', 'or click to browse — JPG, PNG, WEBP up to ' + MAX_FILE_MB + ' MB');
  const browseBtn = el('button', 'hb-iu-browse', 'Choose image');
  browseBtn.type = 'button';
  drop.appendChild(icon);
  drop.appendChild(dtitle);
  drop.appendChild(dsub);
  drop.appendChild(browseBtn);
  uploadCard.appendChild(drop);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.id = 'hb-iu-file';
  fileInput.accept = getAllowedMimes().join(',');
  fileInput.hidden = true;
  uploadCard.appendChild(fileInput);
  wrap.appendChild(uploadCard);

  // --- scale ----------------------------------------------------------------------
  const scaleCard = el('div', 'hb-iu-card');
  const scaleLabel = el('label', 'hb-iu-label', 'Upscale factor');
  scaleLabel.htmlFor = 'hb-iu-scale';
  scaleCard.appendChild(scaleLabel);
  const scaleSel = document.createElement('select');
  scaleSel.className = 'hb-iu-select';
  scaleSel.id = 'hb-iu-scale';
  for (const id of ['2x', '4x']) {
    const opt = getScaleOption(id);
    const o = document.createElement('option');
    o.value = id;
    o.textContent = (opt?.label ?? id) + ' — ~' + (opt?.sizeMb ?? '?') + ' MB model, one-time download';
    scaleSel.appendChild(o);
  }
  scaleSel.value = '4x';
  scaleCard.appendChild(scaleSel);
  scaleCard.appendChild(el('p', 'hb-iu-hint', 'The AI model downloads once, then works offline. Upscaling can take a few minutes on CPU-only devices.'));
  wrap.appendChild(scaleCard);

  // --- run ----------------------------------------------------------------------------
  const runBtn = el('button', 'hb-iu-run', '🔎 Upscale image');
  runBtn.type = 'button';
  runBtn.disabled = true;
  wrap.appendChild(runBtn);

  // --- progress + status + error --------------------------------------------------------------
  const progress = el('div', 'hb-iu-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-iu-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-iu-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result -------------------------------------------------------------------------------------
  const result = el('div', 'hb-iu-result');
  result.hidden = true;
  result.appendChild(el('p', 'hb-iu-result-title', '✨ Upscaled!'));
  const pair = el('div', 'hb-iu-compare');
  const figBefore = document.createElement('figure');
  const beforeImg = document.createElement('img');
  beforeImg.alt = 'Original image';
  const capBefore = document.createElement('figcaption');
  capBefore.textContent = 'Before';
  figBefore.appendChild(beforeImg);
  figBefore.appendChild(capBefore);
  const figAfter = document.createElement('figure');
  const afterImg = document.createElement('img');
  afterImg.alt = 'Upscaled image';
  const capAfter = document.createElement('figcaption');
  capAfter.textContent = 'After';
  figAfter.appendChild(afterImg);
  figAfter.appendChild(capAfter);
  pair.appendChild(figBefore);
  pair.appendChild(figAfter);
  result.appendChild(pair);
  const dimsP = el('p', 'hb-iu-dims');
  result.appendChild(dimsP);
  const dlBtn = document.createElement('a');
  dlBtn.className = 'hb-iu-dl';
  dlBtn.textContent = '⬇ Download upscaled PNG';
  dlBtn.setAttribute('download', 'upscaled.png');
  result.appendChild(dlBtn);
  wrap.appendChild(result);

  // --- state ------------------------------------------------------------------------------
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

  function showDropEmpty(): void {
    drop.classList.remove('hb-iu-has-image');
    drop.innerHTML = '';
    drop.appendChild(icon);
    drop.appendChild(dtitle);
    drop.appendChild(dsub);
    drop.appendChild(browseBtn);
  }

  function showDropPreview(url: string, name: string): void {
    drop.classList.add('hb-iu-has-image');
    drop.innerHTML = '';
    const preview = document.createElement('img');
    preview.src = url;
    preview.className = 'hb-iu-preview';
    preview.alt = 'Selected image preview';
    drop.appendChild(preview);
    drop.appendChild(el('p', 'hb-iu-filename', name));
    const change = el('button', 'hb-iu-change', 'Choose a different image');
    change.type = 'button';
    change.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    drop.appendChild(change);
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
    status.textContent = 'Image ready — pick a factor and hit "Upscale image".';
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
    drop.classList.add('hb-iu-dragover');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('hb-iu-dragover'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('hb-iu-dragover');
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
      status.textContent = 'Done — image upscaled on your device. 🎉';
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
