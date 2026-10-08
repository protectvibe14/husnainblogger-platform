import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  sanitize,
  normalizeEscalationLevel,
  parseAmount,
  parseDaysOverdue,
  formatAmount,
  assembleDraft,
  ESCALATION_LEVELS,
  DEFAULT_ESCALATION_LEVEL,
} from "./logic.ts";

const base = {
  clientName: "Acme Studio",
  invoiceNumber: "INV-2026-041",
  amountDue: 1250,
  daysOverdue: 21,
  escalationLevel: "polite",
  senderName: "Husnain",
};

function draftOf(result: { ok: boolean; values?: { reminderEmailDraft: string } }): string {
  assert.equal(result.ok, true);
  return result.values?.reminderEmailDraft ?? "";
}

describe("overdue-invoice-reminder-generator (tool-468)", () => {
  it("happy path: returns exactly one output key reminderEmailDraft", () => {
    const r = runTool(base);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}), ["reminderEmailDraft"]);
  });

  it("draft contains client, invoice, formatted amount, and days", () => {
    const d = draftOf(runTool(base));
    assert.ok(d.includes("Acme Studio"));
    assert.ok(d.includes("INV-2026-041"));
    assert.ok(d.includes("1,250.00"));
    assert.ok(d.includes("21"));
  });

  it("draft has 2 subject options and a body with a subject line", () => {
    const d = draftOf(runTool(base));
    assert.ok(d.includes("SUBJECT OPTIONS"));
    assert.ok(d.includes("1."));
    assert.ok(d.includes("2."));
    assert.ok(!d.includes("3. "));
    assert.ok(d.includes("EMAIL BODY:"));
    assert.ok(d.includes("Subject:"));
  });

  it("polite tone is friendly and non-threatening", () => {
    const d = draftOf(runTool({ ...base, escalationLevel: "polite" }));
    assert.ok(d.toLowerCase().includes("friendly reminder"));
  });

  it("firm tone asks for a payment date", () => {
    const d = draftOf(runTool({ ...base, escalationLevel: "firm" }));
    assert.ok(d.toLowerCase().includes("confirm when"));
  });

  it("final level includes a seek-advice note, never legal threats", () => {
    const d = draftOf(runTool({ ...base, escalationLevel: "final" }));
    assert.ok(d.toLowerCase().includes("seek independent advice"));
    const lower = d.toLowerCase();
    assert.ok(!lower.includes("sue"));
    assert.ok(!lower.includes("court"));
    assert.ok(!lower.includes("legal action"));
    assert.ok(!lower.includes("attorney"));
  });

  it("each escalation level produces a distinct draft", () => {
    const drafts = ESCALATION_LEVELS.map((l) =>
      assembleDraft({
        clientName: "C",
        invoiceNumber: "1",
        amountDue: 100,
        daysOverdue: 5,
        escalationLevel: l,
        senderName: "S",
      }),
    );
    assert.equal(new Set(drafts).size, ESCALATION_LEVELS.length);
  });

  it("unknown escalation level defaults to polite", () => {
    assert.equal(normalizeEscalationLevel("aggressive"), DEFAULT_ESCALATION_LEVEL);
    const d = draftOf(runTool({ ...base, escalationLevel: "aggressive" }));
    assert.ok(d.toLowerCase().includes("friendly reminder"));
  });

  it("negative amountDue is rejected", () => {
    const r = runTool({ ...base, amountDue: -50 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("negative"));
  });

  it("non-numeric amountDue is rejected", () => {
    const r = runTool({ ...base, amountDue: "a lot" });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("NaN and Infinity amounts are rejected", () => {
    assert.ok(parseAmount(Number.NaN).error);
    assert.ok(parseAmount(Number.POSITIVE_INFINITY).error);
  });

  it("zero amountDue is allowed", () => {
    const d = draftOf(runTool({ ...base, amountDue: 0 }));
    assert.ok(d.includes("0.00"));
  });

  it("negative daysOverdue is rejected", () => {
    const r = runTool({ ...base, daysOverdue: -3 });
    assert.equal(r.ok, false);
    assert.ok(r.error);
  });

  it("fractional daysOverdue is rejected", () => {
    const r = runTool({ ...base, daysOverdue: 2.5 });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("whole number"));
  });

  it("numeric strings are accepted for amount and days", () => {
    const d = draftOf(runTool({ ...base, amountDue: "1250.50", daysOverdue: "21" }));
    assert.ok(d.includes("1,250.50"));
  });

  it("missing clientName returns a human error", () => {
    const r = runTool({ ...base, clientName: "  " });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("client name"));
  });

  it("missing invoiceNumber returns a human error", () => {
    const r = runTool({ ...base, invoiceNumber: "" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("invoice number"));
  });

  it("HTML is stripped from inputs", () => {
    assert.equal(sanitize("<b>x</b>"), "x");
    const d = draftOf(runTool({ ...base, clientName: "<img src=x>Acme" }));
    assert.ok(!d.includes("<img"));
  });

  it("formatAmount groups thousands with 2 decimals", () => {
    assert.equal(formatAmount(1234567.8), "1,234,567.80");
    assert.equal(formatAmount(0), "0.00");
  });

  it("sender name placeholder used when empty", () => {
    const d = draftOf(runTool({ ...base, senderName: "" }));
    assert.ok(d.includes("[Your name]"));
  });

  it("same inputs produce byte-identical output (deterministic)", () => {
    assert.equal(draftOf(runTool(base)), draftOf(runTool(base)));
  });
});
