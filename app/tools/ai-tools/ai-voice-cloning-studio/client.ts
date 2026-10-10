/**
 * AI Voice Cloning Studio — browser client (redesigned) (Lane D, ElevenLabs).
 *
 * Flow: gradient header -> key-vault card (+ Test key) -> step 1 card (upload
 * samples, name, consent, Create voice) -> step 2 card (script + sample +
 * Speak) -> progress + status -> result card (<audio> + Download MP3).
 * Keys are never logged; user text via textContent/value only.
 */

import {
  renderKeyVault,
  onKeyChange,
  getKey,
  humanizeFetchError,
  humanizeHttpStatus,
} from "../../../src/lib/ai/key-vault.ts";
import { getProviderInfo } from "../../../src/lib/ai/providers.ts";
import type { AiClientContext } from "../../../src/lib/ai/types.ts";
import {
  validateAddVoiceInputs,
  validateTtsInputs,
  buildAddVoiceRequest,
  parseAddVoiceResponse,
  buildUserRequest,
  parseUserResponse,
  buildTtsRequest,
  parseTtsStatus,
  classifyFetchError,
} from "./logic.ts";

const ACCENT = "#8b5cf6";
const ACCENT_DARK = "#ec4899";
const ACCENT_SOFT = "rgba(139, 92, 246, .15)";

const SAMPLE_SCRIPT =
  "Hello and welcome to my channel. Today I am testing my brand-new cloned voice — created from just a few minutes of my own speech.";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

