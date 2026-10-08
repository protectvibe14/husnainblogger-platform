import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  buildPlan,
  SLIDE_ANGLE_BANK,
  MAX_SLIDES,
  MIN_SLIDES,
  MAX_WORDS_PER_SLIDE,
  MAX_WORDS_COVER,
  PLAN_GUIDANCE,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values as Record<string, unknown>;
}

test("output ids match meta.ts outputs", () => {
  const v = okValues({ carouselTopic: "meal prep", slideCount: 5 });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("validation: empty carouselTopic errors", () => {
  assert.strictEqual(
    runTool({ carouselTopic: "  ", slideCount: 5 }).ok,
    false
  );
});

test("validation: missing carouselTopic errors", () => {
  assert.strictEqual(runTool({ slideCount: 5 }).ok, false);
});

test("validation: slideCount below 2 errors", () => {
  const res = runTool({ carouselTopic: "meal prep", slideCount: 1 });
  assert.strictEqual(res.ok, false);
  assert.ok(res.error && res.error.includes("2"));
});

test("validation: slideCount 0 errors", () => {
  assert.strictEqual(runTool({ carouselTopic: "x", slideCount: 0 }).ok, false);
});

test("validation: non-integer slideCount errors", () => {
  assert.strictEqual(runTool({ carouselTopic: "x", slideCount: 4.5 }).ok, false);
});

test("validation: non-numeric slideCount errors", () => {
  assert.strictEqual(runTool({ carouselTopic: "x", slideCount: "many" }).ok, false);
});

test("validation: missing slideCount errors", () => {
  assert.strictEqual(runTool({ carouselTopic: "x" }).ok, false);
});

test("error message is human-readable", () => {
  const res = runTool({ carouselTopic: "", slideCount: 5 });
  assert.ok(res.error && res.error.length > 10);
});

test("happy path: correct slide count and roles", () => {
  const v = okValues({ carouselTopic: "meal prep", slideCount: 5 });
  const plan = v["slidePlan"] as string[];
  assert.strictEqual(plan.length, 5);
  assert.ok(plan[0].includes("cover"), plan[0]);
  assert.ok(plan[4].includes("cta"), plan[4]);
  assert.ok(plan[1].includes("value") && plan[2].includes("value") && plan[3].includes("value"));
});

test("happy path: minimum 2 slides = cover + CTA", () => {
  const v = okValues({ carouselTopic: "study tips", slideCount: 2 });
  const plan = v["slidePlan"] as string[];
  assert.strictEqual(plan.length, 2);
  assert.ok(plan[0].includes("cover"));
  assert.ok(plan[1].includes("cta"));
});

test("happy path: topic appears in every slide", () => {
  const v = okValues({ carouselTopic: "home workouts", slideCount: 6 });
  for (const s of v["slidePlan"] as string[]) {
    assert.ok(s.includes("home workouts"), s);
  }
});

test("edge case: slideCount > 35 clamps with honesty note", () => {
  const v = okValues({ carouselTopic: "travel", slideCount: 50 });
  const plan = v["slidePlan"] as string[];
  assert.strictEqual(plan.length, MAX_SLIDES);
  const note = v["note"] ?? v["planNote"];
  assert.ok(
    (note as string).includes("clamped to 35") &&
      (note as string).includes("50"),
    String(note)
  );
});

test("edge case: exactly 35 slides passes without clamp note", () => {
  const v = okValues({ carouselTopic: "travel", slideCount: 35 });
  assert.strictEqual((v["slidePlan"] as string[]).length, 35);
  assert.ok(!(v["planNote"] as string).includes("clamped"));
});

test("determinism: same input → identical output", () => {
  const input = { carouselTopic: "gardening", slideCount: 7 };
  assert.deepStrictEqual(runTool(input), runTool(input));
});

test("word-bank bounds: 8 angle templates, no empty picks", () => {
  assert.strictEqual(SLIDE_ANGLE_BANK.length, 8);
  const plan = buildPlan("niche", 20);
  for (const s of plan) {
    assert.ok(s.plan.trim().length > 0);
    assert.ok(s.textGuidance.trim().length > 0);
    assert.ok(["cover", "value", "cta"].includes(s.role));
  }
});

test("angle templates cycle for long carousels", () => {
  const plan = buildPlan("niche", 12); // 10 value slides > 8 angles
  const valuePlans = plan.filter((s) => s.role === "value").map((s) => s.plan);
  assert.strictEqual(valuePlans.length, 10);
  const angleOf = (p: string) => p.split(": ").slice(1).join(": ");
  assert.strictEqual(angleOf(valuePlans[0]), angleOf(valuePlans[8])); // cycled
  assert.notStrictEqual(angleOf(valuePlans[0]), angleOf(valuePlans[1]));
});

test("guidance mentions word limits", () => {
  const v = okValues({ carouselTopic: "x", slideCount: 3 });
  assert.ok((v["guidance"] as string).includes(String(MAX_WORDS_PER_SLIDE)));
  assert.ok((v["guidance"] as string).includes(String(MAX_WORDS_COVER)));
  assert.strictEqual(v["guidance"], PLAN_GUIDANCE);
});

test("string slideCount coerced to number", () => {
  const v = okValues({ carouselTopic: "x", slideCount: "6" });
  assert.strictEqual((v["slidePlan"] as string[]).length, 6);
});

test("constants: 2–35 range documented", () => {
  assert.strictEqual(MIN_SLIDES, 2);
  assert.strictEqual(MAX_SLIDES, 35);
});
