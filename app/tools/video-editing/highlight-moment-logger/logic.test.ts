import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

describe("highlight-moment-logger", () => {
  it("happy path: summary, top moments sorted by rating then time, CSV", () => {
    const r = runTool({
      items: [
        { label: "Big save", timestamp: 90500, rating: 5 },
        { label: "Intro joke", timestamp: "00:10", rating: 3 },
        { label: "Plot twist", timestamp: "02:05", rating: 4 },
      ],
    });
    assert.equal(r.ok, true);
    assert.ok(r.values, "values present");
    assert.ok(
      (r.values!.logSummary as string).includes("3 moments"),
      `summary: ${r.values!.logSummary}`
    );
    const top = r.values!.topMoments as string[];
    assert.equal(top.length, 3);
    assert.ok(top[0].startsWith("1:30"), `top[0] = ${top[0]}`);
    assert.ok(top[0].includes("(5/5)"));
    assert.ok((r.values!.exportCsv as string).startsWith("timestamp_ms,timestamp,label,rating\n"));
    assert.ok((r.values!.exportCsv as string).includes("Big save"));
  });

  it("missing items array -> error", () => {
    const r = runTool({} as unknown as { items: Record<string, unknown>[] });
    assert.equal(r.ok, false);
    assert.ok(r.error, "error present");
  });

  it("empty items -> OK with header-only CSV and note", () => {
    const r = runTool({ items: [] });
    assert.equal(r.ok, true);
    assert.deepEqual(r.values!.topMoments, []);
    assert.ok(
      (r.values!.exportCsv as string).includes("no moments logged"),
      r.values!.exportCsv as string
    );
    assert.ok((r.values!.logSummary as string).includes("empty"));
  });

  it("missing label -> Item N error", () => {
    const r = runTool({ items: [{ label: "   ", timestamp: 1000, rating: 3 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: .*label/);
  });

  it("negative timestamp -> error", () => {
    const r = runTool({ items: [{ label: "x", timestamp: -5, rating: 3 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: .*timestamp/);
  });

  it("bad timestamp string -> error", () => {
    const r = runTool({ items: [{ label: "x", timestamp: "soon", rating: 3 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: .*timestamp/);
  });

  it("rating out of range -> error", () => {
    for (const rating of [0, 6, 2.5, "high"]) {
      const r = runTool({ items: [{ label: "x", timestamp: 1000, rating }] });
      assert.equal(r.ok, false, `rating ${rating} rejected`);
      assert.match(r.error!, /Item 1: .*rating/);
    }
  });

  it("rating as string '4' accepted", () => {
    const r = runTool({ items: [{ label: "x", timestamp: 1000, rating: "4" }] });
    assert.equal(r.ok, true);
  });

  it("hh:mm:ss timestamp parsed and formatted", () => {
    const r = runTool({
      items: [{ label: "finale", timestamp: "01:02:03", rating: 5 }],
    });
    assert.equal(r.ok, true);
    assert.ok(
      ((r.values!.topMoments as string[])[0] as string).startsWith("1:02:03"),
      (r.values!.topMoments as string[])[0]
    );
    assert.ok((r.values!.exportCsv as string).includes("3723000"));
  });

  it("duplicate timestamps kept and flagged in summary", () => {
    const r = runTool({
      items: [
        { label: "first", timestamp: 60000, rating: 5 },
        { label: "second", timestamp: "01:00", rating: 4 },
      ],
    });
    assert.equal(r.ok, true);
    assert.ok(
      (r.values!.logSummary as string).includes("duplicate timestamp"),
      r.values!.logSummary as string
    );
    const csvLines = (r.values!.exportCsv as string).split("\n");
    assert.equal(csvLines.length, 3, "both rows kept");
  });

  it("CSV escapes commas and quotes in labels", () => {
    const r = runTool({
      items: [{ label: 'He said "wow", really', timestamp: 5000, rating: 5 }],
    });
    assert.equal(r.ok, true);
    assert.ok((r.values!.exportCsv as string).includes('"He said ""wow"", really"'));
  });

  it("top moments limited to 5, ties ordered earliest first", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({
      label: `m${i}`,
      timestamp: (i + 1) * 1000,
      rating: 5,
    }));
    const r = runTool({ items });
    assert.equal(r.ok, true);
    const top = r.values!.topMoments as string[];
    assert.equal(top.length, 5);
    assert.ok(top[0].includes("m0"), top[0]);
  });

  it("non-object item -> error with item number", () => {
    const r = runTool({ items: [{ label: "ok", timestamp: 1, rating: 1 }, 42] } as never);
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 2/);
  });

  it("deterministic: same input run twice -> identical output", () => {
    const args = {
      items: [
        { label: "a", timestamp: "00:30", rating: 2 },
        { label: "b", timestamp: 45000, rating: 5 },
      ],
    };
    const a = runTool(args);
    const b = runTool(args);
    assert.deepEqual(a, b);
  });

  it("output ids match meta.ts outputs", async () => {
    const meta = await import("./meta.ts");
    const outputIds = (meta.outputs as { id: string }[]).map((o) => o.id).sort();
    assert.deepEqual(outputIds, ["exportCsv", "logSummary", "topMoments"]);
  });

  it("zero-millisecond timestamp is valid", () => {
    const r = runTool({ items: [{ label: "cold open", timestamp: 0, rating: 5 }] });
    assert.equal(r.ok, true);
    assert.ok(((r.values!.topMoments as string[])[0] as string).startsWith("0:00"));
  });
});
