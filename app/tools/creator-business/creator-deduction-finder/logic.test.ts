import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseChecklist,
  parseBoolean,
  normalizeCreatorType,
  matchCategories,
  DEDUCTION_CATEGORIES,
  CREATOR_TYPES,
  RECORD_KEEPING_TIPS,
  QUESTIONS_FOR_TAX_PRO,
  CONFIRM_NOTE,
} from "./logic.ts";

type Values = {
  matchedDeductionCategories: string[];
  recordKeepingTips: string[];
  questionsForTaxPro: string[];
};

function run(values: Record<string, unknown>): Values {
  const r = runTool(values);
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Values;
}

describe("creator-deduction-finder (tool-470)", () => {
  it("curated list has exactly 18 categories", () => {
    assert.equal(DEDUCTION_CATEGORIES.length, 18);
  });

  it("creatorType alone returns type-relevant categories", () => {
    const v = run({ creatorType: "video" });
    assert.ok(v.matchedDeductionCategories.length > 0);
    const joined = v.matchedDeductionCategories.join(" ");
    assert.ok(joined.includes("Cameras & filming gear"));
    assert.ok(joined.includes("Lighting equipment"));
  });

  it("each creator type returns at least 5 categories", () => {
    for (const t of CREATOR_TYPES) {
      const v = run({ creatorType: t });
      assert.ok(
        v.matchedDeductionCategories.length >= 5,
        `${t} returned only ${v.matchedDeductionCategories.length}`,
      );
    }
  });

  it("checklist entries match by name and alias (case-insensitive)", () => {
    const v = run({ expenseChecklist: "Camera\nMIC\npremiere" });
    const joined = v.matchedDeductionCategories.join(" ");
    assert.ok(joined.includes("Cameras & filming gear"));
    assert.ok(joined.includes("Audio equipment"));
    assert.ok(joined.includes("Editing software & apps"));
    assert.ok(joined.includes("matched from your checklist"));
  });

  it("comma-separated checklist entries also match", () => {
    const { matchedIds } = matchCategories(parseChecklist("internet, mileage, accountant"));
    assert.deepEqual(matchedIds, ["internet-phone", "vehicle-mileage", "professional-services"]);
  });

  it("homeOffice=true adds the home-office category", () => {
    const v = run({ homeOffice: true });
    assert.ok(v.matchedDeductionCategories.join(" ").includes("Home office"));
  });

  it("vehicleUse=true adds the vehicle category", () => {
    const v = run({ vehicleUse: "true" });
    assert.ok(v.matchedDeductionCategories.join(" ").includes("Vehicle & mileage"));
  });

  it("unmatched entries are reported, never silently dropped", () => {
    const v = run({ expenseChecklist: "camera, llama food" });
    const last = v.matchedDeductionCategories[v.matchedDeductionCategories.length - 1];
    assert.ok(last.includes("Not on our general list"));
    assert.ok(last.includes("llama food"));
  });

  it("duplicate checklist entries are deduplicated", () => {
    const v = run({ expenseChecklist: "camera, Camera, CAMERA" });
    const count = v.matchedDeductionCategories.filter((l) => l.includes("Cameras & filming gear")).length;
    assert.equal(count, 1);
  });

  it("empty everything -> human error", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").toLowerCase().includes("creator type"));
  });

  it("invalid creator type -> human error", () => {
    const r = runTool({ creatorType: "chef" });
    assert.equal(r.ok, false);
    assert.ok((r.error ?? "").includes("Unknown creator type"));
  });

  it("normalizeCreatorType accepts all 5 types, rejects empty as not-selected", () => {
    for (const t of CREATOR_TYPES) {
      assert.equal(normalizeCreatorType(t).type, t);
    }
    assert.equal(normalizeCreatorType("").type, null);
    assert.equal(normalizeCreatorType(undefined).type, null);
  });

  it("parseBoolean handles booleans, strings, and numbers", () => {
    assert.equal(parseBoolean(true), true);
    assert.equal(parseBoolean("yes"), true);
    assert.equal(parseBoolean("1"), true);
    assert.equal(parseBoolean(false), false);
    assert.equal(parseBoolean("no"), false);
    assert.equal(parseBoolean(undefined), false);
  });

  it("recordKeepingTips returns the fixed 6 tips", () => {
    const v = run({ creatorType: "writer" });
    assert.deepEqual(v.recordKeepingTips, RECORD_KEEPING_TIPS);
    assert.equal(v.recordKeepingTips.length, 6);
  });

  it("questionsForTaxPro returns the fixed 5 questions", () => {
    const v = run({ creatorType: "streamer" });
    assert.deepEqual(v.questionsForTaxPro, QUESTIONS_FOR_TAX_PRO);
    assert.equal(v.questionsForTaxPro.length, 5);
  });

  it("every matched category line carries the confirm-with-pro note", () => {
    const v = run({ creatorType: "photo", expenseChecklist: "lighting", homeOffice: true });
    for (const line of v.matchedDeductionCategories) {
      if (line.startsWith("Not on our general list")) continue;
      assert.ok(line.includes(CONFIRM_NOTE), `missing note: ${line}`);
    }
  });

  it("no result ever claims an item IS deductible for the user", () => {
    const v = run({
      creatorType: "video",
      expenseChecklist: "camera, travel, insurance",
      homeOffice: true,
      vehicleUse: true,
    });
    const joined = v.matchedDeductionCategories.join(" ").toLowerCase();
    assert.ok(!joined.includes("is deductible"));
    assert.ok(!joined.includes("are deductible"));
    assert.ok(!joined.includes("you can deduct"));
    assert.ok(!joined.includes("you may deduct"));
  });

  it("returns exactly the 3 output keys", () => {
    const r = runTool({ creatorType: "audio" });
    assert.deepEqual(Object.keys(r.values ?? {}).sort(), [
      "matchedDeductionCategories",
      "questionsForTaxPro",
      "recordKeepingTips",
    ]);
  });

  it("deterministic: same inputs, identical outputs", () => {
    const args = { creatorType: "video", expenseChecklist: "camera", homeOffice: true };
    assert.deepEqual(run(args), run(args));
  });
});
