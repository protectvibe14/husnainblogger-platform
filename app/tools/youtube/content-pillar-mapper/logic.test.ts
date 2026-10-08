import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FORMAT_BANK,
  MAX_PILLARS,
  SUBTOPIC_PROMPTS,
  mapPillars,
  parsePillars,
  runTool,
} from "./logic.ts";

describe("runTool — happy path", () => {
  it("maps 3 pillars with prompts and formats", () => {
    const r = runTool({
      niche: "home coffee",
      pillars: "Brewing guides\nGear reviews\nCoffee science",
    });
    assert.equal(r.ok, true);
    const v = r.values!;
    assert.equal(v["pillarCount"], 3);
    const m = v["pillarMap"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(m.columns, ["Pillar", "Subtopic prompts", "Suggested formats"]);
    assert.equal(m.rows.length, 3);
    assert.equal(m.rows[0][0], "Brewing guides");
    // 3 prompts joined with " | "
    assert.equal(m.rows[0][1].split(" | ").length, 3);
    assert.ok(m.rows[0][1].includes("home coffee"));
    assert.ok(m.rows[0][1].includes("Brewing guides"));
    const cards = v["promptCards"] as string[];
    assert.equal(cards.length, 9);
    assert.ok(cards[0].startsWith("[Brewing guides]"));
    assert.equal(v["isTemplateBased"], true);
  });
  it("pillars get different bank offsets (deterministic variety)", () => {
    const r = runTool({ niche: "fitness", pillars: "Nutrition\nWorkouts" });
    const m = r.values!["pillarMap"] as { rows: string[][] };
    assert.notEqual(m.rows[0][1], m.rows[1][1]);
    assert.notEqual(m.rows[0][2], m.rows[1][2]);
  });
  it("single pillar works", () => {
    const r = runTool({ niche: "x", pillars: "Only pillar" });
    assert.equal(r.ok, true);
    assert.equal(r.values!["pillarCount"], 1);
  });
  it("dedupes pillars case-insensitively", () => {
    const r = runTool({ niche: "x", pillars: "A\na\nA " });
    assert.equal(r.values!["pillarCount"], 1);
  });
  it("no unreplaced placeholders", () => {
    const r = runTool({ niche: "gaming", pillars: "P1\nP2\nP3" });
    for (const c of r.values!["promptCards"] as string[]) {
      assert.ok(!c.includes("{pillar}") && !c.includes("{niche}"), c);
    }
    assert.ok(String(r.values!["methodologyNote"]).includes("12 prompts"));
    assert.ok(String(r.values!["methodologyNote"]).includes("8 formats"));
  });
  it("exactly 8 pillars accepted", () => {
    const pillars = Array.from({ length: 8 }, (_, i) => `Pillar ${i + 1}`).join("\n");
    const r = runTool({ niche: "x", pillars });
    assert.equal(r.ok, true);
    assert.equal(r.values!["pillarCount"], 8);
  });
});

describe("runTool — validation errors", () => {
  it("missing niche errors", () => {
    const r = runTool({ pillars: "A" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("niche"));
  });
  it("missing pillars errors", () => {
    const r = runTool({ niche: "x" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("at least 1 pillar"));
  });
  it("blank pillars errors", () => {
    const r = runTool({ niche: "x", pillars: "  \n " });
    assert.equal(r.ok, false);
  });
  it("9 pillars rejected", () => {
    const pillars = Array.from({ length: 9 }, (_, i) => `P${i}`).join("\n");
    const r = runTool({ niche: "x", pillars });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("8"));
  });
  it("overlong pillar rejected", () => {
    const r = runTool({ niche: "x", pillars: "a".repeat(61) });
    assert.equal(r.ok, false);
  });
  it("overlong niche rejected", () => {
    const r = runTool({ niche: "x".repeat(81), pillars: "A" });
    assert.equal(r.ok, false);
  });
});

describe("helpers", () => {
  it("parsePillars trims and drops empties", () => {
    assert.deepEqual(parsePillars(" a \n\n b "), ["a", "b"]);
  });
  it("parsePillars non-string -> []", () => {
    assert.deepEqual(parsePillars(5), []);
  });
  it("bank sizes documented", () => {
    assert.equal(SUBTOPIC_PROMPTS.length, 12);
    assert.equal(FORMAT_BANK.length, 8);
  });
  it("FORMAT_BANK entries have format + use", () => {
    for (const f of FORMAT_BANK) {
      assert.ok(f.format.length > 0 && f.use.length > 0);
    }
  });
});

describe("determinism + output ids", () => {
  it("same inputs -> identical outputs", () => {
    const args = { niche: "tech", pillars: "Reviews\nTutorials" };
    assert.deepEqual(runTool(args), runTool(args));
  });
  it("mapPillars is pure", () => {
    assert.deepEqual(mapPillars("x", ["A", "B"]), mapPillars("x", ["A", "B"]));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ niche: "x", pillars: "A" });
    const ids = Object.keys(r.values!).sort();
    assert.deepEqual(ids, [
      "isTemplateBased",
      "methodologyNote",
      "pillarCount",
      "pillarMap",
      "promptCards",
    ]);
  });
});
