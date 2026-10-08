#!/usr/bin/env python3
"""Generate data/tool-classification/class-J.json for Category J (Creator Business), tools 451-500."""
import json, os

INV = json.load(open(os.path.expanduser("~/workspace/husnainblogger-platform/data/tools-inventory.json")))
inv = {t["id"]: t for t in INV["tools"] if 451 <= t["id"] <= 500}

def C(i, verifiedToolType, engine, inputs, outputs, validation, edgeCases,
      clientSideFeasible, feasibilityNote, formulaRef, platformRulesRef,
      possibleDuplicateOf, typeCorrected=False, typeNote=None, disclaimer=None):
    t = inv[i]
    obj = {
        "toolId": t["toolId"],
        "name": t["name"],
        "slug": t["slug"],
        "verifiedToolType": verifiedToolType,
        "inventoryToolType": t["toolType"],
        "toolTypeCorrected": typeCorrected,
        "engine": engine,
        "inputs": inputs,
        "outputs": outputs,
        "validation": validation,
        "edgeCases": edgeCases,
        "clientSideFeasible": clientSideFeasible,
        "feasibilityNote": feasibilityNote,
        "formulaRef": formulaRef,
        "platformRulesRef": platformRulesRef,
        "possibleDuplicateOf": possibleDuplicateOf,
    }
    if typeNote:
        obj["toolTypeNote"] = typeNote
    if disclaimer:
        obj["disclaimerRequired"] = disclaimer
    return obj

NUM = ["must be a finite number", "must be >= 0", "reject NaN/Infinity/empty"]
PCT = ["percentage inputs must be numbers between 0 and 100 (bounds enforced in UI)"]

tools = []

# 451 Video Editing Rate Calculator
tools.append(C(451, "calculator", "arithmetic",
    ["projectType (select)", "finishedVideoMinutes (number)", "estimatedEditingHours (number)",
     "hourlyRate (number, user)", "revisionRoundsIncluded (number)", "extraCosts (number, music/licenses)"],
    ["recommendedProjectPrice", "effectivePerMinuteRate", "priceBreakdown (labor + extras)"],
    NUM,
    ["zero editing hours -> prompt for estimate, not $0 output", "very long videos -> per-minute rate floors at user minimum"],
    True, "Pure arithmetic on user inputs; no external data needed.",
    "J-PROJECT-PRICE", [], ["tool-071 (Video Editor Rate Calculator, Cat B) — STRONG duplicate candidate"]))

# 452 Freelance Day Rate Calculator
tools.append(C(452, "calculator", "arithmetic",
    ["annualIncomeTarget (number)", "annualBusinessExpenses (number)", "workingDaysPerYear (number, default 260)",
     "nonBillableDays (number, vacation/admin/marketing)"],
    ["recommendedDayRate", "billableDaysPerYear", "hourlyEquivalent (dayRate/8, user-adjustable hours)"],
    NUM + ["billableDaysPerYear must be > 0"],
    ["nonBillableDays >= workingDaysPerYear -> validation error", "expenses = 0 -> note that rate covers income only"],
    True, "Deterministic formula; all inputs user-supplied.",
    "J-DAY-RATE", [], ["tool-068 (Freelance Hourly Rate Calculator, Cat B) — related, different granularity"]))

# 453 Late Payment Fee Calculator
tools.append(C(453, "calculator", "arithmetic",
    ["invoiceAmount (number)", "feeMode (select: percent-per-day | flat-plus-daily)",
     "lateFeeRatePct (number, USER assumption)", "flatFee (number)", "dailyFee (number)", "daysLate (number)"],
    ["lateFeeAmount", "totalAmountDue", "effectiveAnnualizedNote (informational)"],
    NUM + PCT,
    ["daysLate = 0 -> fee $0", "fee exceeding principal -> warning flag, still computed"],
    True, "Math only. The late-fee RATE is a user assumption; tool must not present any default rate as legally standard. Late-fee enforceability varies by jurisdiction — informational only.",
    "J-LATE-FEE", [], []))

