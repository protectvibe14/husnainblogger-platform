/**
 * Tests for the Blog Income Stream Diversification Planner (tool-505).
 *
 * Run: node --test app/tools/make-money/blog-income-stream-diversification-planner/logic.test.ts
 *
 * Expected values are hand-computed from the documented fixed rule set in
 * logic.ts — never copied from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  normalizeStreams,
  STREAM_CATALOG,
  COMPLEMENT_RULES,
  PLAN_ROWS,
  TIMING_BY_RANK,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const okValues = (input: Record<string, unknown>): Record<string, unknown> => {
  const r = runTool(input);
  assert.strictEqual(r.ok, true, `expected ok, got error: ${r.error}`);
  return r.values as Record<string, unknown>;
};

const errOf = (input: unknown): string => {
  const r = runTool(input as Record<string, unknown>);
  assert.strictEqual(r.ok, false, "expected failure, got ok");
  assert.ok(typeof r.error === "string" && r.error.length > 0, "error must be a non-empty string");
  return r.error as string;
};

type Table = { columns: string[]; rows: string[][] };

describe("diversification planner — happy path", () => {
  it("plans 4 ranked streams for an ad-only blog with revenue", () => {
    const v = okValues({ currentStreams: "Display ads", monthlyRevenue: 2000 });
    const t = v.diversificationPlan as Table;
    assert.deepStrictEqual(t.columns, [
      "Recommended stream",
      "Why it fits your blog",
      "Effort",
      "Income potential",
      "When to add",
    ]);
    // display-ads rule votes: affiliate-marketing:1, digital-products:1.
    // Top 4 by (votes desc, catalog order asc):
    // affiliate(1), digital(1), sponsored(0), memberships(0).
    assert.deepStrictEqual(
      t.rows.map((r) => r[0]),
      ["Affiliate marketing", "Digital products", "Sponsored posts", "Memberships / subscriptions"],
    );
    assert.deepStrictEqual(
      t.rows.map((r) => r[2]),
      ["Low", "High", "Medium", "High"],
    );
    assert.deepStrictEqual(
      t.rows.map((r) => r[4]),
      [...TIMING_BY_RANK],
    );
    assert.strictEqual(
      t.rows[0][1],
      "Monetizes the buying intent already inside your reviews and tutorials.",
    );
  });

  it("strategy note names the concentration level and the revenue band as an estimate", () => {
    const v = okValues({ currentStreams: "Display ads", monthlyRevenue: 2000 });
    const note = v.strategyNote as string;
    assert.ok(note.includes("highly concentrated"), "should name concentration level");
    assert.ok(note.includes("Display ads"), "should name the current stream");
    assert.ok(note.includes("$200–$600/month"), "10–30% of $2,000");
    assert.ok(note.includes("estimate built from your own"), "band labeled as estimate from user figure");
    assert.ok(note.includes("$2,000/month"), "user figure echoed");
  });

  it("omits dollar math when revenue is not provided", () => {
    const v = okValues({ currentStreams: "Display ads" });
    assert.ok(!(v.strategyNote as string).includes("$"), "no dollar figures without revenue input");
    const t = v.diversificationPlan as Table;
    assert.strictEqual(t.rows.length, PLAN_ROWS);
  });

  it("accepts an array of current streams and excludes them all", () => {
    const v = okValues({ currentStreams: ["Display ads", "Affiliate marketing"] });
    const t = v.diversificationPlan as Table;
    const labels = t.rows.map((r) => r[0]);
    assert.ok(!labels.includes("Display ads") && !labels.includes("Affiliate marketing"));
    // votes: digital-products:2, sponsored-posts:0, memberships:0, services:0.
    assert.strictEqual(t.rows[0][0], "Digital products");
    assert.ok((v.strategyNote as string).includes("moderately concentrated"));
  });

  it("starter selection yields the fixed starter order with a zero-stream note", () => {
    const v = okValues({ currentStreams: "Just starting (no streams yet)" });
    const t = v.diversificationPlan as Table;
    assert.deepStrictEqual(
      t.rows.map((r) => r[0]),
      ["Display ads", "Affiliate marketing", "Sponsored posts", "Digital products"],
    );
    assert.ok((v.strategyNote as string).includes("starting from zero"));
  });

  it("full portfolio returns an empty plan with a deepen-not-add note", () => {
    const v = okValues({
      currentStreams: [
        "Display ads",
        "Affiliate marketing",
        "Sponsored posts",
        "Digital products",
        "Memberships / subscriptions",
        "Services / freelancing",
        "Newsletter sponsorships",
      ],
    });
    const t = v.diversificationPlan as Table;
    assert.strictEqual(t.rows.length, 0);
    assert.ok((v.strategyNote as string).includes("focus on growing what you have"));
  });

  it("dedupes repeated selections", () => {
    const v = okValues({ currentStreams: ["Display ads", "Display ads"] });
    const t = v.diversificationPlan as Table;
    assert.strictEqual(t.rows[0][0], "Affiliate marketing");
  });

  it("treats monthlyRevenue of 0 as valid", () => {
    const v = okValues({ currentStreams: "Sponsored posts", monthlyRevenue: 0 });
    const t = v.diversificationPlan as Table;
    assert.strictEqual(t.rows.length, PLAN_ROWS);
  });
});

describe("diversification planner — validation errors", () => {
  it("rejects missing currentStreams", () => {
    assert.ok(errOf({}).includes("at least one current income stream"));
  });

  it("rejects an empty array", () => {
    assert.ok(errOf({ currentStreams: [] }).includes("at least one current income stream"));
  });

  it("rejects an unknown stream name", () => {
    const e = errOf({ currentStreams: "Print-on-demand mugs" });
    assert.ok(e.includes("not a recognized income stream"));
    assert.ok(e.includes("Print-on-demand mugs"));
  });

  it("rejects just-starting combined with real streams", () => {
    assert.ok(
      errOf({ currentStreams: ["Just starting (no streams yet)", "Display ads"] }).includes("select it alone"),
    );
  });

  it("rejects negative revenue", () => {
    assert.ok(errOf({ currentStreams: "Display ads", monthlyRevenue: -50 }).includes("cannot be negative"));
  });

  it("rejects NaN and non-numeric revenue", () => {
    assert.ok(errOf({ currentStreams: "Display ads", monthlyRevenue: NaN }).includes("finite number"));
    assert.ok(errOf({ currentStreams: "Display ads", monthlyRevenue: "lots" }).includes("finite number"));
  });

  it("rejects a non-object input", () => {
    assert.ok(errOf(null).includes("object"));
  });

  it("accepts catalog ids as well as labels", () => {
    const n = normalizeStreams("display-ads");
    assert.deepStrictEqual(n, { ok: true, ids: ["display-ads"] });
  });
});

describe("diversification planner — honesty and determinism", () => {
  it("runs twice with identical output (deterministic)", () => {
    const input = { currentStreams: ["Display ads", "Digital products"], monthlyRevenue: 3500 };
    assert.deepStrictEqual(runTool(input), runTool(input));
  });

  it("output ids match meta.ts outputs", () => {
    const v = okValues({ currentStreams: "Services / freelancing", monthlyRevenue: 800 });
    assert.deepStrictEqual(
      Object.keys(v).sort(),
      outputs.map((o) => o.id).sort(),
    );
  });

  it("income potential is qualitative — no dollar figures in the plan rows", () => {
    const v = okValues({ currentStreams: "Newsletter sponsorships", monthlyRevenue: 5000 });
    const t = v.diversificationPlan as Table;
    for (const row of t.rows) {
      assert.ok(row[3].includes("(estimate)"), "potential labeled as estimate");
      assert.ok(!row[3].includes("$"), "no invented dollar payouts");
      assert.ok(["Low", "Medium", "High"].includes(row[2]), "effort from the fixed 3-level band");
    }
  });

  it("word banks have their documented sizes", () => {
    assert.strictEqual(STREAM_CATALOG.length, 8, "8 catalog entries");
    assert.strictEqual(Object.keys(COMPLEMENT_RULES).length, 8, "8 complement rule entries");
    for (const [id, recs] of Object.entries(COMPLEMENT_RULES)) {
      assert.ok(recs.length >= 2 && recs.length <= 4, `rule ${id} has 2-4 recommendations`);
      for (const rec of recs) {
        assert.ok(
          STREAM_CATALOG.some((s) => s.id === rec && s.id !== "just-starting"),
          `rule ${id} recommends a real stream (${rec})`,
        );
      }
    }
    assert.strictEqual(TIMING_BY_RANK.length, PLAN_ROWS, "one timing label per plan row");
  });
});
