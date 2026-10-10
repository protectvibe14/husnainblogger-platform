/**
 * client.ts — AI Blog Outline Generator, Lane B (redesigned).
 *
 * Flow: gradient header -> key-vault card (providers from
 * logic.getProviders()) -> provider card + input cards -> big gradient
 * Generate button -> progress + status -> beautiful result card + Copy.
 * Errors surface through humanizeFetchError / humanizeHttpStatus.
 * Keys are never logged and are sent only to the chosen provider.
 * User data is rendered via textContent only.
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
  options?: { value: string; label: string }[];
  hint?: string;
}

const FIELDS: FieldDef[] = [
  {
    id: 'topic',
    label: 'Blog topic',
    kind: 'text',
    required: true,
    placeholder: 'e.g. beginner\'s guide to indoor plants',
  },
  {
    id: 'depth',
    label: 'Outline depth',
    kind: 'select',
    required: true,
    options: [
      { value: 'basic', label: 'Basic (5–7 sections)' },
      { value: 'detailed', label: 'Detailed (8–12 sections)' },
      { value: 'comprehensive', label: 'Comprehensive (12+ sections)' },
    ],
  },
  {
    id: 'audience',
    label: 'Target audience (optional)',
    kind: 'text',
    required: false,
    placeholder: 'e.g. busy parents, first-time founders',
  },
];

const SAMPLE: Record<string, string> = {
  topic: 'beginner\'s guide to indoor plants',
  depth: 'detailed',
  audience: 'busy apartment dwellers',
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

export function mountAiTool(ctx: AiClientContext): void {
  const root = ctx.mountEl;
  root.innerHTML = '';
  const providers = getProviders();

  // --- styles ---------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-bo-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-bo-header {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-bo-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-bo-header p { margin: 0; font-size: 14px; opacity: .9; }
    .hb-bo-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-bo-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-bo-input, .hb-bo-textarea, .hb-bo-select {
      width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
      border: 2px solid #e2e8f0; border-radius: 10px; background: #fff;
      box-sizing: border-box;
    }
    .hb-bo-textarea { resize: vertical; min-height: 110px; }
    .hb-bo-input:focus, .hb-bo-textarea:focus, .hb-bo-select:focus {
      outline: none; border-color: #8b5cf6;
    }
    .hb-bo-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-bo-sample {
      font-size: 13px; color: #8b5cf6; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-bo-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-bo-generate:hover:not(:disabled) { opacity: .92; }
    .hb-bo-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-bo-progress {
      height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;
    }
    .hb-bo-progress > div {
      height: 100%; background: linear-gradient(90deg, #8b5cf6, #6366f1);
      width: 0%; transition: width .3s;
    }
    .hb-bo-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-bo-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-bo-result-card {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      border-radius: 14px; padding: 20px;
    }
    .hb-bo-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-bo-result-text {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 16px; font-size: 15px; line-height: 1.7; color: #1e293b;
      white-space: pre-wrap; word-break: break-word; max-height: 480px; overflow-y: auto;
    }
    .hb-bo-actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
    .hb-bo-copy {
      padding: 12px 24px; background: #16a34a; color: #fff; border: none;
      border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer;
    }
    .hb-bo-copy:hover { background: #15803d; }
    @media (max-width: 640px) {
      .hb-bo-header { padding: 18px; }
      .hb-bo-header h3 { font-size: 18px; }
      .hb-bo-card, .hb-bo-result-card { padding: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-bo-wrap');
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el('div', 'hb-bo-header');
  header.appendChild(el('h3', '', '📝 AI Blog Outline Generator'));
  header.appendChild(el('p', '', 'Describe your topic, pick a depth — get a clean H2/H3 outline ready to write from. Uses YOUR free Gemini/Groq/OpenRouter key.'));
  wrap.appendChild(header);

  // --- key vault card -------------------------------------------------------
  const vaultCard = el('div', 'hb-bo-card');
  wrap.appendChild(vaultCard);
  renderKeyVault(vaultCard, {
    providers,
    intro: 'Pick a provider and paste your free key. The tool does nothing until you do.',
  });

  // --- provider card --------------------------------------------------------
  const provCard = el('div', 'hb-bo-card');
  const provLabel = el('label', 'hb-bo-label', '🤖 Provider');
  provLabel.htmlFor = 'hb-ai-provider';
  provCard.appendChild(provLabel);
  const provSel = el('select', 'hb-bo-select');
  provSel.id = 'hb-ai-provider';
  for (const pid of providers) {
    const info = getProviderInfo(pid);
    const opt = document.createElement('option');
    opt.value = pid;
    opt.textContent =
      (info ? info.name : pid) + (pid === 'llm7' ? ' — no key needed (community demo)' : '');
    provSel.appendChild(opt);
  }
  provCard.appendChild(provSel);
  const hint = el('p', 'hb-bo-hint');
  provCard.appendChild(hint);
  wrap.appendChild(provCard);

  // --- input cards ----------------------------------------------------------
  const controls: Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = {};
  for (const f of FIELDS) {
    const card = el('div', 'hb-bo-card');
    const label = el('label', 'hb-bo-label', f.label + (f.required ? ' *' : ''));
    label.htmlFor = 'hb-ai-' + f.id;
    card.appendChild(label);
    let control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (f.kind === 'textarea') {
      const ta = el('textarea', 'hb-bo-textarea');
      ta.rows = f.rows ?? 4;
      if (f.placeholder) ta.placeholder = f.placeholder;
      control = ta;
    } else if (f.kind === 'select') {
      const sel = el('select', 'hb-bo-select');
      for (const o of f.options ?? []) {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        sel.appendChild(opt);
      }
      control = sel;
    } else {
      const inp = el('input', 'hb-bo-input');
      inp.type = 'text';
      if (f.placeholder) inp.placeholder = f.placeholder;
      control = inp;
    }
    control.id = 'hb-ai-' + f.id;
    controls[f.id] = control;
    card.appendChild(control);
    if (f.hint) card.appendChild(el('p', 'hb-bo-hint', f.hint));
    if (f.id === 'topic') {
      const sampleBtn = el('button', 'hb-bo-sample', '✨ Try a sample topic');
      sampleBtn.type = 'button';
      sampleBtn.addEventListener('click', () => {
        for (const key of Object.keys(SAMPLE)) {
          const c = controls[key];
          if (c) c.value = SAMPLE[key];
        }
      });
      card.appendChild(sampleBtn);
    }
    wrap.appendChild(card);
  }

  // --- generate --------------------------------------------------------------
  const gen = el('button', 'hb-bo-generate', '✨ Generate Outline');
  gen.type = 'button';
  wrap.appendChild(gen);

  const progress = el('div', 'hb-bo-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-bo-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-bo-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result -----------------------------------------------------------------
  const resCard = el('div', 'hb-bo-result-card');
  resCard.hidden = true;
  resCard.appendChild(el('p', 'hb-bo-result-title', '📋 Your blog outline'));
  const resText = el('div', 'hb-bo-result-text');
  resCard.appendChild(resText);
  const actions = el('div', 'hb-bo-actions');
  const copyBtn = el('button', 'hb-bo-copy', '📋 Copy outline');
  copyBtn.type = 'button';
  actions.appendChild(copyBtn);
  resCard.appendChild(actions);
  wrap.appendChild(resCard);

  // --- state -------------------------------------------------------------------
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
        'Paste your free ' + providerName(p) + ' key above to enable Generate — or switch provider.';
    }
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
  function showError(msg: string): void {
    hideProgress();
    status.textContent = '';
    errBox.textContent = msg;
    errBox.hidden = false;
    resCard.hidden = true;
  }
  function showResult(text: string): void {
    errBox.hidden = true;
    resText.textContent = text;
    resCard.hidden = false;
    resCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  provSel.addEventListener('change', refresh);
  onKeyChange(() => refresh());

  copyBtn.addEventListener('click', () => {
    const text = resText.textContent ?? '';
    const done = (): void => {
      copyBtn.textContent = 'Copied ✓';
      window.setTimeout(() => {
        copyBtn.textContent = '📋 Copy outline';
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
    resCard.hidden = true;
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
    gen.textContent = 'Generating…';
    setProgress(0.1, 'Contacting ' + providerName(p) + '…');
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
      setProgress(0.7, 'Writing your outline…');

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
      setProgress(1, 'Done.');
      hideProgress();
      status.textContent = 'Outline ready — copy it or paste it into your editor.';
      showResult(out.data.text);
    } catch (err) {
      showError(humanizeFetchError(err, providerName(p)));
    } finally {
      gen.textContent = originalLabel;
      refresh();
    }
  }

  refresh();
}
