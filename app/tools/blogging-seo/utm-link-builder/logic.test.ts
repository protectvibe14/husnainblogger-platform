import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_PARAM_LENGTH } from "./logic.ts";

function okRun(items: Record<string, unknown>[]) {
  const r = runTool({ items });
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values as Record<string, unknown>;
}

const BASE = {
  baseUrl: "https://example.com/blog/post",
  utmSource: "newsletter",
  utmMedium: "email",
  utmCampaign: "spring-launch",
};

describe("utm-link-builder", () => {
  it("happy path: builds a tagged URL", () => {
    const v = okRun([{ ...BASE }]);
    assert.equal(v.count, 1);
    const lines = v.lines as string[];
    assert.equal(lines.length, 1);
    assert.equal(
      lines[0],
      "https://example.com/blog/post?utm_source=newsletter&utm_medium=email&utm_campaign=spring-launch"
    );
  });

  it("includes optional utm_term and utm_content", () => {
    const v = okRun([{ ...BASE, utmTerm: "running shoes", utmContent: "sidebar-cta" }]);
    const lines = v.lines as string[];
    assert.match(lines[0], /utm_term=running%20shoes/);
    assert.match(lines[0], /utm_content=sidebar-cta/);
  });

  it("missing baseUrl fails with Item 1 label", () => {
    const r = runTool({ items: [{ utmSource: "x", utmMedium: "y" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1: baseUrl is required/);
  });

  it("missing utm_source fails", () => {
    const r = runTool({ items: [{ ...BASE, utmSource: "  " }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1: utm_source is required/);
  });

  it("missing utm_medium fails", () => {
    const r = runTool({ items: [{ ...BASE, utmMedium: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 1: utm_medium is required/);
  });

  it("invalid URL fails", () => {
    const r = runTool({ items: [{ ...BASE, baseUrl: "not a url" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /not a valid absolute URL/);
  });

  it("relative URL fails", () => {
    const r = runTool({ items: [{ ...BASE, baseUrl: "/blog/post" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /not a valid absolute URL/);
  });

  it("non-http scheme fails", () => {
    const r = runTool({ items: [{ ...BASE, baseUrl: "javascript:alert(1)" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /must use http or https/);
  });

  it("over-long source fails", () => {
    const r = runTool({ items: [{ ...BASE, utmSource: "s".repeat(MAX_PARAM_LENGTH + 1) }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /utm_source must be 100 characters or fewer/);
  });

  it("edge: base URL with existing query params are preserved", () => {
    const v = okRun([{ ...BASE, baseUrl: "https://example.com/p?ref=homepage&lang=en" }]);
    const lines = v.lines as string[];
    assert.match(lines[0], /ref=homepage/);
    assert.match(lines[0], /lang=en/);
    assert.match(lines[0], /utm_source=newsletter/);
  });

  it("edge: existing utm_* params are overwritten with a warning", () => {
    const v = okRun([{ ...BASE, baseUrl: "https://example.com/p?utm_source=old&ref=home" }]);
    const lines = v.lines as string[];
    assert.match(lines[0], /utm_source=newsletter/);
    assert.ok(!lines[0].includes("utm_source=old"));
    assert.match(lines[0], /ref=home/);
    const warnings = v.warnings as string[];
    assert.ok(warnings.some((w) => w.includes("overwritten") && w.includes("utm_source")));
  });

  it("edge: unicode values are percent-encoded (RFC 3986)", () => {
    const v = okRun([{ ...BASE, utmSource: "café münchen" }]);
    const lines = v.lines as string[];
    assert.match(lines[0], /utm_source=caf%C3%A9%20m%C3%BCnchen/);
  });

  it("edge: fragment is preserved", () => {
    const v = okRun([{ ...BASE, baseUrl: "https://example.com/p#section-2" }]);
    const lines = v.lines as string[];
    assert.ok(lines[0].endsWith("#section-2"));
  });

  it("missing utm_campaign produces a warning, not an error", () => {
    const v = okRun([{ baseUrl: BASE.baseUrl, utmSource: "x", utmMedium: "y" }]);
    const warnings = v.warnings as string[];
    assert.ok(warnings.some((w) => w.includes("utm_campaign")));
    const lines = v.lines as string[];
    assert.ok(!lines[0].includes("utm_campaign"));
  });

  it("multiple items build multiple lines; second bad item fails the run", () => {
    const v = okRun([{ ...BASE }, { ...BASE, utmCampaign: "second" }]);
    assert.equal(v.count, 2);
    const lines = v.lines as string[];
    assert.equal(lines.length, 2);
    const r = runTool({ items: [{ ...BASE }, { ...BASE, utmSource: "" }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /Item 2: utm_source is required/);
  });

  it("empty items array fails", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /at least one link/);
  });

  it("non-object args fail gracefully", () => {
    const r = runTool(undefined as unknown as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
    assert.ok(typeof r.error === "string");
  });

  it("deterministic: same items run twice give identical output", () => {
    const items = [{ ...BASE, utmTerm: "shoes", baseUrl: "https://example.com/a?x=1#y" }];
    const a = okRun(items);
    const b = okRun(items);
    assert.deepEqual(a, b);
  });

  it("output ids match contract: lines, warnings, count", () => {
    const v = okRun([{ ...BASE }]);
    assert.deepEqual(Object.keys(v).sort(), ["count", "lines", "warnings"]);
    assert.ok(Array.isArray(v.lines));
    assert.ok(Array.isArray(v.warnings));
    assert.equal(typeof v.count, "number");
  });

  it("whitespace-only values are trimmed before validation", () => {
    const r = runTool({ items: [{ ...BASE, utmMedium: "   " }] });
    assert.equal(r.ok, false);
    assert.match(r.error as string, /utm_medium is required/);
  });
});
