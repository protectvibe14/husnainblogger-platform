import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const BASE = {
  platform: "YouTube",
  hasCaptions: true,
  hasMusic: false,
  durationSec: 300,
};

function valuesOf(r: ReturnType<typeof runTool>) {
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values!;
}

describe("export-qa-checklist", () => {
  it("happy path: YouTube with captions, no music", () => {
    const v = valuesOf(runTool(BASE));
    const checklist = v.checklist as string[];
    assert.equal(checklist.length, 10 + 4 + 4, `got ${checklist.length}`);
    // 6 base criticals + 1 YouTube critical ("made for kids") = 7
    assert.equal(v.criticalCount, 7, `criticalCount ${v.criticalCount}`);
    assert.ok(checklist.every((s) => s.includes(":")), "every item has a category");
    assert.ok(checklist.some((s) => s.startsWith("[CRITICAL]")), "critical items prefixed");
  });

  it("every platform id accepted (case-insensitive labels)", () => {
    for (const platform of ["YouTube", "tiktok", "Instagram Reels", "FACEBOOK"]) {
      const r = runTool({ ...BASE, platform });
      assert.equal(r.ok, true, `platform ${platform}`);
    }
  });

  it("unknown platform -> validation error", () => {
    const r = runTool({ ...BASE, platform: "MySpace" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /platform/i);
  });

  it("missing platform -> validation error", () => {
    const r = runTool({ hasCaptions: true, hasMusic: false, durationSec: 60 });
    assert.equal(r.ok, false);
  });

  it("no captions -> caption check included as CRITICAL (spec edge case)", () => {
    const v = valuesOf(runTool({ ...BASE, hasCaptions: false }));
    const checklist = v.checklist as string[];
    const captionItem = checklist.find((s) => s.includes("No captions in this project"));
    assert.ok(captionItem, "caption-off item present");
    assert.ok(captionItem!.startsWith("[CRITICAL]"), `critical: ${captionItem}`);
    assert.equal(v.criticalCount, 8, `criticalCount ${v.criticalCount}`);
  });

  it("captions on -> 4 caption quality checks, none critical", () => {
    const v = valuesOf(runTool(BASE));
    const captionItems = (v.checklist as string[]).filter((s) =>
      s.includes("Captions & text")
    );
    assert.equal(captionItems.length, 4);
    assert.ok(captionItems.every((s) => !s.startsWith("[CRITICAL]")));
  });

  it("music present -> loudness and rights checks included (spec edge case)", () => {
    const v = valuesOf(runTool({ ...BASE, hasMusic: true }));
    const checklist = v.checklist as string[];
    assert.ok(
      checklist.some((s) => s.includes("licensed or royalty-free")),
      "rights check present"
    );
    assert.ok(
      checklist.some((s) => s.includes("ducked under dialogue")),
      "loudness/ducking check present"
    );
    // +1 critical (rights) on top of the 7 from the happy path
    assert.equal(v.criticalCount, 8, `criticalCount ${v.criticalCount}`);
    assert.equal(checklist.length, 10 + 4 + 4 + 3);
  });

  it("music absent -> no music checks", () => {
    const v = valuesOf(runTool(BASE));
    assert.ok(
      !(v.checklist as string[]).some((s) => s.includes("Music & audio")),
      "no music items"
    );
  });

  it("long video (>600s) -> chapter markers check added", () => {
    const v = valuesOf(runTool({ ...BASE, durationSec: 900 }));
    assert.ok(
      (v.checklist as string[]).some((s) => s.includes("chapter markers")),
      "chapters check present"
    );
  });

  it("short vertical clip (<60s, TikTok) -> 9:16 reframe check added", () => {
    const v = valuesOf(runTool({
      platform: "TikTok",
      hasCaptions: false,
      hasMusic: false,
      durationSec: 30,
    }));
    const checklist = v.checklist as string[];
    assert.ok(checklist.some((s) => s.includes("9:16 reframe")));
  });

  it("short horizontal video -> no reframe check", () => {
    const v = valuesOf(runTool({ ...BASE, durationSec: 30 }));
    assert.ok(!(v.checklist as string[]).some((s) => s.includes("9:16 reframe")));
  });

  it("invalid duration values rejected", () => {
    for (const durationSec of [0, -10, NaN, Infinity, "300" as unknown as number]) {
      const r = runTool({ ...BASE, durationSec });
      assert.equal(r.ok, false, `duration ${durationSec} rejected`);
    }
  });

  it("non-boolean hasCaptions/hasMusic rejected", () => {
    assert.equal(runTool({ ...BASE, hasCaptions: "yes" }).ok, false);
    assert.equal(runTool({ ...BASE, hasMusic: 1 }).ok, false);
  });

  it("criticalCount equals actual [CRITICAL] items", () => {
    for (const platform of ["YouTube", "TikTok", "Instagram Reels", "Facebook"]) {
      const v = valuesOf(
        runTool({ platform, hasCaptions: false, hasMusic: true, durationSec: 1200 })
      );
      const flagged = (v.checklist as string[]).filter((s) => s.startsWith("[CRITICAL]"));
      assert.equal(flagged.length, v.criticalCount, `platform ${platform}`);
    }
  });

  it("deterministic: same input run twice -> identical output", () => {
    const args = { ...BASE };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("output ids match meta.ts outputs", async () => {
    const meta = await import("./meta.ts");
    const outputIds = (meta.outputs as { id: string }[]).map((o) => o.id).sort();
    assert.deepEqual(outputIds, ["checklist", "criticalCount"]);
  });

  it("word-bank bounds: checklist size within documented max (22)", () => {
    const v = valuesOf(
      runTool({ platform: "TikTok", hasCaptions: true, hasMusic: true, durationSec: 1200 })
    );
    const n = (v.checklist as string[]).length;
    assert.ok(n <= 22, `max 22, got ${n}`);
    assert.ok(n >= 14, `min sensible, got ${n}`);
    assert.ok((v.checklist as string[]).every((s) => s.length > 10), "no empty picks");
  });
});
