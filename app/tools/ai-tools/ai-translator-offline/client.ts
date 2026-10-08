/**
 * client.ts — AI Translator (offline) (tool-511), Lane A.
 *
 * Flow: text input + language pair select -> per-pair lazy
 * pipeline('translation', verified Xenova opus-mt model) -> text is chunked on
 * sentence boundaries (~500 chars) -> chunks translated sequentially with
 * progress -> joined output in a textarea + copy. All on-device. Honest
 * errors only.
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

/** Minimal translation pipeline-callable shape. */
type Translator = (text: string) => Promise<unknown>;
interface TranslationOut {
  translation_text?: string;
}

const translatorCache: Record<string, Translator> = {};

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

  // --- inputs -------------------------------------------------------------
  const textLabel = el('label', 'hb-ai-label', 'Text to translate *');
  textLabel.htmlFor = 'hb-ai-trans-input';
  root.appendChild(textLabel);
  const textInput = el('textarea', 'hb-ai-textarea') as HTMLTextAreaElement;
  textInput.id = 'hb-ai-trans-input';
  textInput.rows = 8;
  textInput.placeholder = 'Enter up to ' + MAX_TEXT_CHARS + ' characters of text…';
  root.appendChild(textInput);
  const charCount = el('p', 'hb-ai-status', '0 / ' + MAX_TEXT_CHARS);
  root.appendChild(charCount);
  textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length + ' / ' + MAX_TEXT_CHARS;
  });

  const pairLabel = el('label', 'hb-ai-label', 'Language pair *');
  pairLabel.htmlFor = 'hb-ai-trans-pair';
  root.appendChild(pairLabel);
  const pairSel = el('select', 'hb-ai-select');
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
  root.appendChild(pairSel);

  const actions = el('div', 'hb-ai-actions');
  const runBtn = el('button', 'hb-btn hb-btn--primary', 'Translate');
  runBtn.type = 'button';
  actions.appendChild(runBtn);
  const swapBtn = el('button', 'hb-btn hb-btn--ghost', 'Swap direction');
  swapBtn.type = 'button';
  swapBtn.title = 'Switch the language pair direction (e.g. EN→ES becomes ES→EN)';
  actions.appendChild(swapBtn);
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
  const outLabel = el('label', 'hb-ai-label', 'Translation');
  outLabel.htmlFor = 'hb-ai-trans-output';
  result.appendChild(outLabel);
  const outBox = el('textarea', 'hb-ai-textarea') as HTMLTextAreaElement;
  outBox.id = 'hb-ai-trans-output';
  outBox.rows = 8;
  outBox.readOnly = true;
  outBox.placeholder = 'Your translation appears here.';
  result.appendChild(outBox);
  const outActions = el('div', 'hb-ai-actions');
  const copyBtn = el('button', 'hb-btn hb-btn--ghost', 'Copy translation');
  copyBtn.type = 'button';
  outActions.appendChild(copyBtn);
  result.appendChild(outActions);
  root.appendChild(result);

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
        status.textContent = 'Translation copied to clipboard.';
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
