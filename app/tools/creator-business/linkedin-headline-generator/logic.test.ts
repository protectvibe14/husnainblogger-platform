import test from "node:test";
import assert from "node:assert/strict";
import { runTool, STYLES } from "./logic.ts";

const GOOD = {
  role: "Web Designer",
  specialties: "branding, landing pages, SEO",
  proofPoint: "50+ projects shipped",
  style: "keyword-focused",
};

function stripCount(item: string): string {
  return item.replace(/ \(\d+\/220\)$/, "");
}

function charCount(item: string): number {
  const m = item.match(/\((\d+)\/220\)$/);
  return m ? Number(m[1]) : -1;
}

test("happy path: returns headlineOptions list and limitNote", () => {
  const r = runTool(GOOD);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.ok(Array.isArray(r.values.headlineOptions));
  assert.ok(r.values.headlineOptions.length > 0);
  assert.equal(typeof r.values.limitNote, "string");
});

test("output ids match meta.ts: headlineOptions, limitNote", () => {
  const r = runTool(GOOD);
  assert.ok(r.values);
  assert.deepEqual(Object.keys(r.values).sort(), [
    "headlineOptions",
    "limitNote",
  ]);
});

test("keyword-focused headline uses pipes and separators", () => {
  const r = runTool(GOOD);
  const first = stripCount(r.values!.headlineOptions[0]);
  assert.equal(first, "Web Designer | branding · landing pages · SEO");
});

test("specializing template fills slots", () => {
  const r = runTool(GOOD);
  const texts = r.values!.headlineOptions.map(stripCount);
  assert.ok(
    texts.includes("Web Designer specializing in branding and landing pages"),
  );
});

test("proof point is echoed when provided", () => {
  const r = runTool(GOOD);
  const texts = r.values!.headlineOptions.map(stripCount);
  assert.ok(
    texts.some((t) => t.includes("50+ projects shipped")),
    "expected a headline containing the proof point",
  );
});

test("proof point is absent when omitted", () => {
  const r = runTool({
    role: "Web Designer",
    specialties: "branding",
    style: "keyword-focused",
  });
  const texts = r.values!.headlineOptions.map(stripCount);
  assert.ok(texts.every((t) => !t.includes("50+ projects shipped")));
  assert.ok(texts.length > 0);
});

test("every headline is character-counted and within 220 chars", () => {
  const longProof =
    "I have personally helped more than two hundred happy clients across three continents grow their businesses with measurable results";
  const r = runTool({ ...GOOD, proofPoint: longProof });
  assert.equal(r.ok, true);
  for (const item of r.values!.headlineOptions) {
    const n = charCount(item);
    assert.ok(n >= 0, "missing (n/220) suffix on: " + item);
    assert.ok(n <= 220, "headline over 220 chars: " + item);
    assert.equal(stripCount(item).length, n, "count must match headline length");
  }
});

test("over-long role is truncated to exactly 220 chars", () => {
  const longRole = "X".repeat(300);
  const r = runTool({ role: longRole, style: "conversational" });
  assert.equal(r.ok, true);
  for (const item of r.values!.headlineOptions) {
    assert.ok(charCount(item) <= 220);
  }
  const texts = r.values!.headlineOptions.map(stripCount);
  assert.ok(texts.some((t) => t.length === 220 && t.endsWith("…")));
});

test("styles produce different headlines", () => {
  const a = runTool({ ...GOOD, style: "keyword-focused" });
  const b = runTool({ ...GOOD, style: "outcome-driven" });
  const c = runTool({ ...GOOD, style: "conversational" });
  assert.notDeepEqual(a.values!.headlineOptions, b.values!.headlineOptions);
  assert.notDeepEqual(b.values!.headlineOptions, c.values!.headlineOptions);
});

test("outcome-driven style includes an I-help framing", () => {
  const r = runTool({ ...GOOD, style: "outcome-driven" });
  const texts = r.values!.headlineOptions.map(stripCount);
  assert.ok(texts.some((t) => t.startsWith("I help clients win with branding")));
});

test("conversational style is casual", () => {
  const r = runTool({ ...GOOD, style: "conversational" });
  const texts = r.values!.headlineOptions.map(stripCount);
  assert.ok(texts.some((t) => t.includes("Hi, I'm a Web Designer")));
});

test("no specialties: fallback templates still produce options", () => {
  const r = runTool({ role: "Copywriter", style: "keyword-focused" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.headlineOptions.length > 0);
  const texts = r.values!.headlineOptions.map(stripCount);
  assert.ok(texts.includes("Copywriter | Open to new projects"));
});

test("options are unique", () => {
  const r = runTool(GOOD);
  const seen = new Set(r.values!.headlineOptions.map((o) => o.toLowerCase()));
  assert.equal(seen.size, r.values!.headlineOptions.length);
});

test("determinism: same inputs run twice give identical output", () => {
  const a = runTool(GOOD);
  const b = runTool(GOOD);
  assert.deepEqual(a, b);
});

test("missing role returns a human error", () => {
  const r = runTool({ style: "keyword-focused" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /role/i);
});

test("blank role returns a human error", () => {
  const r = runTool({ role: "   ", style: "keyword-focused" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /role/i);
});

test("invalid style returns a human error listing options", () => {
  const r = runTool({ role: "Designer", style: "formal" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /keyword-focused, outcome-driven, conversational/);
});

test("missing style returns a human error", () => {
  const r = runTool({ role: "Designer" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /style/i);
});

test("limitNote explains the 220-char limit and unverified proof", () => {
  const r = runTool(GOOD);
  assert.match(r.values!.limitNote, /220/);
  assert.match(r.values!.limitNote, /does not verify/i);
});

test("STYLES export lists the three documented styles", () => {
  assert.deepEqual(STYLES, [
    "keyword-focused",
    "outcome-driven",
    "conversational",
  ]);
});
