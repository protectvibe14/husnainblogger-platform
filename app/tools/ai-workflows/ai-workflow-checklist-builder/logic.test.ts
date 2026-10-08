import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, MAX_STAGES, DEFAULT_TITLE } from "./logic.ts";

function stage(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    workflowName: "Blog Post Pipeline",
    stageName: "Draft outline",
    owner: "Writer",
    ...overrides,
  };
}

describe("ai-workflow-checklist-builder", () => {
  it("happy path: builds title + checkbox lines + markdown", () => {
    const res = runTool({
      items: [
        stage({ stageName: "Draft outline", owner: "Writer" }),
        stage({ stageName: "Edit", owner: "Editor" }),
        stage({ stageName: "Publish", owner: "" }),
      ],
    });
    assert.equal(res.ok, true);
    const values = res.values!;
    assert.deepEqual(values.lines, [
      "Blog Post Pipeline",
      "[ ] 1. Draft outline — Owner: Writer",
      "[ ] 2. Edit — Owner: Editor",
      "[ ] 3. Publish",
    ]);
    assert.ok(values.markdown.startsWith("# Blog Post Pipeline\n\n"));
    assert.ok(values.markdown.includes("- [ ] 2. Edit — Owner: Editor"));
  });

  it("output ids match meta.ts outputs (lines, markdown)", () => {
    const res = runTool({ items: [stage()] });
    assert.deepEqual(Object.keys(res.values!).sort(), ["lines", "markdown"]);
    assert.ok(Array.isArray(res.values!.lines));
    assert.equal(typeof res.values!.markdown, "string");
  });

  it("title falls back to default when no workflowName given", () => {
    const res = runTool({ items: [stage({ workflowName: "" })] });
    assert.equal(res.ok, true);
    assert.equal(res.values!.lines[0], DEFAULT_TITLE);
    assert.ok(res.values!.markdown.startsWith(`# ${DEFAULT_TITLE}`));
  });

  it("title taken from first non-empty workflowName", () => {
    const res = runTool({
      items: [stage({ workflowName: "" }), stage({ workflowName: "Second Title" })],
    });
    assert.equal(res.values!.lines[0], "Second Title");
  });

  it("stage without owner renders without owner suffix", () => {
    const res = runTool({ items: [stage({ owner: "   " })] });
    assert.equal(res.values!.lines[1], "[ ] 1. Draft outline");
  });

  it("at least one stage required", () => {
    const res = runTool({ items: [] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at least one stage/);
  });

  it("missing items arg fails", () => {
    const res = runTool({} as { items: Record<string, unknown>[] });
    assert.equal(res.ok, false);
  });

  it("missing stage name fails with item number", () => {
    const res = runTool({ items: [stage(), stage({ stageName: "" })] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 2: Stage name is required/);
  });

  it("non-object row fails with item number", () => {
    const res = runTool({ items: [42 as unknown as Record<string, unknown>] });
    assert.equal(res.ok, false);
    assert.match(res.error!, /Item 1/);
  });

  it("exactly 25 stages allowed", () => {
    const items = Array.from({ length: MAX_STAGES }, (_, i) =>
      stage({ workflowName: i === 0 ? "T" : "", stageName: `Stage ${i + 1}` }),
    );
    const res = runTool({ items });
    assert.equal(res.ok, true);
    assert.equal(res.values!.lines.length, MAX_STAGES + 1);
  });

  it("26 stages rejected (spec cap)", () => {
    const items = Array.from({ length: MAX_STAGES + 1 }, (_, i) =>
      stage({ workflowName: i === 0 ? "T" : "", stageName: `Stage ${i + 1}` }),
    );
    const res = runTool({ items });
    assert.equal(res.ok, false);
    assert.match(res.error!, /at most 25 stages/);
  });

  it("user order preserved (no reordering)", () => {
    const res = runTool({
      items: [
        stage({ stageName: "Zeta" }),
        stage({ stageName: "Alpha" }),
        stage({ stageName: "Mid" }),
      ],
    });
    assert.deepEqual(res.values!.lines.slice(1), [
      "[ ] 1. Zeta — Owner: Writer",
      "[ ] 2. Alpha — Owner: Writer",
      "[ ] 3. Mid — Owner: Writer",
    ]);
  });

  it("determinism: two runs produce identical output", () => {
    const items = () => [stage(), stage({ stageName: "Edit", owner: "E" })];
    assert.deepEqual(runTool({ items: items() }), runTool({ items: items() }));
  });

  it("whitespace trimmed from all fields", () => {
    const res = runTool({
      items: [stage({ workflowName: "  Padded  ", stageName: "  Draft  ", owner: "  Writer  " })],
    });
    assert.equal(res.values!.lines[0], "Padded");
    assert.equal(res.values!.lines[1], "[ ] 1. Draft — Owner: Writer");
  });

  it("markdown has one checkbox line per stage", () => {
    const res = runTool({
      items: [stage({ stageName: "A" }), stage({ stageName: "B" }), stage({ stageName: "C" })],
    });
    const boxes = res.values!.markdown.split("\n").filter((l) => l.startsWith("- [ ]"));
    assert.equal(boxes.length, 3);
    assert.ok(boxes[0].includes("1. A"));
  });

  it("unicode stage names kept verbatim", () => {
    const res = runTool({ items: [stage({ stageName: "مسودہ لکھیں", owner: "مصنف" })] });
    assert.equal(res.ok, true);
    assert.ok(res.values!.lines[1].includes("مسودہ لکھیں"));
  });
});
