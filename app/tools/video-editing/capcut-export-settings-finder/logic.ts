/**
 * CapCut Export Settings Finder (tool-251) — pure logic, zero imports, zero
 * network, zero DOM. Deterministic: same inputs always yield the same picks.
 *
 * Honesty: this is a RULE TABLE lookup, not AI and not live platform data.
 * It maps (platform, source resolution, source fps, priority) to export picks
 * using the fixed tables below. Bitrate tiers are typical H.264 rule-of-thumb
 * ranges, NOT exact platform requirements — the UI must label them estimates.
 *
 * === FIXED RULE TABLES ===
 * PLATFORM_RULES (6 entries): aspect ratio + native export height (short side).
 *   TikTok / Shorts / Instagram Reels -> 9:16, 1080 (1080x1920)
 *   YouTube -> 16:9, 1080 (raised to 2160 when source is 4K+)
 *   Facebook -> 16:9, 1080 (1920x1080)
 *   desktop -> 16:9, matches source up to 2160
 * SOURCE_HEIGHTS (6 entries): 480p/720p/1080p/1440p/2160p(4K)/4320p(8K).
 * BITRATE_TIERS (5 rows x 3 priorities): typical H.264 ranges per short side.
 * STANDARD_FPS (5 entries): 24, 25, 30, 50, 60.
 * Codec is always H.264 in MP4 (universal-playback rule).
 *
 * Edge cases (per spec):
 * - source lower res than native export -> export at source resolution, warn
 *   against upscaling.
 * - frame rate mismatch -> match source when standard; otherwise round to the
 *   nearest standard rate (or cap at 60) with a rationale note.
 * - unknown platform string -> safe H.264 / 1080p / 30 defaults + warning in
 *   rationale[] (graceful fallback, never a crash).
 */

const KNOWN_PLATFORMS = [
  "TikTok",
  "YouTube",
  "Shorts",
  "Instagram Reels",
  "Facebook",
  "desktop",
] as const;

interface PlatformRule {
  aspect: string;
  nativeH: number;
}

const PLATFORM_RULES: Record<string, PlatformRule> = {
  TikTok: { aspect: "9:16", nativeH: 1080 },
  YouTube: { aspect: "16:9", nativeH: 1080 },
  Shorts: { aspect: "9:16", nativeH: 1080 },
  "Instagram Reels": { aspect: "9:16", nativeH: 1080 },
  Facebook: { aspect: "16:9", nativeH: 1080 },
  desktop: { aspect: "16:9", nativeH: 1080 },
};

const SOURCE_HEIGHTS: Record<string, number> = {
  "480p": 480,
  "720p": 720,
  "1080p": 1080,
  "1440p": 1440,
  "2160p (4K)": 2160,
  "4320p (8K)": 4320,
};

interface BitrateRow {
  quality: string;
  uploadSpeed: string;
  fileSize: string;
}

const BITRATE_TIERS: Record<number, BitrateRow> = {
  480: {
    quality: "High · 8-10 Mbps",
    uploadSpeed: "Balanced · 5-8 Mbps",
    fileSize: "Low · 2-4 Mbps",
  },
  720: {
    quality: "High · 12-16 Mbps",
    uploadSpeed: "Balanced · 8-12 Mbps",
    fileSize: "Low · 5-8 Mbps",
  },
  1080: {
    quality: "High · 16-24 Mbps",
    uploadSpeed: "Balanced · 10-16 Mbps",
    fileSize: "Low · 8-12 Mbps",
  },
  1440: {
    quality: "High · 24-35 Mbps",
    uploadSpeed: "Balanced · 16-24 Mbps",
    fileSize: "Low · 12-16 Mbps",
  },
  2160: {
    quality: "High · 45-68 Mbps",
    uploadSpeed: "Balanced · 35-45 Mbps",
    fileSize: "Low · 20-35 Mbps",
  },
};

const STANDARD_FPS = [24, 25, 30, 50, 60];

const PRIORITIES = ["quality", "fileSize", "uploadSpeed"] as const;

