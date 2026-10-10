/**
 * client.ts — LinkedIn Headline & About Writer, Lane B (redesigned).
 *
 * Flow: gradient header -> key-vault card -> provider card -> role card ->
 * skills card (with "Try a sample") -> big gradient Generate button ->
 * progress/status -> result card + Copy button. Errors surface through
 * humanizeFetchError / humanizeHttpStatus. Keys are never logged and are
 * sent only to the chosen provider. User text is injected via textContent
 * only.
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

const SAMPLE_ROLE = 'Data Analyst';
const SAMPLE_SKILLS = 'SQL, Python, Tableau, stakeholder reporting';

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
    .hb-li-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-li-header {
      background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-li-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-li-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-li-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-li-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-li-input {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px; box-sizing: border-box;
      font-family: inherit;
    }
    .hb-li-input:focus { outline: none; border-color: #0a66c2; }
    .hb-li-textarea {
      width: 100%; min-height: 90px; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical;
      font-family: inherit; box-sizing: border-box;
    }
    .hb-li-textarea:focus { outline: none; border-color: #0a66c2; }
    .hb-li-select {
      width: 100%; padding: 12px; font-size: 15px; border: 2px solid #e2e8f0;
      border-radius: 10px; background: #fff; box-sizing: border-box;
    }
    .hb-li-select:focus { outline: none; border-color: #0a66c2; }
    .hb-li-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-li-sample {
      font-size: 13px; color: #0a66c2; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 8px 0 0;
    }
    .hb-li-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #0a66c2 0%, #004182 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-li-generate:hover:not(:disabled) { opacity: .92; }
    .hb-li-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-li-progress {
      height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden;
    }
    .hb-li-progress > div {
      height: 100%; width: 40%; border-radius: 5px;
      background: linear-gradient(90deg, #0a66c2, #004182);
      animation: hb-li-slide 1.2s ease-in-out infinite;
    }
    @keyframes hb-li-slide {
      0% { margin-left: -40%; } 100% { margin-left: 100%; }
    }
    .hb-li-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-li-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-li-result {
      background: linear-gradient(135deg, #eff6ff 0%, #f0f4ff 100%);
      border: 1px solid #bfdbfe; border-radius: 14px; padding: 20px;
    }
    .hb-li-result h4 { margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-li-result__text {
      font-size: 15px; line-height: 1.65; color: #1e293b; white-space: pre-wrap;
      word-break: break-word;
    }
    .hb-li-copy {
      margin-top: 14px; padding: 10px 24px; background: #0a66c2; color: #fff;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer;
    }
    .hb-li-copy:hover { background: #084d92; }
    @media (max-width: 640px) {
      .hb-li-header { padding: 18px; }
      .hb-li-card { padding: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-li-wrap');
  root.appendChild(wrap);

  // --- header -----------------------------------------------------------------
  const header = el('div', 'hb-li-header');
  header.appendChild(el('h3', '', '💼 LinkedIn Headline Writer'));
  header.appendChild(
    el('p', '', 'Uses YOUR free Gemini/Groq/OpenRouter key — nothing runs until you paste one.'),
  );
  wrap.appendChild(header);

  // --- key vault --------------------------------------------------------------
  const vaultCard = el('div', 'hb-li-card');
  vaultCard.appendChild(el('span', 'hb-li-label', '🔑 Your API key'));
  const vault = el('div', '');
  vaultCard.appendChild(vault);
  wrap.appendChild(vaultCard);
  renderKeyVault(vault, {
    providers,
    intro: 'Pick a provider and paste your free key. The tool does nothing until you do.',
  });

  // --- provider card ------------------------------------------------------------
  const provCard = el('div', 'hb-li-card');
  const provLabel = el('label', 'hb-li-label', '⚙️ Provider');
  provLabel.htmlFor = 'hb-ai-li-provider';
  provCard.appendChild(provLabel);
  const provSel = el('select', 'hb-li-select') as HTMLSelectElement;
  provSel.id = 'hb-ai-li-provider';
  for (const pid of providers) {
    const info = getProviderInfo(pid);
    const opt = document.createElement('option');
    opt.value = pid;
    opt.textContent =
      (info ? info.name : pid) + (pid === 'llm7' ? ' — no key needed (community demo)' : '');
    provSel.appendChild(opt);
  }
  provCard.appendChild(provSel);
  const hint = el('p', 'hb-li-hint');
  provCard.appendChild(hint);
  wrap.appendChild(provCard);

  // --- role card ------------------------------------------------------------------
  const roleCard = el('div', 'hb-li-card');
  const roleLabel = el('label', 'hb-li-label', '🎯 Current or target role *');
  roleLabel.htmlFor = 'hb-ai-li-role';
  roleCard.appendChild(roleLabel);
  const roleInput = el('input', 'hb-li-input') as HTMLInputElement;
  roleInput.type = 'text';
  roleInput.id = 'hb-ai-li-role';
  roleInput.placeholder = 'e.g. Data Analyst';
  roleCard.appendChild(roleInput);
  wrap.appendChild(roleCard);

  // --- skills card ------------------------------------------------------------------
  const skillsCard = el('div', 'hb-li-card');
  const skillsLabel = el('label', 'hb-li-label', '🛠️ Skills (comma-separated) *');
  skillsLabel.htmlFor = 'hb-ai-li-skills';
  skillsCard.appendChild(skillsLabel);
  const skillsArea = el('textarea', 'hb-li-textarea') as HTMLTextAreaElement;
  skillsArea.id = 'hb-ai-li-skills';
  skillsArea.rows = 3;
  skillsArea.placeholder = 'e.g. SQL, Python, Tableau, stakeholder reporting';
  skillsCard.appendChild(skillsArea);
  const sampleBtn = el('button', 'hb-li-sample', '✨ Try a sample profile');
  sampleBtn.type = 'button';
  sampleBtn.addEventListener('click', () => {
    roleInput.value = SAMPLE_ROLE;
    skillsArea.value = SAMPLE_SKILLS;
  });
  skillsCard.appendChild(sampleBtn);
  wrap.appendChild(skillsCard);

  // --- generate -----------------------------------------------------------------------
  const genBtn = el('button', 'hb-li-generate', '✍️ Write my headlines');
  genBtn.type = 'button';
  wrap.appendChild(genBtn);

  const progress = el('div', 'hb-li-progress');
  progress.hidden = true;
  progress.appendChild(el('div', ''));
  wrap.appendChild(progress);

  const status = el('p', 'hb-li-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-li-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  // --- result -----------------------------------------------------------------------------
  const resBox = el('div', 'hb-li-result');
  resBox.hidden = true;
  resBox.appendChild(el('h4', '', '📋 Your headlines & About draft'));
  const resText = el('div', 'hb-li-result__text');
  resBox.appendChild(resText);
  const copyBtn = el('button', 'hb-li-copy', '⧉ Copy all');
  copyBtn.type = 'button';
  resBox.appendChild(copyBtn);
  wrap.appendChild(resBox);

  // --- state ------------------------------------------------------------------------------
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
    if (getKey(p)) {
      hint.textContent =
        'Key saved for ' + providerName(p) + '. Nothing runs until you click Write my headlines.';
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
        copyBtn.textContent = '⧉ Copy all';
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
    const role = roleInput.value.trim();
    const skills = skillsArea.value.trim();

    const v = validateInputs({ role, skills });
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

    const prompt = buildPrompts({ role, skills });
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
    showProgress('Writing with ' + providerName(p) + '…');
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
