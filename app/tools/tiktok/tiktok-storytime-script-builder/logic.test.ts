import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  MAX_ITEMS,
  MAX_TITLE_LEN,
  MAX_NICHE_LEN,
  MIN_BEAT_LEN,
  MAX_BEAT_LEN,
  SINGLE_VIDEO_TARGET_SECS,
  SERIES_PLANNER_URL,
} from "./logic.ts";

const OUTPUT_IDS = ["scripts", "narrationEstimates", "pacingSummaries", "seriesNote"];

const item = {
  storyTitle: "The client who ghosted me",
  niche: "freelancing",
  setup: "I landed my biggest client ever — a startup that promised me monthly retainer work for a whole year.",
  conflict:
    "Two weeks into the project they stopped replying. No feedback, no payment, nothing. I had already turned down two other clients for them.",
  twist: "A month later they emailed like nothing happened — asking me to finish the project by Friday.",
  resolution: "I sent them my new rates, double the old ones, with payment upfront. They paid within the hour.",
};

describe("tiktok-storytime-script-builder", () => {
  it("happy path builds one full script", () => {
    const r = runTool({ items: [item] });
    assert.equal(r.ok, true);
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
    const scripts = r.values!.scripts as string[];
    assert.equal(scripts.length, 1);
    const s = scripts[0];
    assert.ok(s.includes("The client who ghosted me"));
    assert.ok(s.includes("HOOK"));
    assert.ok(s.includes("SETUP"));
    assert.ok(s.includes("CONFLICT"));
    assert.ok(s.includes("TWIST"));
    assert.ok(s.includes("RESOLUTION"));
    assert.ok(s.includes("CTA"));
    assert.ok(s.includes("[On-screen text:"));
    assert.ok(s.includes("[Beat:"));
  });

  it("works with only setup + conflict (twist/resolution optional)", () => {
    const r = runTool({
      items: [{ storyTitle: "Short one", niche: "freelancing", setup: item.setup, conflict: item.conflict }],
    });
    assert.equal(r.ok, true);
    const s = (r.values!.scripts as string[])[0];
    assert.ok(!s.includes("\nTWIST —"), "no twist section");
    assert.ok(!s.includes("\nRESOLUTION —"), "no resolution section");
    assert.ok(s.includes("SETUP") && s.includes("CONFLICT"));
  });

  it("builds multiple items with per-item outputs", () => {
    const r = runTool({ items: [item, { ...item, storyTitle: "Second story" }] });
    assert.equal(r.ok, true);
    assert.equal((r.values!.scripts as string[]).length, 2);
    assert.equal((r.values!.narrationEstimates as string[]).length, 2);
    assert.equal((r.values!.pacingSummaries as string[]).length, 2);
  });

  it("narration estimate is labeled an estimate", () => {
    const r = runTool({ items: [item] }).values!;
    assert.match((r.narrationEstimates as string[])[0], /estimate/);
  });

  it("pacing summary has timestamp chain", () => {
    const r = runTool({ items: [item] }).values!;
    const p = (r.pacingSummaries as string[])[0];
    assert.ok(p.includes("hook 0:00"));
    assert.ok(p.includes("setup"));
    assert.ok(p.includes("CTA"));
    assert.ok(p.includes("→"));
  });

  it("short story: series note says no split needed", () => {
    const r = runTool({ items: [item] }).values!;
    assert.match(r.seriesNote as string, /no series split needed/);
  });

  it("very long story suggests multi-part series with planner link (not an error)", () => {
    // 240 words/beat x 2 beats + 40 (hook/CTA) = 520 words -> ~210s > 180s,
    // while each beat stays under the 1500-char cap.
    const longBeat = "story ".repeat(240);
    const r = runTool({
      items: [{ storyTitle: "Epic saga", niche: "freelancing", setup: longBeat, conflict: longBeat }],
    });
    assert.equal(r.ok, true);
    const note = r.values!.seriesNote as string;
    assert.match(note, /multi-part series|part series/i);
    assert.ok(note.includes(SERIES_PLANNER_URL), "links the series planner");
    const est = (r.values!.narrationEstimates as string[])[0];
    assert.match(est, new RegExp(`${SINGLE_VIDEO_TARGET_SECS}s`));
  });

  it("empty items array fails", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /at least one/i);
  });

  it("missing items fails", () => {
    const r = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
  });

  it("more than MAX_ITEMS fails", () => {
    const many = Array.from({ length: MAX_ITEMS + 1 }, (_, i) => ({ ...item, storyTitle: `Story ${i}` }));
    const r = runTool({ items: many });
    assert.equal(r.ok, false);
    assert.match(r.error!, new RegExp(String(MAX_ITEMS)));
  });

  it("missing setup fails with item number", () => {
    const r = runTool({ items: [{ storyTitle: "x", niche: "y", conflict: item.conflict }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1.*setup/i);
  });

  it("missing conflict fails", () => {
    const r = runTool({ items: [{ storyTitle: "x", niche: "y", setup: item.setup }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1.*conflict/i);
  });

  it("too-short setup fails", () => {
    const r = runTool({ items: [{ ...item, setup: "too short" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /setup is too short/);
  });

  it("over-long conflict fails", () => {
    const r = runTool({ items: [{ ...item, conflict: "x".repeat(MAX_BEAT_LEN + 1) }] });
    assert.equal(r.ok, false);
  });

  it("missing storyTitle fails", () => {
    const { storyTitle: _t, ...rest } = item;
    const r = runTool({ items: [rest] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /story title/i);
  });

  it("over-long title fails", () => {
    const r = runTool({ items: [{ ...item, storyTitle: "x".repeat(MAX_TITLE_LEN + 1) }] });
    assert.equal(r.ok, false);
  });

  it("missing niche fails", () => {
    const { niche: _n, ...rest } = item;
    const r = runTool({ items: [rest] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /niche/i);
  });

  it("over-long niche fails", () => {
    const r = runTool({ items: [{ ...item, niche: "x".repeat(MAX_NICHE_LEN + 1) }] });
    assert.equal(r.ok, false);
  });

  it("too-short optional twist fails", () => {
    const r = runTool({ items: [{ ...item, twist: "tiny" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /twist is too short/);
  });

  it("invalid second item reports 'Item 2'", () => {
    const r = runTool({ items: [item, { storyTitle: "bad", niche: "y" }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2/);
  });

  it("deterministic: same items twice give identical outputs", () => {
    const a = runTool({ items: [item] });
    const b = runTool({ items: [item] });
    assert.deepEqual(a, b);
  });

  it("different stories get different hooks/CTAs selected deterministically", () => {
    const a = (runTool({ items: [item] }).values!.scripts as string[])[0];
    const b = (runTool({ items: [{ ...item, storyTitle: "A totally different tale" }] }).values!.scripts as string[])[0];
    assert.notEqual(a, b);
    assert.equal(a, (runTool({ items: [item] }).values!.scripts as string[])[0]);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ items: [item] });
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });

  it("no empty scripts or unfilled placeholders", () => {
    const r = runTool({ items: [item] }).values!;
    for (const s of r.scripts as string[]) {
      assert.ok(s.trim().length > 100);
      assert.ok(!s.includes("{niche}"), "no unfilled placeholders");
    }
  });
});
