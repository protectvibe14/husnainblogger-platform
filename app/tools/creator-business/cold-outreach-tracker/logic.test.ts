import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  sanitize,
  parseDateStrict,
  matchStatus,
  resolveToday,
  daysBetween,
  csvEscape,
  pct,
  buildPipelineView,
  buildFollowUpDueList,
  buildConversionStats,
  buildCSV,
  STATUSES,
  STATUS_LABELS,
  MAX_PROSPECTS,
  type Prospect,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const TODAY = "2026-10-01";

function prospect(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: "Sarah Chen",
    company: "Acme Studio",
    contact: "sarah@acme.co",
    status: "contacted",
    dateContacted: "2026-09-28",
    followUpDate: "2026-10-01",
    notes: "Sent intro email",
    ...over,
  };
}

describe("happy path", () => {
  it("computes all four outputs for a mixed pipeline", () => {
    const res = runTool({
      today: TODAY,
      items: [
        prospect(),
        prospect({ name: "Omar K", status: "new", followUpDate: "" }),
        prospect({ name: "Lena P", status: "replied", followUpDate: "2026-09-29" }),
        prospect({ name: "Dan W", status: "won", followUpDate: "2026-09-01" }),
      ],
    });
    assert.equal(res.ok, true);
    assert.ok(res.values);
    assert.deepEqual(res.values.pipelineView, [
      "New: 1",
      "Contacted: 1",
      "Replied: 1",
      "Meeting booked: 0",
      "Won: 1",
      "Lost: 0",
      "Total prospects: 4",
    ]);
    assert.deepEqual(res.values.followUpDueList, [
      "Lena P — Acme Studio — follow up 2026-09-29 (2 days overdue)",
      "Sarah Chen — Acme Studio — follow up 2026-10-01 (due today)",
    ]);
    assert.deepEqual(res.values.conversionStats, [
      "Total prospects entered: 4",
      "Contacted: 3 of 4 (75%)",
      "Replies: 2 (reply rate 66.7% of contacted)",
      "Meetings booked: 1",
      "Won: 1 (win rate 25% of total)",
      "Lost: 0",
    ]);
    const lines = res.values.exportableCSV.split("\n");
    assert.equal(lines[0], "name,company,contact,status,date_contacted,follow_up_date,notes");
    assert.equal(lines.length, 5);
    assert.ok(lines[1].startsWith("Sarah Chen,Acme Studio,sarah@acme.co,contacted,2026-09-28,2026-10-01,Sent intro email"));
  });

  it("excludes won/lost prospects from the follow-up due list", () => {
    const res = runTool({
      today: TODAY,
      items: [
        prospect({ name: "Closed Won", status: "won", followUpDate: "2026-09-01" }),
        prospect({ name: "Closed Lost", status: "lost", followUpDate: "2026-09-01" }),
      ],
    });
    assert.equal(res.ok, true);
    assert.deepEqual(res.values?.followUpDueList, []);
  });

  it("returns an empty due list when nothing is due", () => {
    const res = runTool({ today: TODAY, items: [prospect({ followUpDate: "2026-10-05" })] });
    assert.equal(res.ok, true);
    assert.deepEqual(res.values?.followUpDueList, []);
  });

  it("accepts status case-insensitively and canonicalizes it", () => {
    const res = runTool({ today: TODAY, items: [prospect({ status: "Replied" })] });
    assert.equal(res.ok, true);
    assert.ok(res.values?.pipelineView.includes("Replied: 1"));
    assert.ok(res.values?.exportableCSV.includes(",replied,"));
  });

  it("accepts minimal records (only name + status)", () => {
    const res = runTool({ today: TODAY, items: [{ name: "X", status: "new" }] });
    assert.equal(res.ok, true);
    assert.ok(res.values?.pipelineView.includes("New: 1"));
  });
});

describe("validation errors", () => {
  it("errors when items is not an array", () => {
    assert.deepEqual(runTool({ items: "nope" as never }), { ok: false, error: "No items were provided." });
  });

  it("errors when items is empty", () => {
    assert.deepEqual(runTool({ items: [] }), { ok: false, error: "Add at least one prospect to track." });
  });

  it("errors when the prospect name is missing", () => {
    const res = runTool({ today: TODAY, items: [prospect({ name: "   " })] });
    assert.equal(res.ok, false);
    assert.equal(res.error, "Item 1: prospect name is required.");
  });

  it("errors when the status is not in the fixed set", () => {
    const res = runTool({ today: TODAY, items: [prospect({ status: "maybe" })] });
    assert.equal(res.ok, false);
    assert.equal(
      res.error,
      "Item 1: status \"maybe\" is not valid. Use one of: new, contacted, replied, meeting, won, lost.",
    );
  });

  it("errors when date contacted is not YYYY-MM-DD", () => {
    const res = runTool({ today: TODAY, items: [prospect({ dateContacted: "10/01/2026" })] });
    assert.equal(res.ok, false);
    assert.equal(res.error, 'Item 1: date contacted "10/01/2026" is not a valid date (use YYYY-MM-DD).');
  });

  it("errors when follow-up date is an impossible calendar date", () => {
    const res = runTool({ today: TODAY, items: [prospect({ followUpDate: "2026-02-30" })] });
    assert.equal(res.ok, false);
    assert.equal(res.error, 'Item 1: follow-up date "2026-02-30" is not a valid date (use YYYY-MM-DD).');
  });

  it("errors when an item is not an object", () => {
    const res = runTool({ today: TODAY, items: [null as never] });
    assert.equal(res.ok, false);
    assert.equal(res.error, "Item 1: not an object.");
  });

  it("errors when too many prospects are given", () => {
    const items = Array.from({ length: MAX_PROSPECTS + 1 }, (_, i) => prospect({ name: `P${i}` }));
    const res = runTool({ today: TODAY, items });
    assert.equal(res.ok, false);
    assert.equal(res.error, `Too many prospects (max ${MAX_PROSPECTS}).`);
  });

  it("errors on an invalid today override", () => {
    const res = runTool({ today: "yesterday", items: [prospect()] });
    assert.equal(res.ok, false);
    assert.equal(res.error, 'Today override "yesterday" is not a valid date (use YYYY-MM-DD).');
  });
});

