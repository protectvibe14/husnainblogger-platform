import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  wrapLine,
  MAX_LINE_CHARS,
  PAUSE_MARKER,
  SAFE_ZONE_GUIDANCE,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values;
}

const BASE = {
  sceneDescription: "Stop scrolling if your plants keep dying. This 2-minute trick saves them.",
  videoTopic: "plant care",
};

test("happy path: hook from first sentence, beats from the rest", () => {
  const v = okValues(BASE);
  assert.strictEqual(v["hookLine"], "Stop scrolling if your plants keep dying.");
  const beats = v["beatLines"] as string[];
  assert.ok(beats.length >= 1);
  assert.ok(beats.includes("This 2-minute trick saves them."));
});

test("happy path: copyAll contains topic, hook, beats, and guidance", () => {
  const v = okValues(BASE);
  const copyAll = v["copyAll"] as string;
  assert.ok(copyAll.includes("plant care"));
  assert.ok(copyAll.includes(v["hookLine"] as string));
  assert.ok(copyAll.includes("BEATS:"));
  assert.ok(copyAll.includes(SAFE_ZONE_GUIDANCE));
});

test("edge case: long sentence splits into two lines with a pause beat", () => {
  const long =
    "This sentence is deliberately much longer than forty two characters so it must be split into pieces.";
  const v = okValues({ sceneDescription: long, videoTopic: "testing" });
  const beats = v["beatLines"] as string[];
  assert.ok(beats.includes(PAUSE_MARKER), `expected pause marker in ${JSON.stringify(beats)}`);
  for (const line of beats) {
    if (line === PAUSE_MARKER) continue;
    assert.ok(line.length <= MAX_LINE_CHARS, `line too long: ${line}`);
  }
});

test("every hook line and beat line stays within 42 characters", () => {
  const v = okValues({
    sceneDescription:
      "POV: you finally found the perfect budget skincare routine. Step one is always double cleansing, no matter what anyone says!",
    videoTopic: "skincare",
  });
  assert.ok((v["hookLine"] as string).length <= MAX_LINE_CHARS);
  for (const line of v["beatLines"] as string[]) {
    if (line === PAUSE_MARKER) continue;
    assert.ok(line.length <= MAX_LINE_CHARS, `line too long: ${line}`);
  }
});

test("wrapLine hard-splits a single over-long word", () => {
  const word = "a".repeat(100);
  const lines = wrapLine(word);
  assert.ok(lines.length > 1);
  for (const line of lines) assert.ok(line.length <= MAX_LINE_CHARS);
});

test("single sentence with no terminator still works", () => {
  const v = okValues({ sceneDescription: "watch me flip this pancake", videoTopic: "cooking" });
  assert.strictEqual(v["hookLine"], "watch me flip this pancake");
  assert.deepStrictEqual(v["beatLines"], []);
});

test("mixed-language lines are kept as-is (no translation)", () => {
  const v = okValues({
    sceneDescription: "Hola amigos, miren esto. هذا مدهش حقًا!",
    videoTopic: "travel",
  });
  assert.ok((v["hookLine"] as string).includes("Hola amigos"));
  assert.ok((v["beatLines"] as string[]).some((l) => l.includes("هذا مدهش")));
});

test("hook chunks from a split first sentence: remainder becomes beats", () => {
  const v = okValues({
    sceneDescription:
      "This is a very long first sentence that definitely exceeds forty two characters in length. Short second.",
    videoTopic: "demo",
  });
  assert.ok((v["hookLine"] as string).length <= MAX_LINE_CHARS);
  assert.ok((v["beatLines"] as string[]).length >= 2);
});

test("validation: missing sceneDescription fails", () => {
  const res = runTool({ videoTopic: "plant care" });
  assert.strictEqual(res.ok, false);
  assert.match(res.error ?? "", /scene/i);
});

test("validation: empty sceneDescription fails", () => {
  const res = runTool({ sceneDescription: "   ", videoTopic: "plant care" });
  assert.strictEqual(res.ok, false);
});

test("validation: missing videoTopic fails", () => {
  const res = runTool({ sceneDescription: "A perfectly fine scene." });
  assert.strictEqual(res.ok, false);
  assert.match(res.error ?? "", /topic/i);
});

test("validation: empty videoTopic fails", () => {
  const res = runTool({ sceneDescription: "A perfectly fine scene.", videoTopic: "  " });
  assert.strictEqual(res.ok, false);
});

test("validation: non-string sceneDescription fails", () => {
  const res = runTool({ sceneDescription: 42, videoTopic: "plant care" });
  assert.strictEqual(res.ok, false);
});

test("validation: over-long scene description fails", () => {
  const res = runTool({ sceneDescription: "x".repeat(2001), videoTopic: "plant care" });
  assert.strictEqual(res.ok, false);
});

test("validation: over-long topic fails", () => {
  const res = runTool({ sceneDescription: "A scene.", videoTopic: "x".repeat(101) });
  assert.strictEqual(res.ok, false);
});

test("determinism: same inputs run twice give identical output", () => {
  const a = runTool(BASE);
  const b = runTool(BASE);
  assert.deepStrictEqual(a, b);
});

test("output ids match meta.ts outputs", () => {
  const v = okValues(BASE);
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("sentence splitting handles multiple terminators", () => {
  const v = okValues({
    sceneDescription: "Wait... what?! This changes everything.",
    videoTopic: "news",
  });
  assert.ok((v["beatLines"] as string[]).length >= 1);
});
