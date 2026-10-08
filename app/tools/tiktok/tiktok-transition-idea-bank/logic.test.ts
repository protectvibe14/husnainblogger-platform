import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  TRANSITION_BANK,
  BANK_SIZE,
  NICHE_OPTIONS,
  COUNT_MIN,
  COUNT_MAX,
  ADVANCED_LABEL,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values;
}

test("happy path: 5 ideas for Fashion", () => {
  const v = okValues({ niche: "Fashion", transitionCount: 5 });
  assert.strictEqual(v["ideas"].length, 5);
  const copyAll = v["copyAll"] as string;
  assert.strictEqual(copyAll.split("\n").length, 5);
});

test("happy path: count 1 returns exactly one idea", () => {
  const v = okValues({ niche: "Beauty", transitionCount: 1 });
  assert.strictEqual((v["ideas"] as string[]).length, 1);
});

test("happy path: count 20 (max) returns 20 ideas", () => {
  const v = okValues({ niche: "Comedy", transitionCount: 20 });
  assert.strictEqual((v["ideas"] as string[]).length, 20);
});

test("every niche option produces the requested count", () => {
  for (const niche of NICHE_OPTIONS) {
    const v = okValues({ niche, transitionCount: 3 });
    assert.strictEqual((v["ideas"] as string[]).length, 3, `niche ${niche}`);
  }
});

test("validation: missing niche fails", () => {
  const res = runTool({ transitionCount: 5 });
  assert.strictEqual(res.ok, false);
  assert.match(res.error ?? "", /niche/i);
});

test("validation: empty niche fails", () => {
  const res = runTool({ niche: "   ", transitionCount: 5 });
  assert.strictEqual(res.ok, false);
  assert.match(res.error ?? "", /niche/i);
});

test("validation: unknown niche fails", () => {
  const res = runTool({ niche: "Astrophysics", transitionCount: 5 });
  assert.strictEqual(res.ok, false);
});

test("validation: missing transitionCount fails", () => {
  const res = runTool({ niche: "Fashion" });
  assert.strictEqual(res.ok, false);
});

test("validation: count 0 fails", () => {
  const res = runTool({ niche: "Fashion", transitionCount: 0 });
  assert.strictEqual(res.ok, false);
});

test("validation: count 21 fails", () => {
  const res = runTool({ niche: "Fashion", transitionCount: 21 });
  assert.strictEqual(res.ok, false);
});

test("validation: fractional count fails", () => {
  const res = runTool({ niche: "Fashion", transitionCount: 2.5 });
  assert.strictEqual(res.ok, false);
});

test("validation: count as string fails", () => {
  const res = runTool({ niche: "Fashion", transitionCount: "5" });
  assert.strictEqual(res.ok, false);
});

test("validation: NaN count fails", () => {
  const res = runTool({ niche: "Fashion", transitionCount: NaN });
  assert.strictEqual(res.ok, false);
});

test("determinism: same inputs run twice give identical output", () => {
  const a = runTool({ niche: "Travel", transitionCount: 10 });
  const b = runTool({ niche: "Travel", transitionCount: 10 });
  assert.deepStrictEqual(a, b);
});

test("determinism: larger count extends the same sequence", () => {
  const small = okValues({ niche: "Gaming", transitionCount: 4 });
  const big = okValues({ niche: "Gaming", transitionCount: 8 });
  assert.deepStrictEqual(
    (big["ideas"] as string[]).slice(0, 4),
    small["ideas"]
  );
});

test("output ids match meta.ts outputs", () => {
  const v = okValues({ niche: "Pets", transitionCount: 5 });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("word bank bounds: 24 non-empty ideas", () => {
  assert.strictEqual(BANK_SIZE, 24);
  assert.strictEqual(TRANSITION_BANK.length, 24);
  for (const idea of TRANSITION_BANK) {
    assert.ok(idea.name.trim().length > 0, "empty name");
    assert.ok(idea.howTo.trim().length > 0, "empty howTo");
    assert.ok(idea.level === "in-app" || idea.level === "advanced", "bad level");
  }
});

test("word bank: both difficulty levels present", () => {
  const inApp = TRANSITION_BANK.filter((i) => i.level === "in-app").length;
  const advanced = TRANSITION_BANK.filter((i) => i.level === "advanced").length;
  assert.ok(inApp > 0 && advanced > 0);
});

test("advanced transitions carry the CapCut/manual-editing label", () => {
  // Sweep every niche with a full-bank-sized request; at least one run
  // must surface an advanced idea with the honesty label.
  let foundLabelled = false;
  for (const niche of NICHE_OPTIONS) {
    const v = okValues({ niche, transitionCount: COUNT_MAX });
    for (const line of v["ideas"] as string[]) {
      if (line.includes(ADVANCED_LABEL)) {
        foundLabelled = true;
        assert.match(line, /not possible in the TikTok app alone/i);
      }
    }
  }
  assert.ok(foundLabelled, "expected at least one advanced idea to be labelled");
});

test("in-app ideas never claim to need an editor", () => {
  const v = okValues({ niche: "Fitness", transitionCount: COUNT_MAX });
  const lines = v["ideas"] as string[];
  // Snap Change is an in-app idea; find its line in bank order output
  const snap = lines.find((l) => l.startsWith("Snap Change:"));
  if (snap) assert.ok(!snap.includes(ADVANCED_LABEL));
});

test("count bounds constants match validation range", () => {
  assert.strictEqual(COUNT_MIN, 1);
  assert.strictEqual(COUNT_MAX, 20);
  const tooLow = runTool({ niche: "Fashion", transitionCount: COUNT_MIN - 1 });
  const tooHigh = runTool({ niche: "Fashion", transitionCount: COUNT_MAX + 1 });
  assert.strictEqual(tooLow.ok, false);
  assert.strictEqual(tooHigh.ok, false);
});
