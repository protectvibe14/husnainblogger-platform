import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  generateCarousel,
  CAROUSEL_ANGLES,
  BANK_SIZES,
  MIN_SLIDES,
  MAX_SLIDES,
  ASSUMPTIONS,
  type CarouselAngle,
} from "./logic.ts";

describe("carousel-hook-slide-generator", () => {
  it("normal: hook + value slides + CTA with correct roles", () => {
    const r = generateCarousel("meal prep", "steps", 5);
    assert.equal(r.slides.length, 5);
    assert.equal(r.slides[0].role, "hook");
    assert.equal(r.slides[0].slideNumber, 1);
    assert.equal(r.slides[4].role, "cta");
    assert.equal(r.slides[4].slideNumber, 5);
    for (let i = 1; i < 4; i++) assert.equal(r.slides[i].role, "value");
    assert.equal(r.topic, "meal prep");
    assert.equal(r.angle, "steps");
    assert.equal(r.isTemplateBased, true);
  });

  it("all five angles generate valid outlines", () => {
    for (const angle of CAROUSEL_ANGLES) {
      const r = generateCarousel("fitness", angle, 4);
      assert.equal(r.slides.length, 4, `angle ${angle}`);
      assert.equal(r.slides[0].role, "hook");
      assert.equal(r.slides[3].role, "cta");
    }
  });

  it("topic is inserted, no leftover placeholders", () => {
    const r = generateCarousel("email marketing", "myth", 6);
    for (const s of r.slides) {
      // hook + value slides carry the topic; the shared CTA is generic
      if (s.role !== "cta") assert.ok(s.text.includes("email marketing"), s.text);
      assert.ok(!s.text.includes("{topic}"), s.text);
      assert.ok(!s.text.includes("{n}"), s.text);
    }
  });

  it("{n} is the 1-based value-slide number", () => {
    const r = generateCarousel("x", "mistake", 5);
    assert.ok(r.slides[1].text.includes("#1"));
    assert.ok(r.slides[2].text.includes("#2"));
    assert.ok(r.slides[3].text.includes("#3"));
  });

  it("every slide has a format hint", () => {
    const r = generateCarousel("x", "list", 7);
    for (const s of r.slides) {
      assert.ok(s.formatHint.length > 0);
    }
    assert.ok(r.slides[0].formatHint.includes("scroll"));
    assert.ok(r.slides[6].formatHint.includes("call-to-action"));
  });

  it("empty/blank topic throws", () => {
    assert.throws(() => generateCarousel("", "steps", 5), /non-empty/);
    assert.throws(() => generateCarousel("   ", "steps", 5), /non-empty/);
  });

  it("non-string topic throws", () => {
    assert.throws(() => generateCarousel(9 as unknown as string, "steps", 5));
  });

  it("unknown angle throws and lists valid angles", () => {
    assert.throws(() => generateCarousel("x", "rant", 5), /unknown carousel angle/);
    try {
      generateCarousel("x", "rant", 5);
      assert.fail("should have thrown");
    } catch (e) {
      assert.ok((e as Error).message.includes("mistake"));
    }
  });

  it("slideCount below MIN or above MAX throws", () => {
    assert.throws(() => generateCarousel("x", "steps", 2), /between 3 and 10/);
    assert.throws(() => generateCarousel("x", "steps", 11), /between 3 and 10/);
    assert.throws(() => generateCarousel("x", "steps", 0), /between 3 and 10/);
  });

  it("non-integer slideCount throws", () => {
    assert.throws(() => generateCarousel("x", "steps", 4.5), /integer/);
  });

  it("boundary counts 3 and 10 work", () => {
    const min = generateCarousel("x", "story", MIN_SLIDES);
    assert.equal(min.slides.length, 3);
    assert.equal(min.slides[1].role, "value");
    const max = generateCarousel("x", "story", MAX_SLIDES);
    assert.equal(max.slides.length, 10);
    assert.equal(max.slides.filter((s) => s.role === "value").length, 8);
  });

  it("at max slides, all 8 value templates are used exactly once (cycling is defensive)", () => {
    // 8 value slides == bank size: indices 0..7, no wrap yet at 10 total
    const r = generateCarousel("y", "list", 10);
    const texts = r.slides.filter((s) => s.role === "value").map((s) => s.text);
    assert.equal(new Set(texts).size, 8); // all unique at exactly bank size
  });

  it("slide numbers are sequential 1..N", () => {
    const r = generateCarousel("x", "myth", 8);
    assert.deepEqual(
      r.slides.map((s) => s.slideNumber),
      [1, 2, 3, 4, 5, 6, 7, 8]
    );
  });

  it("bank sizes documented: 5 hooks + 8 values per angle, 3 shared CTAs, 68 total", () => {
    assert.equal(BANK_SIZES.hookPerAngle, 5);
    assert.equal(BANK_SIZES.valuePerAngle, 8);
    assert.equal(BANK_SIZES.ctaShared, 3);
    assert.equal(BANK_SIZES.angles, 5);
    assert.equal(BANK_SIZES.total, 68);
    assert.deepEqual(generateCarousel("x", "steps", 3).bankSizes, BANK_SIZES);
  });

  it("generation is deterministic", () => {
    const a = generateCarousel("z", "mistake", 6);
    const b = generateCarousel("z", "mistake", 6);
    assert.deepEqual(
      a.slides.map((s) => s.text),
      b.slides.map((s) => s.text)
    );
  });

  it("topic is trimmed", () => {
    const r = generateCarousel("  skincare  ", "list", 3);
    assert.equal(r.topic, "skincare");
  });

  it("unicode topic inserted verbatim", () => {
    const r = generateCarousel("寿司の作り方 🍣", "story", 4);
    assert.ok(r.slides[0].text.includes("寿司の作り方 🍣"));
  });

  it("assumptions disclose template-based, non-AI nature", () => {
    const r = generateCarousel("x", "myth", 3);
    assert.deepEqual(r.assumptions, ASSUMPTIONS);
    assert.ok(r.assumptions.some((a) => a.includes("68 hand-written")));
    assert.ok(r.assumptions.some((a) => a.includes("not AI")));
  });

  it("angle is case-sensitive: 'Steps' is unknown", () => {
    assert.throws(
      () => generateCarousel("x", "Steps" as unknown as CarouselAngle, 4),
      /unknown carousel angle/
    );
  });

  it("hook slide uses the angle's first hook template", () => {
    const steps = generateCarousel("bread", "steps", 3);
    const myth = generateCarousel("bread", "myth", 3);
    assert.notEqual(steps.slides[0].text, myth.slides[0].text);
  });
});
