/**
 * client.ts — AI Content Repurposer, Lane B (redesigned).
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
    id: 'content',
    label: 'Original content',
    kind: 'textarea',
    required: true,
    placeholder: 'Paste your blog post, script, or transcript (100–8,000 characters)',
    rows: 6,
  },
  {
    id: 'source',
    label: 'Source format',
    kind: 'select',
    required: true,
    options: [
      { value: 'blog-post', label: 'Blog post' },
      { value: 'video-script', label: 'Video script' },
      { value: 'podcast-transcript', label: 'Podcast transcript' },
      { value: 'newsletter', label: 'Newsletter' },
    ],
  },
  {
    id: 'target',
    label: 'Repurpose into',
    kind: 'select',
    required: true,
    options: [
      { value: 'twitter-thread', label: 'X/Twitter thread' },
      { value: 'linkedin-post', label: 'LinkedIn post' },
      { value: 'instagram-carousel', label: 'Instagram carousel outline' },
      { value: 'email-newsletter', label: 'Email newsletter' },
      { value: 'tiktok-script', label: 'TikTok script' },
    ],
  },
];

const SAMPLE: Record<string, string> = {
  content: 'Starting a freelance business is easier than most people think. First, pick one skill you are already good at. Second, package it as a simple offer with a clear outcome. Third, reach out to 10 potential clients every day. Consistency beats talent.',
  source: 'blog-post',
  target: 'twitter-thread',
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
    .hb-cr-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-cr-header {
      background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-cr-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-cr-header p { margin: 0; font-size: 14px; opacity: .9; }
    .hb-cr-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-cr-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-cr-input, .hb-cr-textarea, .hb-cr-select {
      width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
      border: 2px solid #e2e8f0; border-radius: 10px; background: #fff;
      box-sizing: border-box;
    }
    .hb-cr-textarea { resize: vertical; min-height: 110px; }
    .hb-cr-input:focus, .hb-cr-textarea:focus, .hb-cr-select:focus {
      outline: none; border-color: #ec4899;
    }
    .hb-cr-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-cr-sample {
      font-size: 13px; color: #ec4899; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-cr-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #ec4899 0%, #f59e0b 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-cr-generate:hover:not(:disabled) { opacity: .92; }
    .hb-cr-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-cr-progress {
      height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;
    }
    .hb-cr-progress > div {
      height: 100%; background: linear-gradient(90deg, #ec4899 0%, #f59e0b);
      width: 0%; transition: width .3s;
    }
    .hb-cr-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-cr-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-cr-result-card {
      background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);
      border-radius: 14px; padding: 20px;
    }
    .hb-cr-result-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-cr-result-text {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
      padding: 16px; font-size: 15px; line-height: 1.7; color: #1e293b;
      white-space: pre-wrap; word-break: break-word; max-height: 480px; overflow-y: auto;
    }
    .hb-cr-actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
    .hb-cr-copy {
      padding: 12px 24px; background: #16a34a; color: #fff; border: none;
      border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer;
    }
    .hb-cr-copy:hover { background: #15803d; }
    @media (max-width: 640px) {
      .hb-cr-header { padding: 18px; }
      .hb-cr-header h3 { font-size: 18px; }
      .hb-cr-card, .hb-cr-result-card { padding: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-cr-wrap');
  root.appendChild(wrap);

  // --- header ---------------------------------------------------------------
  const header = el('div', 'hb-cr-header');
  header.appendChild(el('h3', '', '♻️ AI Content Repurposer'));
  header.appendChild(el('p', '', 'Turn one blog post, script or transcript into platform-native posts in seconds — one idea, five formats. Uses YOUR free Gemini/Groq/OpenRouter key.'));
  wrap.appendChild(header);

  // --- key vault card -------------------------------------------------------
  const vaultCard = el('div', 'hb-cr-card');
  wrap.appendChild(vaultCard);
  renderKeyVault(vaultCard, {
    providers,
    intro: 'Pick a provider and paste your free key. The tool does nothing until you do.',
  });

  // --- provider card --------------------------------------------------------
  const provCard = el('div', 'hb-cr-card');
  const provLabel = el('label', 'hb-cr-label', '🤖 Provider');
  provLabel.htmlFor = 'hb-ai-provider';
  provCard.appendChild(provLabel);
  const provSel = el('select', 'hb-cr-select');
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
  const hint = el('p', 'hb-cr-hint');
  provCard.appendChild(hint);
  wrap.appendChild(provCard);

  // --- input cards ----------------------------------------------------------
  const controls: Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = {};
  for (const f of FIELDS) {
    const card = el('div', 'hb-cr-card');
    const label = el('label', 'hb-cr-label', f.label + (f.required ? ' *' : ''));
    label.htmlFor = 'hb-ai-' + f.id;
    card.appendChild(label);
    let control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (f.kind === 'textarea') {
      const ta = el('textarea', 'hb-cr-textarea');
      ta.rows = f.rows ?? 4;
      if (f.placeholder) ta.placeholder = f.placeholder;
      control = ta;
    } else if (f.kind === 'select') {
      const sel = el('select', 'hb-cr-select');
      for (const o of f.options ?? []) {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.label;
        sel.appendChild(opt);
      }
      control = sel;
    } else {
      const inp = el('input', 'hb-cr-input');
      inp.type = 'text';
      if (f.placeholder) inp.placeholder = f.placeholder;
      control = inp;
    }
    control.id = 'hb-ai-' + f.id;
    controls[f.id] = control;
    card.appendChild(control);
    if (f.hint) card.appendChild(el('p', 'hb-cr-hint', f.hint));
    if (f.id === 'content') {
      const sampleBtn = el('button', 'hb-cr-sample', '✨ Try a sample');
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
  const gen = el('button', 'hb-cr-generate', '✨ Repurpose Content');
  gen.type = 'button';
  wrap.appendChild(gen);

  const progress = el('div', 'hb-cr-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-cr-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-cr-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result -----------------------------------------------------------------
  const resCard = el('div', 'hb-cr-result-card');
  resCard.hidden = true;
  resCard.appendChild(el('p', 'hb-cr-result-title', '🔄 Repurposed content'));
  const resText = el('div', 'hb-cr-result-text');
  resCard.appendChild(resText);
  const actions = el('div', 'hb-cr-actions');
  const copyBtn = el('button', 'hb-cr-copy', '📋 Copy content');
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
        copyBtn.textContent = '📋 Copy content';
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
      setProgress(0.7, 'Writing…');

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
      status.textContent = 'Done — your content is repackaged and ready to post.';
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
