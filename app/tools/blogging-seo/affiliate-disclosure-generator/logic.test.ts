import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runTool,
  parseProgramNames,
  formatProgramPhrase,
  escapeHtml,
  TEMPLATE_BANK_SIZE,
  PLACEMENTS,
  TONES,
  LEGAL_NOTICE,
  MAX_PROGRAM_NAMES,
} from "./logic.ts";

function okRun(values: Record<string, unknown>) {
  const r = runTool(values);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

describe("affiliate-disclosure-generator", () => {
  it("happy path: formal top with program names", () => {
    const v = okRun({ placement: "top", tone: "formal", programNames: "Amazon Associates\nShareASale" });
    const text = v.disclosureText as string;
    assert.match(text, /AFFILIATE DISCLOSURE/);
    assert.match(text, /"Amazon Associates" and "ShareASale"/);
    assert.ok(!text.includes("{programs}"));
  });

  it("generic disclosure when no program names given", () => {
    const v = okRun({ placement: "bottom", tone: "formal", programNames: "" });
    const text = v.disclosureText as string;
    assert.match(text, /contains affiliate links\./);
    assert.ok(!text.includes("{programs}"));
  });

  it("inline placement produces parenthesized text", () => {
    const v = okRun({ placement: "inline", programNames: "Impact" });
    const text = v.disclosureText as string;
    assert.ok(text.startsWith("(") && text.endsWith(")"));
    assert.match(text, /"Impact"/);
  });

  it("casual tone differs from formal", () => {
    const formal = okRun({ placement: "top", tone: "formal" }).disclosureText;
    const casual = okRun({ placement: "top", tone: "casual" }).disclosureText;
    assert.notEqual(formal, casual);
    assert.match(casual as string, /Quick heads-up/);
  });

  it("tone defaults to formal when omitted", () => {
    const omitted = okRun({ placement: "top" }).disclosureText;
    const explicit = okRun({ placement: "top", tone: "formal" }).disclosureText;
    assert.equal(omitted, explicit);
  });

  it("invalid placement fails", () => {
    const r = runTool({ placement: "sidebar" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /top, inline, bottom/);
  });

  it("missing placement fails", () => {
    const r = runTool({ tone: "formal" });
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });

  it("invalid tone fails", () => {
    const r = runTool({ placement: "top", tone: "friendly" });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /formal, casual/);
  });

  it("HTML output wraps escaped text in a paragraph", () => {
    const v = okRun({ placement: "top", programNames: "A&B <Deals>" });
    const html = v.disclosureHtml as string;
    assert.ok(html.startsWith('<p class="affiliate-disclosure">'));
    assert.ok(html.endsWith("</p>"));
    assert.match(html, /A&amp;B &lt;Deals&gt;/);
    assert.ok(!html.includes("A&B <Deals>"));
  });

  it("legal notice is always returned and mentions FTC/variation by country", () => {
    const v = okRun({ placement: "inline" });
    const notice = v.legalNotice as string;
    assert.equal(notice, LEGAL_NOTICE);
    assert.match(notice, /vary by country/);
    assert.match(notice, /not legal advice/);
    assert.match(notice, /FTC/);
  });

  it("program names dedupe case-insensitively and cap at 10", () => {
    const names = parseProgramNames("A\nb\na\nB\n" + Array.from({ length: 20 }, (_, i) => `P${i}`).join("\n"));
    assert.ok(names.length <= MAX_PROGRAM_NAMES);
    assert.equal(new Set(names.map((n) => n.toLowerCase())).size, names.length);
  });

  it("three program names join with Oxford comma", () => {
    assert.equal(formatProgramPhrase(["A", "B", "C"]), '"A", "B", and "C"');
    assert.equal(formatProgramPhrase(["A"]), '"A"');
    assert.equal(formatProgramPhrase(["A", "B"]), '"A" and "B"');
  });

  it("template bank covers all 12 placement x tone x variant combos", () => {
    assert.equal(TEMPLATE_BANK_SIZE, 12);
    assert.equal(PLACEMENTS.length * TONES.length * 2, 12);
    const seen = new Set<string>();
    for (const p of PLACEMENTS) {
      for (const t of TONES) {
        const named = okRun({ placement: p, tone: t, programNames: "Acme" }).disclosureText as string;
        const generic = okRun({ placement: p, tone: t }).disclosureText as string;
        assert.ok(named.length > 0, `${p}/${t}/named empty`);
        assert.ok(generic.length > 0, `${p}/${t}/generic empty`);
        assert.ok(!named.includes("{programs}"), `${p}/${t}/named has unfilled slot`);
        seen.add(named);
        seen.add(generic);
      }
    }
    assert.equal(seen.size, 12);
  });

  it("array input for programNames is accepted", () => {
    const v = okRun({ placement: "bottom", programNames: ["One", "Two"] });
    assert.match(v.disclosureText as string, /"One" and "Two"/);
  });

  it("escapeHtml handles quotes and ampersands", () => {
    assert.equal(escapeHtml('a"b&c<d>e'), "a&quot;b&amp;c&lt;d&gt;e");
  });

  it("deterministic: same inputs give identical outputs", () => {
    const input = { placement: "bottom", tone: "casual", programNames: "X, Y" };
    assert.deepEqual(okRun(input), okRun(input));
  });

  it("output ids match contract: disclosureText, disclosureHtml, legalNotice", () => {
    const v = okRun({ placement: "top" });
    assert.deepEqual(Object.keys(v).sort(), ["disclosureHtml", "disclosureText", "legalNotice"]);
  });

  it("non-object input fails gracefully", () => {
    const r = runTool(null as unknown as Record<string, unknown>);
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });
});
