import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  generateCtas,
  detectFamily,
  PLATFORM_NOTE,
  BANK_SIZES,
  GOAL_FAMILIES,
  MAX_PHRASE_LENGTH,
  PHRASES_PER_FAMILY,
} from "./logic.ts";

const ACTION_VERBS = [
  "shop", "grab", "order", "add", "tap", "book", "schedule", "reserve", "call",
  "read", "learn", "discover", "watch", "get", "see", "join", "subscribe",
  "sign", "follow", "download", "message", "send", "chat", "talk", "ask",
  "start", "take", "try", "don", "claim",
];

describe("facebook-cta-text-generator", () => {
  it("happy path: 'shop now' returns 6 shop phrases", () => {
    const r = runTool({ goal: "shop now" });
    assert.equal(r.ok, true);
    const phrases = r.values!.ctaPhrases as string[];
    assert.equal(phrases.length, 6);
    assert.ok(phrases.some((p) => p.includes("Shop")));
    assert.equal(r.values!.platformNote, PLATFORM_NOTE);
  });

  it("book goal maps to the book family", () => {
    const r = runTool({ goal: "book a free call" });
    assert.equal(r.ok, true);
    assert.equal(detectFamily("book a free call"), "book");
    assert.ok((r.values!.ctaPhrases as string[]).includes("Book your free consult"));
  });

  it("learn goal maps to the learn family", () => {
    assert.equal(detectFamily("learn more here"), "learn");
    const r = runTool({ goal: "read the guide" });
    assert.ok((r.values!.ctaPhrases as string[]).includes("Read the full guide"));
  });

  it("join goal maps to the join family", () => {
    assert.equal(detectFamily("join my newsletter"), "join");
    const r = runTool({ goal: "subscribe" });
    assert.ok((r.values!.ctaPhrases as string[]).includes("Subscribe for weekly tips"));
  });

  it("download goal maps to the download family", () => {
    assert.equal(detectFamily("download my ebook"), "download");
    const r = runTool({ goal: "get the free app" });
    assert.ok((r.values!.ctaPhrases as string[]).includes("Download the app today"));
  });

  it("contact goal maps to the contact family", () => {
    assert.equal(detectFamily("send me a message"), "contact");
    const r = runTool({ goal: "chat with us" });
    assert.ok((r.values!.ctaPhrases as string[]).includes("Chat with our team"));
  });

  it("unknown goal falls back to general family", () => {
    assert.equal(detectFamily("something totally unrelated xyz"), "general");
    const r = runTool({ goal: "something totally unrelated xyz" });
    assert.equal((r.values!.ctaPhrases as string[]).length, 6);
  });

  it("detection is case-insensitive", () => {
    assert.equal(detectFamily("SHOP NOW"), "shop");
    assert.equal(detectFamily("Book A Call"), "book");
  });

  it("every phrase in the bank is verb-led and within the length limit", () => {
    for (const family of GOAL_FAMILIES) {
      const { phrases } = generateCtasForFamily(family);
      assert.equal(phrases.length, PHRASES_PER_FAMILY, family);
      for (const p of phrases) {
        assert.ok(p.length <= MAX_PHRASE_LENGTH, `${p} (${p.length})`);
        const first = p.split(" ")[0].toLowerCase();
        assert.ok(ACTION_VERBS.includes(first), `not verb-led: ${p}`);
      }
    }
  });

  it("no duplicate phrases within a family", () => {
    for (const family of GOAL_FAMILIES) {
      const { phrases } = generateCtasForFamily(family);
      assert.equal(new Set(phrases).size, phrases.length, family);
    }
  });

  it("platform note says Page buttons are a fixed Facebook list", () => {
    assert.ok(PLATFORM_NOTE.includes("fixed Facebook list"));
    assert.ok(PLATFORM_NOTE.includes("in-post CTA text"));
  });

  it("missing goal errors", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /Goal is required/);
  });

  it("blank goal errors", () => {
    const r = runTool({ goal: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Goal is required/);
  });

  it("non-string goal errors", () => {
    const r = runTool({ goal: 5 as unknown as string });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Goal is required/);
  });

  it("deterministic: same inputs give identical outputs", () => {
    const a = runTool({ goal: "shop now" });
    const b = runTool({ goal: "shop now" });
    assert.deepEqual(a, b);
  });

  it("bank sizes are documented and consistent", () => {
    assert.equal(BANK_SIZES.families, GOAL_FAMILIES.length);
    assert.equal(BANK_SIZES.phrasesPerFamily, 6);
    assert.equal(BANK_SIZES.total, 42);
  });

  it("output ids match meta.ts (ctaPhrases, platformNote)", () => {
    const r = runTool({ goal: "shop now" });
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), ["ctaPhrases", "platformNote"]);
  });

  it("generateCtas returns the detected family", () => {
    assert.equal(generateCtas("shop now").family, "shop");
    assert.equal(generateCtas("xyz unknown").family, "general");
  });
});

// Helper: generate for a family via a keyword known to map to it.
function generateCtasForFamily(family: string) {
  const keywords: Record<string, string> = {
    shop: "shop",
    book: "book",
    learn: "learn",
    join: "join",
    download: "download",
    contact: "contact",
    general: "zzz-no-keyword-here",
  };
  return generateCtas(keywords[family]);
}
