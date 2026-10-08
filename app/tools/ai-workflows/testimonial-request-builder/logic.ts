/**
 * Testimonial Request Builder — pure logic (zero imports, zero network, zero DOM).
 *
 * Fills fixed request-message templates with the user's client details.
 * Two messages per item: a request message + a follow-up message.
 * The TESTIMONIAL itself must come from the real client — the tool only
 * writes the ASK, never the testimonial.
 *
 * Fixed template bank (documented per the BATCH-1 honesty contract):
 * - 3 channels: email | DM | form
 * - Per channel: 1 fixed request template + 1 fixed follow-up template
 *   = 6 fixed templates. Placeholders [clientName], [productName],
 *   [your name], [your form link] are filled or left for the user.
 * Nothing is generated at runtime; validation is structural only.
 */

export const CHANNELS = ["email", "DM", "form"] as const;
export type Channel = (typeof CHANNELS)[number];

export interface TestimonialItem {
  clientName: string;
  productName: string;
  channel: string;
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeChannel(v: unknown): Channel | null {
  const c = clean(v).toLowerCase();
  if (c === "email") return "email";
  if (c === "dm") return "DM";
  if (c === "form") return "form";
  return null;
}

/**
 * Fixed request-message template per channel, with details filled in.
 * Exported for tests.
 */
export function buildRequestMessage(clientName: string, productName: string, channel: Channel): string {
  switch (channel) {
    case "email":
      return (
        `Subject: Quick favor? A 2-line testimonial for ${productName}\n\n` +
        `Hi ${clientName},\n\n` +
        `Hope you're doing well! You've been getting great results with ${productName}, ` +
        `and I'd love to share your experience with others who are considering it.\n\n` +
        `Would you be open to writing a short testimonial (2-3 sentences)? It would mean a lot. ` +
        `Just reply to this email, or use this link: [your form link]\n\n` +
        `Thank you so much,\n[Your name]`
      );
    case "DM":
      return (
        `Hey ${clientName}! Quick question — would you be up for sharing a short testimonial ` +
        `about ${productName}? Just 2-3 sentences on what changed for you. ` +
        `Totally fine to say no!`
      );
    case "form":
      return (
        `Hi ${clientName}! I'd love to feature your experience with ${productName}. ` +
        `This short form takes 2 minutes: [your form link]. Thank you!`
      );
  }
}

/**
 * Fixed follow-up message template per channel, with details filled in.
 * Exported for tests.
 */
export function buildFollowUpMessage(clientName: string, productName: string, channel: Channel): string {
  switch (channel) {
    case "email":
      return (
        `Subject: Re: Quick favor?\n\n` +
        `Hi ${clientName},\n\n` +
        `Just bumping this up in case it got buried — a short testimonial for ${productName} ` +
        `would really help. Even 2 sentences is perfect. Thanks!`
      );
    case "DM":
      return (
        `Hey ${clientName}, just circling back on the testimonial — no pressure at all, ` +
        `but if you have 2 minutes for ${productName} it would mean a lot. Thanks either way!`
      );
    case "form":
      return (
        `Hi ${clientName}, just a reminder — the testimonial form for ${productName} ` +
        `is here when you're ready: [your form link]. Two minutes, huge help. Thank you!`
      );
  }
}

/**
 * Tool logic slot (builder). BuilderTemplate calls runTool({ items }).
 * Returns values.requestMessages and values.followUpMessages (parallel arrays).
 */
export function runTool(args: { items: Record<string, unknown>[] }): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
    return { ok: false, error: "Add at least one client to build request messages." };
  }
  if (args.items.length === 0) {
    return { ok: false, error: "Add at least one client to build request messages." };
  }

  const requestMessages: string[] = [];
  const followUpMessages: string[] = [];

  for (let i = 0; i < args.items.length; i++) {
    const item = args.items[i];
    const label = `Item ${i + 1}`;
    if (!item || typeof item !== "object") {
      return { ok: false, error: `${label}: not a valid entry.` };
    }
    const clientName = clean(item["clientName"]);
    const productName = clean(item["productName"]);
    if (clientName.length === 0) {
      return { ok: false, error: `${label}: client name is required.` };
    }
    if (productName.length === 0) {
      return { ok: false, error: `${label}: product name is required.` };
    }
    const rawChannel = item["channel"];
    let channel: Channel = "email"; // default when not chosen
    if (rawChannel !== undefined && clean(rawChannel).length > 0) {
      const normalized = normalizeChannel(rawChannel);
      if (normalized === null) {
        return {
          ok: false,
          error: `${label}: channel must be one of email, DM, form.`,
        };
      }
      channel = normalized;
    }

    requestMessages.push(buildRequestMessage(clientName, productName, channel));
    followUpMessages.push(buildFollowUpMessage(clientName, productName, channel));
  }

  return { ok: true, values: { requestMessages, followUpMessages } };
}
