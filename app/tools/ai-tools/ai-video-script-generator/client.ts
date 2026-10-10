/**
 * client.ts — AI Video Script Generator (redesigned), Lane B.
 *
 * Flow: gradient header card -> key-vault card -> settings card (provider +
 * options) -> content card (text + sample) -> big gradient Generate Script button ->
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

const ACCENT = '#d946ef';
const ACCENT_DARK = '#8b5cf6';
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
    id: 'topic',
    label: 'Video topic',
    kind: 'text',
    required: true,
    placeholder: 'e.g. 5 budget travel hacks for students',
  },
  {
    id: 'platform',
    label: 'Platform',
    kind: 'select',
    required: true,
    options: [
      { value: 'youtube', label: 'YouTube' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'instagram-reels', label: 'Instagram Reels' },
      { value: 'youtube-shorts', label: 'YouTube Shorts' },
    ],
  },
  {
    id: 'duration',
    label: 'Video length',
    kind: 'select',
    required: true,
    options: [
      { value: 'under-60s', label: 'Under 60 seconds' },
      { value: '2-5-min', label: '2–5 minutes' },
      { value: '10-plus-min', label: '10+ minutes' },
    ],
  },
  {
    id: 'tone',
    label: 'Tone',
    kind: 'select',
    required: true,
    options: [
      { value: 'casual', label: 'Casual' },
      { value: 'professional', label: 'Professional' },
      { value: 'energetic', label: 'Energetic' },
      { value: 'educational', label: 'Educational' },
    ],
  },
];

/** field id -> sample value for the "Try a sample" button. */
const SAMPLES: Record<string, string> = {
  topic: '5 budget travel hacks for students',
};

