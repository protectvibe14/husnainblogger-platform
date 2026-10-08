/**
 * Tests for tool-372 X Thread Splitter logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  weightedLength,
  sentences,
  NUMBERING_STYLES,
  DEFAULT_MAX_CHARS,
  DEFAULT_RESERVE,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const META_IDS = metaOutputs.map((o) => o.id).sort();

function metaMatch(values: Record<string, unknown>): void {
  assert.deepEqual(Object.keys(values).sort(), META_IDS, "runTool keys must equal meta.ts output ids");
}

const LONG =
  "The quick brown fox jumps over the lazy dog. " +
  "Pack my box with five dozen liquor jugs. " +
  "How vexingly quick daft zebras jump! " +
  "The five boxing wizards jump quickly. " +
  "Jackdaws love my big sphinx of quartz. " +
  "Weave a circle round him thrice. " +
  "Amazingly few discotheques provide jukeboxes. " +
  "Heavy boxes perform quick waltzes and jigs. ".repeat(12);

test("happy path: splits into multiple posts, each within 280 weighted chars, markers present", () => {
  const r = runTool({ longText: LONG });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  metaMatch(r.values);
  const { tweets, summary } = r.values as { tweets: string[]; summary: string };
  assert.ok(tweets.length >= 2, `expected multiple posts, got ${tweets.length}`);
  for (let i = 0; i < tweets.length; i++) {
    assert.ok(weightedLength(tweets[i]) <= DEFAULT_MAX_CHARS, `post ${i + 1} over budget`);
    assert.ok(tweets[i].endsWith(` ${i + 1}/${tweets.length}`), `post ${i + 1} missing marker: ${tweets[i].slice(-20)}`);
  }
  assert.match(summary, /Split into \d+ posts/);
});

test("short text still works: single post gets 1/1", () => {
  const r = runTool({ longText: "Hello world, this is a short post." });
  assert.equal(r.ok, true);
  const { tweets } = r.values as { tweets: string[] };
  assert.equal(tweets.length, 1);
  assert.ok(tweets[0].endsWith(" 1/1"));
});

test('numberingStyle "(1/N)" wraps the marker in parentheses', () => {
  const r = runTool({ longText: LONG, numberingStyle: "(1/N)" });
  assert.equal(r.ok, true);
  const { tweets } = r.values as { tweets: string[] };
  assert.ok(tweets[0].endsWith(` (1/${tweets.length})`));
  for (const t of tweets) assert.ok(weightedLength(t) <= DEFAULT_MAX_CHARS);
});

test('numberingStyle "none" adds no marker', () => {
  const r = runTool({ longText: LONG, numberingStyle: "none" });
  assert.equal(r.ok, true);
  const { tweets } = r.values as { tweets: string[] };
  for (const t of tweets) {
    assert.ok(!/\/\d+\s*$/.test(t), `unexpected marker: ${t.slice(-10)}`);
    assert.ok(weightedLength(t) <= DEFAULT_MAX_CHARS);
  }
});

test("invalid numberingStyle -> error", () => {
  const r = runTool({ longText: "some text here", numberingStyle: "1-2" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Numbering style/i);
});

test("missing longText -> error", () => {
  const r = runTool({});
  assert.equal(r.ok, false);
  assert.match(r.error!, /paste the text/i);
});

test("blank longText -> error", () => {
  const r = runTool({ longText: "   \n  " });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("input over max chars -> error", () => {
  const r = runTool({ longText: "x".repeat(MAX_INPUT_CHARS + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, new RegExp(String(MAX_INPUT_CHARS)));
});

test("reserveChars non-integer -> error", () => {
  const r = runTool({ longText: "hello world", reserveChars: 2.5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /whole number/i);
});

test("reserveChars out of range -> error", () => {
  const r = runTool({ longText: "hello world", reserveChars: 41 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 0 and 40/);
});

test("reserveChars too large for maxChars -> error", () => {
  const r = runTool({ longText: "hello world", maxChars: 50, reserveChars: 40 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /too little room/i);
});

test("maxChars out of range -> error", () => {
  const r = runTool({ longText: "hello world", maxChars: 49 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 50 and 280/);
});

test("URLs are kept whole and counted as 23", () => {
  const url = "https://example.com/a/very/long/path/that/goes/on/and/on?x=1&y=2";
  const r = runTool({ longText: `${LONG} Visit ${url} for details. ${LONG}` });
  assert.equal(r.ok, true);
  const { tweets } = r.values as { tweets: string[] };
  const withUrl = tweets.filter((t) => t.includes("https://example.com"));
  assert.ok(withUrl.length >= 1);
  for (const t of withUrl) assert.ok(t.includes(url), "URL was broken mid-token");
  assert.equal(weightedLength(url), 23);
});

test("never splits mid-word: every original word survives whole", () => {
  const r = runTool({ longText: LONG });
  assert.equal(r.ok, true);
  const { tweets } = r.values as { tweets: string[] };
  const stripped = tweets.map((t) => t.replace(/\s+\d+\/\d+$/, ""));
  const originalWords = LONG.split(/\s+/).filter(Boolean);
  const splitWords = stripped.join(" ").split(/\s+/).filter(Boolean);
  assert.deepEqual(splitWords.sort(), originalWords.sort());
});

test("CJK text counted double and noted", () => {
  assert.equal(weightedLength("日本語"), 6);
  const text = "日本語のテストです。".repeat(30);
  const r = runTool({ longText: text });
  assert.equal(r.ok, true);
  const { tweets, summary } = r.values as { tweets: string[]; summary: string };
  for (const t of tweets) assert.ok(weightedLength(t) <= DEFAULT_MAX_CHARS);
  assert.match(summary, /2 characters each/);
});

test("very long unbreakable token does not crash and stays in budget", () => {
  const token = "z".repeat(500);
  const r = runTool({ longText: `Start ${token} end.` });
  assert.equal(r.ok, true);
  const { tweets } = r.values as { tweets: string[] };
  for (const t of tweets) assert.ok(weightedLength(t) <= DEFAULT_MAX_CHARS);
  assert.ok(tweets.join("").includes("z".repeat(10)));
});

test("custom maxChars 140 respected", () => {
  const r = runTool({ longText: LONG, maxChars: 140 });
  assert.equal(r.ok, true);
  const { tweets } = r.values as { tweets: string[] };
  for (const t of tweets) assert.ok(weightedLength(t) <= 140);
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool({ longText: LONG, numberingStyle: "(1/N)" });
  const b = runTool({ longText: LONG, numberingStyle: "(1/N)" });
  assert.deepEqual(a, b);
});

test("numbering styles list matches the enum", () => {
  assert.deepEqual([...NUMBERING_STYLES].sort(), ["(1/N)", "1/N", "none"]);
});

test("defaults are 280 maxChars and 8 reserve", () => {
  assert.equal(DEFAULT_MAX_CHARS, 280);
  assert.equal(DEFAULT_RESERVE, 8);
});

test("sentences helper keeps punctuation attached", () => {
  const s = sentences("Hello world. How are you? Fine!");
  assert.deepEqual(s, ["Hello world.", "How are you?", "Fine!"]);
});
