/**
 * tool-288 — Multi-Platform Upload Planner (planner, rule-lookup engine).
 *
 * Joins a fixed PLATFORM SPECS table with aspect-ratio crop math (F-ASPECT-01)
 * to plan one master file across platforms.
 *
 * HONESTY (from spec honestyNote):
 *  - Platform specs change over time; every spec below carries a
 *    lastVerified date (compiled September 2026). Specs marked UNVERIFIED
 *    are never guessed — the tool says so instead.
 *  - "Best time" notes are general guidance, not personalized data: the tool
 *    cannot know when YOUR audience is active.
 *  - Crop guidance is geometry math only; it cannot reframe your video.
 *
 * runTool({ platforms, masterW, masterH, masterFps, masterDurationSec, scheduleDate? })
 *   platforms: comma-separated ids (youtube, tiktok, instagram-reels, facebook, x)
 *   -> { perPlatform: { columns, rows }, reformatList: string[] }
 *
 * F-ASPECT-01 (crop math): compare master aspect (w/h) to target aspect.
 *   |diff| <= 0.02            -> no crop needed
 *   target taller (portrait)  -> center-crop width: lose (1 - targetW/masterW)
 *   target wider (landscape)  -> center-crop height: lose (1 - targetH/masterH)
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface PlatformSpec {
  id: string;
  name: string;
  aspectW: number;
  aspectH: number;
  width: number;
  height: number;
  container: string;
  note: string;
  /** ISO date this spec was compiled. Freshness is the known risk. */
  lastVerified: string;
}

/** Platform spec table (5 platforms). Compiled September 2026. */
const PLATFORM_SPECS: PlatformSpec[] = [
  {
    id: "youtube",
    name: "YouTube",
    aspectW: 16,
    aspectH: 9,
    width: 1920,
    height: 1080,
    container: "MP4 (H.264)",
    note: "Long-form default. 9:16 uploads are treated as Shorts (1080×1920).",
    lastVerified: "2026-09-20",
  },
  {
    id: "tiktok",
    name: "TikTok",
    aspectW: 9,
    aspectH: 16,
    width: 1080,
    height: 1920,
    container: "MP4 (H.264)",
    note: "Vertical-first. Check the app's current file-size and length limits before large uploads.",
    lastVerified: "2026-09-20",
  },
  {
    id: "instagram-reels",
    name: "Instagram Reels",
    aspectW: 9,
    aspectH: 16,
    width: 1080,
    height: 1920,
    container: "MP4 (H.264)",
    note: "Vertical. Feed previews crop to grid ratio — keep key action centered.",
    lastVerified: "2026-09-20",
  },
  {
    id: "facebook",
    name: "Facebook",
    aspectW: 16,
    aspectH: 9,
    width: 1920,
    height: 1080,
    container: "MP4 (H.264)",
    note: "Flexible: accepts landscape and vertical. Silent autoplay — open with motion or text.",
    lastVerified: "2026-09-20",
  },
  {
    id: "x",
    name: "X",
    aspectW: 16,
    aspectH: 9,
    width: 1280,
    height: 720,
    container: "MP4 (H.264)",
    note: "Landscape default; 1:1 and 9:16 accepted. Limits change often — verify in the app.",
    lastVerified: "2026-09-20",
  },
];

const ASPECT_TOLERANCE = 0.02;

const BEST_TIME_NOTE =
  "General guidance only: post when your audience is active — check the platform's own analytics; there is no guaranteed universal best time.";

function fail(message: string): RunResult {
  return { ok: false, error: message };
}

function normalizeId(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_]+/g, "-");
}

function specFor(id: string): PlatformSpec | null {
  const n = normalizeId(id);
  if (n === "instagram" || n === "reels") return PLATFORM_SPECS[2];
  return PLATFORM_SPECS.find((s) => s.id === n) ?? null;
}

function parsePlatforms(value: unknown): string[] | null {
  if (typeof value !== "string") return null;
  const list = value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  return list.length > 0 ? list : null;
}

function toPositiveNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

function parseScheduleDate(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  const [y, m, d] = t.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return t;
}

interface CropPlan {
  needed: boolean;
  detail: string;
}

