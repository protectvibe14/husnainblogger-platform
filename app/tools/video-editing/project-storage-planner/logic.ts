/**
 * tool-290 — Project Storage Planner (built as BUILDER shape).
 *
 * The BuilderTemplate calls runTool({ items }), one item per clip:
 *   { clipLabel, durationSec, bitrateMbps?, qualityPreset?, projectCount?, backupCopies? }
 *
 * F-STORAGE-01 (pure arithmetic):
 *   clipMB = durationSec * bitrateMbps / 8
 *   totalMb        = sum(clipMB * projectCount)
 *   withBackupsMb  = sum(clipMB * projectCount * backupCopies)
 *
 * HONESTY (from spec honestyNote):
 *  - Bitrate presets are labeled ESTIMATES (typical H.264 delivery rates),
 *    not measurements of your footage. Real sizes vary with codec, scene
 *    complexity, and variable bitrate.
 *  - Spec edge case: unknown bitrate -> a conservative default preset is
 *    used WITH a label, never silently.
 *  - Spec edge case: proxy workflow -> proxy vs original shown side by side
 *    (proxy modeled at 720p / 8 Mbps, labeled estimate).
 *  - Tier recommendation is general guidance, not a product recommendation.
 *
 * Validation: clipLabel required; durationSec > 0; bitrateMbps > 0 when given;
 *   qualityPreset must be 720p|1080p|4k when given; projectCount/backupCopies
 *   integers >= 1 when given (defaults 1 and 2).
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same items -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface ParsedClip {
  clipLabel: string;
  durationSec: number;
  bitrateMbps: number;
  bitrateSource: string; // "entered" | "1080p preset estimate" | "conservative default estimate"
  projectCount: number;
  backupCopies: number;
}

/** Typical H.264 delivery bitrates — ESTIMATES, labeled as such in output. */
const BITRATE_PRESETS: Record<string, number> = {
  "720p": 8,
  "1080p": 16,
  "4k": 80,
};

/** Proxy editing modeled at 720p / 8 Mbps — ESTIMATE, labeled as such. */
const PROXY_BITRATE_MBPS = 8;

function fail(itemIndex: number, message: string): RunResult {
  return { ok: false, error: `Item ${itemIndex + 1}: ${message}` };
}

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return null;
    const n = Number(t);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function toCount(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "number" && Number.isInteger(value) && value >= 1) return value;
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return null;
    const n = Number(t);
    if (Number.isInteger(n) && n >= 1) return n;
  }
  return null;
}

function parsePreset(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(BITRATE_PRESETS, t) ? t : null;
}

function formatMb(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb >= 10240 ? 0 : 1)} GB`;
  return `${Math.round(mb)} MB`;
}

function parseClip(item: Record<string, unknown>, index: number): ParsedClip | RunResult {
  const clipLabel = typeof item.clipLabel === "string" ? item.clipLabel.trim() : "";
  if (clipLabel === "") return fail(index, "clipLabel is required (name the clip).");
  const durationSec = toPositiveNumber(item.durationSec);
  if (durationSec === null) {
    return fail(index, "durationSec must be a positive number of seconds.");
  }

  let bitrateMbps: number;
  let bitrateSource: string;
  const entered = toPositiveNumber(item.bitrateMbps);
  const preset = parsePreset(item.qualityPreset);
  if (entered !== null) {
    bitrateMbps = entered;
    bitrateSource = "entered bitrate";
  } else if (preset !== null) {
    bitrateMbps = BITRATE_PRESETS[preset];
    bitrateSource = `${preset} preset estimate`;
  } else if (item.bitrateMbps !== undefined && item.bitrateMbps !== null && item.bitrateMbps !== "") {
    return fail(index, "bitrateMbps must be a positive number.");
  } else if (item.qualityPreset !== undefined && item.qualityPreset !== null && item.qualityPreset !== "") {
    return fail(index, "qualityPreset must be 720p, 1080p, or 4k.");
  } else {
    // Spec edge case: unknown bitrate -> conservative default, LABELED.
    bitrateMbps = BITRATE_PRESETS["1080p"];
    bitrateSource = "conservative default estimate (1080p — enter your real bitrate for accuracy)";
  }

  let projectCount = 1;
  if (item.projectCount !== undefined && item.projectCount !== null && item.projectCount !== "") {
    const c = toCount(item.projectCount);
    if (c === null) return fail(index, "projectCount must be a whole number >= 1.");
    projectCount = c;
  }
  let backupCopies = 2;
  if (item.backupCopies !== undefined && item.backupCopies !== null && item.backupCopies !== "") {
    const c = toCount(item.backupCopies);
    if (c === null) return fail(index, "backupCopies must be a whole number >= 1.");
    backupCopies = c;
  }

  return { clipLabel, durationSec, bitrateMbps, bitrateSource, projectCount, backupCopies };
}

function tierRecommendation(withBackupsMb: number): string {
  if (withBackupsMb < 50_000) {
    return `~${formatMb(withBackupsMb)} with backups — fits comfortably on any external SSD or USB drive. (General guidance, not a product recommendation.)`;
  }
  if (withBackupsMb < 512_000) {
    return `~${formatMb(withBackupsMb)} with backups — a dedicated 1 TB project drive leaves healthy headroom.`;
  }
  if (withBackupsMb < 2_048_000) {
    return `~${formatMb(withBackupsMb)} with backups — use a dedicated 2 TB+ project drive and keep at least one backup copy off-site.`;
  }
  return `~${formatMb(withBackupsMb)} with backups — multi-terabyte territory: plan a RAID/NAS setup and confirm your editor's media-cache location has space.`;
}

export function runTool(args: { items: Record<string, unknown>[] }): RunResult {
  if (!args || !Array.isArray(args.items)) {
    return { ok: false, error: "Add at least one clip to plan storage." };
  }
  const items = args.items;
  if (items.length === 0) {
    return { ok: false, error: "Add at least one clip to plan storage." };
  }

  const clips: ParsedClip[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (typeof item !== "object" || item === null) return fail(i, "clip must be an object.");
    const result = parseClip(item as Record<string, unknown>, i);
    if ("ok" in result && result.ok === false) return result;
    clips.push(result as ParsedClip);
  }

  const perClipMb: string[] = [];
  const proxyComparison: string[] = [];
  let totalMb = 0;
  let withBackupsMb = 0;

  for (const c of clips) {
    const clipMb = (c.durationSec * c.bitrateMbps) / 8;
    const proxyMb = (c.durationSec * PROXY_BITRATE_MBPS) / 8;
    totalMb += clipMb * c.projectCount;
    withBackupsMb += clipMb * c.projectCount * c.backupCopies;
    perClipMb.push(
      `${c.clipLabel}: ${formatMb(clipMb)} (${c.durationSec}s × ${c.bitrateMbps} Mbps, ${c.bitrateSource})`
    );
    proxyComparison.push(
      `${c.clipLabel}: original ${formatMb(clipMb)} vs proxy ~${formatMb(proxyMb)} (proxy at 720p / ${PROXY_BITRATE_MBPS} Mbps estimate)`
    );
  }

  return {
    ok: true,
    values: {
      perClipMb,
      totalMb: Math.round(totalMb),
      withBackupsMb: Math.round(withBackupsMb),
      proxyComparison,
      tierRecommendation: tierRecommendation(withBackupsMb),
    },
  };
}
