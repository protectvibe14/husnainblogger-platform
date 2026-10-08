/**
 * Tests for the Email Signup Copy Generator pure logic (tool-430).
 *
 * Run: node --test app/tools/email-marketing/email-signup-copy-generator/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  pickDistinct,
  collapseDuplicateWords,
  HEADLINE_PATTERNS,
  SUBTEXT_PATTERNS,
  BUTTON_PATTERNS,
  PLACEMENTS,
  TONES,
  HEADLINE_OPTIONS,
  SUBTEXT_OPTIONS,
  BUTTON_OPTIONS,
  MAX_INCENTIVE_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs, content as metaContent } from "./meta.ts";

const VALID = {
  incentive: "free SEO checklist",
  placement: "popup",
  tone: "friendly",
};

interface CopyValues {
  headlines: string[];
  subtexts: string[];
  buttons: string[];
  notices: string[];
}

function copyOf(r: { ok: boolean; values?: Record<string, unknown> }): CopyValues {
  assert.strictEqual(r.ok, true);
  return r.values as unknown as CopyValues;
}

describe("runTool — happy path", () => {
  it("returns the documented option counts", () => {
    const v = copyOf(runTool({ ...VALID }));
    assert.strictEqual(v.headlines.length, HEADLINE_OPTIONS);
    assert.strictEqual(v.subtexts.length, SUBTEXT_OPTIONS);
    assert.strictEqual(v.buttons.length, BUTTON_OPTIONS);
    assert.deepStrictEqual(v.notices, []);
  });

  it("fills the incentive into every option with no leftover placeholders", () => {
    const v = copyOf(runTool({ ...VALID }));
    const all = [...v.headlines, ...v.subtexts, ...v.buttons].join(" ");
    assert.ok(all.includes("free SEO checklist"));
    assert.ok(!all.includes("{incentive}"), "no unfilled placeholder");
    for (const s of [...v.headlines, ...v.subtexts, ...v.buttons]) {
      assert.ok(s.length > 0, "no empty option");
    }
  });

  it("picks distinct options within each list", () => {
    const v = copyOf(runTool({ ...VALID }));
    assert.strictEqual(new Set(v.headlines).size, v.headlines.length);
    assert.strictEqual(new Set(v.subtexts).size, v.subtexts.length);
    assert.strictEqual(new Set(v.buttons).size, v.buttons.length);
  });

  it("accepts every placement and tone", () => {
    for (const placement of PLACEMENTS) {
      for (const tone of TONES) {
        const r = runTool({ incentive: "x", placement, tone });
        assert.strictEqual(r.ok, true, `${placement}/${tone}`);
      }
    }
  });
});

describe("runTool — validation errors", () => {
  it("rejects missing incentive", () => {
    const r = runTool({ placement: "popup", tone: "friendly" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /incentive/i);
  });

  it("rejects whitespace-only incentive", () => {
    const r = runTool({ incentive: "  ", placement: "popup", tone: "friendly" });
    assert.strictEqual(r.ok, false);
  });

  it("rejects missing placement", () => {
    const r = runTool({ incentive: "x", tone: "friendly" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /placement/i);
  });

  it("rejects an unknown placement", () => {
    const r = runTool({ incentive: "x", placement: "banner", tone: "friendly" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /placement/i);
  });

  it("rejects missing tone", () => {
    const r = runTool({ incentive: "x", placement: "popup" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /tone/i);
  });

  it("rejects an unknown tone", () => {
    const r = runTool({ incentive: "x", placement: "popup", tone: "angry" });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /tone/i);
  });

  it("rejects a non-string incentive", () => {
    const r = runTool({ incentive: 42, placement: "popup", tone: "friendly" });
    assert.strictEqual(r.ok, false);
  });
});

describe("runTool — edge cases", () => {
  it("is deterministic: same inputs give identical output", () => {
    assert.deepStrictEqual(runTool({ ...VALID }), runTool({ ...VALID }));
  });

  it("different tones produce different selections", () => {
    const a = copyOf(runTool({ ...VALID, tone: "friendly" }));
    const b = copyOf(runTool({ ...VALID, tone: "urgent" }));
    assert.notDeepStrictEqual(a.headlines, b.headlines);
  });

  it("different placements produce different selections", () => {
    const a = copyOf(runTool({ ...VALID, placement: "popup" }));
    const b = copyOf(runTool({ ...VALID, placement: "sidebar" }));
    assert.notDeepStrictEqual(a.buttons, b.buttons);
  });

  it("truncates overlong incentive with a visible notice", () => {
    const long = "i".repeat(MAX_INCENTIVE_CHARS + 30);
    const v = copyOf(runTool({ ...VALID, incentive: long }));
    assert.strictEqual(v.notices.length, 1);
    assert.match(
      v.notices[0],
      new RegExp(`shortened from ${MAX_INCENTIVE_CHARS + 30} to ${MAX_INCENTIVE_CHARS}`),
    );
  });

  it("measures incentive length in code points (emoji count as one)", () => {
    const v = copyOf(runTool({ ...VALID, incentive: "🎁".repeat(20) }));
    assert.deepStrictEqual(v.notices, [], "20 code points is within the cap");
  });

  it("escapes HTML in the incentive", () => {
    const v = copyOf(runTool({ ...VALID, incentive: "<img src=x onerror=y>" }));
    for (const s of v.headlines) {
      assert.ok(!s.includes("<img"), s);
      assert.ok(s.includes("&lt;img"), s);
    }
  });

  it("collapses duplicate words when the incentive ends in the pattern's word", () => {
    const v = copyOf(runTool({ ...VALID, incentive: "Free Download" }));
    for (const s of v.headlines) {
      assert.ok(!/free download free download/i.test(s), s);
    }
  });
});

describe("pickDistinct — unit", () => {
  it("returns n distinct entries for coprime strides", () => {
    const out = pickDistinct(HEADLINE_PATTERNS, 7, 3, 4);
    assert.strictEqual(out.length, 4);
    assert.strictEqual(new Set(out).size, 4);
  });

  it("is stable for the same start", () => {
    assert.deepStrictEqual(pickDistinct(BUTTON_PATTERNS, 5, 2, 5), pickDistinct(BUTTON_PATTERNS, 5, 2, 5));
  });
});

describe("collapseDuplicateWords — unit", () => {
  it("collapses consecutive repeats only", () => {
    assert.strictEqual(collapseDuplicateWords("Get the the Guide"), "Get the Guide");
    assert.strictEqual(collapseDuplicateWords("one two two three"), "one two three");
  });
});

describe("bank bounds", () => {
  it("banks have documented sizes and non-empty patterns", () => {
    assert.strictEqual(HEADLINE_PATTERNS.length, 20);
    assert.strictEqual(SUBTEXT_PATTERNS.length, 14);
    assert.strictEqual(BUTTON_PATTERNS.length, 16);
    for (const p of [...HEADLINE_PATTERNS, ...SUBTEXT_PATTERNS, ...BUTTON_PATTERNS]) {
      assert.ok(p.length > 0);
    }
  });

  it("select options are exactly the documented enums", () => {
    assert.deepStrictEqual([...PLACEMENTS], ["popup", "inline", "landing", "sidebar"]);
    assert.deepStrictEqual([...TONES], ["friendly", "professional", "playful", "urgent"]);
  });
});

describe("meta contract", () => {
  it("output ids match meta outputs", () => {
    assert.deepStrictEqual(
      metaOutputs.map((o) => o.id),
      ["headlines", "subtexts", "buttons", "notices"],
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
      "https://husnainblogger.com/tools/email-marketing/email-signup-copy-generator/",
    );
  });
});
