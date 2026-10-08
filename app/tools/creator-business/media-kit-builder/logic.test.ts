import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildMediaKit, runTool, ASSUMPTIONS, type MediaKitInput, type MediaKit } from "./logic.ts";

function validInput(): MediaKitInput {
  return {
    name: "Ayesha Khan",
    niche: "budget travel",
    bio: "Travel creator on a budget.",
    platforms: [
      { platform: "Instagram", handle: "@ayesha.travels", followers: 120000 },
      { platform: "TikTok", handle: "@ayesha.travels", followers: 80000 },
      { platform: "YouTube", followers: 25000 },
    ],
    engagementRate: 4.2,
    services: [
      { name: "Sponsored Reel", rate: 450, rateUnit: "USD/post", description: "60s reel + 2 stories" },
      { name: "UGC Video Pack" },
    ],
    pastCollabs: ["WanderStay", "PackLite"],
    contact: { email: "hello@ayesha.travels", website: "https://ayesha.travels" },
  };
}

describe("media-kit-builder", () => {
  it("normal: builds all five sections", () => {
    const kit = buildMediaKit(validInput());
    assert.equal(kit.profile.name, "Ayesha Khan");
    assert.equal(kit.profile.niche, "budget travel");
    assert.equal(kit.audience.totalFollowers, 225000);
    assert.equal(kit.audience.primaryPlatform, "Instagram");
    assert.equal(kit.audience.engagementRate, 4.2);
    assert.equal(kit.audience.engagementBand, "strong");
    assert.equal(kit.services.count, 2);
    assert.equal(kit.collaborations.count, 2);
    assert.equal(kit.contact.email, "hello@ayesha.travels");
    assert.deepEqual(kit.assumptions, ASSUMPTIONS);
  });

  it("audienceShare sums to ~1 and is 0-safe", () => {
    const kit = buildMediaKit(validInput());
    const sum = kit.audience.platforms.reduce((s, p) => s + p.audienceShare, 0);
    assert.ok(Math.abs(sum - 1) < 0.002, `share sum ${sum}`);
    assert.equal(kit.audience.platforms[0].audienceShare, 0.533);
  });

  it("missing name / niche throws", () => {
    const bad = validInput();
    assert.throws(() => buildMediaKit({ ...bad, name: "" }), /name/);
    assert.throws(() => buildMediaKit({ ...bad, niche: "  " }), /niche/);
  });

  it("empty platforms array throws", () => {
    assert.throws(() => buildMediaKit({ ...validInput(), platforms: [] }), /platforms/);
  });

  it("negative followers throws; zero followers allowed", () => {
    const bad = validInput();
    bad.platforms = [{ platform: "X", followers: -5 }];
    assert.throws(() => buildMediaKit(bad), /followers/);

    const zero = validInput();
    zero.platforms = [{ platform: "X", followers: 0 }];
    const kit = buildMediaKit(zero);
    assert.equal(kit.audience.totalFollowers, 0);
    assert.equal(kit.audience.primaryPlatform, null);
    assert.equal(kit.audience.platforms[0].audienceShare, 0);
  });

  it("non-finite followers throws", () => {
    const bad = validInput();
    bad.platforms = [{ platform: "X", followers: NaN }];
    assert.throws(() => buildMediaKit(bad), /followers/);
    bad.platforms = [{ platform: "X", followers: Infinity }];
    assert.throws(() => buildMediaKit(bad), /followers/);
  });

  it("engagementRate out of 0-100 throws; omitted -> null band", () => {
    assert.throws(() => buildMediaKit({ ...validInput(), engagementRate: 101 }), /engagementRate/);
    assert.throws(() => buildMediaKit({ ...validInput(), engagementRate: -1 }), /engagementRate/);
    const { engagementRate: _omit, ...rest } = validInput();
    const kit = buildMediaKit(rest);
    assert.equal(kit.audience.engagementRate, null);
    assert.equal(kit.audience.engagementBand, null);
  });

  it("engagement bands: low / average / strong / exceptional", () => {
    const mk = (rate: number) => buildMediaKit({ ...validInput(), engagementRate: rate });
    assert.equal(mk(0.5).audience.engagementBand, "low");
    assert.equal(mk(2).audience.engagementBand, "average");
    assert.equal(mk(5).audience.engagementBand, "strong");
    assert.equal(mk(9).audience.engagementBand, "exceptional");
  });

  it("contact requires email or website; bad email throws", () => {
    assert.throws(
      () => buildMediaKit({ ...validInput(), contact: {} }),
      /email or a website/
    );
    assert.throws(
      () => buildMediaKit({ ...validInput(), contact: { email: "not-an-email" } }),
      /email/
    );
  });

  it("contact with only website is valid", () => {
    const kit = buildMediaKit({ ...validInput(), contact: { website: "https://x.example" } });
    assert.equal(kit.contact.email, null);
    assert.equal(kit.contact.website, "https://x.example");
  });

  it("service rate must be >= 0 when given; rate-less services allowed", () => {
    const bad = validInput();
    bad.services = [{ name: "Post", rate: -10 }];
    assert.throws(() => buildMediaKit(bad), /rate/);
    const kit = buildMediaKit(validInput());
    assert.equal(kit.services.items[1].rate, null);
    assert.equal(kit.services.items[1].rateUnit, null);
  });

  it("service without name throws", () => {
    const bad = validInput();
    bad.services = [{ name: "  " }];
    assert.throws(() => buildMediaKit(bad), /services\[0\]\.name/);
  });

  it("optional fields default cleanly (bio, pastCollabs, location)", () => {
    const input = validInput();
    delete (input as Partial<MediaKitInput>).bio;
    delete (input as Partial<MediaKitInput>).pastCollabs;
    const kit = buildMediaKit(input);
    assert.equal(kit.profile.bio, "");
    assert.deepEqual(kit.collaborations.brands, []);
    assert.equal(kit.contact.location, null);
  });

  it("blank pastCollabs entries throw", () => {
    assert.throws(
      () => buildMediaKit({ ...validInput(), pastCollabs: ["OK", "  "] }),
      /pastCollabs\[1\]/
    );
  });

  it("unicode names/niches/brands kept verbatim", () => {
    const input = validInput();
    input.name = "寿司太郎";
    input.niche = "料理";
    input.pastCollabs = ["café müller"];
    const kit = buildMediaKit(input);
    assert.equal(kit.profile.name, "寿司太郎");
    assert.equal(kit.collaborations.brands[0], "café müller");
  });

  it("huge follower counts do not lose precision badly", () => {
    const input = validInput();
    input.platforms = [{ platform: "YouTube", followers: 12_500_000 }];
    const kit = buildMediaKit(input);
    assert.equal(kit.audience.totalFollowers, 12_500_000);
    assert.equal(kit.audience.platforms[0].audienceShare, 1);
  });

  it("non-object input throws", () => {
    assert.throws(() => buildMediaKit(null as unknown as MediaKitInput), /object/);
    assert.throws(() => buildMediaKit("x" as unknown as MediaKitInput), /object/);
  });

  it("output contains no HTML tags — pure data object", () => {
    const kit = buildMediaKit(validInput());
    const json = JSON.stringify(kit);
    assert.ok(!/<[a-zA-Z/!][^>]*>/.test(json), "no HTML tags in output");
  });

  it("platform handle is optional and trimmed", () => {
    const input = validInput();
    input.platforms = [{ platform: "  X  ", followers: 10 }];
    const kit = buildMediaKit(input);
    assert.equal(kit.audience.platforms[0].platform, "X");
    assert.equal(kit.audience.platforms[0].handle, undefined);
  });

  it("fractional followers are accepted (finite >= 0)", () => {
    const input = validInput();
    input.platforms = [{ platform: "X", followers: 10.5 }];
    const kit = buildMediaKit(input);
    assert.equal(kit.audience.totalFollowers, 10.5);
  });
});

