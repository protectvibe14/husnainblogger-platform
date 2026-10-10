import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  RUBRIC,
  HONESTY_NOTE,
  parseAnswer,
  scoreAnswers,
  formatItemResult,
  runTool,
} from "./logic.ts";
import { inputs, outputs, content } from "./meta.ts";

const ALL_YES = Object.fromEntries(RUBRIC.map((r) => [r.id, "yes"]));
const ALL_NO = Object.fromEntries(RUBRIC.map((r) => [r.id, "no"]));
const ALL_PARTIAL = Object.fromEntries(RUBRIC.map((r) => [r.id, "partially"]));

describe("RUBRIC", () => {
  it("has 8 items with weights summing to exactly 100", () => {
    assert.equal(RUBRIC.length, 8);
    assert.equal(RUBRIC.reduce((s, r) => s + r.weight, 0), 100);
  });
  it("ids are unique kebab-case and every item has a fail tip", () => {
    const ids = RUBRIC.map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const r of RUBRIC) {
      assert.match(r.id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
      assert.ok(r.failTip.trim().length > 0);
    }
  });
});

describe("parseAnswer", () => {
  it("defaults missing answers to neutral (partially)", () => {
    assert.equal(parseAnswer(undefined), "partially");
    assert.equal(parseAnswer(null), "partially");
    assert.equal(parseAnswer("   "), "partially");
  });
  it("accepts yes/partially/no case-insensitively", () => {
    assert.equal(parseAnswer("YES"), "yes");
    assert.equal(parseAnswer("Partially"), "partially");
    assert.equal(parseAnswer("No"), "no");
  });
  it("returns null for unrecognized non-blank values", () => {
    assert.equal(parseAnswer("maybe"), null);
    assert.equal(parseAnswer("5"), null);
  });
});

describe("scoreAnswers", () => {
  it("scores all yes as 100 (Strong)", () => {
    const r = scoreAnswers(ALL_YES);
    assert.equal(r.score, 100);
    assert.ok(r.band.includes("Strong"));
    assert.deepEqual(r.suggestions, []);
  });
  it("scores all no as 0 (Weak) with 8 suggestions", () => {
    const r = scoreAnswers(ALL_NO);
    assert.equal(r.score, 0);
    assert.ok(r.band.includes("Weak"));
    assert.equal(r.suggestions.length, 8);
  });
  it("scores all partially as 50 (Needs work)", () => {
    const r = scoreAnswers(ALL_PARTIAL);
    assert.equal(r.score, 50);
    assert.ok(r.band.includes("Needs work"));
  });
  it("mixes credits: yes on the first four items = 15+15+15+10 = 55", () => {
    const mixed: Record<string, string> = {};
    RUBRIC.forEach((r, i) => {
      mixed[r.id] = i < 4 ? "yes" : "no";
    });
    assert.equal(scoreAnswers(mixed).score, 55);
  });
  it("defaults missing answers to neutral (no answers at all -> 50)", () => {
    const r = scoreAnswers({});
    assert.equal(r.score, 50);
    assert.ok(r.items.every((i) => i.answer === "partially"));
  });
  it("hits the Good band at 60-79", () => {
    // yes on the 4 heaviest items (15+15+15+15=60) -> 60
    const a: Record<string, string> = {};
    RUBRIC.forEach((r) => {
      a[r.id] = r.weight === 15 ? "yes" : "no";
    });
    const r = scoreAnswers(a);
    assert.equal(r.score, 60);
    assert.ok(r.band.includes("Good"));
  });
  it("throws a human error on an invalid answer", () => {
    assert.throws(() => scoreAnswers({ ...ALL_YES, "no-clutter": "kinda" }), /Invalid answer/);
  });
  it("per-item earned never exceeds weight and statuses are correct", () => {
    const r = scoreAnswers({ ...ALL_YES, "face-or-emotion": "no", "curiosity-gap": "partially" });
    for (const i of r.items) assert.ok(i.earned <= i.weight);
    assert.equal(r.items.find((i) => i.id === "face-or-emotion")?.status, "fail");
    assert.equal(r.items.find((i) => i.id === "curiosity-gap")?.status, "partial");
    assert.equal(r.items.find((i) => i.id === "text-readable")?.status, "pass");
  });
});

