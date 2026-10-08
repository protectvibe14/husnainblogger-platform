import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  planContentPillars,
  ARCHETYPES,
  MIN_PILLARS,
  MAX_PILLARS,
  DEFAULT_PILLARS,
} from "./logic.ts";

// --- happy path ------------------------------------------------------------

test("happy path: niche only -> default 4 pillars", () => {
  const r = runTool({ niche: "freelance copywriting" });
  assert.equal(r.ok, true);
  const pillars = r.values!.pillars as string[];
  assert.equal(pillars.length, 4);
  assert.ok(pillars[0].startsWith("1. Teach & How-To —"));
  assert.ok(typeof r.values!.planNote === "string");
});

test("happy path: explicit count 5", () => {
  const r = runTool({ niche: "sourdough baking", pillarCount: 5 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.pillars as string[]).length, 5);
});

test("happy path: count 3 as string", () => {
  const r = runTool({ niche: "home workouts", pillarCount: "3" });
  assert.equal(r.ok, true);
  assert.equal((r.values!.pillars as string[]).length, 3);
});

test("niche text is substituted into descriptions and topics", () => {
  const plan = planContentPillars("dog training", 4);
  assert.ok(plan.pillars[0].description.includes("dog training"));
  assert.equal(plan.pillars[0].exampleTopics.length, 3);
  assert.ok(plan.pillars[0].exampleTopics.every((t) => !t.includes("{niche}")));
  assert.ok(plan.pillars[0].exampleTopics.every((t) => !t.includes("{Niche}")));
});

test("first pillar is always Teach & How-To", () => {
  for (const niche of ["ai tools", "personal finance", "vegan recipes"]) {
    const plan = planContentPillars(niche, 4);
    assert.equal(plan.pillars[0].name, "Teach & How-To");
  }
});

// --- narrow-niche edge case --------------------------------------------------

test("narrow niche (single word) with count 4 reduces to 3 with note", () => {
  const r = runTool({ niche: "crypto", pillarCount: 4 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.pillars as string[]).length, 3);
  assert.ok((r.values!.planNote as string).includes("narrow"));
});

test("two-word niche is NOT treated as narrow", () => {
  const r = runTool({ niche: "freelance copywriting", pillarCount: 4 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.pillars as string[]).length, 4);
  assert.ok(!(r.values!.planNote as string).includes("narrow"));
});

test("narrow niche with count 3 keeps 3 without reduction note", () => {
  const r = runTool({ niche: "crypto", pillarCount: 3 });
  assert.equal(r.ok, true);
  assert.equal((r.values!.pillars as string[]).length, 3);
  assert.ok(!(r.values!.planNote as string).includes("narrow"));
});

// --- validation errors -------------------------------------------------------

test("error: missing niche", () => {
  const r = runTool({ pillarCount: 4 });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("niche"));
});

test("error: empty niche", () => {
  const r = runTool({ niche: "   " });
  assert.equal(r.ok, false);
});

test("error: niche too long", () => {
  const r = runTool({ niche: "x".repeat(121) });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("120"));
});

test("error: count 2", () => {
  const r = runTool({ niche: "fitness", pillarCount: 2 });
  assert.equal(r.ok, false);
  assert.ok((r.error as string).includes("between 3 and 5"));
});

test("error: count 6", () => {
  const r = runTool({ niche: "fitness", pillarCount: 6 });
  assert.equal(r.ok, false);
});

test("error: non-integer count", () => {
  const r = runTool({ niche: "fitness", pillarCount: 3.5 });
  assert.equal(r.ok, false);
});

test("error: non-numeric count", () => {
  const r = runTool({ niche: "fitness", pillarCount: "lots" });
  assert.equal(r.ok, false);
});

// --- determinism & bank bounds ------------------------------------------------

test("deterministic: same inputs -> identical output", () => {
  const a = runTool({ niche: "freelance copywriting", pillarCount: 5 });
  const b = runTool({ niche: "freelance copywriting", pillarCount: 5 });
  assert.deepEqual(a, b);
});

test("different niches can rotate pillar selection", () => {
  const a = planContentPillars("freelance copywriting", 4).pillars.map((p) => p.name);
  const b = planContentPillars("urban gardening", 4).pillars.map((p) => p.name);
  assert.deepEqual(a.slice(0, 1), b.slice(0, 1)); // first pillar fixed
  assert.equal(a.length, 4);
  assert.equal(b.length, 4);
});

test("pillars are distinct within one plan", () => {
  const plan = planContentPillars("photography", 5);
  const names = plan.pillars.map((p) => p.name);
  assert.equal(new Set(names).size, names.length);
});

test("output ids match meta.ts outputs", () => {
  const r = runTool({ niche: "freelance copywriting" });
  assert.deepEqual(Object.keys(r.values!).sort(), ["pillars", "planNote"].sort());
});

test("archetype bank bounds: 12 archetypes x 3 topics each", () => {
  assert.equal(ARCHETYPES.length, 12);
  for (const a of ARCHETYPES) {
    assert.equal(a.topics.length, 3);
    assert.ok(a.name.length > 0);
    assert.ok(a.description.length > 0);
  }
  assert.equal(MIN_PILLARS, 3);
  assert.equal(MAX_PILLARS, 5);
  assert.equal(DEFAULT_PILLARS, 4);
});
