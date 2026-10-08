/**
 * Tests for the Thank You Page Copy Generator pure logic (tool-431).
 *
 * Run: node --test app/tools/email-marketing/thank-you-page-copy-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  pickDistinct,
  collapseDuplicateWords,
  HEADLINE_PATTERNS,
  BODY_PATTERNS,
  NEXT_STEP_CTA_PATTERNS,
  TONE_INTROS,
  TONES,
  TONE_LABELS,
  HEADLINE_OPTIONS,
  MAX_ACTION_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs, content as metaContent } from "./meta.ts";

const VALID = {
  completedAction: "newsletter signup",
  nextStep: "confirm your email",
  brand: "Acme Blog",
  tone: "warm",
};

interface CopyValues {
  headlines: string[];
  body: string;
  nextCta: string;
  notices: string[];
}

function copyOf(r: { ok: boolean; values?: Record<string, unknown> }): CopyValues {
  assert.strictEqual(r.ok, true);
  return r.values as unknown as CopyValues;
}

describe("runTool — happy path", () => {
  it("returns 3 headlines, a body draft, a CTA, and no notices", () => {
    const v = copyOf(runTool({ ...VALID }));
    assert.strictEqual(v.headlines.length, HEADLINE_OPTIONS);
    assert.ok(v.body.length > 0);
    assert.ok(v.nextCta.length > 0);
    assert.deepStrictEqual(v.notices, []);
  });

  it("fills every input into the outputs with no leftover placeholders", () => {
    const v = copyOf(runTool({ ...VALID }));
    const all = [...v.headlines, v.body, v.nextCta].join(" ");
    assert.ok(all.includes("newsletter signup"), "action appears");
    assert.ok(all.includes("confirm your email"), "next step appears");
    assert.ok(all.includes("Acme Blog"), "brand appears");
    for (const p of ["{completedAction}", "{nextStep}", "{brand}"]) {
      assert.ok(!all.includes(p), `no leftover ${p}`);
    }
  });

  it("prefixes the body with the tone's opening line", () => {
    for (const tone of TONES) {
      const v = copyOf(runTool({ ...VALID, tone }));
      assert.ok(v.body.startsWith(TONE_INTROS[tone]), `tone ${tone}`);
    }
  });

  it("picks distinct headline patterns", () => {
    const v = copyOf(runTool({ ...VALID }));
    assert.strictEqual(new Set(v.headlines).size, v.headlines.length);
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing completedAction", () => {
    const r = runTool({ nextStep: "x", brand: "y", tone: "warm" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /completed action/i);
  });

  it("rejects whitespace-only completedAction", () => {
    const r = runTool({ completedAction: " ", nextStep: "x", brand: "y", tone: "warm" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects missing nextStep", () => {
    const r = runTool({ completedAction: "x", brand: "y", tone: "warm" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /next step/i);
  });

  it("rejects missing brand", () => {
    const r = runTool({ completedAction: "x", nextStep: "y", tone: "warm" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /brand/i);
  });

  it("rejects missing tone", () => {
    const r = runTool({ completedAction: "x", nextStep: "y", brand: "z" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /tone/i);
  });

  it("rejects an unknown tone", () => {
    const r = runTool({ ...VALID, tone: "sarcastic" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /tone/i);
  });

  it("rejects a non-string brand", () => {
    const r = runTool({ ...VALID, brand: 123 });
    assert.strictEqual(r.ok, false);
  });
});

describe("runTool — edge cases", () => {
  it("is deterministic: same inputs give identical output", () => {
    assert.deepStrictEqual(runTool({ ...VALID }), runTool({ ...VALID }));
  });

  it("different tones change the body intro", () => {
    const a = copyOf(runTool({ ...VALID, tone: "friendly" }));
    const b = copyOf(runTool({ ...VALID, tone: "playful" }));
    assert.ok(a.body.startsWith(TONE_INTROS["friendly"]));
    assert.ok(b.body.startsWith(TONE_INTROS["playful"]));
  });

  it("truncates overlong action with a visible notice", () => {
    const long = "a".repeat(MAX_ACTION_CHARS + 25);
    const v = copyOf(runTool({ ...VALID, completedAction: long }));
    assert.strictEqual(v.notices.length, 1);
    assert.match(
      v.notices[0],
      new RegExp(`shortened from ${MAX_ACTION_CHARS + 25} to ${MAX_ACTION_CHARS}`),
    );
  });

  it("measures input length in code points (emoji count as one)", () => {
    const v = copyOf(runTool({ ...VALID, brand: "🎉".repeat(10) }));
    assert.deepStrictEqual(v.notices, []);
  });

  it("escapes HTML in user inputs", () => {
    const v = copyOf(runTool({ ...VALID, brand: "<b>Acme</b>" }));
    const all = [...v.headlines, v.body].join(" ");
    assert.ok(!all.includes("<b>"), all);
    assert.ok(all.includes("&lt;b&gt;"), all);
  });

  it("handles RTL input without errors", () => {
    const v = copyOf(runTool({ completedAction: "اشتراک", nextStep: "ایمیل کی تصدیق", brand: "Acme", tone: "warm" }));
    assert.ok(v.body.includes("اشتراک"));
  });

  it("collapses duplicate words when inputs repeat pattern words", () => {
    const v = copyOf(runTool({ ...VALID, completedAction: "Confirmed" }));
    for (const s of v.headlines) {
      assert.ok(!/confirmed confirmed/i.test(s), s);
    }
  });
});

describe("pickDistinct — unit", () => {
  it("returns distinct patterns for coprime strides", () => {
    const out = pickDistinct(HEADLINE_PATTERNS, 5, 7, 3);
    assert.strictEqual(out.length, 3);
    assert.strictEqual(new Set(out).size, 3);
  });
});

describe("collapseDuplicateWords — unit", () => {
  it("collapses consecutive repeats case-insensitively", () => {
    assert.strictEqual(collapseDuplicateWords("Thank thank you"), "Thank you");
  });
});

describe("bank bounds", () => {
  it("banks have documented sizes with placeholders", () => {
    assert.strictEqual(HEADLINE_PATTERNS.length, 16);
    assert.strictEqual(BODY_PATTERNS.length, 8);
    assert.strictEqual(NEXT_STEP_CTA_PATTERNS.length, 8);
    assert.strictEqual(Object.keys(TONE_INTROS).length, 4);
    for (const tone of TONES) {
      assert.ok(TONE_INTROS[tone].length > 0);
      assert.ok(TONE_LABELS[tone].length > 0);
    }
    assert.ok(HEADLINE_PATTERNS.some((p) => p.includes("{completedAction}")));
    assert.ok(BODY_PATTERNS.every((p) => p.includes("{completedAction}") && p.includes("{nextStep}") && p.includes("{brand}")));
    assert.ok(NEXT_STEP_CTA_PATTERNS.every((p) => p.includes("{nextStep}")));
  });
});

describe("meta contract", () => {
  it("output ids match meta outputs", () => {
    assert.deepStrictEqual(
      metaOutputs.map((o) => o.id),
      ["headlines", "body", "nextCta", "notices"],
    );
  });

  it("title is <= 60 chars and description is 140–160 chars", () => {
    assert.ok(metaContent.title.length <= 60, metaContent.title);
    assert.ok(
      metaContent.description.length >= 140 && metaContent.description.length <= 160,
      `${metaContent.description.length}: ${metaContent.description}`,
    );
  });

  it("jsonLd has SoftwareApplication, no FAQPage, correct breadcrumb", () => {
    const jsonLd = metaContent.jsonLd as Array<Record<string, unknown>>;
    const types = jsonLd.map((j) => j["@type"]);
    assert.ok(types.includes("SoftwareApplication"));
    assert.ok(!types.includes("FAQPage"));
    const bc = jsonLd.find((j) => j["@type"] === "BreadcrumbList") as {
      itemListElement: Array<{ position: number; name: string; item: string }>;
    };
    const crumb3 = bc.itemListElement.find((e) => e.position === 3);
    assert.strictEqual(crumb3!.name, "Email Marketing Tools");
    const app = jsonLd.find((j) => j["@type"] === "SoftwareApplication") as { url: string };
    assert.strictEqual(
      app.url,
      "https://husnainblogger.com/tools/email-marketing/thank-you-page-copy-generator/",
    );
  });
});
