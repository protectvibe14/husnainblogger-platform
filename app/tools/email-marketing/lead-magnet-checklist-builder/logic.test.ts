/**
 * Tests for the Lead Magnet Checklist Builder pure logic (tool-429).
 *
 * Run: node --test app/tools/email-marketing/lead-magnet-checklist-builder/logic.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert";
import {
  runTool,
  SUGGESTED_STEPS,
  CHECKLIST_COLUMNS,
  MAX_ITEMS,
  MAX_STEP_CHARS,
} from "./logic.ts";
import { outputs as metaOutputs, itemFields, content as metaContent } from "./meta.ts";

interface ChecklistTable {
  columns: string[];
  rows: string[][];
}

function builtOf(r: { ok: boolean; values?: Record<string, unknown> }): {
  table: ChecklistTable;
  printable: string;
} {
  assert.strictEqual(r.ok, true);
  return {
    table: r.values!["checklist"] as ChecklistTable,
    printable: r.values!["printable"] as string,
  };
}

const ROW = (topic: string, step = "", detail = "") => ({ magnetTopic: topic, step, detail });

describe("runTool — happy path", () => {
  it("builds a checklist and printable text from user rows", () => {
    const { table, printable } = builtOf(
      runTool({
        items: [
          ROW("Morning Routine Checklist", "Define the reader", "Busy moms, 30s"),
          ROW("", "Write the intro", ""),
        ],
      }),
    );
    assert.deepStrictEqual(table.columns, [...CHECKLIST_COLUMNS]);
    assert.strictEqual(table.rows.length, 2);
    assert.strictEqual(table.rows[0][1], "Define the reader");
    assert.strictEqual(table.rows[0][2], "Busy moms, 30s");
    assert.ok(printable.includes("Lead Magnet Checklist: Morning Routine Checklist"));
    assert.ok(printable.includes("1. Define the reader"));
    assert.ok(printable.includes("   Busy moms, 30s"));
    assert.ok(printable.includes("2. Write the intro"));
  });

  it("auto-fills blank steps from the fixed framework", () => {
    const { table, printable } = builtOf(runTool({ items: [ROW("Fitness Guide"), ROW("")] }));
    assert.strictEqual(table.rows.length, 3); // 2 rows + 1 note row
    assert.ok(table.rows[0][1].includes("Fitness Guide"), table.rows[0][1]);
    assert.ok(table.rows[1][1].includes("Fitness Guide"), table.rows[1][1]);
    assert.ok(printable.includes("2."));
    assert.ok(
      printable.includes("Item 2: step was auto-suggested from the framework."),
      printable,
    );
  });

  it("fills the topic placeholder in suggested steps", () => {
    const { table } = builtOf(runTool({ items: [ROW("SEO Checklist")] }));
    const all = table.rows.map((r) => r[1]).join(" ");
    assert.ok(all.includes("SEO Checklist"));
    assert.ok(!all.includes("{magnetTopic}"));
  });

  it("cycles the framework when blank rows exceed 12", () => {
    const items = [ROW("Big Topic")];
    for (let i = 1; i < 14; i++) items.push(ROW(""));
    const r = runTool({ items });
    assert.strictEqual(r.ok, true);
    const table = r.values!["checklist"] as ChecklistTable;
    assert.strictEqual(table.rows.length, 14 + 1); // +1 note row
    assert.strictEqual(table.rows[0][1], table.rows[12][1], "13th blank cycles to suggestion 1");
  });
});

describe("runTool — validation errors", () => {
  it("rejects non-array items", () => {
    const r = runTool({ items: "nope" } as unknown as { items: Record<string, unknown>[] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /no items/i);
  });

  it("rejects empty items", () => {
    const r = runTool({ items: [] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /at least one/);
  });

  it("rejects Item 1 missing the topic", () => {
    const r = runTool({ items: [ROW(""), ROW("My Topic")] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 1/);
    assert.match(r.error!, /topic/i);
  });

  it("rejects whitespace-only topic on Item 1", () => {
    const r = runTool({ items: [ROW("   ")] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 1/);
  });

  it("rejects a non-object item", () => {
    const r = runTool({ items: [ROW("T"), null as unknown as Record<string, unknown>] });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, /Item 2/);
  });

  it("rejects more than MAX_ITEMS rows", () => {
    const items = [ROW("T")];
    for (let i = 1; i <= MAX_ITEMS; i++) items.push(ROW(""));
    const r = runTool({ items });
    assert.strictEqual(r.ok, false);
    assert.match(r.error!, new RegExp(String(MAX_ITEMS)));
  });
});

describe("runTool — edge cases", () => {
  it("is deterministic: same items give identical output", () => {
    const args = { items: [ROW("T", "Do X", "Details"), ROW("", "Do Y")] };
    assert.deepStrictEqual(runTool(args), runTool(args));
  });

  it("escapes HTML in user input for the table; printable stays literal plain text", () => {
    const { table, printable } = builtOf(
      runTool({ items: [ROW("<b>Topic</b>", "<script>alert(1)</script>")] }),
    );
    // Table output is escaped so no markup renders.
    assert.ok(!table.rows[0][1].includes("<script>"), table.rows[0][1]);
    assert.ok(table.rows[0][1].includes("&lt;script&gt;"), table.rows[0][1]);
    // Printable copy is plain text: the raw characters appear literally,
    // not as rendered markup.
    assert.ok(printable.includes("Lead Magnet Checklist: <b>Topic</b>"));
    assert.ok(printable.includes("<script>alert(1)</script>"));
  });

  it("truncates overlong steps with a visible notice", () => {
    const longStep = "s".repeat(MAX_STEP_CHARS + 60);
    const { table, printable } = builtOf(runTool({ items: [ROW("T", longStep)] }));
    const noteRow = table.rows[table.rows.length - 1][1];
    assert.match(noteRow, new RegExp(`shortened from ${MAX_STEP_CHARS + 60} to ${MAX_STEP_CHARS}`));
    assert.ok(printable.includes("Notes:"));
  });

  it("handles emoji/CJK topics measured in code points", () => {
    const { table, printable } = builtOf(runTool({ items: [ROW("📧 メール講座", "")] }));
    assert.ok(printable.includes("📧 メール講座"));
    assert.strictEqual(table.rows.length, 2);
  });

  it("rows without notes produce no note row", () => {
    const { table } = builtOf(runTool({ items: [ROW("T", "Step one", "Detail one")] }));
    assert.strictEqual(table.rows.length, 1);
  });

  it("blank details are allowed and render empty", () => {
    const { table } = builtOf(runTool({ items: [ROW("T", "Step only")] }));
    assert.strictEqual(table.rows[0][2], "");
  });
});

describe("framework bank bounds", () => {
  it("SUGGESTED_STEPS has 12 non-empty steps with topic placeholders", () => {
    assert.strictEqual(SUGGESTED_STEPS.length, 12);
    for (const s of SUGGESTED_STEPS) {
      assert.ok(s.step.length > 0 && s.detail.length > 0);
    }
    const withTopic = SUGGESTED_STEPS.filter((s) => s.step.includes("{magnetTopic}"));
    assert.ok(withTopic.length > 0, "some steps use the topic placeholder");
  });
});

describe("meta contract", () => {
  it("output ids match meta outputs", () => {
    assert.deepStrictEqual(
      metaOutputs.map((o) => o.id),
      ["checklist", "printable"],
    );
  });

  it("itemFields include topic, step, detail with topic required on row 1", () => {
    const ids = itemFields.map((f) => f.id);
    assert.deepStrictEqual(ids, ["magnetTopic", "step", "detail"]);
    assert.strictEqual(itemFields[0].required, true);
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
      "https://husnainblogger.com/tools/email-marketing/lead-magnet-checklist-builder/",
    );
  });
});
