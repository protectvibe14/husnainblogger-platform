/**
 * Tests for the Font Pairing Generator.
 * Run: node --test app/tools/video-editing/font-pairing-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, DISPLAY_FONTS, FALLBACK_STACKS } from "./logic.ts";

const GOOD = { mood: "bold", useCase: "captions" };
const MOODS = ["bold", "elegant", "playful", "techy"];
const USES = ["captions", "titles", "lower-thirds"];

function baseFont(full: string): string {
  const i = full.indexOf(" (fallback:");
  return i === -1 ? full : full.slice(0, i);
}

describe("font-pairing-generator", () => {
  it("happy path: returns ok with both output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["contrastNote", "pairings"]);
  });

  it("returns exactly 2 pairings per mood/use-case", () => {
    for (const mood of MOODS) {
      for (const use of USES) {
        const r = runTool({ mood, useCase: use });
        assert.equal(r.ok, true, `${mood}/${use}`);
        assert.equal((r.values!.pairings as string[]).length, 2, `${mood}/${use} count`);
      }
    }
  });

  it("bank holds 24 pairs total (4 moods x 3 uses x 2)", () => {
    let total = 0;
    for (const mood of MOODS) {
      for (const use of USES) {
        total += (runTool({ mood, useCase: use }).values!.pairings as string[]).length;
      }
    }
    assert.equal(total, 24);
  });

  it("no pair contains two display fonts (rule enforced)", () => {
    for (const mood of MOODS) {
      for (const use of USES) {
        const pairings = runTool({ mood, useCase: use }).values!.pairings as string[];
        for (const p of pairings) {
          const heading = p.match(/Heading: (.+?) \+ Body:/)![1];
          const body = p.match(/\+ Body: (.+?) —/)![1];
          const h = baseFont(heading);
          const b = baseFont(body);
          const bothDisplay = DISPLAY_FONTS.includes(h) && DISPLAY_FONTS.includes(b);
          assert.equal(bothDisplay, false, `${mood}/${use}: ${h} + ${b}`);
        }
      }
    }
  });

  it("every pairing carries a system fallback stack", () => {
    const pairings = runTool(GOOD).values!.pairings as string[];
    const stacks = Object.values(FALLBACK_STACKS);
    for (const p of pairings) {
      assert.ok(p.includes("fallback:"), p);
      assert.ok(stacks.some((s) => p.includes(s)), `known fallback stack in: ${p}`);
    }
  });

  it("every pairing includes informational Google Fonts links", () => {
    const pairings = runTool(GOOD).values!.pairings as string[];
    for (const p of pairings) {
      assert.ok(p.includes("https://fonts.google.com/?query="), p);
    }
  });

  it("every pairing has a non-empty 'why' explanation", () => {
    for (const mood of MOODS) {
      for (const use of USES) {
        const pairings = runTool({ mood, useCase: use }).values!.pairings as string[];
        for (const p of pairings) {
          const why = p.split("—")[1];
          assert.ok(why && why.trim().length > 10, `why present: ${p.slice(0, 40)}`);
        }
      }
    }
  });

  it("heading and body fonts differ within each pair", () => {
    const pairings = runTool({ mood: "techy", useCase: "captions" }).values!.pairings as string[];
    for (const p of pairings) {
      const heading = baseFont(p.match(/Heading: (.+?) \+ Body:/)![1]);
      const body = baseFont(p.match(/\+ Body: (.+?) —/)![1]);
      assert.notEqual(heading, body);
    }
  });

  it("contrastNote matches the requested use case", () => {
    for (const use of USES) {
      const note = runTool({ mood: "elegant", useCase: use }).values!.contrastNote as string;
      assert.ok(note.length > 20);
      assert.ok(note.toLowerCase().includes(use.replace("-", " ").split(" ")[0]), `note for ${use}`);
    }
  });

  it("contrastNote is honest about video backgrounds", () => {
    const note = runTool({ mood: "bold", useCase: "captions" }).values!.contrastNote as string;
    assert.ok(note.includes("moving video"));
  });

  it("invalid mood is rejected", () => {
    const r = runTool({ mood: "moody", useCase: "captions" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /mood/);
  });

  it("invalid useCase is rejected", () => {
    const r = runTool({ mood: "bold", useCase: "posters" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /use case/);
  });

  it("missing inputs are rejected", () => {
    assert.equal(runTool({}).ok, false);
    assert.equal(runTool({ mood: "bold" }).ok, false);
    assert.equal(runTool({ useCase: "titles" }).ok, false);
  });

  it("mood and useCase outputs differ (bank is not one-size-fits-all)", () => {
    const a = runTool({ mood: "bold", useCase: "titles" }).values!.pairings as string[];
    const b = runTool({ mood: "elegant", useCase: "titles" }).values!.pairings as string[];
    assert.notDeepEqual(a, b);
  });

  it("deterministic: two runs with identical inputs are identical", () => {
    assert.deepEqual(runTool(GOOD), runTool({ ...GOOD }));
    assert.deepEqual(
      runTool({ mood: "playful", useCase: "lower-thirds" }),
      runTool({ mood: "playful", useCase: "lower-thirds" }),
    );
  });
});
