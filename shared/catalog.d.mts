/* Types for `catalog.mjs`. The prices live in the .mjs so the payment server
   can read them without a build step; these declarations give the React app
   full type safety over the same file. */

export interface Package {
  id: string;
  name: string;
  tagline: string;
  basePriceCents: number;
  durationMinutes: number;
  category: 'real-estate' | 'commercial';
  summary: string;
  includes: string[];
  popular?: boolean;
  quoteOnly?: boolean;
}

export interface Addon {
  id: string;
  name: string;
  priceCents: number;
  minutes: number;
  description: string;
  appliesTo?: string[];
  includedIn?: string[];
}

export interface SizeTier {
  id: string;
  label: string;
  maxSqFt: number;
  surchargeCents: number;
  minutes: number;
}

export interface QuoteLine {
  kind: 'package' | 'size' | 'addon' | 'travel';
  id: string;
  label: string;
  amountCents: number;
}

export interface QuoteInput {
  packageId: string;
  addonIds?: string[];
  sizeTierId?: string;
  miles?: number;
}

export interface QuoteResult {
  ok: boolean;
  error: string | null;
  packageId?: string;
  addonIds?: string[];
  sizeTierId?: string;
  lines: QuoteLine[];
  subtotalCents: number;
  taxLabel?: string;
  taxRate?: number;
  taxCents: number;
  totalCents: number;
  dueNowCents?: number;
  balanceCents?: number;
  minutes: number;
}

export const TAX: { label: string; rate: number };
export const TRAVEL: { includedMiles: number; perMileCents: number; label: string };
export const DEPOSIT: { mode: 'full' | 'percent'; percent: number };
export const PACKAGES: Package[];
export const ADDONS: Addon[];
export const SIZE_TIERS: SizeTier[];
export const PROPERTY_TYPES: string[];

export function getPackage(id: string): Package | null;
export function getAddon(id: string): Addon | null;
export function getSizeTier(id: string): SizeTier;
export function addonsFor(packageId: string): Addon[];
export function includedAddonsFor(packageId: string): Addon[];
export function quote(input: QuoteInput): QuoteResult;
export function money(cents: number): string;