# 454 Rush Fee Calculator
tools.append(C(454, "calculator", "arithmetic",
    ["baseProjectPrice (number)", "rushPct (number, USER assumption)", "rushTier (optional select: user-defined)"],
    ["rushFeeAmount", "rushTotal", "rushFeeAsPctOfBase"],
    NUM + PCT,
    ["rushPct = 0 -> total equals base", "rushPct > 200 -> confirm prompt (likely typo)"],
    True, "Math only. Rush percentages are user-defined pricing policy, not market facts.",
    "J-RUSH-FEE", [], []))

# 455 Usage Rights Fee Estimator
tools.append(C(455, "calculator", "arithmetic",
    ["baseCreativeFee (number)", "durationMonths (number)", "durationMultiplier (number, USER input)",
     "territoryMultiplier (number, USER input)", "mediaChannelMultiplier (number, USER input)", "exclusivityAddOnPct (number, USER input)"],
    ["estimatedUsageFee", "totalWithBase", "factorBreakdown"],
    NUM,
    ["any multiplier = 0 -> fee $0 with warning (probably wrong input)", "no industry-standard multipliers exist — all factors are user pricing assumptions"],
    True, "No factual licensing-rate tables; every multiplier is a user input. Tool computes base x product-of-factors only.",
    "J-USAGE-RIGHTS", [], ["Cat B sponsorship calculators (tool-079..084) — related domain, distinct function"]))

# 456 Brand Deal Contract Generator
tools.append(C(456, "generator", "template",
    ["brandName", "creatorName", "deliverables (list)", "feeAmount", "paymentTerms", "usageRightsSummary",
     "exclusivityClause (optional)", "timelineDates", "revisionLimit", "killFeePct (USER input)"],
    ["contractDraftText (sectioned: parties, scope, compensation, usage, exclusivity, term/termination, payment, signatures)"],
    ["all party names non-empty", "feeAmount numeric >= 0"],
    ["jurisdiction not selected -> template marked 'jurisdiction-neutral draft'", "user must review each clause before use"],
    True, "Client-side template assembly with variable substitution. MUST render persistent disclaimer: informational template only, not legal advice; recommend attorney review. No jurisdiction-specific legal claims.",
    None, [], [],
    disclaimer="informational only, not legal advice"))

# 457 Media Kit Builder
tools.append(C(457, "builder", "composite",
    ["creatorName", "niche", "followerCounts (per platform)", "engagementRate (USER input)", "audienceDemographics (USER input)",
     "pastBrandDeals (list)", "rateSummary (optional)", "contactEmail"],
    ["mediaKitDocument (printable/shareable page)", "onePageSummary"],
    ["follower counts numeric >= 0", "email format valid"],
    ["engagement rate is self-reported — tool labels it 'as reported by creator'", "zero followers -> still builds kit, flags growth stage"],
    True, "Assembles user-provided stats into a formatted document; performs no verification of claimed metrics.",
    None, [], ["tool-085 (Rate Card Generator, Cat B) — related, distinct (kit vs rate card)"]))

# 458 Retainer vs Hourly Comparator — TYPE CORRECTION: generator -> calculator
tools.append(C(458, "calculator", "arithmetic",
    ["hourlyRate (number)", "estimatedHoursPerMonth (number)", "retainerFee (number)",
     "retainerIncludedHours (number)", "overageHourlyRate (number)"],
    ["hourlyModelMonthlyCost", "retainerModelMonthlyCost", "breakEvenHours", "cheaperOption", "savingsDifference"],
    NUM,
    ["estimated hours below included hours -> retainer likely cheaper; show math", "overage rate missing -> default to hourlyRate with note"],
    True, "Compares two deterministic cost models; recommendation is arithmetic, not advice.",
    "J-RETAINER-COMPARE", [], [],
    typeCorrected=True,
    typeNote="Inventory says 'generator'; verified as 'calculator' — it computes and compares two numeric cost models, generating no text content."))

# 459 Milestone Payment Planner
tools.append(C(459, "planner", "arithmetic",
    ["contractValue (number)", "milestones (list of {name, pctOfTotal (USER input), dueCondition})"],
    ["milestoneSchedule (amount per milestone)", "sumCheck (must equal 100%)", "paymentTimeline"],
    NUM + ["milestone percentages must sum to 100 (validation error otherwise)"],
    ["single milestone at 100% -> warning about no upfront protection (informational)", "rounding: distribute remainder cents to final milestone"],
    True, "Pure percentage split math; percentages are user-defined.",
    "J-MILESTONE", [], []))

