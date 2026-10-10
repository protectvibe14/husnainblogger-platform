/**
 * client.ts — AI Translator (offline) (redesigned) (tool-511), Lane A.
 *
 * Flow: gradient header -> text card (input + counter + sample) -> language
 * card (pair select + swap) -> big gradient Translate button -> progress +
 * status -> result card (output + copy).
 * Per-pair lazy pipeline('translation', verified Xenova opus-mt model) ->
 * text chunked on sentence boundaries (~500 chars) -> chunks translated
 * sequentially with progress -> joined output in a textarea + copy.
 * All on-device. Honest errors only. User text via textContent/value only.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import type { ModelLoadProgress } from '../../../src/lib/ai/model-loader.ts';
import { loadPipeline } from '../../../src/lib/ai/model-loader.ts';
import {
  validateInputs,
  getPair,
  chunkText,
  LANG_PAIRS,
  MAX_TEXT_CHARS,
  CHUNK_CHARS,
} from './logic.ts';

const ACCENT = '#10b981';
const ACCENT_DARK = '#0d9488';
const ACCENT_SOFT = 'rgba(16, 185, 129, .15)';

/** Minimal translation pipeline-callable shape. */
type Translator = (text: string) => Promise<unknown>;
interface TranslationOut {
  translation_text?: string;
}

const translatorCache: Record<string, Translator> = {};