describe("runTool adapter — builder contract", () => {
  function twoRowItems() {
    return [
      {
        profileName: "Ayesha Khan",
        niche: "budget travel",
        bio: "Travel creator on a budget.",
        email: "hello@ayesha.travels",
        website: "https://ayesha.travels",
        services: "Sponsored Reel, UGC Video Pack",
        rateRange: "$200–$500 per post",
        platform: "Instagram",
        followers: 120000,
        engagementRate: 4.2,
        profileUrl: "https://instagram.com/ayesha.travels",
      },
      {
        platform: "TikTok",
        followers: "80000", // string coercion
        engagementRate: 5.1, // second item's rate is ignored; first wins
        profileUrl: "",
      },
    ];
  }

  it("maps rows to MediaKitInput and returns the five output keys", () => {
    const res = runTool({ items: twoRowItems() });
    assert.equal(res.ok, true);
    assert.deepEqual(Object.keys(res.values!).sort(), [
      "engagementBand",
      "mediaKit",
      "platformCount",
      "primaryPlatform",
      "totalFollowers",
    ]);
    const kit = res.values!.mediaKit as MediaKit;
    assert.equal(kit.profile.name, "Ayesha Khan");
    assert.equal(kit.profile.niche, "budget travel");
    assert.equal(res.values!.totalFollowers, 200000);
    assert.equal(res.values!.primaryPlatform, "Instagram");
    assert.equal(res.values!.platformCount, 2);
    assert.equal(res.values!.engagementBand, "strong"); // 4.2 from FIRST row
  });

  it("splits comma-separated services and appends rateRange to bio", () => {
    const res = runTool({ items: twoRowItems() });
    const kit = res.values!.mediaKit as MediaKit;
    assert.deepEqual(
      kit.services.items.map((s) => s.name),
      ["Sponsored Reel", "UGC Video Pack"],
    );
    assert.ok(kit.profile.bio.includes("Rate range: $200–$500 per post"));
    assert.ok(kit.profile.bio.startsWith("Travel creator on a budget."));
  });

  it("stores profileUrl as the platform handle", () => {
    const res = runTool({ items: twoRowItems() });
    const kit = res.values!.mediaKit as MediaKit;
    assert.equal(kit.audience.platforms[0].handle, "https://instagram.com/ayesha.travels");
  });

  it("coerces string followers; rejects bad followers with 'Item N:' error", () => {
    const items = twoRowItems();
    items[1].followers = "lots";
    const res = runTool({ items });
    assert.equal(res.ok, false);
    assert.ok(res.error!.startsWith("Item 2: followers must be a number"));
  });

  it("rejects negative followers", () => {
    const items = twoRowItems();
    items[0].followers = -5;
    const res = runTool({ items });
    assert.equal(res.ok, false);
    assert.equal(res.error, "Item 1: followers must be >= 0.");
  });

  it("requires a platform on every row", () => {
    const items = twoRowItems();
    delete (items[1] as Record<string, unknown>).platform;
    const res = runTool({ items });
    assert.equal(res.ok, false);
    assert.equal(res.error, "Item 2: platform is required.");
  });

  it("requires profile name and niche on the first row", () => {
    const noName = twoRowItems();
    noName[0].profileName = "  ";
    assert.equal(runTool({ items: noName }).error, "Item 1: profile name is required (first row).");
    const noNiche = twoRowItems();
    delete (noNiche[0] as Record<string, unknown>).niche;
    assert.equal(runTool({ items: noNiche }).error, "Item 1: niche is required (first row).");
  });

  it("requires email or website on the first row and validates email format", () => {
    const noContact = twoRowItems();
    delete (noContact[0] as Record<string, unknown>).email;
    delete (noContact[0] as Record<string, unknown>).website;
    assert.equal(
      runTool({ items: noContact }).error,
      "Item 1: contact needs an email or a website (first row).",
    );
    const badEmail = twoRowItems();
    badEmail[0].email = "not-an-email";
    assert.ok(runTool({ items: badEmail }).error!.includes("must look like a valid address"));
  });

  it("rejects engagementRate above 100", () => {
    const items = twoRowItems();
    items[0].engagementRate = 150;
    const res = runTool({ items });
    assert.equal(res.ok, false);
    assert.equal(res.error, "Item 1: engagementRate must be between 0 and 100.");
  });

  it("works with a single row and no engagement rate (website-only contact)", () => {
    const res = runTool({
      items: [
        {
          profileName: "New Creator",
          niche: "tech",
          email: "",
          website: "https://newcreator.example",
          platform: "YouTube",
          followers: 0,
        },
      ],
    });
    assert.equal(res.ok, true);
    assert.equal(res.values!.totalFollowers, 0);
    assert.equal(res.values!.primaryPlatform, null);
    assert.equal(res.values!.engagementBand, null);
    const kit = res.values!.mediaKit as MediaKit;
    assert.equal(kit.contact.website, "https://newcreator.example");
    assert.deepEqual(kit.services.items, []);
  });

  it("empty items array and non-object args return human errors", () => {
    assert.equal(runTool({ items: [] }).error, "At least one item (platform row) is required.");
    assert.equal(runTool(null as never).error, "Input must be an object with an items array.");
    assert.equal(
      runTool({ items: "nope" } as never).error,
      "Input must be an object with an items array.",
    );
  });

  it("keeps unicode names verbatim and imports nothing (pure logic)", () => {
    const res = runTool({
      items: [
        {
          profileName: "عائشہ خان",
          niche: "سفر",
          email: "a@example.com",
          platform: "Instagram",
          followers: 10,
        },
      ],
    });
    assert.equal(res.ok, true);
    const kit = res.values!.mediaKit as MediaKit;
    assert.equal(kit.profile.name, "عائشہ خان");
  });
});
