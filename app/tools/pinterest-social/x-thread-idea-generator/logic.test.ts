/**
 * Tests for tool-371 X Thread Idea Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  weightedLength,
  seedOf,
  fill,
  trimToLimit,
  HOOK_TEMPLATES,
  POINT_TEMPLATES,
  CTA_TEMPLATES,
  THREAD_LIMIT,
  MIN_TWEETS,
  MAX_TWEETS,
  DEFAULT_TWEETS,
  MAX_TOPIC_LENGTH,
  TOPIC_TOKEN,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const META_IDS = metaOutputs.map((o) => o.id).sort();

function metaMatch(values: Record<string, unknown>): void {
  assert.deepEqual(Object.keys(values).sort(), META_IDS, "runTool keys must equal meta.ts output ids");
}

test("happy path default: 7 tweets, hook first, CTA last, all within 280 weighted chars", () => {
  const r = runTool({ topic: "freelance copywriting" });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  metaMatch(r.values);
  const { thread, note } = r.values as { thread: Array<{ position: number; text: string; role: string }>; note: string };
  assert.equal(thread.length, DEFAULT_TWEETS);
  assert.equal(thread[0].position, 1);
  assert.equal(thread[0].role, "hook");
  assert.equal(thread[thread.length - 1].role, "cta");
  assert.equal(thread[thread.length - 1].position, DEFAULT_TWEETS);
  for (let i = 0; i < thread.length; i++) {
    assert.equal(thread[i].position, i + 1);
    if (i > 0 && i < thread.length - 1) assert.equal(thread[i].role, "point");
    assert.ok(!thread[i].text.includes(TOPIC_TOKEN), "placeholder must be filled");
    assert.ok(thread[i].text.includes("freelance copywriting"));
    assert.ok(weightedLength(thread[i].text) <= THREAD_LIMIT, `tweet ${i + 1} over budget`);
  }
  assert.equal(typeof note, "string");
  assert.ok(note.includes("7-tweet"));
});

test("custom tweetCount 5 produces 5 tweets", () => {
  const r = runTool({ topic: "email marketing", tweetCount: 5 });
  assert.equal(r.ok, true);
  assert.equal((r.values as { thread: unknown[] }).thread.length, 5);
});

test("minimum thread (2 tweets) = hook + CTA, no points", () => {
  const r = runTool({ topic: "notion templates", tweetCount: 2 });
  assert.equal(r.ok, true);
  const thread = (r.values as { thread: Array<{ role: string }> }).thread;
  assert.deepEqual(thread.map((t) => t.role), ["hook", "cta"]);
});

test("tweetCount 25 (max) works", () => {
  const r = runTool({ topic: "productivity systems for remote teams", tweetCount: 25 });
  assert.equal(r.ok, true);
  assert.equal((r.values as { thread: unknown[] }).thread.length, 25);
});

test("tweetCount 26 clamps to 25 with a note", () => {
  const r = runTool({ topic: "productivity systems for remote teams", tweetCount: 26 });
  assert.equal(r.ok, true);
  const v = r.values as { thread: unknown[]; note: string };
  assert.equal(v.thread.length, MAX_TWEETS);
  assert.match(v.note, /capped at 25/i);
});

test("tweetCount 1 -> error", () => {
  const r = runTool({ topic: "seo", tweetCount: 1 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /at least 2/i);
});

test("tweetCount non-integer -> error", () => {
  const r = runTool({ topic: "seo", tweetCount: 4.5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /whole number/i);
});

test("missing topic -> error", () => {
  const r = runTool({ tweetCount: 5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /topic/i);
});

test("blank topic -> error", () => {
  const r = runTool({ topic: "   " });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("topic over max length -> error", () => {
  const r = runTool({ topic: "x".repeat(MAX_TOPIC_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, new RegExp(String(MAX_TOPIC_LENGTH)));
});

test("thin topic with big tweetCount reduces to 8 with a note", () => {
  const r = runTool({ topic: "tax", tweetCount: 20 });
  assert.equal(r.ok, true);
  const v = r.values as { thread: unknown[]; note: string };
  assert.equal(v.thread.length, 8);
  assert.match(v.note, /reduced to 8/i);
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool({ topic: "ai automation", tweetCount: 6 });
  const b = runTool({ topic: "ai automation", tweetCount: 6 });
  assert.deepEqual(a, b);
});

test("different topics pick different templates (seeded, not random)", () => {
  const a = runTool({ topic: "aaa", tweetCount: 3 });
  const b = runTool({ topic: "aab", tweetCount: 3 });
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  const ta = (a.values as { thread: Array<{ text: string }> }).thread[0].text;
  const tb = (b.values as { thread: Array<{ text: string }> }).thread[0].text;
  assert.notEqual(ta, tb);
});

test("documented bank sizes hold", () => {
  assert.equal(HOOK_TEMPLATES.length, 10);
  assert.equal(POINT_TEMPLATES.length, 12);
  assert.equal(CTA_TEMPLATES.length, 8);
});

test("weightedLength: URL counts 23, ASCII counts 1", () => {
  assert.equal(weightedLength("https://example.com/some/long/path?x=1"), 23);
  assert.equal(weightedLength("abc"), 3);
});

test("weightedLength: non-ASCII counts 2", () => {
  assert.equal(weightedLength("日本"), 4);
});

test("trimToLimit trims at a word boundary with ellipsis", () => {
  const long = "word ".repeat(100).trim();
  const { text, trimmed } = trimToLimit(long, 50);
  assert.equal(trimmed, true);
  assert.ok(text.endsWith("…"));
  assert.ok(weightedLength(text) <= 50);
});

test("trimToLimit leaves in-budget text untouched", () => {
  const { text, trimmed } = trimToLimit("short text", 280);
  assert.equal(trimmed, false);
  assert.equal(text, "short text");
});

test("seedOf is deterministic and fill replaces the token", () => {
  assert.equal(seedOf("abc"), seedOf("abc"));
  assert.equal(fill("Hello {topic}!", "world"), "Hello world!");
});

test("unicode topic still fits budget", () => {
  const r = runTool({ topic: "café ☕ culture", tweetCount: 4 });
  assert.equal(r.ok, true);
  const thread = (r.values as { thread: Array<{ text: string }> }).thread;
  for (const t of thread) assert.ok(weightedLength(t.text) <= THREAD_LIMIT);
});