const SAMPLE_TEXT =
  'Hello! How are you today? This is a sample translation. The offline AI model runs entirely in your browser — nothing is ever uploaded.';

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

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = '';

  // --- styles -------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-tr-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-tr-header {
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-tr-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-tr-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-tr-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .hb-tr-card > h4 { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-tr-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
    .hb-tr-label .hb-tr-req { color: #dc2626; }
    .hb-tr-textarea {
      width: 100%; min-height: 130px; padding: 14px; font-size: 15px; line-height: 1.5;
      border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical;
      font-family: inherit; box-sizing: border-box; color: #1e293b;
    }
    .hb-tr-textarea:focus { outline: none; border-color: ${ACCENT}; box-shadow: 0 0 0 3px ${ACCENT_SOFT}; }
    .hb-tr-select {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px;
      font-family: inherit; box-sizing: border-box; background: #fff; color: #1e293b;
    }
    .hb-tr-select:focus { outline: none; border-color: ${ACCENT}; box-shadow: 0 0 0 3px ${ACCENT_SOFT}; }
    .hb-tr-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-tr-sample {
      font-size: 13px; color: ${ACCENT}; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-tr-swap {
      margin-top: 12px; padding: 10px 20px; font-size: 14px; font-weight: 600;
      color: ${ACCENT_DARK}; background: #ecfdf5; border: 2px solid ${ACCENT_SOFT};
      border-radius: 10px; cursor: pointer;
    }
    .hb-tr-swap:hover { background: #d1fae5; }
    .hb-tr-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-tr-generate:hover:not(:disabled) { opacity: .92; }
    .hb-tr-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-tr-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-tr-progress > div {
      height: 100%; background: linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK});
      width: 0%; transition: width .3s;
    }
    .hb-tr-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-tr-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-tr-result {
      background: linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%);
      border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-tr-result__title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-tr-copy {
      display: inline-block; margin-top: 12px; padding: 10px 24px; background: #16a34a; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer;
    }
    .hb-tr-copy:hover { background: #15803d; }
    @media (max-width: 640px) {
      .hb-tr-header { padding: 18px; }
      .hb-tr-card { padding: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-tr-wrap');
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el('div', 'hb-tr-header');
  header.appendChild(el('h3', '', '🌐 Offline AI Translator'));
  header.appendChild(
    el('p', '', 'Translate text free with offline AI — runs on your device, nothing is ever uploaded.'),
  );
  wrap.appendChild(header);

  // --- text card --------------------------------------------------------------
  const textCard = el('div', 'hb-tr-card');
  textCard.appendChild(el('h4', '', '📝 Your text'));
  const textLabel = el('label', 'hb-tr-label');
  textLabel.htmlFor = 'hb-ai-trans-input';
  textLabel.textContent = 'Text to translate ';
  textLabel.appendChild(el('span', 'hb-tr-req', '*'));
  textCard.appendChild(textLabel);
  const textInput = el('textarea', 'hb-tr-textarea') as HTMLTextAreaElement;
  textInput.id = 'hb-ai-trans-input';
  textInput.rows = 8;
  textInput.placeholder = 'Enter up to ' + MAX_TEXT_CHARS + ' characters of text…';
  textCard.appendChild(textInput);
  const charCount = el('p', 'hb-tr-count', '0 / ' + MAX_TEXT_CHARS);
  textCard.appendChild(charCount);
  textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length + ' / ' + MAX_TEXT_CHARS;
  });
  const sampleBtn = el('button', 'hb-tr-sample', '✨ Try a sample');
  sampleBtn.type = 'button';
  sampleBtn.addEventListener('click', () => {
    textInput.value = SAMPLE_TEXT;
    textInput.dispatchEvent(new Event('input'));
  });
  textCard.appendChild(sampleBtn);
  wrap.appendChild(textCard);

  // --- language card ------------------------------------------------------------
  const langCard = el('div', 'hb-tr-card');
  langCard.appendChild(el('h4', '', '🗣️ Languages'));
  const pairLabel = el('label', 'hb-tr-label');
  pairLabel.htmlFor = 'hb-ai-trans-pair';
  pairLabel.textContent = 'Language pair ';
  pairLabel.appendChild(el('span', 'hb-tr-req', '*'));
  langCard.appendChild(pairLabel);
  const pairSel = el('select', 'hb-tr-select');
  pairSel.id = 'hb-ai-trans-pair';
  const groups: Record<string, HTMLOptGroupElement> = {};
  for (const p of LANG_PAIRS) {
    const key = p.fromName;
    if (!groups[key]) {
      const g = document.createElement('optgroup');
      g.label = 'From ' + key;
      pairSel.appendChild(g);
      groups[key] = g;
    }
    const o = document.createElement('option');
    o.value = p.id;
    o.textContent = p.fromName + ' → ' + p.toName;
    groups[key].appendChild(o);
  }
  langCard.appendChild(pairSel);
  const swapBtn = el('button', 'hb-tr-swap', '⇄ Swap direction');
  swapBtn.type = 'button';
  swapBtn.title = 'Switch the language pair direction (e.g. EN→ES becomes ES→EN)';
  langCard.appendChild(swapBtn);
  wrap.appendChild(langCard);

  // --- translate ------------------------------------------------------------------
  const runBtn = el('button', 'hb-tr-generate', '🌐 Translate');
  runBtn.type = 'button';
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

  const result = el('div', 'hb-tr-result');
  result.hidden = true;
  result.appendChild(el('p', 'hb-tr-result__title', '✨ Translation'));
  const outLabel = el('label', 'hb-tr-label', 'Translated text');
  outLabel.htmlFor = 'hb-ai-trans-output';
  result.appendChild(outLabel);
  const outBox = el('textarea', 'hb-tr-textarea') as HTMLTextAreaElement;
  outBox.id = 'hb-ai-trans-output';
  outBox.rows = 8;
  outBox.readOnly = true;
  outBox.placeholder = 'Your translation appears here.';
  result.appendChild(outBox);
  const copyBtn = el('button', 'hb-tr-copy', '📋 Copy translation');
  copyBtn.type = 'button';
  result.appendChild(copyBtn);
  wrap.appendChild(result);

  // --- helpers ------------------------------------------------------------
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

  swapBtn.addEventListener('click', () => {
    const cur = getPair(pairSel.value);
    if (!cur) return;
    const reversed = LANG_PAIRS.find((p) => p.fromCode === cur.toCode && p.toCode === cur.fromCode);
    if (!reversed) {
      status.textContent = 'No reverse pair is available for this language.';
      return;
    }
    pairSel.value = reversed.id;
    status.textContent = 'Pair: ' + reversed.fromName + ' → ' + reversed.toName + '.';
  });

  async function getTranslator(modelId: string): Promise<Translator> {
    if (translatorCache[modelId]) return translatorCache[modelId];
    const pipe = (await loadPipeline('translation', modelId, {
      onProgress: (p: ModelLoadProgress) => setProgress(p.fraction < 0 ? 0 : p.fraction, p.status),
    })) as unknown as Translator;
    if (typeof pipe !== 'function') throw new Error('The AI model did not start correctly.');
    translatorCache[modelId] = pipe;
    return pipe;
  }

  runBtn.addEventListener('click', () => {
    void run();
  });

  copyBtn.addEventListener('click', () => {
    void (async () => {
      try {
        await navigator.clipboard.writeText(outBox.value);
        copyBtn.textContent = 'Copied ✓';
        window.setTimeout(() => {
          copyBtn.textContent = '📋 Copy translation';
        }, 1500);
      } catch {
        status.textContent = 'Copy failed — select the text manually and press Ctrl/Cmd+C.';
      }
    })();
  });

  async function run(): Promise<void> {
    errBox.hidden = true;
    result.hidden = true;
    const text = textInput.value;
    const pair = getPair(pairSel.value);

    const v = validateInputs({ text, pair: pairSel.value });
    if (!v.ok || !pair) {
      showError(v.errors.join(' ') || 'Pick a language pair.');
      return;
    }

    runBtn.disabled = true;
    const origLabel = runBtn.textContent;
    runBtn.textContent = 'Translating…';
    try {
      const translator = await getTranslator(pair.modelId);
      const chunks = chunkText(text, CHUNK_CHARS);
      if (!chunks.length) {
        showError('Enter some text to translate.');
        return;
      }
      const translated: string[] = [];
      for (let i = 0; i < chunks.length; i++) {
        setProgress(
          (i + 1) / chunks.length,
          'Translating part ' + (i + 1) + ' of ' + chunks.length + ' (' + pair.fromName + ' → ' + pair.toName + ')…',
        );
        const raw = (await translator(chunks[i])) as unknown;
        const first = (Array.isArray(raw) ? raw[0] : raw) as TranslationOut | undefined;
        const piece = typeof first?.translation_text === 'string' ? first.translation_text.trim() : '';
        translated.push(piece || '[untranslated]');
      }
      outBox.value = translated.join(' ');
      result.hidden = false;
      hideProgress();
      status.textContent =
        'Done — ' + chunks.length + ' part' + (chunks.length === 1 ? '' : 's') +
        ' translated on your device. Machine-quality: have a native speaker check important text.';
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      hideProgress();
      const msg = err instanceof Error ? err.message : String(err);
      if (/Could not load the AI model/i.test(msg)) {
        showError(msg);
      } else {
        showError('Translation failed: ' + msg + ' Your text was never uploaded — try again or reload.');
      }
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = origLabel;
    }
  }
}
