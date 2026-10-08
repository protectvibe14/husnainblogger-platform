import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseAdFormats,
  AD_FORMATS,
  codePoints,
  MAX_NAME_CHARS,
  MAX_AUDIENCE_CHARS,
  MAX_SUBSCRIBERS,
} from "./logic.ts";
import { outputs } from "./meta.ts";

const OUTPUT_IDS = outputs.map((o) => o.id);

function happyValues() {
  return {
    newsletterName: "The Dev Brief",
    subscribers: 10000,
    openRate: 42,
    audience: "software developers interested in AI tooling",
    adFormats: "Classified ad, Sponsored section",
  };
}

describe("newsletter-sponsorship-pitch-generator", () => {
  it("happy path returns pitchEmail, rateCardSnippet, notices", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.equal(typeof r.values!.pitchEmail, "string");
    assert.ok((r.values!.pitchEmail as string).length > 0);
    assert.equal(typeof r.values!.rateCardSnippet, "string");
    assert.ok((r.values!.rateCardSnippet as string).length > 0);
    assert.ok(Array.isArray(r.values!.notices));
  });

  it("output ids match meta.ts outputs", () => {
    const r = runTool(happyValues());
    assert.equal(r.ok, true);
    assert.deepEqual(Object.keys(r.values!).sort(), [...OUTPUT_IDS].sort());
  });

  it("deterministic: same inputs produce identical output", () => {
    assert.deepEqual(runTool(happyValues()), runTool(happyValues()));
  });

  it("pitch mentions newsletter name, stats, and formats", () => {
    const r = runTool(happyValues());
    const pitch = r.values!.pitchEmail as string;
    assert.ok(pitch.includes("The Dev Brief"));
    assert.ok(pitch.includes("10,000"));
    assert.ok(pitch.includes("42%"));
    assert.ok(pitch.includes("Classified ad"));
    assert.ok(pitch.includes("Sponsored section"));
    // estimated opens: 10000 * 42% = 4200
    assert.ok(pitch.includes("4,200"));
  });

  it("rate card lists formats with [YOUR RATE] placeholders, never invented prices", () => {
    const r = runTool(happyValues());
    const card = r.values!.rateCardSnippet as string;
    assert.ok(card.includes("[YOUR RATE]"));
    assert.ok(card.includes("Classified ad"));
    assert.ok(card.includes("Sponsored section"));
    assert.ok(!/\$\d/.test(card), "rate card must not invent prices");
  });

  it("pitch contains personalization placeholders, not invented names", () => {
    const r = runTool(happyValues());
    const pitch = r.values!.pitchEmail as string;
    assert.ok(pitch.includes("[Brand]"));
    assert.ok(pitch.includes("[First Name]"));
    assert.ok(pitch.includes("[Your Name]"));
  });

  it("works without openRate: open-rate line is omitted", () => {
    const { openRate: _omit, ...rest } = happyValues();
    const r = runTool(rest);
    assert.equal(r.ok, true);
    const pitch = r.values!.pitchEmail as string;
    assert.ok(!pitch.includes("open rate"));
    const card = r.values!.rateCardSnippet as string;
    assert.ok(!card.includes("Open rate:"));
  });

  it("missing newsletterName errors", () => {
    const r = runTool({ ...happyValues(), newsletterName: "  " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /name/i);
  });

  it("missing subscribers errors", () => {
    const r = runTool({ ...happyValues(), subscribers: undefined });
    assert.equal(r.ok, false);
  });

  it("subscribers NaN errors", () => {
    const r = runTool({ ...happyValues(), subscribers: NaN });
    assert.equal(r.ok, false);
  });

  it("subscribers Infinity errors", () => {
    const r = runTool({ ...happyValues(), subscribers: Infinity });
    assert.equal(r.ok, false);
  });

  it("fractional subscribers error", () => {
    const r = runTool({ ...happyValues(), subscribers: 100.5 });
    assert.equal(r.ok, false);
  });

  it("zero subscribers errors", () => {
    const r = runTool({ ...happyValues(), subscribers: 0 });
    assert.equal(r.ok, false);
  });

  it("unrealistically large subscribers errors", () => {
    const r = runTool({ ...happyValues(), subscribers: MAX_SUBSCRIBERS + 1 });
    assert.equal(r.ok, false);
  });

  it("openRate above 100 errors", () => {
    const r = runTool({ ...happyValues(), openRate: 101 });
    assert.equal(r.ok, false);
  });

  it("openRate below 0 errors", () => {
    const r = runTool({ ...happyValues(), openRate: -1 });
    assert.equal(r.ok, false);
  });

  it("openRate NaN errors", () => {
    const r = runTool({ ...happyValues(), openRate: NaN });
    assert.equal(r.ok, false);
  });

  it("missing audience errors", () => {
    const r = runTool({ ...happyValues(), audience: "   " });
    assert.equal(r.ok, false);
    assert.match(r.error!, /audience/i);
  });

  it("unknown ad format errors and lists valid formats", () => {
    const r = runTool({ ...happyValues(), adFormats: "Skywriting" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Classified ad"));
  });

  it("empty ad formats errors", () => {
    const r = runTool({ ...happyValues(), adFormats: " , " });
    assert.equal(r.ok, false);
  });

  it("ad format matching is case-insensitive and dedupes", () => {
    const formats = parseAdFormats("classified ad, CLASSIFIED AD, dedicated email");
    assert.deepEqual(formats, ["Classified ad", "Dedicated email"]);
  });

  it("all six documented formats parse", () => {
    assert.equal(AD_FORMATS.length, 6);
    const formats = parseAdFormats(AD_FORMATS.join(", "));
    assert.deepEqual(formats, [...AD_FORMATS]);
  });

  it("overlong newsletter name truncated with notice", () => {
    const r = runTool({
      ...happyValues(),
      newsletterName: "n".repeat(MAX_NAME_CHARS + 10),
    });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes("shortened")));
  });

  it("overlong audience truncated with notice", () => {
    const r = runTool({
      ...happyValues(),
      audience: "a".repeat(MAX_AUDIENCE_CHARS + 10),
    });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(notices.some((n) => n.includes("shortened")));
  });

  it("emoji counted in code points for limits", () => {
    assert.equal(codePoints("📧📧"), 2);
    const r = runTool({
      ...happyValues(),
      newsletterName: "📧".repeat(MAX_NAME_CHARS),
    });
    assert.equal(r.ok, true);
    const notices = r.values!.notices as string[];
    assert.ok(!notices.some((n) => n.includes("shortened")));
  });

  it("HTML brackets stripped from outputs", () => {
    const r = runTool({ ...happyValues(), newsletterName: "<b>Bold News</b>" });
    assert.equal(r.ok, true);
    const pitch = r.values!.pitchEmail as string;
    const card = r.values!.rateCardSnippet as string;
    for (const s of [pitch, card]) {
      assert.ok(!s.includes("<b>") && !s.includes("</b>"));
    }
  });

  it("null values object errors", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
  });
});
