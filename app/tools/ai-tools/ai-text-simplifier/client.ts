/**
 * client.ts — AI Text Simplifier (redesigned), Lane B.
 *
 * Flow: gradient header card -> key-vault card -> settings card (provider +
 * options) -> content card (text + sample) -> big gradient Simplify button ->
 * animated progress + status -> result card + Copy.
 * Errors surface through humanizeFetchError / humanizeHttpStatus.
 * Keys are never logged and are sent only to the chosen provider.
 * User content is rendered via textContent only.
 */
import {
  renderKeyVault,
  onKeyChange,
  getKey,
  humanizeFetchError,
  humanizeHttpStatus,
} from '../../../src/lib/ai/key-vault.ts';
import { getProviderInfo } from '../../../src/lib/ai/providers.ts';
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import {
  validateInputs,
  getProviders,
  buildRequest,
  parseResponse,
  buildPrompts,
} from './logic.ts';

const ACCENT = '#7c3aed';
const ACCENT_DARK = '#4f46e5';
const ACCENT_SOFT = 'rgba(124, 58, 237, .15)';

interface FieldDef {
  id: string;
  label: string;
  kind: 'textarea' | 'text' | 'select';
  required: boolean;
  placeholder?: string;
  rows?: number;
  options?: { value: string; label: string }[];
  hint?: string;
}

const FIELDS: FieldDef[] = [
  {
    id: 'level',
    label: 'Reading level',
    kind: 'select',
    required: true,
    options: [
      { value: 'plain', label: 'Plain language' },
      { value: 'easy', label: 'Easy read' },
      { value: 'kid-friendly', label: 'Kid-friendly' },
    ],
  },
  {
    id: 'text',
    label: 'Text to simplify',
    kind: 'textarea',
    required: true,
    rows: 6,
    placeholder: 'Paste the text you want simplified (at least 50 characters)',
  },
];

/** field id -> sample value for the "Try a sample" button. */
const SAMPLES: Record<string, string> = {
  text: 'The proliferation of microplastics in aquatic ecosystems has engendered considerable consternation among environmental scientists. These diminutive polymeric particles, originating from the degradation of larger plastic debris and industrial effluents, permeate marine food webs with potentially deleterious ramifications for both fauna and human consumers.',
};

