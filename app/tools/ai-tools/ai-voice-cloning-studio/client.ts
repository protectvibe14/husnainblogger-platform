/**
 * AI Voice Cloning Studio — browser client (Lane D, ElevenLabs).
 *
 * Flow: key-vault (+ Test key) → upload ≥1 audio sample (labeled: "a minute
 * or more of clear speech works best") → name → consent → Create voice →
 * script textarea → Speak → <audio> + Download MP3 → errors.
 * Keys are never logged; user text via textContent.
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

export function mountAiTool(ctx: AiClientContext): () => void {
  const root = ctx.mountEl;
  root.innerHTML = "";
  const wrap = el("div", "hb-ai-tool");
  root.appendChild(wrap);

  const providerId = "elevenlabs";
  let voiceId: string | null = null;

  // --- key vault + test key ---
  const vaultBox = el("div", "hb-ai-section");
  wrap.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers: [providerId],
    intro: "Voice cloning usually needs a paid ElevenLabs plan. Paste a key, press Save, then Test key to verify it.",
  });
  const testRow = el("div", "hb-ai-actions");
  const testBtn = el("button", "hb-btn hb-btn--ghost", "Test key");
  testBtn.type = "button";
  const testOut = el("p", "hb-ai-note");
  testRow.appendChild(testBtn);
  vaultBox.appendChild(testRow);
  vaultBox.appendChild(testOut);

  const noKeyBox = el("div", "hb-ai-section hb-ai-nokey");
  wrap.appendChild(noKeyBox);

  // --- step 1: create voice ---
  const step1 = el("div", "hb-ai-section");
  wrap.appendChild(step1);
  step1.appendChild(el("h3", "hb-ai-step__title", "Step 1 — Create your voice"));
  step1.appendChild(el("label", "hb-ai-label", "Voice samples"));
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "audio/*";
  fileInput.multiple = true;
  step1.appendChild(fileInput);
  step1.appendChild(
    el("p", "hb-ai-hint", "A minute or more of clear speech works best. One speaker, minimal background noise."),
  );
  step1.appendChild(el("label", "hb-ai-label", "Voice name"));
  const nameInput = el("input", "hb-ai-input") as HTMLInputElement;
  nameInput.type = "text";
  nameInput.placeholder = "e.g. My Narration Voice";
  nameInput.maxLength = 64;
  nameInput.setAttribute("aria-label", "Voice name");
  step1.appendChild(nameInput);

  const consentWrap = el("label", "hb-ai-consent");
  const consentInput = el("input", "") as HTMLInputElement;
  consentInput.type = "checkbox";
  consentWrap.appendChild(consentInput);
  consentWrap.appendChild(
    el("span", "", "This is my own voice, or I have explicit permission to clone it."),
  );
  step1.appendChild(consentWrap);

  const createBtn = el("button", "hb-btn hb-btn--primary", "Create voice");
  createBtn.type = "button";
  step1.appendChild(createBtn);
  const voiceLine = el("p", "hb-ai-note");
  step1.appendChild(voiceLine);

  // --- step 2: speak ---
  const step2 = el("div", "hb-ai-section");
  wrap.appendChild(step2);
  step2.appendChild(el("h3", "hb-ai-step__title", "Step 2 — Make it speak"));
  step2.appendChild(el("label", "hb-ai-label", "Text to speak"));
  const textInput = el("textarea", "hb-ai-input hb-ai-textarea") as HTMLTextAreaElement;
  textInput.rows = 5;
  textInput.placeholder = "e.g. Welcome to my channel — today we are talking about…";
  textInput.maxLength = 2500;
  textInput.setAttribute("aria-label", "Text to speak");
  textInput.disabled = true;
  step2.appendChild(textInput);
  const speakBtn = el("button", "hb-btn hb-btn--primary", "Speak");
  speakBtn.type = "button";
  speakBtn.disabled = true;
  step2.appendChild(speakBtn);

  const statusBox = el("div", "hb-ai-section hb-ai-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);
  const errorBox = el("div", "hb-ai-section hb-ai-error");
  errorBox.hidden = true;
  wrap.appendChild(errorBox);
  const resultBox = el("div", "hb-ai-section hb-ai-result");
  resultBox.hidden = true;
  wrap.appendChild(resultBox);

  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }
  function setBusy(b: boolean): void {
    createBtn.disabled = b;
    speakBtn.disabled = b || !voiceId;
    testBtn.disabled = b;
  }

  function showAudioResult(audioUrl: string): void {
    resultBox.innerHTML = "";
    resultBox.hidden = false;
    resultBox.appendChild(el("h3", "hb-ai-result__title", "Your audio"));
    const audio = el("audio", "hb-ai-result__audio") as HTMLAudioElement;
    audio.src = audioUrl;
    audio.controls = true;
    resultBox.appendChild(audio);
    const row = el("div", "hb-ai-actions");
    const dl = el("button", "hb-btn hb-btn--primary", "Download MP3");
    dl.type = "button";
    dl.addEventListener("click", () => {
      const a = el("a", "");
      a.href = audioUrl;
      a.download = `voice-clone-${new Date().toISOString().slice(0, 10)}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
    row.appendChild(dl);
    resultBox.appendChild(row);
  }

  function renderNoKey(): void {
    noKeyBox.innerHTML = "";
    const info = getProviderInfo(providerId);
    if (getKey(providerId)) {
      noKeyBox.hidden = true;
      return;
    }
    noKeyBox.hidden = false;
    const cfg = ctx.config;
    noKeyBox.appendChild(el("h3", "hb-ai-nokey__title", cfg.noKeyHeadline ?? "Save an API key to unlock"));
    noKeyBox.appendChild(el("p", "hb-ai-nokey__body", cfg.noKeyBody ?? "Paste a key above, press Save, then Generate."));
    if (info) {
      noKeyBox.appendChild(el("p", "hb-ai-nokey__cost", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-btn hb-btn--secondary", `Get an ${info.name} key`);
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    noKeyBox.appendChild(el("p", "hb-ai-nokey__hint", "Paste → Save → Test key → the full flow works immediately."));
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
      } catch (err) {
        const kind = classifyFetchError((err as Error)?.message ?? "");
        setError(
          kind === "cors-blocked" ? humanizeFetchError(err, "ElevenLabs") : (err as Error)?.message ?? "Voice creation failed.",
        );
      } finally {
        setBusy(false);
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
        setStatus("");
        showAudioResult(url);
      } catch (err) {
        const kind = classifyFetchError((err as Error)?.message ?? "");
        setError(
          kind === "cors-blocked" ? humanizeFetchError(err, "ElevenLabs") : (err as Error)?.message ?? "Speech generation failed.",
        );
      } finally {
        setBusy(false);
      }
    })();
  });

  const unsubscribe = onKeyChange(() => {
    renderNoKey();
  });

  renderNoKey();
  return () => {
    unsubscribe();
  };
}
