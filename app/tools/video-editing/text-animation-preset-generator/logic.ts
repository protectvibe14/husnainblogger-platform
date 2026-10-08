/**
 * Text Animation Preset Generator (tool-261) — pure logic, zero imports,
 * zero network, zero DOM. Deterministic: same inputs always produce the
 * same CSS, steps, and params.
 *
 * Honesty: this is a TEMPLATE engine, not AI. It assembles a fixed CSS
 * keyframes preset from small documented banks and pairs it with
 * human-readable CapCut rebuild instructions. CapCut has no CSS import, so
 * the CapCut path is manual instructions, never a file — the UI must say so.
 *
 * === FIXED BANKS ===
 *  EFFECTS (5): typewriter, pop-in, slide-up, karaoke-highlight, glitch.
 *  EASINGS (5): linear, ease, ease-in, ease-out, ease-in-out.
 *  COLOR_SCHEMES (5): white-on-black, yellow-highlight, neon-cyan,
 *   gradient-purple, red-accent — each defines {fg, accent, bg}.
 *
 * Karaoke honesty: true word-by-word karaoke needs per-word timings, which
 * this tool does not compute. The CSS preset falls back to an even highlight
 * sweep and the CapCut steps explain the even-split fallback with a warning.
 */

const EFFECTS: string[] = [
  "typewriter",
  "pop-in",
  "slide-up",
  "karaoke-highlight",
  "glitch",
];

const EASINGS: string[] = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
];

interface ColorScheme {
  fg: string;
  accent: string;
  bg: string;
}

const COLOR_SCHEMES: Record<string, ColorScheme> = {
  "white-on-black": { fg: "#FFFFFF", accent: "#FACC15", bg: "#000000" },
  "yellow-highlight": { fg: "#111111", accent: "#FACC15", bg: "#FFFFFF" },
  "neon-cyan": { fg: "#E8FEFF", accent: "#22D3EE", bg: "#050A14" },
  "gradient-purple": { fg: "#FFFFFF", accent: "#A855F7", bg: "#0B0620" },
  "red-accent": { fg: "#FFFFFF", accent: "#EF4444", bg: "#111111" },
};

function effectCss(
  effect: string,
  durationMs: number,
  easing: string,
  c: ColorScheme,
): string {
  switch (effect) {
    case "typewriter":
      return [
        "@keyframes hb-typewriter {",
        "  from { width: 0; }",
        "  to { width: 100%; }",
        "}",
        ".hb-typewriter {",
        "  display: inline-block;",
        "  overflow: hidden;",
        "  white-space: nowrap;",
        `  border-right: 0.12em solid ${c.accent};`,
        `  animation: hb-typewriter ${durationMs}ms steps(30, end) ${easing} forwards;`,
        "}",
        "/* Set steps() to your exact character count, e.g. steps(24, end). */",
      ].join("\n");
    case "pop-in":
      return [
        "@keyframes hb-pop-in {",
        "  0% { opacity: 0; transform: scale(0.6); }",
        "  60% { opacity: 1; transform: scale(1.08); }",
        "  100% { opacity: 1; transform: scale(1); }",
        "}",
        ".hb-pop-in {",
        "  display: inline-block;",
        `  color: ${c.fg};`,
        `  animation: hb-pop-in ${durationMs}ms ${easing} both;`,
        "}",
      ].join("\n");
    case "slide-up":
      return [
        "@keyframes hb-slide-up {",
        "  from { opacity: 0; transform: translateY(110%); }",
        "  to { opacity: 1; transform: translateY(0); }",
        "}",
        ".hb-slide-up {",
        "  display: inline-block;",
        `  color: ${c.fg};`,
        `  animation: hb-slide-up ${durationMs}ms ${easing} both;`,
        "}",
      ].join("\n");
    case "karaoke-highlight":
      return [
        "@keyframes hb-karaoke {",
        "  from { background-position: 200% 0; }",
        "  to { background-position: -200% 0; }",
        "}",
        ".hb-karaoke {",
        "  display: inline-block;",
        `  background: linear-gradient(90deg, ${c.accent} 50%, ${c.fg} 50%);`,
        "  background-size: 200% 100%;",
        "  -webkit-background-clip: text;",
        "  background-clip: text;",
        "  color: transparent;",
        `  animation: hb-karaoke ${durationMs}ms linear both;`,
        "}",
        "/* Even highlight sweep fallback: true word-by-word karaoke needs",
        "   per-word timings, which vary with your audio. Split words into",
        "   separate layers and stagger them in your editor for exact sync. */",
      ].join("\n");
    case "glitch":
      return [
        "@keyframes hb-glitch {",
        "  0%, 100% { clip-path: inset(0 0 0 0); transform: translate(0, 0); }",
        "  20% { clip-path: inset(10% 0 60% 0); transform: translate(-4px, 2px); }",
        "  40% { clip-path: inset(50% 0 20% 0); transform: translate(4px, -2px); }",
        "  60% { clip-path: inset(80% 0 5% 0); transform: translate(-3px, 1px); }",
        "  80% { clip-path: inset(25% 0 45% 0); transform: translate(3px, -1px); }",
        "}",
        ".hb-glitch {",
        "  display: inline-block;",
        `  color: ${c.fg};`,
        `  text-shadow: 2px 0 ${c.accent}, -2px 0 ${c.bg === "#000000" ? "#FF2D78" : c.bg};`,
        `  animation: hb-glitch ${durationMs}ms ${easing} both;`,
        "}",
      ].join("\n");
    default:
      return "";
  }
}

