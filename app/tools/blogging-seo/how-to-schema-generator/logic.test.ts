import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseStepsText,
  isValidIso8601Duration,
  MAX_STEPS,
  MAX_NAME_CHARS,
  MAX_COST_CHARS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    name: "How to brew pour-over coffee",
    steps: [
      { name: "Heat the water", text: "Heat filtered water to 92°C." },
      { name: "Grind the beans", text: "Grind 20g of beans medium-coarse." },
    ],
    totalTime: "PT15M",
    estimatedCost: "Under $5",
  };
}

describe("how-to-schema-generator", () => {
  it("happy path: name + steps + time + cost -> valid HowTo JSON-LD", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(r.error, undefined);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed["@context"], "https://schema.org");
    assert.equal(parsed["@type"], "HowTo");
    assert.equal(parsed.name, "How to brew pour-over coffee");
    assert.equal(parsed.step.length, 2);
    assert.equal(parsed.step[0]["@type"], "HowToStep");
    assert.equal(parsed.step[0].position, 1);
    assert.equal(parsed.step[0].name, "Heat the water");
    assert.equal(parsed.step[0].text, "Heat filtered water to 92°C.");
    assert.equal(parsed.step[1].position, 2);
    assert.equal(parsed.totalTime, "PT15M");
    assert.equal(parsed.estimatedCost, "Under $5");
    assert.deepEqual(r.values?.errors, []);
  });

  it("accepts the textarea format (blocks: name line, then text lines)", () => {
    const r = runTool({
      name: "Make tea",
      steps: "Boil water\nBring a kettle to a boil.\n\nSteep\nPour over the bag and wait 3 minutes.",
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.step.length, 2);
    assert.equal(parsed.step[0].name, "Boil water");
    assert.equal(parsed.step[1].text, "Pour over the bag and wait 3 minutes.");
  });

  it("minimal: name + one step, no optionals", () => {
    const r = runTool({
      name: "Single step",
      steps: [{ name: "Do it", text: "Just do it." }],
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.step.length, 1);
    assert.equal(parsed.totalTime, undefined);
    assert.equal(parsed.estimatedCost, undefined);
  });

  it("single-step how-to is a valid edge case", () => {
    const r = runTool({ name: "One", steps: "Only step\nDo the thing." });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.step[0].position, 1);
  });

  it("missing name -> ok:false", () => {
    const r = runTool({ name: "  ", steps: [{ name: "S", text: "T" }] });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /title/i);
  });

  it("name over max chars -> ok:false", () => {
    const r = runTool({
      name: "n".repeat(MAX_NAME_CHARS + 1),
      steps: [{ name: "S", text: "T" }],
    });
    assert.equal(r.ok, false);
  });

  it("missing steps -> ok:false", () => {
    const r = runTool({ name: "How to X" });
    assert.equal(r.ok, false);
  });

  it("empty steps array -> ok:false", () => {
    const r = runTool({ name: "How to X", steps: [] });
    assert.equal(r.ok, false);
  });

  it("empty steps string -> ok:false", () => {
    const r = runTool({ name: "How to X", steps: "   " });
    assert.equal(r.ok, false);
  });

  it("over max steps -> ok:false", () => {
    const steps = Array.from({ length: MAX_STEPS + 1 }, (_, i) => ({
      name: `Step ${i}`,
      text: `Text ${i}`,
    }));
    const r = runTool({ name: "How to X", steps });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Too many steps/);
  });

  it("step with empty name -> ok:false", () => {
    const r = runTool({
      name: "How to X",
      steps: [{ name: "  ", text: "Text" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /Step 1/);
  });

  it("step with empty text -> warning, still emitted", () => {
    const r = runTool({
      name: "How to X",
      steps: [{ name: "Named step", text: "  " }],
    });
    assert.equal(r.ok, true);
    const errs = r.values?.errors as string[];
    assert.ok(errs.length > 0);
    assert.match(errs[0], /Step 1/);
  });

  it("invalid totalTime -> ok:false with format hint", () => {
    const r = runTool({ ...happyValues(), totalTime: "30 minutes" });
    assert.equal(r.ok, false);
    assert.match(r.error ?? "", /ISO 8601/);
  });

  it("bare P / PT durations rejected", () => {
    assert.equal(isValidIso8601Duration("P"), false);
    assert.equal(isValidIso8601Duration("PT"), false);
    assert.equal(isValidIso8601Duration(""), false);
  });

  it("valid durations accepted: PT30M, P1DT2H, P2W", () => {
    for (const d of ["PT30M", "P1DT2H", "P2W", "P1Y2M3DT4H5M6S"]) {
      assert.equal(isValidIso8601Duration(d), true, d);
    }
    const r = runTool({ ...happyValues(), totalTime: "P1DT2H" });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.totalTime, "P1DT2H");
  });

  it("week combined with other date components rejected", () => {
    assert.equal(isValidIso8601Duration("P1W2D"), false);
  });

  it("estimatedCost over max chars -> ok:false", () => {
    const r = runTool({
      ...happyValues(),
      estimatedCost: "c".repeat(MAX_COST_CHARS + 1),
    });
    assert.equal(r.ok, false);
  });

  it("unicode steps preserved", () => {
    const r = runTool({
      name: "Kaffee ☕",
      steps: [{ name: "Wasser kochen", text: "92°C — Grüße!" }],
    });
    assert.equal(r.ok, true);
    const parsed = JSON.parse(r.values?.jsonLd as string);
    assert.equal(parsed.step[0].name, "Wasser kochen");
  });

  it("non-object values -> ok:false", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("deterministic: same input -> identical output", () => {
    const a = runTool(happyValues());
    const b = runTool(happyValues());
    assert.deepEqual(a.values, b.values);
  });

  it("output ids match meta.ts", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values ?? {}), OUTPUT_IDS);
    assert.deepEqual(OUTPUT_IDS, ["jsonLd", "errors"]);
  });

  it("parseStepsText ignores empty blocks", () => {
    assert.deepEqual(parseStepsText("\n\n\n"), []);
  });
});
