/**
 * AI Voiceover Script Prompt Pack (tool-350) — pure logic, zero imports.
 *
 * FIXED PACK, NOT AI (inventory type corrected generator -> library):
 * 48 human-written, copy-ready voiceover prompt templates — 16 each
 * across 3 categories: ad, narration, explainer. Nothing is generated at
 * runtime; each `detail` is the full prompt text the user copies into
 * their own AI tool.
 *
 * Each prompt includes voice direction (pace, tone, emphasis cues) plus
 * [PLACEHOLDERS] the user fills in before pasting. Pacing guidance uses
 * the common rule of thumb of ~150 spoken words per minute, labeled as
 * a guide rather than a guarantee.
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

export const TRACKER_ITEMS: TrackerItem[] = [
  // ------------------------------------------------------------------
  // AD VOICEOVER (16)
  // ------------------------------------------------------------------
  {
    id: "ad-energetic-retail",
    label: "Ad Voiceover: Energetic retail spot",
    detail:
      "Write a 30-second energetic retail ad voiceover script for [PRODUCT] at [STORE / BRAND]. Voice direction: upbeat, fast-paced, big smile in the voice. Structure: attention-grabbing hook (first 3 seconds), 3 benefits in punchy short lines, the offer: [OFFER], and a strong call to action: [CTA]. Aim for about 75 words. Mark pauses with [pause] and emphasis with CAPS.",
  },
  {
    id: "ad-warm-friendly",
    label: "Ad Voiceover: Warm and friendly",
    detail:
      "Write a 30-second warm, friendly ad voiceover script for [PRODUCT / SERVICE]. Voice direction: conversational, like a trusted neighbor recommending something. Structure: relatable problem opener, the solution in one clear sentence, 2 benefits that solve daily frustrations, and a gentle call to action: [CTA]. Aim for about 75 words. Tone: sincere — avoid hype words like 'amazing' and 'incredible'.",
  },
  {
    id: "ad-calm-luxury",
    label: "Ad Voiceover: Calm luxury brand",
    detail:
      "Write a 30-second calm luxury ad voiceover script for [BRAND / PRODUCT]. Voice direction: slow, deep, unhurried — confidence without shouting. Structure: an evocative opening image, 2 lines on craftsmanship or heritage: [HERITAGE DETAIL], the product name spoken with a pause before and after, and a quiet call to action: [CTA]. Aim for about 60 words. Every word must earn its place — cut ruthlessly.",
  },
  {
    id: "ad-urgent-offer",
    label: "Ad Voiceover: Urgent limited-time offer",
    detail:
      "Write a 20-second urgent ad voiceover script for [OFFER] ending [DEADLINE]. Voice direction: quick, excited, rising energy toward the deadline line. Structure: the deal stated immediately, 2 reasons to act now, the deadline repeated twice, and the call to action: [CTA]. Aim for about 50 words. Urgent but honest — never invent false scarcity.",
  },
  {
    id: "ad-humorous",
    label: "Ad Voiceover: Humorous spot",
    detail:
      "Write a 30-second humorous ad voiceover script for [PRODUCT]. Voice direction: playful, deadpan, comic timing with beats marked as [beat]. Structure: a funny everyday frustration setup, the product as the punchline solution, 2 benefits delivered as jokes, and the call to action as the button: [CTA]. Aim for about 75 words. Keep it clean and brand-safe for [AUDIENCE].",
  },
  {
    id: "ad-authoritative",
    label: "Ad Voiceover: Authoritative expert",
    detail:
      "Write a 30-second authoritative ad voiceover script for [PRODUCT / SERVICE]. Voice direction: steady, confident, expert — the voice of someone who has seen it all. Structure: the problem stated as fact, why most solutions fail (one line), what makes this different: [DIFFERENTIATOR], proof point: [PROOF], and the call to action: [CTA]. Aim for about 75 words. Use only claims I provide: [CLAIMS].",
  },
  {
    id: "ad-ugc-conversational",
    label: "Ad Voiceover: Conversational UGC-style",
    detail:
      "Write a 30-second conversational ad voiceover script for [PRODUCT], in the style of a genuine user review. Voice direction: casual, unscripted-sounding, mid-sentence energy. Structure: 'Okay so I tried [PRODUCT] because [REASON]', 3 honest-sounding observations, one small caveat for believability, and a soft recommendation: [CTA]. Aim for about 75 words. Sound like a real person, not an announcer.",
  },
  {
    id: "ad-cinematic-brand",
    label: "Ad Voiceover: Cinematic brand film",
    detail:
      "Write a 60-second cinematic brand-film voiceover script for [BRAND]. Voice direction: deep, slow, emotional — a movie-trailer whisper that builds. Structure: a universal human truth as the opener, 3 poetic lines connecting the truth to the brand's mission: [MISSION], the brand name as the final word, and a tagline: [TAGLINE]. Aim for about 130 words. Write for the ear — short lines, strong rhythm, no jargon.",
  },
  {
    id: "ad-playful-kids",
    label: "Ad Voiceover: Playful kids product",
    detail:
      "Write a 30-second playful ad voiceover script for [KIDS PRODUCT]. Voice direction: bright, bouncy, full of wonder — fun for kids, reassuring for parents. Structure: an exciting 'imagine this' opener, 3 fun features described as adventures, the parent-friendly benefit: [PARENT BENEFIT], and the call to action: [CTA]. Aim for about 75 words. Simple words only — a 7-year-old should understand every line.",
  },
  {
    id: "ad-professional-b2b",
    label: "Ad Voiceover: Professional B2B",
    detail:
      "Write a 30-second professional B2B ad voiceover script for [PRODUCT / SERVICE] aimed at [JOB TITLES]. Voice direction: crisp, credible, efficient — respects the listener's time. Structure: the business pain in one line, the outcome your product delivers: [OUTCOME], 2 proof points: [PROOF POINTS], and a low-friction call to action: [CTA]. Aim for about 75 words. No buzzwords — plain business language only.",
  },
  {
    id: "ad-soothing-wellness",
    label: "Ad Voiceover: Soothing wellness",
    detail:
      "Write a 30-second soothing ad voiceover script for [WELLNESS PRODUCT / SERVICE]. Voice direction: soft, slow, breathy — a guided-relaxation calm. Structure: permission to slow down, the sensory experience of the product in 3 gentle images, the feeling it leaves: [FEELING], and a soft call to action: [CTA]. Aim for about 60 words. Leave space — mark [pause] between every section.",
  },
  {
    id: "ad-bold-challenger",
    label: "Ad Voiceover: Bold challenger brand",
    detail:
      "Write a 30-second bold challenger-brand ad voiceover script for [BRAND] taking on [INDUSTRY NORM]. Voice direction: defiant, punchy, a little rebellious — a manifesto, not a pitch. Structure: call out the old way in 2 lines, declare the new way, 2 reasons the old way is broken, and the rallying call to action: [CTA]. Aim for about 75 words. Confident, never arrogant.",
  },
  {
    id: "ad-nostalgic",
    label: "Ad Voiceover: Nostalgic",
    detail:
      "Write a 30-second nostalgic ad voiceover script for [PRODUCT / BRAND]. Voice direction: warm, wistful, storytelling — like remembering a good summer. Structure: a sensory memory opener ('Remember when…'), how the brand connects to that feeling, the product as the way back: [CONNECTION], and a gentle call to action: [CTA]. Aim for about 70 words. Earn the emotion — no manipulation.",
  },
  {
    id: "ad-minimal-premium",
    label: "Ad Voiceover: Minimal premium",
    detail:
      "Write a 15-second minimal ad voiceover script for [PREMIUM PRODUCT]. Voice direction: quiet, assured, almost a whisper — luxury says less. Structure: one striking statement about the product, a [pause], the brand name, and the tagline: [TAGLINE]. Aim for under 35 words. If a word does not carry weight, delete it.",
  },
  {
    id: "ad-excited-launch",
    label: "Ad Voiceover: Excited product launch",
    detail:
      "Write a 30-second excited product-launch ad voiceover script for [PRODUCT]. Voice direction: genuine excitement building to the reveal — a drumroll in voice form. Structure: tease ('Something big is coming'), 3 build-up lines about what changes, the big reveal with the product name, the headline feature: [FEATURE], and the call to action: [CTA]. Aim for about 75 words.",
  },
  {
    id: "ad-testimonial-style",
    label: "Ad Voiceover: Testimonial-style",
    detail:
      "Write a 30-second testimonial-style ad voiceover script for [PRODUCT / SERVICE]. Voice direction: genuine, specific, first-person — a real customer's voice. Structure: the problem I had: [CUSTOMER PROBLEM], what I tried before, what changed with [PRODUCT] (use only the results I provide: [RESULTS]), and who I would recommend it to: [CTA]. Aim for about 75 words. Specific details beat adjectives — never invent results.",
  },

  // ------------------------------------------------------------------
  // NARRATION (16)
  // ------------------------------------------------------------------
  {
    id: "narration-documentary",
    label: "Narration: Documentary narration",
    detail:
      "Write a [X]-minute documentary narration voiceover script about [TOPIC]. Voice direction: authoritative yet curious — the trusted guide. Structure: hook with the most compelling fact, context setting, the story in 4 beats with visual cues in [brackets], and a reflective closing. Write for the ear: short sentences, strong verbs. Use only facts I provide: [FACTS].",
  },
  {
    id: "narration-audiobook-fiction",
    label: "Narration: Audiobook fiction",
    detail:
      "Write audiobook narration direction plus a sample passage for [BOOK TITLE / SCENE]. Voice direction: immersive storyteller — distinct but subtle shifts for each character: [CHARACTERS]. Provide: pacing notes (where to slow down, where to rush), 3 emotional peaks marked with direction in (parentheses), and the full narration text of [SCENE DESCRIPTION], about [X] words. Never flatten the emotion — honor the author's tone.",
  },
  {
    id: "narration-audiobook-nonfiction",
    label: "Narration: Audiobook nonfiction",
    detail:
      "Write audiobook narration for a nonfiction chapter about [CHAPTER TOPIC], about [X] words. Voice direction: clear, engaged teacher — interested, never monotone. Provide: the narration text with emphasis marks on key terms, (pause) cues before important conclusions, and a pronunciation guide for difficult terms: [TERMS]. Keep sentences speakable — if a sentence cannot be read aloud in one breath, split it.",
  },
  {
    id: "narration-corporate-film",
    label: "Narration: Corporate brand film",
    detail:
      "Write a 90-second corporate brand-film voiceover script for [COMPANY]. Voice direction: proud, human, forward-looking — a team talking about its own work. Structure: the problem the company exists to solve, the people behind it (humanize with [TEAM DETAIL]), what they built and why it matters, and a vision-of-the-future closing: [VISION]. Aim for about 200 words. Avoid corporate jargon — sound like people, not a press release.",
  },
  {
    id: "narration-elearning",
    label: "Narration: E-learning course",
    detail:
      "Write e-learning narration for a lesson on [LESSON TOPIC], about [X] words. Voice direction: encouraging instructor — patient, clear, upbeat. Structure: what the learner will be able to do (stated as an outcome), the concept in 3 steps with an example each, a quick knowledge check question, and a summary of the takeaway. Mark [pause] where on-screen text should be read. Define every new term on first use.",
  },
  {
    id: "narration-guided-meditation",
    label: "Narration: Guided meditation",
    detail:
      "Write a [X]-minute guided meditation voiceover script for [THEME — e.g. morning calm]. Voice direction: extremely slow, soft, warm — barely above a whisper. Structure: settling in (breath cues), body scan in 4 stages, the visualization: [VISUALIZATION], gentle return, and a closing affirmation. Mark every [pause — 5 seconds] explicitly. Short phrases only — no complex sentences.",
  },
  {
    id: "narration-news-bulletin",
    label: "Narration: News bulletin",
    detail:
      "Write a [X]-minute news bulletin voiceover script covering [STORIES]. Voice direction: neutral, crisp, professional — authority without drama. Structure: headline summary of all stories in 20 seconds, each story in 3 factual sentences (who, what, when — use only facts I provide: [FACTS]), and a sign-off. Never editorialize — report, do not opine. Mark pronunciation for difficult names: [NAMES].",
  },
  {
    id: "narration-travel-documentary",
    label: "Narration: Travel documentary",
    detail:
      "Write a [X]-minute travel documentary voiceover script about [DESTINATION]. Voice direction: wonder-filled explorer — the viewer is discovering it with you. Structure: arrival hook with the first impression, 4 highlights each with a sensory detail and a visual cue in [brackets], one honest practical tip, and a closing that captures the feeling of the place. Use only facts I provide: [FACTS].",
  },
  {
    id: "narration-real-estate-tour",
    label: "Narration: Real estate tour",
    detail:
      "Write a 2-minute real estate tour voiceover script for [PROPERTY]. Voice direction: warm, polished, inviting — selling a lifestyle, not just rooms. Structure: the feeling of arriving, room-by-room in 5 beats (each with one standout feature: [FEATURES]), the neighborhood in 3 lines, and the closing invitation: [CTA]. Aim for about 280 words. Describe light, space, and flow — never invent features not in [PROPERTY DETAILS].",
  },
  {
    id: "narration-nature-documentary",
    label: "Narration: Nature documentary",
    detail:
      "Write a [X]-minute nature documentary voiceover script about [SUBJECT]. Voice direction: reverent, cinematic, unhurried. Structure: a striking behavior as the hook, the subject's world described in 3 sensory scenes, the drama (survival, migration, or hunt) in 3 beats, and a conservation-minded closing. Suggest B-roll cues in [brackets] per scene. Use only facts I provide: [FACTS] — never anthropomorphize beyond what the science supports.",
  },
  {
    id: "narration-historical",
    label: "Narration: Historical narration",
    detail:
      "Write a [X]-minute historical narration voiceover script about [EVENT / ERA]. Voice direction: gravitas with warmth — a great teacher telling the story. Structure: the moment that changed everything as the hook, the world before, the event in 4 chronological beats, the aftermath, and why it matters today. Present contested points as contested using sources I provide: [SOURCES].",
  },
  {
    id: "narration-sports-highlight",
    label: "Narration: Sports highlight reel",
    detail:
      "Write a 60-second sports highlight reel voiceover script for [TEAM / ATHLETE / MATCH]. Voice direction: rising excitement — start controlled, build to the climax. Structure: the stakes in 2 lines, 4 highlight moments in quick succession (each under 10 words of narration), the decisive moment called with full energy, and the final score plus one legacy line. Use only facts I provide: [FACTS].",
  },
  {
    id: "narration-charity-appeal",
    label: "Narration: Charity appeal",
    detail:
      "Write a 60-second charity appeal voiceover script for [CAUSE]. Voice direction: sincere, urgent, human — never manipulative. Structure: one person's story as the hook: [STORY], the scale of the problem in 2 factual lines (use only figures I provide: [FIGURES]), what a donation does concretely, and the call to action: [CTA]. Aim for about 140 words. Dignity first — portray people with respect, not pity.",
  },
  {
    id: "narration-podcast-intro",
    label: "Narration: Podcast intro",
    detail:
      "Write a 30-second podcast intro voiceover script for [PODCAST NAME]. Voice direction: the host's energy — [TONE — e.g. curious and sharp]. Structure: the show name with a pause, the one-line promise ('where we [PROMISE]'), who it is for: [AUDIENCE], and the episode tease: [TEASE]. Aim for about 70 words. Memorable and repeatable — this plays every episode, so make every word earn its keep.",
  },
  {
    id: "narration-app-onboarding",
    label: "Narration: App onboarding walkthrough",
    detail:
      "Write app onboarding voiceover lines for [APP], one short line per screen: [SCREENS]. Voice direction: friendly guide — helpful, never condescending. Rules: each line under 12 words, speak to what the user can DO (not what the screen shows), celebrate the first win, and end with the 'you are ready' line. Provide the lines numbered to match the screens. Conversational tone throughout.",
  },
  {
    id: "narration-museum-tour",
    label: "Narration: Museum / tour guide",
    detail:
      "Write a museum audio-guide voiceover script for [EXHIBIT], about [X] words per stop across [N] stops. Voice direction: knowledgeable friend — enthusiastic, never lecturing. Structure per stop: the one thing to look at first, the story behind it in 3 beats, and a 'look closer' detail most visitors miss. Use only facts I provide: [FACTS]. End each stop with a transition line to the next.",
  },

  // ------------------------------------------------------------------
  // EXPLAINER VOICEOVER (16)
  // ------------------------------------------------------------------
  {
    id: "explainer-saas-product",
    label: "Explainer Voiceover: SaaS product",
    detail:
      "Write a 60-second SaaS explainer voiceover script for [PRODUCT]. Voice direction: clear, confident, friendly — a smart colleague showing you the ropes. Structure: the pain in 2 relatable lines, the product as the fix in one sentence, 3 features each tied to an outcome (not a spec), and the call to action: [CTA]. Aim for about 140 words. Benefits before features, always. Use only facts I provide: [FACTS].",
  },
  {
    id: "explainer-how-it-works",
    label: "Explainer Voiceover: How it works",
    detail:
      "Write a 60-second 'how it works' explainer voiceover script for [PRODUCT / PROCESS]. Voice direction: patient teacher — simple, step-by-step. Structure: what it does in one line, then exactly 3 steps ('First… Then… Finally…'), each with a visual cue in [brackets], and the result the user gets. Aim for about 140 words. If a step needs more than 2 sentences, it is two steps — split it.",
  },
  {
    id: "explainer-whiteboard",
    label: "Explainer Voiceover: Whiteboard style",
    detail:
      "Write a 90-second whiteboard-explainer voiceover script about [CONCEPT]. Voice direction: enthusiastic teacher drawing as they talk. Structure: the question on everyone's mind, the simple answer, the full explanation drawn in 4 stages (mark each drawing cue as [DRAW: description]), 2 everyday examples, and the one-line takeaway. Aim for about 200 words. Write for drawing — every beat must be visualizable.",
  },
  {
    id: "explainer-onboarding-tutorial",
    label: "Explainer Voiceover: Onboarding tutorial",
    detail:
      "Write a 2-minute onboarding tutorial voiceover script for [PRODUCT]. Voice direction: encouraging coach — 'you have got this' energy. Structure: welcome plus the one win they will get today, setup in 3 steps with click cues in [brackets], the first real task walked through slowly, where to get help: [SUPPORT], and the 'you are all set' close. Aim for about 280 words. Assume zero prior knowledge.",
  },
  {
    id: "explainer-feature-announcement",
    label: "Explainer Voiceover: Feature announcement",
    detail:
      "Write a 30-second feature-announcement voiceover script for [FEATURE] in [PRODUCT]. Voice direction: excited product team — proud but clear. Structure: the frustration users had: [FRUSTRATION], the feature as the answer in one line, 2 things it does now possible, and where to find it: [LOCATION]. Aim for about 70 words. One feature per script — do not bundle announcements.",
  },
  {
    id: "explainer-faq-voiceover",
    label: "Explainer Voiceover: FAQ voiceover",
    detail:
      "Write a 60-second FAQ voiceover script answering these questions about [PRODUCT]: [QUESTIONS]. Voice direction: helpful support agent — calm, direct. Structure: each question read naturally, then a 2-3 sentence answer in plain language — no scriptspeak. Aim for about 140 words total. If an answer needs a caveat, state it plainly; never dodge.",
  },
  {
    id: "explainer-sales",
    label: "Explainer Voiceover: Sales explainer",
    detail:
      "Write a 90-second sales explainer voiceover script for [PRODUCT / SERVICE] aimed at [AUDIENCE]. Voice direction: confident peer — consultative, not pushy. Structure: the costly problem quantified with figures I provide: [FIGURES], how the product solves it in 3 outcomes, proof: [PROOF], objection handling in 2 lines ('You might be thinking…'), and the call to action: [CTA]. Aim for about 200 words. Never invent numbers or testimonials.",
  },
  {
    id: "explainer-educational-lesson",
    label: "Explainer Voiceover: Educational lesson",
    detail:
      "Write a 3-minute educational lesson voiceover script teaching [CONCEPT] to [AUDIENCE]. Voice direction: passionate teacher — curiosity is contagious. Structure: the hook question, the concept with 2 analogies, a worked example step by step, the 2 most common misunderstandings corrected, and a recap plus one practice prompt. Aim for about 420 words. Check understanding, do not just broadcast.",
  },
  {
    id: "explainer-kids",
    label: "Explainer Voiceover: Kids explainer",
    detail:
      "Write a 2-minute explainer voiceover script about [TOPIC] for kids aged [AGE RANGE]. Voice direction: fun older sibling — playful, never babyish. Structure: a silly hook question, the explanation with 3 fun comparisons, one 'wow' fact (verified — from facts I provide: [FACTS]), and a closing question to think about. Aim for about 280 words. Short sentences, concrete images, zero jargon.",
  },
  {
    id: "explainer-technical",
    label: "Explainer Voiceover: Technical explainer",
    detail:
      "Write a 2-minute technical explainer voiceover script about [TECHNICAL TOPIC] for [AUDIENCE — e.g. developers]. Voice direction: precise peer — respects the listener's intelligence. Structure: the problem in technical terms, the approach in 3 steps with exact terminology, the trade-offs honestly stated, and where to read more: [RESOURCE]. Aim for about 280 words. Precision over simplification — but define any term the audience might not share.",
  },
  {
    id: "explainer-process",
    label: "Explainer Voiceover: Process explainer",
    detail:
      "Write a 90-second process explainer voiceover script for [PROCESS]. Voice direction: clear operations guide — calm and methodical. Structure: what the process achieves, the [N] stages in order (each: what happens, who does it, how long it takes), what can go wrong at each stage and the fix, and the final handoff. Aim for about 200 words. Number every stage — listeners track numbers better than names.",
  },
  {
    id: "explainer-comparison",
    label: "Explainer Voiceover: Comparison explainer",
    detail:
      "Write a 60-second comparison explainer voiceover script: [OPTION A] vs [OPTION B] for [AUDIENCE]. Voice direction: fair referee — no favorite. Structure: what each option is in one line, 3 head-to-head rounds on [CRITERIA], the scorecard, and the verdict: who should choose which. Aim for about 140 words. Fairness builds trust — steelman both sides.",
  },
  {
    id: "explainer-pricing",
    label: "Explainer Voiceover: Pricing explainer",
    detail:
      "Write a 60-second pricing explainer voiceover script for [PRODUCT] with plans: [PLANS]. Voice direction: transparent guide — no fine-print energy. Structure: the simple pricing idea in one line, each plan with who it is for (not just what it includes), the one question that picks the right plan, and the reassurance: [REASSURANCE — e.g. cancel anytime]. Aim for about 140 words. Use only the plan details I provide — never invent prices.",
  },
  {
    id: "explainer-troubleshooting",
    label: "Explainer Voiceover: Troubleshooting guide",
    detail:
      "Write a 90-second troubleshooting voiceover script for [PROBLEM] in [PRODUCT]. Voice direction: calm tech support — 'we will fix this together'. Structure: confirm the symptom, the 3 most likely causes in order (each: 20-second fix with click cues in [brackets]), what to try if none work: [ESCALATION], and reassurance. Aim for about 200 words. Order by likelihood — most common fix first.",
  },
  {
    id: "explainer-webinar-intro",
    label: "Explainer Voiceover: Webinar intro",
    detail:
      "Write a 45-second webinar intro voiceover script for [WEBINAR TITLE]. Voice direction: energetic host — the room is filling up. Structure: welcome plus who this is for, the 3 things attendees will learn (stated as outcomes), housekeeping in 2 lines: [HOUSEKEEPING], and the handoff to the speaker: [SPEAKER INTRO]. Aim for about 100 words. Energy up — this sets the tone for the whole session.",
  },
  {
    id: "explainer-course-module",
    label: "Explainer Voiceover: Course module intro",
    detail:
      "Write a 60-second course module intro voiceover script for [MODULE TITLE] in [COURSE NAME]. Voice direction: motivating mentor — this module matters. Structure: where we are in the journey, what this module unlocks (the skill stated as an outcome), the 3 lessons ahead in one line each, and the first tiny action step. Aim for about 140 words. Connect to the bigger transformation — never teach in isolation.",
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
