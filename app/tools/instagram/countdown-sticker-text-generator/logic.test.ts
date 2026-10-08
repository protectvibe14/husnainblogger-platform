import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateCountdown,
  parseDateISO,
  daysBetween,
  phaseFor,
  BANK_SIZES,
  PHASE_LABELS,
  ASSUMPTIONS,
} from "./logic.ts";

describe("countdown-sticker-text-generator", () => {
  it("pre phase: future date gives 6 'before' texts with day counts", () => {
    const r = generateCountdown("Course Launch", "2026-12-01", "2026-11-20");
    assert.ok(r);
    assert.equal(r.phase, "pre");
    assert.equal(r.daysLeft, 11);
    assert.equal(r.texts.length, 6);
    for (const t of r.texts) {
      assert.equal(t.phase, "pre");
      assert.ok(t.text.includes("Course Launch"));
      assert.ok(t.text.includes("11 days"), t.text);
      assert.ok(!t.text.includes("{event}"));
      assert.ok(!t.text.includes("{days}"));
    }
  });

  it("singular '1 day' wording the day before the event", () => {
    const r = generateCountdown("Sale", "2026-11-21", "2026-11-20");
    assert.ok(r);
    assert.equal(r.daysLeft, 1);
    assert.ok(r.texts.some((t) => t.text.includes("1 day")));
    assert.ok(!r.texts.some((t) => t.text.includes("1 days")));
  });

  it("during phase: event date == today gives 3 'now' texts", () => {
    const r = generateCountdown("Webinar", "2026-11-20", "2026-11-20");
    assert.ok(r);
    assert.equal(r.phase, "during");
    assert.equal(r.daysLeft, 0);
    assert.equal(r.texts.length, 3);
    for (const t of r.texts) assert.equal(t.phase, "during");
  });

  it("post phase: past date gives 3 'after' texts", () => {
    const r = generateCountdown("Meetup", "2026-11-10", "2026-11-20");
    assert.ok(r);
    assert.equal(r.phase, "post");
    assert.equal(r.daysLeft, -10);
    assert.equal(r.texts.length, 3);
  });

  it("runTool happy path returns texts table + copyAll + daysLeft + phase", () => {
    const r = runTool({ event: "Summer Sale", date: "2026-12-25" });
    assert.equal(r.ok, true);
    assert.ok(r.values);
    const table = r.values["texts"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["Phase", "Countdown text"]);
    assert.ok(table.rows.length >= 3);
    assert.ok(typeof r.values["daysLeft"] === "number");
    assert.ok(typeof r.values["phase"] === "string");
    assert.ok(typeof r.values["copyAll"] === "string");
  });

  it("runTool phase label matches the computed phase", () => {
    const future = runTool({ event: "X", date: "2099-01-01" });
    assert.equal(future.values!["phase"], PHASE_LABELS.pre);
    const past = runTool({ event: "X", date: "2000-01-01" });
    assert.equal(past.values!["phase"], PHASE_LABELS.post);
  });

  it("errors on missing event", () => {
    const r = runTool({ date: "2026-12-01" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("event"));
  });

  it("errors on empty event", () => {
    const r = runTool({ event: "   ", date: "2026-12-01" });
    assert.equal(r.ok, false);
  });

  it("errors on missing date", () => {
    const r = runTool({ event: "Launch" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("date"));
  });

  it("errors on malformed date", () => {
    for (const bad of ["20-12-01", "2026/12/01", "December 1", "2026-13-01"]) {
      const r = runTool({ event: "Launch", date: bad });
      assert.equal(r.ok, false, bad);
      assert.ok(r.error!.includes("YYYY-MM-DD"), bad);
    }
  });

  it("errors on impossible date like 2026-02-30", () => {
    const r = runTool({ event: "Launch", date: "2026-02-30" });
    assert.equal(r.ok, false);
  });

  it("parseDateISO accepts valid dates and rejects bad ones", () => {
    assert.ok(parseDateISO("2026-11-19") !== null);
    assert.equal(parseDateISO("2026-02-30"), null);
    assert.equal(parseDateISO("not-a-date"), null);
    assert.equal(parseDateISO("2026-13-01"), null);
  });

  it("daysBetween is timezone-stable and signed", () => {
    assert.equal(daysBetween("2026-11-20", "2026-11-20"), 0);
    assert.equal(daysBetween("2026-11-25", "2026-11-20"), 5);
    assert.equal(daysBetween("2026-11-15", "2026-11-20"), -5);
    assert.equal(daysBetween("bad", "2026-11-20"), null);
  });

  it("phaseFor maps sign to phase", () => {
    assert.equal(phaseFor(3), "pre");
    assert.equal(phaseFor(0), "during");
    assert.equal(phaseFor(-2), "post");
  });

  it("event name with unicode is inserted verbatim", () => {
    const r = generateCountdown("Café ☕ Night", "2026-12-01", "2026-11-20");
    assert.ok(r);
    assert.ok(r.texts.every((t) => t.text.includes("Café ☕ Night")));
  });

  it("generateCountdown returns null for empty event or bad date", () => {
    assert.equal(generateCountdown("  ", "2026-12-01", "2026-11-20"), null);
    assert.equal(generateCountdown("X", "nope", "2026-11-20"), null);
  });

  it("deterministic: same explicit today gives identical output", () => {
    const a = generateCountdown("Launch", "2026-12-01", "2026-11-20");
    const b = generateCountdown("Launch", "2026-12-01", "2026-11-20");
    assert.deepEqual(a, b);
  });

  it("runTool is deterministic within one day (two runs match)", () => {
    const a = runTool({ event: "Launch", date: "2026-12-01" });
    const b = runTool({ event: "Launch", date: "2026-12-01" });
    assert.deepEqual(a, b);
  });

  it("bank sizes documented and consistent", () => {
    assert.equal(BANK_SIZES.preTemplates, 6);
    assert.equal(BANK_SIZES.duringTemplates, 3);
    assert.equal(BANK_SIZES.postTemplates, 3);
    assert.equal(BANK_SIZES.total, 12);
  });

  it("assumptions mention template-based generation and UTC-day caveat", () => {
    assert.ok(ASSUMPTIONS.length >= 1);
    assert.ok(ASSUMPTIONS.some((a) => a.toLowerCase().includes("not ai")));
    assert.ok(ASSUMPTIONS.some((a) => a.includes("UTC")));
  });

  it("copyAll contains every countdown text", () => {
    const r = generateCountdown("Party", "2026-12-31", "2026-12-01");
    assert.ok(r);
    const viaTool = runTool({ event: "Party", date: "2026-12-31" });
    // runTool uses real today; just check its own copyAll covers its table
    const table = viaTool.values!["texts"] as { rows: string[][] };
    const copy = viaTool.values!["copyAll"] as string;
    for (const row of table.rows) assert.ok(copy.includes(row[1]));
  });

  it("output ids are the contract ids: texts, copyAll, daysLeft, phase", () => {
    const r = runTool({ event: "X", date: "2026-12-01" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["copyAll", "daysLeft", "phase", "texts"]);
  });
});
