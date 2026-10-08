/**
 * AI Prompt Library for Bloggers (tool-301) — pure logic, zero imports.
 *
 * CURATED LIBRARY, NOT AI: 48 human-written prompt templates in 8 fixed
 * categories (6 prompts each). Nothing is generated at runtime — users
 * browse, copy a template's `detail` text, and run it in their own AI tool.
 * Placeholders like [TOPIC] or [KEYWORD] are filled in by the user.
 *
 * Categories:
 *   ideas        — Idea Generation (6)
 *   outline      — Outlining & Structure (6)
 *   drafting     — Drafting (6)
 *   headlines    — Headlines & Hooks (6)
 *   seo          — SEO Optimization (6)
 *   editing      — Editing & Rewriting (6)
 *   repurposing  — Content Repurposing (6)
 *   promotion    — Email & Promotion (6)
 * Total: 48 prompts.
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/**
 * The full prompt library. `detail` is the copyable template text
 * (the UI's Copy button copies this verbatim).
 */
export const TRACKER_ITEMS: TrackerItem[] = [
  // --- Idea Generation ---
  {
    id: "ideas-10-post-ideas",
    label: "Idea Generation: 10 blog post ideas",
    detail:
      "Give me 10 blog post ideas about [TOPIC] for [AUDIENCE]. Mix beginner and advanced angles, and make each idea specific enough that I could start writing from it directly.",
  },
  {
    id: "ideas-trending-angles",
    label: "Idea Generation: 5 trending angles",
    detail:
      "List 5 trending angles on [TOPIC] that bloggers are covering right now. For each angle, write one sentence on why readers care about it today.",
  },
  {
    id: "ideas-question-mining",
    label: "Idea Generation: 15 reader questions",
    detail:
      "Generate 15 questions real readers ask about [TOPIC], phrased the way they would type them into Google. Number them and keep each under 15 words.",
  },
  {
    id: "ideas-series-planner",
    label: "Idea Generation: 5-part series plan",
    detail:
      "Outline a 5-part blog series on [TOPIC]. Give each part a working title and one sentence describing what that part covers, in an order a beginner could follow.",
  },
  {
    id: "ideas-contrarian-takes",
    label: "Idea Generation: 5 contrarian takes",
    detail:
      "Give me 5 contrarian but defensible opinions about [TOPIC] that would make original blog posts. For each, add one line on the argument I would need to support it.",
  },
  {
    id: "ideas-beginner-faq-topics",
    label: "Idea Generation: beginner FAQ topics",
    detail:
      "What are the 10 most basic questions a total beginner asks about [TOPIC]? Turn each question into a clear blog post title.",
  },
  // --- Outlining & Structure ---
  {
    id: "outline-detailed-outline",
    label: "Outlining: detailed post outline",
    detail:
      "Create a detailed outline for a blog post titled '[TITLE]'. Include H2 and H3 headings in logical order, with 2-3 bullet points under each heading showing what to cover.",
  },
  {
    id: "outline-listicle-structure",
    label: "Outlining: listicle structure",
    detail:
      "Build a listicle outline for '[TITLE]' with [N] items. Each item needs a subheading, a one-line summary, and a placeholder note for where an example should go.",
  },
  {
    id: "outline-howto-steps",
    label: "Outlining: how-to steps",
    detail:
      "Break [PROCESS] into clear numbered steps for a how-to blog post. Add a short intro hook, and finish with a troubleshooting section covering the 3 most common mistakes.",
  },
  {
    id: "outline-comparison-framework",
    label: "Outlining: comparison framework",
    detail:
      "Create an outline comparing [OPTION A] vs [OPTION B] for a blog post. Include the criteria readers actually use to decide, a section for each criterion, and a verdict section that names who each option suits.",
  },
  {
    id: "outline-story-arc",
    label: "Outlining: personal story arc",
    detail:
      "Outline a personal-story blog post about [EXPERIENCE]. Map it to this arc: hook, struggle, turning point, lesson learned, takeaway for the reader.",
  },
  {
    id: "outline-pillar-post-map",
    label: "Outlining: pillar post map",
    detail:
      "Plan a pillar post on [BROAD TOPIC] with 5 cluster subtopics. For each cluster, write the subtopic title and one sentence on how it links back to the pillar post.",
  },
  // --- Drafting ---
  {
    id: "drafting-first-draft-section",
    label: "Drafting: first draft section",
    detail:
      "Write the [SECTION NAME] section of a blog post about [TOPIC] in a [TONE] tone, about [N] words. Write for [AUDIENCE]. Be specific and concrete — no filler sentences.",
  },
  {
    id: "drafting-introduction-hooks",
    label: "Drafting: 3 introduction versions",
    detail:
      "Write 3 different introductions for a post titled '[TITLE]': one story-based, one statistic-based, one question-based. Keep each under 80 words.",
  },
  {
    id: "drafting-conclusion-cta",
    label: "Drafting: conclusion with CTA",
    detail:
      "Write a conclusion for a blog post about [TOPIC] that summarizes the single most important takeaway and ends with one clear call to action: [CALL TO ACTION].",
  },
  {
    id: "drafting-simplify-jargon",
    label: "Drafting: simplify jargon",
    detail:
      "Rewrite this paragraph so a 12-year-old can understand it, without losing accuracy. Keep it the same length or shorter: [PASTE PARAGRAPH]",
  },
  {
    id: "drafting-expand-thin-section",
    label: "Drafting: expand a thin section",
    detail:
      "This section of my post feels thin: [PASTE SECTION]. Expand it with one concrete example and one practical tip, keeping the same tone and voice.",
  },
  {
    id: "drafting-transition-sentences",
    label: "Drafting: transition sentences",
    detail:
      "Write smooth transition sentences between these two sections of my post. End of section A: [PASTE]. Start of section B: [PASTE].",
  },
  // --- Headlines & Hooks ---
  {
    id: "headlines-10-options",
    label: "Headlines: 10 headline options",
    detail:
      "Write 10 headline options for a blog post about [TOPIC]. Mix how-to, listicle, and curiosity styles. Keep each under 60 characters and avoid clickbait the post cannot deliver.",
  },
  {
    id: "headlines-seo-title-improve",
    label: "Headlines: improve a working title",
    detail:
      "Improve this working title for clicks and SEO: '[TITLE]'. Keep the keyword [KEYWORD] near the front, stay under 60 characters, and give me 5 improved versions.",
  },
  {
    id: "headlines-meta-descriptions",
    label: "Headlines: 3 meta descriptions",
    detail:
      "Write 3 meta descriptions for a post titled '[TITLE]', each 140-155 characters, each containing the keyword [KEYWORD], each ending with a reason to click.",
  },
  {
    id: "headlines-email-subject-lines",
    label: "Headlines: 10 email subject lines",
    detail:
      "Write 10 email subject lines to promote my post '[TITLE]'. Under 50 characters each. No clickbait that the post itself cannot deliver on.",
  },
  {
    id: "headlines-social-hooks",
    label: "Headlines: 5 social hooks",
    detail:
      "Write 5 social media hooks to promote my post '[TITLE]' — one each for X, LinkedIn, Facebook, Instagram, and Pinterest. Adapt the tone to each platform.",
  },
  {
    id: "headlines-subheading-polish",
    label: "Headlines: polish bland subheadings",
    detail:
      "Rewrite these bland subheadings to be specific and curiosity-driving, without becoming clickbait: [PASTE LIST].",
  },
  // --- SEO Optimization ---
  {
    id: "seo-keyword-outline",
    label: "SEO: keyword-targeted outline",
    detail:
      "Plan a blog post targeting the keyword '[KEYWORD]'. State the likely search intent, suggest 5 related subtopics to cover for depth, and note where the keyword fits naturally (title, intro, headings).",
  },
  {
    id: "seo-people-also-ask",
    label: "SEO: people-also-ask answers",
    detail:
      "List 10 'people also ask' style questions around [KEYWORD] and draft a 2-3 sentence answer for each, written so they could be used in an FAQ section.",
  },
  {
    id: "seo-internal-linking",
    label: "SEO: internal linking ideas",
    detail:
      "Suggest 5 internal linking opportunities for a new post about [TOPIC] on a blog that also covers [OTHER TOPICS]. Write the exact anchor text for each link.",
  },
  {
    id: "seo-content-gap",
    label: "SEO: content gap analysis",
    detail:
      "My post on [TOPIC] ranks on page 2 for [KEYWORD]. Suggest 5 sections, angles, or subtopics that top-ranking posts typically cover which my post might be missing.",
  },
  {
    id: "seo-featured-snippet",
    label: "SEO: featured snippet rewrite",
    detail:
      "Rewrite this answer to target a featured snippet for the query '[QUERY]': [PASTE ANSWER]. Keep it 40-60 words and direct, then add one paragraph of supporting detail below it.",
  },
  {
    id: "seo-refresh-old-post",
    label: "SEO: refresh an old post",
    detail:
      "This 2-year-old post needs a refresh. Here is a summary of it: [PASTE SUMMARY]. List exactly what to update, what to add, and what to cut to make it current and more useful.",
  },
  // --- Editing & Rewriting ---
  {
    id: "editing-ruthless-edit",
    label: "Editing: ruthless clarity edit",
    detail:
      "Edit this draft for clarity and concision. Cut filler, fix grammar, keep my voice and all key points. Show only the edited version: [PASTE DRAFT]",
  },
  {
    id: "editing-tone-shift",
    label: "Editing: shift the tone",
    detail:
      "Rewrite this text in a [TONE] tone without changing any facts or key points: [PASTE TEXT]",
  },
  {
    id: "editing-shorten",
    label: "Editing: shorten to word count",
    detail:
      "Cut this [N]-word section down to [M] words without losing the key points: [PASTE TEXT]",
  },
  {
    id: "editing-active-voice",
    label: "Editing: active voice rewrite",
    detail:
      "Rewrite this paragraph in active voice with shorter sentences. Keep the meaning identical: [PASTE PARAGRAPH]",
  },
  {
    id: "editing-fact-check-pass",
    label: "Editing: flag claims needing sources",
    detail:
      "Read this draft and flag every claim that needs a source or sounds invented. Do not rewrite anything — just list the claims as bullet points: [PASTE DRAFT]",
  },
  {
    id: "editing-readability",
    label: "Editing: simplify reading level",
    detail:
      "Simplify this post to an 8th-grade reading level. Keep all key points and the original structure: [PASTE TEXT]",
  },
  // --- Content Repurposing ---
  {
    id: "repurposing-post-to-thread",
    label: "Repurposing: post to X thread",
    detail:
      "Turn this blog post into a 10-post X thread. Post 1 hooks the reader, each following post covers one idea, and the last post links back to the article: [PASTE POST OR SUMMARY]",
  },
  {
    id: "repurposing-post-to-newsletter",
    label: "Repurposing: post to newsletter",
    detail:
      "Repurpose this blog post as a newsletter issue: a subject line, a 150-word intro, the 3 biggest takeaways, and one call to action: [PASTE POST]",
  },
  {
    id: "repurposing-post-to-carousel",
    label: "Repurposing: post to carousel",
    detail:
      "Turn the key points of this post into an 8-slide Instagram carousel outline — one idea per slide, with the hook on slide 1 and the CTA on slide 8: [PASTE POST]",
  },
  {
    id: "repurposing-post-to-video-script",
    label: "Repurposing: post to video script",
    detail:
      "Convert this blog post into a 5-minute YouTube script outline: hook (first 15 seconds), chapter breakdown with timestamps, and a closing CTA: [PASTE POST]",
  },
  {
    id: "repurposing-quote-graphics",
    label: "Repurposing: quotable one-liners",
    detail:
      "Pull 7 quotable one-liners from this post that would work as quote graphics on social media: [PASTE POST]",
  },
  {
    id: "repurposing-linkedin-version",
    label: "Repurposing: LinkedIn version",
    detail:
      "Rewrite this post as a LinkedIn-native post under 300 words, with a hook in the very first line and line breaks for readability: [PASTE POST]",
  },
  // --- Email & Promotion ---
  {
    id: "promotion-welcome-email",
    label: "Promotion: welcome email",
    detail:
      "Write a welcome email for new subscribers of a [NICHE] blog. Introduce what they will get and how often, in a [TONE] tone. Under 200 words.",
  },
  {
    id: "promotion-post-promo-email",
    label: "Promotion: new post promo email",
    detail:
      "Write a broadcast email promoting my new post '[TITLE]'. Tease the main benefit the reader will get — do not summarize the whole post — and end with one call to action linking to it.",
  },
  {
    id: "promotion-guest-post-pitch",
    label: "Promotion: guest post pitch",
    detail:
      "Write a guest post pitch email to [BLOG NAME] proposing the topic '[PITCH TITLE]'. Show I actually read their blog by referencing [SPECIFIC POST]. Under 150 words.",
  },
  {
    id: "promotion-collaboration-outreach",
    label: "Promotion: collaboration outreach",
    detail:
      "Write a short outreach email to [BLOGGER NAME] proposing a content collaboration on [TOPIC]. Make the benefit to them explicit in the first two sentences. Under 150 words.",
  },
  {
    id: "promotion-comment-replies",
    label: "Promotion: reader comment replies",
    detail:
      "Write 3 thoughtful reply options to this reader comment on my post: [PASTE COMMENT]. Vary them: one warm, one expert, one brief.",
  },
  {
    id: "promotion-about-page",
    label: "Promotion: blog About page",
    detail:
      "Write an About page for a [NICHE] blog run by [NAME]. 150 words, first person, one credibility line, and one call to action to subscribe.",
  },
];

/**
 * Human-readable progress for the library tracker.
 * `checked` = prompts the user has marked as tried/used.
 */
export function describeProgress(checked: number, total: number): string {
  const safeChecked = Math.max(0, Math.min(Math.floor(checked), Math.max(0, total)));
  const safeTotal = Math.max(0, total);
  if (safeTotal === 0) return "The library is empty.";
  if (safeChecked === 0)
    return `0 of ${safeTotal} prompts marked as tried. Browse the library and mark the ones you use.`;
  if (safeChecked >= safeTotal)
    return `All ${safeTotal} prompts marked as tried. Time to put them to work — publish something.`;
  return `${safeChecked} of ${safeTotal} prompts marked as tried.`;
}
