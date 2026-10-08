/**
 * Media Kit Builder — pure logic (tool-457), zero imports, zero network,
 * zero DOM.
 *
 * DATA BUILDER, NOT A DESIGN TOOL: validates creator inputs and assembles a
 * structured, serializable media-kit data object (profile, audience,
 * services, collaborations, contact). It produces NO HTML, NO PDF layout —
 * the app shell renders this data. All rates, follower counts and brand
 * names are USER-PROVIDED; nothing is estimated or looked up.
 *
 * Validation (throws Error with a clear message):
 *   name, niche            — required non-empty strings
 *   platforms              — non-empty array; each entry needs a non-empty
 *                            platform name and a finite followers count >= 0
 *   engagementRate         — optional; if given, finite number 0–100
 *   services               — array (may be empty); each entry needs a
 *                            non-empty name; rate, when given, must be a
 *                            finite number >= 0
 *   pastCollabs            — optional array of non-empty strings
 *   contact                — required; must include at least an email or a
 *                            website; email, when given, must look like an
 *                            email (basic local@domain.tld check)
 *
 * Derived fields:
 *   totalFollowers         — sum of platform followers
 *   audienceShare          — each platform's share of totalFollowers
 *                            (0 when total is 0)
 *   engagementBand         — heuristic band for the user-provided rate:
 *                            <1% low · 1–3% average · 3–6% strong · >6%
 *                            exceptional (rough industry heuristic, NOT a
 *                            measurement or guarantee)
 *   primaryPlatform        — platform with the most followers (null when
 *                            total is 0)
 */

export interface MediaKitPlatformInput {
  platform: string;
  handle?: string;
  followers: number;
}

export interface MediaKitServiceInput {
  name: string;
  rate?: number;
  rateUnit?: string;
  description?: string;
}

export interface MediaKitContactInput {
  email?: string;
  website?: string;
  location?: string;
}

export interface MediaKitInput {
  name: string;
  niche: string;
  bio?: string;
  platforms: MediaKitPlatformInput[];
  /** 0–100 (percent). Optional. */
  engagementRate?: number;
  services: MediaKitServiceInput[];
  pastCollabs?: string[];
  contact: MediaKitContactInput;
}

export interface MediaKitPlatform extends MediaKitPlatformInput {
  /** Share of totalFollowers, 0..1 rounded to 3 decimals (0 when total is 0). */
  audienceShare: number;
}

export type EngagementBand = "low" | "average" | "strong" | "exceptional";

export interface MediaKit {
  profile: {
    name: string;
    niche: string;
    bio: string;
  };
  audience: {
    platforms: MediaKitPlatform[];
    totalFollowers: number;
    primaryPlatform: string | null;
    engagementRate: number | null;
    engagementBand: EngagementBand | null;
  };
  services: {
    items: Array<{
      name: string;
      rate: number | null;
      rateUnit: string | null;
      description: string;
    }>;
    count: number;
  };
  collaborations: {
    brands: string[];
    count: number;
  };
  contact: {
    email: string | null;
    website: string | null;
    location: string | null;
  };
  assumptions: string[];
}

export const ASSUMPTIONS: string[] = [
  "All follower counts, rates and brand names are user-provided — nothing is estimated or fetched.",
  "Engagement bands (<1% low · 1–3% average · 3–6% strong · >6% exceptional) are a rough heuristic, not a measurement or guarantee.",
  "This builder outputs structured data only; visual layout is the app shell's job.",
];

function requireNonEmpty(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value.trim();
}

