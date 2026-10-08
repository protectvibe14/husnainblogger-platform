/**
 * Tests for the Emoji Title Suggester.
 * Run: node --test app/tools/video-editing/emoji-title-suggester/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  countEmojis,
  pickEmojis,
  applyPlacement,
  KEYWORD_EMOJI,
  TONE_DEFAULTS,
  PLACEMENTS,
} from "./logic.ts";

const GOOD = { titleText: "How I made money with AI", tone: "hype" };

describe("emoji-title-suggester", () => {
  it("happy path: returns ok with both output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["renderingNote", "suggestions"]);
  });

  it("returns 3 suggestions, one per placement", () => {
    const s = runTool(GOOD).values!.suggestions as string[];
    assert.equal(s.length, 3);
    for (const p of PLACEMENTS) {
      assert.ok(s.some((x) => x.includes(`placement: ${p}`)), p);
    }
  });

  it("keyword match pulls the right category emojis first", () => {
    const picked = pickEmojis("pizza recipe for dinner", "calm", 4);
    // food category is index 3
    assert.deepEqual(picked, KEYWORD_EMOJI[3].emojis);
  });

  it("first matching category in bank order wins on multi-match", () => {
    // "best" matches the hype category (index 2) before food (index 3)
    const picked = pickEmojis("best pizza recipe ever", "calm", 4);
    assert.deepEqual(picked, KEYWORD_EMOJI[2].emojis);
  });

  it("tone defaults fill remaining slots after keyword matches", () => {
    const picked = pickEmojis("money cash profit revenue", "funny", 5);
    assert.ok(picked.length === 5);
    assert.ok(picked.includes(TONE_DEFAULTS["funny"][0]));
  });

  it("no keyword match: all emojis come from tone defaults", () => {
    const picked = pickEmojis("xyzzy qwerty", "calm", 3);
    assert.deepEqual(picked, TONE_DEFAULTS["calm"].slice(0, 3));
  });

  it("matching is case-insensitive", () => {
    const a = pickEmojis("MONEY", "hype", 4);
    const b = pickEmojis("money", "hype", 4);
    assert.deepEqual(a, b);
  });

  it("picks never exceed maxEmojis and never duplicate", () => {
    const picked = pickEmojis("money money money insane viral", "hype", 2);
    assert.ok(picked.length <= 2);
    assert.equal(new Set(picked).size, picked.length);
  });

  it("maxEmojis default is 3", () => {
    const s = runTool({ titleText: "money tips", tone: "hype" }).values!.suggestions as string[];
    const emojis = s[0].match(/emojis: (.+?) — placement/)![1].split(" ");
    assert.equal(emojis.length, 3);
  });

  it("maxEmojis 1 and 5 boundaries work", () => {
    for (const n of [1, 5]) {
      const s = runTool({ ...GOOD, maxEmojis: n }).values!.suggestions as string[];
      const emojis = s[0].match(/emojis: (.+?) — placement/)![1].split(" ");
      assert.equal(emojis.length, n, `maxEmojis=${n}`);
    }
  });

  it("maxEmojis 0 and 6 are rejected", () => {
    for (const n of [0, 6]) {
      const r = runTool({ ...GOOD, maxEmojis: n });
      assert.equal(r.ok, false, `maxEmojis=${n}`);
      assert.match(r.error!, /between 1 and 5/);
    }
  });

  it("non-integer maxEmojis is rejected", () => {
    const r = runTool({ ...GOOD, maxEmojis: 2.5 });
    assert.equal(r.ok, false);
  });

  it("existing emoji in the title count toward the limit", () => {
    const r = runTool({ titleText: "money tips 🔥💯", tone: "hype", maxEmojis: 3 }).values!;
    const s = r.suggestions as string[];
    // 2 existing + 1 new = 3 total max
    const front = s[0].match(/"(.+)" —/)![1];
    assert.equal(countEmojis(front), 3);
  });

  it("title already at the limit gets no new emoji", () => {
    const r = runTool({ titleText: "money tips 🔥💯🚀", tone: "hype", maxEmojis: 3 }).values!;
    const s = r.suggestions as string[];
    assert.ok(s[0].includes("(none — title already at the limit)"));
  });

  it("ZWJ sequences count as one emoji", () => {
    // Family emoji: man + ZWJ + woman + ZWJ + girl
    const zwj = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}";
    assert.equal(countEmojis(zwj), 1);
    assert.equal(countEmojis(zwj + "🔥"), 2);
    assert.equal(countEmojis("plain text"), 0);
  });

  it("placement rules: front / end / split", () => {
    assert.equal(applyPlacement("Hi", ["🔥", "💯"], "front"), "🔥💯 Hi");
    assert.equal(applyPlacement("Hi", ["🔥", "💯"], "end"), "Hi 🔥💯");
    assert.equal(applyPlacement("Hi", ["🔥", "💯"], "split"), "🔥 Hi 💯");
    assert.equal(applyPlacement("Hi", ["🔥", "💯", "🚀"], "split"), "🔥💯 Hi 🚀");
  });

  it("original title text always survives intact (no emoji-only titles)", () => {
    const s = runTool({ titleText: "My vlog", tone: "funny" }).values!.suggestions as string[];
    for (const x of s) {
      assert.ok(x.includes("My vlog"));
    }
  });

  it("blank titleText is rejected", () => {
    const r = runTool({ titleText: "   ", tone: "hype" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /title text/);
  });

  it(`title over 120 chars is rejected`, () => {
    const r = runTool({ titleText: "x".repeat(121), tone: "hype" });
    assert.equal(r.ok, false);
  });

  it("title at exactly 120 chars is accepted", () => {
    const r = runTool({ titleText: "x".repeat(120), tone: "hype" });
    assert.equal(r.ok, true);
  });

  it("invalid tone is rejected", () => {
    const r = runTool({ titleText: "My vlog", tone: "sleepy" });
    assert.equal(r.ok, false);
    assert.match(r.error!, /tone/);
  });

  it("renderingNote is honest about OS variance and ZWJ counting", () => {
    const note = runTool(GOOD).values!.renderingNote as string;
    assert.ok(note.includes("vary by device"));
    assert.ok(note.includes("ZWJ"));
    assert.ok(note.includes("keep your main keyword in words"));
  });

  it("bank sizes match documentation (16x4 + 3x5)", () => {
    assert.equal(KEYWORD_EMOJI.length, 16);
    for (const c of KEYWORD_EMOJI) {
      assert.equal(c.emojis.length, 4);
      assert.ok(c.keywords.length >= 3);
    }
    assert.deepEqual(Object.keys(TONE_DEFAULTS).sort(), ["calm", "funny", "hype"]);
    for (const t of Object.keys(TONE_DEFAULTS)) {
      assert.equal(TONE_DEFAULTS[t].length, 5);
    }
  });

  it("deterministic: two runs with identical inputs are identical", () => {
    assert.deepEqual(runTool(GOOD), runTool({ ...GOOD }));
  });
});
