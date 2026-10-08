import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ANGLE_BANK,
  FORMATS,
  MAX_IDEAS,
  NAME_PATTERNS,
  NICHES,
  POLICY_NOTE,
  mixIdeas,
  runTool,
} from "./logic.ts";

describe("runTool — happy path", () => {
  it("mixes ideas for a given niche and format", () => {
    const r = runTool({ niche: "space facts", format: "listicle", count: 5 });
    assert.equal(r.ok, true);
    const ideas = r.values!["ideas"] as string[];
    assert.equal(ideas.length, 5);
    for (const idea of ideas) {
      assert.ok(idea.startsWith("Listicle — "));
      assert.ok(idea.includes("space facts"));
    }
    assert.equal(r.values!["isTemplateBased"], true);
  });
  it("defaults: count 10, all niches cycled when niche blank", () => {
    const r = runTool({});
    assert.equal(r.ok, true);
    assert.equal((r.values!["ideas"] as string[]).length, 10);
  });
  it("format 'any' is treated as unset", () => {
    const r = runTool({ niche: "cooking", format: "any", count: 4 });
    assert.equal(r.ok, true);
    const ideas = r.values!["ideas"] as string[];
    assert.ok(ideas[0].startsWith("Listicle — "));
    assert.ok(ideas[1].startsWith("Compilation — "));
  });
  it("cycles angle bank when count exceeds 12", () => {
    const r = runTool({ niche: "history", format: "narration", count: 14 });
    const ideas = r.values!["ideas"] as string[];
    assert.equal(ideas.length, 14);
    const strip = (s: string) => s.replace("history", "X");
    assert.equal(strip(ideas[0]), strip(ideas[12]));
  });
  it("channel name seeds use the niche title-cased", () => {
    const r = runTool({ niche: "space facts", count: 2 });
    const seeds = r.values!["channelNameSeeds"] as string[];
    assert.equal(seeds.length, NAME_PATTERNS.length);
    assert.ok(seeds.includes("Space Facts Lab"));
    assert.ok(seeds.includes("The Space Facts Channel"));
  });
  it("no-niche name seeds use the first bank niche", () => {
    const r = runTool({ count: 1 });
    const seeds = r.values!["channelNameSeeds"] as string[];
    assert.ok(seeds[0].includes("Personal Finance Tips"));
  });
  it("policy note about inauthentic content is present", () => {
    const r = runTool({ niche: "x" });
    assert.ok(String(r.values!["policyNote"]).includes("inauthentic-content"));
    assert.ok(String(r.values!["policyNote"]).includes("2025"));
  });
  it("bankInfo documents bank sizes", () => {
    const r = runTool({ niche: "x" });
    const info = String(r.values!["bankInfo"]);
    assert.ok(info.includes("16 niches"));
    assert.ok(info.includes("4 formats"));
    assert.ok(info.includes("12 angles"));
    assert.ok(info.includes("10 name patterns"));
  });
  it("no unreplaced placeholders in ideas", () => {
    const r = runTool({ niche: "gaming", count: MAX_IDEAS });
    for (const idea of r.values!["ideas"] as string[]) {
      assert.ok(!idea.includes("{niche}"), idea);
    }
    for (const seed of r.values!["channelNameSeeds"] as string[]) {
      assert.ok(!seed.includes("{Niche}"), seed);
    }
  });
});

describe("runTool — validation errors", () => {
  it("overlong niche errors", () => {
    const r = runTool({ niche: "x".repeat(61) });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("60"));
  });
  it("unknown format errors", () => {
    const r = runTool({ niche: "x", format: "vlog" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("listicle"));
  });
  it("count 0 errors", () => {
    const r = runTool({ niche: "x", count: 0 });
    assert.equal(r.ok, false);
  });
  it("count above MAX_IDEAS errors", () => {
    const r = runTool({ niche: "x", count: MAX_IDEAS + 1 });
    assert.equal(r.ok, false);
  });
  it("non-integer count errors", () => {
    const r = runTool({ niche: "x", count: 2.5 });
    assert.equal(r.ok, false);
  });
  it("non-string niche errors", () => {
    const r = runTool({ niche: 42 });
    assert.equal(r.ok, false);
  });
});

describe("bank sizes", () => {
  it("banks have documented sizes", () => {
    assert.equal(NICHES.length, 16);
    assert.equal(FORMATS.length, 4);
    assert.equal(ANGLE_BANK.length, 12);
    assert.equal(NAME_PATTERNS.length, 10);
  });
  it("POLICY_NOTE is non-empty", () => {
    assert.ok(POLICY_NOTE.length > 50);
  });
});

describe("determinism + output ids", () => {
  it("same inputs -> identical outputs", () => {
    const args = { niche: "AI tools", format: "tutorial", count: 7 };
    assert.deepEqual(runTool(args), runTool(args));
  });
  it("mixIdeas is pure", () => {
    assert.deepEqual(mixIdeas("x", "listicle", 5), mixIdeas("x", "listicle", 5));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ niche: "x" });
    const ids = Object.keys(r.values!).sort();
    assert.deepEqual(ids, [
      "bankInfo",
      "channelNameSeeds",
      "ideas",
      "isTemplateBased",
      "policyNote",
    ]);
  });
});
