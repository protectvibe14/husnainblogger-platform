import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getProviders,
  PDF_MIME,
  PDF_MAX_BYTES,
  validatePdfFile,
  validateQuestion,
  buildChatRequest,
  parseChatResponse,
  getDisclosures,
  mapHttpStatus,
  classifyFetchError,
  providerErrorMessage,
  PDF_SYSTEM_PROMPT,
} from "./logic.ts";

describe("talk-to-pdf-chatbot — validation", () => {
  it("is gemini only", () => {
    assert.deepEqual(getProviders(), ["gemini"]);
    assert.equal(PDF_MIME, "application/pdf");
  });
  it("validates the PDF file", () => {
    assert.equal(validatePdfFile({ mimeType: "image/png", sizeBytes: 100 }).ok, false);
    assert.equal(validatePdfFile({ mimeType: PDF_MIME, sizeBytes: PDF_MAX_BYTES + 1 }).ok, false);
    assert.equal(validatePdfFile({ mimeType: PDF_MIME, sizeBytes: PDF_MAX_BYTES }).ok, true);
    assert.equal(validatePdfFile({ mimeType: PDF_MIME }).ok, true);
  });
  it("validates the question", () => {
    assert.equal(validateQuestion({ question: "x", pdfBase64: "abc" }).ok, false);
    assert.equal(validateQuestion({ question: "What is this about?", pdfBase64: "" }).ok, false);
    assert.equal(validateQuestion({ question: "x".repeat(2001), pdfBase64: "abc" }).ok, false);
    assert.equal(validateQuestion({ question: "Summarize this document.", pdfBase64: "abc" }).ok, true);
  });
});

describe("talk-to-pdf-chatbot — request", () => {
  it("builds the exact Gemini request for the first turn", () => {
    const req = buildChatRequest({ key: "AIk", pdfBase64: "ZZZ", question: "Summarize it.", history: [] });
    assert.equal(
      req.url,
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIk",
    );
    assert.equal(req.method, "POST");
    assert.equal(req.headers["Content-Type"], "application/json");
    const body = req.body as Record<string, unknown>;
    const sysParts = (body["system_instruction"] as { parts: Array<Record<string, string>> })["parts"];
    assert.equal(sysParts[0]["text"], PDF_SYSTEM_PROMPT);
    const contents = body["contents"] as Array<Record<string, unknown>>;
    assert.equal(contents.length, 1);
    const parts = contents[0]["parts"] as Array<Record<string, unknown>>;
    assert.equal(parts[0]["text"], "PDF attached. Summarize it.");
    assert.deepEqual(parts[1]["inline_data"], { mime_type: PDF_MIME, data: "ZZZ" });
  });
  it("appends follow-ups after history without re-sending the PDF", () => {
    const req = buildChatRequest({
      key: "AIk",
      pdfBase64: "ZZZ",
      question: "Second question?",
      history: [
        { role: "user", text: "Summarize it." },
        { role: "model", text: "It is about cats." },
      ],
    });
    const contents = (req.body as Record<string, unknown>)["contents"] as Array<Record<string, unknown>>;
    assert.equal(contents.length, 3);
    assert.equal(contents[0]["role"], "user");
    assert.equal(contents[1]["role"], "model");
    assert.equal((contents[2]["parts"] as Array<Record<string, unknown>>)[0]["text"], "Second question?");
    const hasPdf = JSON.stringify(contents).includes("inline_data");
    assert.equal(hasPdf, false);
  });
  it("URL-encodes the key", () => {
    const req = buildChatRequest({ key: "A I/k", pdfBase64: "x", question: "q?", history: [] });
    assert.match(req.url, /key=A%20I%2Fk$/);
  });
  it("trims history to the max turns", () => {
    const history = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("model" as const),
      text: `t${i}`,
    }));
    const req = buildChatRequest({ key: "k", pdfBase64: "x", question: "last?", history });
    const contents = (req.body as Record<string, unknown>)["contents"] as Array<Record<string, unknown>>;
    assert.ok(contents.length <= 21);
  });
});

describe("talk-to-pdf-chatbot — response", () => {
  it("extracts the answer text", () => {
    const out = parseChatResponse(200, {
      candidates: [{ content: { parts: [{ text: "The document says hello." }] } }],
    });
    assert.equal(out.ok, true);
    assert.equal((out.data as Record<string, unknown>)["answer"], "The document says hello.");
  });
  it("maps Gemini error shapes and statuses", () => {
    assert.equal(
      parseChatResponse(400, { error: { code: 400, message: "API key not valid", status: "INVALID_ARGUMENT" } }).kind,
      "bad-request",
    );
    assert.equal(parseChatResponse(400, { error: { message: "API key not valid" } }).message, "API key not valid");
    assert.equal(parseChatResponse(401, {}).kind, "unauthorized");
    assert.equal(parseChatResponse(429, {}).kind, "rate-limited");
  });
  it("reports safety blocks", () => {
    const out = parseChatResponse(200, { promptFeedback: { blockReason: "SAFETY" } });
    assert.equal(out.ok, false);
    assert.match(out.message ?? "", /blocked/);
  });
  it("fails cleanly on empty candidates", () => {
    assert.equal(parseChatResponse(200, { candidates: [] }).ok, false);
    assert.equal(parseChatResponse(200, {}).ok, false);
  });
});

describe("talk-to-pdf-chatbot — misc", () => {
  it("maps statuses and fetch errors", () => {
    assert.equal(mapHttpStatus(200), null);
    assert.equal(classifyFetchError("Failed to fetch"), "cors-blocked");
    assert.equal(providerErrorMessage(null), null);
  });
  it("discloses Gemini-only, URL keys, and PDF upload", () => {
    const d = getDisclosures();
    assert.ok(d.some((x) => /OpenRouter/i.test(x) && /Gemini-only/i.test(x)));
    assert.ok(d.some((x) => /URL/i.test(x)));
    assert.ok(d.some((x) => /PDF is uploaded/i.test(x)));
  });
});
