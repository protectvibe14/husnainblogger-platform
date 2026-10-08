/**
 * Tests for the Brand Deal Contract Generator pure logic (tool-456).
 *
 * Run: node --test app/tools/creator-business/brand-deal-contract-generator/logic.test.ts
 *
 * All expected clause text is derived from the template logic, never copied
 * from tool output.
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generateContractOutline,
  CONTRACT_DISCLAIMER,
  DEFAULT_REVISION_ROUNDS,
  USAGE_RIGHTS_OPTIONS,
  DELIVERABLE_TYPES,
  runTool,
} from "./logic.ts";

function baseInput() {
  return {
    creatorName: "Ayesha Khan",
    brandName: "GlowCo",
    deliverables: [
      { type: "Instagram Reel" as const, quantity: 2 },
      { type: "Instagram Story" as const, quantity: 3, notes: "poll stickers" },
    ],
    feeAmount: 1500,
    currency: "USD",
    usageRights: "Paid whitelisting (90 days)" as const,
    deliveryStartDate: "2026-11-01",
    deliveryEndDate: "2026-11-30",
    paymentTerms: "50% upfront / 50% on delivery" as const,
  };
}

function headings(r: ReturnType<typeof generateContractOutline>): string[] {
  return r.sections.map((s) => s.heading);
}

describe("generateContractOutline — full contract", () => {
  it("builds all sections with interpolated template clauses", () => {
    const r = generateContractOutline(baseInput());
    assert.strictEqual(
      r.title,
      "Brand Deal Agreement Outline — Ayesha Khan × GlowCo",
    );
    assert.deepStrictEqual(r.parties, {
      creator: "Ayesha Khan",
      brand: "GlowCo",
    });
    assert.deepStrictEqual(headings(r), [
      "Parties",
      "Scope of Work",
      "Compensation",
      "Usage Rights",
      "Timeline",
      "Revisions",
      "Disclosure",
      "Termination",
    ]);

    const scope = r.sections.find((s) => s.heading === "Scope of Work")!;
    assert.deepStrictEqual(scope.clauses, [
      "Creator will produce and publish 2 × Instagram Reel.",
      "Creator will produce and publish 3 × Instagram Story (poll stickers).",
    ]);

    const comp = r.sections.find((s) => s.heading === "Compensation")!;
    assert.ok(
      comp.clauses[0].includes("USD 1500.00"),
      "fee clause must show the amount",
    );
    assert.ok(comp.clauses[1].includes("50% upfront / 50% on delivery"));

    const usage = r.sections.find((s) => s.heading === "Usage Rights")!;
    assert.ok(usage.clauses[0].includes("whitelisted"));
    assert.ok(usage.clauses[0].includes("90 days"));

    const timeline = r.sections.find((s) => s.heading === "Timeline")!;
    assert.ok(timeline.clauses[0].includes("2026-11-01"));
    assert.ok(timeline.clauses[0].includes("2026-11-30"));

    const revisions = r.sections.find((s) => s.heading === "Revisions")!;
    assert.ok(revisions.clauses[0].includes("2 rounds"));

    const disclosure = r.sections.find((s) => s.heading === "Disclosure")!;
    assert.ok(disclosure.clauses[0].includes("#ad"));

    assert.strictEqual(r.disclaimer, CONTRACT_DISCLAIMER);
    assert.ok(r.effectiveSummary.includes("Ayesha Khan"));
    assert.ok(r.effectiveSummary.includes("GlowCo"));
    assert.ok(r.effectiveSummary.includes("USD 1500.00"));
    assert.ok(r.assumptions.length >= 3, "assumptions must be surfaced");
  });

  it("applies defaults: 2 revision rounds and USD", () => {
    const { currency: _currency, ...rest } = baseInput();
    const r = generateContractOutline(rest);
    const revisions = r.sections.find((s) => s.heading === "Revisions")!;
    assert.ok(revisions.clauses[0].includes("2 rounds"));
    assert.ok(
      r.sections
        .find((s) => s.heading === "Compensation")!
        .clauses[0].includes("USD 1500.00"),
    );
    assert.strictEqual(DEFAULT_REVISION_ROUNDS, 2);
  });

  it("renders 0 and 1 revision rounds correctly", () => {
    const zero = generateContractOutline({ ...baseInput(), revisionRounds: 0 });
    assert.ok(
      zero
        .sections.find((s) => s.heading === "Revisions")!
        .clauses[0].includes("No revision rounds are included"),
    );
    const one = generateContractOutline({ ...baseInput(), revisionRounds: 1 });
    assert.ok(
      one
        .sections.find((s) => s.heading === "Revisions")!
        .clauses[0].includes("1 round of reasonable revisions"),
    );
  });
});

describe("generateContractOutline — exclusivity", () => {
  it("adds an Exclusivity section when provided", () => {
    const r = generateContractOutline({
      ...baseInput(),
      exclusivity: { category: "skincare", days: 60 },
    });
    assert.ok(headings(r).includes("Exclusivity"));
    const ex = r.sections.find((s) => s.heading === "Exclusivity")!;
    assert.ok(ex.clauses[0].includes("skincare"));
    assert.ok(ex.clauses[0].includes("60 days"));
  });

  it("warns on very long exclusivity periods", () => {
    const r = generateContractOutline({
      ...baseInput(),
      exclusivity: { category: "skincare", days: 200 },
    });
    assert.ok(r.warnings.some((w) => w.includes("attorney")));
  });
});

describe("generateContractOutline — gifted deals", () => {
  it("treats fee 0 as gifted/product-only with a warning", () => {
    const r = generateContractOutline({ ...baseInput(), feeAmount: 0 });
    const comp = r.sections.find((s) => s.heading === "Compensation")!;
    assert.ok(comp.clauses[0].includes("gifted / product-only"));
    assert.ok(r.warnings.some((w) => w.includes("Fee is 0")));
  });
});

describe("generateContractOutline — usage rights matrix", () => {
  it("maps each option to distinct honest clause text", () => {
    const expectations: Array<[string, string[]]> = [
      ["Organic social only (30 days)", ["30 days from first publication", "No paid amplification"]],
      ["Organic social only (perpetual)", ["in perpetuity", "No paid amplification"]],
      ["Paid whitelisting (30 days)", ["whitelisted", "30 days"]],
      ["Paid whitelisting (90 days)", ["whitelisted", "90 days"]],
      ["Full buyout (perpetual)", ["perpetual, worldwide", "all media"]],
    ];
    assert.strictEqual(USAGE_RIGHTS_OPTIONS.length, 5);
    for (const [option, keywords] of expectations) {
      const r = generateContractOutline({
        ...baseInput(),
        usageRights: option as (typeof USAGE_RIGHTS_OPTIONS)[number],
      });
      const clause = r.sections.find((s) => s.heading === "Usage Rights")!
        .clauses[0];
      for (const kw of keywords) {
        assert.ok(clause.includes(kw), `${option} must mention "${kw}"`);
      }
    }
  });
});

describe("generateContractOutline — money and formatting", () => {
  it("rounds the fee half-up (1499.995 -> USD 1500.00)", () => {
    const r = generateContractOutline({ ...baseInput(), feeAmount: 1499.995 });
    assert.ok(
      r.sections
        .find((s) => s.heading === "Compensation")!
        .clauses[0].includes("USD 1500.00"),
    );
  });

  it("normalizes a lowercase currency code", () => {
    const r = generateContractOutline({ ...baseInput(), currency: "gbp" });
    assert.ok(
      r.sections
        .find((s) => s.heading === "Compensation")!
        .clauses[0].includes("GBP 1500.00"),
    );
  });
});

describe("generateContractOutline — invalid input", () => {
  it("rejects empty party names", () => {
    assert.throws(
      () => generateContractOutline({ ...baseInput(), creatorName: "  " }),
      RangeError,
    );
    assert.throws(
      () => generateContractOutline({ ...baseInput(), brandName: "" }),
      RangeError,
    );
  });

  it("rejects empty or malformed deliverables", () => {
    assert.throws(
      () => generateContractOutline({ ...baseInput(), deliverables: [] }),
      RangeError,
    );
    assert.throws(
      () =>
        generateContractOutline({
          ...baseInput(),
          deliverables: [{ type: "TV Ad" as never, quantity: 1 }],
        }),
      TypeError,
    );
    assert.throws(
      () =>
        generateContractOutline({
          ...baseInput(),
          deliverables: [{ type: "Instagram Reel" as const, quantity: 0 }],
        }),
      RangeError,
    );
    assert.throws(
      () =>
        generateContractOutline({
          ...baseInput(),
          deliverables: [{ type: "Instagram Reel" as const, quantity: 1.5 }],
        }),
      RangeError,
    );
    assert.throws(
      () =>
        generateContractOutline({
          ...baseInput(),
          deliverables: [{ type: "Other" as const, quantity: 1 }],
        }),
      RangeError,
    );
  });

  it("accepts 'Other' deliverables with notes", () => {
    const r = generateContractOutline({
      ...baseInput(),
      deliverables: [{ type: "Other" as const, quantity: 1, notes: "Podcast ad read" }],
    });
    const scope = r.sections.find((s) => s.heading === "Scope of Work")!;
    assert.ok(scope.clauses[0].includes("Podcast ad read"));
  });

  it("rejects negative fees and non-numeric fees", () => {
    assert.throws(
      () => generateContractOutline({ ...baseInput(), feeAmount: -100 }),
      RangeError,
    );
    assert.throws(
      () => generateContractOutline({ ...baseInput(), feeAmount: NaN }),
      TypeError,
    );
  });

  it("rejects unknown usage rights and payment terms", () => {
    assert.throws(
      () =>
        generateContractOutline({ ...baseInput(), usageRights: "Forever everything" as never }),
      TypeError,
    );
    assert.throws(
      () =>
        generateContractOutline({ ...baseInput(), paymentTerms: "Whenever" as never }),
      TypeError,
    );
  });

  it("rejects bad dates and end-before-start windows", () => {
    assert.throws(
      () =>
        generateContractOutline({
          ...baseInput(),
          deliveryStartDate: "2026-11-31",
        }),
      RangeError,
    );
    assert.throws(
      () =>
        generateContractOutline({
          ...baseInput(),
          deliveryStartDate: "2026-12-01",
          deliveryEndDate: "2026-11-01",
        }),
      RangeError,
    );
  });

  it("rejects bad currency, revision rounds, and exclusivity", () => {
    assert.throws(
      () => generateContractOutline({ ...baseInput(), currency: "USDD" }),
      TypeError,
    );
    assert.throws(
      () => generateContractOutline({ ...baseInput(), revisionRounds: -1 }),
      RangeError,
    );
    assert.throws(
      () => generateContractOutline({ ...baseInput(), revisionRounds: 1.5 }),
      RangeError,
    );
    assert.throws(
      () =>
        generateContractOutline({
          ...baseInput(),
          exclusivity: { category: "skincare", days: 0 },
        }),
      RangeError,
    );
    assert.throws(
      () =>
        generateContractOutline({
          ...baseInput(),
          exclusivity: { category: "  ", days: 30 },
        }),
      RangeError,
    );
  });

  it("rejects a non-object input", () => {
    assert.throws(() => generateContractOutline(null as never), TypeError);
  });
});

describe("generateContractOutline — unicode and honesty", () => {
  it("handles unicode names without crashing", () => {
    const r = generateContractOutline({
      ...baseInput(),
      creatorName: "田中クリエイター",
      brandName: "株式会社Glow",
    });
    assert.ok(r.title.includes("田中クリエイター"));
    assert.ok(r.effectiveSummary.includes("株式会社Glow"));
  });

  it("keeps the not-legal-advice disclaimer front and center", () => {
    const r = generateContractOutline(baseInput());
    assert.ok(r.disclaimer.includes("not legal advice"));
    assert.ok(
      r.assumptions.some((a) => a.includes("TEMPLATE")),
      "template nature must be stated",
    );
  });

  it("exposes the fixed option lists", () => {
    assert.ok(DELIVERABLE_TYPES.includes("Instagram Reel"));
    assert.ok(DELIVERABLE_TYPES.includes("Other"));
    assert.strictEqual(USAGE_RIGHTS_OPTIONS.length, 5);
  });
});

function flatValues() {
  return {
    brandName: "GlowCo",
    creatorName: "Ayesha Khan",
    deliverables: "2 x Instagram Reel | launch teaser\n3 x Instagram Story",
    feeAmount: 1500,
    paymentTerms: "50% upfront / 50% on delivery",
    usageRightsSummary: "Paid whitelisting (90 days)",
    timelineDates: "2026-11-01 to 2026-11-30",
    revisionLimit: 2,
    exclusivityClause: "skincare, 90 days",
    killFeePct: 50,
  };
}

describe("runTool — adapter", () => {
  it("builds contract text from flat inputs with the disclaimer in the output", () => {
    const out = runTool(flatValues());
    assert.strictEqual(out.ok, true);
    assert.deepStrictEqual(Object.keys(out.values!).sort(), [
      "contractSummary",
      "contractText",
      "warnings",
    ]);
    const text = out.values!.contractText as string;
    assert.ok(text.includes("Ayesha Khan"), "creator named");
    assert.ok(text.includes("GlowCo"), "brand named");
    assert.ok(text.includes("2 × Instagram Reel"), "deliverable parsed");
    assert.ok(text.includes("launch teaser"), "notes parsed");
    assert.ok(text.includes("Kill fee: 50%"), "kill fee clause added");
    assert.ok(text.includes("USD 750.00"), "kill fee amount computed");
    assert.ok(text.includes(CONTRACT_DISCLAIMER), "disclaimer in output");
    assert.ok(text.includes("Exclusivity"), "exclusivity section present");
    assert.ok(
      (out.values!.contractSummary as string).includes("Ayesha Khan"),
      "summary names parties",
    );
    assert.ok(Array.isArray(out.values!.warnings), "warnings list");
  });

  it("omits the kill fee clause when killFeePct is 0", () => {
    const out = runTool({ ...flatValues(), killFeePct: 0 });
    assert.strictEqual(out.ok, true);
    assert.ok(!(out.values!.contractText as string).includes("Kill fee"), "no kill fee clause");
  });

  it("works without optional inputs", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { exclusivityClause, killFeePct, revisionLimit, ...rest } = flatValues();
    const out = runTool(rest);
    assert.strictEqual(out.ok, true);
    const text = out.values!.contractText as string;
    assert.ok(!text.includes("Exclusivity"), "no exclusivity section");
  });

  it("rejects an unsupported deliverable type with a human error", () => {
    const out = runTool({ ...flatValues(), deliverables: "1 x Spaceship Post" });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("not a supported type"), "human message");
  });

  it("rejects a bad timeline format with a human error", () => {
    const out = runTool({ ...flatValues(), timelineDates: "sometime in November" });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("timelineDates"), "names the field");
  });

  it("rejects missing brandName with a human error", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { brandName, ...rest } = flatValues();
    const out = runTool(rest);
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("brandName"), "names the missing field");
  });

  it("rejects a bad exclusivity format with a human error", () => {
    const out = runTool({ ...flatValues(), exclusivityClause: "skincare forever" });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("exclusivityClause"), "names the field");
  });

  it("rejects killFeePct above 100", () => {
    const out = runTool({ ...flatValues(), killFeePct: 150 });
    assert.strictEqual(out.ok, false);
    assert.ok(out.error!.includes("killFeePct"), "names the field");
  });
});
