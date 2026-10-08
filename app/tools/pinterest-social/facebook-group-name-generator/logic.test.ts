/**
 * Tests for tool-388 Facebook Group Name Generator logic.
 * node:test + node:assert only.
 */
import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  GROUP_NAME_LIMIT,
  PROFESSIONAL_PATTERNS,
  CASUAL_PATTERNS,
  NAME_COUNT,
  GROUP_TONES,
  MAX_TOPIC_LENGTH,
} from "./logic.ts";

const BASE = { communityTopic: "sourdough baking", tone: "professional" };

test("happy path professional: 8 names <= 75 chars, all output ids present", () => {
  const r = runTool(BASE);
  assert.equal(r.ok, true);
  assert.ok(r.values);
  const v = r.values!;
  assert.equal(v.groupNames.length, NAME_COUNT);
  for (const n of v.groupNames) {
    assert.ok(n.length > 0);
    assert.ok(n.length <= GROUP_NAME_LIMIT, `name too long: "${n}"`);
    assert.ok(n.toLowerCase().includes("sourdough baking"));
  }
  assert.equal(v.copyAll, v.groupNames.join("\n"));
  assert.equal(v.toneUsed, "Professional");
  assert.ok(v.capNote.includes("Guidance, not a guarantee"));
});

test("casual tone: 8 names, tone labeled casual", () => {
  const r = runTool({ ...BASE, tone: "casual" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.groupNames.length, NAME_COUNT);
  assert.equal(r.values!.toneUsed, "Casual");
});

test("tone missing -> defaults to professional", () => {
  const r = runTool({ communityTopic: "sourdough baking" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.toneUsed, "Professional");
});

test("invalid tone -> error", () => {
  const r = runTool({ ...BASE, tone: "formal" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /professional.*casual/i);
});

test("missing communityTopic -> error", () => {
  const r = runTool({ tone: "casual" });
  assert.equal(r.ok, false);
  assert.match(r.error!, /community topic/i);
});

test("blank communityTopic -> error", () => {
  const r = runTool({ communityTopic: "   " });
  assert.equal(r.ok, false);
  assert.ok(r.error);
});

test("topic too long -> error", () => {
  const r = runTool({ communityTopic: "x".repeat(MAX_TOPIC_LENGTH + 1) });
  assert.equal(r.ok, false);
  assert.match(r.error!, /60/i);
});

test("deterministic: same inputs -> identical outputs", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepEqual(a, b);
});

test("tones produce different names for same topic", () => {
  const a = runTool({ ...BASE, tone: "professional" }).values!.groupNames;
  const b = runTool({ ...BASE, tone: "casual" }).values!.groupNames;
  assert.notDeepEqual(a, b);
});

test("names unique within a run", () => {
  const names = runTool(BASE).values!.groupNames;
  assert.equal(new Set(names).size, names.length);
});

test("bank sizes documented: 10 professional + 10 casual", () => {
  assert.equal(PROFESSIONAL_PATTERNS.length, 10);
  assert.equal(CASUAL_PATTERNS.length, 10);
  assert.deepEqual(GROUP_TONES, ["professional", "casual"]);
});

test("no placeholder leaks", () => {
  const r = runTool({ communityTopic: "home workouts", tone: "casual" });
  for (const n of r.values!.groupNames) assert.ok(!n.includes("{topic}"));
});

test("tone is case-insensitive ('Casual' works)", () => {
  const r = runTool({ communityTopic: "home workouts", tone: "Casual" });
  assert.equal(r.ok, true);
  assert.equal(r.values!.toneUsed, "Casual");
});

test("topic is title-cased in output", () => {
  const r = runTool({ communityTopic: "FREELANCE design" });
  assert.ok(r.values!.groupNames.some((n) => n.includes("Freelance Design")));
});

test("capNote honestly flags the limit as guidance", () => {
  const r = runTool(BASE);
  assert.match(r.values!.capNote, /secondary source/i);
});
