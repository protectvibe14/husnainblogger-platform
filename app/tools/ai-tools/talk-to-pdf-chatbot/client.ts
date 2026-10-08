/**
 * Talk to PDF Chatbot — browser client (Lane D, Gemini only).
 *
 * Flow: key-vault (gemini) → PDF upload (≤15 MB, labeled) → chat UI:
 * question → append turns → Gemini answers (FileReader → base64 on first
 * turn) → errors. Keys are never logged; user text via textContent.
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
  PDF_MAX_BYTES,
  validatePdfFile,
  validateQuestion,
  buildChatRequest,
  parseChatResponse,
  classifyFetchError,
  type ChatTurn,
} from "./logic.ts";

const PROVIDER_ID = "gemini";

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

  let pdfBase64: string | null = null;
  let pdfName = "";
  let history: ChatTurn[] = [];

  // --- key vault ---
  const vaultBox = el("div", "hb-ai-section");
  wrap.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers: [PROVIDER_ID],
    intro: "Gemini's free tier covers normal use. Paste a key, press Save, then upload your PDF.",
  });

  const noKeyBox = el("div", "hb-ai-section hb-ai-nokey");
  wrap.appendChild(noKeyBox);

  // --- PDF upload ---
  const uploadBox = el("div", "hb-ai-section");
  wrap.appendChild(uploadBox);
  uploadBox.appendChild(el("label", "hb-ai-label", "PDF document"));
  const fileInput = el("input", "hb-ai-input") as HTMLInputElement;
  fileInput.type = "file";
  fileInput.accept = "application/pdf";
  uploadBox.appendChild(fileInput);
  uploadBox.appendChild(
    el("p", "hb-ai-hint", "Max 15 MB. The PDF is attached to your first question and sent to Google's servers."),
  );
  const pdfLine = el("p", "hb-ai-note");
  uploadBox.appendChild(pdfLine);

  // --- chat thread ---
  const chatBox = el("div", "hb-ai-section hb-ai-chat");
  wrap.appendChild(chatBox);
  const thread = el("div", "hb-ai-chat__thread");
  chatBox.appendChild(thread);

  // --- ask row ---
  const askRow = el("div", "hb-ai-chat__ask");
  const qInput = el("textarea", "hb-ai-input hb-ai-textarea") as HTMLTextAreaElement;
  qInput.rows = 2;
  qInput.placeholder = "e.g. What are the key findings of this report?";
  qInput.maxLength = 2000;
  qInput.setAttribute("aria-label", "Your question about the PDF");
  const askBtn = el("button", "hb-btn hb-btn--primary", "Ask");
  askBtn.type = "button";
  askRow.appendChild(qInput);
  askRow.appendChild(askBtn);
  chatBox.appendChild(askRow);

  const statusBox = el("div", "hb-ai-section hb-ai-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);
  const errorBox = el("div", "hb-ai-section hb-ai-error");
  errorBox.hidden = true;
  wrap.appendChild(errorBox);

  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }

  function addMessage(role: "user" | "model", text: string): void {
    const msg = el("div", `hb-ai-chat__msg hb-ai-chat__msg--${role}`);
    msg.appendChild(el("span", "hb-ai-chat__who", role === "user" ? "You" : "Gemini"));
    const body = el("p", "hb-ai-chat__body", text);
    msg.appendChild(body);
    if (role === "model") {
      const copy = el("button", "hb-btn hb-btn--ghost", "Copy");
      copy.type = "button";
      copy.addEventListener("click", () => {
        void navigator.clipboard.writeText(text).catch(() => undefined);
        copy.textContent = "Copied ✓";
        setTimeout(() => {
          copy.textContent = "Copy";
        }, 1500);
      });
      msg.appendChild(copy);
    }
    thread.appendChild(msg);
    thread.scrollTop = thread.scrollHeight;
  }

  function renderNoKey(): void {
    noKeyBox.innerHTML = "";
    const info = getProviderInfo(PROVIDER_ID);
    if (getKey(PROVIDER_ID)) {
      noKeyBox.hidden = true;
      return;
    }
    noKeyBox.hidden = false;
    const cfg = ctx.config;
    noKeyBox.appendChild(el("h3", "hb-ai-nokey__title", cfg.noKeyHeadline ?? "Save an API key to unlock"));
    noKeyBox.appendChild(el("p", "hb-ai-nokey__body", cfg.noKeyBody ?? "Paste a key above, press Save, then chat."));
    if (info) {
      noKeyBox.appendChild(el("p", "hb-ai-nokey__cost", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-btn hb-btn--secondary", `Get a ${info.name} key`);
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    noKeyBox.appendChild(el("p", "hb-ai-nokey__hint", "Paste → Save → upload PDF → Ask. Works immediately."));
  }

  function getStoredKey(): string | null {
    return ctx.getKey(PROVIDER_ID) ?? getKey(PROVIDER_ID);
  }

  function readAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          reject(new Error("Could not read the PDF file."));
          return;
        }
        const idx = result.indexOf(",");
        resolve(idx >= 0 ? result.slice(idx + 1) : result);
      };
      reader.onerror = () => reject(new Error("Could not read the PDF file."));
      reader.readAsDataURL(file);
    });
  }

  // --- PDF upload ---
  fileInput.addEventListener("change", () => {
    void (async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      setError(null);
      const v = validatePdfFile({ mimeType: file.type, sizeBytes: file.size });
      if (!v.ok) {
        setError(v.errors.join(" "));
        fileInput.value = "";
        return;
      }
      pdfLine.textContent = "Reading PDF…";
      try {
        pdfBase64 = await readAsBase64(file);
        pdfName = file.name;
        history = [];
        thread.innerHTML = "";
        pdfLine.textContent = `Loaded: ${pdfName} (${(file.size / 1024).toFixed(0)} KB). Ask anything about it below.`;
        addMessage("model", `I've got "${pdfName}" loaded. What would you like to know about it?`);
      } catch (err) {
        pdfBase64 = null;
        pdfLine.textContent = "";
        setError((err as Error)?.message ?? "Could not read the PDF file.");
      }
    })();
  });

  // --- ask ---
  askBtn.addEventListener("click", () => {
    void (async () => {
      setError(null);
      const key = getStoredKey();
      if (!key) {
        renderNoKey();
        setError("No Gemini key saved yet — paste one in the key vault above and press Save.");
        return;
      }
      const v = validateQuestion({ question: qInput.value, pdfBase64: pdfBase64 ?? "" });
      if (!v.ok) {
        setError(v.errors.join(" "));
        return;
      }
      const question = qInput.value.trim();
      qInput.value = "";
      addMessage("user", question);
      askBtn.disabled = true;
      setStatus("Thinking…");
      try {
        const req = buildChatRequest({ key, pdfBase64: pdfBase64 as string, question, history });
        const res = await fetch(req.url, {
          method: req.method,
          headers: req.headers,
          body: JSON.stringify(req.body),
        });
        const json: unknown = await res.json().catch(() => null);
        const out = parseChatResponse(res.status, json);
        if (!out.ok) {
          const mapped = humanizeHttpStatus(res.status, "Gemini");
          throw new Error(mapped ?? out.message ?? "Chat failed.");
        }
        const answer = String((out.data as Record<string, unknown>)["answer"] ?? "");
        const newTurns: ChatTurn[] = [
          { role: "user", text: question },
          { role: "model", text: answer },
        ];
        history = [...history, ...newTurns].slice(-20);
        addMessage("model", answer);
        setStatus("");
      } catch (err) {
        const kind = classifyFetchError((err as Error)?.message ?? "");
        setError(
          kind === "cors-blocked" ? humanizeFetchError(err, "Gemini") : (err as Error)?.message ?? "Chat failed.",
        );
      } finally {
        askBtn.disabled = false;
      }
    })();
  });

  qInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askBtn.click();
    }
  });

  const unsubscribe = onKeyChange(() => {
    renderNoKey();
  });

  renderNoKey();
  return () => {
    unsubscribe();
  };
}
