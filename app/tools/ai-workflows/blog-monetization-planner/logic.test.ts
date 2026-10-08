import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool, STREAMS, TRAFFIC_BANDS } from "./logic.ts";

function tableOf(result: { values?: Record<string, unknown> }): {
  columns: string[];
  rows: string[][];
} {
  assert.ok(result.values, "expected values");
  return result.values["monetizationTable"] as { columns: string[]; rows: string[][] };
}

const BAND = "10,000 - 50,000 / month";

describe("blog-monetization-planner: happy path", () => {
  it("returns ok with monetizationTable and estimateNote", () => {
    const r = runTool({ trafficLevel: BAND });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.deepEqual(t.columns, [
      "Revenue stream",
      "Illustrative monthly range (estimate, USD)",
      "Guidance",
    ]);
    assert.equal(typeof r.values!["estimateNote"], "string");
  });

  it("shows all 6 streams when revenueStreams is omitted", () => {
    const r = runTool({ trafficLevel: BAND });
    assert.equal(tableOf(r).rows.length, 6);
  });

  it("shows the correct fixed range for the chosen band", () => {
    const r = runTool({ trafficLevel: BAND });
    const t = tableOf(r);
    const ads = t.rows.find((row) => row[0] === "Display ads");
    assert.ok(ads);
    assert.equal(ads[1], "$50 - $200");
    assert.ok(ads[2].length > 0, "guidance note present");
  });

  it("formats ranges with thousands separators", () => {
    const r = runTool({ trafficLevel: "Over 250,000 / month" });
    const t = tableOf(r);
    const ads = t.rows.find((row) => row[0] === "Display ads");
    assert.ok(ads);
    assert.equal(ads[1], "$1,000 - $5,000");
  });

  it("ranges rise across bands for the same stream", () => {
    const lowBand = tableOf(runTool({ trafficLevel: TRAFFIC_BANDS[0] }));
    const highBand = tableOf(runTool({ trafficLevel: TRAFFIC_BANDS[3] }));
    const lowAds = lowBand.rows.find((row) => row[0] === "Display ads");
    const highAds = highBand.rows.find((row) => row[0] === "Display ads");
    assert.equal(lowAds![1], "$0 - $20");
    assert.equal(highAds![1], "$1,000 - $5,000");
  });

  it("filters to requested streams by name (case-insensitive)", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: "affiliate marketing, digital products" });
    assert.equal(r.ok, true);
    const t = tableOf(r);
    assert.equal(t.rows.length, 2);
    assert.equal(t.rows[0][0], "Affiliate marketing");
    assert.equal(t.rows[1][0], "Digital products");
  });

  it("accepts revenueStreams as an array", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: ["Services or coaching"] });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 1);
    assert.equal(tableOf(r).rows[0][0], "Services or coaching");
  });

  it("estimateNote always stresses these are estimates, not real data", () => {
    for (const band of TRAFFIC_BANDS) {
      const r = runTool({ trafficLevel: band });
      const note = r.values!["estimateNote"] as string;
      assert.ok(note.includes("estimate"), `note for ${band} should say estimate`);
      assert.ok(note.toLowerCase().includes("not real"), `note for ${band} should disclaim real data`);
    }
  });

  it("column header labels the values as estimates", () => {
    const r = runTool({ trafficLevel: BAND });
    assert.ok(tableOf(r).columns[1].toLowerCase().includes("estimate"));
  });

  it("summary names the traffic band and stream count", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: "Display ads" });
    const note = r.values!["estimateNote"] as string;
    assert.ok(note.includes(BAND));
    assert.ok(note.includes("1 of 6"));
  });
});

describe("blog-monetization-planner: validation errors", () => {
  it("rejects a missing trafficLevel", () => {
    const r = runTool({});
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("traffic level"));
  });

  it("rejects an unknown trafficLevel", () => {
    const r = runTool({ trafficLevel: "huge" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("Under 10,000 / month"));
  });

  it("rejects a non-string trafficLevel", () => {
    const r = runTool({ trafficLevel: 3 });
    assert.equal(r.ok, false);
  });

  it("rejects an unknown revenue stream and lists valid names", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: "crypto mining" });
    assert.equal(r.ok, false);
    assert.ok(r.error!.includes("crypto mining"));
    assert.ok(r.error!.includes("Display ads"));
  });

  it("rejects a non-string non-array revenueStreams value", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: 123 });
    assert.equal(r.ok, false);
  });

  it("rejects a mixed array with a non-string element", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: ["Display ads", 7] });
    assert.equal(r.ok, false);
  });
});

describe("blog-monetization-planner: edge cases", () => {
  it("treats an empty revenueStreams string as 'show all'", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: "" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 6);
  });

  it("treats an empty array as 'show all'", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: [] });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 6);
  });

  it("dedupes repeated stream names", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: "Display ads, display ads" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 1);
  });

  it("keeps the fixed stream order regardless of request order", () => {
    const r = runTool({
      trafficLevel: BAND,
      revenueStreams: "Services or coaching, Display ads",
    });
    const t = tableOf(r);
    assert.deepEqual(
      t.rows.map((row) => row[0]),
      ["Display ads", "Services or coaching"]
    );
  });

  it("accepts all 4 traffic bands", () => {
    for (const band of TRAFFIC_BANDS) {
      const r = runTool({ trafficLevel: band });
      assert.equal(r.ok, true, `expected ok for ${band}`);
      assert.equal(tableOf(r).rows.length, STREAMS.length);
    }
  });

  it("splits on semicolons and newlines", () => {
    const r = runTool({ trafficLevel: BAND, revenueStreams: "Display ads;Affiliate marketing\nDigital products" });
    assert.equal(r.ok, true);
    assert.equal(tableOf(r).rows.length, 3);
  });

  it("never invents a range outside the fixed table", () => {
    const r = runTool({ trafficLevel: BAND });
    const t = tableOf(r);
    for (let i = 0; i < STREAMS.length; i++) {
      const band = STREAMS[i].ranges[BAND];
      const fmt = (n: number) => n.toLocaleString("en-US");
      assert.equal(t.rows[i][1], `$${fmt(band.low)} - $${fmt(band.high)}`);
    }
  });

  it("is deterministic: same inputs give identical output", () => {
    const a = runTool({ trafficLevel: BAND, revenueStreams: "Display ads" });
    const b = runTool({ trafficLevel: BAND, revenueStreams: "Display ads" });
    assert.deepEqual(a, b);
  });

  it("returns only the declared output ids", () => {
    const r = runTool({ trafficLevel: BAND });
    assert.deepEqual(Object.keys(r.values!).sort(), ["estimateNote", "monetizationTable"]);
  });
});
