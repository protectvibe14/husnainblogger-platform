/**
 * Stylish Fonts Generator — core logic (tool-204).
 *
 * 100% client-side. Pure TypeScript, zero imports, zero network, zero DOM,
 * no Math.random. Deterministic: same inputs -> same outputs.
 *
 * ## What this does
 * Maps plain text to styled Unicode lookalikes via 12 static substitution
 * maps (mathematical alphanumeric symbols, circled, squared, small caps).
 * Characters with no styled equivalent pass through UNCHANGED and are
 * counted in the result note — the tool never invents glyphs.
 *
 * ## The 12 bundled style maps (documented)
 *   bold, italic, bold-italic, script, script-bold, monospace,
 *   double-struck, fraktur, fraktur-bold, small-caps, circled, squared.
 * Built programmatically from Unicode codepoint ranges (see buildMaps).
 * Coverage: A–Z, a–z, 0–9 wherever Unicode defines a styled form.
 * Known gaps (passed through, noted in output):
 *   - italic: small 'h' (Unicode assigns ℎ U+210E, not in the sequence)
 *   - double-struck: ℂ ℍ ℕ ℙ ℚ ℝ ℤ keep their named codepoints
 *   - script: ℬ ℰ ℱ ℋ ℐ ℒ ℳ ℛ keep their named codepoints
 *   - small-caps: only defined letters map (F, Q, S, X have no form)
 *   - squared: lowercase input maps to squared capitals
 *   - digits: no italic / bold-italic / script / fraktur digit forms
 *
 * ## Honesty
 * Styled text is plain Unicode, not a font — rendering depends on the
 * reader's device and fonts (some show empty boxes). Screen readers may
 * read it letter-by-letter. The tool says this in platformSafeNote.
 *
 * @module stylish-fonts-generator/logic
 */

export interface StyleMap {
  id: string;
  label: string;
  map: Record<string, string>;
}

export interface StyleResult {
  styledText: string;
  charCount: number;
  unmappedCount: number;
  styleId: string;
}

function rangeMap(from: string, startCode: number, length: number): Record<string, string> {
  const out: Record<string, string> = {};
  const base = from.codePointAt(0) as number;
  for (let i = 0; i < length; i++) {
    out[String.fromCodePoint(base + i)] = String.fromCodePoint(startCode + i);
  }
  return out;
}

function buildMaps(): Record<string, StyleMap> {
  const caps = (start: number, exceptions: Record<number, number> = {}): Record<string, string> => {
    const m = rangeMap("A", start, 26);
    for (const [idx, code] of Object.entries(exceptions)) {
      m[String.fromCodePoint(65 + Number(idx))] = String.fromCodePoint(code);
    }
    return m;
  };

  const maps: Record<string, StyleMap> = {
    bold: {
      id: "bold",
      label: "Bold",
      map: { ...caps(0x1d400), ...rangeMap("a", 0x1d41a, 26), ...rangeMap("0", 0x1d7ce, 10) },
    },
    italic: {
      id: "italic",
      label: "Italic",
      map: (() => {
        const m = { ...caps(0x1d434), ...rangeMap("a", 0x1d44e, 26) };
        delete m["h"]; // U+210E is the canonical italic h, not in the 1D44E sequence
        return m;
      })(),
    },
    "bold-italic": {
      id: "bold-italic",
      label: "Bold Italic",
      map: { ...caps(0x1d468), ...rangeMap("a", 0x1d482, 26) },
    },
    script: {
      id: "script",
      label: "Script",
      map: {
        ...caps(0x1d49c, { 1: 0x212c, 4: 0x2130, 5: 0x2131, 7: 0x210b, 8: 0x2110, 11: 0x2112, 12: 0x2133, 17: 0x211b }),
        ...rangeMap("a", 0x1d4b6, 26),
      },
    },
    "script-bold": {
      id: "script-bold",
      label: "Bold Script",
      map: { ...caps(0x1d4d0), ...rangeMap("a", 0x1d4ea, 26) },
    },
    monospace: {
      id: "monospace",
      label: "Monospace",
      map: { ...caps(0x1d5ba), ...rangeMap("a", 0x1d5d4, 26), ...rangeMap("0", 0x1d7f6, 10) },
    },
    "double-struck": {
      id: "double-struck",
      label: "Double Struck",
      map: {
        ...caps(0x1d538, { 2: 0x2102, 7: 0x210d, 13: 0x2115, 15: 0x2119, 16: 0x211a, 17: 0x211d, 25: 0x2124 }),
        ...rangeMap("a", 0x1d552, 26),
        ...rangeMap("0", 0x1d7d8, 10),
      },
    },
    fraktur: {
      id: "fraktur",
      label: "Fraktur",
      map: { ...caps(0x1d504), ...rangeMap("a", 0x1d51e, 26) },
    },
    "fraktur-bold": {
      id: "fraktur-bold",
      label: "Bold Fraktur",
      map: { ...caps(0x1d56c), ...rangeMap("a", 0x1d586, 26) },
    },
    "small-caps": {
      id: "small-caps",
      label: "Small Caps",
      map: (() => {
        // Only these letters have Unicode small-caps forms; others pass through.
        const entries: Array<[string, number]> = [
          ["a", 0x1d00], ["b", 0x0299], ["c", 0x1d04], ["d", 0x1d05], ["e", 0x1d07],
          ["g", 0x0262], ["h", 0x029c], ["i", 0x026a], ["j", 0x1d0a], ["k", 0x1d0b],
          ["l", 0x029f], ["m", 0x1d0d], ["n", 0x0274], ["o", 0x1d0f], ["p", 0x1d18],
          ["r", 0x0280], ["t", 0x1d1b], ["u", 0x1d1c], ["v", 0x1d20], ["w", 0x1d21],
          ["y", 0x028f], ["z", 0x1d22],
        ];
        const m: Record<string, string> = {};
        for (const [ch, code] of entries) {
          const styled = String.fromCodePoint(code);
          m[ch] = styled;
          m[ch.toUpperCase()] = styled;
        }
        return m;
      })(),
    },
    circled: {
      id: "circled",
      label: "Circled",
      map: (() => {
        const m = { ...caps(0x24b6), ...rangeMap("a", 0x24d0, 26) };
        m["0"] = String.fromCodePoint(0x24ea);
        for (let d = 1; d <= 9; d++) m[String(d)] = String.fromCodePoint(0x2460 + (d - 1));
        return m;
      })(),
    },
    squared: {
      id: "squared",
      label: "Squared",
      map: (() => {
        // No squared lowercase forms exist; lowercase input maps to squared capitals.
        const m: Record<string, string> = {};
        for (let i = 0; i < 26; i++) {
          const styled = String.fromCodePoint(0x1f130 + i);
          m[String.fromCodePoint(65 + i)] = styled;
          m[String.fromCodePoint(97 + i)] = styled;
        }
        return m;
      })(),
    },
  };
  return maps;
}

