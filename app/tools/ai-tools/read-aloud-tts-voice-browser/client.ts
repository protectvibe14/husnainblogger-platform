/**
 * client.ts — Read-Aloud TTS (tool-512), Lane A.
 *
 * No AI model: uses the browser's built-in Web Speech API
 * (window.speechSynthesis). Voices are loaded from the device via
 * getVoices()/voiceschanged; rate 0.5–2, pitch 0–2; Speak/Stop buttons.
 * Honest about device-varying voices and browser limitations.
 */
import type { AiClientContext } from '../../../src/lib/ai/types.ts';
import {
  validateInputs,
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

  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  // --- text ----------------------------------------------------------------
  const textLabel = el('label', 'hb-ai-label', 'Text to read aloud *');
  textLabel.htmlFor = 'hb-ai-read-text';
  root.appendChild(textLabel);
  const textInput = el('textarea', 'hb-ai-textarea') as HTMLTextAreaElement;
  textInput.id = 'hb-ai-read-text';
  textInput.rows = 8;
  textInput.placeholder = 'Paste the text you want to hear — up to ' + MAX_TEXT_CHARS + ' characters…';
  root.appendChild(textInput);
  const charCount = el('p', 'hb-ai-status', '0 / ' + MAX_TEXT_CHARS);
  root.appendChild(charCount);
  textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length + ' / ' + MAX_TEXT_CHARS;
  });

  // --- voice ---------------------------------------------------------------
  const voiceLabel = el('label', 'hb-ai-label', 'Voice');
  voiceLabel.htmlFor = 'hb-ai-read-voice';
  root.appendChild(voiceLabel);
  const voiceSel = el('select', 'hb-ai-select');
  voiceSel.id = 'hb-ai-read-voice';
  root.appendChild(voiceSel);
  const voiceNote = el('p', 'hb-ai-status', 'Loading voices from your device…');
  root.appendChild(voiceNote);

  // --- rate -----------------------------------------------------------------
  const rateLabel = el('label', 'hb-ai-label', 'Rate: 1');
  rateLabel.htmlFor = 'hb-ai-read-rate';
  root.appendChild(rateLabel);
  const rateInput = el('input', 'hb-ai-input') as HTMLInputElement;
  rateInput.type = 'range';
  rateInput.id = 'hb-ai-read-rate';
  rateInput.min = String(RATE_MIN);
  rateInput.max = String(RATE_MAX);
  rateInput.step = '0.1';
  rateInput.value = '1';
  rateInput.setAttribute('aria-label', 'Speech rate, 0.5 slow to 2 fast');
  root.appendChild(rateInput);
  rateInput.addEventListener('input', () => {
    rateLabel.textContent = 'Rate: ' + rateInput.value;
  });

  // --- pitch -----------------------------------------------------------------
  const pitchLabel = el('label', 'hb-ai-label', 'Pitch: 1');
  pitchLabel.htmlFor = 'hb-ai-read-pitch';
  root.appendChild(pitchLabel);
  const pitchInput = el('input', 'hb-ai-input') as HTMLInputElement;
  pitchInput.type = 'range';
  pitchInput.id = 'hb-ai-read-pitch';
  pitchInput.min = String(PITCH_MIN);
  pitchInput.max = String(PITCH_MAX);
  pitchInput.step = '0.1';
  pitchInput.value = '1';
  pitchInput.setAttribute('aria-label', 'Speech pitch, 0 low to 2 high');
  root.appendChild(pitchInput);
  pitchInput.addEventListener('input', () => {
    pitchLabel.textContent = 'Pitch: ' + pitchInput.value;
  });

  // --- actions ----------------------------------------------------------------
  const actions = el('div', 'hb-ai-actions');
  const speakBtn = el('button', 'hb-btn hb-btn--primary', 'Speak');
  speakBtn.type = 'button';
  const stopBtn = el('button', 'hb-btn hb-btn--ghost', 'Stop');
  stopBtn.type = 'button';
  stopBtn.disabled = true;
  actions.appendChild(speakBtn);
  actions.appendChild(stopBtn);
  root.appendChild(actions);

  const status = el('p', 'hb-ai-status');
  root.appendChild(status);

  const errBox = el('div', 'hb-ai-error');
  errBox.hidden = true;
  errBox.setAttribute('role', 'alert');
  root.appendChild(errBox);

  function showError(msg: string): void {
    errBox.textContent = msg;
    errBox.hidden = false;
  }

  // --- voices ------------------------------------------------------------------
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

  // --- speak --------------------------------------------------------------------
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
