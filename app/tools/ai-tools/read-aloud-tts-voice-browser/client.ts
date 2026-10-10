/**
 * client.ts — Read-Aloud TTS (redesigned, tool-512), Lane A.
 *
 * No AI model: uses the browser's built-in Web Speech API
 * (window.speechSynthesis). Voices are loaded from the device via
 * getVoices()/voiceschanged; rate 0.5–2, pitch 0–2; Speak/Stop buttons.
 * Honest about device-varying voices and browser limitations.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import {
  validateInputs,
  getDisclosures,
  MAX_TEXT_CHARS,
  RATE_MIN,
  RATE_MAX,
  PITCH_MIN,
  PITCH_MAX,
} from './logic.ts';

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

  const style = document.createElement('style');
  style.textContent = `
    .hb-read-wrap { display: flex; flex-direction: column; gap: 16px; }
    .hb-read-header {
      background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-read-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-read-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-read-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px;
    }
    .hb-read-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
    .hb-read-textarea {
      width: 100%; min-height: 150px; padding: 14px; font-size: 15px; line-height: 1.6;
      border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical;
      font-family: inherit; box-sizing: border-box; color: #1e293b;
    }
    .hb-read-textarea:focus { outline: none; border-color: #ea580c; }
    .hb-read-count { font-size: 12px; color: #94a3b8; text-align: right; margin: 4px 0 0; }
    .hb-read-sample { font-size: 13px; color: #ea580c; background: none; border: none; cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px; }
    .hb-read-select {
      width: 100%; padding: 12px; font-size: 15px; border: 2px solid #e2e8f0;
      border-radius: 10px; background: #fff; box-sizing: border-box; color: #1e293b;
    }
    .hb-read-select:focus { outline: none; border-color: #ea580c; }
    .hb-read-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-read-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media (max-width: 640px) { .hb-read-grid { grid-template-columns: 1fr; } }
    .hb-read-slider-row { display: flex; align-items: center; gap: 12px; }
    .hb-read-slider { flex: 1; accent-color: #ea580c; height: 6px; }
    .hb-read-slider-val {
      font-size: 15px; font-weight: 700; color: #ea580c; min-width: 52px;
      text-align: center; background: #fff7ed; padding: 6px 10px; border-radius: 8px;
    }
    .hb-read-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .hb-read-speak {
      flex: 1; min-width: 200px; padding: 16px; font-size: 18px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
      border: none; border-radius: 12px; cursor: pointer;
    }
    .hb-read-speak:hover:not(:disabled) { opacity: .92; }
    .hb-read-speak:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-read-stop {
      padding: 16px 28px; font-size: 16px; font-weight: 700; color: #64748b;
      background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; cursor: pointer;
    }
    .hb-read-stop:hover:not(:disabled) { border-color: #f43f5e; color: #f43f5e; }
    .hb-read-stop:disabled { opacity: .5; cursor: not-allowed; }
    .hb-read-status { font-size: 14px; color: #475569; margin: 0; text-align: center; }
    .hb-read-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-read-note { font-size: 12px; color: #94a3b8; margin: 0; line-height: 1.6; }
    @media (max-width: 640px) { .hb-read-header { padding: 18px; } }
  `;
  root.appendChild(style);

  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const wrap = el('div', 'hb-read-wrap');
  root.appendChild(wrap);

  // --- header --------------------------------------------------------------------
  const header = el('div', 'hb-read-header');
  header.appendChild(el('h3', '', '🔊 Read Aloud'));
  header.appendChild(el('p', '', 'Hear any text spoken in your device’s own voices — instant, no downloads, no accounts, nothing uploaded.'));
  wrap.appendChild(header);

  // --- text card -------------------------------------------------------------------
  const textCard = el('div', 'hb-read-card');
  const textLabel = el('label', 'hb-read-label', '✍️ Text to read aloud');
  textLabel.htmlFor = 'hb-ai-read-text';
  textCard.appendChild(textLabel);
  const textInput = el('textarea', 'hb-read-textarea') as HTMLTextAreaElement;
  textInput.id = 'hb-ai-read-text';
  textInput.rows = 6;
  textInput.maxLength = MAX_TEXT_CHARS + 100;
  textInput.placeholder = 'Paste an article, a story, your notes — up to ' + MAX_TEXT_CHARS.toLocaleString('en-US') + ' characters…';
  textCard.appendChild(textInput);
  const charCount = el('p', 'hb-read-count', '0 / ' + MAX_TEXT_CHARS.toLocaleString('en-US'));
  textCard.appendChild(charCount);
  const sampleBtn = el('button', 'hb-read-sample', '✨ Try a sample text') as HTMLButtonElement;
  sampleBtn.type = 'button';
  sampleBtn.addEventListener('click', () => {
    textInput.value = 'Welcome to Read Aloud! Paste any text here — an article, your notes, a bedtime story — and hear it spoken in a natural voice from your own device. Adjust the rate and pitch sliders to find a sound you love.';
    textInput.dispatchEvent(new Event('input'));
  });
  textCard.appendChild(sampleBtn);
  wrap.appendChild(textCard);

  // --- voice + rate/pitch -------------------------------------------------------------
  const grid = el('div', 'hb-read-grid');

  const voiceCard = el('div', 'hb-read-card');
  const voiceLabel = el('label', 'hb-read-label', '🎭 Voice');
  voiceLabel.htmlFor = 'hb-ai-read-voice';
  voiceCard.appendChild(voiceLabel);
  const voiceSel = el('select', 'hb-read-select') as HTMLSelectElement;
  voiceSel.id = 'hb-ai-read-voice';
  voiceCard.appendChild(voiceSel);
  const voiceNote = el('p', 'hb-read-hint', 'Loading voices from your device…');
  voiceCard.appendChild(voiceNote);
  grid.appendChild(voiceCard);

  const tuneCard = el('div', 'hb-read-card');
  const rateLabel = el('label', 'hb-read-label', '⚡ Rate');
  rateLabel.htmlFor = 'hb-ai-read-rate';
  tuneCard.appendChild(rateLabel);
  const rateRow = el('div', 'hb-read-slider-row');
  const rateInput = el('input', 'hb-read-slider') as HTMLInputElement;
  rateInput.type = 'range';
  rateInput.id = 'hb-ai-read-rate';
  rateInput.min = String(RATE_MIN);
  rateInput.max = String(RATE_MAX);
  rateInput.step = '0.1';
  rateInput.value = '1';
  rateInput.setAttribute('aria-label', 'Speech rate, 0.5 slow to 2 fast');
  const rateVal = el('span', 'hb-read-slider-val', '1.0×');
  rateRow.append(rateInput, rateVal);
  tuneCard.appendChild(rateRow);
  const pitchLabel = el('label', 'hb-read-label', '🎵 Pitch');
  pitchLabel.htmlFor = 'hb-ai-read-pitch';
  pitchLabel.style.marginTop = '12px';
  tuneCard.appendChild(pitchLabel);
  const pitchRow = el('div', 'hb-read-slider-row');
  const pitchInput = el('input', 'hb-read-slider') as HTMLInputElement;
  pitchInput.type = 'range';
  pitchInput.id = 'hb-ai-read-pitch';
  pitchInput.min = String(PITCH_MIN);
  pitchInput.max = String(PITCH_MAX);
  pitchInput.step = '0.1';
  pitchInput.value = '1';
  pitchInput.setAttribute('aria-label', 'Speech pitch, 0 low to 2 high');
  const pitchVal = el('span', 'hb-read-slider-val', '1.0×');
  pitchRow.append(pitchInput, pitchVal);
  tuneCard.appendChild(pitchRow);
  tuneCard.appendChild(el('p', 'hb-read-hint', 'Rate: 0.5× slow & calm → 2× fast & energetic. Pitch: 0 low → 2 high.'));
  grid.appendChild(tuneCard);
  wrap.appendChild(grid);

  // --- actions ---------------------------------------------------------------------------
  const actions = el('div', 'hb-read-actions');
  const speakBtn = el('button', 'hb-read-speak', '🔊 Speak') as HTMLButtonElement;
  speakBtn.type = 'button';
  const stopBtn = el('button', 'hb-read-stop', '⏹ Stop') as HTMLButtonElement;
  stopBtn.type = 'button';
  stopBtn.disabled = true;
  actions.append(speakBtn, stopBtn);
  wrap.appendChild(actions);

  const status = el('p', 'hb-read-status');
  wrap.appendChild(status);

  const errBox = el('div', 'hb-read-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  wrap.appendChild(errBox);

  const note = el('p', 'hb-read-note', getDisclosures().join(' '));
  wrap.appendChild(note);

  function showError(msg: string): void {
    errBox.textContent = msg;
    errBox.hidden = false;
  }

  textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length.toLocaleString('en-US') + ' / ' + MAX_TEXT_CHARS.toLocaleString('en-US');
  });
  rateInput.addEventListener('input', () => {
    rateVal.textContent = Number(rateInput.value).toFixed(1) + '×';
  });
  pitchInput.addEventListener('input', () => {
    pitchVal.textContent = Number(pitchInput.value).toFixed(1) + '×';
  });

  // --- voices ------------------------------------------------------------------------------
  let voices: SpeechSynthesisVoice[] = [];

  function refreshVoices(): void {
    voices = window.speechSynthesis.getVoices();
    voiceSel.innerHTML = '';
    if (!voices.length) {
      voiceNote.textContent = 'No voices found on this device yet.';
      return;
    }
    const auto = document.createElement('option');
    auto.value = '';
    auto.textContent = 'Default voice';
    voiceSel.appendChild(auto);
    for (const v of voices) {
      const o = document.createElement('option');
      o.value = v.voiceURI;
      o.textContent = v.name + ' (' + v.lang + ')' + (v.localService ? '' : ' — network');
      voiceSel.appendChild(o);
    }
    voiceNote.textContent =
      voices.length + ' voice' + (voices.length === 1 ? '' : 's') +
      ' found on your device. “Network” voices need an internet connection to your OS provider.';
  }

  if (supported) {
    refreshVoices();
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
  } else {
    voiceNote.textContent = '';
    showError('Your browser does not support speech synthesis — try a current version of Chrome, Edge, Firefox or Safari.');
    speakBtn.disabled = true;
  }

  // --- speak ----------------------------------------------------------------------------------
  speakBtn.addEventListener('click', () => {
    errBox.hidden = true;
    if (!supported) return;
    const v = validateInputs({
      text: textInput.value,
      rate: Number(rateInput.value),
      pitch: Number(pitchInput.value),
    });
    if (!v.ok) {
      showError(v.errors.join(' '));
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(textInput.value.trim());
    const chosen = voices.find((x) => x.voiceURI === voiceSel.value);
    if (chosen) utter.voice = chosen;
    utter.rate = Number(rateInput.value);
    utter.pitch = Number(pitchInput.value);
    utter.onend = () => {
      stopBtn.disabled = true;
      speakBtn.disabled = false;
      status.textContent = 'Finished.';
    };
    utter.onerror = (e) => {
      stopBtn.disabled = true;
      speakBtn.disabled = false;
      if ((e as SpeechSynthesisErrorEvent).error !== 'interrupted') {
        showError('Speech failed (' + (e as SpeechSynthesisErrorEvent).error + '). Try a shorter text or another voice.');
      }
    };
    window.speechSynthesis.speak(utter);
    stopBtn.disabled = false;
    speakBtn.disabled = true;
    status.textContent = 'Speaking…';
  });

  stopBtn.addEventListener('click', () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    stopBtn.disabled = true;
    speakBtn.disabled = false;
    status.textContent = 'Stopped.';
  });
}
