/**
 * client.ts — AI Background Remover (redesigned).
 *
 * Flow: beautiful drag-drop upload zone with image preview ->
 * ONNX RMBG-1.4 model (direct onnxruntime-web, NOT transformers.js
 * pipeline which lacks SegformerForSemanticSegmentation support) ->
 * foreground mask -> transparent PNG -> before/after comparison +
 * download. All on-device. Honest errors only.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import { removeBackground } from './onnx-segmenter.ts';
import {
  validateInputs,
  getAllowedMimes,
  MAX_FILE_MB,
} from './logic.ts';

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

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = '';

  // --- styles -------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-bg-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-bg-drop {
      border: 2px dashed #9aa4b2; border-radius: 14px; padding: 36px 20px;
      text-align: center; cursor: pointer; transition: all .2s ease;
      background: #f8fafc;
    }
    .hb-bg-drop:hover, .hb-bg-drop.hb-bg-dragover {
      border-color: #2563eb; background: #eff6ff;
    }
    .hb-bg-drop.hb-bg-has-image { padding: 12px; }
    .hb-bg-icon { font-size: 40px; margin-bottom: 8px; }
    .hb-bg-title { font-size: 17px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .hb-bg-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-bg-browse {
      display: inline-block; margin-top: 12px; padding: 10px 22px;
      background: #2563eb; color: #fff; border: none; border-radius: 8px;
      font-size: 15px; font-weight: 600; cursor: pointer;
    }
    .hb-bg-browse:hover { background: #1d4ed8; }
    .hb-bg-preview { max-width: 100%; max-height: 220px; border-radius: 10px; margin: 0 auto; display: block; }
    .hb-bg-filename { font-size: 13px; color: #475569; margin-top: 8px; word-break: break-all; }
    .hb-bg-change { font-size: 13px; color: #2563eb; background: none; border: none; cursor: pointer; text-decoration: underline; margin-top: 4px; }
    .hb-bg-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    .hb-bg-run {
      padding: 12px 28px; background: #16a34a; color: #fff; border: none;
      border-radius: 8px; font-size: 16px; font-weight: 700; cursor: pointer;
    }
    .hb-bg-run:hover:not(:disabled) { background: #15803d; }
    .hb-bg-run:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-bg-progress { height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
    .hb-bg-progress > div { height: 100%; background: #2563eb; width: 0%; transition: width .3s; }
    .hb-bg-status { font-size: 14px; color: #475569; margin: 0; }
    .hb-bg-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 12px 16px; border-radius: 8px; font-size: 14px;
    }
    .hb-bg-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 600px) { .hb-bg-compare { grid-template-columns: 1fr; } }
    .hb-bg-compare figure { margin: 0; }
    .hb-bg-compare img {
      width: 100%; border-radius: 10px; border: 1px solid #e2e8f0;
      background-image: linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%);
      background-size: 20px 20px; background-position: 0 0, 0 10px, 10px -10px, -10px 0;
    }
    .hb-bg-compare figcaption { font-size: 13px; font-weight: 600; color: #475569; margin-top: 6px; text-align: center; }
    .hb-bg-dl {
      display: inline-block; padding: 12px 28px; background: #2563eb; color: #fff;
      border-radius: 8px; font-size: 16px; font-weight: 700; text-decoration: none; text-align: center;
    }
    .hb-bg-dl:hover { background: #1d4ed8; }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-bg-wrap');
  root.appendChild(wrap);

  // --- drop zone ------------------------------------------------------------
  const drop = el('div', 'hb-bg-drop');
  drop.setAttribute('role', 'button');
  drop.tabIndex = 0;
  drop.setAttribute('aria-label', 'Upload an image: drag and drop, or click to browse');

  const icon = el('div', 'hb-bg-icon', '🖼️');
  const title = el('p', 'hb-bg-title', 'Drop your image here');
  const sub = el('p', 'hb-bg-sub', `or click to browse — JPG, PNG, WEBP, GIF up to ${MAX_FILE_MB} MB`);
  const browseBtn = el('button', 'hb-bg-browse', 'Choose image');
  browseBtn.type = 'button';

  drop.appendChild(icon);
  drop.appendChild(title);
  drop.appendChild(sub);
  drop.appendChild(browseBtn);
  wrap.appendChild(drop);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = getAllowedMimes().join(',');
  fileInput.hidden = true;
  wrap.appendChild(fileInput);

  // --- state ------------------------------------------------------------------
  let file: File | null = null;
  let objectUrl: string | null = null;
  let resultUrl: string | null = null;

  function showDropEmpty(): void {
    drop.classList.remove('hb-bg-has-image');
    drop.innerHTML = '';
    drop.appendChild(icon);
    drop.appendChild(title);
    drop.appendChild(sub);
    drop.appendChild(browseBtn);
  }

  function showDropPreview(url: string, name: string): void {
    drop.classList.add('hb-bg-has-image');
    drop.innerHTML = '';
    const preview = document.createElement('img');
    preview.src = url;
    preview.className = 'hb-bg-preview';
    preview.alt = 'Selected image preview';
    const fname = el('p', 'hb-bg-filename', name);
    const change = el('button', 'hb-bg-change', 'Choose a different image');
    change.type = 'button';
    change.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });
    drop.appendChild(preview);
    drop.appendChild(fname);
    drop.appendChild(change);
  }

  function pickFile(f: File | null): void {
    hideError();
    resultBox.hidden = true;
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      resultUrl = null;
    }
    if (!f) return;
    const v = validateInputs({
      file: { name: f.name, sizeBytes: f.size, mimeType: f.type, width: 0, height: 0 },
    });
    // validateInputs needs dims; do a light check here, full check on run
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      showError(`That file is over ${MAX_FILE_MB} MB. Please choose a smaller image.`);
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    file = f;
    objectUrl = URL.createObjectURL(f);
    showDropPreview(objectUrl, f.name);
    runBtn.disabled = false;
    setStatus('Image ready — click "Remove background".');
  }

  drop.addEventListener('click', () => fileInput.click());
  drop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener('dragover', (e) => {
    e.preventDefault();
    drop.classList.add('hb-bg-dragover');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('hb-bg-dragover'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault();
    drop.classList.remove('hb-bg-dragover');
    const f = e.dataTransfer?.files?.[0];
    pickFile(f ?? null);
  });
  fileInput.addEventListener('change', () => pickFile(fileInput.files?.[0] ?? null));

  // --- run row ------------------------------------------------------------------
  const row = el('div', 'hb-bg-row');
  const runBtn = el('button', 'hb-bg-run', '✨ Remove background');
  runBtn.type = 'button';
  runBtn.disabled = true;
  row.appendChild(runBtn);
  const modelNote = el('p', 'hb-bg-status', 'AI model downloads once (~40 MB), then works offline. 100% on-device — nothing is uploaded.');
  row.appendChild(modelNote);
  wrap.appendChild(row);

  // --- progress -------------------------------------------------------------------
  const progressWrap = el('div', 'hb-bg-progress');
  progressWrap.hidden = true;
  const progressBar = el('div', '');
  progressWrap.appendChild(progressBar);
  wrap.appendChild(progressWrap);

  const status = el('p', 'hb-bg-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-bg-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result -----------------------------------------------------------------------
  const resultBox = el('div', 'hb-bg-wrap');
  resultBox.hidden = true;
  const compare = el('div', 'hb-bg-compare');
  const figBefore = document.createElement('figure');
  const beforeImg = document.createElement('img');
  beforeImg.alt = 'Original image';
  const capBefore = el('figcaption', '', 'Before');
  figBefore.appendChild(beforeImg);
  figBefore.appendChild(capBefore);
  const figAfter = document.createElement('figure');
  const afterImg = document.createElement('img');
  afterImg.alt = 'Background removed';
  const capAfter = el('figcaption', '', 'After — transparent PNG');
  figAfter.appendChild(afterImg);
  figAfter.appendChild(capAfter);
  compare.appendChild(figBefore);
  compare.appendChild(figAfter);
  resultBox.appendChild(compare);
  const dlBtn = document.createElement('a');
  dlBtn.className = 'hb-bg-dl';
  dlBtn.textContent = '⬇ Download transparent PNG';
  dlBtn.setAttribute('download', 'background-removed.png');
  resultBox.appendChild(dlBtn);
  wrap.appendChild(resultBox);

  function setStatus(msg: string): void {
    status.textContent = msg;
  }

  function setProgress(fraction: number, msg: string): void {
    progressWrap.hidden = false;
    progressBar.style.width = `${Math.round(fraction * 100)}%`;
    setStatus(msg);
  }

  function hideProgress(): void {
    progressWrap.hidden = true;
    progressBar.style.width = '0%';
  }

  function showError(msg: string): void {
    errBox.textContent = msg;
    errBox.hidden = false;
  }

  function hideError(): void {
    errBox.hidden = true;
    errBox.textContent = '';
  }

  // --- run ----------------------------------------------------------------------------
  runBtn.addEventListener('click', () => {
    void run();
  });

  async function run(): Promise<void> {
    hideError();
    resultBox.hidden = true;
    if (!file || !objectUrl) {
      showError('Please choose an image first.');
      return;
    }

    let img: HTMLImageElement;
    try {
      img = await loadImage(objectUrl);
    } catch {
      showError('Could not read that image file. Try another one.');
      return;
    }

    const v = validateInputs({
      file: {
        name: file.name,
        sizeBytes: file.size,
        mimeType: file.type,
        width: img.naturalWidth,
        height: img.naturalHeight,
      },
    });
    if (!v.ok) {
      showError(v.errors.join(' '));
      return;
    }

    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = 'Working…';
    try {
      const out = await removeBackground(img, (fraction, msg) => {
        setProgress(fraction < 0 ? 0 : fraction, msg);
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        out.toBlob(resolve, 'image/png'),
      );
      if (!blob) throw new Error('Could not encode the PNG result.');
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      resultUrl = URL.createObjectURL(blob);
      beforeImg.src = objectUrl;
      afterImg.src = resultUrl;
      dlBtn.setAttribute('href', resultUrl);
      dlBtn.setAttribute('download', file.name.replace(/\.[^.]+$/, '') + '-no-bg.png');
      resultBox.hidden = false;
      hideProgress();
      setStatus('Done — background removed on your device. 🎉');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      hideProgress();
      const msg = err instanceof Error ? err.message : String(err);
      showError('Background removal failed: ' + msg + ' Your image was never uploaded.');
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
    }
  }
}