export async function mountAiTool(ctx: AiClientContext): Promise<void> {
  const root = ctx.mountEl;
  root.innerHTML = "";

  // --- styles -------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-vc-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-vc-header {
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-vc-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-vc-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-vc-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; }
    .hb-vc-card > h4 { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #1e293b; }
    .hb-vc-label { display: block; font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 8px; }
    .hb-vc-label .hb-vc-req { color: #dc2626; }
    .hb-vc-field { margin-bottom: 16px; }
    .hb-vc-field:last-child { margin-bottom: 0; }
    .hb-vc-input, .hb-vc-textarea {
      width: 100%; padding: 12px 14px; font-size: 15px;
      border: 2px solid #e2e8f0; border-radius: 10px;
      font-family: inherit; box-sizing: border-box; background: #fff; color: #1e293b;
    }
    .hb-vc-textarea { min-height: 120px; resize: vertical; line-height: 1.5; }
    .hb-vc-input:focus, .hb-vc-textarea:focus {
      outline: none; border-color: ${ACCENT}; box-shadow: 0 0 0 3px ${ACCENT_SOFT};
    }
    .hb-vc-input:disabled, .hb-vc-textarea:disabled { background: #f1f5f9; color: #94a3b8; }
    .hb-vc-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-vc-note { font-size: 14px; color: #475569; margin: 10px 0 0; }
    .hb-vc-sample {
      font-size: 13px; color: ${ACCENT}; background: none; border: none;
      cursor: pointer; text-decoration: underline; padding: 0; margin-top: 8px;
    }
    .hb-vc-consent {
      display: flex; gap: 10px; align-items: flex-start; font-size: 14px; color: #334155;
      margin: 12px 0; cursor: pointer; line-height: 1.5;
    }
    .hb-vc-consent input { margin-top: 3px; accent-color: ${ACCENT}; width: 18px; height: 18px; flex-shrink: 0; }
    .hb-vc-btn {
      padding: 14px 28px; font-size: 16px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%);
      border: none; border-radius: 10px; cursor: pointer;
    }
    .hb-vc-btn:hover:not(:disabled) { opacity: .92; }
    .hb-vc-btn:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-vc-ghost {
      padding: 10px 20px; font-size: 14px; font-weight: 600;
      color: ${ACCENT}; background: #faf5ff; border: 2px solid ${ACCENT_SOFT};
      border-radius: 10px; cursor: pointer; margin-top: 12px;
    }
    .hb-vc-ghost:hover:not(:disabled) { background: #f3e8ff; }
    .hb-vc-ghost:disabled { color: #94a3b8; cursor: not-allowed; }
    .hb-vc-progress { height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
    .hb-vc-progress > div {
      height: 100%; width: 30%; border-radius: 5px;
      background: linear-gradient(90deg, ${ACCENT}, ${ACCENT_DARK});
      animation: hb-vc-slide 1.2s ease-in-out infinite;
    }
    @keyframes hb-vc-slide { 0% { margin-left: -30%; } 100% { margin-left: 100%; } }
    .hb-vc-status { font-size: 14px; color: #475569; margin: 0; text-align: center; min-height: 20px; }
    .hb-vc-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-vc-result {
      background: linear-gradient(135deg, #faf5ff 0%, #fdf2f8 100%);
      border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; text-align: center;
    }
    .hb-vc-result h4 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 12px; }
    .hb-vc-result audio { width: 100%; margin-bottom: 12px; }
    .hb-vc-nokey {
      background: #fffbeb; border: 1px solid #fde68a; border-radius: 14px; padding: 20px;
    }
    .hb-vc-nokey h4 { font-size: 16px; font-weight: 700; color: #92400e; margin: 0 0 8px; }
    .hb-vc-nokey p { font-size: 14px; color: #78350f; margin: 0 0 10px; }
    .hb-vc-nokey__link {
      display: inline-block; padding: 10px 20px; background: #f59e0b; color: #fff;
      border-radius: 8px; font-size: 14px; font-weight: 700; text-decoration: none;
    }
    .hb-vc-nokey__link:hover { background: #d97706; }
    .hb-vc-stepnum {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%; color: #fff; font-size: 14px; font-weight: 700;
      background: linear-gradient(135deg, ${ACCENT}, ${ACCENT_DARK}); margin-right: 8px;
    }
    @media (max-width: 640px) {
      .hb-vc-header { padding: 18px; }
      .hb-vc-card { padding: 16px; }
    }
  `;
  root.appendChild(style);

  const wrap = el("div", "hb-vc-wrap");
  root.appendChild(wrap);

  const providerId = "elevenlabs";
  let voiceId: string | null = null;

  // --- header ---------------------------------------------------------------
  const header = el("div", "hb-vc-header");
  header.appendChild(el("h3", "", "🎤 AI Voice Cloning Studio"));
  header.appendChild(
    el("p", "", "Clone your voice with your own ElevenLabs key — upload samples, create the voice, then make it speak."),
  );
  wrap.appendChild(header);

  // --- key vault card ---------------------------------------------------------
  const vaultCard = el("div", "hb-vc-card");
  vaultCard.appendChild(el("h4", "", "🔑 Your ElevenLabs key"));
  const vaultBox = el("div", "");
  vaultCard.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers: [providerId],
    intro: "Voice cloning usually needs a paid ElevenLabs plan. Paste a key, press Save, then Test key to verify it.",
  });
  const testBtn = el("button", "hb-vc-ghost", "Test key");
  testBtn.type = "button";
  vaultCard.appendChild(testBtn);
  const testOut = el("p", "hb-vc-note");
  vaultCard.appendChild(testOut);
  wrap.appendChild(vaultCard);

  const noKeyBox = el("div", "hb-vc-nokey");
  wrap.appendChild(noKeyBox);

  // --- step 1: create voice -----------------------------------------------------
  const step1 = el("div", "hb-vc-card");
  const step1Title = el("h4", "");
  step1Title.appendChild(el("span", "hb-vc-stepnum", "1"));
  step1Title.appendChild(el("span", "", "Create your voice"));
  step1.appendChild(step1Title);

  const fileField = el("div", "hb-vc-field");
  const fileLabel = el("label", "hb-vc-label");
  fileLabel.textContent = "Voice samples ";
  fileLabel.appendChild(el("span", "hb-vc-req", "*"));
  fileField.appendChild(fileLabel);
  const fileInput = el("input", "hb-vc-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "audio/*";
  fileInput.multiple = true;
  fileInput.setAttribute("aria-label", "Voice sample audio files");
  fileField.appendChild(fileInput);
  fileField.appendChild(
    el("p", "hb-vc-hint", "A minute or more of clear speech works best. One speaker, minimal background noise."),
  );
  step1.appendChild(fileField);

  const nameField = el("div", "hb-vc-field");
  const nameLabel = el("label", "hb-vc-label");
  nameLabel.textContent = "Voice name ";
  nameLabel.appendChild(el("span", "hb-vc-req", "*"));
  nameField.appendChild(nameLabel);
  const nameInput = el("input", "hb-vc-input") as HTMLInputElement;
  nameInput.type = "text";
  nameInput.placeholder = "e.g. My Narration Voice";
  nameInput.maxLength = 64;
  nameInput.setAttribute("aria-label", "Voice name");
  nameField.appendChild(nameInput);
  step1.appendChild(nameField);

  const consentWrap = el("label", "hb-vc-consent");
  const consentInput = el("input", "") as HTMLInputElement;
  consentInput.type = "checkbox";
  consentWrap.appendChild(consentInput);
  consentWrap.appendChild(
    el("span", "", "This is my own voice, or I have explicit permission to clone it."),
  );
  step1.appendChild(consentWrap);

  const createBtn = el("button", "hb-vc-btn", "Create voice");
  createBtn.type = "button";
  step1.appendChild(createBtn);
  const voiceLine = el("p", "hb-vc-note");
  step1.appendChild(voiceLine);
  wrap.appendChild(step1);

  // --- step 2: speak --------------------------------------------------------------
  const step2 = el("div", "hb-vc-card");
  const step2Title = el("h4", "");
  step2Title.appendChild(el("span", "hb-vc-stepnum", "2"));
  step2Title.appendChild(el("span", "", "Make it speak"));
  step2.appendChild(step2Title);

  const textLabel = el("label", "hb-vc-label");
  textLabel.textContent = "Text to speak ";
  textLabel.appendChild(el("span", "hb-vc-req", "*"));
  step2.appendChild(textLabel);
  const textInput = el("textarea", "hb-vc-textarea") as HTMLTextAreaElement;
  textInput.rows = 5;
  textInput.placeholder = "e.g. Welcome to my channel — today we are talking about…";
  textInput.maxLength = 2500;
  textInput.setAttribute("aria-label", "Text to speak");
  textInput.disabled = true;
  step2.appendChild(textInput);
  const sampleBtn = el("button", "hb-vc-sample", "✨ Try a sample script");
  sampleBtn.type = "button";
  sampleBtn.addEventListener("click", () => {
    textInput.value = SAMPLE_SCRIPT;
  });
  step2.appendChild(sampleBtn);
  const speakField = el("div", "hb-vc-field");
  speakField.style.marginTop = "12px";
  const speakBtn = el("button", "hb-vc-btn", "🔊 Speak");
  speakBtn.type = "button";
  speakBtn.disabled = true;
  speakField.appendChild(speakBtn);
  step2.appendChild(speakField);
  wrap.appendChild(step2);

  // --- progress / status / error / result -------------------------------------------
  const progress = el("div", "hb-vc-progress");
  progress.hidden = true;
  progress.setAttribute("role", "progressbar");
  progress.appendChild(el("div", ""));
  wrap.appendChild(progress);

  const statusBox = el("p", "hb-vc-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);

  const errorBox = el("div", "hb-vc-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  const resultBox = el("div", "hb-vc-result");
  resultBox.hidden = true;
  wrap.appendChild(resultBox);

  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setBusy(on: boolean): void {
    progress.hidden = !on;
    if (on) setStatus(statusBox.textContent || "Working…");
  }
  function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }
  function setControlsBusy(b: boolean): void {
    createBtn.disabled = b;
    speakBtn.disabled = b || !voiceId;
    testBtn.disabled = b;
  }

  function showAudioResult(audioUrl: string): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    resultBox.appendChild(el("h4", "", "🎧 Your audio"));
    const audio = el("audio", "") as HTMLAudioElement;
    audio.src = audioUrl;
    audio.controls = true;
    resultBox.appendChild(audio);
    const dl = el("button", "hb-vc-btn", "⬇ Download MP3");
    dl.type = "button";
    dl.addEventListener("click", () => {
      const a = el("a", "");
      a.href = audioUrl;
      a.download = `voice-clone-${new Date().toISOString().slice(0, 10)}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    resultBox.appendChild(dl);
    resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderNoKey(): void {
    noKeyBox.innerHTML = "";
    const info = getProviderInfo(providerId);
    if (getKey(providerId)) {
      noKeyBox.hidden = true;
      return;
    }
    noKeyBox.hidden = false;
    noKeyBox.appendChild(el("h4", "", ctx.config.noKeyHeadline ?? "Save an API key to unlock"));
    noKeyBox.appendChild(el("p", "", ctx.config.noKeyBody ?? "Paste a key above, press Save, then Generate."));
    if (info) {
      noKeyBox.appendChild(el("p", "", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-vc-nokey__link", `Get an ${info.name} key`);
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    noKeyBox.appendChild(el("p", "", "Paste → Save → Test key → the full flow works immediately."));
  }

  function getStoredKey(): string | null {
    return ctx.getKey(providerId) ?? getKey(providerId);
  }

  // --- test key ---
  testBtn.addEventListener("click", () => {
    void (async () => {
      const key = getStoredKey();
      if (!key) {
        testOut.textContent = "Save a key first — paste it above and press Save key.";
        return;
      }
      testBtn.disabled = true;
      testOut.textContent = "Checking key…";
      try {
        const req = buildUserRequest({ key });
        const res = await fetch(req.url, { method: req.method, headers: req.headers });
        const json: unknown = await res.json().catch(() => null);
        const out = parseUserResponse(res.status, json);
        if (!out.ok) {
          const mapped = humanizeHttpStatus(res.status, "ElevenLabs");
          testOut.textContent = mapped ?? out.message ?? "Key check failed.";
          return;
        }
        const d = out.data as Record<string, unknown>;
        const chars =
          typeof d["characterCount"] === "number" && typeof d["characterLimit"] === "number"
            ? ` — ${d["characterCount"]}/${d["characterLimit"]} characters used`
            : "";
        testOut.textContent = `Key works ✓ (plan: ${String(d["tier"] ?? "unknown")}${chars})`;
      } catch (err) {
        testOut.textContent = humanizeFetchError(err, "ElevenLabs");
      } finally {
        testBtn.disabled = false;
      }
    })();
  });

  // --- create voice ---
  createBtn.addEventListener("click", () => {
    void (async () => {
      setError(null);
      const key = getStoredKey();
      if (!key) {
        renderNoKey();
        setError("No ElevenLabs key saved yet — paste one in the key vault above and press Save.");
        return;
      }
      const files = Array.from(fileInput.files ?? []);
      const v = validateAddVoiceInputs({ name: nameInput.value, fileCount: files.length });
      if (!v.ok) {
        setError(v.errors.join(" "));
        return;
      }
      if (!consentInput.checked) {
        setError("Please confirm this is your own voice or that you have permission to clone it.");
        return;
      }
      setControlsBusy(true);
      setBusy(true);
      setStatus("Uploading samples and creating your voice…");
      try {
        const req = buildAddVoiceRequest({ key, name: nameInput.value.trim() });
        const form = new FormData();
        form.append("name", nameInput.value.trim());
        for (const f of files) form.append("files", f, f.name);
        const res = await fetch(req.url, { method: req.method, headers: req.headers, body: form });
        const json: unknown = await res.json().catch(() => null);
        const out = parseAddVoiceResponse(res.status, json);
        if (!out.ok) {
          const mapped = humanizeHttpStatus(res.status, "ElevenLabs");
          throw new Error(mapped ?? out.message ?? "Voice creation failed.");
        }
        voiceId = String((out.data as Record<string, unknown>)["voiceId"] ?? "");
        voiceLine.textContent = `Voice created ✓ (id: ${voiceId}). Now type text below and press Speak.`;
        textInput.disabled = false;
        speakBtn.disabled = false;
        setStatus("");
        setBusy(false);
      } catch (err) {
        const kind = classifyFetchError((err as Error)?.message ?? "");
        setError(
          kind === "cors-blocked" ? humanizeFetchError(err, "ElevenLabs") : (err as Error)?.message ?? "Voice creation failed.",
        );
        setBusy(false);
      } finally {
        setControlsBusy(false);
      }
    })();
  });

  // --- speak ---
  speakBtn.addEventListener("click", () => {
    void (async () => {
      setError(null);
      resultBox.hidden = true;
      resultBox.innerHTML = "";
      const key = getStoredKey();
      if (!key) {
        setError("No ElevenLabs key saved yet — paste one in the key vault above and press Save.");
        return;
      }
      const v = validateTtsInputs({ text: textInput.value, voiceId: voiceId ?? "" });
      if (!v.ok) {
        setError(v.errors.join(" "));
        return;
      }
      setControlsBusy(true);
      setBusy(true);
      setStatus("Generating speech…");
      try {
        const req = buildTtsRequest({ key, voiceId: voiceId as string, text: textInput.value.trim() });
        const res = await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(req.body),
        });
        const contentType = res.headers.get("content-type") ?? "";
        if (!res.ok || !/^audio\//i.test(contentType)) {
          const json: unknown = await res.json().catch(() => null);
          const out = parseTtsStatus(res.status, json, contentType);
          const mapped = humanizeHttpStatus(res.status, "ElevenLabs");
          throw new Error(out.ok ? "Unexpected ElevenLabs response." : (mapped ?? out.message ?? `HTTP ${res.status}`));
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        setBusy(false);
        setStatus("Done — speech generated with your cloned voice.");
        showAudioResult(url);
      } catch (err) {
        const kind = classifyFetchError((err as Error)?.message ?? "");
        setError(
          kind === "cors-blocked" ? humanizeFetchError(err, "ElevenLabs") : (err as Error)?.message ?? "Speech generation failed.",
        );
        setBusy(false);
      } finally {
        setControlsBusy(false);
      }
    })();
  });

  onKeyChange(() => {
    renderNoKey();
  });

  renderNoKey();
}
