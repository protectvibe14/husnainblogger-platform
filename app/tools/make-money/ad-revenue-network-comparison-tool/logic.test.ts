/**
 * Tests for the Ad Revenue Network Comparison Tool pure logic (tool-053).
 *
 * Run: node --test app/tools/make-money/ad-revenue-network-comparison-tool/logic.test.ts
 *
 * Expected values are hand-computed from the documented formula, never
 * copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  NETWORKS,
  NICHE_OPTIONS,
  DEFAULT_NICHE,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const okValues = (input: Record<string, unknown>): Record<string, unknown> => {
  const r = runTool(input);
  assert.strictEqual(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Record<string, unknown>;
};

type Table = { columns: string[]; rows: string[][] };
const tableOf = (v: Record<string, unknown>): Table =>
  v.comparisonRows as Table;

describe("network comparison — happy path with defaults", () => {
  it("returns 5 rows sorted by earnings desc (60k sessions, 100% US, Food niche)", () => {
    // geoFactor=1.0, niche=1.0 -> earnings = 60000*rpm/1000:
    // raptive 1800, mediavine 1500, journey 1080, ezoic 720, adsense 300.
    const v = okValues({ monthlySessions: 60000, trafficShareUS: 100, niche: "Food & Recipes" });
    const t = tableOf(v);
    assert.deepStrictEqual(t.columns, [
      "Ad network",
      "Traffic requirement",
      "Eligibility",
      "Adjusted RPM (est.)",
      "Est. monthly earnings",
    ]);
    assert.strictEqual(t.rows.length, 5);
    assert.deepStrictEqual(
      t.rows.map((r) => r[0]),
      ["Raptive", "Mediavine", "Mediavine Journey", "Ezoic", "Google AdSense"],
    );
    assert.deepStrictEqual(
      t.rows.map((r) => r[4]),
      ["$1800.00", "$1500.00", "$1080.00", "$720.00", "$300.00"],
    );
  });

  it("computes hand-checkable adjusted RPMs", () => {
    const v = okValues({ monthlySessions: 60000, trafficShareUS: 100, niche: "Food & Recipes" });
    const t = tableOf(v);
    const rpmCol = t.rows.map((r) => r[3]);
    assert.deepStrictEqual(rpmCol, ["$30.00", "$25.00", "$18.00", "$12.00", "$5.00"]);
  });

  it("marks eligibility against static thresholds at 60k sessions", () => {
    const v = okValues({ monthlySessions: 60000, trafficShareUS: 100 });
    const t = tableOf(v);
    const elig: Record<string, string> = {};
    for (const r of t.rows) elig[r[0]] = r[2];
    assert.strictEqual(elig["Google AdSense"], "No minimum");
    assert.strictEqual(elig["Ezoic"], "No minimum");
    assert.strictEqual(elig["Mediavine"], "Meets minimum (est.)");
    assert.strictEqual(elig["Mediavine Journey"], "Meets minimum (est.)");
    assert.strictEqual(elig["Raptive"], "Below 100,000 — likely not eligible");
  });

  it("keeps the mostly-US traffic note when share is 100", () => {
    const v = okValues({ monthlySessions: 60000 });
    assert.ok(String(v.trafficNote).includes("mostly US-based"));
  });
});

describe("network comparison — user-editable RPM overrides", () => {
  it("a per-network override changes that row and the sort order", () => {
    // mediavineRpm 40 -> 60000*40/1000 = 2400, now on top.
    const v = okValues({ monthlySessions: 60000, mediavineRpm: 40 });
    const t = tableOf(v);
    assert.strictEqual(t.rows[0][0], "Mediavine");
    assert.strictEqual(t.rows[0][4], "$2400.00");
    assert.strictEqual(t.rows[1][0], "Raptive");
  });

  it("honors a lower override (adsenseRpm 2)", () => {
    const v = okValues({ monthlySessions: 60000, adsenseRpm: 2 });
    const t = tableOf(v);
    const row = t.rows.find((r) => r[0] === "Google AdSense");
    assert.ok(row);
    assert.strictEqual(row[4], "$120.00");
  });

  it("accepts RPM overrides at the sanity-band edges", () => {
    const v = okValues({ monthlySessions: 1000, ezoicRpm: 0.5 });
    const t = tableOf(v);
    const row = t.rows.find((r) => r[0] === "Ezoic");
    assert.ok(row);
    assert.strictEqual(row[3], "$0.50");
    assert.strictEqual(row[4], "$0.50");
  });
});

describe("network comparison — niche and geo adjustments", () => {
  it("applies the Personal Finance 1.5x niche factor", () => {
    // mediavine: 25 * 1.0 * 1.5 = 37.50 -> 60000*37.5/1000 = 2250.
    const v = okValues({ monthlySessions: 60000, niche: "Personal Finance" });
    const t = tableOf(v);
    const row = t.rows.find((r) => r[0] === "Mediavine");
    assert.ok(row);
    assert.strictEqual(row[3], "$37.50");
    assert.strictEqual(row[4], "$2250.00");
  });

  it("scales RPMs down for non-US-heavy traffic and returns the note", () => {
    // shareUS 20 -> geoFactor 0.52; mediavine: 25*0.52=13.00 -> 100000*13/1000=1300.
    const v = okValues({ monthlySessions: 100000, trafficShareUS: 20, niche: "Food & Recipes" });
    const t = tableOf(v);
    const row = t.rows.find((r) => r[0] === "Mediavine");
    assert.ok(row);
    assert.strictEqual(row[3], "$13.00");
    assert.strictEqual(row[4], "$1300.00");
    assert.ok(String(v.trafficNote).includes("mostly non-US"));
    assert.ok(String(v.trafficNote).includes("20% US"));
  });

  it("defaults to the Food & Recipes niche when omitted", () => {
    const a = okValues({ monthlySessions: 60000, trafficShareUS: 100 });
    const b = okValues({ monthlySessions: 60000, trafficShareUS: 100, niche: "Food & Recipes" });
    assert.deepStrictEqual(a, b);
  });

  it("defaults shareUS to 100 when omitted", () => {
    const a = okValues({ monthlySessions: 60000 });
    const b = okValues({ monthlySessions: 60000, trafficShareUS: 100 });
    assert.deepStrictEqual(a, b);
  });
});

describe("network comparison — edge cases from spec", () => {
  it("zero sessions -> every row $0 (valid, not an error)", () => {
    const v = okValues({ monthlySessions: 0 });
    const t = tableOf(v);
    assert.strictEqual(t.rows.length, 5);
    for (const r of t.rows) assert.strictEqual(r[4], "$0.00");
    const elig: Record<string, string> = {};
    for (const r of t.rows) elig[r[0]] = r[2];
    assert.strictEqual(elig["Mediavine"], "Below 50,000 — likely not eligible");
  });

  it("shareUS 0 scales RPMs to the 0.4 floor", () => {
    // geoFactor = 0.4; adsense: 5*0.4=2.00 -> 100000*2/1000=200.
    const v = okValues({ monthlySessions: 100000, trafficShareUS: 0 });
    const t = tableOf(v);
    const row = t.rows.find((r) => r[0] === "Google AdSense");
    assert.ok(row);
    assert.strictEqual(row[3], "$2.00");
    assert.strictEqual(row[4], "$200.00");
  });
});

describe("network comparison — validation errors", () => {
  it("rejects missing monthlySessions", () => {
    const r = runTool({});
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("Monthly sessions"));
  });

  it("rejects non-numeric or negative sessions", () => {
    for (const bad of ["50000", NaN, Infinity, -5]) {
      const r = runTool({ monthlySessions: bad });
      assert.strictEqual(r.ok, false, `sessions=${String(bad)} should fail`);
    }
  });

  it("rejects an unknown niche", () => {
    const r = runTool({ monthlySessions: 50000, niche: "Crypto Moon" });
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("Niche must be one of"));
  });

  it("rejects trafficShareUS outside 0-100", () => {
    for (const bad of [-1, 101, 250]) {
      const r = runTool({ monthlySessions: 50000, trafficShareUS: bad });
      assert.strictEqual(r.ok, false, `share=${bad} should fail`);
    }
  });

  it("rejects a non-numeric trafficShareUS", () => {
    const r = runTool({ monthlySessions: 50000, trafficShareUS: "50" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a network RPM outside the sanity band", () => {
    const r = runTool({ monthlySessions: 50000, mediavineRpm: 500 });
    assert.strictEqual(r.ok, false);
    assert.ok(String(r.error).includes("sanity band"));
  });

  it("rejects a non-numeric network RPM", () => {
    const r = runTool({ monthlySessions: 50000, raptiveRpm: "30" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects a non-object input", () => {
    const r = runTool([] as unknown as Record<string, unknown>);
    assert.strictEqual(r.ok, false);
  });
});

describe("network comparison — determinism and contracts", () => {
  it("run twice with same inputs -> identical outputs", () => {
    const input = {
      monthlySessions: 84500,
      trafficShareUS: 73,
      niche: "Tech",
      mediavineRpm: 28,
    };
    const a = runTool(input);
    const b = runTool(input);
    assert.deepStrictEqual(a, b);
  });

  it("runTool returns exactly the ids declared in meta outputs", () => {
    const metaIds = outputs.map((o) => o.id).sort();
    const v = okValues({ monthlySessions: 60000 });
    assert.deepStrictEqual(Object.keys(v).sort(), metaIds);
  });

  it("rows stay sorted by earnings desc even with overrides", () => {
    const v = okValues({ monthlySessions: 60000, adsenseRpm: 100 });
    const t = tableOf(v);
    const amounts = t.rows.map((r) => Number(r[4].replace(/[$,]/g, "")));
    for (let i = 1; i < amounts.length; i++) {
      assert.ok(amounts[i - 1] >= amounts[i], "rows must be sorted desc");
    }
    assert.strictEqual(t.rows[0][0], "Google AdSense");
  });
});

describe("network comparison — tables are documented constants", () => {
  it("ships a 5-network benchmark table and 10 niche options", () => {
    assert.strictEqual(NETWORKS.length, 5);
    assert.ok(
      NETWORKS.every((n) => typeof n.defaultRpm === "number" && n.defaultRpm > 0),
      "every network needs a positive default benchmark RPM",
    );
    assert.strictEqual(NICHE_OPTIONS.length, 10);
    assert.ok(NICHE_OPTIONS.includes(DEFAULT_NICHE));
    assert.strictEqual(DEFAULT_NICHE, "Food & Recipes");
  });
});