describe("formatItemResult", () => {
  it("formats pass/partial/fail lines", () => {
    assert.equal(
      formatItemResult({ id: "x", label: "Text is short and readable", answer: "yes", earned: 15, weight: 15, status: "pass" }),
      "PASS — Text is short and readable (15/15)",
    );
    assert.equal(
      formatItemResult({ id: "x", label: "Curiosity gap", answer: "partially", earned: 5, weight: 10, status: "partial" }),
      "PARTIAL — Curiosity gap (5/10)",
    );
    assert.equal(
      formatItemResult({ id: "x", label: "Face or strong focal subject", answer: "no", earned: 0, weight: 15, status: "fail" }),
      "FAIL — Face or strong focal subject (0/15)",
    );
  });
});

describe("runTool", () => {
  it("happy path returns all documented outputs", () => {
    const r = runTool(ALL_YES);
    assert.equal(r.ok, true);
    assert.equal(r.values?.score, 100);
    assert.ok(String(r.values?.band).includes("self-assessed"));
    assert.equal((r.values?.itemResults as string[]).length, 8);
    assert.deepEqual(r.values?.suggestions, []);
    assert.equal(r.values?.honestyNote, HONESTY_NOTE);
  });
  it("rejects an invalid answer with a human message", () => {
    const r = runTool({ ...ALL_YES, "mobile-legible": "sorta" });
    assert.equal(r.ok, false);
    assert.ok(String(r.error).includes("mobile-legible") || String(r.error).includes("Invalid answer"));
  });
  it("rejects non-object input", () => {
    assert.equal(runTool(null as unknown as Record<string, unknown>).ok, false);
  });
  it("is deterministic (same answers -> identical output)", () => {
    assert.deepEqual(runTool(ALL_PARTIAL), runTool(ALL_PARTIAL));
  });
  it("honesty note never claims CTR prediction", () => {
    const r = runTool(ALL_NO);
    assert.ok(String(r.values?.honestyNote).includes("SELF-ASSESSED"));
    assert.ok(String(r.values?.honestyNote).toLowerCase().includes("cannot predict"));
  });
});

describe("meta contract (scorer)", () => {
  it("output ids match runTool's returned keys", () => {
    const got = Object.keys(runTool(ALL_YES).values ?? {}).sort();
    const want = outputs.map((o) => o.id).sort();
    assert.deepEqual(got, want);
  });
  it("inputs cover all 8 rubric items as selects", () => {
    const ids = inputs.map((i) => i.id).sort();
    assert.deepEqual(ids, RUBRIC.map((r) => r.id).sort());
    for (const i of inputs) {
      assert.equal(i.type, "select");
      assert.deepEqual(i.options, ["yes", "partially", "no"]);
    }
  });
  it("title is <= 60 chars and description is 140-160 chars", () => {
    assert.ok(content.title.length <= 60, `title ${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description ${content.description.length}`,
    );
  });
  it("has 2-3 examples with real input ids and primitive values", () => {
    const ex = content.examples ?? [];
    assert.ok(ex.length >= 2 && ex.length <= 3);
    const ids = new Set(inputs.map((i) => i.id));
    for (const e of ex) {
      for (const k of Object.keys(e.inputs)) assert.ok(ids.has(k), k);
    }
  });
  it("schema contract: ToolShell auto-emits SoftwareApplication for every tool page", () => {
    // Architecture: ToolShell.astro emits SoftwareApplication for ALL tool
    // pages from tool meta (name + description). content.jsonLd in meta.ts is
    // reserved for tool-specific extras only — tools must not duplicate the
    // shell's block, and the canonical page URL comes from the router.
    const ld = content.jsonLd ?? [];
    const app = ld.find((o) => o["@type"] === "SoftwareApplication");
    assert.equal(app, undefined, "ToolShell auto-generates SoftwareApplication — tools must not duplicate it");
    assert.ok((content.description ?? "").length > 0, "shell builds SoftwareApplication.description from the tool description");
    const shell = readFileSync(
      new URL("../../../src/templates/ToolShell.astro", import.meta.url),
      "utf8",
    );
    assert.ok(shell.includes("'@type': 'SoftwareApplication'"), "ToolShell emits SoftwareApplication");
  });
  it("methodology is honest (rubric, never claims AI generation)", () => {
    const m = (content.methodology ?? "").toLowerCase();
    assert.ok(m.includes("rubric"));
    assert.ok(!/ai[\s-]?generated|ai[\s-]?powered|powered by ai|generated by ai/.test(m));
  });
});