# 460 Walk-Away Rate Calculator
tools.append(C(460, "calculator", "arithmetic",
    ["monthlyBusinessCosts (number)", "billableHoursPerMonth (number)", "bufferPct (number, USER assumption)",
     "currentRate (number, optional for comparison)"],
    ["floorRate (cost-covering)", "walkAwayRate (floor + buffer)", "gapVsCurrentRate"],
    NUM + PCT + ["billableHoursPerMonth must be > 0"],
    ["buffer = 0 -> walk-away equals floor (survival rate, flagged)", "costs = 0 -> floor $0, flagged as incomplete input"],
    True, "Math only; the buffer percentage is a user business assumption.",
    "J-WALK-AWAY", [], []))

# 461 Revision Pricing Calculator
tools.append(C(461, "calculator", "arithmetic",
    ["baseProjectFee (number)", "includedRevisions (number)", "requestedRevisions (number)",
     "pricingMode (select: pct-of-fee | flat-per-revision)", "revisionPct (USER input)", "flatPerRevision (USER input)"],
    ["extraRevisionCount", "revisionFee", "newProjectTotal"],
    NUM + PCT,
    ["requested <= included -> fee $0", "revisionPct = 0 in pct mode -> prompt"],
    True, "Math only; rates are user pricing policy.",
    "J-REVISION", [], []))

# 462 Kill Fee Calculator
tools.append(C(462, "calculator", "arithmetic",
    ["contractValue (number)", "projectStage (select: not-started | in-progress | near-complete)",
     "killPctNotStarted (USER input)", "killPctInProgress (USER input)", "killPctNearComplete (USER input)"],
    ["killFeeAmount", "killFeePctApplied", "clientRefund (contractValue - killFee, if prepaid)"],
    NUM + PCT,
    ["stage percentages are user/contract terms — tool never invents a 'standard' kill fee", "killPct = 100 at near-complete is user choice"],
    True, "Math only. Percentages come from the user's own contract terms; no default presented as standard.",
    "J-KILL-FEE", [], []))

# 463 NDA Generator
tools.append(C(463, "generator", "template",
    ["disclosingParty", "receivingParty", "effectiveDate", "confidentialInfoDescription",
     "termYears (USER input)", "mutual (boolean)", "governingLawJurisdiction (USER free text)"],
    ["ndaDraftText (sectioned template)"],
    ["party names non-empty", "effectiveDate valid date"],
    ["jurisdiction free-text is echoed, not validated — flagged as user-provided", "no electronic signature; draft only"],
    True, "Template assembly only. MUST render persistent disclaimer: informational template only, not legal advice; enforceability varies by jurisdiction.",
    None, [], [],
    disclaimer="informational only, not legal advice"))

# 464 Scope of Work Generator
tools.append(C(464, "generator", "template",
    ["projectTitle", "clientName", "deliverables (list)", "timeline", "revisionLimit", "outOfScope (list)",
     "paymentTerms", "assumptions"],
    ["scopeOfWorkDocument (sectioned)"],
    ["at least one deliverable required", "non-empty title/client"],
    ["empty out-of-scope -> warning suggesting explicit exclusions (informational)"],
    True, "Deterministic document assembly from user inputs.",
    None, [], []))

# 465 Client Onboarding Questionnaire Generator
tools.append(C(465, "generator", "template",
    ["serviceType (select)", "includeSections (multi-select: goals, brand, audience, logistics, budget)"],
    ["questionnaireDocument (grouped questions, copyable)"],
    ["at least one section selected"],
    ["serviceType 'other' -> generic sections only"],
    True, "Curated question bank filtered by user selections; fully client-side.",
    None, [], []))

# 466 Rate Negotiation Email Generator
tools.append(C(466, "generator", "template",
    ["clientName", "yourName", "currentOffer (number)", "counterOffer (number)", "tone (select: firm | friendly | walk-away)",
     "valuePoints (list)"],
    ["negotiationEmailDraft (subject + body)"],
    ["counterOffer numeric", "tone selected"],
    ["counter below current offer -> flagged as concession, still generated"],
    True, "Template-based email draft; user edits before sending. No sending capability (out of scope).",
    None, [], []))

