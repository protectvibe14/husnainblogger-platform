import { test } from "node:test";
import assert from "node:assert";
import {
  runTool,
  wrapCaption,
  CAPTION_MAX_CHARS,
  PAUSE_MARKER,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const EXPECTED_OUTPUT_IDS = outputs.map((o) => o.id).sort();

function okValues(values: Record<string, unknown>) {
  const res = runTool(values);
  assert.strictEqual(res.ok, true, `expected ok, got error: ${res.error}`);
  assert.ok(res.values);
  return res.values;
}

const SCRIPT =
  "Welcome to the fastest way to fold a fitted sheet.\n\nLay it flat on the bed first.\nTuck the corners together and smooth it out.";

test("happy path: scenes numbered, pause markers between scenes", () => {
  const v = okValues({ rawScript: SCRIPT });
  const formatted = v["formattedScript"] as string;
  assert.ok(formatted.includes("Scene 1: Welcome to the fastest way to fold a fitted sheet."));
  assert.ok(formatted.includes("Scene 2: Lay it flat on the bed first."));
  assert.ok(formatted.includes("Scene 3: Tuck the corners together and smooth it out."));
  assert.strictEqual(
    formatted.split("\n").filter((l) => l === PAUSE_MARKER).length,
    2,
    "expected 2 pause markers for 3 scenes"
  );
});

test("happy path: stats line is correct", () => {
  const v = okValues({ rawScript: SCRIPT });
  assert.strictEqual(v["stats"], "3 scenes · 5 caption lines · 25 words");
});

test("every caption line is at most 42 characters", () => {
  const v = okValues({
    rawScript:
      "This is a deliberately long sentence that must be wrapped into several caption lines for readability.\nShort line.",
  });
  for (const line of v["captionLines"] as string[]) {
    assert.ok(line.length <= CAPTION_MAX_CHARS, `too long: ${line}`);
  }
});

test("single line with no breaks becomes one scene", () => {
  const v = okValues({ rawScript: "One line only." });
  const formatted = v["formattedScript"] as string;
  assert.ok(formatted.includes("Scene 1: One line only."));
  assert.ok(!formatted.includes(PAUSE_MARKER));
  assert.strictEqual(v["stats"], "1 scene · 1 caption line · 3 words");
});

test("blank lines are skipped, not turned into scenes", () => {
  const v = okValues({ rawScript: "\n\nFirst.\n\n\nSecond.\n\n" });
  assert.ok((v["formattedScript"] as string).includes("Scene 1: First."));
  assert.ok((v["formattedScript"] as string).includes("Scene 2: Second."));
  assert.ok(!(v["formattedScript"] as string).includes("Scene 3:"));
});

test("mixed-language scripts are kept as-is (no translation claims)", () => {
  const mixed = "Hola, bienvenidos a mi cocina.\nهذا النص باللغة العربية كما هو.";
  const v = okValues({ rawScript: mixed });
  const formatted = v["formattedScript"] as string;
  assert.ok(formatted.includes("Hola, bienvenidos a mi cocina."));
  assert.ok(formatted.includes("هذا النص باللغة العربية كما هو."));
  const captions = v["captionLines"] as string[];
  assert.ok(captions.some((l) => l.includes("Hola")));
  assert.ok(captions.some((l) => l.includes("العربية")));
});

test("wrapCaption hard-splits a single over-long word", () => {
  const lines = wrapCaption("a".repeat(100));
  assert.ok(lines.length > 1);
  for (const line of lines) assert.ok(line.length <= CAPTION_MAX_CHARS);
});

test("caption text preserves original words in order", () => {
  const scene = "quick brown fox jumps over the lazy dog";
  const joined = wrapCaption(scene).join(" ");
  assert.strictEqual(joined, scene);
});

test("CRLF line endings are handled", () => {
  const v = okValues({ rawScript: "Line one.\r\nLine two." });
  assert.ok((v["formattedScript"] as string).includes("Scene 2: Line two."));
});

test("validation: missing rawScript fails", () => {
  const res = runTool({});
  assert.strictEqual(res.ok, false);
  assert.match(res.error ?? "", /script/i);
});

test("validation: empty rawScript fails", () => {
  const res = runTool({ rawScript: "   " });
  assert.strictEqual(res.ok, false);
});

test("validation: whitespace-only script fails", () => {
  const res = runTool({ rawScript: "\n\n  \n" });
  assert.strictEqual(res.ok, false);
});

test("validation: non-string rawScript fails", () => {
  const res = runTool({ rawScript: 42 });
  assert.strictEqual(res.ok, false);
});

test("validation: over-long script fails", () => {
  const res = runTool({ rawScript: "x".repeat(5001) });
  assert.strictEqual(res.ok, false);
});

test("determinism: same script run twice gives identical output", () => {
  const a = runTool({ rawScript: SCRIPT });
  const b = runTool({ rawScript: SCRIPT });
  assert.deepStrictEqual(a, b);
});

test("output ids match meta.ts outputs", () => {
  const v = okValues({ rawScript: SCRIPT });
  assert.deepStrictEqual(Object.keys(v).sort(), EXPECTED_OUTPUT_IDS);
});

test("no caption line is empty", () => {
  const v = okValues({ rawScript: SCRIPT });
  for (const line of v["captionLines"] as string[]) {
    assert.ok(line.trim().length > 0);
  }
});