/** field id -> character limit for the live counter (0 = no counter). */
const CHAR_LIMITS: Record<string, number> = { text: 8000 };

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
  const providers = getProviders();

  // --- styles -------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-simp-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-simp-header {
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-simp-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-simp-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-simp-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .hb-simp-card > h4 { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-simp-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
    .hb-simp-label .hb-simp-req { color: #dc2626; }
    .hb-simp-field { margin-bottom: 16px; }
    .hb-simp-field:last-child { margin-bottom: 0; }
    .hb-simp-input, .hb-simp-textarea, .hb-simp-select {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px;
      font-family: inherit; box-sizing: border-box; background: #fff; color: #1e293b;
    }
    .hb-simp-textarea { min-height: 130px; resize: vertical; line-height: 1.5; }
    .hb-simp-input:focus, .hb-simp-textarea:focus, .hb-simp-select:focus {
      outline: none; border-color: ${ACCENT}; box-shadow: 0 0 0 3px ${ACCENT_SOFT};
    }
    .hb-simp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 640px) { .hb-simp-grid { grid-template-columns: 1fr; } }
    .hb-simp-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-simp-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-simp-sample {
      font-size: 13px; color: ${ACCENT}; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-simp-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-simp-generate:hover:not(:disabled) { opacity: .92; }
    .hb-simp-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-simp-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-simp-progress > div {
      height: 100%; width: 30%; border-radius: 5px;
      background: linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK});
      animation: hb-simp-slide 1.2s ease-in-out infinite;
    }
    @keyframes hb-simp-slide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
    .hb-simp-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-simp-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-simp-result {
      background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%);
      border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-simp-result__title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-simp-result__text {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 16px; font-size: 15px; line-height: 1.6; color: #1e293b;
      white-space: pre-wrap; word-break: break-word;
      max-height: 420px; overflow-y: auto; margin: 0 0 12px;
    }
    .hb-simp-copy {
      display: inline-block; padding: 10px 24px; background: #16a34a; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer;
    }
    .hb-simp-copy:hover { background: #15803d; }
    @media (max-width: 640px) {
      .hb-simp-header { padding: 18px; }
      .hb-simp-card { padding: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-simp-wrap');
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el('div', 'hb-simp-header');
  header.appendChild(el('h3', '', '📝 AI Text Simplifier'));
  header.appendChild(
    el('p', '', 'Simplify complex text free with AI — rewrite any content at the exact reading level you pick.'),
  );
  wrap.appendChild(header);

  // --- key vault card -------------------------------------------------------
  const vaultCard = el('div', 'hb-simp-card');
  vaultCard.appendChild(el('h4', '', '🔑 Your API key'));
  const vault = el('div', '');
  vaultCard.appendChild(vault);
  renderKeyVault(vault, {
    providers,
    intro: 'Pick a provider and paste your free key. The tool does nothing until you do.',
  });
  wrap.appendChild(vaultCard);

  // --- settings card: provider + select fields -------------------------------
  const settingsCard = el('div', 'hb-simp-card');
  settingsCard.appendChild(el('h4', '', '⚙️ Settings'));
  const grid = el('div', 'hb-simp-grid');
  settingsCard.appendChild(grid);

  const provField = el('div', 'hb-simp-field');
  const provLabel = el('label', 'hb-simp-label');
  provLabel.htmlFor = 'hb-ai-provider';
  provLabel.textContent = 'Provider ';
  const provReq = el('span', 'hb-simp-req', '*');
  provLabel.appendChild(provReq);
  provField.appendChild(provLabel);
  const provSel = el('select', 'hb-simp-select');
  provSel.id = 'hb-ai-provider';
  for (const pid of providers) {
    const info = getProviderInfo(pid);
    const opt = document.createElement('option');
    opt.value = pid;
    opt.textContent =
      (info ? info.name : pid) + (pid === 'llm7' ? ' — no key needed (community demo)' : '');
    provSel.appendChild(opt);
  }
  provField.appendChild(provSel);
  grid.appendChild(provField);

  // --- content card: text/textarea fields ------------------------------------
  const contentCard = el('div', 'hb-simp-card');
  contentCard.appendChild(el('h4', '', '📄 Your text'));

  const controls: Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = {};
  const selects: HTMLDivElement[] = [];
  const texts: HTMLDivElement[] = [];

  for (const f of FIELDS) {
    const fieldWrap = el('div', 'hb-simp-field');
    const label = el('label', 'hb-simp-label');
    label.htmlFor = 'hb-ai-' + f.id;
    label.textContent = f.label + ' ';
    if (f.required) label.appendChild(el('span', 'hb-simp-req', '*'));
    fieldWrap.appendChild(label);

    let control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (f.kind === 'textarea') {
      const ta = el('textarea', 'hb-simp-textarea');
      ta.rows = f.rows ?? 4;
      if (f.placeholder) ta.placeholder = f.placeholder;
      control = ta;
    } else if (f.kind === 'select') {
      const sel = el('select', 'hb-simp-select');
      for (const o of f.options ?? []) {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        sel.appendChild(opt);
      }
      control = sel;
    } else {
      const inp = el('input', 'hb-simp-input');
      inp.type = 'text';
      if (f.placeholder) inp.placeholder = f.placeholder;
      control = inp;
    }
    control.id = 'hb-ai-' + f.id;
    controls[f.id] = control;
    fieldWrap.appendChild(control);

    const limit = CHAR_LIMITS[f.id] ?? 0;
    if (f.kind === 'textarea' && limit > 0) {
      const count = el('p', 'hb-simp-count', '0 / ' + limit.toLocaleString('en-US') + ' characters');
      control.addEventListener('input', () => {
        const n = (control as HTMLTextAreaElement).value.length;
        count.textContent = n.toLocaleString('en-US') + ' / ' + limit.toLocaleString('en-US') + ' characters';
      });
      fieldWrap.appendChild(count);
    }

    if (SAMPLES[f.id] !== undefined) {
      const sampleBtn = el('button', 'hb-simp-sample', '✨ Try a sample');
      sampleBtn.type = 'button';
      sampleBtn.addEventListener('click', () => {
        (control as HTMLTextAreaElement | HTMLInputElement).value = SAMPLES[f.id];
        control.dispatchEvent(new Event('input'));
      });
      fieldWrap.appendChild(sampleBtn);
    }
    if (f.hint) fieldWrap.appendChild(el('p', 'hb-simp-hint', f.hint));

    if (f.kind === 'select') selects.push(fieldWrap);
    else texts.push(fieldWrap);
  }

  for (const s of selects) grid.appendChild(s);
  wrap.appendChild(settingsCard);
  for (const t of texts) contentCard.appendChild(t);
  wrap.appendChild(contentCard);

  const hint = el('p', 'hb-simp-hint');
  wrap.appendChild(hint);

  // --- generate ---------------------------------------------------------------
  const gen = el('button', 'hb-simp-generate', '✨ Simplify text');
  gen.type = 'button';
  wrap.appendChild(gen);

  const progress = el('div', 'hb-simp-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-simp-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-simp-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  const resultCard = el('div', 'hb-simp-result');
  resultCard.hidden = true;
  resultCard.appendChild(el('p', 'hb-simp-result__title', '✨ Simplified text'));
  const resText = el('div', 'hb-simp-result__text');
  resultCard.appendChild(resText);
  const copyBtn = el('button', 'hb-simp-copy', '📋 Copy');
  copyBtn.type = 'button';
  resultCard.appendChild(copyBtn);
  wrap.appendChild(resultCard);

  // --- state --------------------------------------------------------------------
  function selectedProvider(): string {
    return provSel.value;
  }
  function providerName(pid: string): string {
    return getProviderInfo(pid)?.name ?? pid;
  }
  function canGenerate(): boolean {
    const p = selectedProvider();
    return p === 'llm7' || getKey(p) !== null;
  }
  function refresh(): void {
    const p = selectedProvider();
    gen.disabled = !canGenerate();
    if (getKey(p)) {
      hint.textContent = 'Key saved for ' + providerName(p) + '. Nothing runs until you click Simplify text.';
    } else {
      hint.textContent =
        'Paste your free ' + providerName(p) + ' key above to enable Generate — or switch provider.';
    }
  }
  function setProgress(on: boolean, label: string): void {
    progress.hidden = !on;
    status.textContent = label;
  }
  function showError(msg: string): void {
    progress.hidden = true;
    status.textContent = '';
    errBox.textContent = msg;
    errBox.hidden = false;
    resultCard.hidden = true;
  }
  function showResult(text: string): void {
    errBox.hidden = true;
    resText.textContent = text;
    resultCard.hidden = false;
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  provSel.addEventListener('change', refresh);
  onKeyChange(() => refresh());

  copyBtn.addEventListener('click', () => {
    const text = resText.textContent ?? '';
    const done = (): void => {
      copyBtn.textContent = 'Copied ✓';
      window.setTimeout(() => {
        copyBtn.textContent = '📋 Copy';
      }, 1500);
    };
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
    } else {
      fallbackCopy(text, done);
    }
  });

  function fallbackCopy(text: string, done: () => void): void {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch {
      /* clipboard unavailable — user can select manually */
    }
    ta.remove();
    done();
  }

  gen.addEventListener('click', () => {
    void run();
  });

  async function run(): Promise<void> {
    errBox.hidden = true;
    resultCard.hidden = true;
    const values: Record<string, string> = {};
    for (const f of FIELDS) values[f.id] = controls[f.id].value.trim();

    const v = validateInputs(values);
    if (!v.ok) {
      showError(v.errors.join(' '));
      return;
    }

    const p = selectedProvider();
    const key = p === 'llm7' ? '' : getKey(p);
    if (!key && p !== 'llm7') {
      showError('Save your ' + providerName(p) + ' key above first.');
      return;
    }

    const prompt = buildPrompts(values);
    let req;
    try {
      req = buildRequest(p, key ?? '', prompt);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not build the request.');
      return;
    }

    gen.disabled = true;
    const originalLabel = gen.textContent;
    gen.textContent = 'Simplifying…';
    setProgress(true, 'Contacting ' + providerName(p) + '…');
    try {
      const ctrl = new AbortController();
      const timer = window.setTimeout(() => ctrl.abort(), 60000);
      let res: Response;
      try {
        res = await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(req.body),
          signal: ctrl.signal,
        });
      } finally {
        window.clearTimeout(timer);
      }

      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        const friendly = humanizeHttpStatus(res.status, providerName(p));
        const parsed = parseResponse(p, res.status, json);
        showError(friendly ?? parsed.message ?? 'The request failed.');
        return;
      }
      const out = parseResponse(p, res.status, json);
      if (!out.ok || !out.data) {
        showError(out.message ?? 'The provider returned an empty response.');
        return;
      }
      setProgress(false, 'Done ✓');
      showResult(out.data.text);
    } catch (err) {
      showError(humanizeFetchError(err, providerName(p)));
    } finally {
      gen.textContent = originalLabel;
      progress.hidden = true;
      refresh();
    }
  }

  refresh();
}
