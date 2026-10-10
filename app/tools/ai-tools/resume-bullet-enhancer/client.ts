/**
 * client.ts — Resume Bullet Enhancer, Lane B (redesigned).
 *
 * Flow: key-vault card (providers from logic.getProviders()) -> provider
 * select + form -> Generate -> progress + status -> styled result card +
 * Copy button. Errors surface through humanizeFetchError /
 * humanizeHttpStatus. Keys are never logged and are sent only to the
 * chosen provider.
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

const SAMPLE_BULLET =
  'Responsible for managing a team of 4 developers and improving page load times for the checkout flow';
const SAMPLE_ROLE = 'Frontend Developer';

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

  // --- styles ---------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .hb-res-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-res-header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-res-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-res-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-res-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-res-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-res-input, .hb-res-select, .hb-res-textarea {
      width: 100%; padding: 12px 14px; font-size: 15px; font-family: inherit;
      border: 2px solid #e2e8f0; border-radius: 10px; background: #fff;
      box-sizing: border-box; color: #1e293b;
    }
    .hb-res-input:focus, .hb-res-select:focus, .hb-res-textarea:focus {
      outline: none; border-color: #6366f1;
    }
    .hb-res-textarea { min-height: 84px; resize: vertical; }
    .hb-res-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-res-sample {
      font-size: 13px; color: #6366f1; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-res-generate {
      width: 100%; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-res-generate:hover:not(:disabled) { opacity: .92; }
    .hb-res-generate:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-res-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-res-progress > div {
      height: 100%; width: 0%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      transition: width .3s;
    }
    .hb-res-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-res-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-res-result {
      background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
      border: 1px solid #c7d2fe; border-radius: 14px; padding: 20px;
    }
    .hb-res-result h4 { margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #4338ca; }
    .hb-res-result-text {
      background: #fff; border: 1px solid #e0e7ff; border-radius: 10px;
      padding: 16px; font-size: 16px; line-height: 1.6; color: #1e293b;
    }
    .hb-res-copy {
      margin-top: 12px; padding: 10px 24px; font-size: 15px; font-weight: 700;
      background: #4f46e5; color: #fff; border: none; border-radius: 10px; cursor: pointer;
    }
    .hb-res-copy:hover { background: #4338ca; }
    .hb-res-note { font-size: 13px; color: #64748b; margin: 0; }
  `;
  root.appendChild(style);

  const wrap = el('div', 'hb-res-wrap');
  root.appendChild(wrap);

  // --- header -----------------------------------------------------------------
  const header = el('div', 'hb-res-header');
  header.appendChild(el('h3', '', '📝 Resume Bullet Enhancer'));
  header.appendChild(
    el('p', '', 'Turn weak bullets into strong ones — paste a bullet, pick a provider, hit enhance.'),
  );
  wrap.appendChild(header);

  // --- key vault --------------------------------------------------------------
  const vaultCard = el('div', 'hb-res-card');
  vaultCard.appendChild(el('label', 'hb-res-label', '🔑 API key'));
  const vault = el('div', '');
  vaultCard.appendChild(vault);
  renderKeyVault(vault, {
    providers: getProviders(),
    intro: 'Pick a provider and paste your free key. The tool does nothing until you do.',
  });
  wrap.appendChild(vaultCard);

  // --- form card ---------------------------------------------------------------
  const formCard = el('div', 'hb-res-card');
  const providers = getProviders();

  const provLabel = el('label', 'hb-res-label', 'Provider');
  provLabel.htmlFor = 'hb-ai-provider';
  formCard.appendChild(provLabel);
  const provSel = el('select', 'hb-res-select') as HTMLSelectElement;
  provSel.id = 'hb-ai-provider';
  for (const pid of providers) {
    const info = getProviderInfo(pid);
    const opt = document.createElement('option');
    opt.value = pid;
    opt.textContent =
      (info ? info.name : pid) + (pid === 'llm7' ? ' — no key needed (community demo)' : '');
    provSel.appendChild(opt);
  }
  formCard.appendChild(provSel);
  formCard.appendChild(el('p', 'hb-res-hint', 'Your key stays in this browser and is sent only to the provider you pick.'));

  const bulletLabel = el('label', 'hb-res-label', 'Your raw bullet *');
  bulletLabel.htmlFor = 'hb-ai-bullet';
  bulletLabel.style.marginTop = '18px';
  formCard.appendChild(bulletLabel);
  const bulletInput = el('textarea', 'hb-res-textarea') as HTMLTextAreaElement;
  bulletInput.id = 'hb-ai-bullet';
  bulletInput.rows = 3;
  bulletInput.placeholder = 'e.g. Responsible for managing a team and improving page speed';
  formCard.appendChild(bulletInput);

  const roleLabel = el('label', 'hb-res-label', 'Target role (optional)');
  roleLabel.htmlFor = 'hb-ai-role';
  roleLabel.style.marginTop = '18px';
  formCard.appendChild(roleLabel);
  const roleInput = el('input', 'hb-res-input') as HTMLInputElement;
  roleInput.id = 'hb-ai-role';
  roleInput.type = 'text';
  roleInput.placeholder = 'e.g. Frontend Developer';
  formCard.appendChild(roleInput);

  const sampleBtn = el('button', 'hb-res-sample', '✨ Try a sample bullet');
  sampleBtn.type = 'button';
  sampleBtn.addEventListener('click', () => {
    bulletInput.value = SAMPLE_BULLET;
    roleInput.value = SAMPLE_ROLE;
  });
  formCard.appendChild(sampleBtn);
  wrap.appendChild(formCard);

  // --- generate -----------------------------------------------------------------
  const genBtn = el('button', 'hb-res-generate', '✨ Enhance bullet');
  genBtn.type = 'button';
  wrap.appendChild(genBtn);

  const progress = el('div', 'hb-res-progress');
  progress.hidden = true;
  progress.setAttribute('role', 'progressbar');
  const progressBar = el('div', '');
  progress.appendChild(progressBar);
  wrap.appendChild(progress);

  const status = el('p', 'hb-res-status');
  wrap.appendChild(status);

  const hint = el('p', 'hb-res-note');
  hint.style.textAlign = 'center';
  wrap.appendChild(hint);

  const errBox = el('div', 'hb-res-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  const resBox = el('div', 'hb-res-result');
  resBox.hidden = true;
  resBox.appendChild(el('h4', '', '✅ Enhanced bullet'));
  const resText = el('div', 'hb-res-result-text');
  resBox.appendChild(resText);
  const copyBtn = el('button', 'hb-res-copy', 'Copy');
  copyBtn.type = 'button';
  resBox.appendChild(copyBtn);
  wrap.appendChild(resBox);

  // --- state ----------------------------------------------------------------------
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
      hint.textContent = 'Key saved for ' + providerName(p) + '. Nothing runs until you click Enhance.';
    } else {
      hint.textContent =
        'Paste your free ' + providerName(p) + ' key above to enable Enhance — or switch provider.';
    }
  }
  function showError(msg: string): void {
    errBox.textContent = msg;
    errBox.hidden = false;
    resBox.hidden = true;
    hideProgress();
  }
  function showResult(text: string): void {
    errBox.hidden = true;
    resText.textContent = text;
    resBox.hidden = false;
    resBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function setBusy(busy: boolean, msg: string): void {
    progress.hidden = !busy;
    if (busy) {
      progressBar.style.width = '100%';
      progressBar.style.transition = 'width 1.2s ease';
      // Indeterminate shimmer: fill then ease back so it never sits at 100%.
      window.setTimeout(() => {
        progressBar.style.width = '65%';
      }, 400);
    } else {
      progressBar.style.transition = 'width .3s';
      progressBar.style.width = '0%';
    }
    status.textContent = msg;
  }
  function hideProgress(): void {
    setBusy(false, '');
  }

  provSel.addEventListener('change', refresh);
  onKeyChange(() => refresh());

  copyBtn.addEventListener('click', () => {
    const text = resText.textContent ?? '';
    const done = (): void => {
      copyBtn.textContent = 'Copied ✓';
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

  genBtn.addEventListener('click', () => {
    void run();
  });

  async function run(): Promise<void> {
    errBox.hidden = true;
    const values: Record<string, string> = {
      bullet: bulletInput.value.trim(),
      role: roleInput.value.trim(),
    };

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

    genBtn.disabled = true;
    const originalLabel = genBtn.textContent;
    genBtn.textContent = 'Generating…';
    setBusy(true, 'Asking ' + providerName(p) + ' for a stronger bullet…');
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
      hideProgress();
      status.textContent = '';
      refresh();
    }
  }

  refresh();
}
