/**
 * TTS Pronunciation Fixer (tool-253) — pure logic, zero imports, zero network,
 * zero DOM. Deterministic: same word + engine always yields the same picks.
 *
 * Honesty: PURE STRING HEURISTICS. This tool cannot hear or verify actual TTS
 * output client-side — it generates phonetic-respelling SUGGESTIONS to test.
 * The UI must label every suggestion "test with a short preview", never a
 * guaranteed fix. No AI, no phonetics model, no audio.
 *
 * === FIXED BANKS / RULES ===
 * PHONETIC_BANK (24 entries): commonly misread words -> known phonetic
 *   respellings (e.g. "quinoa" -> "KEEN-wah").
 * ENGINE_NOTES (4 entries): per-engine guidance (elevenlabs has a custom
 *   pronunciation dictionary; capcut/tiktok/generic need inline respelling).
 * Syllable splitter: deterministic heuristic — boundary before a lone
 *   consonant between vowels (V-CV), between consonant clusters (VC-CV),
 *   keeping DIGRAPHS together (12 entries: th, sh, ch, ph, wh, ck, ng, nk,
 *   qu, gh, rh, wr). Stress is UNKNOWN to this tool, so variants are offered
 *   with first- and last-syllable stress for the user to test.
 *
 * Edge cases (per spec):
 * - already-phonetic input (hyphen/space separated syllables) -> returned
 *   unchanged with a note.
 * - proper nouns -> syllable-split spelling + a note (default path).
 * - non-Latin script -> marked unsupported with an explanation (engines need
 *   romanized respellings, which this tool does not generate).
 */

const PHONETIC_BANK: Record<string, string> = {
  entrepreneur: "on-truh-pruh-NUR",
  quinoa: "KEEN-wah",
  acai: "ah-sah-EE",
  saoirse: "SEER-sha",
  nguyen: "n'WIN",
  gif: "jif",
  mischievous: "MIS-chuh-vus",
  espresso: "eh-SPRESS-oh",
  niche: "neesh",
  forte: "fort",
  hyperbole: "hy-PER-buh-lee",
  epitome: "eh-PIT-uh-mee",
  colonel: "KUR-nul",
  worcestershire: "WOOS-tur-sheer",
  draught: "draft",
  segue: "SEG-way",
  cache: "kash",
  facade: "fuh-SAHD",
  debris: "duh-BREE",
  lingerie: "lon-zhuh-RAY",
  banal: "buh-NAHL",
  awry: "uh-RYE",
  subtle: "SUT-ul",
  debt: "det",
};

const ENGINE_NOTES: Record<string, string> = {
  elevenlabs:
    "ElevenLabs follows phonetic respellings closely — paste the spelling into your script, or add the word to a custom pronunciation dictionary (ElevenLabs dashboard → Voices → pronunciation rules) so every project uses it. Always test with a short preview first.",
  capcut:
    "CapCut's text-to-speech has no pronunciation dictionary — paste the phonetic spelling directly into your script text where the word appears. Always test with a short preview first.",
  tiktok:
    "TikTok's text-to-speech has no custom dictionary — replace the word with the phonetic spelling in your script and preview before posting. Always test with a short preview first.",
  generic:
    "Most TTS engines read hyphenated respellings literally — paste the spelling into your script and test with a short preview. If an engine ignores hyphens, try the spaced variant.",
};

const ENGINES = ["elevenlabs", "capcut", "tiktok", "generic"] as const;

const VOWELS = "aeiouy";
const DIGRAPHS = ["th", "sh", "ch", "ph", "wh", "ck", "ng", "nk", "qu", "gh", "rh", "wr"];

function isVowel(ch: string): boolean {
  return ch.length === 1 && VOWELS.includes(ch);
}

function isLetter(ch: string): boolean {
  return ch.length === 1 && ch >= "a" && ch <= "z";
}

