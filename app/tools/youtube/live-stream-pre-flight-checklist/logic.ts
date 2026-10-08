/**
 * Live Stream Pre-Flight Checklist — static checklist template (NOT AI).
 *
 * 18 fixed checklist items covering tech, audio, lighting, stream settings,
 * backup plan, and post-stream tasks. The tracker UI (trackerMode: 'checklist')
 * renders these items and persists progress in localStorage — there is no
 * runTool for tracker tools.
 *
 * Item id rules: lowercase kebab-case, unique across the list.
 *
 * Pure: no imports, no DOM, no network, no randomness.
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

export const TRACKER_ITEMS: TrackerItem[] = [
  {
    id: "internet-speed-test",
    label: "Run an internet speed test",
    detail: "Aim for upload speed at least 2x your target bitrate; use wired ethernet when possible.",
  },
  {
    id: "camera-framing-check",
    label: "Check camera framing",
    detail: "Eyes in the upper third, clean background, nothing distracting behind you.",
  },
  {
    id: "lighting-check",
    label: "Check lighting",
    detail: "Key light on your face, no harsh shadows, and matched color temperature on all lights.",
  },
  {
    id: "microphone-audio-test",
    label: "Test the microphone",
    detail: "Record a 30-second test clip and listen back for hiss, echo, or clipping.",
  },
  {
    id: "background-noise-sweep",
    label: "Eliminate background noise",
    detail: "Close noisy apps and windows; enable noise suppression in your encoder.",
  },
  {
    id: "encoder-settings-verified",
    label: "Verify encoder settings",
    detail: "Match YouTube's recommended bitrate and keyframe interval for your resolution and frame rate.",
  },
  {
    id: "resolution-framerate-locked",
    label: "Lock resolution and frame rate",
    detail: "Set the same resolution and frame rate on camera and encoder to avoid stutter.",
  },
  {
    id: "stream-key-ready",
    label: "Copy a fresh stream key",
    detail: "Generate a new key in YouTube Studio; never reuse one that was shared publicly.",
  },
  {
    id: "title-description-set",
    label: "Write title and description",
    detail: "Clear title with the topic and start time; description with links you will mention.",
  },
  {
    id: "thumbnail-uploaded",
    label: "Upload a custom thumbnail",
    detail: "1280x720 (16:9), readable at small sizes, no misleading clickbait imagery.",
  },
  {
    id: "privacy-schedule-set",
    label: "Set privacy and schedule",
    detail: "Choose Public or Scheduled and double-check the start date and time zone.",
  },
  {
    id: "chat-moderation-ready",
    label: "Prepare chat moderation",
    detail: "Assign at least one moderator and review your blocked-words list.",
  },
  {
    id: "chat-rules-posted",
    label: "Post chat rules",
    detail: "Pin basic rules so first-time viewers know the norms before chatting.",
  },
  {
    id: "backup-connection-plan",
    label: "Plan a backup connection",
    detail: "Keep phone hotspot credentials ready or a second network on standby.",
  },
  {
    id: "devices-charged-plugged",
    label: "Charge and plug in devices",
    detail: "Laptop, camera, and phone on power; disable sleep mode and auto-updates.",
  },
  {
    id: "private-test-stream",
    label: "Run a private test stream",
    detail: "Stream unlisted for 2 minutes and watch it on a second device to confirm audio and video.",
  },
  {
    id: "closing-cta-planned",
    label: "Plan your closing",
    detail: "Decide what to say at the end, where to send viewers, and the exact sign-off cue.",
  },
  {
    id: "post-stream-tasks",
    label: "Note post-stream tasks",
    detail: "After the stream: trim the replay start, add chapters, and reply to top chat questions.",
  },
];

/**
 * Human-readable progress line for the tracker UI.
 * Clamps checked into [0, total]; handles total = 0 without dividing by zero.
 */
export function describeProgress(checked: number, total: number): string {
  const t = Math.max(0, Math.floor(Number.isFinite(total) ? total : 0));
  const c = Math.min(Math.max(0, Math.floor(Number.isFinite(checked) ? checked : 0)), t);
  if (t === 0) return "0 of 0 checks complete (0%)";
  const pct = Math.round((c / t) * 100);
  const base = `${c} of ${t} checks complete (${pct}%)`;
  return c === t ? `${base} — ready to go live` : base;
}
