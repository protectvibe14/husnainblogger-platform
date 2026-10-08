/**
 * Email Subject Line Prompt Pack (tool-338) — pure logic, zero imports.
 *
 * FIXED PACK, NOT AI (inventory type corrected generator -> library):
 * 48 human-written prompt templates in 4 fixed categories (12 each).
 * Nothing is generated at runtime — users browse, copy a template's
 * `detail` text, and run it in their own AI tool. Placeholders like
 * [TOPIC] or [OFFER] are filled in by the user.
 *
 * Categories (12 prompts each, 48 total):
 *   newsletter — weekly newsletter subject lines
 *   promo      — promotions, discounts, launches
 *   welcome    — welcome series and onboarding emails
 *   abandoned  — abandoned cart recovery sequences
 */

export interface TrackerItem {
  id: string;
  label: string;
  detail?: string;
}

/**
 * The full prompt pack. `detail` is the copyable template text
 * (the UI's Copy button copies this verbatim).
 */
export const TRACKER_ITEMS: TrackerItem[] = [
  // --- Newsletter ---
  {
    id: "newsletter-curiosity-lines",
    label: "Newsletter: 10 curiosity-driven subject lines",
    detail:
      "Write 10 curiosity-driven email subject lines for my newsletter issue about [TOPIC]. Keep each one under 50 characters, open a curiosity gap without making false claims, and number them 1 to 10.",
  },
  {
    id: "newsletter-open-loop",
    label: "Newsletter: open-loop subject lines",
    detail:
      "Write 10 email subject lines for my newsletter that open a story loop about [TOPIC] — the reader must open the email to get the ending. Each under 45 characters, no misleading claims, numbered 1 to 10.",
  },
  {
    id: "newsletter-question-hook",
    label: "Newsletter: question-style subject lines",
    detail:
      "Write 10 question-style email subject lines for my newsletter on [TOPIC]. Each should ask the one question my [AUDIENCE] most wants answered, and the newsletter must actually answer it.",
  },
  {
    id: "newsletter-number-roundup",
    label: "Newsletter: numbered roundup subject lines",
    detail:
      "Write 10 numbered subject lines (like '7 ...' or '12 ...') for my newsletter roundup on [TOPIC]. Keep each under 50 characters and make sure the number matches the actual count inside the email.",
  },
  {
    id: "newsletter-personal-note",
    label: "Newsletter: personal-note subject lines",
    detail:
      "Write 10 subject lines for my newsletter that feel like a personal note from me to [AUDIENCE], about [TOPIC]. Lowercase style is fine, no hype words, each under 45 characters.",
  },
  {
    id: "newsletter-benefit-promise",
    label: "Newsletter: clear benefit subject lines",
    detail:
      "Write 10 subject lines for my newsletter on [TOPIC] that promise one clear, honest benefit for [AUDIENCE]. Under 50 characters each. Never promise anything the issue does not deliver.",
  },
  {
    id: "newsletter-how-to",
    label: "Newsletter: how-to subject lines",
    detail:
      "Write 10 'how to' style subject lines for my newsletter teaching [SKILL/TOPIC] to [AUDIENCE]. Each must name the specific outcome and stay under 50 characters.",
  },
  {
    id: "newsletter-mistake-angle",
    label: "Newsletter: mistake-to-avoid subject lines",
    detail:
      "Write 10 subject lines for my newsletter about the most common mistake people make with [TOPIC]. Each under 50 characters, honest and specific — no fear-mongering that the issue cannot back up.",
  },
  {
    id: "newsletter-seasonal-angle",
    label: "Newsletter: seasonal subject lines",
    detail:
      "Write 10 subject lines for my newsletter tying [TOPIC] to [SEASON/EVENT]. Make the tie-in genuine — the issue must actually connect the two topics — and keep each under 50 characters.",
  },
  {
    id: "newsletter-ab-variants",
    label: "Newsletter: A/B test pairs",
    detail:
      "Write 5 pairs of email subject lines (A and B versions) for my newsletter on [TOPIC] so I can A/B test them. Each line under 45 characters. In each pair, change exactly one element (tone, length, personalization, or angle) and tell me what you changed.",
  },
  {
    id: "newsletter-reengagement",
    label: "Newsletter: re-engagement subject lines",
    detail:
      "Write 10 subject lines for a re-engagement email to subscribers who have not opened my last [N] newsletters about [TOPIC]. Warm and direct tone — ask what they want to hear about. Under 50 characters each.",
  },
  {
    id: "newsletter-preheader-pair",
    label: "Newsletter: subject line + preheader pairs",
    detail:
      "Write 10 subject line + preheader (preview text) pairs for my newsletter on [TOPIC]. The subject line (under 45 characters) teases the topic; the preheader (under 80 characters) completes the thought without repeating the subject line word for word.",
  },
  // --- Promo ---
  {
    id: "promo-discount",
    label: "Promo: discount offer subject lines",
    detail:
      "Write 10 subject lines for a promotional email offering [X]% off [PRODUCT/SERVICE]. Include the discount clearly in at least half of them. Each under 50 characters, no fake discounts — the offer must match my store exactly.",
  },
  {
    id: "promo-flash-sale",
    label: "Promo: flash sale subject lines",
    detail:
      "Write 10 urgent-but-honest subject lines for a [X]-hour flash sale on [PRODUCT/SERVICE]. Each under 45 characters. The sale must really end when stated — no fake countdowns.",
  },
  {
    id: "promo-bundle",
    label: "Promo: bundle deal subject lines",
    detail:
      "Write 10 subject lines for an email promoting a bundle: [PRODUCT A] + [PRODUCT B] for [PRICE]. Each under 50 characters and name the savings or the combined value honestly.",
  },
  {
    id: "promo-bonus",
    label: "Promo: bonus-with-purchase subject lines",
    detail:
      "Write 10 subject lines for a promo email where buyers of [PRODUCT] also get [BONUS] free. Each under 50 characters. State the bonus clearly and never imply it is worth more than it is.",
  },
  {
    id: "promo-early-access",
    label: "Promo: early access / VIP subject lines",
    detail:
      "Write 10 subject lines giving [AUDIENCE] early access to [PRODUCT/LAUNCH]. VIP framing — make subscribers feel like insiders. Each under 50 characters, and early access must be real, not marketing fiction.",
  },
  {
    id: "promo-deadline",
    label: "Promo: deadline reminder subject lines",
    detail:
      "Write 10 subject lines reminding subscribers that the [OFFER] ends [DATE/TIME]. Escalating urgency across the set, each under 45 characters. Only use urgency if the deadline is real.",
  },
  {
    id: "promo-social-proof",
    label: "Promo: social proof subject lines",
    detail:
      "Write 10 subject lines for a promo email that leans on social proof for [PRODUCT]: real customer counts, real reviews, real results. Each under 50 characters. Do not invent numbers — I will fill in the real ones at [NUMBER].",
  },
  {
    id: "promo-new-product",
    label: "Promo: new product launch subject lines",
    detail:
      "Write 10 subject lines announcing the launch of [PRODUCT] to [AUDIENCE]. Each under 50 characters. Lead with the single biggest benefit, not the product name.",
  },
  {
    id: "promo-payment-plan",
    label: "Promo: payment plan / affordability subject lines",
    detail:
      "Write 10 subject lines for an email highlighting that [PRODUCT] is now available for [PRICE] per month / in [N] payments. Each under 50 characters, honest about total cost — never hide the full price.",
  },
  {
    id: "promo-last-chance",
    label: "Promo: last-chance subject lines",
    detail:
      "Write 10 last-chance subject lines for the final [N] hours of [OFFER]. Each under 45 characters. Direct and respectful — no guilt trips, and the offer must genuinely end.",
  },
  {
    id: "promo-personalized",
    label: "Promo: personalized first-name subject lines",
    detail:
      "Write 10 subject lines for a promo email on [OFFER] that use the {{first_name}} merge tag naturally. Each under 50 characters. Personalization must read like a human wrote it, not a mail-merge robot.",
  },
  {
    id: "promo-free-shipping",
    label: "Promo: free shipping / threshold subject lines",
    detail:
      "Write 10 subject lines for a promo email offering free shipping on [PRODUCT/STORE] for orders over [AMOUNT]. Each under 50 characters and state the threshold clearly so no one is surprised at checkout.",
  },
  // --- Welcome ---
  {
    id: "welcome-email-1",
    label: "Welcome: email 1 subject lines",
    detail:
      "Write 10 subject lines for the FIRST email of my welcome series — it delivers [LEAD MAGNET/FREE OFFER] to new subscribers interested in [TOPIC]. Warm, excited tone, each under 50 characters.",
  },
  {
    id: "welcome-email-2",
    label: "Welcome: email 2 (your story) subject lines",
    detail:
      "Write 10 subject lines for the SECOND email of my welcome series, where I share my story and why I help [AUDIENCE] with [TOPIC]. Personal and conversational, each under 50 characters.",
  },
  {
    id: "welcome-email-3",
    label: "Welcome: email 3 (best resources) subject lines",
    detail:
      "Write 10 subject lines for the THIRD welcome email, which points new subscribers to my [N] best resources on [TOPIC]. Each under 50 characters and specific enough that the right people click.",
  },
  {
    id: "welcome-first-order",
    label: "Welcome: first-order thank-you subject lines",
    detail:
      "Write 10 subject lines for the thank-you email sent after a customer's first order of [PRODUCT]. Warm and grateful, each under 45 characters — no hard sell in this one.",
  },
  {
    id: "welcome-onboarding",
    label: "Welcome: product onboarding subject lines",
    detail:
      "Write 10 subject lines for onboarding emails that help new users get their first win with [PRODUCT] in [TIMEFRAME]. Each under 50 characters and focused on one small step.",
  },
  {
    id: "welcome-expectations",
    label: "Welcome: set-expectations subject lines",
    detail:
      "Write 10 subject lines for the welcome email that tells new subscribers what to expect from my list: [FREQUENCY] emails about [TOPICS]. Honest and clear, each under 50 characters — set expectations you can keep.",
  },
  {
    id: "welcome-referral",
    label: "Welcome: referral invite subject lines",
    detail:
      "Write 10 subject lines inviting happy customers of [PRODUCT] to refer a friend for [REFERRAL REWARD]. Each under 50 characters, friendly tone — ask, don't beg.",
  },
  {
    id: "welcome-milestone",
    label: "Welcome: milestone / anniversary subject lines",
    detail:
      "Write 10 subject lines celebrating a subscriber's [MILESTONE: 1-year anniversary, 10th purchase] with [BRAND]. Personal and celebratory, each under 50 characters, with a small gift or thank-you inside.",
  },
  {
    id: "welcome-winback",
    label: "Welcome: win-back subject lines",
    detail:
      "Write 10 win-back subject lines for subscribers who joined but never engaged with [PRODUCT/CONTENT]. Honest and low-pressure — offer to adjust frequency or say goodbye cleanly. Each under 50 characters.",
  },
  {
    id: "welcome-vip",
    label: "Welcome: VIP / insider club subject lines",
    detail:
      "Write 10 subject lines welcoming someone into my VIP / insider group for [BRAND]. Make them feel the exclusivity: early drops, member prices, behind-the-scenes. Each under 50 characters.",
  },
  {
    id: "welcome-survey",
    label: "Welcome: get-to-know-you survey subject lines",
    detail:
      "Write 10 subject lines for a short welcome survey asking new subscribers about their [GOAL/CHALLENGE] with [TOPIC]. Each under 50 characters — promise it takes under a minute and mean it.",
  },
  {
    id: "welcome-video-intro",
    label: "Welcome: video introduction subject lines",
    detail:
      "Write 10 subject lines for a welcome email that introduces me on video to new subscribers interested in [TOPIC]. Each under 50 characters. Tease one specific thing the video covers.",
  },
  // --- Abandoned cart ---
  {
    id: "abandoned-reminder-1",
    label: "Abandoned: first reminder subject lines",
    detail:
      "Write 10 subject lines for the FIRST abandoned cart email, sent [N] hours after someone leaves [PRODUCT] in their cart. Gentle reminder tone, each under 50 characters — assume they were just distracted.",
  },
  {
    id: "abandoned-reminder-2",
    label: "Abandoned: second nudge subject lines",
    detail:
      "Write 10 subject lines for the SECOND abandoned cart email, sent [N] hours later. Slightly more direct — restate one key benefit of [PRODUCT]. Each under 50 characters.",
  },
  {
    id: "abandoned-reminder-3",
    label: "Abandoned: final reminder subject lines",
    detail:
      "Write 10 subject lines for the THIRD and final abandoned cart email for [PRODUCT]. Firm but respectful — this is the last nudge, not the last email they will ever get from me. Each under 50 characters.",
  },
  {
    id: "abandoned-discount-offer",
    label: "Abandoned: discount recovery subject lines",
    detail:
      "Write 10 subject lines for an abandoned cart email offering [X]% off to complete the purchase of [PRODUCT]. Each under 50 characters. Use discounts sparingly — never train buyers to abandon for a code.",
  },
  {
    id: "abandoned-stock-scarcity",
    label: "Abandoned: low-stock subject lines",
    detail:
      "Write 10 subject lines for an abandoned cart email warning that [PRODUCT] is low in stock ([N] left). Each under 50 characters. Only use this if stock is genuinely low — fake scarcity destroys trust.",
  },
  {
    id: "abandoned-shipping-objection",
    label: "Abandoned: shipping objection subject lines",
    detail:
      "Write 10 subject lines for an abandoned cart email that handles the shipping objection for [PRODUCT]: free shipping over [AMOUNT] / ships in [TIMEFRAME] to [REGION]. Each under 50 characters.",
  },
  {
    id: "abandoned-review-proof",
    label: "Abandoned: customer review subject lines",
    detail:
      "Write 10 subject lines for an abandoned cart email that shares real customer reviews of [PRODUCT] to build confidence. Each under 50 characters. Use only real reviews I provide at [REVIEWS].",
  },
  {
    id: "abandoned-question-support",
    label: "Abandoned: 'have a question?' subject lines",
    detail:
      "Write 10 subject lines for an abandoned cart email that offers personal help choosing [PRODUCT]: 'Reply to this email and I'll help you decide.' Each under 50 characters, human tone — no corporate voice.",
  },
  {
    id: "abandoned-humor",
    label: "Abandoned: light-humor subject lines",
    detail:
      "Write 10 light-humor subject lines for an abandoned cart email about [PRODUCT], matching a playful brand voice. Each under 50 characters. Funny but never mocking the customer.",
  },
  {
    id: "abandoned-browse",
    label: "Abandoned: browse abandonment subject lines",
    detail:
      "Write 10 subject lines for a browse-abandonment email (viewed [PRODUCT] but never added to cart). Curiosity-led — highlight what makes [PRODUCT] different. Each under 50 characters.",
  },
  {
    id: "abandoned-price-drop",
    label: "Abandoned: price-drop alert subject lines",
    detail:
      "Write 10 subject lines for a price-drop alert email: [PRODUCT] the subscriber viewed is now [NEW PRICE], down from [OLD PRICE]. Each under 50 characters. Only send when the price genuinely dropped.",
  },
  {
    id: "abandoned-cross-sell",
    label: "Abandoned: complementary product subject lines",
    detail:
      "Write 10 subject lines for a follow-up email suggesting [COMPLEMENTARY PRODUCT] to someone who bought (or viewed) [PRODUCT]. Each under 50 characters — the suggestion must genuinely go together.",
  },
];

/**
 * Human-readable progress for the pack UI.
 */
export function describeProgress(checked: number, total: number): string {
  const safeChecked = Math.max(0, Math.min(Math.floor(checked), Math.max(0, total)));
  const safeTotal = Math.max(0, total);
  if (safeTotal === 0) return "The prompt pack is empty.";
  if (safeChecked === 0)
    return `0 of ${safeTotal} prompts marked as tried. Browse the pack and mark the ones you use.`;
  if (safeChecked >= safeTotal)
    return `All ${safeTotal} prompts marked as tried. Time to put them to work — write those subject lines.`;
  return `${safeChecked} of ${safeTotal} prompts marked as tried.`;
}
