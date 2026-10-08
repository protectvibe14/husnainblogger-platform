import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  looksLikeUrl,
  codePoints,
  TONES,
  SUBJECT_PATTERNS,
  INTRO_TEMPLATES,
  CTA_BLOCK,
  MAX_CONTENT_CHARS,
  MAX_SECTIONS,
  MIN_WORDS,
  DEFAULT_EXCERPT_WORDS,
  MIN_EXCERPT_WORDS,
  MAX_EXCERPT_WORDS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

const SAMPLE_POST = [
  "# How I Plan My Week",
  "",
  "I plan my week every Sunday evening with a simple three-step system that takes about twenty minutes and saves me hours of decision fatigue during the week.",
  "",
  "## Step 1: Brain Dump",
  "",
  "Write everything down on paper or in your notes app. Every task, every errand, every idea — get it all out of your head so you can see the full picture clearly.",
  "",
  "## Step 2: Prioritize Ruthlessly",
  "",
  "Pick exactly three outcomes that would make the week a win. Everything else is a bonus. This single constraint forces real trade-offs and keeps you focused.",
  "",
  "## Step 3: Time Block",
  "",
  "Assign each outcome a calendar block. If it has no time, it has no chance. Protect the blocks like meetings with your most important client.",
].join("\n");

function goodValues(extra: Record<string, unknown> = {}) {
  return {
    blogContent: SAMPLE_POST,
    excerptWords: 50,
    tone: "playful",
    ...extra,
  };
}

