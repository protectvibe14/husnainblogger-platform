/**
 * Faceless Video Prompt Pack (tool-349) — pure logic, zero imports.
 *
 * FIXED PACK, NOT AI (inventory type corrected generator -> library):
 * 48 human-written, copy-ready prompt templates for faceless videos —
 * 12 each across 4 categories: documentary, explainer, listicle, story.
 * Nothing is generated at runtime; each `detail` is the full prompt text
 * the user copies into their own AI tool.
 *
 * Each prompt uses [PLACEHOLDERS] the user fills in before pasting, and
 * includes an honesty guard ("use only facts I provide", "[UNVERIFIED]")
 * so AI-drafted scripts do not invent facts as facts.
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

export const TRACKER_ITEMS: TrackerItem[] = [
  // ------------------------------------------------------------------
  // DOCUMENTARY (12)
  // ------------------------------------------------------------------
  {
    id: "documentary-true-crime-case",
    label: "Documentary: True crime case script",
    detail:
      "Write a faceless true-crime documentary script about [CASE NAME] for a [X]-minute YouTube video. Structure: cold-open hook with the most shocking verified fact, a chronological timeline of events, key evidence and investigator quotes (use only facts I provide: [FACTS]), unresolved questions, and a respectful closing. Tone: serious, never sensationalized. Mark anything uncertain as [UNVERIFIED] — do not invent dialogue or evidence.",
  },
  {
    id: "documentary-history-event",
    label: "Documentary: History event deep dive",
    detail:
      "Write a faceless documentary narration script about [HISTORICAL EVENT] for a [X]-minute video aimed at [AUDIENCE]. Structure: hook with the event's most dramatic moment, background context (who, where, when), the event itself in 4 chronological beats, causes and consequences, and why it still matters today. Use only facts I provide: [FACTS]. End with 2 discussion questions for the comments.",
  },
  {
    id: "documentary-nature-episode",
    label: "Documentary: Nature episode narration",
    detail:
      "Write a narration script for a faceless nature documentary segment about [ANIMAL / PLACE], [X] minutes long. Open with a striking behavior or fact, then follow one day in the subject's life across 4 scenes, each with a suggested B-roll cue in [brackets]. End with a conservation note. Tone: [TONE — e.g. calm and cinematic]. Use only facts I provide: [FACTS]; never invent statistics.",
  },
  {
    id: "documentary-space-topic",
    label: "Documentary: Space and science topic",
    detail:
      "Write a faceless space-documentary narration script about [TOPIC — e.g. black holes] for a [X]-minute video. Structure: a mind-bending hook, the basics explained with one everyday analogy per concept, 3 verified discoveries with dates, what scientists still do not know, and a wonder-filled closing. Explain every technical term the first time it appears. Use only facts I provide: [FACTS].",
  },
  {
    id: "documentary-biography",
    label: "Documentary: Person biography",
    detail:
      "Write a faceless biography documentary script about [PERSON] for a [X]-minute video. Structure: hook with their defining achievement, early life and what shaped them, 3 turning points in their career, controversies addressed fairly with sources I provide: [SOURCES], and their legacy in one closing paragraph. Tone: [TONE]. Do not invent quotes — use only quotes I provide: [QUOTES].",
  },
  {
    id: "documentary-unsolved-mystery",
    label: "Documentary: Unsolved mystery",
    detail:
      "Write a faceless unsolved-mystery documentary script about [MYSTERY] for a [X]-minute video. Structure: hook with the strangest verified detail, the timeline of what is known, the 3 leading theories with the evidence for each, what investigators say today, and an open-ended closing. Clearly label theories as theories — never present speculation as fact. Facts I provide: [FACTS].",
  },
  {
    id: "documentary-business-rise-fall",
    label: "Documentary: Business rise and fall",
    detail:
      "Write a faceless business documentary script about the rise and fall of [COMPANY] for a [X]-minute video. Structure: hook with the peak moment, the founding story, 3 decisions that drove growth, the turning point where it went wrong, and 3 lessons for entrepreneurs. Use only facts I provide: [FACTS]. Tone: analytical, not gossipy — explain the business logic behind each move.",
  },
  {
    id: "documentary-sports-story",
    label: "Documentary: Sports story",
    detail:
      "Write a faceless sports documentary narration script about [ATHLETE / TEAM / MATCH] for a [X]-minute video. Structure: hook with the climactic moment, the backstory and the odds stacked against them, the journey in 4 beats with play-by-play energy, the result, and what it meant for the sport. Use only facts I provide: [FACTS]. Write in present tense for the action scenes to build tension.",
  },
  {
    id: "documentary-ancient-civilization",
    label: "Documentary: Ancient civilization",
    detail:
      "Write a faceless documentary narration script about [CIVILIZATION] for a [X]-minute video. Structure: hook with their most impressive achievement, where and when they lived, daily life in 3 scenes (morning, work, evening), their greatest mystery, and what caused their decline — presenting competing theories fairly. Use only facts I provide: [FACTS].",
  },
  {
    id: "documentary-technology-evolution",
    label: "Documentary: Technology evolution",
    detail:
      "Write a faceless documentary script tracing the evolution of [TECHNOLOGY] for a [X]-minute video. Structure: hook with the earliest version, 5 milestones in chronological order (each with year and what changed), the inventors behind them, how it changed everyday life, and where it is heading next. Use only facts I provide: [FACTS]. Keep the tone curious and accessible for [AUDIENCE].",
  },
  {
    id: "documentary-disaster-event",
    label: "Documentary: Disaster event (respectful)",
    detail:
      "Write a respectful faceless documentary script about [DISASTER EVENT] for a [X]-minute video. Structure: context before the event, a factual timeline of what happened (no graphic sensationalism), the human response and rescue efforts, the aftermath and lessons learned, and a tribute-style closing. Use only facts I provide: [FACTS]. Tone: solemn and factual — never exploit suffering for views.",
  },
  {
    id: "documentary-hidden-places",
    label: "Documentary: Hidden and unknown places",
    detail:
      "Write a faceless documentary narration script about [HIDDEN PLACE] for a [X]-minute video. Structure: hook with what makes it inaccessible or unknown, its history and how it was discovered, 3 fascinating details, why few people visit, and whether it should stay hidden. Use only facts I provide: [FACTS]. End with a map-style B-roll cue in [brackets] for the location reveal.",
  },

  // ------------------------------------------------------------------
  // EXPLAINER (12)
  // ------------------------------------------------------------------
  {
    id: "explainer-how-it-works",
    label: "Explainer: How it works",
    detail:
      "Write a faceless explainer video script answering 'How does [THING] work?' for [AUDIENCE], [X] minutes long. Structure: hook with the surprising part, the simple version in 3 steps, then the detailed version with one analogy per step, 2 common misconceptions corrected, and a one-paragraph recap. Explain every technical term on first use. Facts I provide: [FACTS].",
  },
  {
    id: "explainer-science-concept",
    label: "Explainer: Science concept simplified",
    detail:
      "Write a faceless explainer script that teaches [SCIENCE CONCEPT] to [AUDIENCE] in [X] minutes. Structure: hook with a real-world question it answers, the concept explained with 2 everyday analogies, a step-by-step walkthrough of how it happens, why it matters in daily life, and a 30-second summary. No equations without a plain-language translation. Facts I provide: [FACTS].",
  },
  {
    id: "explainer-money-topic",
    label: "Explainer: Money and finance concept",
    detail:
      "Write a faceless explainer script about [MONEY TOPIC — e.g. compound interest] for beginners, [X] minutes long. Structure: hook with a relatable money scenario, the concept in plain language, a worked example with simple numbers I provide: [NUMBERS], 3 mistakes beginners make, and one action step. Tone: friendly, never preachy. This is educational content, not financial advice — include the line: 'This is for education only, not financial advice.'",
  },
  {
    id: "explainer-tech-trend",
    label: "Explainer: Tech trend breakdown",
    detail:
      "Write a faceless explainer script about [TECH TREND] for a [X]-minute video aimed at [AUDIENCE]. Structure: hook with the trend's boldest claim, what it actually is in one paragraph, 3 real examples of it in use, who benefits and who should be skeptical, and a balanced verdict. Do not hype — present the strongest criticism fairly. Facts I provide: [FACTS].",
  },
  {
    id: "explainer-psychology-effect",
    label: "Explainer: Psychology effect",
    detail:
      "Write a faceless explainer script about [PSYCHOLOGICAL EFFECT] for a [X]-minute video. Structure: hook with an everyday situation where it shows up, the effect explained simply, the classic experiment behind it (with year and researchers), 3 daily-life examples, and how to notice it in yourself. Tone: curious and conversational. Use only facts I provide: [FACTS].",
  },
  {
    id: "explainer-history-why",
    label: "Explainer: Why it happened (history)",
    detail:
      "Write a faceless explainer script answering 'Why did [EVENT] happen?' for a [X]-minute video. Structure: hook with the surprising outcome, the 3 root causes in order of importance (each with evidence), the spark that set it off, what could have prevented it, and the lesson for today. Present causes as the consensus of the sources I provide: [SOURCES].",
  },
  {
    id: "explainer-health-topic",
    label: "Explainer: Health topic (with disclaimer)",
    detail:
      "Write a faceless explainer script about [HEALTH TOPIC] for a [X]-minute video aimed at [AUDIENCE]. Structure: hook with a common question, what the topic means in plain language, what current research says (cite only studies I provide: [STUDIES]), 3 practical takeaways, and a closing disclaimer: 'This is general information, not medical advice — talk to a professional about your situation.' Never diagnose or prescribe.",
  },
  {
    id: "explainer-law-simplified",
    label: "Explainer: Law or policy simplified",
    detail:
      "Write a faceless explainer script that simplifies [LAW / POLICY] for [AUDIENCE] in [X] minutes. Structure: hook with who it affects most, what the rule says in plain language, 3 real scenarios showing how it applies, common misunderstandings corrected, and where to read the official text: [OFFICIAL SOURCE]. Use only facts I provide: [FACTS]. This is general information, not legal advice.",
  },
  {
    id: "explainer-vs-comparison",
    label: "Explainer: X vs Y comparison",
    detail:
      "Write a faceless explainer script comparing [X] vs [Y] for a [X]-minute video. Structure: hook with the question everyone asks, what each one is in 2 sentences, a 4-round comparison (round per criterion: [CRITERIA]), a scorecard summary, and a verdict: who should pick X, who should pick Y. Be fair to both sides. Facts I provide: [FACTS].",
  },
  {
    id: "explainer-myth-debunked",
    label: "Explainer: Myth debunked",
    detail:
      "Write a faceless explainer script debunking the myth '[MYTH]' in [X] minutes. Structure: hook stating the myth as most people believe it, why it sounds believable, the evidence against it (cite sources I provide: [SOURCES]), what is actually true, and why the myth persists. Tone: respectful — never mock people who believed it. End with one shareable one-liner summarizing the truth.",
  },
  {
    id: "explainer-beginner-guide",
    label: "Explainer: Beginner guide to a skill",
    detail:
      "Write a faceless beginner-guide video script for [SKILL] in [X] minutes, aimed at total beginners. Structure: hook with what the viewer will be able to do by the end, the 3 things to set up first, the core skill broken into 5 ordered steps (each with an on-screen cue in [brackets]), the 3 mistakes every beginner makes, and a 7-day practice plan. Tone: encouraging and patient.",
  },
  {
    id: "explainer-data-story",
    label: "Explainer: Data and trend story",
    detail:
      "Write a faceless explainer script telling the story behind [DATA / TREND] for a [X]-minute video. Structure: hook with the single most surprising number, what the data measures and where it comes from: [DATA SOURCE], the trend explained in 3 phases, what experts say it means, and what to watch next. Describe each chart for the visuals in [brackets]. Never invent numbers — use only the data I provide: [DATA].",
  },

  // ------------------------------------------------------------------
  // LISTICLE (12)
  // ------------------------------------------------------------------
  {
    id: "listicle-top-facts",
    label: "Listicle: Top N facts",
    detail:
      "Write a faceless listicle video script: '[N] fascinating facts about [TOPIC]' for a [X]-minute video. Structure: fast hook promising the best fact, then [N] numbered facts — each with a one-line setup, the fact, and a 'why it matters' line. Save the most surprising fact for last. Suggest a B-roll cue in [brackets] per fact. Use only facts I provide: [FACTS].",
  },
  {
    id: "listicle-mistakes-to-avoid",
    label: "Listicle: Mistakes to avoid",
    detail:
      "Write a faceless listicle script: '[N] mistakes to avoid when [ACTIVITY]' for [AUDIENCE], [X] minutes long. Structure: hook with the costliest mistake, then [N] numbered mistakes — each with what people do wrong, why it backfires, and what to do instead. End with a checklist-style recap of the fixes. Tone: helpful coach, never judgmental.",
  },
  {
    id: "listicle-tools-roundup",
    label: "Listicle: Tools and apps roundup",
    detail:
      "Write a faceless roundup script: '[N] best [TOOL TYPE] for [USE CASE]' for a [X]-minute video. Structure: hook with the selection criteria, then [N] tools — each with what it does, who it is best for, and one honest drawback. Rank them and name a clear winner with reasons. Do not invent features or prices — use only the details I provide: [TOOL DETAILS].",
  },
  {
    id: "listicle-tips-tricks",
    label: "Listicle: Tips and tricks",
    detail:
      "Write a faceless listicle script: '[N] [TOPIC] tips and tricks' for [AUDIENCE], [X] minutes long. Structure: hook with the tip that saves the most time, then [N] numbered tips — each with the trick, exactly how to do it in 3 steps, and when to use it. Order from beginner to advanced. End with the one tip to try today. Suggest on-screen text in [brackets] for each step.",
  },
  {
    id: "listicle-records-extremes",
    label: "Listicle: Records and extremes",
    detail:
      "Write a faceless listicle script: '[N] most extreme [THINGS] in [CATEGORY]' for a [X]-minute video. Structure: hook with the number-one record, then count down from [N] to 1 — each entry with the record, the holder, and the story behind it. Build excitement toward number 1. Use only verified records I provide: [RECORDS] — never invent a record.",
  },
  {
    id: "listicle-lessons-learned",
    label: "Listicle: Lessons learned",
    detail:
      "Write a faceless listicle script: '[N] lessons I learned from [EXPERIENCE]' narrated in first person, [X] minutes long. Structure: hook with the hardest lesson, then [N] numbered lessons — each with the story of what happened, what it taught me, and the takeaway for the viewer. Tone: honest and reflective, like advice to a friend. Base every lesson on details I provide: [DETAILS].",
  },
  {
    id: "listicle-habits",
    label: "Listicle: Habits list",
    detail:
      "Write a faceless listicle script: '[N] habits of [SUCCESSFUL GROUP]' for [AUDIENCE], [X] minutes long. Structure: hook with the habit that matters most, then [N] numbered habits — each with what the habit is, why it works (one line of reasoning), and how to start it this week. End with a 'start with just one' message. Avoid preaching; sound like a peer sharing what worked.",
  },
  {
    id: "listicle-ideas-list",
    label: "Listicle: Ideas list",
    detail:
      "Write a faceless listicle script: '[N] [TOPIC] ideas for [AUDIENCE]' for a [X]-minute video. Structure: hook with the most creative idea, then [N] numbered ideas — each with the idea in one line, who it suits, and a quick way to start. Mix easy wins with ambitious picks. Suggest a visual cue in [brackets] per idea. End by asking viewers to comment their favorite.",
  },
  {
    id: "listicle-red-flags",
    label: "Listicle: Red flags and warning signs",
    detail:
      "Write a faceless listicle script: '[N] red flags to watch for in [SITUATION]' for [AUDIENCE], [X] minutes long. Structure: hook with the red flag most people miss, then [N] numbered warning signs — each with the sign, why it matters, and what to do if you spot it. Tone: protective big-sibling, not fear-mongering. End with 2 green flags (good signs) for balance.",
  },
  {
    id: "listicle-underrated",
    label: "Listicle: Underrated things",
    detail:
      "Write a faceless listicle script: '[N] most underrated [THINGS] in [CATEGORY]' for a [X]-minute video. Structure: hook arguing the category is slept on, then [N] entries — each with what it is, why people overlook it, and why it deserves more love. Passionate fan tone, like recommending a hidden gem to a friend. Base picks on details I provide: [DETAILS].",
  },
  {
    id: "listicle-timeline",
    label: "Listicle: Timeline of events",
    detail:
      "Write a faceless timeline script: 'The complete timeline of [TOPIC]' for a [X]-minute video. Structure: hook with the final outcome, then walk through [N] dated events in order — each with the date, what happened, and why it mattered. Use on-screen date graphics cues in [brackets]. End by connecting the timeline to the present day. Use only facts I provide: [FACTS].",
  },
  {
    id: "listicle-before-after",
    label: "Listicle: Before and after transformations",
    detail:
      "Write a faceless listicle script: '[N] incredible before-and-after [TRANSFORMATIONS]' for a [X]-minute video. Structure: hook with the most dramatic change, then [N] entries — each with the 'before' state, what changed, and the 'after' result with a suggested split-screen visual cue in [brackets]. End with the common thread behind all of them. Base every entry on details I provide: [DETAILS].",
  },

  // ------------------------------------------------------------------
  // STORY (12)
  // ------------------------------------------------------------------
  {
    id: "story-reddit-style",
    label: "Story: Reddit-style story narration",
    detail:
      "Write a faceless story-narration script in the style of a Reddit story post about [SITUATION], [X] minutes long. Structure: title-style hook as the opening line, background setup in 60 seconds, the story in 4 escalating beats, the climax, and the aftermath plus the 'update' twist. Narrate in first person, conversational internet tone. Base the story on details I provide: [DETAILS].",
  },
  {
    id: "story-moral-tale",
    label: "Story: Moral tale",
    detail:
      "Write a faceless moral-story narration script about [CHARACTER] who learns [LESSON], [X] minutes long. Structure: introduce the character and their flaw, the choice that sets the story in motion, the consequences in 3 beats, the moment of realization, and the moral stated once, clearly, at the end — never preached mid-story. Warm storyteller tone suitable for [AUDIENCE].",
  },
  {
    id: "story-motivational",
    label: "Story: Motivational story",
    detail:
      "Write a faceless motivational story narration about [PERSON / CHARACTER] overcoming [OBSTACLE], [X] minutes long. Structure: hook with the lowest moment, the backstory of the struggle, the turning point decision, the climb in 3 beats, and the triumph plus one line the viewer can carry with them. Inspirational but grounded — no toxic positivity; acknowledge the hard parts honestly.",
  },
  {
    id: "story-horror",
    label: "Story: Horror narration",
    detail:
      "Write a faceless horror narration script about [PREMISE] for a [X]-minute video. Structure: an unsettling hook in the first 20 seconds, slow-burn setup with 3 creepy details, escalation in 3 beats, the scare, and a lingering final line. Build dread through sound and silence cues in [brackets]. No gore for shock value — psychological horror. Suitable for [AUDIENCE AGE RANGE].",
  },
  {
    id: "story-true-scary-experience",
    label: "Story: True scary experience",
    detail:
      "Write a faceless narration script of a true scary experience: [BRIEF DESCRIPTION], [X] minutes long, first person. Structure: normal-day setup, the first wrong detail, escalation in 3 beats, the peak moment, and the aftermath plus what was never explained. Present it as the narrator's experience using details I provide: [DETAILS] — do not add supernatural claims I did not give you.",
  },
  {
    id: "story-success-journey",
    label: "Story: Success journey",
    detail:
      "Write a faceless success-story narration about [PERSON / BUSINESS] going from [STARTING POINT] to [ACHIEVEMENT], [X] minutes long. Structure: hook with the achievement, the humble beginning, the 3 key decisions or breaks, the hardest setback and how they recovered, and 3 takeaways for the viewer. Use only facts I provide: [FACTS]. Inspiring tone grounded in real effort, not luck.",
  },
  {
    id: "story-failure-lesson",
    label: "Story: Failure to lesson",
    detail:
      "Write a faceless narration script about [FAILURE] and the lesson it taught, [X] minutes long, first person. Structure: hook with the moment it all went wrong, what led up to it in 3 beats, the fallout (be honest about the cost), the slow recovery, and the lesson stated as advice to the viewer's past self. Vulnerable, reflective tone — like telling a friend what you wish you knew.",
  },
  {
    id: "story-mystery-short",
    label: "Story: Short mystery",
    detail:
      "Write a faceless short-mystery narration script about [PREMISE] for a [X]-minute video. Structure: hook with the impossible detail, introduce the 2-3 characters, plant 3 clues naturally in the story, the revelation that reframes everything, and a final line that lands the twist. Fair-play mystery: every clue needed for the solution must appear before the reveal.",
  },
  {
    id: "story-historical-fiction",
    label: "Story: Historical fiction vignette",
    detail:
      "Write a faceless historical-fiction vignette set in [TIME AND PLACE], [X] minutes long. Structure: immersive opening with 3 sensory details, introduce [CHARACTER] and their ordinary day, the historical event that interrupts it, their choice, and a quiet closing image. Keep period details accurate using facts I provide: [FACTS]. Mark invented character moments as fiction in a closing note.",
  },
  {
    id: "story-animal-tale",
    label: "Story: Animal tale",
    detail:
      "Write a faceless animal-story narration about [ANIMAL] and [SITUATION], [X] minutes long. Structure: hook with the animal's most striking trait, the setup of their world, the challenge in 3 beats, the emotional peak, and a gentle closing. Warm, cinematic tone. If based on a true story, use only facts I provide: [FACTS]; if fictional, say so in the opening line.",
  },
  {
    id: "story-wholesome",
    label: "Story: Wholesome and uplifting",
    detail:
      "Write a faceless wholesome-story narration about [KIND ACT / EVENT], [X] minutes long. Structure: hook with the small moment that started it, the chain of kindness in 3 beats, the ripple effect on others, and a closing line about what it proves. Genuine warmth, zero cynicism — let the story earn the emotion. Base it on details I provide: [DETAILS].",
  },
  {
    id: "story-plot-twist",
    label: "Story: Plot-twist story",
    detail:
      "Write a faceless plot-twist story narration about [PREMISE] for a [X]-minute video. Structure: hook that sets up the expected story, build the 'obvious' narrative in 3 beats while planting 3 subtle clues in [brackets], the twist that flips the meaning of everything, and one final line that reframes the opening. The twist must be surprising but fair — the clues were there all along.",
  },
];

/** Progress line for the library tracker UI. */
export function describeProgress(checked: number, total: number): string {
  if (total <= 0) return "The library is empty.";
  const c = Math.max(0, Math.min(total, Math.floor(checked)));
  if (c === 0)
    return `0 of ${total} prompts marked as tried. Browse the library and mark the ones you use.`;
  if (c >= total)
    return `All ${total} prompts marked as tried. Time to put them to work — publish something.`;
  return `${c} of ${total} prompts marked as tried.`;
}
