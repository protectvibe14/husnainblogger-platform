/**
 * Tests for the Editorial Calendar Generator pure logic (tool-034).
 *
 * Run: node --test app/tools/blogging-seo/editorial-calendar-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  buildCalendar,
  parseDate,
  formatDate,
  postingOffsets,
  POST_IDEA_BANK,
  POST_IDEA_BANK_SIZE,
  CONTENT_TYPES,
  CALENDAR_WEEKS,
} from "./logic.ts";

const INPUT = { niche: "home baking", postsPerWeek: 3, startDate: "2026-10-05" };

describe("runTool — happy path", () => {
  it("builds a 4-week calendar for 3 posts/week (12 posts)", () => {
    const res = runTool(INPUT);
    assert.equal(res.ok, true);
    assert.ok(res.values);
    const cal = res.values.calendar as unknown[];
    assert.equal(cal.length, 12);
    assert.equal(res.values.totalPosts, 12);
  });

  it("first post lands on the start date", () => {
    const res = runTool(INPUT);
    const cal = res.values!.calendar as { date: string }[];
    assert.equal(cal[0].date, "2026-10-05");
  });

  it("spreads posts evenly: 3/week -> offsets 0, 2, 4", () => {
    assert.deepEqual(postingOffsets(3), [0, 2, 4]);
    assert.deepEqual(postingOffsets(1), [0]);
    assert.deepEqual(postingOffsets(7), [0, 1, 2, 3, 4, 5, 6]);
  });

  it("fills the niche into post titles", () => {
    const res = runTool(INPUT);
    const cal = res.values!.calendar as { title: string }[];
    for (const e of cal) assert.ok(e.title.includes("home baking"), e.title);
  });

  it("marks every entry as planned", () => {
    const res = runTool(INPUT);
    const cal = res.values!.calendar as { status: string }[];
    for (const e of cal) assert.equal(e.status, "planned");
  });

  it("produces a CSV with header + one row per post", () => {
    const res = runTool(INPUT);
    const csv = res.values!.csv as string;
    const lines = csv.split("\n");
    assert.equal(lines[0], "Week,Date,Day,Post title,Content type,Status");
    assert.equal(lines.length, 13);
    assert.ok(lines[1].includes("2026-10-05"));
  });
});

describe("runTool — validation", () => {
  it("rejects a missing niche", () => {
    assert.equal(runTool({ postsPerWeek: 3, startDate: "2026-10-05" }).ok, false);
  });

  it("rejects a one-character niche", () => {
    assert.equal(runTool({ ...INPUT, niche: "x" }).ok, false);
  });

  it("rejects an over-long niche", () => {
    assert.equal(runTool({ ...INPUT, niche: "n".repeat(81) }).ok, false);
  });

  it("rejects postsPerWeek of 0", () => {
    assert.equal(runTool({ ...INPUT, postsPerWeek: 0 }).ok, false);
  });

  it("rejects postsPerWeek of 8", () => {
    const res = runTool({ ...INPUT, postsPerWeek: 8 });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a non-integer postsPerWeek", () => {
    assert.equal(runTool({ ...INPUT, postsPerWeek: 2.5 }).ok, false);
  });

  it("rejects a malformed date string", () => {
    assert.equal(runTool({ ...INPUT, startDate: "10/05/2026" }).ok, false);
  });

  it("rejects an impossible date", () => {
    const res = runTool({ ...INPUT, startDate: "2026-02-30" });
    assert.equal(res.ok, false);
    assert.ok(res.error);
  });

  it("rejects a missing start date", () => {
    assert.equal(runTool({ niche: "home baking", postsPerWeek: 3 }).ok, false);
  });
});

describe("date helpers", () => {
  it("parseDate accepts leap day", () => {
    assert.ok(parseDate("2024-02-29") > 0);
  });

  it("parseDate rejects non-leap Feb 29", () => {
    assert.throws(() => parseDate("2023-02-29"), RangeError);
  });

  it("formatDate round-trips a parsed date", () => {
    assert.equal(formatDate(parseDate("2026-12-31")), "2026-12-31");
  });

  it("day names are correct (2026-10-05 is a Monday)", () => {
    const res = runTool(INPUT);
    const cal = res.values!.calendar as { day: string }[];
    assert.equal(cal[0].day, "Monday");
  });
});

describe("bank honesty, determinism and edge cases", () => {
  it("documents the fixed bank size honestly", () => {
    assert.equal(POST_IDEA_BANK_SIZE, 28);
    assert.equal(POST_IDEA_BANK.length, POST_IDEA_BANK_SIZE);
    assert.equal(CONTENT_TYPES.length, 7);
    assert.equal(CALENDAR_WEEKS, 4);
  });

  it("cycles content types in fixed order", () => {
    const res = runTool({ ...INPUT, postsPerWeek: 7 });
    const cal = res.values!.calendar as { contentType: string }[];
    assert.equal(cal[0].contentType, "how-to");
    assert.equal(cal[6].contentType, "roundup");
    assert.equal(cal[7].contentType, "how-to"); // cycles
  });

  it("daily posting (7/week) covers 28 posts", () => {
    const res = runTool({ ...INPUT, postsPerWeek: 7 });
    assert.equal(res.values!.totalPosts, 28);
  });

  it("handles a unicode niche", () => {
    const res = runTool({ ...INPUT, niche: "café culture 日本語" });
    assert.equal(res.ok, true);
    const cal = res.values!.calendar as { title: string }[];
    assert.ok(cal[0].title.includes("café culture 日本語"));
  });

  it("is deterministic: same input twice gives identical output", () => {
    const a = runTool(INPUT);
    const b = runTool(INPUT);
    assert.deepEqual(a, b);
  });

  it("output ids match the spec: calendar + csv + totalPosts", () => {
    const res = runTool(INPUT);
    assert.deepEqual(Object.keys(res.values!).sort(), ["calendar", "csv", "totalPosts"]);
  });

  it("weeks increment correctly across the 4-week span", () => {
    const res = runTool(INPUT);
    const cal = res.values!.calendar as { week: number; date: string }[];
    assert.equal(cal[0].week, 1);
    assert.equal(cal[3].week, 2);
    assert.equal(cal[3].date, "2026-10-12");
    assert.equal(cal[11].week, 4);
  });
});
