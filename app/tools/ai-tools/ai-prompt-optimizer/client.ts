/**
 * client.ts — AI Prompt Optimizer, Lane B (redesigned).
 *
 * Flow: gradient header -> key-vault card -> provider select + form ->
 * Generate -> progress bar + status -> result card + Copy -> errors.
 * Keys are never logged and are sent only to the chosen provider.
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

interface FieldDef {
  id: string;
  label: string;
  kind: 'textarea' | 'text' | 'select';
  required: boolean;
  placeholder?: string;
  rows?: number;
  max?: number;
  options?: { value: string; label: string }[];
  hint?: string;
}

const FIELDS: FieldDef[] = [
  {
    id: "goal",
    label: "Optimization goal",
    kind: 'select',
    required: true,
    options: [
      { value: "clearer", label: "Clearer" },
      { value: "more-detailed", label: "More detailed" },
      { value: "shorter", label: "Shorter" },
    ],
  },
  {
    id: "prompt",
    label: "Prompt to optimize",
    kind: 'textarea',
    required: true,
    placeholder: "Paste the prompt you want to improve (at least 20 characters)",
    rows: 6,
    max: 8000,
  },
];

const SAMPLE: Record<string, string> = {
  "prompt": "Write something about marketing for my business so I can post it online.",
};

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

  // --- styles -----------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-po-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-po-header {
      background: linear-gradient(135deg, #e11d48 0%, #fb7185 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-po-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-po-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-po-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-po-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin: 16px 0 8px;
    }
    .hb-po-label:first-of-type { margin-top: 0; }
    .hb-po-input, .hb-po-textarea, .hb-po-select {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px;
      box-sizing: border-box; font-family: inherit; background: #fff; color: #0f172a;
    }
    .hb-po-textarea { min-height: 120px; resize: vertical; }
    .hb-po-input:focus, .hb-po-textarea:focus, .hb-po-select:focus {
      outline: none; border-color: #e11d48;
    }
    .hb-po-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-po-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-po-sample {
      font-size: 13px; color: #e11d48; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 10px;
    }
    .hb-po-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #e11d48 0%, #fb7185 100%);
      border: none; border-radius: 12px; cursor: pointer; margin-top: 18px;
    }
    .hb-po-generate:hover:not(:disabled) { opacity: .92; }
    .hb-po-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-po-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-po-progress > div {
      height: 100%; width: 30%; border-radius: 5px;
      background: linear-gradient(90deg, #e11d48, #fb7185);
      animation: hb-po-slide 1.1s ease-in-out infinite;
    }
    @keyframes hb-po-slide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
    .hb-po-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-po-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-po-result {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-po-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 10px; }
    .hb-po-result-text {
      white-space: pre-wrap; word-break: break-word; font-size: 15px; line-height: 1.7;
      color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0;
      border-radius: 10px; padding: 16px; max-height: 480px; overflow-y: auto;
    }
    .hb-po-copy {
      display: inline-block; margin-top: 12px; padding: 10px 24px;
      background: #e11d48; color: #fff; border: none; border-radius: 8px;
      font-size: 15px; font-weight: 700; cursor: pointer;
    }
    .hb-po-copy:hover { opacity: .92; }
    .hb-po-meta { font-size: 12px; color: #94a3b8; margin: 8px 0 0; }
    @media (max-width: 640px) {
      .hb-po-header { padding: 18px; }
      .hb-po-card { padding: 16px; }
      .hb-po-generate { font-size: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-po-wrap');
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el('div', 'hb-po-header');
  header.appendChild(el('h3', '', '🧠 AI Prompt Optimizer'));
  header.appendChild(el('p', '', 'Weak prompts in — sharp prompts out.'));
  wrap.appendChild(header);

  // --- key vault ------------------------------------------------------------
  const vaultCard = el('div', 'hb-po-card');
  renderKeyVault(vaultCard, {
    providers,
    intro: 'Pick a provider and paste your free key. The tool does nothing until you do — your key stays in this browser.',
  });
  wrap.appendChild(vaultCard);

  // --- form -------------------------------------------------------------------
  const formCard = el('div', 'hb-po-card');
  const provLabel = el('label', 'hb-po-label', 'Provider');
  provLabel.htmlFor = 'hb-po-provider';
  formCard.appendChild(provLabel);
  const provSel = el('select', 'hb-po-select') as HTMLSelectElement;
  provSel.id = 'hb-po-provider';
  for (const pid of providers) {
    const info = getProviderInfo(pid);
    const opt = document.createElement('option');
    opt.value = pid;
    opt.textContent =
      (info ? info.name : pid) + (pid === 'llm7' ? ' \u2014 no key needed (community demo)' : '');
    provSel.appendChild(opt);
  }
  formCard.appendChild(provSel);

  const controls: Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = {};
  for (const f of FIELDS) {
    const label = el('label', 'hb-po-label', f.label + (f.required ? ' *' : ''));
    label.htmlFor = 'hb-po-' + f.id;
    formCard.appendChild(label);
    let control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (f.kind === 'textarea') {
      const ta = el('textarea', 'hb-po-textarea') as HTMLTextAreaElement;
      ta.rows = f.rows ?? 4;
      if (f.placeholder) ta.placeholder = f.placeholder;
      control = ta;
    } else if (f.kind === 'select') {
      const sel = el('select', 'hb-po-select') as HTMLSelectElement;
      for (const o of f.options ?? []) {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        sel.appendChild(opt);
      }
      control = sel;
    } else {
      const inp = el('input', 'hb-po-input') as HTMLInputElement;
      inp.type = 'text';
      if (f.placeholder) inp.placeholder = f.placeholder;
      control = inp;
    }
    control.id = 'hb-po-' + f.id;
    controls[f.id] = control;
    formCard.appendChild(control);
    if (f.kind === 'textarea' && typeof f.max === 'number') {
      const max = f.max;
      const count = el('p', 'hb-po-count', '0 / ' + max.toLocaleString('en-US') + ' characters');
      formCard.appendChild(count);
      const update = (): void => {
        const n = (control as HTMLTextAreaElement).value.trim().length;
        count.textContent = n.toLocaleString('en-US') + ' / ' + max.toLocaleString('en-US') + ' characters';
      };
      control.addEventListener('input', update);
    }
    if (f.hint) formCard.appendChild(el('p', 'hb-po-hint', f.hint));
  }

  const sampleBtn = el('button', 'hb-po-sample', '\u2728 Try a sample');
  sampleBtn.type = 'button';
  sampleBtn.addEventListener('click', () => {
    for (const id of Object.keys(SAMPLE)) {
      const c = controls[id];
      if (c) {
        c.value = SAMPLE[id];
        c.dispatchEvent(new Event('input'));
      }
    }
    errBox.hidden = true;
    resBox.hidden = true;
  });
  formCard.appendChild(sampleBtn);

  const hint = el('p', 'hb-po-hint');
  formCard.appendChild(hint);

  const gen = el('button', 'hb-po-generate', '🚀 Optimize prompt');
  gen.type = 'button';
  formCard.appendChild(gen);
  wrap.appendChild(formCard);

  // --- progress + status -------------------------------------------------------
  const progress = el('div', 'hb-po-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-po-status');
  wrap.appendChild(status);

  // --- error --------------------------------------------------------------------
  const errBox = el('div', 'hb-po-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result ----------------------------------------------------------------------
  const resBox = el('div', 'hb-po-result');
  resBox.hidden = true;
  resBox.appendChild(el('p', 'hb-po-result-title', '✨ Your optimized prompt'));
  const resText = el('div', 'hb-po-result-text');
  resBox.appendChild(resText);
  const copyBtn = el('button', 'hb-po-copy', 'Copy');
  copyBtn.type = 'button';
  resBox.appendChild(copyBtn);
  const resMeta = el('p', 'hb-po-meta');
  resBox.appendChild(resMeta);
  wrap.appendChild(resBox);

  // --- state ------------------------------------------------------------------------
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
      hint.textContent = 'Key saved for ' + providerName(p) + '. Nothing runs until you click Generate.';
    } else {
      hint.textContent =
        'Paste your free ' + providerName(p) + ' key above to enable Generate \u2014 or switch provider.';
    }
  }
  function showError(msg: string): void {
    progress.hidden = true;
    status.textContent = '';
    errBox.textContent = msg;
    errBox.hidden = false;
    resBox.hidden = true;
  }
  function showResult(text: string, pid: string): void {
    errBox.hidden = true;
    progress.hidden = true;
    status.textContent = '';
    resText.textContent = text;
    resMeta.textContent =
      'Generated with ' + providerName(pid) + ' \u00b7 ' + text.length.toLocaleString('en-US') + ' characters.';
    resBox.hidden = false;
    resBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  provSel.addEventListener('change', refresh);
  onKeyChange(() => refresh());

  copyBtn.addEventListener('click', () => {
    const text = resText.textContent ?? '';
    const done = (): void => {
      copyBtn.textContent = 'Copied \u2713';
      window.setTimeout(() => {
        copyBtn.textContent = 'Copy';
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
    resBox.hidden = true;
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
    gen.textContent = 'Generating\u2026';
    progress.hidden = false;
    status.textContent = 'Generating with ' + providerName(p) + '\u2026';
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
      showResult(out.data.text, p);
    } catch (err) {
      showError(humanizeFetchError(err, providerName(p)));
    } finally {
      gen.textContent = originalLabel;
      progress.hidden = true;
      status.textContent = '';
      refresh();
    }
  }

  refresh();
}
