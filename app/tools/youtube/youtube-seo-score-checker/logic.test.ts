import { test } from "node:test";
import assert from "node:assert";
import { runTool, DISCLAIMER, MAX_TAGS_CHARS } from "./logic.ts";

const OUTPUT_IDS = ["score", "grade", "checkResults", "fixes", "disclaimer"];

function perfectInput() {
  return {
    title: "budget travel tips for beginners",
    targetKeyword: "budget travel tips",
    description:
      "budget travel tips for beginners: save money on flights, hotels, and food with these proven strategies. " +
      "In this video I break down exactly how I travel for less. Timestamps below! Visit https://example.com for the full guide. " +
      "0:00 Intro\n2:15 Flights\n5:40 Hotels",
    tags: "budget travel tips, travel, cheap flights",
    chapters: "0:00 Intro\n2:15 Flights\n5:40 Hotels",
    thumbnailText: "TRAVEL CHEAP",
  };
}

test("happy path: perfect input scores 100, grade Excellent", () => {
  const r = runTool(perfectInput());
  assert.strictEqual(r.ok, true);
  const v = r.values!;
  assert.deepStrictEqual(Object.keys(v).sort(), OUTPUT_IDS.sort());
  assert.strictEqual(v.score, 100);
  assert.strictEqual(v.grade, "Excellent");
  assert.strictEqual((v.fixes as string[]).length, 0);
  assert.strictEqual((v.checkResults as string[]).length, 10);
  assert.ok((v.checkResults as string[]).every((s) => s.startsWith("PASS")));
});

test("weak input scores low with fixes", () => {
  const r = runTool({ title: "my video" });
  assert.strictEqual(r.ok, true);
  const v = r.values!;
  // Only titleLengthOk passes (10 pts); everything else fails.
  assert.strictEqual(v.score, 10);
  assert.strictEqual(v.grade, "Weak");
  assert.strictEqual((v.fixes as string[]).length, 9);
});

test("title too long fails titleLengthOk", () => {
  const r = runTool({ title: "a".repeat(80) });
  assert.strictEqual(r.ok, true);
  assert.ok((r.values!.checkResults as string[]).some((s) => s.includes("FAIL") && s.includes("70")));
});

test("title exactly 70 chars passes", () => {
  const r = runTool({ title: "a".repeat(70) });
  assert.ok((r.values!.checkResults as string[]).some((s) => s.includes("PASS") && s.includes("70")));
});

test("keyword not front-loaded fails front-load check", () => {
  const r = runTool({
    title: "the ultimate guide to everything about budget travel tips here",
    targetKeyword: "budget travel tips",
  });
  const results = r.values!.checkResults as string[];
  const front = results.find((s) => s.includes("front-loaded"));
  assert.ok(front!.startsWith("FAIL"));
});

test("missing keyword fails all 4 keyword checks", () => {
  const r = runTool(perfectInput());
  const noKw = runTool({ ...perfectInput(), targetKeyword: "" });
  assert.ok((noKw.values!.score as number) < (r.values!.score as number));
  const fails = (noKw.values!.checkResults as string[]).filter((s) => s.startsWith("FAIL"));
  assert.strictEqual(fails.length, 4); // titleHasKeyword, frontLoaded, descFirst150, tagRelevance
});

test("chapters not starting at 0:00 fail", () => {
  const r = runTool({
    ...perfectInput(),
    chapters: "1:00 Intro\n2:15 Flights",
  });
  const results = r.values!.checkResults as string[];
  const ch = results.find((s) => s.includes("chapter"));
  assert.ok(ch!.startsWith("FAIL"));
});

test("no chapters fail chapters check", () => {
  const r = runTool({ ...perfectInput(), chapters: "" });
  const ch = (r.values!.checkResults as string[]).find((s) => s.includes("chapter"));
  assert.ok(ch!.startsWith("FAIL"));
});

test("no link fails descHasLink", () => {
  const r = runTool({ ...perfectInput(), description: "budget travel tips for beginners. " + "x".repeat(300) });
  const link = (r.values!.checkResults as string[]).find((s) => s.includes("link"));
  assert.ok(link!.startsWith("FAIL"));
});

test("tags over 500 chars fail tagsOk", () => {
  const longTags = "tag,".repeat(200); // 800 chars
  assert.ok(longTags.length > MAX_TAGS_CHARS);
  const r = runTool({ ...perfectInput(), tags: longTags });
  const tags = (r.values!.checkResults as string[]).find((s) => s.includes("Tags present"));
  assert.ok(tags!.startsWith("FAIL"));
});

test("empty tags fail tagsOk", () => {
  const r = runTool({ ...perfectInput(), tags: "" });
  const tags = (r.values!.checkResults as string[]).find((s) => s.includes("Tags present"));
  assert.ok(tags!.startsWith("FAIL"));
});

test("irrelevant tags fail tagRelevance", () => {
  const r = runTool({ ...perfectInput(), tags: "gaming, cooking, football" });
  const rel = (r.values!.checkResults as string[]).find((s) => s.includes("matches the keyword"));
  assert.ok(rel!.startsWith("FAIL"));
});

test("missing thumbnail text fails thumbnail check", () => {
  const r = runTool({ ...perfectInput(), thumbnailText: "" });
  const th = (r.values!.checkResults as string[]).find((s) => s.includes("Thumbnail text"));
  assert.ok(th!.startsWith("FAIL"));
});

test("disclaimer present and honest about ranking", () => {
  const r = runTool(perfectInput());
  assert.strictEqual(r.values!.disclaimer, DISCLAIMER);
  assert.ok(DISCLAIMER.includes("metadata completeness"));
  assert.ok(DISCLAIMER.includes("not a ranking prediction"));
  assert.ok(DISCLAIMER.includes("no ranking formula"));
});

test("grade bands", () => {
  // 75 points -> Good
  const partial = runTool({
    title: "budget travel tips for beginners",
    targetKeyword: "budget travel tips",
    description: "x".repeat(250),
    tags: "budget travel tips",
  });
  // 15+10+10+10+0+0+0+10+10+0 = 65 -> Needs work
  assert.strictEqual(partial.values!.score, 65);
  assert.strictEqual(partial.values!.grade, "Needs work");
});

test("validation: missing title", () => {
  const r = runTool({ description: "hello" });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error);
});

test("validation: empty title", () => {
  const r = runTool({ title: "   " });
  assert.strictEqual(r.ok, false);
});

test("validation: title over 500 chars", () => {
  const r = runTool({ title: "a".repeat(501) });
  assert.strictEqual(r.ok, false);
});

test("keyword matching is case-insensitive", () => {
  const r = runTool({
    ...perfectInput(),
    title: "BUDGET TRAVEL TIPS for Beginners",
  });
  const kw = (r.values!.checkResults as string[]).find((s) =>
    s.includes("contains the target keyword")
  );
  assert.ok(kw!.startsWith("PASS"));
});

test("weights sum to 100", () => {
  const r = runTool(perfectInput());
  assert.strictEqual(r.values!.score, 100); // all 10 pass = 100
});

test("determinism: run twice identical", () => {
  const a = runTool(perfectInput());
  const b = runTool(perfectInput());
  assert.deepStrictEqual(a, b);
});
