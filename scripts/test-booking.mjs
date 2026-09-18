#!/usr/bin/env node
/**
 * Checks the two things on this site that must never be wrong: the price, and
 * whether a slot is free.
 *
 *   npm run test:booking
 *
 * No test framework, no dependencies. It runs the same functions the website
 * and the payment server run, so a change to `shared/catalog.mjs` or
 * `shared/schedule.mjs` that breaks an assumption fails here rather than on
 * somebody's invoice.
 */

import assert from 'node:assert/strict';
import {
  quote,
  money,
  PACKAGES,
  ADDONS,
  SIZE_TIERS,
  TAX,
  TRAVEL,
  addonsFor,
} from '../shared/catalog.mjs';
import {
  slotsFor,
  slotIsBookable,
  hasAvailability,
  isoDate,
  fromIso,
  formatTime,
  BUFFER_MINUTES,
  LEAD_TIME_HOURS,
} from '../shared/schedule.mjs';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok    ${name}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${name}`);
    console.log(`        ${e.message.split('\n')[0]}`);
  }
}

console.log('\nPricing\n');

test('every package has a price or is explicitly quote-only', () => {
  for (const p of PACKAGES) {
    assert.ok(p.quoteOnly || p.basePriceCents > 0, `${p.id} has no price and is not quoteOnly`);
    assert.ok(p.durationMinutes >= 30, `${p.id} has an implausible duration`);
  }
});

test('a bare package quotes to its base price plus tax', () => {
  const p = PACKAGES.find((x) => !x.quoteOnly);
  const q = quote({ packageId: p.id });
  assert.equal(q.subtotalCents, p.basePriceCents);
  assert.equal(q.taxCents, Math.round(p.basePriceCents * TAX.rate));
  assert.equal(q.totalCents, q.subtotalCents + q.taxCents);
});

test('lines always sum to the subtotal', () => {
  const q = quote({
    packageId: 'premium',
    addonIds: ['floor-plan', 'virtual-tour'],
    sizeTierId: '5000-plus',
    miles: 80,
  });
  const sum = q.lines.reduce((t, l) => t + l.amountCents, 0);
  assert.equal(sum, q.subtotalCents);
  assert.equal(q.totalCents, q.subtotalCents + q.taxCents);
});

test('an add-on already inside a package cannot be bought twice', () => {
  // Premium includes aerial. Asking for it again must not add a line.
  const q = quote({ packageId: 'premium', addonIds: ['drone-photo', 'drone-video'] });
  assert.equal(q.addonIds.length, 0, 'included add-ons were charged for');
  assert.equal(q.subtotalCents, PACKAGES.find((p) => p.id === 'premium').basePriceCents);
});

test('an unknown add-on is dropped rather than accepted', () => {
  const q = quote({ packageId: 'photo', addonIds: ['free-ferrari', 'floor-plan'] });
  assert.deepEqual(q.addonIds, ['floor-plan']);
});

test('a duplicated add-on is only charged once', () => {
  const once = quote({ packageId: 'photo', addonIds: ['floor-plan'] });
  const twice = quote({ packageId: 'photo', addonIds: ['floor-plan', 'floor-plan'] });
  assert.equal(once.totalCents, twice.totalCents);
});

test('travel is free inside the included radius and charged beyond it', () => {
  const near = quote({ packageId: 'photo', miles: TRAVEL.includedMiles });
  assert.ok(!near.lines.some((l) => l.kind === 'travel'), 'charged travel inside the radius');

  const far = quote({ packageId: 'photo', miles: TRAVEL.includedMiles + 20 });
  const line = far.lines.find((l) => l.kind === 'travel');
  assert.ok(line, 'no travel line beyond the radius');
  assert.equal(line.amountCents, 20 * TRAVEL.perMileCents);
});

test('negative mileage cannot be used as a discount', () => {
  const q = quote({ packageId: 'photo', miles: -5000 });
  assert.equal(q.subtotalCents, PACKAGES.find((p) => p.id === 'photo').basePriceCents);
  assert.ok(q.totalCents > 0);
});

test('a quote-only package refuses to produce a total', () => {
  const q = quote({ packageId: 'commercial' });
  assert.equal(q.ok, false);
  assert.equal(q.totalCents, 0);
});

test('an unknown package refuses to produce a total', () => {
  const q = quote({ packageId: 'not-a-real-package' });
  assert.equal(q.ok, false);
});

test('a bigger property costs more and takes longer', () => {
  const small = quote({ packageId: 'photo', sizeTierId: SIZE_TIERS[0].id });
  const large = quote({ packageId: 'photo', sizeTierId: SIZE_TIERS.at(-1).id });
  assert.ok(large.totalCents > small.totalCents);
  assert.ok(large.minutes > small.minutes);
});

test('every add-on is reachable from at least one package', () => {
  const reachable = new Set();
  for (const p of PACKAGES.filter((x) => !x.quoteOnly)) {
    for (const a of addonsFor(p.id)) reachable.add(a.id);
  }
  for (const a of ADDONS) {
    const included = a.includedIn?.length;
    assert.ok(reachable.has(a.id) || included, `${a.id} can never be selected or included`);
  }
});

test('money formats whole dollars without stray cents', () => {
  assert.equal(money(24900), '$249');
  assert.equal(money(110478), '$1,104.78');
});

console.log('\nAvailability\n');

/** The next given weekday, far enough ahead to clear the notice period. */
function nextWeekday(dow, from = new Date()) {
  const d = new Date(from.getTime() + 7 * 86400000);
  while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
  return isoDate(d);
}

const WED = nextWeekday(3);
const SUN = nextWeekday(0);

test('Sunday offers nothing', () => {
  assert.equal(slotsFor(SUN, 90).length, 0);
});

test('a weekday offers slots for a standard shoot', () => {
  const slots = slotsFor(WED, 90);
  assert.ok(slots.length > 0);
  assert.ok(slots.every((s) => /^\d{2}:\d{2}$/.test(s.time)));
});

test('a shoot that cannot fit in the day is not offered at all', () => {
  // Far longer than any working day.
  assert.equal(slotsFor(WED, 24 * 60).length, 0);
});

test('a booking blocks its own slot', () => {
  const booked = [{ date: WED, time: '10:00', minutes: 90 }];
  const slot = slotsFor(WED, 90, booked).find((s) => s.time === '10:00');
  assert.equal(slot.available, false);
  assert.equal(slot.reason, 'Booked');
});

test('the buffer blocks the slots either side of a booking', () => {
  const booked = [{ date: WED, time: '12:00', minutes: 60 }];
  const slots = slotsFor(WED, 30, booked);
  const before = slots.find((s) => s.time === '11:30'); // ends 12:00, inside the buffer
  const after = slots.find((s) => s.time === '13:00');  // starts 13:00, inside the buffer
  assert.equal(before.available, false, 'no buffer before the booking');
  assert.equal(after.available, false, 'no buffer after the booking');
  assert.ok(BUFFER_MINUTES > 0);
});

test('a booking on another day does not block this one', () => {
  const other = nextWeekday(4);
  const booked = [{ date: other, time: '10:00', minutes: 240 }];
  assert.ok(hasAvailability(WED, 90, booked));
});

test('a taken slot is refused at the moment of booking', () => {
  const booked = [{ date: WED, time: '10:00', minutes: 90 }];
  const verdict = slotIsBookable(WED, '10:00', 90, booked);
  assert.equal(verdict.ok, false);
  assert.match(verdict.reason, /taken/i);
});

test('a free slot is accepted', () => {
  const slots = slotsFor(WED, 90);
  const free = slots.find((s) => s.available);
  assert.ok(free, 'no free slot to test with');
  assert.equal(slotIsBookable(WED, free.time, 90, []).ok, true);
});

test('a time that is not on the grid is refused', () => {
  assert.equal(slotIsBookable(WED, '10:07', 90, []).ok, false);
});

test('the notice period keeps today out of the diary', () => {
  const today = isoDate(new Date());
  assert.equal(hasAvailability(today, 90, []), false);
  assert.ok(LEAD_TIME_HOURS >= 1);
});

test('a blocked date offers nothing', () => {
  // Christmas Day is in the default blocked list.
  assert.equal(slotsFor('2026-12-25', 90).length, 0);
});

test('a date string is read as local time, not UTC', () => {
  // The classic bug: `new Date('2026-07-04')` is midnight UTC, which is the
  // 3rd of July anywhere west of Greenwich.
  const d = fromIso('2026-07-04');
  assert.equal(d.getDate(), 4);
  assert.equal(d.getMonth(), 6);
});

test('times format as a reader expects', () => {
  assert.equal(formatTime('09:00'), '9:00 AM');
  assert.equal(formatTime('12:00'), '12:00 PM');
  assert.equal(formatTime('00:30'), '12:30 AM');
  assert.equal(formatTime('13:45'), '1:45 PM');
});

console.log('\nEnd to end\n');

test('a full booking prices and schedules consistently', () => {
  const q = quote({
    packageId: 'photo-video',
    addonIds: ['twilight', 'floor-plan'],
    sizeTierId: '2000-3500',
    miles: 45,
  });
  assert.ok(q.ok);

  // The calendar must offer a day long enough for exactly this quote.
  const slots = slotsFor(WED, q.minutes, []);
  const free = slots.find((s) => s.available);
  assert.ok(free, `nothing on a Wednesday fits a ${q.minutes} minute shoot`);

  // And booking it must then block it for the same duration.
  const booked = [{ date: WED, time: free.time, minutes: q.minutes }];
  assert.equal(slotIsBookable(WED, free.time, q.minutes, booked).ok, false);
});

console.log(`\n${passed} passed, ${failed} failed.\n`);
process.exit(failed === 0 ? 0 : 1);
