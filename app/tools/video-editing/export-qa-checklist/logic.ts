/**
 * tool-287 — Export QA Checklist (generator, rule-lookup engine).
 *
 * Assembles a pre-export QA checklist from a FIXED rule bank, filtered by
 * the user's inputs. This is a checklist, not automation: it cannot inspect
 * your project or your exported file — every item must be verified by you
 * (or by a teammate) before uploading.
 *
 * BANK SIZES (documented for honesty):
 *   BASE_CHECKS:      10 items (resolution, codec, audio, safety, readiness)
 *   PLATFORM_PACKS:    4 items each for YouTube / TikTok / Instagram Reels /
 *                      Facebook (16 total, exactly 1 pack is applied per run)
 *   CAPTION_CHECKS_ON: 4 items when hasCaptions === true
 *   CAPTION_CHECK_OFF: 1 CRITICAL item when hasCaptions === false
 *     (spec edge case: no captions -> include caption check as critical)
 *   MUSIC_CHECKS:      3 items when hasMusic === true
 *     (spec edge case: music present -> include loudness/rights checks)
 *   DURATION_CHECKS:   at most 1 item per run (>600s long-form chapters OR
 *                      <60s vertical 9:16 reframe check — mutually exclusive)
 * MAX checklist size per run = 10 + 4 + 4 + 3 + 1 = 22 items.
 *
 * Nothing here is AI-generated. "Critical" flags are editorial judgment
 * (marked clearly), not measured impact.
 *
 * runTool({ platform, hasCaptions, hasMusic, durationSec })
 *   -> { checklist: string[] ("[CRITICAL] Category: item"), criticalCount: number }
 *
 * Pure TypeScript: zero imports, no DOM, no network, no Math.random.
 * Deterministic: same inputs -> same outputs, always.
 */

export interface RunResult {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
}

interface CheckItem {
  item: string;
  category: string;
  critical: boolean;
}

type PlatformId = "youtube" | "tiktok" | "instagram-reels" | "facebook";

const PLATFORMS: Record<PlatformId, string> = {
  "youtube": "YouTube",
  "tiktok": "TikTok",
  "instagram-reels": "Instagram Reels",
  "facebook": "Facebook",
};

/** 10 base checks every export should pass. */
const BASE_CHECKS: CheckItem[] = [
  {
    item: "Export resolution matches your target platform preset (1920×1080 for landscape YouTube, 1080×1920 for vertical platforms)",
    category: "Resolution & frame rate",
    critical: true,
  },
  {
    item: "Frame rate matches your timeline — no 'frame rate mismatch' or conform warning from your editor",
    category: "Resolution & frame rate",
    critical: true,
  },
  {
    item: "Pixel aspect ratio is square (1.0) — no stretched or squished footage",
    category: "Resolution & frame rate",
    critical: false,
  },
  {
    item: "Codec and container are MP4 (H.264) unless your platform requires otherwise",
    category: "Codec & bitrate",
    critical: true,
  },
  {
    item: "Bitrate is within the recommended range for your resolution — too low causes blocky gradients, too high wastes upload time",
    category: "Codec & bitrate",
    critical: true,
  },
  {
    item: "Audio peaks below -1 dB with no clipping — check the loudest section, not just the average",
    category: "Audio",
    critical: true,
  },
  {
    item: "No black frames or frozen stills at the very start or end of the timeline",
    category: "Export safety",
    critical: false,
  },
  {
    item: "The first 2 seconds (your hook) play correctly — nothing cut off or starting mid-sentence",
    category: "Upload readiness",
    critical: true,
  },
  {
    item: "On-screen text sits inside safe margins, away from platform UI overlays (like/subscribe buttons, captions bar, side rails)",
    category: "Upload readiness",
    critical: false,
  },
  {
    item: "File name is descriptive (topic + date), not 'final_final_v3.mp4'",
    category: "Upload readiness",
    critical: false,
  },
];

/** 4 platform-specific checks each. */
const PLATFORM_PACKS: Record<PlatformId, CheckItem[]> = {
  "youtube": [
    {
      item: "Consider uploading at 1440p or higher — YouTube gives higher-resolution uploads a better quality codec",
      category: "YouTube",
      critical: false,
    },
    {
      item: "Check the 'made for kids' audience setting before publishing — it locks comments and notifications",
      category: "YouTube",
      critical: true,
    },
    {
      item: "End-screen elements are set (subscribe button and next video) — placed over the last 5–20 seconds",
      category: "YouTube",
      critical: false,
    },
    {
      item: "Thumbnail uses high-contrast text readable at phone size, and matches the video's actual content",
      category: "YouTube",
      critical: false,
    },
  ],
  "tiktok": [
    {
      item: "Key action stays inside safe zones — away from the right rail, bottom caption area and top profile bar",
      category: "TikTok",
      critical: true,
    },
    {
      item: "Captions are burned in or reviewed — TikTok auto-captions can mis-transcribe brand names and slang",
      category: "TikTok",
      critical: false,
    },
    {
      item: "The video works with sound on AND carries visually with sound off (many feeds start muted)",
      category: "TikTok",
      critical: false,
    },
    {
      item: "File size and length fit TikTok's current upload limits — check the app if your export is unusually large",
      category: "TikTok",
      critical: false,
    },
  ],
  "instagram-reels": [
    {
      item: "Key action stays inside safe zones — away from the right rail, bottom caption bar and top profile area",
      category: "Instagram Reels",
      critical: true,
    },
    {
      item: "Pick a strong cover frame — it represents the reel on your profile grid",
      category: "Instagram Reels",
      critical: false,
    },
    {
      item: "Decide whether to also share to feed; feed previews crop the reel to your grid ratio",
      category: "Instagram Reels",
      critical: false,
    },
    {
      item: "On-screen text is large enough to read on a phone held at arm's length",
      category: "Instagram Reels",
      critical: false,
    },
  ],
  "facebook": [
    {
      item: "The video carries visually on silent autoplay — open with motion or text, not a talking head waiting for sound",
      category: "Facebook",
      critical: false,
    },
    {
      item: "Key action stays inside safe zones for both feed and fullscreen playback",
      category: "Facebook",
      critical: false,
    },
    {
      item: "If uploading a horizontal video, confirm the player doesn't pillarbox it into an unreadable strip on phones",
      category: "Facebook",
      critical: false,
    },
    {
      item: "Captions added (burned-in or SRT) — Facebook's audience skews heavily toward silent viewing",
      category: "Facebook",
      critical: false,
    },
  ],
};

