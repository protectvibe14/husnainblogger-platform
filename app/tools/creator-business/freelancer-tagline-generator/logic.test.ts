import test from "node:test";
import assert from "node:assert/strict";
import { runTool, TONES } from "./logic.ts";

const GOOD = {
  serviceKeywords: "logo design",
  tone: "professional",
  taglineCount: 5,
};

test("happy path: returns taglineIdeas list", () => {
  const r = runTool(GOOD);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  assert.ok(Array.isArray(r.values.taglineIdeas));
  assert.equal(r.values.taglineIdeas.length, 5);
});

test("output ids match meta.ts: taglineIdeas", () => {
  const r = runTool(GOOD);
  assert.ok(r.values);
  assert.deepEqual(Object.keys(r.values), ["taglineIdeas"]);
});

test("keyword is inserted into the fixed templates", () => {
  const r = runTool({ serviceKeywords: "logo design", tone: "professional", taglineCount: 2 });
  assert.deepEqual(r.values!.taglineIdeas, [
    "logo design for businesses that demand results.",
    "Expert logo design — delivered on time, every time.",
  ]);
});

test("tones produce different taglines", () => {
  const a = runTool({ serviceKeywords: "copywriting", tone: "professional", taglineCount: 8 });
  const b = runTool({ serviceKeywords: "copywriting", tone: "friendly", taglineCount: 8 });
  const c = runTool({ serviceKeywords: "copywriting", tone: "bold", taglineCount: 8 });
  assert.notDeepEqual(a.values!.taglineIdeas, b.values!.taglineIdeas);
  assert.notDeepEqual(b.values!.taglineIdeas, c.values!.taglineIdeas);
  assert.notDeepEqual(a.values!.taglineIdeas, c.values!.taglineIdeas);
});

test("every tagline is non-empty and unique", () => {
  const r = runTool({
    serviceKeywords: "seo, branding, ads",
    tone: "bold",
    taglineCount: 24,
  });
  const seen = new Set(r.values!.taglineIdeas.map((t) => t.toLowerCase()));
  assert.equal(seen.size, r.values!.taglineIdeas.length);
  for (const t of r.values!.taglineIdeas) {
    assert.ok(t.trim().length > 10, "no empty or stub tagline");
    assert.ok(!t.includes("{S}"), "no unfilled template slot");
  }
});

test("taglineCount defaults to 10 when omitted", () => {
  const r = runTool({ serviceKeywords: "seo, ads", tone: "friendly" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.taglineIdeas.length, 10);
});

test("taglineCount of 1 returns a single tagline", () => {
  const r = runTool({ serviceKeywords: "seo", tone: "friendly", taglineCount: 1 });
  assert.equal(r.values!.taglineIdeas.length, 1);
});

test("taglineCount capped by available combinations (1 keyword = 8 taglines)", () => {
  const r = runTool({ serviceKeywords: "seo", tone: "friendly", taglineCount: 30 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.taglineIdeas.length, 8);
});

test("multiple keywords cycle through all 8 templates each", () => {
  const r = runTool({
    serviceKeywords: "seo, ads",
    tone: "professional",
    taglineCount: 16,
  });
  assert.equal(r.values!.taglineIdeas.length, 16);
  assert.ok(r.values!.taglineIdeas.slice(0, 8).every((t) => t.includes("seo")));
  assert.ok(r.values!.taglineIdeas.slice(8).every((t) => t.includes("ads")));
});

test("keywords accept comma and newline separated lists", () => {
  const r = runTool({
    serviceKeywords: "seo\nads, branding",
    tone: "bold",
    taglineCount: 3,
  });
  assert.equal(r.ok, true);
  assert.equal(r.values!.taglineIdeas.length, 3);
});

test("keyword kept exactly as typed (no forced casing)", () => {
  const r = runTool({
    serviceKeywords: "UX Research",
    tone: "professional",
    taglineCount: 1,
  });
  assert.ok(r.values!.taglineIdeas[0].includes("UX Research"));
});

test("more than 20 keywords are capped at 20", () => {
  const many = Array.from({ length: 30 }, (_, i) => "skill" + i).join(", ");
  const r = runTool({ serviceKeywords: many, tone: "bold", taglineCount: 30 });
  assert.equal(r.ok, true);
  assert.equal(r.values!.taglineIdeas.length, 30);
});

test("determinism: same inputs run twice give identical output", () => {
  const a = runTool(GOOD);
  const b = runTool(GOOD);
  assert.deepEqual(a, b);
});

test("missing serviceKeywords returns a human error", () => {
  const r = runTool({ tone: "professional", taglineCount: 5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least one service keyword/i);
});

test("blank serviceKeywords return a human error", () => {
  const r = runTool({ serviceKeywords: " , \n ", tone: "professional" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least one service keyword/i);
});

test("invalid tone returns a human error listing options", () => {
  const r = runTool({ serviceKeywords: "seo", tone: "sassy", taglineCount: 5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /professional, friendly, bold/);
});

test("missing tone returns a human error", () => {
  const r = runTool({ serviceKeywords: "seo", taglineCount: 5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /tone/i);
});

test("taglineCount of 0 is rejected", () => {
  const r = runTool({ serviceKeywords: "seo", tone: "bold", taglineCount: 0 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 1 and 30/);
});

test("taglineCount above 30 is rejected", () => {
  const r = runTool({ serviceKeywords: "seo", tone: "bold", taglineCount: 31 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 1 and 30/);
});

test("non-integer taglineCount is rejected", () => {
  const r = runTool({ serviceKeywords: "seo", tone: "bold", taglineCount: 2.5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /whole number/i);
});

test("negative taglineCount is rejected", () => {
  const r = runTool({ serviceKeywords: "seo", tone: "bold", taglineCount: -3 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 1 and 30/);
});

test("TONES export lists the three documented tones", () => {
  assert.deepEqual(TONES, ["professional", "friendly", "bold"]);
});
