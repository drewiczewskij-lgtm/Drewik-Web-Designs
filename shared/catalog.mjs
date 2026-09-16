/* ============================================================================
   KM PRODUCTIONS — THE PRICE LIST
   ----------------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT TO CHANGE A PRICE.

   Plain JavaScript on purpose. The website imports it, and so does the payment
   server in `api/`. One list, two readers — so a price can never be right in
   the browser and wrong on the receipt.

   Every amount is in WHOLE US CENTS. 24900 is $249.00. Working in cents is
   what Stripe expects and it removes every rounding argument.

   To change a price: edit the number. Nothing else in the site needs touching.
   To add a package or an add-on: copy a block, give it a new `id`, and it
   appears on the pricing page, in the booking flow and on the invoice.
   ========================================================================= */

/** Sales tax applied to the subtotal. Set `rate` to 0 to switch tax off. */
export const TAX = {
  label: 'MS state sales tax',
  /** 7% — Mississippi's general rate. Change to your own and it flows through. */
  rate: 0.07,
};

/** Mileage beyond the included radius. Set `perMileCents` to 0 to switch off. */
export const TRAVEL = {
  includedMiles: 30,
  perMileCents: 95,
  label: 'Travel beyond 30 miles',
};

/** Deposit taken online to hold the date. The rest is due on delivery day. */
export const DEPOSIT = {
  /** 'full' charges the whole job now. 'percent' charges `percent` of it. */
  mode: 'full',
  percent: 0.5,
};

/* ---------------------------------------------------------------------------
   PACKAGES
   `basePriceCents` covers a property up to the first size tier below.
   `quoteOnly: true` means no online price — the enquiry form takes over.
   ------------------------------------------------------------------------ */

