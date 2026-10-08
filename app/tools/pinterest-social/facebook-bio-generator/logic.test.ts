/**
 * Tests for tool-386 Facebook Bio Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  BIO_MODES,
  PERSONAL_BIO_LIMIT,
  PAGE_BIO_LIMIT,
  PERSONAL_TEMPLATES,
  PAGE_TEMPLATES,
  VARIANT_COUNT,
  MAX_WHO_LENGTH,
  MAX_WHAT_LENGTH,
  truncateToLimit,
} from "./logic.ts";

const BASE = { whoYouAre: "Sara Malik", whatYouDo: "baking custom cakes in Chicago", mode: "personal" };

test("happy path personal: bio within 101 chars and all output ids present", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  const v = r.values!;
  assert.equal(typeof v.bio, "string");
  assert.ok(v.bio.length <= PERSONAL_BIO_LIMIT, `bio too long: ${v.bio.length}`);
  assert.ok(v.bio.includes("Sara Malik"));
  assert.ok(v.bio.includes("baking custom cakes in Chicago"));
  assert.ok(Array.isArray(v.variants) && v.variants.length === VARIANT_COUNT);
  for (const x of v.variants) assert.ok(x.length <= PERSONAL_BIO_LIMIT);
  assert.equal(typeof v.pageBio, "string");
  assert.ok(v.pageBio.length <= PAGE_BIO_LIMIT);
  assert.equal(typeof v.modeUsed, "string");
  assert.ok(v.modeUsed.includes("Personal profile"));
  assert.equal(typeof v.capNote, "string");
});

test("page mode: 255-char cap, mode labeled", () => {
  const r = runTool({ ...BASE, mode: "page" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.bio.length <= PAGE_BIO_LIMIT);
  assert.ok(r.values!.modeUsed.includes("Facebook Page"));
});

test("missing whoYouAre -> error", () => {
  const r = runTool({ whatYouDo: "x", mode: "personal" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /who you are/i);
});

test("empty whoYouAre -> error", () => {
  const r = runTool({ whoYouAre: "   ", whatYouDo: "x" });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("missing whatYouDo -> error", () => {
  const r = runTool({ whoYouAre: "Sara" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /what you do/i);
});

test("mode missing -> defaults to personal + pageBio bonus present", () => {
  const r = runTool({ whoYouAre: "Sara", whatYouDo: "cakes" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.modeUsed.includes("Personal profile"));
  assert.ok(r.values!.pageBio.length > 0);
  assert.ok(r.values!.pageBio.length <= PAGE_BIO_LIMIT);
});

test("invalid mode -> error", () => {
  const r = runTool({ ...BASE, mode: "business" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /personal.*page/i);
});

test("whoYouAre too long -> error", () => {
  const r = runTool({ ...BASE, whoYouAre: "x".repeat(MAX_WHO_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, /60/i);
});

test("whatYouDo too long -> error", () => {
  const r = runTool({ ...BASE, whatYouDo: "x".repeat(MAX_WHAT_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, /120/i);
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepEqual(a, b);
});

test("different inputs -> different bio (bank selection varies)", () => {
  const a = runTool(BASE).values!.bio;
  const b = runTool({ ...BASE, whatYouDo: "teaching yoga in Austin" }).values!.bio;
  assert.notEqual(a, b);
});

test("long inputs trigger truncation with ellipsis and capNote flags it", () => {
  const r = runTool({
    whoYouAre: "A".repeat(MAX_WHO_LENGTH),
    whatYouDo: "B".repeat(MAX_WHAT_LENGTH),
    mode: "personal",
  });
  assert.equal(r.ok, true);
  const v = r.values!;
  assert.ok(v.bio.length <= PERSONAL_BIO_LIMIT);
  assert.ok(v.bio.endsWith("…"), `expected ellipsis, got: ${v.bio}`);
  assert.match(v.capNote, /trimmed/i);
});

test("truncateToLimit: no truncation when within limit", () => {
  const r = truncateToLimit("short", 10);
  assert.equal(r.text, "short");
  assert.equal(r.truncated, false);
});

test("bank sizes documented: 6 personal + 6 page templates", () => {
  assert.equal(PERSONAL_TEMPLATES.length, 6);
  assert.equal(PAGE_TEMPLATES.length, 6);
  assert.deepEqual(BIO_MODES, ["personal", "page"]);
});

test("bank templates have no empty entries and contain placeholders", () => {
  for (const t of [...PERSONAL_TEMPLATES, ...PAGE_TEMPLATES]) {
    assert.ok(t.length > 0);
    assert.ok(t.includes("{who}") || t.includes("{what}"));
  }
});

test("mode is case-insensitive ('Page' works)", () => {
  const r = runTool({ ...BASE, mode: "Page" });
  assert.equal(r.ok, true);
  assert.ok(r.values!.modeUsed.includes("Facebook Page"));
});
