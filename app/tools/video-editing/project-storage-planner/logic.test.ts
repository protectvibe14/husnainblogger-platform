import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runTool } from "./logic.ts";

function valuesOf(args: { items: Record<string, unknown>[] }) {
  const r = runTool(args);
  assert.equal(r.ok, true, r.error ?? 'failed');
  return r.values!;
}

describe("project-storage-planner", () => {
  it("happy path: storage math with entered bitrate", () => {
    const v = valuesOf({
      items: [
        { clipLabel: "Intro", durationSec: 40, bitrateMbps: 16 },
        { clipLabel: "Interview", durationSec: 600, bitrateMbps: 16 },
      ],
    });
    // 40*16/8 = 80; 600*16/8 = 1200; total 1280; backups x2 = 2560
    assert.equal(v.totalMb, 1280, `total ${v.totalMb}`);
    assert.equal(v.withBackupsMb, 2560, `withBackups ${v.withBackupsMb}`);
    const perClip = v.perClipMb as string[];
    assert.equal(perClip.length, 2);
    assert.ok(perClip[0].includes("Intro") && perClip[0].includes("80 MB"));
    assert.ok((v.tierRecommendation as string).includes("external SSD"));
  });

  it("quality preset used when bitrate missing, labeled as estimate", () => {
    const v = valuesOf({
      items: [{ clipLabel: "B-roll", durationSec: 120, qualityPreset: "4k" }],
    });
    // 120*80/8 = 1200
    assert.equal(v.totalMb, 1200);
    assert.ok(
      ((v.perClipMb as string[])[0] as string).includes("4k preset estimate"),
      (v.perClipMb as string[])[0]
    );
  });

  it("unknown bitrate -> conservative default preset, labeled (spec edge case)", () => {
    const v = valuesOf({ items: [{ clipLabel: "Mystery", durationSec: 60 }] });
    // conservative default = 1080p 16 Mbps -> 60*16/8 = 120
    assert.equal(v.totalMb, 120);
    assert.ok(
      ((v.perClipMb as string[])[0] as string).includes("conservative default estimate"),
      (v.perClipMb as string[])[0]
    );
  });

  it("proxy comparison shown side by side (spec edge case)", () => {
    const v = valuesOf({
      items: [{ clipLabel: "Intro", durationSec: 40, bitrateMbps: 16 }],
    });
    const proxy = v.proxyComparison as string[];
    assert.equal(proxy.length, 1);
    assert.ok(proxy[0].includes("original 80 MB"), proxy[0]);
    assert.ok(proxy[0].includes("proxy ~40 MB"), proxy[0]);
    assert.ok(proxy[0].includes("720p / 8 Mbps estimate"), proxy[0]);
  });

  it("projectCount and backupCopies multiply correctly", () => {
    const v = valuesOf({
      items: [
        { clipLabel: "A", durationSec: 80, bitrateMbps: 8, projectCount: 3, backupCopies: 1 },
      ],
    });
    // 80*8/8 = 80 per project; total 240; backups 240
    assert.equal(v.totalMb, 240);
    assert.equal(v.withBackupsMb, 240);
  });

  it("missing clipLabel -> Item N error", () => {
    const r = runTool({ items: [{ durationSec: 10, bitrateMbps: 8 }] });
    assert.equal(r.ok, false);
    assert.match(r.error!, /Item 1: .*clipLabel/);
  });

  it("non-positive duration rejected", () => {
    for (const bad of [0, -5, "abc"]) {
      const r = runTool({ items: [{ clipLabel: "x", durationSec: bad, bitrateMbps: 8 }] });
      assert.equal(r.ok, false, `duration ${bad} rejected`);
    }
  });

  it("bad bitrate / preset rejected", () => {
    assert.equal(
      runTool({ items: [{ clipLabel: "x", durationSec: 10, bitrateMbps: -4 }] }).ok,
      false
    );
    assert.equal(
      runTool({ items: [{ clipLabel: "x", durationSec: 10, qualityPreset: "8k" }] }).ok,
      false
    );
  });

  it("bad projectCount / backupCopies rejected", () => {
    assert.equal(
      runTool({ items: [{ clipLabel: "x", durationSec: 10, bitrateMbps: 8, projectCount: 0 }] }).ok,
      false
    );
    assert.equal(
      runTool({ items: [{ clipLabel: "x", durationSec: 10, bitrateMbps: 8, backupCopies: 1.5 }] }).ok,
      false
    );
  });

  it("empty items / missing items rejected", () => {
    assert.equal(runTool({ items: [] }).ok, false);
    assert.equal(runTool({} as never).ok, false);
  });

  it("tier recommendation escalates with size", () => {
    const small = valuesOf({ items: [{ clipLabel: "s", durationSec: 10, bitrateMbps: 8 }] });
    assert.ok((small.tierRecommendation as string).includes("external SSD"));
    const medium = valuesOf({
      items: [{ clipLabel: "m", durationSec: 36000, bitrateMbps: 80 }],
    });
    // 36000*80/8 = 360000 MB * 2 backups = 720000 -> 2TB+ tier
    assert.ok((medium.tierRecommendation as string).includes("2 TB+"));
    const huge = valuesOf({
      items: [{ clipLabel: "h", durationSec: 200000, bitrateMbps: 80 }],
    });
    // 200000*80/8 = 2,000,000 * 2 = 4,000,000 MB -> NAS tier
    assert.ok((huge.tierRecommendation as string).includes("RAID/NAS"));
  });

  it("1 TB tier band", () => {
    const v = valuesOf({
      items: [{ clipLabel: "m", durationSec: 20000, bitrateMbps: 16 }],
    });
    // 20000*16/8 = 40000 * 2 = 80000 MB -> 1 TB band
    assert.ok((v.tierRecommendation as string).includes("1 TB project drive"));
  });

  it("GB formatting for large clips", () => {
    const v = valuesOf({
      items: [{ clipLabel: "big", durationSec: 3600, bitrateMbps: 80 }],
    });
    // 3600*80/8 = 36000 MB = 35.2 GB
    assert.ok(((v.perClipMb as string[])[0] as string).includes("GB"));
  });

  it("string numbers accepted for numeric fields", () => {
    const v = valuesOf({
      items: [{ clipLabel: "x", durationSec: "120", bitrateMbps: "16", backupCopies: "3" }],
    });
    assert.equal(v.totalMb, 240);
    assert.equal(v.withBackupsMb, 720);
  });

  it("deterministic: same input run twice -> identical output", () => {
    const args = {
      items: [{ clipLabel: "a", durationSec: 90, qualityPreset: "1080p", backupCopies: 2 }],
    };
    assert.deepEqual(runTool(args), runTool(args));
  });

  it("output ids match meta.ts outputs", async () => {
    const meta = await import("./meta.ts");
    const outputIds = (meta.outputs as { id: string }[]).map((o) => o.id).sort();
    assert.deepEqual(outputIds, [
      "perClipMb",
      "proxyComparison",
      "tierRecommendation",
      "totalMb",
      "withBackupsMb",
    ]);
  });
});