function requireNonNegativeFinite(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite number >= 0.`);
  }
  return value;
}

function engagementBandFor(rate: number): EngagementBand {
  if (rate < 1) return "low";
  if (rate <= 3) return "average";
  if (rate <= 6) return "strong";
  return "exceptional";
}

/**
 * Validate the input and build the media-kit data object.
 * Throws on any invalid field (see header). Never throws for unicode
 * content — names, niches and brands in any script are kept verbatim.
 */
export function buildMediaKit(input: MediaKitInput): MediaKit {
  if (typeof input !== "object" || input === null) {
    throw new Error("input must be an object.");
  }

  const name = requireNonEmpty(input.name, "name");
  const niche = requireNonEmpty(input.niche, "niche");
  const bio = typeof input.bio === "string" ? input.bio.trim() : "";

  if (!Array.isArray(input.platforms) || input.platforms.length === 0) {
    throw new Error("platforms must be a non-empty array.");
  }
  const platforms: MediaKitPlatform[] = input.platforms.map((p, i) => {
    if (typeof p !== "object" || p === null) {
      throw new Error(`platforms[${i}] must be an object.`);
    }
    return {
      platform: requireNonEmpty(p.platform, `platforms[${i}].platform`),
      handle: typeof p.handle === "string" && p.handle.trim() ? p.handle.trim() : undefined,
      followers: requireNonNegativeFinite(p.followers, `platforms[${i}].followers`),
      audienceShare: 0, // filled below
    };
  });

  let engagementRate: number | null = null;
  if (input.engagementRate !== undefined && input.engagementRate !== null) {
    const r = input.engagementRate;
    if (typeof r !== "number" || !Number.isFinite(r) || r < 0 || r > 100) {
      throw new Error("engagementRate must be a finite number between 0 and 100.");
    }
    engagementRate = r;
  }

  if (!Array.isArray(input.services)) {
    throw new Error("services must be an array (may be empty).");
  }
  const services = input.services.map((s, i) => {
    if (typeof s !== "object" || s === null) {
      throw new Error(`services[${i}] must be an object.`);
    }
    const svcName = requireNonEmpty(s.name, `services[${i}].name`);
    let rate: number | null = null;
    if (s.rate !== undefined && s.rate !== null) {
      rate = requireNonNegativeFinite(s.rate, `services[${i}].rate`);
    }
    return {
      name: svcName,
      rate,
      rateUnit: typeof s.rateUnit === "string" && s.rateUnit.trim() ? s.rateUnit.trim() : null,
      description: typeof s.description === "string" ? s.description.trim() : "",
    };
  });

  let pastCollabs: string[] = [];
  if (input.pastCollabs !== undefined && input.pastCollabs !== null) {
    if (!Array.isArray(input.pastCollabs)) {
      throw new Error("pastCollabs must be an array of strings.");
    }
    pastCollabs = input.pastCollabs.map((c, i) => requireNonEmpty(c, `pastCollabs[${i}]`));
  }

  if (typeof input.contact !== "object" || input.contact === null) {
    throw new Error("contact must be an object with at least an email or a website.");
  }
  const rawEmail = typeof input.contact.email === "string" ? input.contact.email.trim() : "";
  const rawWebsite = typeof input.contact.website === "string" ? input.contact.website.trim() : "";
  if (!rawEmail && !rawWebsite) {
    throw new Error("contact must include at least an email or a website.");
  }
  if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
    throw new Error("contact.email must look like a valid email address (local@domain.tld).");
  }

  const totalFollowers = platforms.reduce((sum, p) => sum + p.followers, 0);
  for (const p of platforms) {
    p.audienceShare = totalFollowers === 0 ? 0 : Math.round((p.followers / totalFollowers) * 1000) / 1000;
  }
  const primaryPlatform =
    totalFollowers === 0
      ? null
      : platforms.reduce((a, b) => (b.followers > a.followers ? b : a)).platform;

  return {
    profile: { name, niche, bio },
    audience: {
      platforms,
      totalFollowers,
      primaryPlatform,
      engagementRate,
      engagementBand: engagementRate === null ? null : engagementBandFor(engagementRate),
    },
    services: { items: services, count: services.length },
    collaborations: { brands: pastCollabs, count: pastCollabs.length },
    contact: {
      email: rawEmail || null,
      website: rawWebsite || null,
      location:
        typeof input.contact.location === "string" && input.contact.location.trim()
          ? input.contact.location.trim()
          : null,
    },
    assumptions: [...ASSUMPTIONS],
  };
}

/* ---------------------------------------------------------------------------
 * runTool ADAPTER (verifiedToolType: builder).
 *
 * Builder contract: runTool receives { items: Record<string, unknown>[] }.
 * - The FIRST item carries the creator profile + contact fields: profileName,
 *   niche, bio, email, website, services (comma-separated names), rateRange.
 * - EVERY item carries one platform row: platform, followers, engagementRate,
 *   profileUrl.
 *
 * The adapter maps these onto MediaKitInput and delegates to buildMediaKit:
 *   profileName -> name · niche -> niche · bio -> bio · email/website -> contact
 *   services ("A, B, C") -> services[{name}] · rateRange -> appended to bio as
 *   "Rate range: <text>" (buildMediaKit has no dedicated rate-range slot, so it
 *   is preserved verbatim in the bio rather than dropped)
 *   platform -> platforms[].platform · followers -> platforms[].followers
 *   profileUrl -> platforms[].handle · engagementRate -> kit-level
 *   engagementRate (first valid value across items; the underlying engine
 *   models one engagement rate per kit, not per platform)
 *
 * Numeric builder fields may arrive as strings from the form; they are
 * coerced and validated (>= 0, finite; engagementRate 0–100). Errors are
 * returned as { ok: false, error: "Item N: ..." }.
 * ------------------------------------------------------------------------- */

/** One builder row: profile fields live on the first row, platform fields on every row. */
export interface MediaKitBuilderItem {
  profileName?: unknown;
  niche?: unknown;
  bio?: unknown;
  email?: unknown;
  website?: unknown;
  services?: unknown;
  rateRange?: unknown;
  platform?: unknown;
  followers?: unknown;
  engagementRate?: unknown;
  profileUrl?: unknown;
}

function itemText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Coerce a form value (number or numeric string) into a validated number. */
function itemNumber(value: unknown, field: string, itemNo: number): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (Number.isNaN(n)) {
    throw new Error(`Item ${itemNo}: ${field} must be a number (got "${String(value)}").`);
  }
  if (!Number.isFinite(n)) {
    throw new Error(`Item ${itemNo}: ${field} must be finite.`);
  }
  if (n < 0) {
    throw new Error(`Item ${itemNo}: ${field} must be >= 0.`);
  }
  return n;
}

/**
 * runTool entry point (verifiedToolType: builder).
 * Returns { ok: true, values: { mediaKit, totalFollowers, primaryPlatform,
 * platformCount, engagementBand } } — output ids match meta.ts outputs.
 */
export function runTool(args: { items: Record<string, unknown>[] }): {
  ok: boolean;
  values?: Record<string, unknown>;
  error?: string;
} {
  try {
    if (!args || typeof args !== "object" || !Array.isArray(args.items)) {
      return { ok: false, error: "Input must be an object with an items array." };
    }
    const items = args.items as MediaKitBuilderItem[];
    if (items.length === 0) {
      return { ok: false, error: "At least one item (platform row) is required." };
    }

    // ---- Profile + contact fields from the FIRST row ----
    const first = items[0];
    const profileName = itemText(first.profileName);
    if (!profileName) {
      return { ok: false, error: "Item 1: profile name is required (first row)." };
    }
    const niche = itemText(first.niche);
    if (!niche) {
      return { ok: false, error: "Item 1: niche is required (first row)." };
    }
    const bioBase = itemText(first.bio);
    const rateRange = itemText(first.rateRange);
    const bio = rateRange
      ? bioBase
        ? `${bioBase}\nRate range: ${rateRange}`
        : `Rate range: ${rateRange}`
      : bioBase;

    const email = itemText(first.email);
    const website = itemText(first.website);
    if (!email && !website) {
      return { ok: false, error: "Item 1: contact needs an email or a website (first row)." };
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Item 1: email must look like a valid address (local@domain.tld)." };
    }

    const servicesRaw = itemText(first.services);
    const services = servicesRaw
      ? servicesRaw
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .map((name) => ({ name }))
      : [];

    // ---- One platform row per item ----
    const platforms: MediaKitPlatformInput[] = [];
    let engagementRate: number | undefined;
    for (let i = 0; i < items.length; i++) {
      const itemNo = i + 1;
      const item = items[i];
      if (!item || typeof item !== "object") {
        return { ok: false, error: `Item ${itemNo}: must be an object.` };
      }
      const platform = itemText(item.platform);
      if (!platform) {
        return { ok: false, error: `Item ${itemNo}: platform is required.` };
      }
      let followers: number | undefined;
      try {
        followers = itemNumber(item.followers, "followers", itemNo);
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : `Item ${itemNo}: invalid followers.` };
      }
      if (followers === undefined) {
        return { ok: false, error: `Item ${itemNo}: followers is required.` };
      }
      let er: number | undefined;
      try {
        er = itemNumber(item.engagementRate, "engagementRate", itemNo);
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : `Item ${itemNo}: invalid engagementRate.` };
      }
      if (er !== undefined) {
        if (er > 100) {
          return { ok: false, error: `Item ${itemNo}: engagementRate must be between 0 and 100.` };
        }
        if (engagementRate === undefined) {
          engagementRate = er; // kit models one rate; first valid value wins
        }
      }
      const profileUrl = itemText(item.profileUrl);
      platforms.push({
        platform,
        handle: profileUrl ? profileUrl : undefined,
        followers,
      });
    }

    const input: MediaKitInput = {
      name: profileName,
      niche,
      bio,
      platforms,
      services,
      contact: { email: email || undefined, website: website || undefined },
    };
    if (engagementRate !== undefined) {
      input.engagementRate = engagementRate;
    }

    const mediaKit = buildMediaKit(input);
    return {
      ok: true,
      values: {
        mediaKit,
        totalFollowers: mediaKit.audience.totalFollowers,
        primaryPlatform: mediaKit.audience.primaryPlatform,
        platformCount: mediaKit.audience.platforms.length,
        engagementBand: mediaKit.audience.engagementBand,
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid input." };
  }
}
