import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs, inputs } from "./meta.ts";

const EXPECTED_IDS = ["totalScore", "grade", "sectionScores", "gapList", "prioritizedFixes"];

const ALL_IDS = [
  "bio-who-help", "bio-name-keyword", "bio-link", "bio-photo",
  "content-hook", "content-niche", "content-captions", "content-quality",
  "consistency-posting", "consistency-rhythm", "consistency-engage", "consistency-analytics",
  "engagement-comments", "engagement-saves", "engagement-replies", "engagement-growth",
];

function answersFor(value: string | number): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const id of ALL_IDS) obj[id] = value;
  return obj;
}

interface AuditValues {
  totalScore: number;
  grade: string;
  sectionScores: { columns: string[]; rows: string[][] };
  gapList: string[];
  prioritizedFixes: string[];
}

function okResult(values: Record<string, unknown>): AuditValues {
  const r = runTool(values);
  assert.equal(r.ok, true, `expected ok, got error: ${"error" in r ? r.error : ""}`);
  return (r as unknown as { ok: true; values: AuditValues }).values;
}

describe("tiktok-account-audit-checklist", () => {
  it("16 inputs exist in meta.ts, all required selects", () => {
    assert.equal(inputs.length, 16);
    for (const i of inputs) {
      assert.equal(i.required, true);
      assert.equal(i.type, "select");
    }
  });

  it("output ids match meta.ts outputs", () => {
    const v = okResult(answersFor("3"));
    assert.deepEqual(Object.keys(v).sort(), EXPECTED_IDS.sort());
    assert.deepEqual(outputs.map((o) => o.id).sort(), EXPECTED_IDS.sort());
  });

  it("all 5s: score 100, Audit-Ready", () => {
    const v = okResult(answersFor("5"));
    assert.equal(v.totalScore, 100);
    assert.ok(v.grade.startsWith("Audit-Ready (100/100)"));
  });

  it("all 0s: score 0, Rebuild", () => {
    const v = okResult(answersFor("0"));
    assert.equal(v.totalScore, 0);
    assert.ok(v.grade.startsWith("Rebuild (0/100)"));
  });

  it("grade always carries the self-audit honesty label", () => {
    const v = okResult(answersFor("4"));
    assert.ok(v.grade.includes("self-audit estimate, not TikTok analytics"));
  });

  it("all 5s: no critical gaps, no fixes needed", () => {
    const v = okResult(answersFor("5"));
    assert.equal(v.gapList.length, 1);
    assert.ok(v.gapList[0].includes("No critical gaps"));
    assert.ok(v.prioritizedFixes[0].includes("Nothing to fix"));
  });

  it("all 0s: 16 gaps, fixes start with Fix (0/5)", () => {
    const v = okResult(answersFor("0"));
    assert.equal(v.gapList.length, 16);
    assert.ok(v.prioritizedFixes[0].startsWith("Fix (0/5):"));
    assert.ok(v.gapList[0].includes("(you scored 0/5)"));
  });

  it("section math: Bio all 2s → Bio section score 40", () => {
    const vals = answersFor("5");
    vals["bio-who-help"] = "2";
    vals["bio-name-keyword"] = "2";
    vals["bio-link"] = "2";
    vals["bio-photo"] = "2";
    const v = okResult(vals);
    const bioRow = v.sectionScores.rows.find((r) => r[0] === "Bio & profile");
    assert.ok(bioRow);
    // earned = 2*2+2*2+2*1+2*1 = 12, possible = 5*6 = 30 → 40
    assert.equal(bioRow[1], "40/100");
    assert.ok(bioRow[2].includes("12/30"));
  });

  it("overall score = mean of section scores", () => {
    const vals = answersFor("0");
    for (const id of ALL_IDS.slice(0, 4)) vals[id] = "5"; // Bio perfect → 100
    const v = okResult(vals);
    assert.equal(v.totalScore, 25); // round((100+0+0+0)/4)
  });

  it("weighting: a weight-2 criterion moves the section score more", () => {
    const base = answersFor("3");
    const a = okResult({ ...base, "bio-who-help": "5" }); // weight 2
    const b = okResult({ ...base, "bio-link": "5" }); // weight 1
    assert.ok(a.totalScore > b.totalScore);
  });

  it("fixes ordered: lowest score first", () => {
    const vals = answersFor("4");
    vals["content-hook"] = "0";
    vals["bio-link"] = "1";
    const v = okResult(vals);
    assert.ok(v.prioritizedFixes[0].startsWith("Fix (0/5):"));
    assert.ok(v.prioritizedFixes[1].startsWith("Fix (1/5):"));
  });

  it("gap threshold: scores of 3 are not gaps", () => {
    const v = okResult(answersFor("3"));
    assert.equal(v.gapList.length, 1);
    assert.ok(v.gapList[0].includes("No critical gaps"));
    assert.ok(v.prioritizedFixes[0].startsWith("Improve (3/5):"));
  });

  it("numeric answers accepted (not only strings)", () => {
    const v = okResult(answersFor(5));
    assert.equal(v.totalScore, 100);
  });

  it("missing answer: error names the criterion", () => {
    const vals = answersFor("3");
    delete vals["content-hook"];
    const r = runTool(vals);
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("Most videos hook in the first 2 seconds"));
  });

  it("empty-string answer: error", () => {
    const vals = answersFor("3");
    vals["bio-link"] = "";
    const r = runTool(vals);
    assert.equal(r.ok, false);
  });

  it("out-of-range answer '6': error", () => {
    const vals = answersFor("3");
    vals["bio-link"] = "6";
    const r = runTool(vals);
    assert.equal(r.ok, false);
    assert.ok((r as { error: string }).error.includes("0 to 5"));
  });

  it("non-numeric answer 'yes': error", () => {
    const vals = answersFor("3");
    vals["bio-link"] = "yes";
    const r = runTool(vals);
    assert.equal(r.ok, false);
  });

  it("negative number answer: error", () => {
    const vals = answersFor("3");
    vals["bio-link"] = -1;
    const r = runTool(vals);
    assert.equal(r.ok, false);
  });

  it("deterministic: same answers run twice → identical", () => {
    const a = okResult(answersFor("3"));
    const b = okResult(answersFor("3"));
    assert.deepEqual(a, b);
  });

  it("sectionScores table has 4 rows with score/detail columns", () => {
    const v = okResult(answersFor("3"));
    assert.deepEqual(v.sectionScores.columns, ["Section", "Score", "Details"]);
    assert.equal(v.sectionScores.rows.length, 4);
  });

  it("grade bands: 70 → Solid, 50 → Needs work", () => {
    const vals = answersFor("0");
    for (const id of ALL_IDS.slice(0, 8)) vals[id] = "5"; // two sections perfect
    const v = okResult(vals);
    assert.equal(v.totalScore, 50);
    assert.ok(v.grade.startsWith("Needs work (50/100)"));
  });
});
