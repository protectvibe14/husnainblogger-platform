import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  fontSizeFor,
  FONT_TIERS,
  THEME_COLORS,
  MAX_QUOTE_CHARS,
  MAX_AUTHOR_CHARS,
  SQUARE_MAX_CHARS,
  SQUARE_SIZE,
  LANDSCAPE_SIZE,
} from "./logic.ts";

const item = (overrides: Record<string, unknown> = {}) => ({
  quoteText: "Consistency beats intensity every single time.",
  author: "Alex",
  theme: "dark",
  ...overrides,
});

// --- happy path ------------------------------------------------------------

test("happy path: one item -> card summary + downloadable spec", () => {
  const r = runTool({ items: [item()] });
  assert.equal(r.ok, true);
  const cards = r.values!.cards as string[];
  assert.equal(cards.length, 1);
  assert.ok(cards[0].includes("Card 1: dark theme"));
  assert.ok(cards[0].includes("1080×1080")); // 46 chars -> square
  assert.ok(cards[0].includes("— Alex"));
  const spec = JSON.parse(r.values!.specDownload as string);
  assert.equal(spec.version, 1);
  assert.equal(spec.cards.length, 1);
  assert.equal(spec.cards[0].text, item().quoteText);
  assert.equal(spec.cards[0].theme, "dark");
  assert.deepEqual(spec.cards[0].colors, THEME_COLORS.dark);
});

test("happy path: author optional", () => {
  const r = runTool({ items: [item({ author: "" })] });
  assert.equal(r.ok, true);
  assert.ok(!(r.values!.cards as string[])[0].includes("— "));
});

test("happy path: multiple items, themes, mixed sizes", () => {
  const r = runTool({
    items: [
      item({ quoteText: "Short quote.", theme: "light" }),
      item({ quoteText: "x".repeat(200), author: "", theme: "brand" }),
    ],
  });
  assert.equal(r.ok, true);
  const cards = r.values!.cards as string[];
  assert.equal(cards.length, 2);
  assert.ok(cards[0].includes("light theme"));
  assert.ok(cards[1].includes("1200×675")); // 200 chars -> landscape
  const spec = JSON.parse(r.values!.specDownload as string);
  assert.equal(spec.cards[1].colors.bg, "#1D9BF0");
});

// --- theme handling ----------------------------------------------------------

test("empty theme defaults to dark (no error)", () => {
  const r = runTool({ items: [item({ theme: "" })] });
  assert.equal(r.ok, true);
  assert.ok((r.values!.cards as string[])[0].includes("dark theme"));
});

test("unknown theme defaults to dark (no error)", () => {
  const r = runTool({ items: [item({ theme: "neon" })] });
  assert.equal(r.ok, true);
  const spec = JSON.parse(r.values!.specDownload as string);
  assert.equal(spec.cards[0].theme, "dark");
});

test("theme matching is case-insensitive", () => {
  const r = runTool({ items: [item({ theme: "Light" })] });
  assert.equal(r.ok, true);
  const spec = JSON.parse(r.values!.specDownload as string);
  assert.equal(spec.cards[0].theme, "light");
});

// --- size & font tiers ----------------------------------------------------------

test("square/landscape boundary at 120 chars", () => {
  const sq = runTool({ items: [item({ quoteText: "q".repeat(SQUARE_MAX_CHARS) })] });
  assert.ok((sq.values!.cards as string[])[0].includes(`${SQUARE_SIZE.width}×${SQUARE_SIZE.height}`));
  const ls = runTool({ items: [item({ quoteText: "q".repeat(SQUARE_MAX_CHARS + 1) })] });
  assert.ok((ls.values!.cards as string[])[0].includes(`${LANDSCAPE_SIZE.width}×${LANDSCAPE_SIZE.height}`));
});

test("font-size tiers follow documented breakpoints", () => {
  assert.equal(fontSizeFor(60), 64);
  assert.equal(fontSizeFor(61), 52);
  assert.equal(fontSizeFor(120), 52);
  assert.equal(fontSizeFor(121), 44);
  assert.equal(fontSizeFor(180), 44);
  assert.equal(fontSizeFor(181), 38);
  assert.equal(fontSizeFor(240), 38);
  assert.equal(fontSizeFor(241), 34);
  assert.equal(fontSizeFor(280), 34);
  assert.equal(fontSizeFor(999), 34); // floor never goes below 34
  assert.equal(FONT_TIERS.length, 5);
});

test("emoji passes through untouched", () => {
  const r = runTool({ items: [item({ quoteText: "Ship it! 🚀 Consistency wins 🏆" })] });
  assert.equal(r.ok, true);
  const spec = JSON.parse(r.values!.specDownload as string);
  assert.ok(spec.cards[0].text.includes("🚀"));
});

// --- validation errors ------------------------------------------------------------

test("error: no items", () => {
  const r = runTool({ items: [] });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("at least one"));
});

test("error: missing items array", () => {
  const r = runTool({} as never);
  assert.equal(r.ok, false);
});

test("error: item 2 missing quote text (numbered)", () => {
  const r = runTool({ items: [item(), item({ quoteText: "   " })] });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).startsWith("Item 2:"));
});

test("error: quote over 280 chars", () => {
  const r = runTool({ items: [item({ quoteText: "q".repeat(MAX_QUOTE_CHARS + 1) })] });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("281"));
  assert.ok((r.error as string).includes("280"));
});

test("quote at exactly 280 chars passes", () => {
  const r = runTool({ items: [item({ quoteText: "q".repeat(MAX_QUOTE_CHARS) })] });
  assert.equal(r.ok, true);
});

test("error: author over 80 chars", () => {
  const r = runTool({ items: [item({ author: "a".repeat(MAX_AUTHOR_CHARS + 1) })] });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("80"));
});

test("error: more than 20 items", () => {
  const r = runTool({ items: Array.from({ length: 21 }, () => item()) });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("20"));
});

// --- determinism & ids ---------------------------------------------------------------

test("deterministic: same items -> identical output", () => {
  const a = runTool({ items: [item(), item({ theme: "light", author: "Sam" })] });
  const b = runTool({ items: [item(), item({ theme: "light", author: "Sam" })] });
  assert.deepEqual(a, b);
});

test("output ids match meta.ts outputs", () => {
  const r = runTool({ items: [item()] });
  assert.deepEqual(Object.keys(r.values!).sort(), ["cards", "specDownload"].sort());
});

test("theme colors are the documented fixed values", () => {
  assert.deepEqual(THEME_COLORS.dark, { bg: "#0F1419", text: "#FFFFFF", accent: "#1D9BF0" });
  assert.deepEqual(THEME_COLORS.light, { bg: "#FFFFFF", text: "#0F1419", accent: "#1D9BF0" });
  assert.deepEqual(THEME_COLORS.brand, { bg: "#1D9BF0", text: "#FFFFFF", accent: "#0F1419" });
});
