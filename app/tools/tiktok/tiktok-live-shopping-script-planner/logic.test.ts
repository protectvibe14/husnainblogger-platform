import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";
import { outputs } from "./meta.ts";

const BASE = { products: "Silk pillowcase | $24.99\nVitamin C serum | $18.50\nJade roller", liveDurationMin: 60 };
const OUTPUT_IDS = ["runOfShow", "productSegments", "priceDropMoments", "pinProductCues", "urgencyCtas", "shopPolicyNote"];

function okValues(overrides: Record<string, unknown> = {}) {
  const r = runTool({ ...BASE, ...overrides });
  assert.equal(r.ok, true, `expected ok, got error: ${r.error}`);
  assert.ok(r.values, "values present");
  return r.values!;
}

function totalMinutes(v: Record<string, unknown>): number {
  let sum = 0;
  const ros = v.runOfShow as { columns: string[]; rows: string[][] };
  for (const row of ros.rows) {
    const m = row[0].match(/(\d+)–(\d+) min/);
    assert.ok(m, `row time parses: ${row[0]}`);
    sum += Number(m![2]) - Number(m![1]);
  }
  return sum;
}

describe("tiktok-live-shopping-script-planner", () => {
  it("happy path: run-of-show sums to duration; all per-product outputs sized", () => {
    const v = okValues();
    assert.equal(totalMinutes(v), 60);
    const ros = v.runOfShow as { columns: string[]; rows: string[][] };
    assert.deepEqual(ros.columns, ["Time", "Segment", "Script"]);
    assert.equal((v.productSegments as string[]).length, 3);
    assert.equal((v.priceDropMoments as string[]).length, 3);
    assert.equal((v.pinProductCues as string[]).length, 3);
    assert.equal((v.urgencyCtas as string[]).length, 6);
    assert.ok((v.priceDropMoments as string[])[0].includes("Silk pillowcase"));
    assert.ok((v.priceDropMoments as string[])[0].includes("SAMPLE"), "price-drop lines labeled samples");
    assert.ok((v.productSegments as string[])[2].includes("Jade roller"), "price optional");
  });

  it("output keys exactly match meta.ts outputs", () => {
    const v = okValues();
    assert.deepEqual(Object.keys(v).sort(), OUTPUT_IDS.sort(), "keys match");
    assert.deepEqual(outputs.map((o) => o.id).sort(), OUTPUT_IDS.sort(), "meta ids match");
  });

  it("validation: missing/empty products errors", () => {
    for (const bad of [undefined, null, "", "   \n  "]) {
      const r = runTool({ products: bad, liveDurationMin: 60 });
      assert.equal(r.ok, false, `rejects ${String(bad)}`);
      assert.match(r.error as string, /product/i);
    }
  });

  it("validation: more than 12 products errors", () => {
    const lines = Array.from({ length: 13 }, (_, i) => `Product ${i + 1}`);
    const r = runTool({ products: lines.join("\n"), liveDurationMin: 60 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at most 12 products/);
  });

  it("validation: overlong product line errors", () => {
    const r = runTool({ products: "x".repeat(101), liveDurationMin: 60 });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /too long/);
  });

  it("validation: duration 10-240 enforced", () => {
    for (const bad of [9, 241, 0, -5, 15.5, NaN, "60", undefined]) {
      const r = runTool({ products: "Widget", liveDurationMin: bad });
      assert.equal(r.ok, false, `rejects ${String(bad)}`);
      assert.match(r.error as string, /[Dd]uration|minutes/);
    }
  });

  it("duration boundaries 10 and 240 pass; minutes sum exactly", () => {
    for (const d of [10, 240]) {
      const v = okValues({ liveDurationMin: d });
      assert.equal(totalMinutes(v), d, `sums to ${d}`);
    }
  });

  it("edge case: single product works and says singular", () => {
    const v = okValues({ products: "Silk pillowcase | $24.99", liveDurationMin: 20 });
    assert.equal((v.productSegments as string[]).length, 1);
    const ros = v.runOfShow as { columns: string[]; rows: string[][] };
    assert.ok(ros.rows[0][2].includes("1 product on today's list"), "singular wording");
  });

  it("edge case: 12 products passes", () => {
    const lines = Array.from({ length: 12 }, (_, i) => `Product ${i + 1}`);
    const v = okValues({ products: lines.join("\n"), liveDurationMin: 120 });
    assert.equal((v.productSegments as string[]).length, 12);
    assert.equal(totalMinutes(v), 120);
  });

  it("short sessions (<30 min) skip the flash-deal row; long sessions include it", () => {
    const short = okValues({ liveDurationMin: 20 }).runOfShow as { rows: string[][] };
    assert.ok(!short.rows.some((r) => /Flash-deal/i.test(r[1])), "no flash deal under 30 min");
    const long = okValues({ liveDurationMin: 60 }).runOfShow as { rows: string[][] };
    assert.ok(long.rows.some((r) => /Flash-deal/i.test(r[1])), "flash deal at 60 min");
  });

  it("edge case: products accept an array as well as textarea text", () => {
    const v = okValues({ products: ["A", "B | $5"] });
    assert.equal((v.productSegments as string[]).length, 2);
  });

  it("no unfilled placeholders in any output", () => {
    const v = okValues();
    const ros = v.runOfShow as { columns: string[]; rows: string[][] };
    const all = [
      ...ros.rows.flat(),
      ...(v.productSegments as string[]),
      ...(v.priceDropMoments as string[]),
      ...(v.pinProductCues as string[]),
    ].join(" ");
    assert.ok(!/{name}|{price}|{priceLine}/.test(all), "all placeholders filled");
  });

  it("shop policy note covers TikTok Shop check + no sales guarantees", () => {
    const note = okValues().shopPolicyNote as string;
    assert.match(note, /TikTok Shop/i);
    assert.match(note, /check TikTok Shop's policies for your region/i);
    assert.match(note, /does NOT connect to TikTok Shop/i);
    assert.match(note, /No sales outcomes are promised/i);
  });

  it("determinism: identical inputs give identical outputs", () => {
    assert.deepEqual(runTool({ ...BASE }), runTool({ ...BASE }));
  });

  it("word-bank bounds: 6 urgency CTAs, segment templates rotate per product", () => {
    const v = okValues();
    assert.ok((v.urgencyCtas as string[]).every((c) => c.trim().length > 20), "no empty CTAs");
    const lines = Array.from({ length: 6 }, (_, i) => `P${i}`);
    const v6 = okValues({ products: lines.join("\n"), liveDurationMin: 90 });
    const ros = v6.runOfShow as { rows: string[][] };
    const names = ros.rows.slice(1, 7).map((r) => r[1]);
    assert.equal(new Set(names).size, 6, "6 products hit 6 distinct segment templates");
  });

  it("price parsing: 'name | price' split, price shown in segments and drop lines", () => {
    const v = okValues({ products: "Serum | $18.50", liveDurationMin: 15 });
    assert.ok((v.productSegments as string[])[0].includes("$18.50"));
    assert.ok((v.priceDropMoments as string[])[0].includes("$18.50"));
  });
});
