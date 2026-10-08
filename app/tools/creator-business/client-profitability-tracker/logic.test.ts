import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, buildCsv, csvCell } from "./logic.ts";
import * as meta from "./meta.ts";

const TWO_CLIENTS = {
  items: [
    { name: "Acme Corp", revenue: 5000, hoursWorked: 40, hourlyCostRate: 60, directExpenses: 200 },
    { name: "Beta LLC", revenue: 3000, hoursWorked: 50, hourlyCostRate: 60, directExpenses: 100 },
  ],
};

describe("client-profitability-tracker", () => {
  it("computes profit and margin per client", () => {
    const r = runTool(TWO_CLIENTS);
    assert.equal(r.ok, true);
    const table = r.values!.profitPerClient as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Client", "Revenue", "Total cost", "Profit"]);
    // Acme: cost 40*60+200=2600, profit 2400, margin 48%
    // Beta: cost 50*60+100=3100, profit -100, margin -3.3%
    assert.equal(table.rows.length, 2);
    assert.deepEqual(table.rows[0], ["Acme Corp", "$5000.00", "$2600.00", "$2400.00"]);
    assert.deepEqual(table.rows[1], ["Beta LLC", "$3000.00", "$3100.00", "$-100.00"]);
  });

  it("ranks clients by profit descending", () => {
    const r = runTool(TWO_CLIENTS);
    assert.equal(r.ok, true);
    const ranking = r.values!.clientRanking as string[];
    assert.deepEqual(ranking, [
      "1. Acme Corp — $2400.00 profit",
      "2. Beta LLC — $-100.00 profit",
    ]);
  });

  it("reports margins with negative flagged, not hidden", () => {
    const r = runTool(TWO_CLIENTS);
    assert.equal(r.ok, true);
    const margins = r.values!.marginPctPerClient as string[];
    assert.deepEqual(margins, [
      "Acme Corp — 48% margin",
      "Beta LLC — -3.3% margin (losing money)",
    ]);
  });

  it("reports n/a margin when revenue is zero", () => {
    const r = runTool({
      items: [{ name: "Pro Bono", revenue: 0, hoursWorked: 10, hourlyCostRate: 50, directExpenses: 0 }],
    });
    assert.equal(r.ok, true);
    const margins = r.values!.marginPctPerClient as string[];
    assert.deepEqual(margins, ["Pro Bono — n/a margin (no revenue entered)"]);
    const csv = r.values!.exportableCSV as string;
    assert.match(csv, /,n\/a$/);
  });

  it("exports a valid CSV with header and rows", () => {
    const r = runTool(TWO_CLIENTS);
    assert.equal(r.ok, true);
    const csv = r.values!.exportableCSV as string;
    const lines = csv.split("\n");
    assert.equal(lines[0], "client_name,revenue,hours_worked,hourly_cost_rate,direct_expenses,total_cost,profit,margin_pct");
    assert.equal(lines.length, 3);
    assert.match(lines[1], /^Acme Corp,5000,40,60,200,2600,2400,48$/);
  });

  it("escapes CSV cells with commas and quotes", () => {
    assert.equal(csvCell('Acme, "Big" Corp'), '"Acme, ""Big"" Corp"');
    assert.equal(csvCell("Plain"), "Plain");
  });

  it("accepts numeric strings for money fields", () => {
    const r = runTool({
      items: [{ name: "X", revenue: "2500", hoursWorked: "20", hourlyCostRate: "30", directExpenses: "0" }],
    });
    assert.equal(r.ok, true);
    const table = (r.values!.profitPerClient as { rows: string[][] }).rows;
    assert.deepEqual(table[0], ["X", "$2500.00", "$600.00", "$1900.00"]);
  });

  it("rejects an empty item list", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one client/);
  });

  it("rejects an empty client name", () => {
    const r = runTool({
      items: [{ name: "   ", revenue: 100, hoursWorked: 1, hourlyCostRate: 10, directExpenses: 0 }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: client name is required/);
  });

  it("rejects duplicate client names (case-insensitive)", () => {
    const r = runTool({
      items: [
        { name: "Acme", revenue: 100, hoursWorked: 1, hourlyCostRate: 10, directExpenses: 0 },
        { name: "acme", revenue: 200, hoursWorked: 2, hourlyCostRate: 10, directExpenses: 0 },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2: client name must be unique/);
  });

  it("rejects NaN revenue", () => {
    const r = runTool({
      items: [{ name: "X", revenue: NaN, hoursWorked: 1, hourlyCostRate: 10, directExpenses: 0 }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: revenue/);
  });

  it("rejects Infinity hours", () => {
    const r = runTool({
      items: [{ name: "X", revenue: 100, hoursWorked: Infinity, hourlyCostRate: 10, directExpenses: 0 }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: hours worked/);
  });

  it("rejects empty direct expenses", () => {
    const r = runTool({
      items: [{ name: "X", revenue: 100, hoursWorked: 1, hourlyCostRate: 10, directExpenses: "" }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: direct expenses/);
  });

  it("rejects negative hourly cost rate", () => {
    const r = runTool({
      items: [{ name: "X", revenue: 100, hoursWorked: 1, hourlyCostRate: -5, directExpenses: 0 }],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: hourly cost rate/);
  });

  it("reports the failing item number", () => {
    const r = runTool({
      items: [
        { name: "OK", revenue: 100, hoursWorked: 1, hourlyCostRate: 10, directExpenses: 0 },
        { name: "Bad", revenue: "lots", hoursWorked: 1, hourlyCostRate: 10, directExpenses: 0 },
      ],
    });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2/);
  });

  it("keeps input order for equal profits (stable ranking)", () => {
    const r = runTool({
      items: [
        { name: "First", revenue: 100, hoursWorked: 1, hourlyCostRate: 10, directExpenses: 0 },
        { name: "Second", revenue: 100, hoursWorked: 1, hourlyCostRate: 10, directExpenses: 0 },
      ],
    });
    assert.equal(r.ok, true);
    const ranking = r.values!.clientRanking as string[];
    assert.ok(ranking[0].startsWith("1. First"));
    assert.ok(ranking[1].startsWith("2. Second"));
  });

  it("buildCsv handles a client name with a comma", () => {
    const csv = buildCsv([
      {
        name: "Acme, Inc",
        revenue: 100,
        totalCost: 40,
        profit: 60,
        marginPct: 60,
        hoursWorked: 1,
        hourlyCostRate: 40,
        directExpenses: 0,
      },
    ]);
    assert.match(csv, /"Acme, Inc",100,1,40,0,40,60,60/);
  });

  it("is deterministic: same inputs give identical outputs", () => {
    const a = runTool(TWO_CLIENTS);
    const b = runTool(TWO_CLIENTS);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(TWO_CLIENTS);
    assert.equal(r.ok, true);
    const expected = meta.outputs.map((o) => o.id).sort();
    const actual = Object.keys(r.values!).sort();
    assert.deepEqual(actual, expected);
  });
});