# 467 Brand Pitch Email Generator
tools.append(C(467, "generator", "template",
    ["brandName", "creatorName", "niche", "followerCount", "engagementRate (USER input)",
     "pastResults (list)", "pitchAngle (select)", "callToAction"],
    ["pitchEmailDraft (subject options + body)"],
    ["non-empty brand/creator names"],
    ["metrics are user-provided and labeled as such in output"],
    True, "Template assembly; metrics echoed as user-provided, never verified.",
    None, [], []))

# 468 Overdue Invoice Reminder Generator
tools.append(C(468, "generator", "template",
    ["clientName", "invoiceNumber", "amountDue", "daysOverdue", "escalationLevel (select: polite | firm | final)"],
    ["reminderEmailDraft (subject + body)"],
    ["amountDue numeric >= 0", "daysOverdue integer >= 0"],
    ["escalationLevel 'final' -> includes 'seek advice' note, not legal threats"],
    True, "Template-based; no automated sending. Related to tool-078/tool-479 invoice tools but distinct function (reminder vs invoice document).",
    None, [], []))

# 469 Quarterly Tax Estimator for Freelancers
tools.append(C(469, "calculator", "arithmetic",
    ["quarterNetProfit (number, USER input)", "annualNetProfitEstimate (number, USER input)",
     "effectiveTaxRatePct (number, USER INPUT — never prefilled)", "incomeTaxRatePct (optional USER input)",
     "selfEmploymentTaxRatePct (optional USER input)"],
    ["estimatedQuarterlyPayment", "estimatedAnnualTax", "rateBreakdown (if split rates given)"],
    NUM + ["tax rate inputs must be 0-100", "rates must be explicitly entered by user (no defaults)"],
    ["profit = 0 -> estimate $0", "user enters 0% rate -> computed $0 with 'rate provided by you' label"],
    True, "CRITICAL: no hardcoded tax rates anywhere (no defaults, no placeholders that look like rates). Formula multiplies user profit by user rate. MUST render persistent disclaimer: informational estimate only, not tax advice; consult a tax professional.",
    "J-TAX-EST", [], [],
    disclaimer="informational only, not tax advice"))

# 470 Creator Deduction Finder
tools.append(C(470, "generator", "rule-based",
    ["creatorType (select: video | photo | audio | writer | streamer)", "expenseChecklist (multi-select from curated categories)",
     "homeOffice (boolean)", "vehicleUse (boolean)"],
    ["matchedDeductionCategories (general information list)", "recordKeepingTips", "questionsForTaxPro"],
    ["at least one category or creatorType selected"],
    ["output is categories of commonly-tracked expenses, NEVER a determination that an item is deductible for the user",
     "country-specific rules not encoded — output labeled 'general information, rules vary by country'"],
    True, "Rule-based category matcher over a curated general-information list. Must not present any item as deductible; every result carries the tax-advice disclaimer and 'confirm with a tax professional' note.",
    None, [], [],
    disclaimer="informational only, not tax advice"))

# 471 Wedding Videographer Package Builder
tools.append(C(471, "builder", "composite",
    ["hoursOfCoverage (number)", "shooters (number)", "deliverables (multi-select: highlight, full film, teaser, raw)",
     "baseDayRate (USER input)", "addOnPrices (USER inputs)"],
    ["packageTiers (e.g., essential/premium/luxury with prices)", "packageSummaryDocument"],
    NUM,
    ["hours = 0 -> validation error", "no deliverables -> prompt to select at least one"],
    True, "Arithmetic tier builder on user pricing inputs.",
    "J-PACKAGE-TIER", [], []))

# 472 Wedding Photographer Pricing Calculator
tools.append(C(472, "calculator", "arithmetic",
    ["hoursOfCoverage", "secondShooter (boolean)", "secondShooterRate (USER input)", "baseRate (USER input)",
     "editingHoursPerShootingHour (USER input)", "printsAlbumsCost (USER input)"],
    ["recommendedPackagePrice", "costBreakdown"],
    NUM,
    ["editing multiplier is user assumption, not a standard"],
    True, "Math only on user inputs.",
    "J-PROJECT-PRICE", [], []))