/** 4 checks when captions are present. */
const CAPTION_CHECKS_ON: CheckItem[] = [
  {
    item: "Captions are synced — no caption appears before or after its spoken line",
    category: "Captions & text",
    critical: false,
  },
  {
    item: "Spell-check every caption line, especially names, brands and numbers",
    category: "Captions & text",
    critical: false,
  },
  {
    item: "Caption text has strong contrast against the background (outline or backing box where needed)",
    category: "Captions & text",
    critical: false,
  },
  {
    item: "Captions don't cover faces, product shots or other key visuals",
    category: "Captions & text",
    critical: false,
  },
];

/** 1 CRITICAL check when captions are absent (spec edge case). */
const CAPTION_CHECK_OFF: CheckItem = {
  item: "No captions in this project — most mobile viewers start with sound off. Add burned-in or platform captions before exporting",
  category: "Captions & text",
  critical: true,
};

/** 3 checks when music is present (spec edge case: loudness + rights). */
const MUSIC_CHECKS: CheckItem[] = [
  {
    item: "Music is licensed or royalty-free for your use case — confirm the license covers commercial/platform use",
    category: "Music & audio",
    critical: true,
  },
  {
    item: "Music is ducked under dialogue — voices stay clearly intelligible at phone-speaker volume",
    category: "Music & audio",
    critical: false,
  },
  {
    item: "The music track fades out or ends cleanly — no abrupt cut mid-bar at the end of the video",
    category: "Music & audio",
    critical: false,
  },
];

function fail(message: string): RunResult {
  return { ok: false, error: message };
}

function parsePlatformId(value: unknown): PlatformId | null {
  if (typeof value !== "string") return null;
  const t = value.trim().toLowerCase();
  const byLabel = (Object.keys(PLATFORMS) as PlatformId[]).find(
    (id) => PLATFORMS[id].toLowerCase() === t
  );
  if (byLabel) return byLabel;
  if (t === "instagram" || t === "reels") return "instagram-reels";
  if ((Object.keys(PLATFORMS) as PlatformId[]).includes(t as PlatformId)) return t as PlatformId;
  return null;
}

function toBool(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  return null;
}

function formatCheck(c: CheckItem): string {
  return `${c.critical ? "[CRITICAL] " : ""}${c.category}: ${c.item}`;
}

export function runTool(values: Record<string, unknown>): RunResult {
  const platformId = parsePlatformId(values.platform);
  if (platformId === null) {
    return fail(
      "Choose a platform: YouTube, TikTok, Instagram Reels, or Facebook."
    );
  }
  const hasCaptions = toBool(values.hasCaptions);
  if (hasCaptions === null) {
    return fail("Tell us whether the video has captions (true/false).");
  }
  const hasMusic = toBool(values.hasMusic);
  if (hasMusic === null) {
    return fail("Tell us whether the video has background music (true/false).");
  }
  const durationSec = values.durationSec;
  if (
    typeof durationSec !== "number" ||
    !Number.isFinite(durationSec) ||
    durationSec <= 0
  ) {
    return fail("Enter the video duration in seconds (a positive number).");
  }

  const checks: CheckItem[] = [...BASE_CHECKS, ...PLATFORM_PACKS[platformId]];

  if (hasCaptions) {
    checks.push(...CAPTION_CHECKS_ON);
  } else {
    checks.push(CAPTION_CHECK_OFF);
  }

  if (hasMusic) {
    checks.push(...MUSIC_CHECKS);
  }

  const isVertical = platformId === "tiktok" || platformId === "instagram-reels";
  if (durationSec > 600) {
    checks.push({
      item: "For videos over 10 minutes, add chapter markers or a pinned comment with timestamps",
      category: "Upload readiness",
      critical: false,
    });
  } else if (durationSec < 60 && isVertical) {
    checks.push({
      item: "Double-check nothing important is cropped in the 9:16 reframe of this short clip",
      category: "Upload readiness",
      critical: false,
    });
  }

  const criticalCount = checks.filter((c) => c.critical).length;

  return {
    ok: true,
    values: {
      checklist: checks.map(formatCheck),
      criticalCount,
    },
  };
}
