/**
 * Tests for tool-375 X Hashtag Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  seedOf,
  normalizeTagBody,
  topicTags,
  GENERIC_TAGS,
  LOW_HASHTAG_TOPICS,
  MIN_COUNT,
  MAX_COUNT,
  DEFAULT_COUNT,
  MAX_TOPIC_LENGTH,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const META_IDS = metaOutputs.map((o) => o.id).sort();

function metaMatch(values: Record<string, unknown>): void {
  assert.deepEqual(Object.keys(values).sort(), META_IDS, "runTool keys must equal meta.ts output ids");
}

function validTags(tags: string[]): void {
  for (const t of tags) {
    assert.ok(t.startsWith("#"), `tag must start with #: ${t}`);
    assert.ok(!/\s/.test(t), `tag must not contain spaces: ${t}`);
    assert.ok(/^#[\p{L}\p{N}_]+$/u.test(t), `tag has invalid chars: ${t}`);
  }
}

test("happy path: topic-derived tags come first", () => {
  const r = runTool({ topic: "freelance design", count: 3 });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  metaMatch(r.values);
  const v = r.values as { hashtags: string[]; usageNote: string };
  assert.equal(v.hashtags.length, 3);
  assert.equal(v.hashtags[0], "#FreelanceDesign");
  assert.ok(v.hashtags.includes("#Freelance"));
  assert.ok(v.hashtags.includes("#Design"));
  validTags(v.hashtags);
});

test("default count is 3 when count omitted", () => {
  const r = runTool({ topic: "coffee" });
  assert.equal(r.ok, true);
  assert.equal((r.values as { hashtags: string[] }).hashtags.length, DEFAULT_COUNT);
});

test("count 5 returns 5 unique tags", () => {
  const r = runTool({ topic: "home workouts", count: 5 });
  assert.equal(r.ok, true);
  const tags = (r.values as { hashtags: string[] }).hashtags;
  assert.equal(tags.length, 5);
  assert.equal(new Set(tags.map((t) => t.toLowerCase())).size, 5);
  validTags(tags);
});

test("count 1 returns a single tag", () => {
  const r = runTool({ topic: "photography", count: 1 });
  assert.equal(r.ok, true);
  assert.equal((r.values as { hashtags: string[] }).hashtags.length, 1);
});

test("count 0 -> error", () => {
  const r = runTool({ topic: "photography", count: 0 });
  assert.equal(r.ok, false);
  assert.match(r.error!, new RegExp(`between ${MIN_COUNT} and ${MAX_COUNT}`));
});

test("count 6 -> error", () => {
  const r = runTool({ topic: "photography", count: 6 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /between 1 and 5/);
});

test("count non-integer -> error", () => {
  const r = runTool({ topic: "photography", count: 2.5 });
  assert.equal(r.ok, false);
  assert.match(r.error!, /whole number/i);
});

test("missing topic -> error", () => {
  const r = runTool({ count: 3 });
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

test("topic with no letters or digits -> error", () => {
  const r = runTool({ topic: "!!! ???" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /letter or digit/i);
});

test("leading # in topic is stripped", () => {
  const r = runTool({ topic: "#coffee", count: 1 });
  assert.equal(r.ok, true);
  assert.equal((r.values as { hashtags: string[] }).hashtags[0], "#Coffee");
});

test("usageNote carries the best-practice cap and the no-trend-data label", () => {
  const r = runTool({ topic: "travel" });
  assert.equal(r.ok, true);
  const note = (r.values as { usageNote: string }).usageNote;
  assert.match(note, /0–2 hashtags per post/i);
  assert.match(note, /NOT live trending data/i);
});

test("low-hashtag-culture topic gets the honest note", () => {
  const r = runTool({ topic: "tax advice for freelancers" });
  assert.equal(r.ok, true);
  const note = (r.values as { usageNote: string }).usageNote;
  assert.match(note, /hashtags add little value/i);
});

test("regular topic does not get the low-culture note", () => {
  const r = runTool({ topic: "street photography" });
  assert.equal(r.ok, true);
  const note = (r.values as { usageNote: string }).usageNote;
  assert.ok(!/hashtags add little value/i.test(note));
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool({ topic: "ai tools", count: 4 });
  const b = runTool({ topic: "ai tools", count: 4 });
  assert.deepEqual(a, b);
});

test("documented bank sizes hold", () => {
  assert.equal(GENERIC_TAGS.length, 24);
  assert.equal(LOW_HASHTAG_TOPICS.length, 8);
});

test("topicTags: multi-word topic yields joined + word tags", () => {
  assert.deepEqual(topicTags("home office setup"), ["HomeOfficeSetup", "Home", "Office", "Setup"]);
});

test("topicTags: short words are skipped as standalone tags", () => {
  assert.deepEqual(topicTags("ai tools"), ["AiTools", "Tools"]);
});

test("normalizeTagBody strips spaces and punctuation", () => {
  assert.equal(normalizeTagBody("co-op_2024!"), "coop_2024");
});

test("seedOf is deterministic", () => {
  assert.equal(seedOf("hello"), seedOf("hello"));
  assert.notEqual(seedOf("hello"), seedOf("world"));
});