# 473 Logo Design Quote Builder
tools.append(C(473, "builder", "composite",
    ["conceptsCount (number)", "revisionRounds (number)", "deliverableFormats (multi-select)", "baseRate (USER input)",
     "rushAddOn (boolean)", "usageScope (select)"],
    ["itemizedQuote", "quoteDocument (client-ready)"],
    NUM,
    ["concepts = 0 -> validation error"],
    True, "Itemized arithmetic + document assembly.",
    "J-PROJECT-PRICE", [], ["tool-069 (Project Quote Generator, Cat B) — MEDIUM: generic vs logo-specific"]))

# 474 Thumbnail Designer Package Pricer — TYPE CORRECTION: generator -> calculator
tools.append(C(474, "calculator", "arithmetic",
    ["thumbnailsPerMonth (number)", "pricePerThumbnail (USER input)", "revisionsIncluded (number)",
     "bundleDiscountPct (USER input)"],
    ["monthlyPackagePrice", "perThumbnailEffective", "tierOptions (e.g., 10/20/30 pack prices)"],
    NUM + PCT,
    ["volume = 0 -> validation error"],
    True, "Tiered pricing math on user rates.",
    "J-PACKAGE-TIER", [], [],
    typeCorrected=True,
    typeNote="Inventory says 'generator'; verified as 'calculator' — output is computed prices/tiers, not generated text content."))

# 475 Podcast Editing Rate Calculator
tools.append(C(475, "calculator", "arithmetic",
    ["episodeMinutes (number)", "editMultiplier (USER input, e.g., editing hours per finished hour)",
     "hourlyRate (USER input)", "addOns (multi-select with USER prices: show notes, audiogram, chapters)"],
    ["perEpisodePrice", "monthlyRetainerEstimate (episodesPerMonth x perEpisode)"],
    NUM,
    ["editMultiplier is user assumption — labeled as such"],
    True, "Math only. Distinct from tool-082 (Podcast Sponsorship Rate Calculator, Cat B) which prices ad slots, not editing labor.",
    "J-PROJECT-PRICE", [], []))

# 476 Online Coach Package Builder
tools.append(C(476, "builder", "composite",
    ["sessionsPerPackage (number)", "sessionLengthMin (number)", "pricePerSession (USER input)",
     "supportAddOns (multi-select with USER prices)", "packageDiscountPct (USER input)"],
    ["packagePrice", "packageTiers", "packageDescription (client-ready)"],
    NUM + PCT,
    ["sessions = 0 -> validation error"],
    True, "Arithmetic + document assembly.",
    "J-PACKAGE-TIER", [], ["tool-094 (Coaching Package Pricing Calculator, Cat B) — STRONG duplicate candidate"]))

# 477 eBook Royalty Estimator
tools.append(C(477, "calculator", "arithmetic",
    ["listPrice (number)", "royaltyRatePct (number, USER INPUT — never prefilled)",
     "expectedUnits (number)", "platformFeePct (optional USER input)", "fixedFees (optional USER input)"],
    ["royaltyPerUnit", "estimatedTotalRoyalties", "netAfterFees"],
    NUM + PCT + ["royalty rate must be user-entered (no defaults)"],
    ["royaltyRate = 0 -> $0 with 'rate provided by you' label", "no retailer-specific rates hardcoded (e.g., no 35%/70% presets presented as facts)"],
    True, "CRITICAL: royalty rates vary by retailer/territory and change; tool takes rate as user input only.",
    "J-ROYALTY", [], ["tool-060 (Amazon KDP Royalty Calculator, Cat B)", "tool-093 (eBook Pricing & Royalty Calculator, Cat B) — STRONG triple overlap"]))

# 478 Platform Fee Comparer — TYPE CORRECTION: generator -> calculator
tools.append(C(478, "calculator", "arithmetic",
    ["salePrice (number)", "platforms (multi-select with USER-entered feePct and fixedFee per platform)"],
    ["netPayoutPerPlatform (ranked table)", "bestNetPayout", "feeBreakdownPerPlatform"],
    NUM + ["each platform needs user-entered feePct/fixedFee — no hardcoded platform fees"],
    ["platform fees change over time — UI labels all fees 'as entered by you; verify against platform docs'",
     "equal payouts -> tie note"],
    True, "Comparison math on user-entered fees only. Must not hardcode any platform's fee schedule.",
    "J-PLATFORM-FEE", [], ["Cat B fee calculators (tool-055..067) — related single-platform tools, distinct (comparison)"],
    typeCorrected=True,
    typeNote="Inventory says 'generator'; verified as 'calculator' — output is computed net-payout comparison table, not generated text."))

