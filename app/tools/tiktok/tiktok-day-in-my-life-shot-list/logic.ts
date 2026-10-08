/**
 * TikTok Day-in-My-Life Shot List (tool-170) — pure word-bank generator.
 *
 * Honesty: this is NOT AI. It assembles a day-in-my-life shot list from
 * FIXED word banks and shot templates, picking entries deterministically
 * from the user's inputs. It cannot observe the creator's real day —
 * shots are templates to adapt, not a filmed schedule.
 *
 * Fixed banks (sizes documented for QA):
 * - TIME_SCHEDULES: 8 niche schedules x 10 time labels = 80 labels
 * - PROFESSION_SHOTS: 9 profession groups x 10 shot templates = 90 shots
 * - CAPTIONS: 12 caption lines (4 picked deterministically)
 * - TRANSITIONS: 10 transition suggestions (3 picked deterministically)
 *
 * Profession matching: the profession string is lowercased and matched
 * against each group's keyword list (first match wins). Unmatched
 * professions fall back to the "generic" group, whose shots include
 * explicit "swap in your real tasks" slots.
 *
 * Zero imports, zero network, zero DOM, no randomness. Same inputs always
 * produce the same shot list (djb2 hash seed).
 */

export type DimlResult =
  | { ok: true; values: Record<string, string | string[]> }
  | { ok: false; error: string };

export const NICHE_OPTIONS: string[] = [
  "Morning routine",
  "Full workday",
  "Weekend / day off",
  "Student day",
  "Parent day",
  "Fitness day",
  "Creative workday",
  "Other",
];