export const PACKAGES = [
  {
    id: 'photo',
    name: 'Photo',
    tagline: 'The listing essential.',
    basePriceCents: 24900,
    durationMinutes: 90,
    category: 'real-estate',
    summary:
      'Interior and exterior stills, professionally lit and edited. Everything a listing needs to go live looking its best.',
    includes: [
      '25–35 edited high-resolution photos',
      'Interior and exterior coverage',
      'Professional lighting and flambient blending',
      'Sky replacement and lens correction',
      'MLS-sized and full-resolution files',
      'Online gallery, delivered in 24–48 hours',
    ],
    popular: false,
  },
  {
    id: 'photo-video',
    name: 'Photo + Video',
    tagline: 'Stills and motion, one visit.',
    basePriceCents: 54900,
    durationMinutes: 150,
    category: 'real-estate',
    summary:
      'The photo package plus a cinematic walkthrough — the listing that performs on the portal and on social.',
    includes: [
      'Everything in the Photo package',
      '60–90 second cinematic property film',
      'Gimbal-stabilised walkthrough',
      'Licensed music and colour grade',
      'Horizontal and vertical social cut',
      'Delivered in 48–72 hours',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Ground and air, the full package.',
    basePriceCents: 84900,
    durationMinutes: 210,
    category: 'real-estate',
    summary:
      'Photo, film and full aerial coverage. Built for the listing that has to look like the best one on the street.',
    includes: [
      'Everything in Photo + Video',
      '10–15 aerial photographs',
      'Aerial video, cut into the property film',
      'Twilight exterior set',
      'Premium grade and retouching',
      'Priority 48-hour delivery',
    ],
    popular: false,
  },
  {
    id: 'commercial',
    name: 'Commercial',
    tagline: 'Built around the brief.',
    basePriceCents: 0,
    quoteOnly: true,
    durationMinutes: 240,
    category: 'commercial',
    summary:
      'Brand films, promotional spots and social campaigns for local businesses. Scoped and quoted per project.',
    includes: [
      'Discovery call and treatment',
      'Scripting and shot list',
      'Half or full production day',
      'Interviews, b-roll and aerial as needed',
      'Edit, grade, sound mix and captions',
      'Cutdowns for every platform you run',
    ],
    popular: false,
  },
];

/* ---------------------------------------------------------------------------
   ADD-ONS
   `appliesTo` limits an add-on to certain packages. Leave it out for "all".
   An add-on already inside a package is hidden automatically — no one should
   be able to buy drone coverage twice.
   ------------------------------------------------------------------------ */

export const ADDONS = [
  {
    id: 'drone-photo',
    name: 'Aerial photography',
    priceCents: 14900,
    minutes: 30,
    description: '10–15 edited aerial stills showing the lot, roofline and surroundings.',
    includedIn: ['premium'],
  },
  {
    id: 'drone-video',
    name: 'Aerial video',
    priceCents: 19900,
    minutes: 30,
    description: 'Cinematic aerial footage — reveal, orbit and pull-back, cut and graded.',
    includedIn: ['premium'],
  },
  {
    id: 'twilight',
    name: 'Twilight exteriors',
    priceCents: 14900,
    minutes: 45,
    description: 'A second visit at golden hour. The single best-performing photo on most listings.',
    includedIn: ['premium'],
  },
  {
    id: 'floor-plan',
    name: '2D floor plan',
    priceCents: 9900,
    minutes: 25,
    description: 'Measured, drawn and labelled. Delivered as a branded PDF and a web image.',
  },
  {
    id: 'virtual-tour',
    name: '3D virtual tour',
    priceCents: 17900,
    minutes: 45,
    description: 'A walkable 360° tour with a shareable link that embeds in any listing.',
  },
  {
    id: 'social-cut',
    name: 'Vertical social cut',
    priceCents: 12900,
    minutes: 0,
    description: 'A separate 9:16 edit with captions, built for Reels, TikTok and Shorts.',
    includedIn: ['photo-video', 'premium'],
  },
  {
    id: 'agent-intro',
    name: 'On-camera agent intro',
    priceCents: 14900,
    minutes: 30,
    description: 'You, on camera, opening the film. Lavalier audio and a teleprompter if you want one.',
    appliesTo: ['photo-video', 'premium', 'commercial'],
  },
  {
    id: 'rush',
    name: 'Rush delivery',
    priceCents: 9900,
    minutes: 0,
    description: 'Everything back within 24 hours of the shoot, ahead of the queue.',
  },
];

/* ---------------------------------------------------------------------------
   PROPERTY SIZE
   Bigger houses take longer, so they cost more. The first tier is included in
   the package price; each tier after it adds its `surchargeCents`.
   ------------------------------------------------------------------------ */

export const SIZE_TIERS = [
  { id: 'under-2000', label: 'Up to 2,000 sq ft', maxSqFt: 2000, surchargeCents: 0, minutes: 0 },
  { id: '2000-3500', label: '2,000 – 3,500 sq ft', maxSqFt: 3500, surchargeCents: 7500, minutes: 20 },
  { id: '3500-5000', label: '3,500 – 5,000 sq ft', maxSqFt: 5000, surchargeCents: 15000, minutes: 40 },
  { id: '5000-plus', label: 'Over 5,000 sq ft', maxSqFt: Infinity, surchargeCents: 25000, minutes: 60 },
];

export const PROPERTY_TYPES = [
  'Single-family home',
  'Condo or townhouse',
  'New construction',
  'Land or lot',
  'Multi-family',
  'Commercial property',
  'Short-term rental',
];

/* ---------------------------------------------------------------------------
   LOOKUPS
   ------------------------------------------------------------------------ */

export const getPackage = (id) => PACKAGES.find((p) => p.id === id) ?? null;
export const getAddon = (id) => ADDONS.find((a) => a.id === id) ?? null;
export const getSizeTier = (id) => SIZE_TIERS.find((t) => t.id === id) ?? SIZE_TIERS[0];

/** Add-ons a package can actually take, minus the ones it already contains. */
export function addonsFor(packageId) {
  return ADDONS.filter((a) => {
    if (a.appliesTo && !a.appliesTo.includes(packageId)) return false;
    if (a.includedIn && a.includedIn.includes(packageId)) return false;
    return true;
  });
}

/** What a package already covers, so the UI can say so rather than sell it twice. */
export function includedAddonsFor(packageId) {
  return ADDONS.filter((a) => a.includedIn && a.includedIn.includes(packageId));
}

/* ---------------------------------------------------------------------------
   THE QUOTE
   One function, used by the booking screen and again by the payment server
   before a card is charged. The browser's total is never trusted: the server
   runs this and charges what IT gets.
   ------------------------------------------------------------------------ */

/**
 * @param {{ packageId: string, addonIds?: string[], sizeTierId?: string, miles?: number }} input
 */
export function quote(input) {
  const pkg = getPackage(input.packageId);
  if (!pkg) {
    return { ok: false, error: `Unknown package: ${input.packageId}`, lines: [], subtotalCents: 0, taxCents: 0, totalCents: 0, minutes: 0 };
  }
  if (pkg.quoteOnly) {
    return { ok: false, error: `${pkg.name} is quoted per project and cannot be booked online.`, lines: [], subtotalCents: 0, taxCents: 0, totalCents: 0, minutes: 0 };
  }

  const lines = [];
  let minutes = pkg.durationMinutes;

  lines.push({ kind: 'package', id: pkg.id, label: `${pkg.name} package`, amountCents: pkg.basePriceCents });

  // Size. The first tier is free, so it never appears as a line.
  const tier = getSizeTier(input.sizeTierId ?? SIZE_TIERS[0].id);
  if (tier.surchargeCents > 0) {
    lines.push({ kind: 'size', id: tier.id, label: `Property size — ${tier.label}`, amountCents: tier.surchargeCents });
    minutes += tier.minutes;
  }

  // Add-ons. Unknown ids and ones the package already covers are dropped
  // rather than rejected, so a stale link can never overcharge anyone.
  const allowed = new Set(addonsFor(pkg.id).map((a) => a.id));
  const chosen = [...new Set(input.addonIds ?? [])].filter((id) => allowed.has(id));
  for (const id of chosen) {
    const addon = getAddon(id);
    if (!addon) continue;
    lines.push({ kind: 'addon', id: addon.id, label: addon.name, amountCents: addon.priceCents });
    minutes += addon.minutes;
  }

  // Travel.
  const miles = Math.max(0, Math.round(Number(input.miles) || 0));
  const billableMiles = Math.max(0, miles - TRAVEL.includedMiles);
  if (billableMiles > 0 && TRAVEL.perMileCents > 0) {
    lines.push({
      kind: 'travel',
      id: 'travel',
      label: `${TRAVEL.label} (${billableMiles} mi)`,
      amountCents: billableMiles * TRAVEL.perMileCents,
    });
  }

  const subtotalCents = lines.reduce((sum, l) => sum + l.amountCents, 0);
  const taxCents = Math.round(subtotalCents * TAX.rate);
  const totalCents = subtotalCents + taxCents;
  const dueNowCents =
    DEPOSIT.mode === 'percent' ? Math.round(totalCents * DEPOSIT.percent) : totalCents;

  return {
    ok: true,
    error: null,
    packageId: pkg.id,
    addonIds: chosen,
    sizeTierId: tier.id,
    lines,
    subtotalCents,
    taxLabel: TAX.label,
    taxRate: TAX.rate,
    taxCents,
    totalCents,
    dueNowCents,
    balanceCents: totalCents - dueNowCents,
    /** Minutes the shoot will occupy, which is what reserves the calendar slot. */
    minutes,
  };
}

/** $1,234 — or $1,234.50 when the cents are not round. */
export function money(cents) {
  const dollars = cents / 100;
  return dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number.isInteger(dollars) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
