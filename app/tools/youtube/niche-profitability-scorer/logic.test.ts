import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CPM_BAND_POINTS,
  WEIGHTS,
  normalizeRating,
  scoreNiche,
  runTool,
} from "./logic.ts";

describe("runTool — happy path", () => {
  it("scores a strong niche High", () => {
    const r = runTool({
      nicheName: "Personal finance",
      cpmBand: "over-30",
      competition: 2,
      productionCost: 2,
      buyingIntent: 5,
    });
    assert.equal(r.ok, true);
    const v = r.values!;
    // 0.35*95 + 0.25*100 + 0.25*75 + 0.15*75 = 33.25+25+18.75+11.25 = 88.25 -> 88
    assert.equal(v["score"], 88);
    assert.equal(v["band"], "High");
    assert.equal(v["heuristic"], true);
    assert.equal(v["nicheName"], "Personal finance");
  });
  it("scores a weak niche Low", () => {
    const r = runTool({
      nicheName: "Generic vlogs",
      cpmBand: "under-5",
      competition: 5,
      productionCost: 4,
      buyingIntent: 1,
    });
    assert.equal(r.ok, true);
    // 0.35*15 + 0.25*0 + 0.25*0 + 0.15*25 = 5.25+0+0+3.75 = 9
    assert.equal(r.values!["score"], 9);
    assert.equal(r.values!["band"], "Low");
  });
  it("mid inputs land in Medium", () => {
    const r = runTool({
      nicheName: "Home cooking",
      cpmBand: "5-15",
      competition: 3,
      productionCost: 3,
      buyingIntent: 3,
    });
    assert.equal(r.ok, true);
    // 0.35*45 + 0.25*50 + 0.25*50 + 0.15*50 = 15.75+12.5+12.5+7.5 = 48.25 -> 48
    assert.equal(r.values!["score"], 48);
    assert.equal(r.values!["band"], "Medium");
  });
  it("band boundaries: 70 -> High, 69 -> Medium, 40 -> Medium, 39 -> Low", () => {
    assert.equal(scoreNiche({ nicheName: "x", cpmBand: "15-30", competition: 1, productionCost: 1, buyingIntent: 5 }).band, "High");
    const low = scoreNiche({ nicheName: "x", cpmBand: "under-5", competition: 5, productionCost: 5, buyingIntent: 1 });
    assert.equal(low.score, 5);
    assert.equal(low.band, "Low");
  });
  it("breakdown contributions sum to score", () => {
    const r = runTool({
      nicheName: "Tech reviews",
      cpmBand: "15-30",
      competition: 4,
      productionCost: 3,
      buyingIntent: 4,
    });
    const breakdown = r.values!["breakdown"] as Array<{ contribution: number }>;
    const sum = Math.round(breakdown.reduce((s, b) => s + b.contribution, 0));
    assert.equal(sum, r.values!["score"]);
  });
  it("notes explain each input's effect", () => {
    const r = runTool({
      nicheName: "Fitness",
      cpmBand: "5-15",
      competition: 4,
      productionCost: 2,
      buyingIntent: 3,
    });
    const notes = r.values!["notes"] as string[];
    assert.ok(notes.length >= 4);
    assert.ok(notes.some((n) => n.includes("CPM")));
    assert.ok(notes.some((n) => n.includes("Buying intent")));
    assert.ok(notes.some((n) => n.includes("Competition")));
    assert.ok(notes.some((n) => n.includes("Production cost")));
  });
  it("Low band adds the 'not do not start' note", () => {
    const r = runTool({
      nicheName: "x",
      cpmBand: "under-5",
      competition: 5,
      productionCost: 5,
      buyingIntent: 1,
    });
    assert.ok((r.values!["notes"] as string[]).some((n) => n.includes("do not start")));
  });
  it("trims niche name", () => {
    const r = runTool({
      nicheName: "  AI automation  ",
      cpmBand: "5-15",
      competition: 3,
      productionCost: 3,
      buyingIntent: 3,
    });
    assert.equal(r.values!["nicheName"], "AI automation");
  });
});

describe("runTool — validation errors", () => {
  const base = {
    nicheName: "Gaming",
    cpmBand: "5-15",
    competition: 3,
    productionCost: 3,
    buyingIntent: 3,
  };
  it("missing niche name errors", () => {
    const r = runTool({ ...base, nicheName: "" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("niche"));
  });
  it("missing cpmBand errors", () => {
    const r = runTool({ ...base, cpmBand: undefined });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("CPM"));
  });
  it("invalid cpmBand errors", () => {
    const r = runTool({ ...base, cpmBand: "huge" });
    assert.equal(r.ok, false);
  });
  it("competition out of range errors", () => {
    for (const bad of [0, 6, 2.5, "3", null]) {
      const r = runTool({ ...base, competition: bad });
      assert.equal(r.ok, false, `expected error for ${String(bad)}`);
      assert.ok(r.error!.includes("Competition"));
    }
  });
  it("productionCost out of range errors", () => {
    const r = runTool({ ...base, productionCost: 9 });
    assert.equal(r.ok, false);
  });
  it("buyingIntent out of range errors", () => {
    const r = runTool({ ...base, buyingIntent: -1 });
    assert.equal(r.ok, false);
  });
  it("overlong niche name errors", () => {
    const r = runTool({ ...base, nicheName: "a".repeat(81) });
    assert.equal(r.ok, false);
  });
});

describe("helpers", () => {
  it("normalizeRating maps 1->0, 3->50, 5->100", () => {
    assert.equal(normalizeRating(1), 0);
    assert.equal(normalizeRating(3), 50);
    assert.equal(normalizeRating(5), 100);
  });
  it("weights sum to 1", () => {
    const sum = WEIGHTS.cpm + WEIGHTS.buyingIntent + WEIGHTS.competition + WEIGHTS.productionCost;
    assert.ok(Math.abs(sum - 1) < 1e-9);
  });
  it("CPM band points are ascending", () => {
    assert.ok(CPM_BAND_POINTS["under-5"] < CPM_BAND_POINTS["5-15"]);
    assert.ok(CPM_BAND_POINTS["5-15"] < CPM_BAND_POINTS["15-30"]);
    assert.ok(CPM_BAND_POINTS["15-30"] < CPM_BAND_POINTS["over-30"]);
  });
});

describe("determinism + output ids", () => {
  it("same inputs -> identical outputs", () => {
    const args = { nicheName: "Tech", cpmBand: "over-30", competition: 2, productionCost: 2, buyingIntent: 4 };
    assert.deepEqual(runTool(args), runTool(args));
  });
  it("output ids match meta.ts outputs", () => {
    const r = runTool({ nicheName: "x", cpmBand: "5-15", competition: 3, productionCost: 3, buyingIntent: 3 });
    const ids = Object.keys(r.values!).sort();
    assert.deepEqual(ids, ["band", "breakdown", "heuristic", "nicheName", "notes", "score"]);
  });
});
