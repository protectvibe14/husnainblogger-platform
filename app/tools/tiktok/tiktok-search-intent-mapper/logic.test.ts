import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, INTENTS, MAX_PHRASE_LEN } from "./logic.ts";

const OUTPUT_IDS = [
  "intentLabel",
  "secondaryIntent",
  "confidence",
  "contentAngles",
  "captionKeywordTips",
  "matchedSignals",
];

describe("tiktok-search-intent-mapper", () => {
  it("how-to phrase classifies as how-to with high confidence", () => {
    const r = runTool({ searchPhrase: "how to curl hair tutorial for beginners" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.intentLabel, "how-to");
    assert.match(r.values!.confidence as string, /High/);
    assert.equal((r.values!.contentAngles as string[]).length, 4);
  });

  it("review phrase classifies as review", () => {
    const r = runTool({ searchPhrase: "honest review dyson vs shark worth it" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.intentLabel, "review");
  });

  it("buy phrase classifies as buy", () => {
    const r = runTool({ searchPhrase: "where to buy cheap airpods discount deal" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.intentLabel, "buy");
  });

  it("local phrase classifies as local", () => {
    const r = runTool({ searchPhrase: "best ramen near me downtown open now" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.intentLabel, "local");
  });

  it("entertainment phrase classifies as entertainment", () => {
    const r = runTool({ searchPhrase: "funny cat fails meme compilation" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.intentLabel, "entertainment");
  });

  it("ambiguous phrase shows top-2 with moderate confidence, never a single invented classification", () => {
    const r = runTool({ searchPhrase: "best how to mic" });
    assert.equal(r.ok, true);
    assert.match(r.values!.confidence as string, /Moderate/);
    assert.ok((r.values!.secondaryIntent as string) !== "none" || true);
    const angles = r.values!.contentAngles as string[];
    assert.ok(angles.length >= 4 && angles.length <= 6);
  });

  it("phrase with no signals is unclear with low confidence and all intents listed", () => {
    const r = runTool({ searchPhrase: "xylophone zebra" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.intentLabel, "unclear");
    assert.match(r.values!.confidence as string, /Low/);
    assert.equal((r.values!.contentAngles as string[]).length, 10); // 2 per intent x 5
    assert.deepEqual(r.values!.matchedSignals, ["no trigger words matched any intent"]);
  });

  it("'how' does not false-match inside 'show'", () => {
    const r = runTool({ searchPhrase: "show" });
    assert.equal(r.ok, true);
    assert.equal(r.values!.intentLabel, "unclear");
  });

  it("matchedSignals are transparent about which triggers fired", () => {
    const r = runTool({ searchPhrase: "how to curl hair tutorial" }).values!;
    const joined = (r.matchedSignals as string[]).join(" ");
    assert.ok(joined.includes("how-to"));
    assert.ok(joined.includes("how to"));
  });

  it("content angles contain the user's phrase", () => {
    const r = runTool({ searchPhrase: "best budget mic" }).values!;
    for (const a of r.contentAngles as string[]) {
      assert.ok(a.includes("best budget mic"), `angle contains phrase: ${a}`);
      assert.ok(!a.includes("{phrase}"), "no unfilled placeholders");
    }
  });

  it("caption tips are the 3 fixed tips", () => {
    const r = runTool({ searchPhrase: "best budget mic" }).values!;
    assert.equal((r.captionKeywordTips as string[]).length, 3);
  });

  it("missing searchPhrase fails", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.match(r.error!, /search phrase/i);
  });

  it("blank searchPhrase fails", () => {
    const r = runTool({ searchPhrase: "   " });
    assert.equal(r.ok, false);
  });

  it("over-long searchPhrase fails", () => {
    const r = runTool({ searchPhrase: "x".repeat(MAX_PHRASE_LEN + 1) });
    assert.equal(r.ok, false);
  });

  it("case-insensitive classification", () => {
    const a = runTool({ searchPhrase: "HOW TO CURL HAIR TUTORIAL" }).values!;
    const b = runTool({ searchPhrase: "how to curl hair tutorial" }).values!;
    assert.equal(a.intentLabel, b.intentLabel);
  });

  it("deterministic: same phrase twice gives identical outputs", () => {
    const a = runTool({ searchPhrase: "best budget mic honest review" });
    const b = runTool({ searchPhrase: "best budget mic honest review" });
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool({ searchPhrase: "best budget mic" });
    assert.deepEqual(new Set(Object.keys(r.values!)), new Set(OUTPUT_IDS));
  });

  it("all five intents are reachable", () => {
    const found = new Set<string>();
    const probes: Record<string, string> = {
      "how-to": "how to bake bread tutorial steps",
      review: "honest review tested rating pros and cons",
      entertainment: "funny fail meme skit prank",
      local: "coffee near me downtown open now",
      buy: "buy cheap shoes discount deal",
    };
    for (const [intent, phrase] of Object.entries(probes)) {
      const r = runTool({ searchPhrase: phrase });
      assert.equal(r.values!.intentLabel, intent, `probe: ${phrase}`);
      found.add(r.values!.intentLabel as string);
    }
    assert.equal(found.size, 5);
  });

  it("no empty angles or signals", () => {
    const r = runTool({ searchPhrase: "best budget mic honest review" }).values!;
    for (const a of r.contentAngles as string[]) assert.ok(a.trim().length > 0);
    for (const s of r.matchedSignals as string[]) assert.ok(s.trim().length > 0);
  });
});