function capcutStepsFor(
  effect: string,
  durationMs: number,
  easing: string,
  c: ColorScheme,
): string[] {
  const steps: string[] = [
    "Open CapCut and add your text layer. Note: CapCut cannot import CSS keyframes — the steps below recreate this preset manually.",
  ];
  switch (effect) {
    case "typewriter":
      steps.push(
        `Select the text layer, open Animation > In, and pick the typewriter-style entrance (closest match: "Typewriter" or letter-by-letter reveal).`,
        `Set the animation duration to ${durationMs}ms to match the preset.`,
        `Adjust the reveal speed so each character lands on a readable beat (typewriter at ${durationMs}ms works best with short lines).`,
      );
      break;
    case "pop-in":
      steps.push(
        `Select the text layer, open Animation > In, and pick a scale/pop entrance (closest match: "Pop" or "Zoom").`,
        `Set the duration to ${durationMs}ms and the easing feel to "${easing}" (CapCut offers limited easing options — pick the closest).`,
        `Add a slight overshoot by keyframing scale from 60% to 108% to 100% for the same springy pop.`,
      );
      break;
    case "slide-up":
      steps.push(
        `Select the text layer, open Animation > In, and pick an upward slide entrance (closest match: "Slide Up").`,
        `Set the duration to ${durationMs}ms with an "${easing}" feel (CapCut's closest available easing).`,
        `Keep the text fully below its resting position at the start so it slides in cleanly, not from mid-screen.`,
      );
      break;
    case "karaoke-highlight":
      steps.push(
        `Use Auto captions to generate word-level captions, or split your line into one text layer per word.`,
        `Color the spoken word ${c.accent} and keep the rest ${c.fg} — the classic karaoke look.`,
        `Stagger each word layer's start time evenly: total ${durationMs}ms divided by your word count (even-split fallback — nudge timings by ear for exact sync, since true karaoke needs per-word audio timing).`,
        `Add a subtle scale pop on each word layer for the viral caption feel.`,
      );
      break;
    case "glitch":
      steps.push(
        `Duplicate your text layer 3 times and offset the copies: one ${c.accent}, one pink/red, one ${c.fg}.`,
        `Use keyframes on each copy's position with small random-feeling offsets (±4px) over ${durationMs}ms.`,
        `Add quick opacity cuts (visible/invisible every few frames) for the sliced glitch look.`,
        `Keep glitch under ~1s — longer glitch reads as a rendering error, not an effect.`,
      );
      break;
  }
  steps.push(
    `Preview on your phone at full screen — small text that looks fine on desktop often fails on mobile.`,
  );
  return steps;
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawEffect = values["effect"];
  const effect =
    typeof rawEffect === "string" ? rawEffect.trim().toLowerCase() : "";
  if (!EFFECTS.includes(effect)) {
    return {
      ok: false,
      error: `Unknown effect "${typeof rawEffect === "string" ? rawEffect : ""}". Pick one of: ${EFFECTS.join(", ")}.`,
    };
  }

  const rawDuration = values["durationMs"];
  const durationMs =
    typeof rawDuration === "number"
      ? rawDuration
      : typeof rawDuration === "string" && rawDuration.trim() !== ""
        ? Number(rawDuration.trim())
        : NaN;
  if (!Number.isFinite(durationMs)) {
    return { ok: false, error: "Enter the animation duration in milliseconds (100-5000)." };
  }
  if (durationMs < 100 || durationMs > 5000) {
    return {
      ok: false,
      error: `Duration must be between 100 and 5000 ms — got ${durationMs}.`,
    };
  }

  const rawEasing = values["easing"];
  const easing =
    typeof rawEasing === "string" ? rawEasing.trim().toLowerCase() : "";
  if (!EASINGS.includes(easing)) {
    return {
      ok: false,
      error: `Unknown easing "${typeof rawEasing === "string" ? rawEasing : ""}". Pick one of: ${EASINGS.join(", ")}.`,
    };
  }

  const rawScheme = values["colorScheme"];
  const schemeKey =
    typeof rawScheme === "string" && rawScheme.trim()
      ? rawScheme.trim().toLowerCase()
      : "white-on-black";
  const warnings: string[] = [];
  let schemeName = schemeKey;
  if (!COLOR_SCHEMES[schemeKey]) {
    schemeName = "white-on-black";
    warnings.push(
      `Unknown color scheme "${typeof rawScheme === "string" ? rawScheme : ""}" — fell back to white-on-black.`,
    );
  }
  const scheme = COLOR_SCHEMES[schemeName] as ColorScheme;

  if (durationMs < 400) {
    warnings.push(
      `Very short duration (${durationMs}ms) — viewers may not finish reading the text. Consider 400ms or more for readability.`,
    );
  }
  if (effect === "karaoke-highlight") {
    warnings.push(
      "Karaoke highlight needs per-word audio timing — this preset falls back to an even highlight sweep. Split words into separate layers and stagger them for exact sync.",
    );
  }

  const cssKeyframes = effectCss(effect, durationMs, easing, scheme);
  const capcutSteps = capcutStepsFor(effect, durationMs, easing, scheme);
  const previewParams = [
    `Effect: ${effect}`,
    `Duration: ${durationMs}ms`,
    `Easing: ${easing}`,
    `Colors: ${schemeName} (fg ${scheme.fg}, accent ${scheme.accent}, bg ${scheme.bg})`,
    warnings.length > 0 ? `Warnings: ${warnings.join(" | ")}` : "Warnings: none",
  ].join(" · ");

  return {
    ok: true,
    values: { cssKeyframes, capcutSteps, previewParams },
  };
}