/** F-ASPECT-01: pure geometry — how to fit the master into the target aspect. */
function cropPlan(
  masterW: number,
  masterH: number,
  spec: PlatformSpec
): CropPlan {
  const masterAspect = masterW / masterH;
  const targetAspect = spec.aspectW / spec.aspectH;
  if (Math.abs(masterAspect - targetAspect) <= ASPECT_TOLERANCE) {
    return {
      needed: false,
      detail: `No crop needed — master ${masterW}×${masterH} already matches ${spec.aspectW}:${spec.aspectH}.`,
    };
  }
  if (targetAspect < masterAspect) {
    // Portrait target from a wider master: center-crop the width.
    const keepW = Math.round((masterH * spec.aspectW) / spec.aspectH);
    const losePct = Math.round((1 - keepW / masterW) * 100);
    return {
      needed: true,
      detail: `Reformat required: center-crop ${keepW}×${masterH} from ${masterW}×${masterH} for ${spec.width}×${spec.height} output — you lose ~${losePct}% of frame width. Reframe key action or shoot vertical instead.`,
    };
  }
  // Landscape target from a taller master: center-crop the height.
  const keepH = Math.round((masterW * spec.aspectH) / spec.aspectW);
  const losePct = Math.round((1 - keepH / masterH) * 100);
  return {
    needed: true,
    detail: `Reformat required: center-crop ${masterW}×${keepH} from ${masterW}×${masterH} for ${spec.width}×${spec.height} output — you lose ~${losePct}% of frame height.`,
  };
}

export function runTool(values: Record<string, unknown>): RunResult {
  const platformList = parsePlatforms(values.platforms);
  if (platformList === null) {
    return fail(
      "Enter at least one platform (comma-separated): youtube, tiktok, instagram-reels, facebook, x."
    );
  }
  const masterW = toPositiveNumber(values.masterW);
  const masterH = toPositiveNumber(values.masterH);
  const masterFps = toPositiveNumber(values.masterFps);
  const masterDurationSec = toPositiveNumber(values.masterDurationSec);
  if (masterW === null) return fail("Enter the master file width in pixels (a positive number).");
  if (masterH === null) return fail("Enter the master file height in pixels (a positive number).");
  if (masterFps === null) return fail("Enter the master file frame rate (a positive number, e.g. 30).");
  if (masterDurationSec === null) {
    return fail("Enter the master file duration in seconds (a positive number).");
  }
  const scheduleDate = parseScheduleDate(values.scheduleDate);
  if (values.scheduleDate !== undefined && values.scheduleDate !== null && values.scheduleDate !== "" && scheduleDate === null) {
    return fail("Schedule date must be YYYY-MM-DD (e.g. 2026-10-15).");
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const p of platformList) {
    const key = normalizeId(p);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }

  const columns = ["Platform", "Target spec", "Crop needed", "Upload order", "Best-time note", "Planned date"];
  const rows: string[][] = [];
  const reformatList: string[] = [];

  unique.forEach((raw, i) => {
    const spec = specFor(raw);
    const order = String(i + 1);
    const dateCell = scheduleDate ?? "—";
    if (spec === null) {
      rows.push([
        `${raw.trim()} (unverified)`,
        "Unknown — spec not in our table and never guessed",
        "—",
        order,
        BEST_TIME_NOTE,
        dateCell,
      ]);
      return;
    }
    const plan = cropPlan(masterW, masterH, spec);
    rows.push([
      spec.name,
      `${spec.width}×${spec.height} (${spec.aspectW}:${spec.aspectH}), ${spec.container} — spec last verified ${spec.lastVerified}`,
      plan.needed ? "Yes" : "No",
      order,
      BEST_TIME_NOTE,
      dateCell,
    ]);
    if (plan.needed) {
      reformatList.push(`${spec.name}: ${plan.detail}`);
    }
  });

  if (reformatList.length === 0) {
    reformatList.push(
      `Master ${Math.round(masterW)}×${Math.round(masterH)} fits every chosen platform's aspect — no reformat cuts needed.`
    );
  }

  // masterFps and masterDurationSec are validated above (a valid master file
  // needs all four dimensions) and carried for UI display; crop math
  // (F-ASPECT-01) only needs width/height.

  return {
    ok: true,
    values: {
      perPlatform: { columns, rows },
      reformatList,
    },
  };
}