describe("blog-to-newsletter-converter", () => {
  it("happy path returns all five outputs", () => {
    const r = runTool(goodValues());
    assert.equal(r.ok, true);
    assert.ok(Array.isArray(r.values!.subjectOptions));
    assert.equal(typeof r.values!.introParagraph, "string");
    assert.ok(Array.isArray(r.values!.sections));
    assert.equal(typeof r.values!.ctaBlock, "string");
    assert.ok(Array.isArray(r.values!.notices));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(goodValues());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [...OUTPUT_IDS].sort());
  });

  it("deterministic: same inputs produce identical output", () => {
    assert.deepEqual(runTool(goodValues()), runTool(goodValues()));
  });

  it("extracts title, headings, and verbatim excerpts", () => {
    const r = runTool(goodValues());
    const sections = r.values!.sections as { heading: string; excerpt: string }[];
    assert.ok(sections.length >= 4, `expected 4 sections, got ${sections.length}`);
    // the markdown title becomes the first section, holding the intro body
    assert.equal(sections[0].heading, "How I Plan My Week");
    assert.ok(sections.some((s) => s.heading.includes("Brain Dump")));
    for (const s of sections) {
      const wc = s.excerpt.replace("…", "").split(/\s+/).filter(Boolean).length;
      assert.ok(wc <= 50, `excerpt too long: ${wc} words`);
      // excerpts are verbatim slices of the input
      assert.ok(SAMPLE_POST.includes(s.excerpt.replace("…", "").slice(0, 20)));
    }
  });

  it("intro uses the post title and chosen tone", () => {
    const r = runTool(goodValues({ tone: "professional" }));
    const intro = r.values!.introParagraph as string;
    assert.ok(intro.includes("How I Plan My Week"));
    assert.equal(intro, INTRO_TEMPLATES.professional.replaceAll("{title}", "How I Plan My Week"));
  });

  it("five subject options from fixed patterns", () => {
    const r = runTool(goodValues());
    const subjects = r.values!.subjectOptions as string[];
    assert.equal(subjects.length, SUBJECT_PATTERNS.length);
    for (const s of subjects) {
      assert.ok(s.length > 0);
      assert.ok(!s.includes("{title}"), "template token must be filled");
    }
  });

  it("cta block is the fixed template", () => {
    const r = runTool(goodValues());
    assert.equal(r.values!.ctaBlock, CTA_BLOCK);
    assert.ok((r.values!.ctaBlock as string).includes("[PASTE YOUR POST URL]"));
  });

  it("https URL input is rejected with a clear paste-text message", () => {
    const r = runTool(goodValues({ blogContent: "https://example.com/my-post" }));
    assert.equal(r.ok, false);
    assert.match(r.error!, /pasted text only/i);
    assert.match(r.error!, /CORS/i);
  });

  it("www URL input is rejected", () => {
    const r = runTool(goodValues({ blogContent: "www.example.com/my-post" }));
    assert.equal(r.ok, false);
    assert.match(r.error!, /pasted text only/i);
  });

  it("bare-domain URL input is rejected", () => {
    const r = runTool(goodValues({ blogContent: "example.com/my-post" }));
    assert.equal(r.ok, false);
    assert.match(r.error!, /pasted text only/i);
  });

  it("looksLikeUrl helper behaves", () => {
    assert.equal(looksLikeUrl("https://x.com"), true);
    assert.equal(looksLikeUrl("http://x.com/a"), true);
    assert.equal(looksLikeUrl("www.x.com"), true);
    assert.equal(looksLikeUrl("blog.example.com/post-1"), true);
    assert.equal(looksLikeUrl("This is a normal sentence about blogging."), false);
    assert.equal(looksLikeUrl("# A heading"), false);
  });

  it("missing blogContent errors", () => {
    const r = runTool(goodValues({ blogContent: undefined }));
    assert.equal(r.ok, false);
    assert.match(r.error!, /paste/i);
  });

  it("whitespace-only blogContent errors", () => {
    const r = runTool(goodValues({ blogContent: "   \n  " }));
    assert.equal(r.ok, false);
  });

  it("too-short content errors", () => {
    const r = runTool(goodValues({ blogContent: "Too short." }));
    assert.equal(r.ok, false);
    assert.match(r.error!, new RegExp(String(MIN_WORDS)));
  });

  it("excerptWords defaults to 150 when omitted", () => {
    const { excerptWords: _omit, ...rest } = goodValues();
    const r = runTool(rest);
    assert.equal(r.ok, true);
    const sections = r.values!.sections as { excerpt: string }[];
    for (const s of sections) {
      const wc = s.excerpt.replace("…", "").split(/\s+/).filter(Boolean).length;
      assert.ok(wc <= DEFAULT_EXCERPT_WORDS);
    }
  });

  it("excerptWords below minimum clamps to 20", () => {
    const r = runTool(goodValues({ excerptWords: 1 }));
    assert.equal(r.ok, true);
    const sections = r.values!.sections as { excerpt: string }[];
    for (const s of sections) {
      const wc = s.excerpt.replace("…", "").split(/\s+/).filter(Boolean).length;
      assert.ok(wc <= MIN_EXCERPT_WORDS);
    }
  });

  it("excerptWords above maximum clamps to 500", () => {
    const r = runTool(goodValues({ excerptWords: 9999 }));
    assert.equal(r.ok, true); // clamps, does not error
  });

  it("excerptWords NaN errors", () => {
    const r = runTool(goodValues({ excerptWords: NaN }));
    assert.equal(r.ok, false);
  });

  it("invalid tone errors and lists valid tones", () => {
    const r = runTool(goodValues({ tone: "formal" }));
    assert.equal(r.ok, false);
    assert.match(r.error!, /playful/);
  });

  it("overlong content truncated with a visible notice", () => {
    const filler = "word ".repeat(6000); // ~30000 chars
    const r = runTool(goodValues({ blogContent: SAMPLE_POST + "\n\n" + filler }));
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes("shortened")));
  });

  it("emoji length measured in code points", () => {
    assert.equal(codePoints("📧📧"), 2);
    assert.equal(codePoints("a🎉b"), 3);
  });

  it("more than 8 sections capped with a notice", () => {
    const manySections = ["# Big Post", "", "Intro paragraph with enough words to pass the minimum word count requirement easily and then some more words here."]
      .concat(
        Array.from({ length: 10 }, (_, i) => [
          "",
          `## Section ${i + 1}`,
          "",
          "Body text with enough words to make this a real section body that will be excerpted by the converter tool properly.",
        ].join("\n")),
      )
      .join("\n");
    const r = runTool(goodValues({ blogContent: manySections }));
    assert.equal(r.ok, true);
    const sections = r.values!.sections as unknown[];
    assert.equal(sections.length, MAX_SECTIONS);
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes(String(MAX_SECTIONS))));
  });

  it("duplicate headings get a continued label", () => {
    const dup = [
      "# Dup Post",
      "",
      "Intro paragraph with enough words to pass the minimum word count requirement easily and then some more words here for safety.",
      "",
      "## Tips",
      "",
      "First tips body with enough words to be a real section body for the converter to excerpt properly and fully.",
      "",
      "## Tips",
      "",
      "Second tips body with enough words to be a real section body for the converter to excerpt properly and fully.",
    ].join("\n");
    const r = runTool(goodValues({ blogContent: dup }));
    assert.equal(r.ok, true);
    const sections = r.values!.sections as { heading: string }[];
    const tips = sections.filter((s) => s.heading.startsWith("Tips"));
    assert.equal(tips.length, 2);
    assert.ok(tips.some((s) => s.heading.includes("(continued)")));
  });

  it("HTML brackets stripped from excerpts", () => {
    const r = runTool(
      goodValues({
        blogContent: SAMPLE_POST.replace("Brain Dump", "<b>Brain Dump</b>"),
      }),
    );
    assert.equal(r.ok, true);
    const sections = r.values!.sections as { heading: string; excerpt: string }[];
    for (const s of sections) {
      assert.ok(!s.heading.includes("<b>") && !s.excerpt.includes("<b>"));
    }
  });

  it("all five tones produce intros", () => {
    for (const tone of TONES) {
      const r = runTool(goodValues({ tone }));
      assert.equal(r.ok, true);
      assert.ok((r.values!.introParagraph as string).length > 0);
    }
  });

  it("null values object errors", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });

  it("template bank sizes match documentation", () => {
    assert.equal(SUBJECT_PATTERNS.length, 5);
    assert.equal(Object.keys(INTRO_TEMPLATES).length, 5);
    assert.ok(MAX_CONTENT_CHARS >= 10000);
  });
});