# 479 Billable Hours Invoice Builder
tools.append(C(479, "builder", "composite",
    ["clientName", "lineItems (list of {description, hours, rate})", "taxRatePct (optional USER input)",
     "invoiceNumber", "dueDate", "paymentDetails"],
    ["invoiceDocument (itemized, printable)", "subtotal", "taxAmount", "totalDue"],
    NUM + ["tax rate user-entered only (no default)", "at least one line item required"],
    ["taxRate empty -> no tax line (not 0% assumption)", "rounding to 2 decimals"],
    True, "Arithmetic + document assembly. No hardcoded tax rates.",
    "J-BILLABLE-INVOICE", [], ["tool-078 (Freelance Invoice Generator, Cat B) — STRONG duplicate candidate"]))

# 480 Client Profitability Tracker
tools.append(C(480, "tracker", "storage",
    ["clients (list of {name, revenue, hoursWorked, hourlyCostRate, directExpenses})"],
    ["profitPerClient", "marginPctPerClient", "clientRanking", "exportableCSV (client-side)"],
    NUM + ["client name non-empty and unique"],
    ["localStorage only — data lost if browser data cleared; export/import JSON recommended",
     "negative margin flagged, not hidden"],
    True, "localStorage-backed; pure client-side math. No sync/backend.",
    "J-CLIENT-PROFIT", [], []))

# 481 Project Timeline Estimator
tools.append(C(481, "calculator", "arithmetic",
    ["tasks (list of {name, hoursEstimate})", "workHoursPerDay (USER input)", "startDate", "bufferDays (USER input)"],
    ["totalHours", "estimatedWorkDays", "estimatedEndDate", "taskBreakdown"],
    NUM + ["workHoursPerDay > 0", "startDate valid date"],
    ["estimates are user guesses — output labeled 'based on your estimates'", "bufferDays = 0 -> note shown"],
    True, "Date arithmetic on user estimates only.",
    "J-PROJECT-TIMELINE", [], []))

# 482 Shoot Day-Rate Planner
tools.append(C(482, "planner", "arithmetic",
    ["annualIncomeTarget", "annualExpenses", "shootDaysPerYear (USER input)", "assistantCostsPerShoot (USER input)",
     "gearRentalPerShoot (USER input)"],
    ["recommendedShootDayRate", "perShootCostBreakdown", "annualCapacityCheck"],
    NUM + ["shootDaysPerYear > 0"],
    ["per-shoot costs are user inputs, not market rates"],
    True, "Day-rate formula variant with per-shoot cost inputs.",
    "J-DAY-RATE", [], []))

# 483 Exclusivity Fee Calculator
tools.append(C(483, "calculator", "arithmetic",
    ["baseDealFee (number)", "exclusivityPct (number, USER assumption)", "exclusivityMonths (number)",
     "flatFeeMode (optional: flat USER fee instead)"],
    ["exclusivityFee", "totalDealValue", "monthlyEquivalent"],
    NUM + PCT,
    ["exclusivityPct is user pricing policy, not a market standard — labeled as such"],
    True, "Math only; percentage is user assumption.",
    "J-EXCLUSIVITY", [], []))

# 484 Whitelisting Fee Calculator
tools.append(C(484, "calculator", "arithmetic",
    ["baseContentFee (number)", "whitelistPctPerMonth (number, USER assumption)", "whitelistMonths (number)",
     "flatMonthlyMode (optional: flat USER monthly fee)"],
    ["whitelistingFeeTotal", "monthlyFee", "totalDealValue"],
    NUM + PCT,
    ["whitelist percentage is user pricing policy, not a platform fact"],
    True, "Math only; rates are user assumptions.",
    "J-WHITELIST", [], []))

