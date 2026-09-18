/* ============================================================================
   VALIDATION
   ----------------------------------------------------------------------------
   Rules live here, not in the forms, so "a valid phone number" means the same
   thing on the contact page and inside the booking flow.

   The tone matters. An error message should say what to do next, not scold.
   "Enter a phone number we can reach you on" beats "Invalid input".
   ========================================================================= */

export type Validator = (value: string) => string | null;

export const required =
  (label: string): Validator =>
  (v) =>
    v.trim().length === 0 ? `${label} is required.` : null;

export const email: Validator = (v) => {
  const t = v.trim();
  if (!t) return 'Enter an email address so we can send your confirmation.';
  // Deliberately loose. The only authority on whether an address works is
  // whether mail to it arrives; over-strict patterns reject real addresses.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(t)) return 'That does not look like an email address.';
  return null;
};

export const phone: Validator = (v) => {
  const digits = v.replace(/\D/g, '');
  if (!digits) return 'Enter a phone number we can reach you on.';
  // 10 digits, or 11 starting with a country code of 1.
  if (digits.length < 10 || digits.length > 11) return 'Enter a 10-digit phone number.';
  if (digits.length === 11 && !digits.startsWith('1')) return 'Enter a 10-digit phone number.';
  return null;
};

export const minLength =
  (n: number, label: string): Validator =>
  (v) =>
    v.trim().length < n ? `${label} needs at least ${n} characters.` : null;

export const address: Validator = (v) => {
  const t = v.trim();
  if (!t) return 'Enter the property address so we know where to go.';
  if (t.length < 8) return 'Enter the full address, including the town.';
  return null;
};

export const squareFeet: Validator = (v) => {
  if (!v.trim()) return null; // Optional — the size tier covers it.
  const num = Number(v.replace(/[^\d]/g, ''));
  if (!num) return 'Enter a number, or leave this blank.';
  if (num > 100000) return 'That seems too large — check the figure.';
  return null;
};

/** Runs a map of validators over a map of values. Returns only the failures. */
export function validate<T extends Record<string, string>>(
  values: T,
  rules: Partial<Record<keyof T, Validator>>,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const key of Object.keys(rules) as (keyof T)[]) {
    const rule = rules[key];
    if (!rule) continue;
    const message = rule(values[key] ?? '');
    if (message) errors[key] = message;
  }
  return errors;
}

/** (662) 322-8022 as you type. Formatting a phone field is worth the code. */
export function formatPhone(input: string): string {
  const d = input.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
