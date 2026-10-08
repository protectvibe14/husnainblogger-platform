import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  TONES,
  TEMPLATES,
  SUBJECTS,
  PLACEHOLDERS,
  EMAIL_STAGES,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const baseValues = {
  storeName: "Northwind Goods",
  productName: "Trail Backpack 40L",
  discountOffer: "10% off with code COMEBACK10",
  emailNumber: 3,
  tone: "friendly",
};

describe("abandoned-cart-email-template-generator (tool-415)", () => {
  it("happy path: returns subject options, body template, and placeholder list", () => {
    const r = runTool(baseValues);
    assert.equal(r.ok, true);
    const subjects = r.values?.subjectOptions as string[];
    assert.equal(subjects.length, 4);
    for (const s of subjects) assert.ok(s.length > 0);
    const body = String(r.values?.bodyTemplate ?? "");
    assert.ok(body.includes("Email 3 of 3"));
    assert.ok(body.includes("{{discountCode}}"));
    assert.ok(body.includes("10% off with code COMEBACK10"));
    const placeholders = r.values?.placeholderList as string[];
    assert.deepEqual(placeholders, PLACEHOLDERS);
  });

  it("keeps {{placeholders}} in the template for the merchant's ESP", () => {
    const r = runTool(baseValues);
    const body = String(r.values?.bodyTemplate ?? "");
    for (const token of ["{{firstName}}", "{{storeName}}", "{{productName}}", "{{cartUrl}}", "{{discountCode}}"]) {
      assert.ok(body.includes(token), `body keeps ${token}`);
    }
    // No half-filled leftovers: every "{" must be part of a "{{" token.
    const singles = body.replace(/{{[a-zA-Z]+}}/g, "");
    assert.ok(!singles.includes("{"), "no stray single braces left in template");
  });

  it("fills the store name into the sign-off (no stray braces)", () => {
    const r = runTool(baseValues);
    const body = String(r.values?.bodyTemplate ?? "");
    assert.ok(body.includes("Northwind Goods"));
    assert.ok(!body.includes("{Northwind Goods}"));
  });

  it("email 1 is the reminder template", () => {
    const r = runTool({ ...baseValues, emailNumber: 1 });
    assert.equal(r.ok, true);
    const body = String(r.values?.bodyTemplate ?? "");
    assert.ok(body.includes("Email 1 of 3 — Reminder"));
    assert.ok(body.includes("~1 hour after abandonment"));
  });

  it("email 2 is the value/objection template", () => {
    const r = runTool({ ...baseValues, emailNumber: 2 });
    assert.equal(r.ok, true);
    const body = String(r.values?.bodyTemplate ?? "");
    assert.ok(body.includes("Email 2 of 3 — Value / objection handling"));
  });

  it("each email number gets its own subject bank", () => {
    const banks = [1, 2, 3].map(
      (n) => (runTool({ ...baseValues, emailNumber: n }).values?.subjectOptions as string[]).join("|"),
    );
    assert.equal(new Set(banks).size, 3, "subject banks differ per email");
  });

  it("adds a notice when email 3 has no discount offer", () => {
    const r = runTool({ ...baseValues, discountOffer: "" });
    assert.equal(r.ok, true);
    assert.match(String(r.values?.notices ?? ""), /no discount offer/i);
    const body = String(r.values?.bodyTemplate ?? "");
    assert.ok(body.includes("{{discountCode}}"));
  });

  it("rejects missing store name", () => {
    const r = runTool({ ...baseValues, storeName: "  " });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /store name/i);
  });

  it("rejects missing product name", () => {
    const r = runTool({ ...baseValues, productName: "" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /product name/i);
  });

  it("rejects missing email number", () => {
    const r = runTool({ ...baseValues, emailNumber: undefined });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /1, 2, or 3/);
  });

  it("rejects email number 0 and 4 (no clamping across distinct templates)", () => {
    for (const n of [0, 4]) {
      const r = runTool({ ...baseValues, emailNumber: n });
      assert.equal(r.ok, false, `emailNumber ${n} rejected`);
      assert.match(r.error ?? "", /1, 2, or 3/);
    }
  });

  it("rejects non-integer and NaN email numbers", () => {
    for (const n of [1.5, NaN, Infinity]) {
      const r = runTool({ ...baseValues, emailNumber: n });
      assert.equal(r.ok, false, `emailNumber ${String(n)} rejected`);
    }
  });

  it("accepts email number as a numeric string", () => {
    const r = runTool({ ...baseValues, emailNumber: "2" });
    assert.equal(r.ok, true);
    assert.ok(String(r.values?.bodyTemplate ?? "").includes("Email 2 of 3"));
  });

  it("rejects an invalid tone", () => {
    const r = runTool({ ...baseValues, tone: "formal-ish" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /tone/i);
  });

  it("truncates overlong input with a visible notice", () => {
    const long = "q".repeat(MAX_INPUT_CHARS + 30);
    const r = runTool({ ...baseValues, productName: long });
    assert.equal(r.ok, true);
    assert.match(String(r.values?.notices ?? ""), /shortened/);
  });

  it("escapes HTML in user input", () => {
    const r = runTool({ ...baseValues, storeName: "<b>Shop</b>" });
    assert.equal(r.ok, true);
    const body = String(r.values?.bodyTemplate ?? "");
    assert.ok(!body.includes("<b>Shop</b>"));
    assert.ok(body.includes("&lt;b&gt;Shop&lt;/b&gt;"));
  });

  it("is deterministic: same inputs produce identical outputs", () => {
    const a = runTool(baseValues);
    const b = runTool(baseValues);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(baseValues);
    const metaIds = new Set(outputs.map((o) => o.id));
    for (const id of Object.keys(r.values ?? {})) {
      assert.ok(metaIds.has(id), `output id "${id}" missing from meta.ts`);
    }
    for (const id of ["subjectOptions", "bodyTemplate", "placeholderList"]) {
      assert.ok(metaIds.has(id), `meta.ts missing output "${id}"`);
    }
  });

  it("word banks are the documented sizes with no empty entries", () => {
    assert.equal(TEMPLATES.length, 3);
    assert.equal(SUBJECTS.length, 3);
    assert.equal(EMAIL_STAGES.length, 3);
    assert.equal(PLACEHOLDERS.length, 5);
    for (let i = 0; i < 3; i++) {
      assert.ok(TEMPLATES[i].trim().length > 0);
      assert.equal(SUBJECTS[i].length, 4, `subject bank ${i + 1}`);
      for (const s of SUBJECTS[i]) assert.ok(s.trim().length > 0);
    }
    assert.equal(TONES.length, 4);
  });

  it("defaults tone to friendly when omitted", () => {
    const r = runTool({
      storeName: "Shop",
      productName: "Widget",
      emailNumber: 1,
    });
    assert.equal(r.ok, true);
  });
});