# 485 Scope Creep Fee Calculator
tools.append(C(485, "calculator", "arithmetic",
    ["originalFee (number)", "additionalHours (number)", "hourlyRate (USER input)",
     "mode (select: hourly | pct-of-fee)", "creepPct (USER input)"],
    ["scopeCreepFee", "revisedProjectTotal", "creepAsPctOfOriginal"],
    NUM + PCT,
    ["additionalHours = 0 -> fee $0"],
    True, "Math only on user inputs.",
    "J-SCOPE-CREEP", [], []))

# 486 Client Red Flag Checklist
tools.append(C(486, "generator", "rule-based",
    ["observedSignals (multi-select from curated signal list)", "notes (optional)"],
    ["riskScore (count-based)", "flaggedSignalsSummary", "suggestedNextSteps (generic, informational)"],
    ["at least one signal selected"],
    ["signals are subjective observations — output labeled 'your assessment aid, not a factual claim about the client'",
     "no defamation-adjacent language in output templates"],
    True, "Count-based scoring over user-selected signals; no external data.",
    None, [], []))

# 487 Testimonial Showcase Page Builder
tools.append(C(487, "builder", "template",
    ["testimonials (list of {quote, clientName, role, photoUrl optional})", "pageTitle", "brandColor (USER input)"],
    ["showcasePageHTML (static, copyable)", "embedSnippet"],
    ["at least one testimonial", "quotes non-empty"],
    ["testimonials are user-provided — tool adds no verification badge", "output is static HTML for user to host"],
    True, "Static HTML assembly from user content. Distinct from tool-231/319/424 (testimonial REQUEST generators).",
    None, [], []))

# 488 Case Study Template Generator
tools.append(C(488, "generator", "template",
    ["clientName", "industry", "challenge", "solution", "results (USER-provided metrics)", "quote (optional)"],
    ["caseStudyDocument (sectioned: challenge/solution/results)"],
    ["non-empty client/challenge/solution"],
    ["results echoed as user-provided, labeled as such"],
    True, "Template assembly.",
    None, [], ["tool-339 (Case Study Outline Generator, Cat G) — MEDIUM overlap"]))

# 489 Proposal Template Generator
tools.append(C(489, "generator", "template",
    ["clientName", "projectTitle", "approach", "deliverables (list)", "timeline", "investment (number)",
     "termsSummary"],
    ["proposalDocument (sectioned, client-ready)"],
    ["investment numeric >= 0"],
    ["distinct from tool-069 Project Quote Generator (quote = price doc; proposal = scope+pitch doc)"],
    True, "Template assembly.",
    None, [], []))

# 490 Discovery Call Question Generator
tools.append(C(490, "generator", "template",
    ["serviceType (select)", "callGoal (select: qualify | scope | close)"],
    ["questionList (grouped: rapport, needs, budget, timeline, decision)"],
    ["serviceType and callGoal selected"],
    [],
    True, "Curated question bank filtered by selections; client-side.",
    None, [], []))

# 491 Referral Program Planner
tools.append(C(491, "planner", "arithmetic",
    ["avgClientValue (number)", "commissionPct (USER input)", "flatBounty (optional USER input)",
     "expectedReferralsPerQuarter (USER input)"],
    ["payoutPerReferral", "quarterlyProgramCost", "programROIEstimate (based on user inputs)"],
    NUM + PCT,
    ["commission terms are user policy, not advice"],
    True, "Math only.",
    "J-REFERRAL", [], []))

# 492 Freelancer Business Name Generator
tools.append(C(492, "generator", "template",
    ["keywords (list)", "style (select: professional | playful | minimal)", "nameCount (number, max 50)"],
    ["nameIdeas (combinatorial from curated word banks + user keywords)"],
    ["at least one keyword", "nameCount 1-50"],
    ["CANNOT check domain/trademark availability client-side — output carries 'verify availability and trademark yourself' note",
     "word banks are curated static lists"],
    True, "Combinatorial generation from static word banks; no availability checks possible offline.",
    None, [], []))

# 493 Freelancer Tagline Generator
tools.append(C(493, "generator", "template",
    ["serviceKeywords (list)", "tone (select)", "taglineCount (number, max 30)"],
    ["taglineIdeas"],
    ["at least one keyword"],
    ["template patterns only — no brand-conflict checking"],
    True, "Pattern-based assembly from static templates.",
    None, [], []))

