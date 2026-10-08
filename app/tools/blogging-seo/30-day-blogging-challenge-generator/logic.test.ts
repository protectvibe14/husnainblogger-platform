/**
 * Tests for the 30-Day Blogging Challenge Generator pure logic (tool-035).
 *
 * Run: node --test app/tools/blogging-seo/30-day-blogging-challenge-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildChallenge,
  parseDate,
  formatDate,
  todayUtc,
  CHALLENGE_BANK,
  CHALLENGE_BANK_SIZE,
  CHALLENGE_DAYS,
} from "./logic.ts";

const INPUT = { niche: "home baking", startDate: "2026-10-01" };

describe("runTool — happy path", () => {
  it("builds a 30-day challenge", () => {
    const res = runTool(INPUT);
    assert.equal(res.ok, true);
    assert.ok(res.values);
    const challenge = res.values.challenge as unknown[];
    assert.equal(challenge.length, 30);
    assert.equal(typeof res.values.checklistMarkdown, "string");
  });

  it("day 1 starts on the start date and day 30 ends 29 days later", () => {
    const res = runTool(INPUT);
    const challenge = res.values!.challenge as { day: number; date: string }[];
    assert.equal(challenge[0].day, 1);
    assert.equal(challenge[0].date, "2026-10-01");
    assert.equal(challenge[29].day, 30);
    assert.equal(challenge[29].date, "2026-10-30");
  });

  it("fills the niche into task text", () => {
    const res = runTool(INPUT);
    const challenge = res.values!.challenge as { task: string }[];
    const withNiche = challenge.filter((d) => d.task.includes("{niche}"));
    assert.equal(withNiche.length, 0);
    assert.ok(challenge.some((d) => d.task.includes("home baking")));
  });

  it("every day has a focus label and a day name", () => {
    const res = runTool(INPUT);
    const challenge = res.values!.challenge as { focus: string; dayName: string }[];
    for (const d of challenge) {
      assert.ok(d.focus.length > 0);
      assert.ok(d.dayName.length > 0);
    }
  });

  it("checklist markdown has 30 checkboxes", () => {
    const res = runTool(INPUT);
    const md = res.values!.checklistMarkdown as string;
    const boxes = md.split("\n").filter((l) => l.startsWith("- [ ]"));
    assert.equal(boxes.length, 30);
    assert.ok(boxes[0].includes("Day 1 (2026-10-01, Thursday)"));
  });

  it("checklist labels the prompts as a fixed bank, not AI", () => {
    const res = runTool(INPUT);
    assert.ok((res.values!.checklistMarkdown as string).includes("not AI-generated"));
  });
});

describe("runTool — validation", () => {
  it("rejects a missing niche", () => {
    assert.equal(runTool({ startDate: "2026-10-01" }).ok, false);
  });

  it("rejects a blank niche", () => {
    assert.equal(runTool({ niche: "  ", startDate: "2026-10-01" }).ok, false);
  });

  it("rejects a one-character niche", () => {
    assert.equal(runTool({ niche: "x" }).ok, false);
  });

  it("rejects an over-long niche", () => {
    assert.equal(runTool({ niche: "n".repeat(81), startDate: "2026-10-01" }).ok, false);
  });

  it("rejects a malformed start date", () => {
    assert.equal(runTool({ niche: "home baking", startDate: "Oct 1 2026" }).ok, false);
  });

  it("rejects an impossible start date", () => {
    const res = runTool({ niche: "home baking", startDate: "2026-02-30" });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a blank start date string", () => {
    assert.equal(runTool({ niche: "home baking", startDate: "   " }).ok, false);
  });
});

describe("startDate default", () => {
  it("defaults to today (UTC) when startDate is omitted", () => {
    const res = runTool({ niche: "home baking" });
    assert.equal(res.ok, true);
    const challenge = res.values!.challenge as { date: string }[];
    assert.equal(challenge[0].date, todayUtc());
  });

  it("todayUtc returns a valid YYYY-MM-DD string", () => {
    assert.match(todayUtc(), /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(parseDate(todayUtc()) > 0);
  });
});

describe("date helpers", () => {
  it("parseDate accepts leap day, formatDate round-trips", () => {
    assert.equal(formatDate(parseDate("2024-02-29")), "2024-02-29");
  });

  it("parseDate rejects non-leap Feb 29", () => {
    assert.throws(() => parseDate("2023-02-29"), RangeError);
  });
});

describe("bank honesty, determinism and edge cases", () => {
  it("bank has exactly one prompt per challenge day", () => {
    assert.equal(CHALLENGE_BANK_SIZE, 30);
    assert.equal(CHALLENGE_BANK.length, CHALLENGE_BANK_SIZE);
    assert.equal(CHALLENGE_DAYS, 30);
  });

  it("day N always uses bank entry N (fixed order)", () => {
    const { challenge } = buildChallenge("home baking", "2026-10-01");
    assert.ok(challenge[0].task.startsWith("Set up (or refresh) your blog"));
    assert.ok(challenge[29].task.startsWith("Publish a celebration post"));
  });

  it("handles a unicode niche", () => {
    const res = runTool({ niche: "café culture 日本語", startDate: "2026-10-01" });
    assert.equal(res.ok, true);
    assert.ok((res.values!.checklistMarkdown as string).includes("café culture 日本語"));
  });

  it("is deterministic with an explicit start date", () => {
    const a = runTool(INPUT);
    const b = runTool(INPUT);
    assert.deepEqual(a, b);
  });

  it("output ids match the spec: challenge + checklistMarkdown", () => {
    const res = runTool(INPUT);
    assert.deepEqual(Object.keys(res.values!).sort(), ["challenge", "checklistMarkdown"]);
  });
});
