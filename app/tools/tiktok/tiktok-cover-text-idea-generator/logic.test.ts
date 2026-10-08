import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  fillCover,
  COVER_BANK,
  BANK_SIZE,
  COVER_MAX_CHARS,
  IDEAS_COUNT,
  CLICKBAIT_NOTE,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values;
}

test("happy path: 8 cover lines returned", () => {
  const v = okValues({ videoTopic: "meal prep" });
  assert.strictEqual((v["covers"] as string[]).length, 8);
});

test("every cover line is at most 25 characters", () => {
  const topics = ["meal prep", "ai voice agents for dental clinics", "x".repeat(60), "sourdough"];
  for (const topic of topics) {
    const v = okValues({ videoTopic: topic });
    for (const line of v["covers"] as string[]) {
      assert.ok(line.length <= COVER_MAX_CHARS, `too long (${line.length}): ${line}`);
    }
  }
});

test("long topics are trimmed to fit the 25-char limit", () => {
  const v = okValues({ videoTopic: "ai voice agents for dental clinics" });
  for (const line of v["covers"] as string[]) {
    assert.ok(line.length <= COVER_MAX_CHARS);
  }
  // No dangling partial word at the end of a trimmed line.
  for (const line of v["covers"] as string[]) {
    assert.ok(!/[A-Z]-$/.test(line), `dangling hyphen: ${line}`);
  }
});

test("topic is uppercased in cover lines", () => {
  const v = okValues({ videoTopic: "yoga" });
  assert.ok((v["covers"] as string[]).some((l) => l.includes("YOGA")));
  assert.ok(!(v["covers"] as string[]).some((l) => l.includes("yoga")));
});

test("clickbait-flagged lines get an honest variant in copyAll", () => {
  // Sweep topics until we hit a run containing a clickbait template.
  let found = false;
  const topics = ["meal prep", "fitness", "gardening", "skincare", "travel", "money", "cooking", "pets"];
  for (const topic of topics) {
    const v = okValues({ videoTopic: topic });
    const copyAll = v["copyAll"] as string;
    if (copyAll.includes(CLICKBAIT_NOTE)) {
      found = true;
      const noteLine = copyAll.split("\n").find((l) => l.includes(CLICKBAIT_NOTE))!;
      assert.ok(noteLine.includes("—"), `expected honest alt after dash: ${noteLine}`);
    }
  }
  assert.ok(found, "expected at least one run to flag a clickbait template");
});

test("clickbait templates in the bank all have honest alternatives", () => {
  const flagged = COVER_BANK.filter((t) => t.clickbait);
  assert.ok(flagged.length > 0, "bank should flag some clickbait templates");
  for (const t of flagged) {
    assert.ok(t.honestAlt && t.honestAlt.trim().length > 0, `missing honestAlt: ${t.template}`);
    assert.ok(
      t.honestAlt.includes("{T}"),
      `honestAlt must use the topic placeholder: ${t.honestAlt}`
    );
  }
});

test("honest alternatives also fit within 25 chars", () => {
  const flagged = COVER_BANK.filter((t) => t.clickbait && t.honestAlt);
  for (const t of flagged) {
    const alt = fillCover(t.honestAlt!, "ai voice agents for dental clinics");
    assert.ok(alt.length <= COVER_MAX_CHARS, `alt too long: ${alt}`);
  }
});

test("non-clickbait lines have no honest-variant note", () => {
  // Find a topic whose run has at least one clean line and verify its
  // cover line appears verbatim (no note) in copyAll.
  const v = okValues({ videoTopic: "sourdough" });
  const covers = v["covers"] as string[];
  const copyAll = v["copyAll"] as string;
  const cleanLine = covers.find((c) => copyAll.split("\n").includes(c));
  assert.ok(cleanLine, "expected at least one non-clickbait line");
});

test("validation: missing videoTopic fails", () => {
  const res = runTool({});
  assert.strictEqual(res.ok, false);
  assert.match(res.error ?? "", /topic/i);
});

test("validation: empty videoTopic fails", () => {
  const res = runTool({ videoTopic: "   " });
  assert.strictEqual(res.ok, false);
});

test("validation: non-string videoTopic fails", () => {
  const res = runTool({ videoTopic: 7 });
  assert.strictEqual(res.ok, false);
});

test("validation: over-long videoTopic fails", () => {
  const res = runTool({ videoTopic: "x".repeat(61) });
  assert.strictEqual(res.ok, false);
});

test("determinism: same topic run twice gives identical output", () => {
  const a = runTool({ videoTopic: "home workouts" });
  const b = runTool({ videoTopic: "home workouts" });
  assert.deepStrictEqual(a, b);
});

test("determinism: topic case is normalized", () => {
  const a = okValues({ videoTopic: "Meal Prep" });
  const b = okValues({ videoTopic: "meal prep" });
  assert.deepStrictEqual(a, b);
});

test("output ids match meta.ts outputs", () => {
  const v = okValues({ videoTopic: "skincare" });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("word bank bounds: 20 non-empty templates", () => {
  assert.strictEqual(BANK_SIZE, 20);
  assert.strictEqual(COVER_BANK.length, 20);
  assert.strictEqual(IDEAS_COUNT, 8);
  for (const t of COVER_BANK) {
    assert.ok(t.template.trim().length > 0, "empty template");
    assert.ok(t.template.includes("{T}"), `missing placeholder: ${t.template}`);
  }
});

test("no cover line is empty", () => {
  const v = okValues({ videoTopic: "photography" });
  for (const line of v["covers"] as string[]) {
    assert.ok(line.trim().length > 0);
  }
});