describe("edge cases", () => {
  it("sorts the due list by follow-up date, then name", () => {
    const res = runTool({
      today: TODAY,
      items: [
        prospect({ name: "Zed", followUpDate: "2026-09-30" }),
        prospect({ name: "Amy", followUpDate: "2026-09-30" }),
        prospect({ name: "Bob", followUpDate: "2026-09-28" }),
      ],
    });
    assert.deepEqual(res.values?.followUpDueList, [
      "Bob — Acme Studio — follow up 2026-09-28 (3 days overdue)",
      "Amy — Acme Studio — follow up 2026-09-30 (1 day overdue)",
      "Zed — Acme Studio — follow up 2026-09-30 (1 day overdue)",
    ]);
  });

  it("future follow-up dates are not listed as due", () => {
    const res = runTool({ today: TODAY, items: [prospect({ followUpDate: "2026-10-02" })] });
    assert.deepEqual(res.values?.followUpDueList, []);
  });

  it("accepts leap-day dates and rejects non-leap Feb 29", () => {
    assert.equal(parseDateStrict("2024-02-29"), "2024-02-29");
    assert.equal(parseDateStrict("2026-02-29"), null);
    assert.equal(parseDateStrict("2026-13-01"), null);
    assert.equal(parseDateStrict("2026-00-10"), null);
  });

  it("escapes CSV fields per RFC 4180", () => {
    const res = runTool({
      today: TODAY,
      items: [prospect({ name: 'Quinn "Q" O\'Neil', notes: "met at conf, wants a call" })],
    });
    const row = res.values?.exportableCSV.split("\n")[1] ?? "";
    assert.ok(row.includes('"Quinn ""Q"" O\'Neil"'));
    assert.ok(row.includes('"met at conf, wants a call"'));
    assert.ok(!row.includes("\n"));
  });

  it("reports n/a percentages on an empty-contacted base", () => {
    const res = runTool({ today: TODAY, items: [{ name: "X", status: "new" }] });
    assert.ok(res.values?.conversionStats.includes("Replies: 0 (reply rate n/a of contacted)"));
  });

  it("is deterministic: identical inputs give identical outputs", () => {
    const args = { today: TODAY, items: [prospect(), prospect({ name: "B", status: "lost" })] };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("helpers behave: sanitize caps length, daysBetween counts days, pct formats", () => {
    assert.equal(sanitize("  a   b  ", 3), "a b");
    assert.equal(sanitize(123, 10), "");
    assert.equal(daysBetween("2026-09-28", "2026-10-01"), 3);
    assert.equal(pct(1, 3), "33.3%");
    assert.equal(pct(1, 2), "50%");
    assert.equal(pct(0, 0), "n/a");
    assert.equal(csvEscape("plain"), "plain");
    assert.equal(matchStatus("WON"), "won");
    assert.equal(matchStatus("zzz"), null);
    assert.equal(resolveToday("2026-01-15").date, "2026-01-15");
    assert.match(resolveToday(undefined).date ?? "", /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(STATUSES.length, 6);
    assert.deepEqual(Object.keys(STATUS_LABELS).sort(), [...STATUSES].sort());
  });

  it("output ids match meta.ts outputs", () => {
    assert.deepEqual(
      outputs.map((o) => o.id).sort(),
      ["conversionStats", "exportableCSV", "followUpDueList", "pipelineView"].sort(),
    );
  });

  it("pure helper functions: pipeline view and stats on raw prospects", () => {
    const list: Prospect[] = [
      { name: "a", company: "", contact: "", status: "new", dateContacted: "", followUpDate: "", notes: "" },
      { name: "b", company: "", contact: "", status: "meeting", dateContacted: "", followUpDate: "", notes: "" },
    ];
    assert.ok(buildPipelineView(list).includes("Meeting booked: 1"));
    assert.deepEqual(buildFollowUpDueList(list, TODAY), []);
    assert.ok(buildConversionStats(list)[3] === "Meetings booked: 1");
    assert.equal(buildCSV(list).split("\n").length, 3);
  });
});
