import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  SECTION_PRESETS,
  GENERIC_TARGET,
  GENERIC_SLOT,
  FREQUENCY_ISSUES,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const base = {
  newsletterName: "The Freelance Brief",
  sections: "Welcome intro\nMain feature\nQuick tips\nCurated links\nClosing PS",
  frequency: "weekly",
};

describe("newsletter-issue-planner", () => {
  it("happy path: known sections get their fixed word targets", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    const tpl = r.values!.issueTemplate as { columns: string[]; rows: string[][] };
    assert.deepEqual(tpl.columns, ["Section", "Slot purpose", "Target words"]);
    assert.equal(tpl.rows.length, 5);
    const byName: Record<string, string> = {};
    for (const row of tpl.rows) byName[row[0]] = row[2];
    assert.equal(byName["Welcome intro"], "100 words");
    assert.equal(byName["Main feature"], "400 words");
    assert.equal(byName["Quick tips"], "150 words");
    assert.equal(byName["Curated links"], "200 words");
    assert.equal(byName["Closing PS"], "50 words");
  });

  it("happy path: summary carries totals (900 words, 52 issues/year)", () => {
    const r = runTool({ ...base });
    const summary = r.values!.summary as string;
    assert.match(summary, /The Freelance Brief/);
    assert.match(summary, /5 sections/);
    assert.match(summary, /900 words per issue/);
    assert.match(summary, /52 issues\/year/);
    assert.match(summary, /weekly/);
  });

  it("edge case: duplicate sections deduped case-insensitively", () => {
    const r = runTool({ ...base, sections: "Quick tips\nquick TIPS\nQuick tips" });
    assert.equal(r.ok, true);
    const tpl = r.values!.issueTemplate as { rows: string[][] };
    assert.equal(tpl.rows.length, 1);
  });

  it("edge case: unknown section gets the generic target and slot", () => {
    const r = runTool({ ...base, sections: "Reader spotlight" });
    assert.equal(r.ok, true);
    const tpl = r.values!.issueTemplate as { rows: string[][] };
    assert.equal(tpl.rows[0][2], `${GENERIC_TARGET} words`);
    assert.equal(tpl.rows[0][1], GENERIC_SLOT);
  });

  it("edge case: blank lines ignored", () => {
    const r = runTool({ ...base, sections: "\n\nQuick tips\n\n" });
    assert.equal(r.ok, true);
    assert.equal((r.values!.issueTemplate as { rows: string[][] }).rows.length, 1);
  });

  it("frequency biweekly: 26 issues/year", () => {
    const r = runTool({ ...base, frequency: "biweekly" });
    assert.equal(r.ok, true);
    assert.match(r.values!.summary as string, /26 issues\/year/);
  });

  it("frequency monthly: 12 issues/year", () => {
    const r = runTool({ ...base, frequency: "monthly" });
    assert.equal(r.ok, true);
    assert.match(r.values!.summary as string, /12 issues\/year/);
  });

  it("frequency case-insensitive ('Weekly'): accepted", () => {
    const r = runTool({ ...base, frequency: "Weekly" });
    assert.equal(r.ok, true);
    assert.match(r.values!.summary as string, /52 issues\/year/);
  });

  it("invalid frequency: rejected", () => {
    const r = runTool({ ...base, frequency: "daily" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /weekly, biweekly, or monthly/);
  });

  it("missing frequency: rejected", () => {
    const r = runTool({ newsletterName: "N", sections: "Tips" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Frequency/);
  });

  it("missing newsletterName: rejected", () => {
    const r = runTool({ sections: "Tips", frequency: "weekly" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /newsletter's name/);
  });

  it("empty sections: rejected", () => {
    const r = runTool({ newsletterName: "N", sections: "   \n  ", frequency: "weekly" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one section/);
  });

  it("single section: singular wording in summary", () => {
    const r = runTool({ newsletterName: "N", sections: "Tips", frequency: "monthly" });
    assert.equal(r.ok, true);
    assert.match(r.values!.summary as string, /1 section ·/);
  });

  it("determinism: same inputs produce identical output", () => {
    const a = runTool({ ...base });
    const b = runTool({ ...base });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs ids", () => {
    const r = runTool({ ...base });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), outputs.map((o) => o.id).sort());
  });

  it("fixed map documented: 6 named presets, first-match order", () => {
    assert.equal(SECTION_PRESETS.length, 6);
    assert.equal(FREQUENCY_ISSUES.weekly, 52);
    assert.equal(FREQUENCY_ISSUES.biweekly, 26);
    assert.equal(FREQUENCY_ISSUES.monthly, 12);
    assert.ok(SECTION_PRESETS.every((p) => p.words > 0 && p.keywords.length > 0 && p.slot.length > 0));
  });

  it("no content is invented: honesty line in summary", () => {
    const r = runTool({ ...base });
    assert.match(r.values!.summary as string, /no content is written for you/);
  });

  it("non-object input: rejected", () => {
    const r = runTool(undefined as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.match(r.error!, /object/);
  });
});