/** The 12 bundled style maps. Built once; identical on every call. */
export const STYLE_MAPS: Record<string, StyleMap> = buildMaps();

/** Stable style ids, for the UI select and validation. */
export const STYLE_IDS: string[] = Object.keys(STYLE_MAPS);

/** Instagram caption limit used for the char-count warning. */
export const CAPTION_LIMIT = 2200;

/**
 * Style plain text with one of the bundled maps.
 * Unmapped characters pass through unchanged and are counted.
 */
export function styleText(text: string, styleId: string): StyleResult {
  const style = STYLE_MAPS[styleId];
  if (!style) throw new Error(`Unknown styleId: ${styleId}`);
  let unmappedCount = 0;
  const out: string[] = [];
  for (const ch of text) {
    const styled = style.map[ch];
    if (styled === undefined) {
      unmappedCount++;
      out.push(ch);
    } else {
      out.push(styled);
    }
  }
  const styledText = out.join("");
  return { styledText, charCount: styledText.length, unmappedCount, styleId };
}

function platformSafeNote(result: StyleResult): string {
  const parts: string[] = [
    "Styled text is plain Unicode, not a font — some devices and fonts show empty boxes (tofu), and screen readers may read it letter by letter. Preview on your phone before posting.",
  ];
  if (result.charCount > CAPTION_LIMIT) {
    parts.push(`Warning: ${result.charCount} characters exceeds Instagram's ${CAPTION_LIMIT}-character caption limit.`);
  } else {
    parts.push(`Your styled text is ${result.charCount} characters (Instagram captions allow ${CAPTION_LIMIT}).`);
  }
  if (result.unmappedCount > 0) {
    parts.push(`${result.unmappedCount} character(s) had no styled form and were kept as-is.`);
  }
  return parts.join(" ");
}

/**
 * Contract entry point. mountToolUI calls `runTool({ text, styleId })`.
 * Output ids match meta.ts outputs: styledText, charCount, platformSafeNote.
 */
export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const raw = values && typeof values === "object" ? (values as Record<string, unknown>)["text"] : undefined;
  const styleId = values && typeof values === "object" ? (values as Record<string, unknown>)["styleId"] : undefined;
  if (typeof raw !== "string" || raw.length === 0) {
    return { ok: false, error: "Type some text first — there is nothing to style yet." };
  }
  if (raw.length > 500) {
    return { ok: false, error: "Keep your text under 500 characters." };
  }
  if (typeof styleId !== "string" || !(STYLE_IDS as string[]).includes(styleId)) {
    return { ok: false, error: `Pick a style: ${STYLE_IDS.join(", ")}.` };
  }
  const result = styleText(raw, styleId);
  return {
    ok: true,
    values: {
      styledText: result.styledText,
      charCount: result.charCount,
      platformSafeNote: platformSafeNote(result),
    },
  };
}
