import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, PATTERNS, SEPARATORS } from "./logic.ts";

const OUTPUT_IDS = ["fileName", "patternPreview", "batchNames", "warnings"];

function okValues(input: Record<string, unknown>): Record<string, unknown> {
  const r = runTool(input);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

describe("file-naming-generator", () => {
  it("happy path: Project · Date · Version with underscores", () => {
    const v = okValues({
      project: "launch video",
      pattern: "Project · Date · Version",
      date: "2026-10-01",
      version: "v2",
      separator: "_",
    });
    assert.equal(v.fileName, "launch_video_20261001_v2");
    assert.ok((v.patternPreview as string).includes("Project · Date · Version"));
    assert.deepEqual(v.batchNames, ["launch_video_20261001_v2"]);
    assert.deepEqual(v.warnings, []);
  });

  it("missing project errors", () => {
    const r = runTool({ project: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /project name/i);
  });

  it("missing date uses YYYYMMDD placeholder with warning", () => {
    const v = okValues({ project: "trailer", pattern: "Project · Date · Version" });
    assert.equal(v.fileName, "trailer_YYYYMMDD_v1");
    assert.ok((v.warnings as string[]).some((w) => w.includes("YYYYMMDD")));
  });

  it("patterns without a date token add no date warning", () => {
    const v = okValues({ project: "trailer", pattern: "Simple (Project · Version)" });
    assert.equal(v.fileName, "trailer_v1");
    assert.deepEqual(v.warnings, []);
  });

  it("empty version defaults to v1", () => {
    const v = okValues({ project: "trailer", pattern: "Simple (Project · Version)", version: "" });
    assert.equal(v.fileName, "trailer_v1");
  });

  it("bad date format errors", () => {
    assert.equal(runTool({ project: "x", date: "10/01/2026" }).ok, false);
    assert.equal(runTool({ project: "x", date: "2026-1-1" }).ok, false);
  });

  it("unknown pattern errors", () => {
    const r = runTool({ project: "x", pattern: "Not A Pattern" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /naming patterns/i);
  });

  it("invalid separator errors", () => {
    const r = runTool({ project: "x", separator: "/" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Separator must be/);
  });

  it("hyphen and dot separators work", () => {
    assert.equal(
      okValues({ project: "my reel", pattern: "Simple (Project · Version)", separator: "-" }).fileName,
      "my-reel-v1"
    );
    assert.equal(
      okValues({ project: "my reel", pattern: "Simple (Project · Version)", separator: "." }).fileName,
      "my.reel.v1"
    );
  });

  it("illegal chars are stripped with a warning", () => {
    const v = okValues({
      project: 'my:video*name?',
      pattern: "Simple (Project · Version)",
    });
    assert.equal(v.fileName, "myvideoname_v1");
    assert.ok((v.warnings as string[]).some((w) => w.includes('from "project"')));
  });

  it("empty optional parts are skipped silently", () => {
    const v = okValues({
      project: "doc",
      pattern: "Date · Project · Scene · Take · Version",
      date: "2026-10-01",
    });
    assert.equal(v.fileName, "20261001_doc_v1");
    assert.deepEqual(v.warnings, []);
  });

  it("full production pattern uses all tokens", () => {
    const v = okValues({
      project: "launch",
      pattern: "Full Production (all tokens)",
      date: "2026-10-01",
      scene: "scene 3",
      take: "take 2",
      platform: "TikTok",
      version: "v1",
    });
    assert.equal(v.fileName, "20261001_launch_scene_3_take_2_TikTok_v1");
  });

  it("batch versions generate v01..vN names", () => {
    const v = okValues({
      project: "trailer",
      pattern: "Simple (Project · Version)",
      version: "v03",
      batchVersions: 3,
    });
    assert.deepEqual(v.batchNames, ["trailer_v01", "trailer_v02", "trailer_v03"]);
  });

  it("batchVersions 1 returns [fileName]", () => {
    const v = okValues({ project: "trailer", pattern: "Simple (Project · Version)", batchVersions: 1 });
    assert.deepEqual(v.batchNames, [v.fileName]);
  });

  it("batchVersions out of range errors", () => {
    assert.equal(runTool({ project: "x", batchVersions: 0 }).ok, false);
    assert.equal(runTool({ project: "x", batchVersions: 13 }).ok, false);
    assert.equal(runTool({ project: "x", batchVersions: 2.5 }).ok, false);
  });

  it("names over 200 chars warn", () => {
    const long = "a".repeat(210);
    const v = okValues({ project: long, pattern: "Simple (Project · Version)" });
    assert.ok((v.warnings as string[]).some((w) => w.includes("over 200")));
    assert.ok((v.fileName as string).length > 200);
  });

  it("repeated separators collapse and edges trim", () => {
    const v = okValues({
      project: "  my   video  ",
      pattern: "Simple (Project · Version)",
      separator: "_",
    });
    assert.equal(v.fileName, "my_video_v1");
  });

  it("pattern bank has 6 entries; separators have 3", () => {
    assert.equal(PATTERNS.length, 6);
    assert.equal(SEPARATORS.length, 3);
    assert.ok(PATTERNS.every((p) => p.label.length > 0 && p.tokens.length > 0));
  });

  it("deterministic: two runs identical", () => {
    const input = {
      project: "launch:video*",
      pattern: "Full Production (all tokens)",
      date: "2026-10-01",
      scene: "s1",
      take: "t2",
      platform: "YouTube",
      version: "v2",
      separator: "-",
      batchVersions: 2,
    };
    assert.deepEqual(runTool(input), runTool(input));
  });

  it("output ids match meta outputs", () => {
    const v = okValues({ project: "x" });
    assert.deepEqual(Object.keys(v).sort(), [...OUTPUT_IDS].sort());
  });
});
