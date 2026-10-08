import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, roundTo, toNumber, WORDS_PER_HOUR_WARNING } from "./logic.ts";

describe("freelance-writing-rate-calculator", () => {
  it("computes rates on a happy path", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: 500, projectWords: 2000, currency: "USD" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.perWordRate, 0.1);
    assert.equal(r.values!.per1000Words, 100);
    assert.equal(r.values!.perProjectQuote, 200);
  });

  it("rounds a non-terminating per-word rate to 3 decimals", () => {
    const r = runTool({ hourlyRate: 60, wordsPerHour: 700 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.perWordRate, 0.086); // 60/700 = 0.085714…
    assert.equal(r.values!.per1000Words, 85.71);
  });

  it("defaults currency to USD", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: 500 });
    assert.equal(r.ok, true);
    const lines = r.values!.breakdown as string[];
    assert.ok(lines[0].includes("USD"));
  });

  it("uppercases a lowercase currency code", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: 500, currency: "eur" });
    assert.equal(r.ok, true);
    const lines = r.values!.breakdown as string[];
    assert.ok(lines[0].includes("EUR"));
  });

  it("rejects an invalid currency code", () => {
    for (const bad of ["USDD", "US", "12A", "U$D"]) {
      const r = runTool({ hourlyRate: 50, wordsPerHour: 500, currency: bad });
      assert.equal(r.ok, false, `expected failure for ${bad}`);
      assert.match(r.error!, /3-letter/);
    }
  });

  it("rejects missing hourly rate", () => {
    const r = runTool({ wordsPerHour: 500 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Hourly rate/);
  });

  it("rejects zero or negative hourly rate", () => {
    for (const bad of [0, -25]) {
      const r = runTool({ hourlyRate: bad, wordsPerHour: 500 });
      assert.equal(r.ok, false, `expected failure for ${bad}`);
    }
  });

  it("rejects non-numeric hourly rate", () => {
    const r = runTool({ hourlyRate: "fifty", wordsPerHour: 500 });
    assert.equal(r.ok, false);
  });

  it("rejects missing words per hour", () => {
    const r = runTool({ hourlyRate: 50 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Words per hour/);
  });

  it("rejects zero words per hour", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: 0 });
    assert.equal(r.ok, false);
  });

  it("rejects a non-positive project word count", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: 500, projectWords: -100 });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Project word count/);
  });

  it("omits the project quote gracefully when no project words given", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: 500 });
    assert.equal(r.ok, true);
    assert.equal(r.values!.perProjectQuote, 0);
    const lines = r.values!.breakdown as string[];
    assert.ok(lines.some((l) => l.includes("Add a project word count")));
  });

  it("adds a warning when wordsPerHour is unrealistically high", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: WORDS_PER_HOUR_WARNING + 1 });
    assert.equal(r.ok, true);
    const lines = r.values!.breakdown as string[];
    assert.ok(lines.some((l) => l.includes("unusually fast")));
  });

  it("adds no warning at exactly the threshold", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: WORDS_PER_HOUR_WARNING });
    assert.equal(r.ok, true);
    const lines = r.values!.breakdown as string[];
    assert.ok(!lines.some((l) => l.includes("unusually fast")));
  });

  it("accepts numeric strings for number inputs", () => {
    const r = runTool({ hourlyRate: "50", wordsPerHour: "500" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.perWordRate, 0.1);
  });

  it("labels outputs as based on the user's own inputs", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: 500 });
    assert.equal(r.ok, true);
    const lines = r.values!.breakdown as string[];
    assert.ok(lines.some((l) => l.includes("your rates, not market rates")));
  });

  it("rejects a non-object input", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("is deterministic (same inputs → identical outputs)", () => {
    const input = { hourlyRate: 75, wordsPerHour: 900, projectWords: 1500, currency: "GBP" };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepEqual(a, b);
  });

  it("returns exactly the output ids defined in meta.ts", () => {
    const r = runTool({ hourlyRate: 50, wordsPerHour: 500 });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "breakdown",
      "per1000Words",
      "perProjectQuote",
      "perWordRate",
    ]);
  });

  it("roundTo handles floating-point drift", () => {
    assert.equal(roundTo(2.675, 2), 2.68);
    assert.equal(roundTo(0.1 + 0.2, 2), 0.3);
  });

  it("toNumber coerces numeric strings and rejects junk", () => {
    assert.equal(toNumber("50"), 50);
    assert.equal(toNumber(50), 50);
    assert.equal(toNumber("abc"), null);
    assert.equal(toNumber(Infinity), null);
    assert.equal(toNumber(""), null);
  });
});
