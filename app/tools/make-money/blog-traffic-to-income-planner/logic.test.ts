/**
 * Tests for the Blog Traffic-to-Income Planner pure logic (tool-054).
 *
 * Run: node --test app/tools/make-money/blog-traffic-to-income-planner/logic.test.ts
 *
 * Expected values are hand-computed from the documented formula, never
 * copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import { runTool, round2, STREAM_LABELS } from "./logic.ts";
import { outputs } from "./meta.ts";

const okValues = (input: Record<string, unknown>): Record<string, unknown> => {
  const r = runTool(input);
  assert.strictEqual(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Record<string, unknown>;
};

type Table = { columns: string[]; rows: string[][] };

describe("income planner — happy path", () => {
  it("combines ad income with three entered streams", () => {
    // ad = 100000*25/1000 = 2500; total = 2500+800+300+400 = 4000; annual = 48000.
    const v = okValues({
      monthlySessions: 100000,
      rpm: 25,
      affiliateRevenue: 800,
      productRevenue: 300,
      sponsoredRevenue: 400,
    });
    assert.strictEqual(v.totalMonthlyIncome, 4000);
    assert.strictEqual(v.annualProjection, 48000);
    const t = v.incomeBreakdown as Table;
    assert.deepStrictEqual(t.columns, ["Income stream", "Monthly amount (USD)", "Share of total"]);
    assert.deepStrictEqual(
      t.rows.map((r) => r[0]),
      [...STREAM_LABELS],
    );
    assert.deepStrictEqual(
      t.rows.map((r) => r[1]),
      ["$2500.00", "$800.00", "$300.00", "$400.00"],
    );
  });

  it("computes per-stream share at 1 decimal", () => {
    // shares: 2500/4000=62.5%, 800/4000=20.0%, 300/4000=7.5%, 400/4000=10.0%.
    const v = okValues({
      monthlySessions: 100000,
      rpm: 25,
      affiliateRevenue: 800,
      productRevenue: 300,
      sponsoredRevenue: 400,
    });
    const t = v.incomeBreakdown as Table;
    assert.deepStrictEqual(
      t.rows.map((r) => r[2]),
      ["62.5%", "20.0%", "7.5%", "10.0%"],
    );
  });

  it("names the biggest stream in the guidance", () => {
    const v = okValues({
      monthlySessions: 100000,
      rpm: 25,
      affiliateRevenue: 800,
      productRevenue: 300,
      sponsoredRevenue: 400,
    });
    assert.ok(String(v.guidance).includes("Display ads"));
    assert.ok(String(v.guidance).includes("62.5%"));
    assert.ok(String(v.guidance).includes("$48000.00"));
  });

  it("works with ads-only input (other streams default to 0)", () => {
    // ad = 50000*20/1000 = 1000; total = 1000; annual = 12000.
    const v = okValues({ monthlySessions: 50000, rpm: 20 });
    assert.strictEqual(v.totalMonthlyIncome, 1000);
    assert.strictEqual(v.annualProjection, 12000);
    const t = v.incomeBreakdown as Table;
    assert.strictEqual(t.rows[0][2], "100.0%");
    assert.strictEqual(t.rows[1][2], "0.0%");
  });

  it("works with revenue-only input (no traffic)", () => {
    // total = 0+1200+0+500 = 1700; annual = 20400.
    const v = okValues({ affiliateRevenue: 1200, sponsoredRevenue: 500 });
    assert.strictEqual(v.totalMonthlyIncome, 1700);
    assert.strictEqual(v.annualProjection, 20400);
    assert.ok(String(v.guidance).includes("Affiliate revenue"));
  });

  it("rounds fractional money to cents and percent to 1 decimal", () => {
    // ad = 33333*17.5/1000 = 583.3275 -> 583.33.
    const v = okValues({ monthlySessions: 33333, rpm: 17.5 });
    assert.strictEqual(v.totalMonthlyIncome, 583.33);
    const t = v.incomeBreakdown as Table;
    assert.strictEqual(t.rows[0][1], "$583.33");
  });
});

describe("income planner — edge cases from spec", () => {
  it("all-zero inputs -> $0 totals with a guidance message (valid, not an error)", () => {
    const v = okValues({});
    assert.strictEqual(v.totalMonthlyIncome, 0);
    assert.strictEqual(v.annualProjection, 0);
    const t = v.incomeBreakdown as Table;
    for (const r of t.rows) {
      assert.strictEqual(r[1], "$0.00");
      assert.strictEqual(r[2], "0.0%");
    }
    assert.ok(
      String(v.guidance).includes("All income streams are $0"),
      "must include the all-zero guidance message",
    );
  });

  it("treats empty-string inputs as 0", () => {
    const v = okValues({ monthlySessions: "", rpm: "", affiliateRevenue: "" });
    assert.strictEqual(v.totalMonthlyIncome, 0);
  });

  it("handles very large totals without losing finiteness", () => {
    // ad = 1e9*200/1000 = 2e8; total = 2e8; annual = 2.4e9.
    const v = okValues({ monthlySessions: 1e9, rpm: 200 });
    assert.strictEqual(v.totalMonthlyIncome, 200000000);
    assert.strictEqual(v.annualProjection, 2400000000);
    assert.ok(Number.isFinite(v.totalMonthlyIncome as number));
  });
});

describe("income planner — validation errors", () => {
  it("rejects negative inputs for every field", () => {
    const fields = [
      "monthlySessions",
      "rpm",
      "affiliateRevenue",
      "productRevenue",
      "sponsoredRevenue",
    ];
    for (const f of fields) {
      const r = runTool({ [f]: -1 });
      assert.strictEqual(r.ok, false, `${f}=-1 should fail`);
      assert.ok(String(r.error).includes("negative"));
    }
  });

  it("rejects non-numeric or non-finite inputs", () => {
    for (const bad of ["100", NaN, Infinity, true]) {
      const r = runTool({ monthlySessions: bad });
      assert.strictEqual(r.ok, false, `sessions=${String(bad)} should fail`);
    }
    const r = runTool({ affiliateRevenue: "800" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a non-object input", () => {
    const r = runTool(42 as unknown as Record<string, unknown>);
    assert.strictEqual(r.ok, false);
  });
});

describe("income planner — determinism", () => {
  it("run twice with same inputs -> identical outputs", () => {
    const input = {
      monthlySessions: 123456,
      rpm: 22.7,
      affiliateRevenue: 999.99,
      productRevenue: 150.25,
      sponsoredRevenue: 2000,
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
  });
});

describe("income planner — output ids match meta.ts outputs", () => {
  it("runTool returns exactly the ids declared in meta outputs", () => {
    const metaIds = outputs.map((o) => o.id).sort();
    const v = okValues({ monthlySessions: 50000, rpm: 20 });
    assert.deepStrictEqual(Object.keys(v).sort(), metaIds);
  });

  it("meta declares the expected output ids", () => {
    const ids = outputs.map((o) => o.id);
    assert.deepStrictEqual(ids.sort(), [
      "annualProjection",
      "guidance",
      "incomeBreakdown",
      "totalMonthlyIncome",
    ]);
  });
});

describe("income planner — stream labels", () => {
  it("documents exactly four income streams", () => {
    assert.deepStrictEqual([...STREAM_LABELS], [
      "Display ads",
      "Affiliate revenue",
      "Product revenue",
      "Sponsored revenue",
    ]);
    assert.strictEqual(round2(583.3275), 583.33);
  });
});
