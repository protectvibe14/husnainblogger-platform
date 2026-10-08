/**
 * Tests for tool-374 X Thread Numbering Formatter logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  weightedLength,
  stripMarker,
  toTweetList,
  NUMBERING_STYLES,
  POST_LIMIT,
  MAX_TWEETS,
  MAX_INPUT_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs } from "./meta.ts";

const META_IDS = metaOutputs.map((o) => o.id).sort();

function metaMatch(values: Record<string, unknown>): void {
  assert.deepEqual(Object.keys(values).sort(), META_IDS, "runTool keys must equal meta.ts output ids");
}

const THREE = "Hook tweet here\nMiddle tweet here\nFinal CTA tweet here";

test("happy path: 3 tweets numbered 1/3..3/3 at the end", () => {
  const r = runTool({ tweets: THREE });
  assert.equal(r.ok, true);
  assert.ok(r.values);
  metaMatch(r.values);
  const v = r.values as { numberedTweets: string[]; flagged: string[]; note: string };
  assert.deepEqual(v.numberedTweets, [
    "Hook tweet here 1/3",
    "Middle tweet here 2/3",
    "Final CTA tweet here 3/3",
  ]);
  assert.deepEqual(v.flagged, []);
  assert.match(v.note, /Numbered 3 tweets/);
});

test('placement "start" puts the marker first', () => {
  const r = runTool({ tweets: THREE, placement: "start" });
  assert.equal(r.ok, true);
  const v = r.values as { numberedTweets: string[] };
  assert.ok(v.numberedTweets[0].startsWith("1/3 "));
  assert.ok(v.numberedTweets[2].startsWith("3/3 "));
});

test('style "(1/8)" wraps markers in parentheses', () => {
  const r = runTool({ tweets: THREE, numberingStyle: "(1/8)" });
  assert.equal(r.ok, true);
  const v = r.values as { numberedTweets: string[] };
  assert.deepEqual(v.numberedTweets, [
    "Hook tweet here (1/3)",
    "Middle tweet here (2/3)",
    "Final CTA tweet here (3/3)",
  ]);
});

test("existing numbering is stripped before re-numbering (no doubles)", () => {
  const r = runTool({ tweets: "1/3 Old hook\n(2/3) Old middle\nOld end 3/3" });
  assert.equal(r.ok, true);
  const v = r.values as { numberedTweets: string[]; note: string };
  assert.deepEqual(v.numberedTweets, ["Old hook 1/3", "Old middle 2/3", "Old end 3/3"]);
  assert.match(v.note, /Removed old numbering from 3 tweets/);
});

test("overflowing tweet is flagged, never cut", () => {
  const big = "x".repeat(278);
  const r = runTool({ tweets: `short one\n${big}` });
  assert.equal(r.ok, true);
  const v = r.values as { numberedTweets: string[]; flagged: string[]; note: string };
  assert.equal(v.flagged.length, 1);
  assert.match(v.flagged[0], /Post 2 is \d+ weighted characters? over/);
  // The tweet text itself is untouched apart from the marker.
  assert.ok(v.numberedTweets[1].startsWith(big));
  assert.match(v.note, /flagged above, not cut/);
});

test("exactly 25 tweets allowed; 26 -> error", () => {
  const ok25 = Array.from({ length: 25 }, (_, i) => `tweet ${i + 1}`).join("\n");
  const r = runTool({ tweets: ok25 });
  assert.equal(r.ok, true);
  assert.equal((r.values as { numberedTweets: string[] }).numberedTweets.length, 25);
  const tooMany = Array.from({ length: 26 }, (_, i) => `tweet ${i + 1}`).join("\n");
  const r2 = runTool({ tweets: tooMany });
  assert.equal(r2.ok, false);
  assert.match(r2.error!, new RegExp(String(MAX_TWEETS)));
});

test("single tweet gets 1/1", () => {
  const r = runTool({ tweets: "Just one post" });
  assert.equal(r.ok, true);
  assert.deepEqual((r.values as { numberedTweets: string[] }).numberedTweets, ["Just one post 1/1"]);
});

test("blank lines are skipped and noted", () => {
  const r = runTool({ tweets: "one\n\n\ntwo\n" });
  assert.equal(r.ok, true);
  const v = r.values as { numberedTweets: string[]; note: string };
  assert.equal(v.numberedTweets.length, 2);
  assert.match(v.note, /Skipped 3 blank lines/);
});

test("empty input -> error", () => {
  const r = runTool({ tweets: "   \n  " });
  assert.equal(r.ok, false);
  assert.match(r.error!, /one per line/i);
});

test("missing tweets -> error", () => {
  const r = runTool({});
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("invalid numberingStyle -> error", () => {
  const r = runTool({ tweets: "a\nb", numberingStyle: "1-3" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Numbering style/i);
});

test("invalid placement -> error", () => {
  const r = runTool({ tweets: "a\nb", placement: "middle" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /Placement/i);
});

test("input over max chars -> error", () => {
  const r = runTool({ tweets: "x".repeat(MAX_INPUT_CHARS + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, new RegExp(String(MAX_INPUT_CHARS)));
});

test("array input is accepted", () => {
  const r = runTool({ tweets: ["alpha", "beta"] });
  assert.equal(r.ok, true);
  assert.deepEqual((r.values as { numberedTweets: string[] }).numberedTweets, ["alpha 1/2", "beta 2/2"]);
});

test("URL in a tweet counts 23 in the overflow check", () => {
  const r = runTool({ tweets: "see https://example.com/a/very/long/path/that/is/long?x=1 here" });
  assert.equal(r.ok, true);
  assert.deepEqual((r.values as { flagged: string[] }).flagged, []);
});

test("stripMarker removes leading and trailing markers", () => {
  assert.deepEqual(stripMarker("1/8 hello"), { text: "hello", stripped: true });
  assert.deepEqual(stripMarker("hello (2/8)"), { text: "hello", stripped: true });
  assert.deepEqual(stripMarker("plain text"), { text: "plain text", stripped: false });
});

test("toTweetList trims lines and counts skipped blanks", () => {
  const { tweets, skippedBlanks } = toTweetList("  a  \n\nb\n");
  assert.deepEqual(tweets, ["a", "b"]);
  assert.equal(skippedBlanks, 2);
});

test("numbered tweets all fit the budget when possible", () => {
  const r = runTool({ tweets: THREE });
  assert.equal(r.ok, true);
  const v = r.values as { numberedTweets: string[] };
  for (const t of v.numberedTweets) assert.ok(weightedLength(t) <= POST_LIMIT);
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool({ tweets: THREE, numberingStyle: "(1/8)", placement: "start" });
  const b = runTool({ tweets: THREE, numberingStyle: "(1/8)", placement: "start" });
  assert.deepEqual(a, b);
});

test("supported styles list is documented", () => {
  assert.deepEqual([...NUMBERING_STYLES], ["1/8", "(1/8)"]);
});
