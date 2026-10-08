/**
 * Viral Format Swipe File (tool-342) — pure logic, zero imports.
 *
 * FIXED REFERENCE, NOT AI (inventory type corrected generator -> library):
 * 48 human-written format cards in 8 fixed categories (6 each). Each card
 * breaks down a well-known content format's structure and includes a
 * copyable example prompt template. This is a reference of patterns —
 * it does not predict virality and makes no reach or engagement promises.
 *
 * Categories (6 cards each, 48 total):
 *   hooks        — Hook-first formats
 *   storytelling — Storytelling formats
 *   listicle     — List-based formats
 *   comparison   — Comparison formats
 *   tutorial     — Tutorial formats
 *   behindscenes — Behind-the-scenes formats
 *   ugc          — UGC and testimonial formats
 *   repurposing  — Repurposing formats
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/**
 * The full swipe file. `detail` is the copyable format breakdown +
 * example prompt template (the UI's Copy button copies this verbatim).
 */
export const TRACKER_ITEMS: TrackerItem[] = [
  // --- Hook-first formats ---
  {
    id: "hooks-bold-claim",
    label: "Hooks: Bold claim opener",
    detail:
      "STRUCTURE: State a strong, defensible claim in the first line — then spend the rest proving it. Works because readers stay to see if you are right.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] about [TOPIC] that opens with a bold but honest claim about [CLAIM]. Follow it with 3 pieces of evidence, then a one-line CTA. Tone: [TONE].\"",
  },
  {
    id: "hooks-confession",
    label: "Hooks: Confession opener",
    detail:
      "STRUCTURE: The opening line is a confession: 'I was wrong about [X].' Admit a mistake or changed mind, then explain what changed it. Works because honesty disarms skepticism.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] opening with my honest confession: I was wrong about [TOPIC]. Explain what I believed, what changed my mind, and what I believe now. Tone: humble, direct.\"",
  },
  {
    id: "hooks-number-drop",
    label: "Hooks: Specific number opener",
    detail:
      "STRUCTURE: Lead with an exact number — 'I tested 14 tools' beats 'I tested some tools'. Specificity reads as credibility.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] about [TOPIC] that opens with the exact number [NUMBER] and what it counts. Then reveal the 3 most surprising findings. Use only numbers I provide.\"",
  },
  {
    id: "hooks-question-pain",
    label: "Hooks: Pain-point question",
    detail:
      "STRUCTURE: Ask the exact question your reader is silently asking, worded like they would say it. Then answer it directly.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] about [TOPIC] that opens with the question '[READER QUESTION]' and answers it in plain language in under [N] sections.\"",
  },
  {
    id: "hooks-timeframe",
    label: "Hooks: Timeframe transformation",
    detail:
      "STRUCTURE: '[RESULT] in [TIMEFRAME]' — then show the before state, the one change, and the after state. The constraint makes it believable.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] about how [SUBJECT] achieved [RESULT] in [TIMEFRAME]. Structure: the starting point, the single biggest change, the result. Only use facts I provide.\"",
  },
  {
    id: "hooks-myth-bust",
    label: "Hooks: Myth-busting opener",
    detail:
      "STRUCTURE: Name the myth ('Everyone says [X]'), say why it is wrong, then give the better rule. Works because readers love being corrected gently.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] debunking the myth '[COMMON MYTH]' about [TOPIC]. Explain why people believe it, why it is wrong, and what to do instead. Tone: [TONE].\"",
  },
  // --- Storytelling ---
  {
    id: "storytelling-failure-lesson",
    label: "Storytelling: Failure to lesson",
    detail:
      "STRUCTURE: What I tried → what went wrong → what I learned → what I do now. The failure makes the lesson land.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] telling the story of my failed attempt at [GOAL]. Cover: what I tried, exactly how it failed, the one lesson, and what I do differently now. Honest tone, no exaggeration.\"",
  },
  {
    id: "storytelling-day-in-life",
    label: "Storytelling: Day-in-the-life",
    detail:
      "STRUCTURE: A real day, told in beats: morning reality, the work, the surprise, the reflection. Readers watch for the relatable moments.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] as a day-in-my-life as a [ROLE] working on [TOPIC]. Use time-stamped beats, include one honest struggle, and end with what the day taught me.\"",
  },
  {
    id: "storytelling-origin",
    label: "Storytelling: Origin story",
    detail:
      "STRUCTURE: Where I started → the turning point → where I am → why I help people like you. Builds trust fast.\n\nPROMPT TEMPLATE: \"Write my origin story as a [POST/VIDEO]: where I started with [TOPIC], the turning point that changed everything, where I am now, and why I help [AUDIENCE]. Keep it under [N] paragraphs.\"",
  },
  {
    id: "storytelling-client-journey",
    label: "Storytelling: Client journey",
    detail:
      "STRUCTURE: Client's starting pain → the process → the turning point → the outcome. Use verified facts only — never invent results.\n\nPROMPT TEMPLATE: \"Write a client story [POST/VIDEO] about [CLIENT TYPE]: their situation before, what we did together, the turning point, and the verified result: [RESULT]. Only use facts I provide.\"",
  },
  {
    id: "storytelling-behind-decision",
    label: "Storytelling: Behind a decision",
    detail:
      "STRUCTURE: The options I considered → why I chose what I did → what happened → what I would change. Readers love seeing how decisions get made.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] explaining why I decided [DECISION] about [TOPIC]. Show the options, my reasoning, the outcome so far, and one thing I would do differently.\"",
  },
  {
    id: "storytelling-letter",
    label: "Storytelling: Letter to my past self",
    detail:
      "STRUCTURE: 'Dear [past self], here's what you need to know about [X].' Three pieces of hard-won advice. Intimate and shareable.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] as a letter to myself [N] years ago about [TOPIC]. Give 3 pieces of advice I wish I had known, each with one short reason. Warm, direct tone.\"",
  },
  // --- List-based ---
  {
    id: "listicle-tools-stack",
    label: "Listicles: Tools stack list",
    detail:
      "STRUCTURE: Numbered list of tools with one line each on what it does and who it is for. Update regularly — stale tool lists kill trust.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] listing my [N] favorite tools for [TASK]. For each: name, one line on what it does, and who it is best for. Only include tools I have actually used: [TOOL LIST].\"",
  },
  {
    id: "listicle-mistakes",
    label: "Listicles: Mistakes to avoid",
    detail:
      "STRUCTURE: The [N] mistakes beginners make with [X], each with the fix. High save-rate format — readers bookmark it.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] on the [N] biggest mistakes beginners make with [TOPIC]. For each mistake: what it looks like, why it hurts, and the one-line fix.\"",
  },
  {
    id: "listicle-lessons-learned",
    label: "Listicles: Lessons learned list",
    detail:
      "STRUCTURE: '[N] things I learned about [X] after [TIME/EXPERIENCE]'. Each lesson is one bold line plus one sentence of proof.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO]: '[N] things I learned about [TOPIC] after [EXPERIENCE]'. Each lesson is one bold line followed by one sentence explaining it. Honest, specific, no fluff.\"",
  },
  {
    id: "listicle-quick-wins",
    label: "Listicles: Quick wins",
    detail:
      "STRUCTURE: [N] improvements the reader can make today, each doable in under 10 minutes. Actionable formats get shared.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] with [N] quick wins for [TOPIC] — each completable in under 10 minutes. For each: the action, the expected effect, one sentence on how to do it.\"",
  },
  {
    id: "listicle-unpopular-opinions",
    label: "Listicles: Unpopular opinions",
    detail:
      "STRUCTURE: '[N] unpopular opinions about [X]' — defensible contrarian takes, each with reasoning. Sparks comments.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] with [N] unpopular but defensible opinions about [TOPIC]. Each gets one paragraph of reasoning. Opinionated but fair — no strawmen.\"",
  },
  {
    id: "listicle-free-resources",
    label: "Listicles: Free resources roundup",
    detail:
      "STRUCTURE: Curated list of free resources with what each one is good for. Curated beats comprehensive — quality over quantity.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] rounding up [N] genuinely useful free resources for [TOPIC]. For each: name, link placeholder, one line on who it helps most. Only include resources I have vetted.\"",
  },
  // --- Comparison ---
  {
    id: "comparison-x-vs-y",
    label: "Comparisons: X vs Y",
    detail:
      "STRUCTURE: Head-to-head on the criteria that matter, a verdict for each use case, then a recommendation. Readers come for the verdict.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] comparing [OPTION A] vs [OPTION B] for [USE CASE]. Compare on: [CRITERION 1], [CRITERION 2], [CRITERION 3]. Give a verdict per use case and one overall pick, with reasons.\"",
  },
  {
    id: "comparison-before-after",
    label: "Comparisons: Before vs after",
    detail:
      "STRUCTURE: Show the before state and after state side by side — metrics, screenshots, or descriptions. The contrast does the selling.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] showing before vs after of [PROJECT/SUBJECT]. Describe the before state honestly, list what changed, and show the after state with verified facts only.\"",
  },
  {
    id: "comparison-expectation-reality",
    label: "Comparisons: Expectation vs reality",
    detail:
      "STRUCTURE: What people expect about [X] → what it is actually like → why the gap exists. Relatable and honest.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] on expectation vs reality for [TOPIC]. Three parts: what beginners expect, what it is really like, and why the gap exists. Tone: honest, a little funny.\"",
  },
  {
    id: "comparison-beginner-expert",
    label: "Comparisons: Beginner vs expert approach",
    detail:
      "STRUCTURE: How a beginner handles [X] vs how an expert does — same task, different thinking. Readers self-sort into the levels.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] comparing how a beginner vs an expert handles [TASK]. For each level: what they focus on, their typical mistake, and the expert's one key insight.\"",
  },
  {
    id: "comparison-old-new",
    label: "Comparisons: Old way vs new way",
    detail:
      "STRUCTURE: The old way (and why people did it) → the new way → why it is better → when the old way still wins. Fairness builds authority.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] on the old way vs the new way of [TASK]. Explain why the old way existed, what changed, and be honest about when the old way still wins.\"",
  },
  {
    id: "comparison-tier-list",
    label: "Comparisons: Tier list ranking",
    detail:
      "STRUCTURE: Rank [items] into S/A/B/C tiers with one-line reasons. Rankings invite debate — and debate drives engagement.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] ranking these [ITEMS] into S, A, B, C tiers for [USE CASE]: [ITEM LIST]. Give one line of reasoning per placement and name my criteria first.\"",
  },
  // --- Tutorial ---
  {
    id: "tutorial-step-by-step",
    label: "Tutorials: Step-by-step guide",
    detail:
      "STRUCTURE: The outcome → prerequisites → numbered steps → common mistakes → what to do next. Every step must be actually followable.\n\nPROMPT TEMPLATE: \"Write a step-by-step [POST/VIDEO] teaching [AUDIENCE] how to [GOAL]. Include: the result they will get, what they need first, [N] numbered steps, and 3 common mistakes. Test-logic only — no invented steps.\"",
  },
  {
    id: "tutorial-mistake-fix",
    label: "Tutorials: Fix one specific problem",
    detail:
      "STRUCTURE: The exact problem → why it happens → the fix, step by step → how to prevent it. Hyper-specific tutorials rank and get saved.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] fixing this exact problem: [PROBLEM]. Explain why it happens in one paragraph, then the fix as numbered steps, then one line on preventing it.\"",
  },
  {
    id: "tutorial-zero-to-result",
    label: "Tutorials: Zero to result",
    detail:
      "STRUCTURE: Start from nothing, end with a finished result — document the whole path including the messy middle. The completeness is the value.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] taking [AUDIENCE] from zero to [RESULT] with [TOPIC]. Every step in order, including the parts where things get confusing. End with what to do next.\"",
  },
  {
    id: "tutorial-screen-walkthrough",
    label: "Tutorials: Screen walkthrough script",
    detail:
      "STRUCTURE: What the viewer sees → what to click → what happens → next step. Written for recording, not reading.\n\nPROMPT TEMPLATE: \"Write a screen-recording script [POST/VIDEO] for [TASK] in [TOOL]. For each step: what is on screen, exactly what to click, and what the viewer should notice. Spoken language, short sentences.\"",
  },
  {
    id: "tutorial-cheat-sheet",
    label: "Tutorials: Cheat sheet / reference",
    detail:
      "STRUCTURE: A one-screen reference guide for [TOPIC]: the commands, the key settings, the gotchas. Reference formats get bookmarked forever.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] cheat sheet for [TOPIC]: the [N] essentials on one page — commands, key settings, and the 3 gotchas. Dense, scannable, no storytelling.\"",
  },
  {
    id: "tutorial-faq-answers",
    label: "Tutorials: FAQ answer bank",
    detail:
      "STRUCTURE: A question-and-answer guide: the [N] questions everyone asks about [X], each answered in 2-3 sentences. Great for SEO and support deflection.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] answering the [N] most common questions about [TOPIC]. Each answer in 2-3 plain sentences. Order from most asked to least.\"",
  },
  // --- Behind the scenes ---
  {
    id: "behindscenes-process",
    label: "Behind the scenes: My process",
    detail:
      "STRUCTURE: How I actually do [X] — the tools, the order, the shortcuts, the ugly parts. Transparency is the whole appeal.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] showing my real process for [TASK]: the tools I use, the steps in order, my shortcuts, and the part I still find annoying. No glamorizing.\"",
  },
  {
    id: "behindscenes-numbers",
    label: "Behind the scenes: Real numbers",
    detail:
      "STRUCTURE: Share real numbers — revenue, costs, time, mistakes. Use only numbers you can verify; never invent them.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] sharing my real numbers for [PROJECT]: [METRIC 1], [METRIC 2], [METRIC 3]. Context for each number, what surprised me, one lesson. Only use numbers I provide.\"",
  },
  {
    id: "behindscenes-workspace",
    label: "Behind the scenes: Workspace / setup tour",
    detail:
      "STRUCTURE: The setup, piece by piece, with why each piece exists. People love optimizing their own setup.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] touring my [WORKSPACE/SETUP] for [TASK]. For each item: what it is, why I chose it, and what I would upgrade next.\"",
  },
  {
    id: "behindscenes-failed-experiment",
    label: "Behind the scenes: Failed experiment",
    detail:
      "STRUCTURE: What I tested → the hypothesis → what actually happened → the takeaway. Failed experiments are content gold because they are rare and honest.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] about my failed experiment with [TEST]. My hypothesis, exactly what I did, what happened, and the one takeaway. Honest, no spin.\"",
  },
  {
    id: "behindscenes-week-review",
    label: "Behind the scenes: Weekly review",
    detail:
      "STRUCTURE: What I shipped → what worked → what didn't → next week's focus. Repeatable formats build a loyal audience.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] as my weekly review for [NICHE]: what I shipped, what worked (with evidence), what didn't, and next week's single focus. Keep it under [N] minutes to read.\"",
  },
  {
    id: "behindscenes-hiring-firing",
    label: "Behind the scenes: Team and delegation",
    detail:
      "STRUCTURE: What I do myself → what I delegate → what I stopped doing. Useful for anyone growing past solo.\n\nPROMPT TEMPLATE: \"Write a [POST/VIDEO] on how I run [PROJECT] as [SOLO/SMALL TEAM]: what I keep, what I delegate to [ROLE/TOOL], what I stopped doing, and the one process that holds it together.\"",
  },
  // --- UGC / testimonial ---
  {
    id: "ugc-review-script",
    label: "UGC: Customer review script",
    detail:
      "STRUCTURE: The problem I had → what I tried → the result. Real, unscripted-sounding reviews outperform polished ads.\n\nPROMPT TEMPLATE: \"Write a natural UGC-style review script for [PRODUCT]: the problem the customer had, what they tried before, and the honest result. 30-45 seconds spoken, casual tone, no hype words.\"",
  },
  {
    id: "ugc-unboxing",
    label: "UGC: Unboxing reaction",
    detail:
      "STRUCTURE: First impression → the details noticed → honest verdict. Authenticity beats production value.\n\nPROMPT TEMPLATE: \"Write an unboxing reaction script for [PRODUCT]: the first impression on opening, 3 details worth noticing, and an honest first verdict. Spoken, unscripted-sounding, 60 seconds.\"",
  },
  {
    id: "ugc-before-after",
    label: "UGC: Before-and-after demo",
    detail:
      "STRUCTURE: Show the before → use the product live → show the after. The transformation must be real and repeatable.\n\nPROMPT TEMPLATE: \"Write a before-and-after demo script for [PRODUCT]: show the starting state, use the product on camera in [N] steps, then show the result. Only promise what the product verifiably does.\"",
  },
  {
    id: "ugc-testimonial-questions",
    label: "UGC: Testimonial interview questions",
    detail:
      "STRUCTURE: Questions that pull out specifics — the situation, the hesitation, the result. Specific testimonials convert.\n\nPROMPT TEMPLATE: \"Write [N] testimonial interview questions for customers of [PRODUCT]: their situation before, what almost stopped them buying, the specific result, and who they would recommend it to.\"",
  },
  {
    id: "ugc-day-in-use",
    label: "UGC: Product in real life",
    detail:
      "STRUCTURE: The product in a normal day — no studio, no script. Relatability is the format's engine.\n\nPROMPT TEMPLATE: \"Write a casual 'product in my real day' script for [PRODUCT]: morning routine, midday use, evening verdict. One honest nitpick included. Under 60 seconds spoken.\"",
  },
  {
    id: "ugc-faq-response",
    label: "UGC: Reply to a common question",
    detail:
      "STRUCTURE: Read the question → answer from experience → show proof. Turns comments into content.\n\nPROMPT TEMPLATE: \"Write a short video script responding to this common question about [PRODUCT]: '[QUESTION]'. Answer from real experience in 3 points, and show the proof on screen.\"",
  },
  // --- Repurposing ---
  {
    id: "repurposing-thread-from-post",
    label: "Repurposing: Blog post to thread",
    detail:
      "STRUCTURE: Hook post → one point per post → recap → CTA. Threads must stand alone — assume no one read the blog.\n\nPROMPT TEMPLATE: \"Turn this blog post into a [N]-post thread: [PASTE POST]. First post is the hook, each following post is one point, last post recaps and links the blog.\"",
  },
  {
    id: "repurposing-video-to-carousel",
    label: "Repurposing: Video to carousel",
    detail:
      "STRUCTURE: One slide per key point, cover slide hooks, last slide CTA. Carousels reuse the video's best lines.\n\nPROMPT TEMPLATE: \"Turn this video script into a [N]-slide carousel: [PASTE SCRIPT]. Slide 1 is the hook, one key point per slide, final slide is the CTA. Under 20 words per slide.\"",
  },
  {
    id: "repurposing-newsletter-digest",
    label: "Repurposing: Content to newsletter digest",
    detail:
      "STRUCTURE: One-line intro → 3-5 curated items with your take → one CTA. Your commentary is the value, not the links.\n\nPROMPT TEMPLATE: \"Turn these [N] pieces of content into a newsletter digest: [PASTE ITEMS]. One-line intro, each item with a 2-sentence take in my voice, one CTA at the end.\"",
  },
  {
    id: "repurposing-quotes-graphics",
    label: "Repurposing: Pull-quote graphics",
    detail:
      "STRUCTURE: Extract the 5-10 most quotable lines → one per graphic → post across a week. Let the content market itself.\n\nPROMPT TEMPLATE: \"Extract the [N] most quotable lines from this piece: [PASTE CONTENT]. Each under 15 words, self-contained, attributed correctly. List them numbered.\"",
  },
  {
    id: "repurposing-long-to-shorts",
    label: "Repurposing: Long video to shorts",
    detail:
      "STRUCTURE: Find the 3-5 standalone moments → hook each one → 30-60 seconds each. Each short must work without context.\n\nPROMPT TEMPLATE: \"Find [N] standalone moments in this long-form script that work as shorts: [PASTE SCRIPT]. For each: the timestamp-worthy moment, a 5-second hook, and the core point in under 60 seconds spoken.\"",
  },
  {
    id: "repurposing-update-refresh",
    label: "Repurposing: Update and refresh old posts",
    detail:
      "STRUCTURE: Audit the old post → update facts and examples → improve structure → republish with a new date. Refreshing beats rewriting from scratch.\n\nPROMPT TEMPLATE: \"Give me a refresh plan for this old post: [PASTE POST]. List: what is outdated, what competitors now cover that it misses, 3 structural improvements, and a new title option.\"",
  },
];

/**
 * Human-readable progress for the swipe file UI.
 */
export function describeProgress(checked: number, total: number): string {
  const safeChecked = Math.max(0, Math.min(Math.floor(checked), Math.max(0, total)));
  const safeTotal = Math.max(0, total);
  if (safeTotal === 0) return "The swipe file is empty.";
  if (safeChecked === 0)
    return `0 of ${safeTotal} formats marked as used. Browse the file and mark the ones you try.`;
  if (safeChecked >= safeTotal)
    return `All ${safeTotal} formats marked as used. Time to make them your own.`;
  return `${safeChecked} of ${safeTotal} formats marked as used.`;
}