function dimsFor(aspect: string, shortSide: number): string {
  if (aspect === "9:16") {
    return `${shortSide}x${Math.round((shortSide * 16) / 9)}`;
  }
  return `${Math.round((shortSide * 16) / 9)}x${shortSide}`;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawPlatform = values["targetPlatform"];
  const platform = typeof rawPlatform === "string" ? rawPlatform.trim() : "";
  if (!platform) {
    return { ok: false, error: "Choose a target platform (TikTok, YouTube, Shorts, Instagram Reels, Facebook, or desktop)." };
  }

  const rawRes = values["sourceResolution"];
  const resLabel = typeof rawRes === "string" ? rawRes.trim() : "";
  const sourceH = SOURCE_HEIGHTS[resLabel];
  if (sourceH === undefined) {
    return {
      ok: false,
      error: "Choose your source resolution (480p, 720p, 1080p, 1440p, 2160p (4K), or 4320p (8K)).",
    };
  }

  const rawFps = values["sourceFps"];
  const sourceFps = typeof rawFps === "number" ? rawFps : NaN;
  if (!Number.isFinite(sourceFps) || sourceFps < 1 || sourceFps > 240) {
    return { ok: false, error: "Enter your source frame rate as a number between 1 and 240 fps." };
  }

  const rawPriority = values["priority"];
  const priority = typeof rawPriority === "string" ? rawPriority.trim() : "";
  if (!(PRIORITIES as readonly string[]).includes(priority)) {
    return { ok: false, error: "Choose a priority: quality, fileSize, or uploadSpeed." };
  }

  const rationale: string[] = [];
  const known = (KNOWN_PLATFORMS as readonly string[]).includes(platform);
  const rule: PlatformRule = known
    ? PLATFORM_RULES[platform]
    : { aspect: "16:9", nativeH: 1080 };

  if (!known) {
    rationale.push(
      `Unknown platform "${platform}" — fell back to safe universal defaults (H.264, 1080p, 30 fps). Pick a listed platform for tailored picks.`
    );
  }

  // --- Resolution: never upscale, match-or-raise per platform ---
  let nativeH = rule.nativeH;
  if (platform === "YouTube" && sourceH >= 2160) {
    nativeH = 2160;
    rationale.push("Your source is 4K or higher, so YouTube gets a 4K export to keep the VP9-quality tier.");
  }
  if (platform === "desktop") {
    nativeH = Math.min(sourceH, 2160);
    if (sourceH > 2160) {
      rationale.push("Desktop archive capped at 4K — 8K exports balloon file size with little visible gain on most screens.");
    }
  }
  let exportH = nativeH;
  if (sourceH < nativeH) {
    exportH = sourceH;
    rationale.push(
      `Your source is ${resLabel} — exporting at source resolution. Upscaling to ${nativeH}p would inflate file size without adding real detail.`
    );
  } else if (known) {
    rationale.push(
      `${exportH}p export matches the platform's native tier — no wasteful upscaling, no quality lost to downscaling.`
    );
  }
  const resolution = `${exportH}p (${dimsFor(rule.aspect, exportH)})`;

  // --- Frame rate: match source when standard, else nearest standard/cap ---
  let frameRate: number;
  if (sourceFps > 60) {
    frameRate = 60;
    rationale.push(
      `${sourceFps} fps exceeds the common export ceiling — capped at 60 fps for broad player compatibility.`
    );
  } else if (STANDARD_FPS.includes(sourceFps)) {
    frameRate = sourceFps;
    rationale.push(`Frame rate matches your source (${frameRate} fps) — no frame-rate conversion judder.`);
  } else {
    frameRate = STANDARD_FPS.reduce((a, b) =>
      Math.abs(b - sourceFps) < Math.abs(a - sourceFps) ? b : a
    );
    rationale.push(
      `${sourceFps} fps is non-standard for export — rounded to the nearest standard rate (${frameRate} fps). For perfectly smooth motion, shoot at 24, 25, 30, 50, or 60 fps.`
    );
  }

  // --- Codec / format: universal-playback rule ---
  const codec = "H.264";
  const format = "MP4";
  rationale.push("H.264 in an MP4 container — plays on every phone, browser, and platform uploader without re-encoding.");

  // --- Bitrate tier from fixed table (rule-of-thumb ranges, labeled) ---
  const tierRow = BITRATE_TIERS[exportH] ?? BITRATE_TIERS[1080];
  const tierKey = priority as keyof BitrateRow;
  const bitrateTier = tierRow[tierKey];
  const priorityNotes: Record<string, string> = {
    quality: "Quality priority — top of the typical H.264 range for this resolution.",
    fileSize: "File-size priority — bottom of the typical range; fine for talking-head footage, risky for fast motion or grain.",
    uploadSpeed: "Upload-speed priority — middle of the typical range, a balance of size and detail.",
  };
  rationale.push(priorityNotes[priority]);
  rationale.push(
    "Bitrate tiers are typical H.264 rule-of-thumb ranges, not exact platform requirements — treat them as estimates."
  );

  return {
    ok: true,
    values: {
      resolution,
      frameRate,
      codec,
      format,
      bitrateTier,
      aspectRatio: rule.aspect,
      rationale,
    },
  };
}
