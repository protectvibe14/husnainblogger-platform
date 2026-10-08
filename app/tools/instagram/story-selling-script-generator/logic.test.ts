/**
 * Tests for the Story Selling Script Generator.
 * Run: node --test app/tools/instagram/story-selling-script-generator/logic.test.ts
 * Zero dependencies: node:test + node:assert only.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, OBJECTIONS, MAX_SLIDE_CHARS } from "./logic.ts";

const GOOD = { product: "Glow Serum", price: "$29", objection: "price" };

describe("story-selling-script-generator", () => {
  it("happy path: returns ok with all five output ids", () => {
    const r = runTool(GOOD);
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [
      "scriptCta",
      "scriptHook",
      "scriptOffer",
      "scriptStory",
      "slideBreakdown",
    ]);
  });

  it("script parts contain the product name", () => {
    const r = runTool(GOOD).values!;
    for (const id of ["scriptHook", "scriptStory", "scriptOffer", "scriptCta"]) {
      assert.ok((r[id] as string).includes("Glow Serum"), id);
      assert.ok(!(r[id] as string).includes("{product}"), `${id} has no raw placeholder`);
    }
  });

  it("price is woven into the offer line when provided", () => {
    assert.ok((runTool(GOOD).values!.scriptOffer as string).includes("$29"));
  });

  it("offer line has no dangling price text when price omitted", () => {
    const r = runTool({ product: "Glow Serum", objection: "price" }).values!;
    assert.ok(!(r.scriptOffer as string).includes("{pricePart}"));
    assert.ok(!(r.scriptOffer as string).includes("for just  —") && !(r.scriptOffer as string).includes("for just —"));
  });

  it("every objection produces a full, non-empty script", () => {
    for (const objection of OBJECTIONS) {
      const r = runTool({ ...GOOD, objection });
      assert.equal(r.ok, true, objection);
      for (const id of ["scriptHook", "scriptStory", "scriptOffer", "scriptCta"]) {
        assert.ok((r.values![id] as string).length > 10, `${objection}/${id}`);
      }
      assert.equal((r.values!.slideBreakdown as string[]).length, 6, objection);
    }
  });

  it("slide breakdown has 6 labeled slides with sticker suggestions", () => {
    const slides = runTool(GOOD).values!.slideBreakdown as string[];
    assert.equal(slides.length, 6);
    const labels = ["Hook", "Problem", "Story", "Offer", "Objection reframe", "Call to action"];
    labels.forEach((label, i) => {
      assert.ok(slides[i].includes(`Slide ${i + 1}/6`), `slide ${i + 1} numbering`);
      assert.ok(slides[i].includes(label), `slide ${i + 1} label`);
      assert.ok(slides[i].includes("Sticker:"), `slide ${i + 1} sticker`);
    });
  });

  it("no slide exceeds the char cap", () => {
    for (const objection of OBJECTIONS) {
      const slides = runTool({ product: "P".repeat(60), price: "$".repeat(30), objection }).values!.slideBreakdown as string[];
      for (const s of slides) assert.ok(s.length <= MAX_SLIDE_CHARS, `${objection}: ${s.length}`);
    }
  });

  it("unknown objection falls back to price", () => {
    const a = runTool({ ...GOOD, objection: "nope" });
    const b = runTool({ ...GOOD, objection: "price" });
    assert.deepEqual(a, b);
  });

  it("objection omitted defaults to price", () => {
    assert.deepEqual(runTool({ product: "Glow Serum", price: "$29" }), runTool({ ...GOOD }));
  });

  it("missing product -> error", () => {
    const r = runTool({ price: "$29", objection: "trust" });
    assert.equal(r.ok, false);
    assert.ok(/product/i.test(r.error!));
  });

  it("whitespace-only product -> error", () => {
    assert.equal(runTool({ product: "   " }).ok, false);
  });

  it("product over 60 chars -> error; 60 chars -> ok", () => {
    assert.equal(runTool({ product: "P".repeat(61) }).ok, false);
    assert.equal(runTool({ product: "P".repeat(60) }).ok, true);
  });

  it("price over 30 chars -> error", () => {
    assert.equal(runTool({ product: "Glow Serum", price: "$".repeat(31) }).ok, false);
  });

  it("determinism: same inputs -> identical outputs", () => {
    assert.deepEqual(runTool(GOOD), runTool({ ...GOOD }));
  });

  it("variant pick is deterministic by product length (length % 3)", () => {
    const norm = (s: string, product: string) => s.split(product).join("{P}");
    const a = runTool({ product: "ABC", objection: "trust" }); // 3 % 3 = 0
    const b = runTool({ product: "ABCDEF", objection: "trust" }); // 6 % 3 = 0
    const c = runTool({ product: "ABCD", objection: "trust" }); // 4 % 3 = 1
    assert.equal(
      norm(a.values!.scriptHook as string, "ABC"),
      norm(b.values!.scriptHook as string, "ABCDEF"),
      "same length%3 -> same variant frame",
    );
    assert.notDeepEqual(
      norm(a.values!.scriptHook as string, "ABC"),
      norm(c.values!.scriptHook as string, "ABCD"),
      "different length%3 -> different variant frame",
    );
  });

  it("price text does not leak raw placeholders", () => {
    const r = runTool({ product: "X", price: "  ", objection: "timing" }).values!;
    assert.ok(!(r.scriptOffer as string).includes("{pricePart}"));
  });

  it("different products give different scripts (bank lookup, not static text)", () => {
    const a = runTool({ product: "Glow Serum", objection: "need" }).values!.scriptHook;
    const b = runTool({ product: "Yoga Mat", objection: "need" }).values!.scriptHook;
    assert.notDeepEqual(a, b);
  });
});
