import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  fillTemplate,
  COMMENT_BANK,
  BANK_SIZE,
  COMMENT_MAX_CHARS,
  TEMPLATES_PER_CATEGORY,
  IDEAS_PER_CATEGORY,
  CATEGORY_LABELS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values;
}

test("happy path: 8 ideas across all 4 categories", () => {
  const v = okValues({ videoTopic: "meal prep" });
  const comments = v["comments"] as string[];
  assert.strictEqual(comments.length, 8);
  for (const label of Object.values(CATEGORY_LABELS)) {
    const matches = comments.filter((c) => c.startsWith(`${label}:`));
    assert.strictEqual(matches.length, 2, `expected 2 for ${label}`);
  }
});

test("happy path: topic is inserted into every comment", () => {
  const v = okValues({ videoTopic: "meal prep" });
  for (const line of v["copyAll"].split("\n") as string[]) {
    // "the exact template I used here" template has no {topic} — it is the
    // only exception allowed.
    if (line === "The exact template I used here: link in my bio.") continue;
    assert.ok(line.toLowerCase().includes("meal prep"), `missing topic: ${line}`);
  }
});

test("every plain comment line is within the 150-char TikTok limit", () => {
  for (const topic of ["meal prep", "ai voice agents for dental clinics", "x".repeat(60)]) {
    const v = okValues({ videoTopic: topic });
    for (const line of (v["copyAll"] as string).split("\n")) {
      assert.ok(line.length <= COMMENT_MAX_CHARS, `too long (${line.length}): ${line}`);
    }
  }
});

test("copyAll has one comment per line, no category prefixes", () => {
  const v = okValues({ videoTopic: "study tips" });
  const lines = (v["copyAll"] as string).split("\n");
  assert.strictEqual(lines.length, 8);
  assert.ok(!lines.some((l) => l.startsWith("Question:")));
});

test("CTAs use value-first wording (no spammy phrasing)", () => {
  const ctas = COMMENT_BANK.filter((t) => t.category === "cta");
  const spammy = [/buy now/i, /limited time/i, /act fast/i, /click here/i];
  for (const t of ctas) {
    for (const re of spammy) {
      assert.ok(!re.test(t.template), `spammy phrasing: ${t.template}`);
    }
  }
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
  const res = runTool({ videoTopic: 123 });
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

test("determinism: selection hash is case-insensitive, topic text kept as typed", () => {
  const a = okValues({ videoTopic: "Meal Prep" });
  const b = okValues({ videoTopic: "MEAL PREP" });
  // Same template selection (same order of template slots) for both cases...
  const stripTopic = (lines: string[]) =>
    lines.map((l) => l.replace(/Meal Prep|MEAL PREP/g, "{topic}"));
  assert.deepStrictEqual(stripTopic(a["comments"] as string[]), stripTopic(b["comments"] as string[]));
  // ...but the topic itself is inserted exactly as the user typed it.
  assert.ok((a["copyAll"] as string).includes("Meal Prep"));
  assert.ok((b["copyAll"] as string).includes("MEAL PREP"));
});

test("output ids match meta.ts outputs", () => {
  const v = okValues({ videoTopic: "skincare" });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("word bank bounds: 20 templates, 5 per category", () => {
  assert.strictEqual(BANK_SIZE, 20);
  assert.strictEqual(TEMPLATES_PER_CATEGORY, 5);
  assert.strictEqual(IDEAS_PER_CATEGORY, 2);
  const categories = ["question", "cta", "linkInBio", "followUp"] as const;
  for (const cat of categories) {
    assert.strictEqual(
      COMMENT_BANK.filter((t) => t.category === cat).length,
      5,
      `category ${cat}`
    );
  }
  for (const t of COMMENT_BANK) {
    assert.ok(t.template.trim().length > 0, "empty template");
  }
});

test("fillTemplate keeps output under 150 chars for a long topic", () => {
  const out = fillTemplate("What's your biggest {topic} struggle right now?", "x".repeat(60));
  assert.ok(out.length <= COMMENT_MAX_CHARS);
});

test("fillTemplate leaves short topics untouched", () => {
  const out = fillTemplate("Should I do a part 2 on {topic}? Tell me below.", "bread baking");
  assert.strictEqual(out, "Should I do a part 2 on bread baking? Tell me below.");
});

test("different topics rotate the selection", () => {
  const a = okValues({ videoTopic: "fitness" });
  const b = okValues({ videoTopic: "gardening" });
  assert.notDeepStrictEqual(a["comments"], b["comments"]);
});

test("no comment is empty or whitespace-only", () => {
  const v = okValues({ videoTopic: "photography" });
  for (const line of (v["copyAll"] as string).split("\n")) {
    assert.ok(line.trim().length > 0);
  }
});
