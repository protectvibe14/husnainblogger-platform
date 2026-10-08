import { test } from "node:test";
import assert from "node:assert";
import { runTool, CONTENT_TYPES, TOPIC_DEPTHS, DISCLAIMER } from "./logic.ts";

const OUTPUT_IDS = [
  "durationRange",
  "minMinutes",
  "maxMinutes",
  "rationale",
  "retentionEstimate",
  "disclaimer",
];

test("happy path: tutorial quick-answer", () => {
  const r = runTool({ contentType: "tutorial", topicDepth: "quick-answer" });
  assert.strictEqual(r.ok, true);
  const v = r.values!;
  assert.deepStrictEqual(Object.keys(v).sort(), OUTPUT_IDS.sort());
  assert.strictEqual(v.durationRange, "5–8 minutes");
  assert.strictEqual(v.minMinutes, 5);
  assert.strictEqual(v.maxMinutes, 8);
  assert.ok((v.rationale as string[]).length >= 2);
});

test("happy path: essay deep-dive", () => {
  const r = runTool({ contentType: "essay", topicDepth: "deep-dive" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.durationRange, "15–30 minutes");
});

test("happy path: shorts returns sub-minute band", () => {
  const r = runTool({ contentType: "shorts", topicDepth: "quick-answer" });
  assert.strictEqual(r.ok, true);
  assert.ok((r.values!.durationRange as string).includes("seconds"));
});

test("happy path: all 10 combinations resolve", () => {
  for (const ct of CONTENT_TYPES) {
    for (const td of TOPIC_DEPTHS) {
      const r = runTool({ contentType: ct, topicDepth: td });
      assert.strictEqual(r.ok, true, `${ct}:${td}`);
      assert.ok((r.values!.durationRange as string).length > 0);
    }
  }
});

test("retention estimate is labeled as estimate", () => {
  const r = runTool({ contentType: "review", topicDepth: "deep-dive" });
  assert.ok((r.values!.retentionEstimate as string).includes("estimate"));
});

test("disclaimer present and honest", () => {
  const r = runTool({ contentType: "vlog", topicDepth: "quick-answer" });
  assert.strictEqual(r.values!.disclaimer, DISCLAIMER);
  assert.ok(DISCLAIMER.includes("third-party"));
  assert.ok(DISCLAIMER.includes("not YouTube-published"));
});

test("disclaimer says no personalization without analytics", () => {
  assert.ok(DISCLAIMER.includes("your own channel analytics"));
});

test("validation: missing contentType", () => {
  const r = runTool({ topicDepth: "quick-answer" });
  assert.strictEqual(r.ok, false);
});

test("validation: unknown contentType", () => {
  const r = runTool({ contentType: "podcast", topicDepth: "quick-answer" });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("content type"));
});

test("validation: missing topicDepth", () => {
  const r = runTool({ contentType: "tutorial" });
  assert.strictEqual(r.ok, false);
});

test("validation: unknown topicDepth", () => {
  const r = runTool({ contentType: "tutorial", topicDepth: "medium" });
  assert.strictEqual(r.ok, false);
  assert.ok(r.error!.includes("topic depth"));
});

test("validation: empty values object", () => {
  const r = runTool({});
  assert.strictEqual(r.ok, false);
});

test("case-insensitive inputs", () => {
  const r = runTool({ contentType: "Tutorial", topicDepth: "QUICK-ANSWER" });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.values!.durationRange, "5–8 minutes");
});

test("min <= max for every band", () => {
  for (const ct of CONTENT_TYPES) {
    for (const td of TOPIC_DEPTHS) {
      const r = runTool({ contentType: ct, topicDepth: td });
      const v = r.values!;
      if (ct === "shorts") continue;
      assert.ok(
        (v.minMinutes as number) <= (v.maxMinutes as number),
        `${ct}:${td}`
      );
    }
  }
});

test("determinism: run twice identical", () => {
  const a = runTool({ contentType: "essay", topicDepth: "deep-dive" });
  const b = runTool({ contentType: "essay", topicDepth: "deep-dive" });
  assert.deepStrictEqual(a, b);
});

test("rationale bullets are non-empty strings", () => {
  const r = runTool({ contentType: "review", topicDepth: "quick-answer" });
  const bullets = r.values!.rationale as string[];
  assert.ok(bullets.length >= 2);
  for (const b of bullets) assert.ok(b.trim().length > 0);
});
