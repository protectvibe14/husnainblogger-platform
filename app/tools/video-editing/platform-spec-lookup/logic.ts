/**
 * Platform Spec Lookup (tool-274) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: the same platform + spec type always returns the
 * same spec sheet.
 *
 * Honesty: this is a STATIC rule-table lookup, not live platform data.
 * Platforms change specs often, so every value below is an ESTIMATE labeled
 * as of the last-verified date — verify against the platform's current docs
 * before you export. Unknown platforms return an error, never a guess.
 *
 * PLATFORM_SPEC_TABLE: 7 platforms x 2 spec types (video, image) = 14
 * entries. Last verified: 2026-10-01. Next scheduled review: 2027-01-01.
 * All values are estimates ("est.") — verify against current platform
 * documentation before publishing anything.
 */

const LAST_VERIFIED = "2026-10-01";
const NEXT_REVIEW = "2027-01-01";

interface SpecEntry {
  video: { spec: string; value: string }[];
  image: { spec: string; value: string }[];
}

const PLATFORM_NAMES: Record<string, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  "youtube-shorts": "YouTube Shorts",
  "instagram-reels": "Instagram Reels",
  facebook: "Facebook",
  x: "X (Twitter)",
  pinterest: "Pinterest",
};

// Every value is an estimate as of LAST_VERIFIED — see honesty header.
const TABLE: Record<string, SpecEntry> = {
  tiktok: {
    video: [
      { spec: "Aspect ratios", value: "9:16 (recommended), 16:9, 1:1" },
      { spec: "Recommended resolution", value: "1080 x 1920" },
      { spec: "Max duration", value: "~10 min (est.; limits vary by account/region)" },
      { spec: "Max file size", value: "~500 MB (est.)" },
      { spec: "Codecs", value: "H.264 / HEVC video, AAC audio (est.)" },
      { spec: "Frame rate", value: "30 or 60 fps (est.)" },
      { spec: "Notes", value: "9:16 fills the feed; keep captions inside the center 80% safe zone." },
    ],
    image: [
      { spec: "Aspect ratios", value: "9:16, 1:1" },
      { spec: "Recommended resolution", value: "1080 x 1920" },
      { spec: "Formats", value: "JPEG, PNG (est.)" },
      { spec: "Max file size", value: "~20 MB (est.)" },
      { spec: "Notes", value: "Used for TikTok photo carousels and covers." },
    ],
  },
  youtube: {
    video: [
      { spec: "Aspect ratios", value: "16:9 (recommended), 9:16, 1:1" },
      { spec: "Recommended resolution", value: "1920 x 1080 (1080p); 3840 x 2160 (4K) supported" },
      { spec: "Max duration", value: "12 hours (verified accounts; est.)" },
      { spec: "Max file size", value: "~256 GB (est.)" },
      { spec: "Codecs", value: "H.264 / VP9 / AV1 video, AAC audio (est.)" },
      { spec: "Frame rate", value: "24-60 fps (est.)" },
      { spec: "Notes", value: "Upload the highest resolution available — YouTube re-encodes everything." },
    ],
    image: [
      { spec: "Aspect ratios", value: "16:9" },
      { spec: "Recommended resolution", value: "1280 x 720 (thumbnails)" },
      { spec: "Formats", value: "JPEG, PNG (est.)" },
      { spec: "Max file size", value: "under 2 MB (est.)" },
      { spec: "Notes", value: "Custom thumbnails need a verified account." },
    ],
  },
  "youtube-shorts": {
    video: [
      { spec: "Aspect ratios", value: "9:16" },
      { spec: "Recommended resolution", value: "1080 x 1920" },
      { spec: "Max duration", value: "~3 min (est.)" },
      { spec: "Max file size", value: "~2 GB (est.)" },
      { spec: "Codecs", value: "H.264 video, AAC audio (est.)" },
      { spec: "Frame rate", value: "30 or 60 fps (est.)" },
      { spec: "Notes", value: "Square/landscape uploads get pillarboxed — shoot vertical." },
    ],
    image: [
      { spec: "Aspect ratios", value: "16:9" },
      { spec: "Recommended resolution", value: "1280 x 720 (Shorts shelf thumbnail)" },
      { spec: "Formats", value: "JPEG, PNG (est.)" },
      { spec: "Max file size", value: "under 2 MB (est.)" },
      { spec: "Notes", value: "Shorts thumbnails are mostly auto-selected from the video." },
    ],
  },
  "instagram-reels": {
    video: [
      { spec: "Aspect ratios", value: "9:16" },
      { spec: "Recommended resolution", value: "1080 x 1920" },
      { spec: "Max duration", value: "~3 min (est.)" },
      { spec: "Max file size", value: "~4 GB (est.)" },
      { spec: "Codecs", value: "H.264 video, AAC audio (est.)" },
      { spec: "Frame rate", value: "30 fps (est.)" },
      { spec: "Notes", value: "Keep key text in the center safe zone — UI overlays cover the edges." },
    ],
    image: [
      { spec: "Aspect ratios", value: "9:16" },
      { spec: "Recommended resolution", value: "1080 x 1920 (reel cover)" },
      { spec: "Formats", value: "JPEG, PNG (est.)" },
      { spec: "Max file size", value: "~30 MB (est.)" },
      { spec: "Notes", value: "Covers are also cropped to 1:1 in the profile grid." },
    ],
  },
  facebook: {
    video: [
      { spec: "Aspect ratios", value: "16:9, 1:1, 9:16 (feed); 9:16 (stories/reels)" },
      { spec: "Recommended resolution", value: "1280 x 720 minimum; 1080 x 1920 for vertical" },
      { spec: "Max duration", value: "~240 min feed (est.)" },
      { spec: "Max file size", value: "~10 GB (est.)" },
      { spec: "Codecs", value: "H.264 video, AAC audio (est.)" },
      { spec: "Frame rate", value: "30 fps (est.)" },
      { spec: "Notes", value: "1:1 performs best in feed; go vertical for Stories/Reels." },
    ],
    image: [
      { spec: "Aspect ratios", value: "1.91:1 (link), 9:16 (stories)" },
      { spec: "Recommended resolution", value: "1200 x 630 (link); 1080 x 1920 (stories)" },
      { spec: "Formats", value: "JPEG, PNG (est.)" },
      { spec: "Max file size", value: "~30 MB (est.)" },
      { spec: "Notes", value: "Keep link-image text minimal — heavy text gets less reach." },
    ],
  },
  x: {
    video: [
      { spec: "Aspect ratios", value: "16:9 (recommended), 1:1, 9:16" },
      { spec: "Recommended resolution", value: "1920 x 1080 (landscape)" },
      { spec: "Max duration", value: "~2 min 20 s free; longer with Premium (est.)" },
      { spec: "Max file size", value: "~512 MB (est.)" },
      { spec: "Codecs", value: "H.264 video, AAC audio (est.)" },
      { spec: "Frame rate", value: "30-60 fps (est.)" },
      { spec: "Notes", value: "Burn in captions — most X video is watched muted." },
    ],
    image: [
      { spec: "Aspect ratios", value: "16:9, 1:1" },
      { spec: "Recommended resolution", value: "1600 x 900 (in-stream); 1500 x 500 (header)" },
      { spec: "Formats", value: "JPEG, PNG, GIF (est.)" },
      { spec: "Max file size", value: "~5 MB (est.)" },
      { spec: "Notes", value: "Up to 4 images per post." },
    ],
  },
  pinterest: {
    video: [
      { spec: "Aspect ratios", value: "9:16 (recommended), 1:1, 2:3" },
      { spec: "Recommended resolution", value: "1080 x 1920" },
      { spec: "Max duration", value: "~15 min (est.)" },
      { spec: "Max file size", value: "~2 GB (est.)" },
      { spec: "Codecs", value: "H.264 video, AAC audio (est.)" },
      { spec: "Frame rate", value: "30 fps (est.)" },
      { spec: "Notes", value: "2:3 pins get the most feed space for static content." },
    ],
    image: [
      { spec: "Aspect ratios", value: "2:3 (recommended), 1:1" },
      { spec: "Recommended resolution", value: "1000 x 1500" },
      { spec: "Formats", value: "JPEG, PNG (est.)" },
      { spec: "Max file size", value: "~20 MB (est.)" },
      { spec: "Notes", value: "Avoid pins taller than 2:3 — they get cropped in the feed." },
    ],
  },
};

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawPlatform = values["platform"];
  const platform = typeof rawPlatform === "string" ? rawPlatform.trim().toLowerCase() : "";
  const entry = TABLE[platform];
  if (!entry) {
    return {
      ok: false,
      error: `Unknown platform "${typeof rawPlatform === "string" ? rawPlatform : ""}" — choose one of: ${Object.keys(TABLE).join(", ")}.`,
    };
  }

  const rawType = values["specType"];
  const specType = typeof rawType === "string" ? rawType.trim().toLowerCase() : "";
  if (specType !== "video" && specType !== "image" && specType !== "all") {
    return { ok: false, error: 'Choose a spec type: "video", "image", or "all".' };
  }

  let specs: { spec: string; value: string }[];
  if (specType === "video") {
    specs = entry.video;
  } else if (specType === "image") {
    specs = entry.image;
  } else {
    specs = [
      { spec: "--- Video specs ---", value: "" },
      ...entry.video,
      { spec: "--- Image specs ---", value: "" },
      ...entry.image,
    ];
  }

  const platformName = PLATFORM_NAMES[platform];

  return {
    ok: true,
    values: {
      specs,
      lastVerifiedDate: LAST_VERIFIED,
      freshnessNote:
        `These ${platformName} specs are ESTIMATES as of ${LAST_VERIFIED} (next review ${NEXT_REVIEW}) — ` +
        "platforms change specs often, so verify against the platform's current documentation before you export.",
    },
  };
}