const TIME_SCHEDULES: Record<string, string[]> = {
  "Morning routine": ["6:30 AM", "6:45 AM", "7:00 AM", "7:15 AM", "7:30 AM", "7:45 AM", "8:00 AM", "8:15 AM", "8:30 AM", "8:45 AM"],
  "Full workday": ["8:00 AM", "9:00 AM", "10:30 AM", "12:00 PM", "1:00 PM", "2:30 PM", "4:00 PM", "5:00 PM", "5:45 PM", "6:30 PM"],
  "Weekend / day off": ["9:00 AM", "10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM", "7:00 PM", "8:00 PM", "9:00 PM"],
  "Student day": ["7:30 AM", "8:30 AM", "10:00 AM", "12:00 PM", "1:30 PM", "3:00 PM", "5:00 PM", "7:00 PM", "8:30 PM", "10:00 PM"],
  "Parent day": ["6:00 AM", "7:00 AM", "8:30 AM", "10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "7:30 PM", "9:00 PM"],
  "Fitness day": ["6:00 AM", "6:30 AM", "7:30 AM", "9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM", "6:30 PM", "8:00 PM"],
  "Creative workday": ["9:00 AM", "10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "6:00 PM", "8:00 PM", "9:30 PM", "11:00 PM"],
  Other: ["Morning", "Mid-morning", "Late morning", "Midday", "Early afternoon", "Mid-afternoon", "Late afternoon", "Evening", "Late evening", "Night"],
};

interface ProfessionGroup {
  name: string;
  keywords: string[];
  shots: string[];
}

const PROFESSION_GROUPS: ProfessionGroup[] = [
  {
    name: "healthcare",
    keywords: ["nurse", "doctor", "medic", "dentist", "pharmacist", "clinic", "hospital", "surgeon", "vet", "caregiver"],
    shots: [
      "Alarm goes off — scrubs laid out the night before",
      "Commute coffee in hand, badge on",
      "Clock in and get the shift handoff",
      "First patient rounds with a smile",
      "Charting break at the nurses' station",
      "Quick hallway snack between tasks",
      "Mid-shift check-in: how the day is really going",
      "Helping a patient — the rewarding moment",
      "End-of-shift handoff to the next team",
      "Scrubs off, decompressing on the way home",
    ],
  },
  {
    name: "desk / tech",
    keywords: ["developer", "engineer", "programmer", "designer", "analyst", "marketer", "writer", "accountant", "remote", "office", "freelancer", "consultant"],
    shots: [
      "Wake up and check the calendar for the day",
      "Desk setup reveal — monitor, coffee, to-do list",
      "Deep work block: typing with lo-fi in the background",
      "Standup meeting or async check-in",
      "Lunch away from the screen",
      "Afternoon slump — the snack that saves the day",
      "Collaboration moment: whiteboard or call",
      "Wrapping up tasks and clearing the inbox",
      "Shut the laptop — the satisfying close",
      "Evening wind-down, no screens",
    ],
  },
  {
    name: "fitness",
    keywords: ["trainer", "coach", "gym", "instructor", "athlete", "yoga"],
    shots: [
      "Pre-dawn alarm and pre-workout ritual",
      "Gym arrival — empty floor, best light",
      "Warm-up routine on camera",
      "Main workout: the hardest set of the day",
      "Client session — coaching cues in action",
      "Form check close-up",
      "Post-workout shake and recovery",
      "Programming tomorrow's session",
      "Evening mobility or stretch routine",
      "Early night — recovery is training too",
    ],
  },
  {
    name: "educator",
    keywords: ["teacher", "professor", "tutor", "lecturer", "principal"],
    shots: [
      "Morning classroom setup before students arrive",
      "Writing the day's agenda on the board",
      "First class energy — greeting students",
      "Teaching the key lesson of the day",
      "Helping a student one-on-one",
      "Lunch duty or quiet grading break",
      "Afternoon class: the interactive activity",
      "Grading stack reality check",
      "After-school prep for tomorrow",
      "Leaving the empty classroom behind",
    ],
  },
  {
    name: "service",
    keywords: ["barista", "chef", "waiter", "waitress", "retail", "cashier", "server", "store", "cook", "bartender"],
    shots: [
      "Uniform on — pre-shift routine",
      "Opening duties: lights, music, first setup",
      "First customer rush of the day",
      "The craft moment: making or plating on camera",
      "Mid-shift rush — controlled chaos",
      "Quick break room breather",
      "Regular customer interaction",
      "Restocking and resetting the station",
      "Closing duties and cash-out",
      "Post-shift meal — earned it",
    ],
  },
  {
    name: "creative",
    keywords: ["photographer", "artist", "musician", "creator", "influencer", "filmmaker", "painter", "videographer"],
    shots: [
      "Morning inspiration: sketchbook or reference scroll",
      "Studio or workspace setup reveal",
      "The creative process in action — hands close-up",
      "Mid-project mess: the honest reality",
      "Breakthrough moment caught on camera",
      "Editing or refining the work",
      "Sharing progress with the audience",
      "Golden-hour shoot or final touches",
      "Finished piece reveal",
      "Planning tomorrow's project",
    ],
  },
  {
    name: "student",
    keywords: ["student", "intern", "college", "university", "school"],
    shots: [
      "Morning rush — bag packed the night before",
      "Commute to campus with playlist on",
      "First lecture: notes setup",
      "Library deep-focus study block",
      "Lunch with friends between classes",
      "Group project meeting",
      "Afternoon lecture or lab session",
      "Gym or club activity break",
      "Evening study session with snacks",
      "Night routine and tomorrow's plan",
    ],
  },
  {
    name: "parent",
    keywords: ["mom", "dad", "parent", "mother", "father", "stay-at-home"],
    shots: [
      "Up before the kids — quiet coffee moment",
      "Breakfast chaos: getting everyone fed",
      "School drop-off or morning routine",
      "Nap-time productivity sprint",
      "Lunch and playtime",
      "Errands with kids in tow",
      "Afternoon activity or park trip",
      "Dinner prep while juggling everything",
      "Bedtime routine: stories and tuck-in",
      "Finally sitting down — the parent exhale",
    ],
  },
  {
    name: "generic",
    keywords: [],
    shots: [
      "Wake-up shot — [swap in your real morning routine]",
      "Getting ready for the day — [swap in your real tasks]",
      "Commute or transition to work — [swap in your real commute]",
      "First work block — [swap in your real main task]",
      "Mid-morning check-in — [swap in your real milestone]",
      "Lunch break — [swap in your real lunch spot]",
      "Afternoon work block — [swap in your real second task]",
      "The highlight moment of your day — [swap in your real win]",
      "Wrapping up — [swap in your real end-of-day ritual]",
      "Evening wind-down — [swap in your real night routine]",
    ],
  },
];

const CAPTIONS: string[] = [
  "a day in my life — no filter, just real life",
  "come spend the day with me",
  "day in my life: the realistic version",
  "POV: a normal day in my shoes",
  "spend the day with me — start to finish",
  "my everyday routine, unfiltered",
  "a day in my life as a {profession}",
  "realistic day in my life vlog",
  "what my days actually look like",
  "day in the life — save for inspo",
  "come along for a full day with me",
  "my routine, start to end",
];

const TRANSITIONS: string[] = [
  "Snap transition between morning and midday",
  "Whip-pan when leaving the house",
  "Match-cut: coffee cup to work screen",
  "Clap transition into the next activity",
  "Spin transition for outfit or location changes",
  "Jump-cut montage for repetitive tasks",
  "Speed-ramp the commute, slow-mo the highlight",
  "Object wipe: walk past the camera to change scenes",
  "Day-to-night lighting shift as a natural cut",
  "Mirror transition for the getting-ready beat",
];

/** Deterministic 32-bit hash of a string (djb2). */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function matchGroup(profession: string): ProfessionGroup {
  const lower = profession.toLowerCase();
  for (const group of PROFESSION_GROUPS) {
    if (group.name === "generic") continue;
    if (group.keywords.some((k) => lower.includes(k))) return group;
  }
  return PROFESSION_GROUPS[PROFESSION_GROUPS.length - 1];
}

export function runTool(values: Record<string, unknown>): DimlResult {
  const professionRaw = values.profession;
  if (typeof professionRaw !== "string" || professionRaw.trim().length === 0) {
    return { ok: false, error: "Enter your profession (e.g. 'nurse', 'barista')." };
  }
  const profession = professionRaw.trim();
  if (profession.length > 100) {
    return { ok: false, error: "Profession must be 100 characters or fewer." };
  }

  const nicheRaw = values.niche;
  if (typeof nicheRaw !== "string" || nicheRaw.trim().length === 0) {
    return { ok: false, error: "Pick a niche so the time schedule fits your day." };
  }
  if (!NICHE_OPTIONS.includes(nicheRaw)) {
    return { ok: false, error: "Pick a niche from the list." };
  }
  const niche = nicheRaw;

  const seed = hashString(`${profession.toLowerCase()}|${niche}`);
  const group = matchGroup(profession);
  const times = TIME_SCHEDULES[niche];

  const shots = group.shots.map((shot, i) => `${times[i]} — ${shot}`);
  const bank = CAPTIONS.filter((c) => !c.includes("{profession}"));
  const captions = [
    `a day in my life as a ${profession}`,
    ...[0, 1, 2].map((i) => bank[(seed + i * 3) % bank.length]),
  ];
  const transitions = [0, 1, 2].map(
    (i) => TRANSITIONS[(seed + i * 4) % TRANSITIONS.length]
  );

  return {
    ok: true,
    values: { group: group.name, shots, captions, transitions },
  };
}
