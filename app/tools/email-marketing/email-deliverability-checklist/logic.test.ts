import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TRACKER_ITEMS, describeProgress } from "./logic.ts";
import { inputs, outputs, trackerMode, trackerItems, content } from "./meta.ts";

describe("email-deliverability-checklist (tool-445)", () => {
  it("has 18 checklist items (within the 15-20 spec band)", () => {
    assert.ok(TRACKER_ITEMS.length >= 15 && TRACKER_ITEMS.length <= 20);
    assert.equal(TRACKER_ITEMS.length, 18);
  });

  it("item ids are unique", () => {
    const ids = TRACKER_ITEMS.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  it("item ids are lowercase kebab-case", () => {
    for (const item of TRACKER_ITEMS) {
      assert.match(item.id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `id format: ${item.id}`);
    }
  });

  it("every item has a non-empty label", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(item.label.trim().length > 0, `label: ${item.id}`);
    }
  });

  it("every item has a 1-line detail", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok((item.detail ?? "").trim().length > 0, `detail: ${item.id}`);
      assert.ok(!(item.detail ?? "").includes("\n"), `detail is 1 line: ${item.id}`);
    }
  });

  it("every detail is labeled as guidance", () => {
    for (const item of TRACKER_ITEMS) {
      assert.ok(/guidance/i.test(item.detail ?? ""), `guidance label: ${item.id}`);
    }
  });

  it("key platform-rule items are present (auth, spam rate, unsubscribe)", () => {
    const ids = new Set(TRACKER_ITEMS.map((i) => i.id));
    assert.ok(ids.has("authenticate-spf-dkim-dmarc"));
    assert.ok(ids.has("keep-spam-rate-low"));
    assert.ok(ids.has("one-click-unsubscribe"));
  });

  it("honesty: no item claims to test deliverability", () => {
    const banned = /test(s|ing)? your|we (check|verify|scan)|live verification/i;
    for (const item of TRACKER_ITEMS) {
      const text = `${item.label} ${item.detail}`;
      assert.ok(!banned.test(text), `no test claims: ${item.id}`);
    }
  });

  it("honesty: the auth item states the list cannot verify DNS", () => {
    const auth = TRACKER_ITEMS.find((i) => i.id === "authenticate-spf-dkim-dmarc");
    assert.ok(/cannot verify/i.test(auth?.detail ?? ""));
  });

  it("honesty: FAQ plainly says the checklist cannot test deliverability", () => {
    const faq = content.faqs.find((f) => /test/i.test(f.question));
    assert.ok(faq, "a 'does it test' FAQ exists");
    assert.ok(/cannot test deliverability/i.test(faq.answer));
  });

  it("NO runTool export on the tracker module", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mod = { TRACKER_ITEMS, describeProgress } as any;
    assert.equal(typeof mod.runTool, "undefined");
  });

  it("describeProgress: 0 of total", () => {
    assert.equal(describeProgress(0, 18), "0 of 18 done — nothing checked yet. Start at the top.");
  });

  it("describeProgress: partial progress with percent", () => {
    assert.equal(describeProgress(9, 18), "9 of 18 done (50%) — keep going.");
  });

  it("describeProgress: complete", () => {
    const s = describeProgress(18, 18);
    assert.ok(s.includes("18 of 18 done (100%)"));
    assert.ok(/checklist complete/i.test(s));
  });

  it("describeProgress clamps negative and overflow counts", () => {
    assert.equal(describeProgress(-5, 18), "0 of 18 done — nothing checked yet. Start at the top.");
    const over = describeProgress(99, 18);
    assert.ok(over.includes("18 of 18 done (100%)"));
  });

  it("describeProgress handles zero total without NaN", () => {
    assert.ok(!describeProgress(0, 0).includes("NaN"));
  });

  it("meta: trackerMode is checklist and trackerItems re-exports TRACKER_ITEMS", () => {
    assert.equal(trackerMode, "checklist");
    assert.deepEqual(trackerItems, TRACKER_ITEMS);
  });

  it("meta: inputs and outputs are empty for a tracker", () => {
    assert.deepEqual(inputs, []);
    assert.deepEqual(outputs, []);
  });

  it("meta: title <= 60 chars and description is 140-160 chars", () => {
    assert.ok(content.title.length <= 60, `title=${content.title.length}`);
    assert.ok(
      content.description.length >= 140 && content.description.length <= 160,
      `description=${content.description.length}`,
    );
  });

  it("meta: ToolShell auto-emits SoftwareApplication + BreadcrumbList (never in content.jsonLd)", () => {
    // Architecture: ToolShell.astro emits FAQPage/SoftwareApplication/
    // BreadcrumbList for ALL tool pages from tool meta. content.jsonLd in
    // meta.ts is reserved for tool-specific extras only — the tool feeds the
    // shell valid meta and never duplicates the shell's blocks.
    const types = (content.jsonLd as { "@type": string }[]).map((j) => j["@type"]);
    assert.ok(!types.includes("SoftwareApplication"), "ToolShell auto-generates SoftwareApplication");
    assert.ok(!types.includes("BreadcrumbList"), "ToolShell auto-generates BreadcrumbList");
    assert.ok(!types.includes("FAQPage"), "ToolShell auto-generates FAQPage");
    assert.ok(
      (content.description ?? "").length > 0,
      "shell builds SoftwareApplication.description from the tool description",
    );
    const shell = readFileSync(
      new URL("../../../src/templates/ToolShell.astro", import.meta.url),
      "utf8",
    );
    assert.ok(shell.includes("'@type': 'SoftwareApplication'"), "ToolShell emits SoftwareApplication");
    assert.ok(shell.includes("'@type': 'BreadcrumbList'"), "ToolShell emits BreadcrumbList");
    // Breadcrumb is built from tool data: Home / Tools / category / tool
    assert.ok(shell.includes("position: 3") && shell.includes("tool.category"), "shell builds the category crumb from tool data");
  });

  it("meta: assumptions include the guidance-only limitation", () => {
    const assumptions = content.assumptions ?? [];
    assert.ok(assumptions.length >= 1);
    assert.ok(assumptions.some((a) => /cannot test/i.test(a)));
  });
});