# 494 LinkedIn Headline Generator
tools.append(C(494, "generator", "template",
    ["role", "specialties (list)", "proofPoint (optional USER input)", "style (select)"],
    ["headlineOptions (character-counted, <=220 chars)"],
    ["role non-empty"],
    ["proof points echoed as user-provided", "character limit enforced (LinkedIn headline limit is platform UI knowledge, not fetched)"],
    True, "Template assembly with character counting.",
    None, [], []))

# 495 Cold Outreach Tracker
tools.append(C(495, "tracker", "storage",
    ["prospects (list of {name, company, contact, status, dateContacted, followUpDate, notes})"],
    ["pipelineView (by status)", "followUpDueList", "conversionStats (counts by status)", "exportableCSV"],
    ["prospect name non-empty", "status from fixed set"],
    ["localStorage only — export recommended", "no automated emailing (out of scope)"],
    True, "localStorage-backed CRUD + counts; no backend.",
    None, [], []))

# 496 Income Goal Planner
tools.append(C(496, "planner", "arithmetic",
    ["annualIncomeGoal (number)", "annualExpenses (number)", "avgClientValue (USER input)",
     "workWeeksPerYear (USER input)"],
    ["requiredMonthlyRevenue", "clientsNeededPerMonth", "weeklyTarget", "gapVsCurrent (if current income given)"],
    NUM + ["avgClientValue > 0"],
    ["all targets are user aspirations — output labeled as plan math, not earnings promise"],
    True, "Division/multiplication on user inputs.",
    "J-INCOME-GOAL", [], []))

# 497 Service Package Builder
tools.append(C(497, "builder", "composite",
    ["services (list of {name, price})", "packageName", "bundleDiscountPct (USER input)", "packageDescription"],
    ["packagePrice", "savingsVsALaCarte", "packageSalesSheet"],
    NUM + PCT + ["at least one service"],
    ["generic builder — overlaps niche package builders (tool-471, tool-476) by design; differentiation is niche-specific presets"],
    True, "Arithmetic + document assembly.",
    "J-PACKAGE-TIER", [], ["tool-471 (Wedding Videographer Package Builder)", "tool-476 (Online Coach Package Builder) — MEDIUM: generic vs niche"]))

# 498 Booking Page Copy Generator
tools.append(C(498, "generator", "template",
    ["serviceName", "targetClient", "benefits (list)", "processSteps (list)", "priceAnchor (optional USER input)",
     "tone (select)"],
    ["bookingPageCopy (headline, subhead, benefits, process, FAQ stub, CTA)"],
    ["serviceName and targetClient non-empty"],
    ["price anchor echoed as user-provided"],
    True, "Sectioned copy assembly from user inputs.",
    None, [], []))

# 499 Client Offboarding Checklist
tools.append(C(499, "generator", "rule-based",
    ["projectType (select)", "deliverablesHandover (boolean)", "finalInvoiceSent (boolean)"],
    ["offboardingChecklist (final files, credentials, invoice, testimonial ask, referral ask, archive)"],
    [],
    ["checklist adapts to toggles; informational only"],
    True, "Conditional checklist assembly.",
    None, [], []))

# 500 Project Debrief Template Builder
tools.append(C(500, "builder", "template",
    ["projectName", "sections (multi-select: wins, issues, metrics, lessons, followups)"],
    ["debriefDocument (sectioned template with prompts)"],
    ["projectName non-empty", "at least one section"],
    [],
    True, "Template assembly with reflective prompts.",
    None, [], []))

out = {"category": "J", "categoryName": "Creator Business", "toolCount": len(tools),
       "generatedBy": "MA2 Creator Business subagent", "generatedDate": "2026-10-01",
       "tools": tools}
p = os.path.expanduser("~/workspace/husnainblogger-platform/data/tool-classification/class-J.json")
os.makedirs(os.path.dirname(p), exist_ok=True)
json.dump(out, open(p, "w"), indent=2, ensure_ascii=False)
print("wrote", p, len(tools), "tools")
print("corrected types:", [(t["toolId"], t["inventoryToolType"], "->", t["verifiedToolType"]) for t in tools if t["toolTypeCorrected"]])
