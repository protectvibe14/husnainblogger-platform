import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  generateBannerCopy,
  trimToFit,
  CTA_BANK,
  SAFE_ZONE_NOTE,
  MAX_LINE_CHARS,
} from "./logic.ts";

// --- happy path ------------------------------------------------------------

test("happy path: tagline + offer -> 6 copy options", () => {
  const r = runTool({ tagline: "I help founders get customers", offer: "Free growth audit" });
  assert.equal(r.ok, true);
  const copy = r.values!.bannerCopy as string[];
  assert.equal(copy.length, 6);
  assert.ok(copy.every((line) => line.length <= MAX_LINE_CHARS));
  assert.equal(typeof r.values!.safeZoneNote, "string");
});

test("happy path: tagline only -> offer layouts skipped (3 options)", () => {
  const r = runTool({ tagline: "I help founders get customers" });
  assert.equal(r.ok, true);
  const copy = r.values!.bannerCopy as string[];
  assert.equal(copy.length, 3);
  assert.ok(copy[0].startsWith("I help founders"));
});

test("first option is the tagline itself", () => {
  const r = generateBannerCopy("Design tips daily", "");
  assert.equal(r.bannerCopy[0], "Design tips daily");
});

test("safe zone note mentions banner size and avatar overlap", () => {
  assert.ok(SAFE_ZONE_NOTE.includes("1500×500"));
  assert.ok(SAFE_ZONE_NOTE.includes("bottom-left"));
});

// --- truncation edge cases ---------------------------------------------------

test("long tagline is trimmed at word boundary, never mid-word", () => {
  const long = "This is a very long tagline that will definitely exceed sixty characters total";
  const r = runTool({ tagline: long });
  assert.equal(r.ok, true);
  const copy = r.values!.bannerCopy as string[];
  for (const line of copy) {
    assert.ok(line.length <= MAX_LINE_CHARS, `too long: ${line}`);
  }
  assert.ok(copy[0].endsWith("…"));
  // no mid-word cut: the cut happens right before a space in the original
  const cutAt = long.indexOf(copy[0].slice(0, -1));
  assert.ok(cutAt >= 0);
  const nextChar = long.charAt(cutAt + copy[0].length - 1);
  assert.ok(nextChar === " " || nextChar === "", `cut mid-word: next char is "${nextChar}"`);
});

test("trimToFit: short line untouched", () => {
  assert.equal(trimToFit("Hello world", 60), "Hello world");
});

test("trimToFit: exact-length line untouched", () => {
  const s = "x".repeat(60);
  assert.equal(trimToFit(s, 60), s);
});

test("trimToFit: single long word hard-truncates with ellipsis", () => {
  const out = trimToFit("a".repeat(100), 60);
  assert.equal(out.length, 60);
  assert.ok(out.endsWith("…"));
});

// --- validation errors ---------------------------------------------------------

test("error: missing tagline", () => {
  const r = runTool({ offer: "Free audit" });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("tagline"));
});

test("error: empty tagline", () => {
  const r = runTool({ tagline: "   " });
  assert.equal(r.ok, false);
});

test("error: tagline over 200 chars", () => {
  const r = runTool({ tagline: "x".repeat(201) });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("200"));
});

test("error: offer over 200 chars", () => {
  const r = runTool({ tagline: "Short", offer: "y".repeat(201) });
  assert.equal(r.ok, false);
});

// --- determinism & bank bounds --------------------------------------------------

test("deterministic: same inputs -> identical output", () => {
  const a = runTool({ tagline: "I help founders get customers", offer: "Free growth audit" });
  const b = runTool({ tagline: "I help founders get customers", offer: "Free growth audit" });
  assert.deepEqual(a, b);
});

test("output ids match meta.ts outputs", () => {
  const r = runTool({ tagline: "Test tagline" });
  assert.deepEqual(Object.keys(r.values!).sort(), ["bannerCopy", "safeZoneNote"].sort());
});

test("bank bounds: 6 layouts-worth of options, 6 CTAs", () => {
  assert.equal(CTA_BANK.length, 6);
  assert.ok(CTA_BANK.every((c) => c.length > 0 && c.length <= 40));
  assert.equal(MAX_LINE_CHARS, 60);
});
