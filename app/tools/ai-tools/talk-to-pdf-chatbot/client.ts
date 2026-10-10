/**
 * Talk to PDF Chatbot — browser client (Lane D, Gemini only, redesigned).
 *
 * Flow: gradient header -> key-vault card -> styled PDF upload card ->
 * chat UI with message bubbles: question -> append turns -> Gemini
 * answers (FileReader -> base64 on first turn) -> errors. Keys are
 * never logged; user text via textContent.
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

  // --- styles ---------------------------------------------------------------
  const style = document.createElement("style");
  style.textContent = `
    .hb-pdf-wrap { display: flex; flex-direction: column; gap: 18px; }
    .hb-pdf-header {
      background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
      border-radius: 16px; padding: 24px; color: #fff;
    }
    .hb-pdf-header h3 { margin: 0 0 6px; font-size: 20px; font-weight: 700; }
    .hb-pdf-header p { margin: 0; font-size: 14px; opacity: .92; }
    .hb-pdf-card {
      background: #fff; border: 1px solid #e2e8f0; border-radius: 14px;
      padding: 20px;
    }
    .hb-pdf-label {
      display: block; font-size: 14px; font-weight: 700; color: #1e293b;
      margin-bottom: 8px;
    }
    .hb-pdf-hint { font-size: 13px; color: #64748b; margin: 8px 0 0; }
    .hb-pdf-note { font-size: 13px; color: #475569; margin: 10px 0 0; }
    .hb-pdf-drop {
      border: 2px dashed #9aa4b2; border-radius: 12px; padding: 28px 18px;
      text-align: center; cursor: pointer; background: #f8fafc;
      transition: all .2s ease;
    }
    .hb-pdf-drop:hover, .hb-pdf-drop.hb-pdf-dragover {
      border-color: #f97316; background: #fff7ed;
    }
    .hb-pdf-drop-icon { font-size: 36px; margin-bottom: 6px; }
    .hb-pdf-drop-title { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 4px; }
    .hb-pdf-drop-sub { font-size: 13px; color: #64748b; margin: 0; }
    .hb-pdf-thread {
      display: flex; flex-direction: column; gap: 12px;
      max-height: 420px; overflow-y: auto; padding: 4px 2px; margin-bottom: 14px;
    }
    .hb-pdf-thread:empty { display: none; }
    .hb-pdf-msg {
      border-radius: 12px; padding: 12px 14px; max-width: 92%;
    }
    .hb-pdf-msg--user {
      align-self: flex-end; background: #fff7ed; border: 1px solid #fed7aa;
    }
    .hb-pdf-msg--model {
      align-self: flex-start; background: #f8fafc; border: 1px solid #e2e8f0;
    }
    .hb-pdf-who { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
    .hb-pdf-msg--user .hb-pdf-who { color: #c2410c; }
    .hb-pdf-msg--model .hb-pdf-who { color: #0284c7; }
    .hb-pdf-body { font-size: 14px; color: #1e293b; line-height: 1.6; margin: 0; white-space: pre-wrap; }
    .hb-pdf-copy {
      margin-top: 8px; font-size: 12px; font-weight: 700; color: #0284c7;
      background: none; border: none; cursor: pointer; padding: 0;
      text-decoration: underline;
    }
    .hb-pdf-ask { display: flex; gap: 10px; align-items: flex-end; }
    .hb-pdf-q {
      flex: 1; padding: 12px 14px; font-size: 15px; font-family: inherit;
      border: 2px solid #e2e8f0; border-radius: 10px; resize: vertical;
      box-sizing: border-box; color: #1e293b; min-height: 52px;
    }
    .hb-pdf-q:focus { outline: none; border-color: #f97316; }
    .hb-pdf-askbtn {
      padding: 13px 30px; font-size: 16px; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
      border: none; border-radius: 10px; cursor: pointer; white-space: nowrap;
    }
    .hb-pdf-askbtn:hover:not(:disabled) { opacity: .92; }
    .hb-pdf-askbtn:disabled { background: #94a3b8; cursor: not-allowed; }
    .hb-pdf-status { font-size: 14px; color: #475569; margin: 0; min-height: 20px; }
    .hb-pdf-error {
      background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
      padding: 14px 18px; border-radius: 10px; font-size: 14px;
    }
    .hb-pdf-nokey h3 { margin: 0 0 8px; font-size: 16px; color: #1e293b; }
    .hb-pdf-nokey p { font-size: 14px; color: #475569; margin: 0 0 8px; }
    .hb-pdf-getkey {
      display: inline-block; padding: 10px 22px; font-size: 14px; font-weight: 700;
      color: #fff; background: #0284c7; border-radius: 10px; text-decoration: none;
    }
    .hb-pdf-getkey:hover { background: #0369a1; }
    @media (max-width: 640px) {
      .hb-pdf-header { padding: 18px; }
      .hb-pdf-ask { flex-direction: column; align-items: stretch; }
      .hb-pdf-askbtn { width: 100%; }
      .hb-pdf-msg { max-width: 100%; }
    }
  `;
  root.appendChild(style);

  const wrap = el("div", "hb-pdf-wrap");
  root.appendChild(wrap);

  // --- header -----------------------------------------------------------------
  const header = el("div", "hb-pdf-header");
  header.appendChild(el("h3", "", "📄💬 Talk to PDF"));
  header.appendChild(
    el("p", "", "Upload any PDF, ask questions, get answers grounded in its pages — powered by your free Gemini key."),
  );
  wrap.appendChild(header);

  let pdfBase64: string | null = null;
  let pdfName = "";
  let history: ChatTurn[] = [];

  // --- key vault --------------------------------------------------------------
  const vaultCard = el("div", "hb-pdf-card");
  vaultCard.appendChild(el("label", "hb-pdf-label", "🔑 API key"));
  const vaultBox = el("div", "");
  vaultCard.appendChild(vaultBox);
  renderKeyVault(vaultBox, {
    providers: [PROVIDER_ID],
    intro: "Gemini's free tier covers normal use. Paste a key, press Save, then upload your PDF.",
  });
  wrap.appendChild(vaultCard);

  const noKeyBox = el("div", "hb-pdf-card hb-pdf-nokey");
  wrap.appendChild(noKeyBox);

  // --- PDF upload ---------------------------------------------------------------
  const uploadCard = el("div", "hb-pdf-card");
  const upLabel = el("label", "hb-pdf-label", "📎 PDF document");
  upLabel.htmlFor = "hb-pdf-file";
  uploadCard.appendChild(upLabel);

  const drop = el("div", "hb-pdf-drop");
  drop.setAttribute("role", "button");
  drop.tabIndex = 0;
  drop.setAttribute("aria-label", "Upload a PDF: drag and drop, or click to browse");
  drop.appendChild(el("div", "hb-pdf-drop-icon", "📄"));
  drop.appendChild(el("p", "hb-pdf-drop-title", "Drop your PDF here"));
  drop.appendChild(
    el("p", "hb-pdf-drop-sub", "or click to browse — up to " + PDF_MAX_BYTES / 1024 / 1024 + " MB"),
  );
  uploadCard.appendChild(drop);

  const fileInput = document.createElement("input");
  fileInput.id = "hb-pdf-file";
  fileInput.type = "file";
  fileInput.accept = "application/pdf";
  fileInput.hidden = true;
  uploadCard.appendChild(fileInput);

  drop.addEventListener("click", () => fileInput.click());
  drop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInput.click();
    }
  });
  drop.addEventListener("dragover", (e) => {
    e.preventDefault();
    drop.classList.add("hb-pdf-dragover");
  });
  drop.addEventListener("dragleave", () => drop.classList.remove("hb-pdf-dragover"));
  drop.addEventListener("drop", (e) => {
    e.preventDefault();
    drop.classList.remove("hb-pdf-dragover");
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  });

  uploadCard.appendChild(
    el("p", "hb-pdf-hint", "The PDF is attached to your first question and sent to Google's servers."),
  );
  const pdfLine = el("p", "hb-pdf-note", "");
  uploadCard.appendChild(pdfLine);
  wrap.appendChild(uploadCard);

  // --- chat card ------------------------------------------------------------------
  const chatCard = el("div", "hb-pdf-card");
  chatCard.appendChild(el("label", "hb-pdf-label", "💬 Chat"));
  const thread = el("div", "hb-pdf-thread");
  chatCard.appendChild(thread);

  const askRow = el("div", "hb-pdf-ask");
  const qInput = el("textarea", "hb-pdf-q") as HTMLTextAreaElement;
  qInput.rows = 2;
  qInput.placeholder = "e.g. What are the key findings of this report?";
  qInput.maxLength = 2000;
  qInput.setAttribute("aria-label", "Your question about the PDF");
  const askBtn = el("button", "hb-pdf-askbtn", "Ask ➤") as HTMLButtonElement;
  askBtn.type = "button";
  askRow.appendChild(qInput);
  askRow.appendChild(askBtn);
  chatCard.appendChild(askRow);
  wrap.appendChild(chatCard);

  const statusBox = el("p", "hb-pdf-status");
  statusBox.setAttribute("role", "status");
  wrap.appendChild(statusBox);
  const errorBox = el("div", "hb-pdf-error");
  errorBox.hidden = true;
  errorBox.setAttribute("role", "alert");
  wrap.appendChild(errorBox);

  function setStatus(text: string): void {
    statusBox.textContent = text;
  }
  function setError(text: string | null): void {
    errorBox.hidden = text === null;
    errorBox.textContent = text ?? "";
  }

  function addMessage(role: "user" | "model", text: string): void {
    const msg = el("div", `hb-pdf-msg hb-pdf-msg--${role}`);
    msg.appendChild(el("div", "hb-pdf-who", role === "user" ? "You" : "Gemini"));
    msg.appendChild(el("p", "hb-pdf-body", text));
    if (role === "model") {
      const copy = el("button", "hb-pdf-copy", "Copy");
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
    noKeyBox.appendChild(el("h3", "", cfg.noKeyHeadline ?? "Save an API key to unlock"));
    noKeyBox.appendChild(el("p", "", cfg.noKeyBody ?? "Paste a key above, press Save, then chat."));
    if (info) {
      noKeyBox.appendChild(el("p", "", `${info.freeTier} ${info.costNote}`));
      const link = el("a", "hb-pdf-getkey", `Get a ${info.name} key`);
      link.href = info.keyUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer nofollow";
      noKeyBox.appendChild(link);
    }
    noKeyBox.appendChild(el("p", "hb-pdf-hint", "Paste → Save → upload PDF → Ask. Works immediately."));
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
  function handleFile(file: File): void {
    void (async () => {
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
  }

  fileInput.addEventListener("change", () => {
    const f = fileInput.files?.[0];
    if (f) handleFile(f);
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
