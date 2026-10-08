import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

const BASE = {
  platforms: "youtube, tiktok",
  masterW: 1920,
  masterH: 1080,
  masterFps: 30,
  masterDurationSec: 300,
};

function valuesOf(r: ReturnType<typeof runTool>) {
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values!;
}

function rowsOf(v: ReturnType<typeof valuesOf>) {
  const t = v.perPlatform as { columns: string[]; rows: string[][] };
  return { columns: t.columns, rows: t.rows };
}

describe("multi-platform-upload-planner", () => {
  it("happy path: 16:9 master to YouTube + TikTok", () => {
    const v = valuesOf(runTool(BASE));
    const { columns, rows } = rowsOf(v);
    assert.deepEqual(columns, [
      "Platform",
      "Target spec",
      "Crop needed",
      "Upload order",
      "Best-time note",
      "Planned date",
    ]);
    assert.equal(rows.length, 2);
    const youtube = rows[0];
    assert.equal(youtube[0], "YouTube");
    assert.equal(youtube[2], "No", "YouTube needs no crop");
    assert.equal(youtube[3], "1", "upload order 1");
    const tiktok = rows[1];
    assert.equal(tiktok[0], "TikTok");
    assert.equal(tiktok[2], "Yes", "TikTok needs reformat");
    assert.equal(tiktok[3], "2");
    const reformat = v.reformatList as string[];
    assert.equal(reformat.length, 1);
    assert.ok(reformat[0].includes("TikTok"));
    assert.ok(reformat[0].includes("~68%"), `width loss: ${reformat[0]}`);
  });

  it("9:16 master to TikTok needs no crop; to YouTube needs height crop", () => {
    const v = valuesOf(
      runTool({ ...BASE, platforms: "tiktok, youtube", masterW: 1080, masterH: 1920 })
    );
    const { rows } = rowsOf(v);
    assert.equal(rows[0][2], "No");
    assert.equal(rows[1][2], "Yes");
    assert.ok((v.reformatList as string[])[0].includes("frame height"));
  });

  it("no reformat needed -> reformatList carries a positive note", () => {
    const v = valuesOf(runTool({ ...BASE, platforms: "youtube" }));
    assert.deepEqual(v.reformatList, [
      "Master 1920×1080 fits every chosen platform's aspect — no reformat cuts needed.",
    ]);
  });

  it("unknown platform marked UNVERIFIED, never guessed", () => {
    const v = valuesOf(runTool({ ...BASE, platforms: "youtube, snapchat" }));
    const { rows } = rowsOf(v);
    assert.equal(rows.length, 2);
    assert.ok(rows[1][0].includes("(unverified)"), rows[1][0]);
    assert.ok(rows[1][1].includes("never guessed"), rows[1][1]);
  });

  it("duplicate platforms deduplicated", () => {
    const v = valuesOf(runTool({ ...BASE, platforms: "youtube, YouTube, youtube" }));
    assert.equal(rowsOf(v).rows.length, 1);
  });

  it("empty platforms -> validation error", () => {
    assert.equal(runTool({ ...BASE, platforms: "   " }).ok, false);
    assert.equal(runTool({ ...BASE, platforms: "" }).ok, false);
  });

  it("non-positive master dimensions rejected", () => {
    for (const key of ["masterW", "masterH", "masterFps", "masterDurationSec"]) {
      for (const bad of [0, -5, NaN]) {
        const r = runTool({ ...BASE, [key]: bad });
        assert.equal(r.ok, false, `${key}=${bad} rejected`);
        assert.ok(r.error, "human error message");
      }
    }
  });

  it("schedule date accepted and shown in planned-date column", () => {
    const v = valuesOf(runTool({ ...BASE, scheduleDate: "2026-10-15" }));
    assert.equal(rowsOf(v).rows[0][5], "2026-10-15");
  });

  it("bad schedule date rejected", () => {
    assert.equal(runTool({ ...BASE, scheduleDate: "15/10/2026" }).ok, false);
    assert.equal(runTool({ ...BASE, scheduleDate: "2026-13-01" }).ok, false);
  });

  it("schedule date optional -> em dash cell", () => {
    const v = valuesOf(runTool(BASE));
    assert.equal(rowsOf(v).rows[0][5], "—");
  });

  it("spec rows carry lastVerified date (honesty)", () => {
    const v = valuesOf(runTool(BASE));
    assert.ok(rowsOf(v).rows[0][1].includes("last verified 2026-09-20"));
  });

  it("best-time note is labeled general guidance", () => {
    const v = valuesOf(runTool(BASE));
    assert.ok(rowsOf(v).rows[0][4].includes("General guidance only"));
  });

  it("aspect tolerance: near-identical aspect needs no crop", () => {
    // 1918×1080 vs 16:9 -> diff ~0.0011 < 0.02
    const v = valuesOf(runTool({ ...BASE, platforms: "youtube", masterW: 1918 }));
    assert.equal(rowsOf(v).rows[0][2], "No");
  });

  it("upload order follows user listing order", () => {
    const v = valuesOf(runTool({ ...BASE, platforms: "facebook, x, tiktok" }));
    const { rows } = rowsOf(v);
    assert.deepEqual(rows.map((r) => [r[0], r[3]]), [
      ["Facebook", "1"],
      ["X", "2"],
      ["TikTok", "3"],
    ]);
  });

  it("instagram alias resolves to Instagram Reels spec", () => {
    const v = valuesOf(runTool({ ...BASE, platforms: "instagram" }));
    assert.equal(rowsOf(v).rows[0][0], "Instagram Reels");
  });

  it("deterministic: same input run twice -> identical output", () => {
    assert.deepEqual(runTool(BASE), runTool(BASE));
  });

  it("output ids match meta.ts outputs", async () => {
    const meta = await import("./meta.ts");
    const outputIds = (meta.outputs as { id: string }[]).map((o) => o.id).sort();
    assert.deepEqual(outputIds, ["perPlatform", "reformatList"]);
  });
});
