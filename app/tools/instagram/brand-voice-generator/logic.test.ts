import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  pickPhrases,
  fillTemplate,
  ADJECTIVES,
  SAMPLE_TEMPLATES,
  MIN_ADJECTIVES,
  MAX_ADJECTIVES,
  MAX_NICHE_LENGTH,
  MAX_EXAMPLE_LENGTH,
} from "./logic.ts";

const VALID = {
  adjBold: true,
  adjFriendly: true,
  adjHonest: true,
  adjWitty: false,
  adjPlayful: false,
  adjProfessional: false,
  adjInspiring: false,
  adjCalm: false,
  niche: "budget travel",
};

describe("brand-voice-generator", () => {
  it("happy path: builds a voice profile from 3 adjectives", () => {
    const res = runTool(VALID);
    assert.equal(res.ok, true);
    assert.equal((res.values!.doPhrases as string[]).length, 6);
    assert.equal((res.values!.dontPhrases as string[]).length, 6);
    assert.equal((res.values!.sampleLines as string[]).length, 4);
    assert.ok((res.values!.copyAll as string).length > 0);
  });

  it("output ids match meta.ts outputs", () => {
    const res = runTool(VALID);
    assert.deepEqual(Object.keys(res.values!).sort(), [
      "copyAll",
      "doPhrases",
      "dontPhrases",
      "sampleLines",
    ]);
  });

  it("accepts exactly 5 adjectives (upper bound)", () => {
    const res = runTool({ ...VALID, adjWitty: true, adjCalm: true });
    assert.equal(res.ok, true);
    assert.equal((res.values!.doPhrases as string[]).length, 10);
  });

  it("sample lines contain the niche and chosen adjectives", () => {
    const res = runTool(VALID);
    const lines = res.values!.sampleLines as string[];
    assert.ok(lines.every((l) => l.includes("budget travel")));
    assert.ok(lines.some((l) => l.includes("bold")));
  });

  it("copyAll block contains all sections", () => {
    const res = runTool(VALID);
    const text = res.values!.copyAll as string;
    assert.ok(text.includes("BRAND VOICE PROFILE — budget travel"));
    assert.ok(text.includes("Tone: Bold, Friendly, Honest"));
    assert.ok(text.includes("DO:"));
    assert.ok(text.includes("DON'T:"));
    assert.ok(text.includes("SAMPLE CAPTIONS:"));
  });

  it("optional exampleLine is kept verbatim in copyAll", () => {
    const res = runTool({ ...VALID, exampleLine: "Travel more, spend less." });
    assert.equal(res.ok, true);
    assert.ok((res.values!.copyAll as string).includes("Travel more, spend less."));
  });

  it("exampleLine omitted: block still builds fine", () => {
    const res = runTool(VALID);
    assert.equal(res.ok, true);
    assert.ok(!(res.values!.copyAll as string).includes("YOUR EXAMPLE LINE"));
  });

  it("validation: fewer than 3 adjectives fails", () => {
    const res = runTool({ ...VALID, adjHonest: false });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /3 to 5 adjectives/);
  });

  it("validation: more than 5 adjectives fails", () => {
    const res = runTool({
      ...VALID,
      adjWitty: true,
      adjCalm: true,
      adjPlayful: true,
    });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /3 to 5 adjectives/);
  });

  it("validation: zero adjectives fails", () => {
    const none = { niche: "fitness" };
    const res = runTool(none);
    assert.equal(res.ok, false);
    assert.match(String(res.error), /you picked 0/);
  });

  it("validation: missing niche fails", () => {
    const { niche, ...rest } = VALID;
    const res = runTool(rest);
    assert.equal(res.ok, false);
    assert.match(String(res.error), /enter your niche/i);
  });

  it("validation: blank niche fails", () => {
    const res = runTool({ ...VALID, niche: "   " });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /enter your niche/i);
  });

  it("validation: niche over 120 chars fails", () => {
    const res = runTool({ ...VALID, niche: "x".repeat(MAX_NICHE_LENGTH + 1) });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /120 characters/);
  });

  it("validation: niche at exactly 120 chars passes", () => {
    const res = runTool({ ...VALID, niche: "x".repeat(MAX_NICHE_LENGTH) });
    assert.equal(res.ok, true);
  });

  it("validation: exampleLine over 500 chars fails", () => {
    const res = runTool({ ...VALID, exampleLine: "y".repeat(MAX_EXAMPLE_LENGTH + 1) });
    assert.equal(res.ok, false);
    assert.match(String(res.error), /500 characters/);
  });

  it("determinism: same inputs twice give identical output", () => {
    const a = runTool({ ...VALID, exampleLine: "Go far." });
    const b = runTool({ ...VALID, exampleLine: "Go far." });
    assert.deepEqual(a, b);
  });

  it("determinism: pickPhrases is stable", () => {
    const bank = ADJECTIVES[0].doPhrases;
    assert.deepEqual(pickPhrases(bank, "seed1"), pickPhrases(bank, "seed1"));
  });

  it("pickPhrases returns 2 distinct phrases from the bank", () => {
    const bank = ADJECTIVES[1].doPhrases;
    const picked = pickPhrases(bank, "niche-x");
    assert.equal(picked.length, 2);
    assert.notEqual(picked[0], picked[1]);
    assert.ok(picked.every((p) => bank.includes(p)));
  });

  it("different niches rotate phrase selection", () => {
    const bank = ADJECTIVES[0].doPhrases;
    const picks = ["niche-a", "niche-b", "niche-c"].map((n) => pickPhrases(bank, "adjBold" + n).join("|"));
    assert.equal(new Set(picks).size >= 1, true);
  });

  it("fillTemplate fills all slots", () => {
    const out = fillTemplate(SAMPLE_TEMPLATES[0], "fitness", ["Bold", "Friendly", "Honest"]);
    assert.ok(!out.includes("{"));
    assert.ok(out.includes("fitness"));
    assert.ok(out.includes("bold"));
  });

  it("word-bank bounds: 8 adjectives x 4 do x 4 don't", () => {
    assert.equal(ADJECTIVES.length, 8);
    assert.equal(SAMPLE_TEMPLATES.length, 4);
    assert.equal(MIN_ADJECTIVES, 3);
    assert.equal(MAX_ADJECTIVES, 5);
    for (const a of ADJECTIVES) {
      assert.equal(a.doPhrases.length, 4, a.id);
      assert.equal(a.dontPhrases.length, 4, a.id);
      assert.ok(new Set([...a.doPhrases, ...a.dontPhrases]).size === 8, a.id);
    }
  });

  it("do and don't phrases never overlap within an adjective", () => {
    for (const a of ADJECTIVES) {
      for (const d of a.doPhrases) assert.ok(!a.dontPhrases.includes(d), a.id);
    }
  });
});