/** field id -> character limit for the live counter (0 = no counter). */
const CHAR_LIMITS: Record<string, number> = {};

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
    .hb-vsg-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-vsg-header {
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-vsg-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-vsg-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-vsg-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .hb-vsg-card > h4 { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-vsg-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
    .hb-vsg-label .hb-vsg-req { color: #dc2626; }
    .hb-vsg-field { margin-bottom: 16px; }
    .hb-vsg-field:last-child { margin-bottom: 0; }
    .hb-vsg-input, .hb-vsg-textarea, .hb-vsg-select {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px;
      font-family: inherit; box-sizing: border-box; background: #fff; color: #1e293b;
    }
    .hb-vsg-textarea { min-height: 130px; resize: vertical; line-height: 1.5; }
    .hb-vsg-input:focus, .hb-vsg-textarea:focus, .hb-vsg-select:focus {
      outline: none; border-color: ${ACCENT}; box-shadow: 0 0 0 3px ${ACCENT_SOFT};
    }
    .hb-vsg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 640px) { .hb-vsg-grid { grid-template-columns: 1fr; } }
    .hb-vsg-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-vsg-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-vsg-sample {
      font-size: 13px; color: ${ACCENT}; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-vsg-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-vsg-generate:hover:not(:disabled) { opacity: .92; }
    .hb-vsg-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-vsg-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-vsg-progress > div {
      height: 100%; width: 30%; border-radius: 5px;
      background: linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK});
      animation: hb-vsg-slide 1.2s ease-in-out infinite;
    }
    @keyframes hb-vsg-slide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
    .hb-vsg-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-vsg-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-vsg-result {
      background: linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%);
      border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-vsg-result__title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-vsg-result__text {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 16px; font-size: 15px; line-height: 1.6; color: #1e293b;
      white-space: pre-wrap; word-break: break-word;
      max-height: 420px; overflow-y: auto; margin: 0 0 12px;
    }
    .hb-vsg-copy {
      display: inline-block; padding: 10px 24px; background: #16a34a; color: #fff;
      border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer;
    }
    .hb-vsg-copy:hover { background: #15803d; }
    @media (max-width: 640px) {
      .hb-vsg-header { padding: 18px; }
      .hb-vsg-card { padding: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-vsg-wrap');
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el('div', 'hb-vsg-header');
  header.appendChild(el('h3', '', '🎬 AI Video Script Generator'));
  header.appendChild(
    el('p', '', 'Generate a complete video script — hook, beats, and call to action — for YouTube, TikTok, or Reels.'),
  );
  wrap.appendChild(header);

  // --- key vault card -------------------------------------------------------
  const vaultCard = el('div', 'hb-vsg-card');
  vaultCard.appendChild(el('h4', '', '🔑 Your API key'));
  const vault = el('div', '');
  vaultCard.appendChild(vault);
  renderKeyVault(vault, {
    providers,
    intro: 'Pick a provider and paste your free key. The tool does nothing until you do.',
  });
  wrap.appendChild(vaultCard);

  // --- settings card: provider + select fields -------------------------------
  const settingsCard = el('div', 'hb-vsg-card');
  settingsCard.appendChild(el('h4', '', '⚙️ Settings'));
  const grid = el('div', 'hb-vsg-grid');
  settingsCard.appendChild(grid);

  const provField = el('div', 'hb-vsg-field');
  const provLabel = el('label', 'hb-vsg-label');
  provLabel.htmlFor = 'hb-ai-provider';
  provLabel.textContent = 'Provider ';
  const provReq = el('span', 'hb-vsg-req', '*');
  provLabel.appendChild(provReq);
  provField.appendChild(provLabel);
  const provSel = el('select', 'hb-vsg-select');
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
  const contentCard = el('div', 'hb-vsg-card');
  contentCard.appendChild(el('h4', '', '🎯 Your video'));

  const controls: Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = {};
  const selects: HTMLDivElement[] = [];
  const texts: HTMLDivElement[] = [];

  for (const f of FIELDS) {
    const fieldWrap = el('div', 'hb-vsg-field');
    const label = el('label', 'hb-vsg-label');
    label.htmlFor = 'hb-ai-' + f.id;
    label.textContent = f.label + ' ';
    if (f.required) label.appendChild(el('span', 'hb-vsg-req', '*'));
    fieldWrap.appendChild(label);

    let control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (f.kind === 'textarea') {
      const ta = el('textarea', 'hb-vsg-textarea');
      ta.rows = f.rows ?? 4;
      if (f.placeholder) ta.placeholder = f.placeholder;
      control = ta;
    } else if (f.kind === 'select') {
      const sel = el('select', 'hb-vsg-select');
      for (const o of f.options ?? []) {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        sel.appendChild(opt);
      }
      control = sel;
    } else {
      const inp = el('input', 'hb-vsg-input');
      inp.type = 'text';
      if (f.placeholder) inp.placeholder = f.placeholder;
      control = inp;
    }
    control.id = 'hb-ai-' + f.id;
    controls[f.id] = control;
    fieldWrap.appendChild(control);

    const limit = CHAR_LIMITS[f.id] ?? 0;
    if (f.kind === 'textarea' && limit > 0) {
      const count = el('p', 'hb-vsg-count', '0 / ' + limit.toLocaleString('en-US') + ' characters');
      control.addEventListener('input', () => {
        const n = (control as HTMLTextAreaElement).value.length;
        count.textContent = n.toLocaleString('en-US') + ' / ' + limit.toLocaleString('en-US') + ' characters';
      });
      fieldWrap.appendChild(count);
    }

    if (SAMPLES[f.id] !== undefined) {
      const sampleBtn = el('button', 'hb-vsg-sample', '✨ Try a sample');
      sampleBtn.type = 'button';
      sampleBtn.addEventListener('click', () => {
        (control as HTMLTextAreaElement | HTMLInputElement).value = SAMPLES[f.id];
        control.dispatchEvent(new Event('input'));
      });
      fieldWrap.appendChild(sampleBtn);
    }
    if (f.hint) fieldWrap.appendChild(el('p', 'hb-vsg-hint', f.hint));

    if (f.kind === 'select') selects.push(fieldWrap);
    else texts.push(fieldWrap);
  }

  for (const s of selects) grid.appendChild(s);
  wrap.appendChild(settingsCard);
  for (const t of texts) contentCard.appendChild(t);
  wrap.appendChild(contentCard);

  const hint = el('p', 'hb-vsg-hint');
  wrap.appendChild(hint);

  // --- generate ---------------------------------------------------------------
  const gen = el('button', 'hb-vsg-generate', '✨ Generate Script');
  gen.type = 'button';
  wrap.appendChild(gen);

  const progress = el('div', 'hb-vsg-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-vsg-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-vsg-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  const resultCard = el('div', 'hb-vsg-result');
  resultCard.hidden = true;
  resultCard.appendChild(el('p', 'hb-vsg-result__title', '✨ Your script'));
  const resText = el('div', 'hb-vsg-result__text');
  resultCard.appendChild(resText);
  const copyBtn = el('button', 'hb-vsg-copy', '📋 Copy');
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
      hint.textContent = 'Key saved for ' + providerName(p) + '. Nothing runs until you click Generate Script.';
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
    gen.textContent = 'Generating script…';
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
