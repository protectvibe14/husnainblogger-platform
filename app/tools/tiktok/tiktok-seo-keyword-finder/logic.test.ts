import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_SEED_LEN, MAX_NICHE_LEN, DISCLAIMER } from "./logic.ts";

const OUTPUT_IDS = [
  "keywordPhrases",
  "questionPhrases",
  "howToPhrases",
  "captionPlacements",
  "disclaimer",
];

const good = { seedTopic: "meal prep", niche: "fitness" };

describe("tiktok-seo-keyword-finder", () => {
  it("happy path returns all outputs", () => {
    const r = runTool(good);
    assert.equal(r.ok, true);
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
    assert.ok((r.values!.keywordPhrases as string[]).length >= 12);
    assert.equal((r.values!.questionPhrases as string[]).length, 4);
    assert.equal((r.values!.howToPhrases as string[]).length, 4);
    assert.equal((r.values!.captionPlacements as string[]).length, 3);
  });

  it("every phrase contains the seed topic", () => {
    const r = runTool(good).values!;
    for (const id of ["keywordPhrases", "questionPhrases", "howToPhrases"]) {
      for (const p of r[id] as string[]) {
        assert.ok(p.toLowerCase().includes("meal prep"), `${id}: ${p}`);
      }
    }
  });

  it("niche combos appear when niche is supplied", () => {
    const r = runTool(good).values!;
    const joined = (r.keywordPhrases as string[]).join(" | ");
    assert.ok(joined.includes("fitness"), "niche combo present");
  });

  it("works without niche (niche optional)", () => {
    const r = runTool({ seedTopic: "meal prep" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.keywordPhrases as string[]).length >= 12);
  });

  it("no duplicates in keyword phrases", () => {
    const r = runTool(good).values!;
    const list = r.keywordPhrases as string[];
    assert.equal(new Set(list.map((s) => s.toLowerCase())).size, list.length);
  });

  it("disclaimer labels output as suggestion bank, not volume data", () => {
    const r = runTool(good).values!;
    assert.equal(r.disclaimer, DISCLAIMER);
    assert.match(DISCLAIMER, /not search-volume data/);
  });

  it("no volume/difficulty/CPC numbers anywhere in outputs", () => {
    const r = runTool(good).values!;
    const all = [
      ...(r.keywordPhrases as string[]),
      ...(r.questionPhrases as string[]),
      ...(r.howToPhrases as string[]),
      ...(r.captionPlacements as string[]),
      r.disclaimer as string,
    ].join(" ");
    // A bare mention of "search volume" is fine when disclaiming it; what
    // must never appear is a metric WITH a number (a fabricated data point).
    assert.ok(!/\b(volume|difficulty|cpc|competition)\s*:?\s*\d/i.test(all), "no numeric metrics");
    assert.ok(!/\b\d+k?\s*(searches|clicks)\b/i.test(all), "no fabricated counts");
  });

  it("missing seedTopic fails", () => {
    const r = runTool({ niche: "fitness" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /seed topic/i);
  });

  it("blank seedTopic fails", () => {
    const r = runTool({ seedTopic: "   " });
    assert.equal(r.ok, false);
  });

  it("over-long seedTopic fails", () => {
    const r = runTool({ seedTopic: "x".repeat(MAX_SEED_LEN + 1) });
    assert.equal(r.ok, false);
  });

  it("over-long niche fails", () => {
    const r = runTool({ seedTopic: "meal prep", niche: "x".repeat(MAX_NICHE_LEN + 1) });
    assert.equal(r.ok, false);
  });

  it("seed topic is normalized to lowercase", () => {
    const a = runTool({ seedTopic: "Meal Prep", niche: "fitness" }).values!;
    const b = runTool({ seedTopic: "meal prep", niche: "fitness" }).values!;
    assert.deepEqual(a, b);
  });

  it("deterministic: same inputs twice give identical outputs", () => {
    const a = runTool(good);
    const b = runTool(good);
    assert.deepEqual(a, b);
  });

  it("different seeds give different phrases", () => {
    const a = runTool(good).values!.keywordPhrases;
    const b = runTool({ ...good, seedTopic: "budget travel" }).values!.keywordPhrases;
    assert.notDeepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(good);
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });

  it("no empty phrases in any bank", () => {
    const r = runTool(good).values!;
    for (const id of ["keywordPhrases", "questionPhrases", "howToPhrases", "captionPlacements"]) {
      for (const p of r[id] as string[]) assert.ok(p.trim().length > 0, `${id} non-empty`);
    }
  });
});
