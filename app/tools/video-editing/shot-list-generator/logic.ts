/**
 * Shot List Generator (tool-278) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: same inputs always produce the same list.
 *
 * Honesty: this is NOT AI generation. Shots come from a fixed, hand-written
 * bank of 12 coverage entries (documented below); the scene description is
 * inserted verbatim into the purpose templates. Lens values are typical
 * suggestions, not requirements. Distinct scope from tool-276: this tool
 * enumerates general camera coverage for a scene (sizes, angles, lenses,
 * shoot order); tool-276 is B-roll-specific. Shoot-time notes are heuristic
 * estimates, labeled as estimates.
 *
 * Shot bank (12 entries, fixed order). coverage "basic" uses the first 6,
 * coverage "full" uses all 12. Each entry carries a setup group so the
 * shoot order can batch shots that share a camera position.
 */

export interface ShotEntry {
  shotSize: string;
  angle: string;
  movement: string;
  lens: string;
  purpose: string;
}

export interface ShotListResult {
  shots: ShotEntry[];
  shootOrder: string[];
  warnings: string[];
}

interface BankEntry {
  size: string;
  angle: string;
  movement: string;
  lens: string;
  purpose: string; // "{s}" = scene slot
  setup: string; // setup group key, in shoot order
}

const SETUP_LABELS: Record<string, string> = {
  A: "wide & static",
  B: "medium / eye-level",
  C: "close & detail",
  D: "moving camera",
};

const BANK: BankEntry[] = [
  { size: "Wide establishing", angle: "Eye level", movement: "Static tripod", lens: "16-24mm (typical)", purpose: "Establish where the scene happens: {s}.", setup: "A" },
  { size: "Medium master", angle: "Eye level", movement: "Static tripod", lens: "35-50mm (typical)", purpose: "Cover the full action of the scene: {s}.", setup: "B" },
  { size: "Close-up detail", angle: "45-degree angle", movement: "Static tripod", lens: "85mm or macro (typical)", purpose: "Show the key detail the viewer must notice in: {s}.", setup: "C" },
  { size: "Over-the-shoulder", angle: "Over-the-shoulder", movement: "Static tripod", lens: "35-50mm (typical)", purpose: "Put the viewer inside the scene: {s}.", setup: "B" },
  { size: "Insert / macro", angle: "Top-down", movement: "Rack focus", lens: "Macro (typical)", purpose: "Cutaway insert that adds texture to: {s}.", setup: "C" },
  { size: "Cutaway reaction", angle: "Three-quarter", movement: "Static handheld", lens: "35-50mm (typical)", purpose: "Reaction or environment beat to cut away to in: {s}.", setup: "A" },
  // ---- full coverage adds these 6 ----
  { size: "Low-angle power shot", angle: "Low angle", movement: "Slow push-in", lens: "24-35mm (typical)", purpose: "Give the subject weight and presence in: {s}.", setup: "A" },
  { size: "Tracking / walk-through", angle: "Side profile", movement: "Gimbal tracking", lens: "24-35mm (typical)", purpose: "Add motion and energy to: {s}.", setup: "D" },
  { size: "POV shot", angle: "Point-of-view", movement: "Handheld", lens: "24-35mm (typical)", purpose: "First-person moment inside: {s}.", setup: "B" },
  { size: "Creative angle", angle: "Dutch tilt", movement: "Static tripod", lens: "35-50mm (typical)", purpose: "One stylized beat to break visual monotony in: {s}.", setup: "C" },
  { size: "Top-down wide", angle: "Top-down", movement: "Static tripod", lens: "16-24mm (typical)", purpose: "Graphic overhead view of the whole scene: {s}.", setup: "A" },
  { size: "Final hero close-up", angle: "Close macro", movement: "Slow pull-out", lens: "85mm or macro (typical)", purpose: "Closing detail that lingers after: {s}.", setup: "C" },
];

const BASIC_COUNT = 6;
const TINY_SCENE_CHARS = 15;
const FULL_CAP_TINY = 8;

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawScene = values["sceneDescription"];
  const scene = typeof rawScene === "string" ? rawScene.trim() : "";
  if (!scene) {
    return { ok: false, error: "Describe the scene — e.g. 'coffee shop interview, morning light'." };
  }

  const coverage = typeof values["coverage"] === "string" ? values["coverage"].trim().toLowerCase() : "";
  if (coverage !== "basic" && coverage !== "full") {
    return { ok: false, error: "Pick a coverage level: basic or full." };
  }

  const rawCams = values["cameraCount"];
  const cameraCount = typeof rawCams === "number" ? rawCams : Number(rawCams);
  if (!Number.isFinite(cameraCount) || Math.floor(cameraCount) !== cameraCount || cameraCount < 1 || cameraCount > 3) {
    return { ok: false, error: "Camera count must be 1, 2, or 3." };
  }

  const warnings: string[] = [];
  if (cameraCount === 1) {
    warnings.push(
      "One camera means resetting between setups — budget 5-10 minutes per setup change (estimate, not a guarantee)."
    );
  }

  let entries = coverage === "basic" ? BANK.slice(0, BASIC_COUNT) : BANK.slice();
  if (coverage === "full" && scene.length < TINY_SCENE_CHARS) {
    entries = BANK.slice(0, FULL_CAP_TINY);
    warnings.push(
      `Short scene description — full coverage capped at ${FULL_CAP_TINY} shots. Add more scene detail for the full 12.`
    );
  }

  const shots: ShotEntry[] = entries.map((e) => ({
    shotSize: e.size,
    angle: e.angle,
    movement: e.movement,
    lens: e.lens,
    purpose: e.purpose.split("{s}").join(scene),
  }));

  // Shoot order: batch by setup group in first-appearance order.
  const groups: { setup: string; nums: number[] }[] = [];
  entries.forEach((e, i) => {
    const g = groups.find((x) => x.setup === e.setup);
    if (g) {
      g.nums.push(i + 1);
    } else {
      groups.push({ setup: e.setup, nums: [i + 1] });
    }
  });

  const shootOrder: string[] = groups.map(
    (g, i) =>
      `Setup ${i + 1} — ${SETUP_LABELS[g.setup]}: shoot ${g.nums.length === 1 ? "shot" : "shots"} ` +
      `${g.nums.map((n) => `#${n}`).join(", ")} together before moving the camera.`
  );
  shootOrder.push(
    cameraCount === 1
      ? "Single-camera tip: shoot in this setup order top to bottom to minimize resets."
      : `${cameraCount}-camera tip: assign one camera per setup group and roll them together where possible.`
  );

  const result: ShotListResult = { shots, shootOrder, warnings };
  return { ok: true, values: result as unknown as Record<string, unknown> };
}