/** Deterministic syllable-split heuristic (documented above). */
function splitSyllables(word: string): string[] {
  const w = word.toLowerCase();
  const parts: string[] = [];
  let cur = "";
  let i = 0;
  while (i < w.length) {
    cur += w[i];
    const c = w[i];
    const n1 = w[i + 1] ?? "";
    const n2 = w[i + 2] ?? "";
    if (isLetter(c) && !isVowel(c) && isVowel(n1)) {
      // V-CV: boundary before the lone consonant, unless it forms a digraph.
      const prev = cur.length > 1 ? cur[cur.length - 2] : "";
      if (cur.length > 1 && !DIGRAPHS.includes(prev + c)) {
        parts.push(cur.slice(0, -1));
        cur = c;
      }
    } else if (isLetter(c) && !isVowel(c) && isLetter(n1) && !isVowel(n1) && isVowel(n2)) {
      // VC-CV: boundary between the consonants, unless a digraph.
      if (!DIGRAPHS.includes(c + n1)) {
        parts.push(cur);
        cur = "";
      }
    }
    i++;
  }
  if (cur) parts.push(cur);
  const cleaned = parts.filter((s) => s.length > 0);
  return cleaned.length > 0 ? cleaned : [w];
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  return list.filter((x) => {
    const k = x.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function isAlreadyPhonetic(word: string): boolean {
  return /^[a-z'’]+([ -][a-z'’]+)+$/i.test(word);
}

function isNonLatin(word: string): boolean {
  return /[^\p{Script=Latin}\p{Script=Common}]/u.test(word);
}

export function runTool(values: Record<string, unknown>): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  const rawWord = values["problemWord"];
  const problemWord = typeof rawWord === "string" ? rawWord.trim() : "";
  if (!problemWord) {
    return { ok: false, error: "Enter the word your TTS voice says wrong." };
  }
  if (problemWord.length > 60 || problemWord.split(/\s+/).length > 4) {
    return { ok: false, error: "Enter a single word or short phrase (up to 4 words) — one problem at a time." };
  }

  const rawEngine = values["targetTtsEngine"];
  const engine = typeof rawEngine === "string" ? rawEngine.trim().toLowerCase() : "";
  if (!(ENGINES as readonly string[]).includes(engine)) {
    return { ok: false, error: "Choose a TTS engine: elevenlabs, capcut, tiktok, or generic." };
  }

  const rawContext = values["contextSentence"];
  const context = typeof rawContext === "string" ? rawContext.trim() : "";

  // Non-Latin script: unsupported, with explanation (never a crash).
  if (isNonLatin(problemWord)) {
    return {
      ok: true,
      values: {
        phoneticSpellings: [],
        ipaHint:
          "Unsupported: non-Latin script detected. This tool only builds Latin-alphabet respellings — it cannot romanize other scripts.",
        testSentence: "",
        engineNotes:
          "TTS engines need a romanized (Latin-alphabet) respelling for non-Latin words, which this tool does not generate. Write how the word sounds using English letters, then run it through this tool.",
      },
    };
  }

  let phoneticSpellings: string[];
  let ipaHint: string;
  let note = "";

  if (isAlreadyPhonetic(problemWord)) {
    phoneticSpellings = [problemWord];
    note = "Already in phonetic-spelling format — returned unchanged; test it as-is.";
    ipaHint = `Simplified stress hint (CAPS = stressed syllable — not true IPA): ${problemWord}. ${note}`;
  } else {
    const lower = problemWord.toLowerCase();
    const banked = PHONETIC_BANK[lower];
    if (banked) {
      phoneticSpellings = dedupe([banked, banked.replace(/-/g, " ")]);
      ipaHint = `Simplified stress hint (CAPS = stressed syllable — not true IPA): ${banked}. From a fixed bank of commonly misread words — test with a short preview.`;
    } else {
      const syl = splitSyllables(lower);
      const hyphenated = syl.join("-");
      const variants = [hyphenated, syl.join(" ")];
      if (syl.length > 1) {
        variants.push(syl.map((s, i) => (i === syl.length - 1 ? s.toUpperCase() : s)).join("-"));
        variants.push(syl.map((s, i) => (i === 0 ? s.toUpperCase() : s)).join("-"));
      }
      phoneticSpellings = dedupe(variants).slice(0, 4);
      const stressHint = syl.map((s, i) => (i === syl.length - 1 ? s.toUpperCase() : s)).join("-");
      ipaHint =
        `Simplified stress hint (CAPS = stressed syllable — not true IPA): ${stressHint}. ` +
        "Stress placement is a guess — variants above cover first- and last-syllable stress; test each with a short preview.";
    }
  }

  const first = phoneticSpellings[0] ?? problemWord;
  let testSentence: string;
  if (context) {
    const idx = context.toLowerCase().indexOf(problemWord.toLowerCase());
    if (idx >= 0) {
      testSentence =
        context.slice(0, idx) + first + context.slice(idx + problemWord.length);
    } else {
      testSentence = `${context} (with "${problemWord}" respelled as "${first}")`;
    }
  } else {
    testSentence = `Say it out loud: "${first}". Then paste that spelling into your script wherever "${problemWord}" appears.`;
  }

  let engineNotes = ENGINE_NOTES[engine];
  if (/^[A-Z]/.test(problemWord) && !PHONETIC_BANK[problemWord.toLowerCase()]) {
    engineNotes +=
      " Proper noun detected — engines usually guess names, so the syllable-split spelling above is your best starting point.";
  }

  return {
    ok: true,
    values: {
      phoneticSpellings,
      ipaHint,
      testSentence,
      engineNotes,
    },
  };
}
