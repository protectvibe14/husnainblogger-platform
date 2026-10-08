/**
 * Client Profitability Tracker — pure logic (zero imports, zero network, zero DOM).
 *
 * DOCUMENTED SPEC DEVIATION: this tool is classified tracker/storage-engine,
 * but the platform has no localStorage tracker mode (TrackerTemplate only
 * does checklist/library). It is implemented HONESTLY as the builder shape
 * instead: BuilderTemplate calls runTool({ items }), one item per client
 * record { name, revenue, hoursWorked, hourlyCostRate, directExpenses }.
 * Nothing is persisted — entries are session-based; the CSV export keeps
 * the data. The meta copy makes no persistence claims.
 *
 * Formula J-CLIENT-PROFIT (published in meta.ts content.methodology):
 *   totalCost = hoursWorked x hourlyCostRate + directExpenses
 *   profit    = revenue - totalCost
 *   marginPct = revenue > 0 ? profit / revenue x 100 : null  ("n/a")
 * Clients are ranked by profit descending. Negative margins are flagged,
 * never hidden. All money values rounded to 2 decimals; margins to 1.
 */

export interface ClientRecord {
  name: string;
  revenue: number;
  hoursWorked: number;
  hourlyCostRate: number;
  directExpenses: number;
}

export interface ClientProfit {
  name: string;
  revenue: number;
  totalCost: number;
  profit: number;
  marginPct: number | null;
}

/** Full per-client result row, including the source record fields. */
export interface ClientProfitRow extends ClientProfit {
  hoursWorked: number;
  hourlyCostRate: number;
  directExpenses: number;
}
export type ToolResult =
  | { ok: true; values: Record<string, unknown> }
  | { ok: false; error: string };

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function money(n: number): string {
  return "$" + round2(n).toFixed(2);
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Parse a numeric field that may arrive as a number or numeric string. */
function parseField(v: unknown): number | null {
  if (isFiniteNumber(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function marginLabel(p: ClientProfit): string {
  if (p.marginPct === null) return `${p.name} — n/a margin (no revenue entered)`;
  const base = `${p.name} — ${p.marginPct}% margin`;
  return p.marginPct < 0 ? `${base} (losing money)` : base;
}

/** Escape one CSV cell per RFC 4180. Exported for tests. */
export function csvCell(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Build the exportable CSV payload. Exported for tests.
 */
export function buildCsv(results: ClientProfitRow[]): string {
  const header = [
    "client_name",
    "revenue",
    "hours_worked",
    "hourly_cost_rate",
    "direct_expenses",
    "total_cost",
    "profit",
    "margin_pct",
  ];
  const lines = [header.join(",")];
  for (const p of results) {
    lines.push(
      [
        csvCell(p.name),
        csvCell(p.revenue),
        csvCell(p.hoursWorked),
        csvCell(p.hourlyCostRate),
        csvCell(p.directExpenses),
        csvCell(p.totalCost),
        csvCell(p.profit),
        csvCell(p.marginPct === null ? "n/a" : p.marginPct),
      ].join(","),
    );
  }
  return lines.join("\n");
}

/**
 * Tool logic slot (builder). BuilderTemplate calls runTool({ items }).
 * Returns values.profitPerClient (table), values.marginPctPerClient (list),
 * values.clientRanking (list), values.exportableCSV (download payload).
 */
export function runTool(args: { items: Record<string, unknown>[] }): ToolResult {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "Add at least one client to analyze profitability." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one client to analyze profitability." };
  }

  const records: (ClientRecord & { sortIndex: number })[] = [];
  const seenNames = new Set<string>();
  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i];
    const label = `Item ${i + 1}`;
    if (!item || typeof item !== "object") {
      return { ok: false, error: `${label}: not a valid entry.` };
    }
    const name = clean(item["name"]);
    if (name.length === 0) {
      return { ok: false, error: `${label}: client name is required.` };
    }
    const key = name.toLowerCase();
    if (seenNames.has(key)) {
      return { ok: false, error: `${label}: client name must be unique ("${name}" is already listed).` };
    }
    seenNames.add(key);

    const fields: Array<[string, string]> = [
      ["revenue", "revenue"],
      ["hoursWorked", "hours worked"],
      ["hourlyCostRate", "hourly cost rate"],
      ["directExpenses", "direct expenses"],
    ];
    const parsed: Record<string, number> = {};
    for (const [id, fieldLabel] of fields) {
      const n = parseField(item[id]);
      if (n === null || n < 0) {
        return {
          ok: false,
          error: `${label}: ${fieldLabel} must be a finite number, 0 or more.`,
        };
      }
      parsed[id] = n;
    }
    records.push({
      name,
      revenue: parsed["revenue"],
      hoursWorked: parsed["hoursWorked"],
      hourlyCostRate: parsed["hourlyCostRate"],
      directExpenses: parsed["directExpenses"],
      sortIndex: i,
    });
  }

  const results: (ClientProfitRow & { sortIndex: number })[] = records.map((r) => {
    const totalCost = round2(r.hoursWorked * r.hourlyCostRate + r.directExpenses);
    const profit = round2(r.revenue - totalCost);
    const marginPct = r.revenue > 0 ? round1((profit / r.revenue) * 100) : null;
    return { ...r, totalCost, profit, marginPct };
  });

  const ranked = [...results].sort((a, b) => b.profit - a.profit || a.sortIndex - b.sortIndex);

  const profitPerClient = {
    columns: ["Client", "Revenue", "Total cost", "Profit"],
    rows: ranked.map((p) => [p.name, money(p.revenue), money(p.totalCost), money(p.profit)]),
  };

  const marginPctPerClient: string[] = ranked.map((p) => marginLabel(p));

  const clientRanking: string[] = ranked.map(
    (p, i) => `${i + 1}. ${p.name} — ${money(p.profit)} profit`,
  );

  const exportableCSV = buildCsv(ranked);

  return {
    ok: true,
    values: { profitPerClient, marginPctPerClient, clientRanking, exportableCSV },
  };
}
