import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, PLAN_GOALS, GOAL_LABELS, BANK_SIZES, TIMING_GUIDANCE, ASSUMPTIONS } from "./logic.ts";

const GOOD = { goal: "sell", storyCount: 5 };

describe("story-sequence-planner", () => {
  it("happy path: plan table + timingSuggestion + copyAll", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.ok(r.values);
    const table = r.values["plan"] as { columns: string[]; rows: string[][] };
    assert.deepEqual(table.columns, ["#", "Format", "Draft text", "Post timing"]);
    assert.equal(table.rows.length, 5);
    assert.equal(r.values["timingSuggestion"], TIMING_GUIDANCE);
    assert.ok(typeof r.values["copyAll"] === "string");
  });

  it("defaults to 5 stories when storyCount is omitted", () => {
    const r = runTool({ goal: "launch" });
    assert.equal(r.ok, true);
    const table = r.values!["plan"] as { rows: string[][] };
    assert.equal(table.rows.length, 5);
  });

  it("all five goals produce valid plans", () => {
    for (const goal of PLAN_GOALS) {
      const r = runTool({ goal, storyCount: 4 });
      assert.equal(r.ok, true, `goal ${goal}`);
      const table = r.values!["plan"] as { rows: string[][] };
      assert.equal(table.rows.length, 4, `goal ${goal}`);
      for (const row of table.rows) {
        assert.ok(row[1].length > 0 && row[2].length > 0 && row[3].length > 0);
      }
    }
  });

  it("positions are 1-based and sequential", () => {
    const r = runTool({ goal: "educate", storyCount: 7 });
    const table = r.values!["plan"] as { rows: string[][] };
    table.rows.forEach((row, i) => assert.equal(row[0], String(i + 1)));
  });

  it("truncation keeps a CTA-style last slot (sell, 3 stories)", () => {
    const r = runTool({ goal: "sell", storyCount: 3 });
    const table = r.values!["plan"] as { rows: string[][] };
    assert.equal(table.rows.length, 3);
    const last = table.rows[2];
    assert.ok(last[1].toLowerCase().includes("link"), last[1]);
    assert.ok(/last call|get .* here|comment|signup/i.test(last[2]), last[2]);
  });

  it("every goal's truncated plan ends with its playbook CTA", () => {
    for (const goal of PLAN_GOALS) {
      const full = runTool({ goal, storyCount: 10 });
      const fullTable = full.values!["plan"] as { rows: string[][] };
      const short = runTool({ goal, storyCount: 3 });
      const shortTable = short.values!["plan"] as { rows: string[][] };
      const fullCtaDraft = fullTable.rows[fullTable.rows.length - 1][2];
      // CTA for the full plan is the playbook's last slot
      assert.equal(shortTable.rows[2][2], fullCtaDraft, `goal ${goal}`);
    }
  });

  it("storyCount beyond playbook inserts booster slots before the CTA", () => {
    const r = runTool({ goal: "engage", storyCount: 9 }); // engage playbook has 6
    const table = r.values!["plan"] as { rows: string[][] };
    assert.equal(table.rows.length, 9);
    const boosters = table.rows.filter((row) => row[1] === "Poll sticker" && row[2].includes("check-in"));
    assert.equal(boosters.length, 3);
    // CTA is still last
    const last = table.rows[8];
    assert.ok(/follow|comment|signup|get .* here|last call/i.test(last[2]), last[2]);
  });

  it("goal matching is case-insensitive", () => {
    const a = runTool({ goal: "Sell", storyCount: 3 });
    const b = runTool({ goal: "sell", storyCount: 3 });
    assert.equal(a.ok, true);
    assert.deepEqual(a.values, b.values);
  });

  it("errors on missing goal", () => {
    const r = runTool({ storyCount: 5 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.toLowerCase().includes("goal"));
  });

  it("errors on unknown goal and lists valid goals", () => {
    const r = runTool({ goal: "viral" });
    assert.equal(r.ok, false);
    for (const g of PLAN_GOALS) assert.ok(r.error!.includes(GOAL_LABELS[g]));
  });

  it("errors on non-string goal", () => {
    const r = runTool({ goal: 123 });
    assert.equal(r.ok, false);
  });

  it("errors when storyCount is below 3", () => {
    const r = runTool({ goal: "sell", storyCount: 2 });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("3") && r.error!.includes("10"));
  });

  it("errors when storyCount exceeds 10", () => {
    const r = runTool({ goal: "sell", storyCount: 11 });
    assert.equal(r.ok, false);
  });

  it("errors on fractional and non-numeric storyCount", () => {
    assert.equal(runTool({ goal: "sell", storyCount: 4.5 }).ok, false);
    assert.equal(runTool({ goal: "sell", storyCount: "many" }).ok, false);
  });

  it("storyCount accepts a numeric string", () => {
    const r = runTool({ goal: "announce", storyCount: "6" });
    assert.equal(r.ok, true);
    const table = r.values!["plan"] as { rows: string[][] };
    assert.equal(table.rows.length, 6);
  });

  it("deterministic: same inputs give identical output", () => {
    const a = runTool({ goal: "launch", storyCount: 8 });
    const b = runTool({ goal: "launch", storyCount: 8 });
    assert.deepEqual(a, b);
  });

  it("drafts are placeholders with bracketed fill-ins (empty slots allowed)", () => {
    const r = runTool({ goal: "sell", storyCount: 5 });
    const table = r.values!["plan"] as { rows: string[][] };
    assert.ok(table.rows.some((row) => row[2].includes("[")));
    for (const row of table.rows) assert.ok(!row[2].includes("{"));
  });

  it("bank sizes documented and consistent", () => {
    assert.equal(BANK_SIZES.playbooks, 5);
    assert.equal(BANK_SIZES.totalSlots, 33);
    assert.equal(BANK_SIZES.minStories, 3);
    assert.equal(BANK_SIZES.maxStories, 10);
  });

  it("assumptions state it does not publish to Instagram", () => {
    assert.ok(ASSUMPTIONS.length >= 1);
    assert.ok(ASSUMPTIONS.some((a) => a.toLowerCase().includes("not ai")));
    assert.ok(ASSUMPTIONS.some((a) => a.toLowerCase().includes("does not publish")));
  });

  it("timingSuggestion is the documented guidance text", () => {
    const r = runTool(GOOD);
    assert.ok((r.values!["timingSuggestion"] as string).includes("24 hours"));
  });

  it("copyAll contains every slot draft", () => {
    const r = runTool({ goal: "educate", storyCount: 4 });
    const table = r.values!["plan"] as { rows: string[][] };
    const copy = r.values!["copyAll"] as string;
    for (const row of table.rows) {
      assert.ok(copy.includes(row[2]));
      assert.ok(copy.includes(`Slot ${row[0]}`));
    }
  });

  it("output ids are the contract ids: plan, timingSuggestion, copyAll", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["copyAll", "plan", "timingSuggestion"]);
  });
});
