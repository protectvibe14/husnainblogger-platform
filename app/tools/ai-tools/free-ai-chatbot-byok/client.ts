/**
 * client.ts — Free AI Chatbot (BYOK), Lane B (redesigned).
 *
 * Flow: gradient header -> key-vault card -> provider card -> message card
 * (with "Try a sample") -> big gradient Generate button -> progress/status
 * -> result card + Copy button. Errors surface through humanizeFetchError /
 * humanizeHttpStatus. Keys are never logged and are sent only to the chosen
 * provider. User text is injected via textContent only.
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

const SAMPLE_MESSAGE = 'Explain compound interest in simple terms';

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

  // --- styles ---------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-chat-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-chat-header {
      background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-chat-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-chat-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-chat-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-chat-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-chat-textarea {
      width: 100%; min-height: 120px; padding: 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical;
      font-family: inherit; box-sizing: border-box;
    }
    .hb-chat-textarea:focus { outline: none; border-color: #0284c7; }
    .hb-chat-select {
      width: 100%; padding: 12px; font-size: 15px; border: 2px solid #e2e8f0;
      border-radius: 10px; background: #fff; box-sizing: border-box;
    }
    .hb-chat-select:focus { outline: none; border-color: #0284c7; }
    .hb-chat-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-chat-sample {
      font-size: 13px; color: #0284c7; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 8px 0 0;
    }
    .hb-chat-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-chat-generate:hover:not(:disabled) { opacity: .92; }
    .hb-chat-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-chat-progress {
      height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;
    }
    .hb-chat-progress > div {
      height: 100%; width: 40%; border-radius: 5px;
      background: linear-gradient(90deg, #0284c7, #4f46e5);
      animation: hb-chat-slide 1.2s ease-in-out infinite;
    }
    @keyframes hb-chat-slide {
      0% { margin-left: -40%; } 100% { margin-left: 100%; }
    }
    .hb-chat-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-chat-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-chat-result {
      background: linear-gradient(135deg, #f0f9ff 0%, #eef2ff 100%);
      border: 1px solid #c7d2fe; border-radius: 14px; padding: 20px;
    }
    .hb-chat-result h4 { margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-chat-result__text {
      font-size: 15px; line-height: 1.65; color: #1e293b; white-space: pre-wrap;
      word-break: break-word;
    }
    .hb-chat-copy {
      margin-top: 14px; padding: 10px 24px; background: #4f46e5; color: #fff;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;
    }
    .hb-chat-copy:hover { background: #4338ca; }
    @media (max-width: 640px) {
      .hb-chat-header { padding: 18px; }
      .hb-chat-card { padding: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-chat-wrap');
  root.appendChild(wrap);

  // --- header -----------------------------------------------------------------
  const header = el('div', 'hb-chat-header');
  header.appendChild(el('h3', '', '💬 AI Chatbot Free (BYOK)'));
  header.appendChild(
    el('p', '', 'Uses YOUR free Gemini/Groq/OpenRouter key — or the keyless llm7.io demo lane. Nothing runs until you choose.'),
  );
  wrap.appendChild(header);

  // --- key vault --------------------------------------------------------------
  const vaultCard = el('div', 'hb-chat-card');
  const vaultLabel = el('span', 'hb-chat-label', '🔑 Your API key');
  vaultCard.appendChild(vaultLabel);
  const vault = el('div', '');
  vaultCard.appendChild(vault);
  wrap.appendChild(vaultCard);
  renderKeyVault(vault, {
    providers,
    intro:
      'Pick a provider and paste your free key — or use the keyless llm7.io demo lane below (community-run, no SLA).',
  });

  // --- provider card ------------------------------------------------------------
  const provCard = el('div', 'hb-chat-card');
  const provLabel = el('label', 'hb-chat-label', '⚙️ Provider');
  provLabel.htmlFor = 'hb-ai-chat-provider';
  provCard.appendChild(provLabel);
  const provSel = el('select', 'hb-chat-select') as HTMLSelectElement;
  provSel.id = 'hb-ai-chat-provider';
  for (const pid of providers) {
    const info = getProviderInfo(pid);
    const opt = document.createElement('option');
    opt.value = pid;
    opt.textContent =
      (info ? info.name : pid) + (pid === 'llm7' ? ' — no key needed (community demo)' : '');
    provSel.appendChild(opt);
  }
  provCard.appendChild(provSel);
  const hint = el('p', 'hb-chat-hint');
  provCard.appendChild(hint);
  wrap.appendChild(provCard);

  // --- message card ---------------------------------------------------------------
  const msgCard = el('div', 'hb-chat-card');
  const msgLabel = el('label', 'hb-chat-label', '✍️ Your message *');
  msgLabel.htmlFor = 'hb-ai-chat-message';
  msgCard.appendChild(msgLabel);
  const msgArea = el('textarea', 'hb-chat-textarea') as HTMLTextAreaElement;
  msgArea.id = 'hb-ai-chat-message';
  msgArea.rows = 5;
  msgArea.placeholder = 'e.g. Explain compound interest in simple terms';
  msgCard.appendChild(msgArea);
  const sampleBtn = el('button', 'hb-chat-sample', '✨ Try a sample message');
  sampleBtn.type = 'button';
  sampleBtn.addEventListener('click', () => {
    msgArea.value = SAMPLE_MESSAGE;
  });
  msgCard.appendChild(sampleBtn);
  wrap.appendChild(msgCard);

  // --- generate ---------------------------------------------------------------------
  const genBtn = el('button', 'hb-chat-generate', '💬 Get AI reply');
  genBtn.type = 'button';
  wrap.appendChild(genBtn);

  const progress = el('div', 'hb-chat-progress');
  progress.hidden = true;
  progress.appendChild(el('div', ''));
  wrap.appendChild(progress);

  const status = el('p', 'hb-chat-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-chat-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result ---------------------------------------------------------------------------
  const resBox = el('div', 'hb-chat-result');
  resBox.hidden = true;
  resBox.appendChild(el('h4', '', '🤖 AI reply'));
  const resText = el('div', 'hb-chat-result__text');
  resBox.appendChild(resText);
  const copyBtn = el('button', 'hb-chat-copy', '⧉ Copy reply');
  copyBtn.type = 'button';
  resBox.appendChild(copyBtn);
  wrap.appendChild(resBox);

  // --- state ----------------------------------------------------------------------------
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
    genBtn.disabled = !canGenerate();
    if (p === 'llm7') {
      hint.textContent =
        'Using the keyless llm7.io demo lane (community-run, no SLA). For higher limits, pick a key provider and save your free key above.';
    } else if (getKey(p)) {
      hint.textContent =
        'Key saved for ' + providerName(p) + '. Nothing runs until you click Get AI reply.';
    } else {
      hint.textContent =
        'Paste your free ' + providerName(p) + ' key above to enable the button — or switch provider.';
    }
  }
  function showError(msg: string): void {
    hideProgress();
    errBox.textContent = msg;
    errBox.hidden = false;
    resBox.hidden = true;
  }
  function showResult(text: string): void {
    errBox.hidden = true;
    resText.textContent = text;
    resBox.hidden = false;
    resBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function showProgress(label: string): void {
    progress.hidden = false;
    status.textContent = label;
  }
  function hideProgress(): void {
    progress.hidden = true;
    status.textContent = '';
  }

  provSel.addEventListener('change', refresh);
  onKeyChange(() => refresh());

  copyBtn.addEventListener('click', () => {
    const text = resText.textContent ?? '';
    const done = (): void => {
      copyBtn.textContent = 'Copied ✓';
      window.setTimeout(() => {
        copyBtn.textContent = '⧉ Copy reply';
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

  genBtn.addEventListener('click', () => {
    void run();
  });

  async function run(): Promise<void> {
    errBox.hidden = true;
    resBox.hidden = true;
    const message = msgArea.value.trim();

    const v = validateInputs({ message });
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

    const prompt = buildPrompts({ message });
    let req;
    try {
      req = buildRequest(p, key ?? '', prompt);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Could not build the request.');
      return;
    }

    genBtn.disabled = true;
    const originalLabel = genBtn.textContent;
    genBtn.textContent = 'Working…';
    showProgress('Asking ' + providerName(p) + '…');
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
      hideProgress();
      showResult(out.data.text);
    } catch (err) {
      showError(humanizeFetchError(err, providerName(p)));
    } finally {
      genBtn.textContent = originalLabel;
      refresh();
    }
  }

  refresh();
}
