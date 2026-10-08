/**
 * Tests for the Comment-to-DM Funnel Script Generator.
 * Run: node --test app/tools/instagram/comment-to-dm-funnel-script-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, TONES } from "./logic.ts";

const GOOD = { leadMagnet: "Free Reels Hooks PDF", keyword: "HOOKS", tone: "friendly" };

describe("comment-to-dm-funnel-script-generator", () => {
  it("happy path: returns ok with all four output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "commentReply",
      "dmScript",
      "followUp",
      "setupChecklist",
    ]);
  });

  it("fills leadMagnet and keyword into every script", () => {
    const r = runTool(GOOD).values!;
    assert.ok((r.commentReply as string).length > 0);
    const dm = r.dmScript as string[];
    assert.equal(dm.length, 3);
    assert.ok(dm[0].includes("Free Reels Hooks PDF"));
    assert.ok(dm[0].includes("HOOKS"));
    const fu = r.followUp as string[];
    assert.equal(fu.length, 2);
    assert.ok(fu.every((m) => m.includes("Free Reels Hooks PDF")));
  });

  it("no raw {leadMagnet}/{keyword} placeholders remain in scripts", () => {
    const r = runTool(GOOD).values!;
    const all = [r.commentReply as string, ...(r.dmScript as string[]), ...(r.followUp as string[])];
    for (const m of all) {
      assert.ok(!m.includes("{leadMagnet}") && !m.includes("{keyword}"));
    }
  });

  it("DM script keeps a link slot for the user to fill", () => {
    const dm = runTool(GOOD).values!.dmScript as string[];
    assert.ok(dm[0].includes("[paste your link here]"));
  });

  it("every tone produces complete scripts", () => {
    for (const tone of TONES) {
      const r = runTool({ ...GOOD, tone });
      assert.equal(r.ok, true, tone);
      assert.equal((r.values!.dmScript as string[]).length, 3, tone);
      assert.equal((r.values!.followUp as string[]).length, 2, tone);
      assert.ok((r.values!.commentReply as string).includes("DM"), tone);
    }
  });

  it("unknown tone falls back to friendly", () => {
    assert.deepEqual(runTool({ ...GOOD, tone: "sneaky" }), runTool({ ...GOOD, tone: "friendly" }));
  });

  it("setupChecklist has 6 steps incl. the manual-send honesty rule", () => {
    const list = runTool(GOOD).values!.setupChecklist as string[];
    assert.equal(list.length, 6);
    assert.ok(list.some((s) => /manually/i.test(s) && /bot/i.test(s)));
  });

  it("multi-word keyword is accepted (single word only recommended)", () => {
    const r = runTool({ ...GOOD, keyword: "send it" });
    assert.equal(r.ok, true);
    assert.ok((r.values!.dmScript as string[])[0].includes("send it"));
  });

  it("missing leadMagnet -> error", () => {
    const r = runTool({ keyword: "HOOKS" });
    assert.equal(r.ok, false);
    assert.ok(/lead magnet/i.test(r.error!));
  });

  it("whitespace-only leadMagnet -> error", () => {
    assert.equal(runTool({ leadMagnet: "  ", keyword: "HOOKS" }).ok, false);
  });

  it("missing keyword -> error", () => {
    const r = runTool({ leadMagnet: "Free PDF" });
    assert.equal(r.ok, false);
    assert.ok(/keyword/i.test(r.error!));
  });

  it("leadMagnet over 80 chars -> error; 80 chars -> ok", () => {
    assert.equal(runTool({ ...GOOD, leadMagnet: "L".repeat(81) }).ok, false);
    assert.equal(runTool({ ...GOOD, leadMagnet: "L".repeat(80) }).ok, true);
  });

  it("keyword over 30 chars -> error; 30 chars -> ok", () => {
    assert.equal(runTool({ ...GOOD, keyword: "K".repeat(31) }).ok, false);
    assert.equal(runTool({ ...GOOD, keyword: "K".repeat(30) }).ok, true);
  });

  it("trims whitespace on leadMagnet and keyword", () => {
    const r = runTool({ ...GOOD, leadMagnet: "  Free PDF  ", keyword: "  HOOKS  " });
    assert.ok((r.values!.dmScript as string[])[0].includes("Free PDF"));
    assert.ok(!(r.values!.dmScript as string[])[0].includes("  Free PDF  "));
  });

  it("determinism: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(GOOD), runTool({ ...GOOD }));
  });

  it("different lead magnets give different scripts", () => {
    const a = runTool(GOOD).values!.dmScript;
    const b = runTool({ ...GOOD, leadMagnet: "Meal Plan" }).values!.dmScript;
    assert.notDeepEqual(a, b);
  });
});
