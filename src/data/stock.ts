/* ============================================================================
   STOCK PHOTOGRAPHS — a real-photo set you can switch on with one command
   ----------------------------------------------------------------------------
       npm run use:stock            # see what it would change
       npm run use:stock -- --write # turn real photographs on
       npm run check:images         # verify every one of them resolves
       npm run use:stock -- --revert# go back to the drawn plates

   This exists so the site can show actual photography before your own work is
   ready. It is a STAGING STEP, not the destination: these are other people's
   pictures of other people's houses, and the point of the site is to show
   yours. Replace them as soon as you have files — `npm run link:work`.

   ── WHAT THESE ARE ────────────────────────────────────────────────────────
   Unsplash photo ids. Unsplash photographs are free to use commercially
   without permission or attribution under the Unsplash licence, which is why
   they are the set chosen here. They are served through Unsplash's own image
   CDN, resized on the fly — `src/data/images.ts` builds the URLs.

   ── A WARNING WORTH READING ───────────────────────────────────────────────
   These ids were written WITHOUT network access and have never been checked
   against the live CDN. Some may have been taken down or renamed.

   Nothing breaks if one is wrong: `Figure` falls back to the drawn plate, so a
   dead id reads as art direction rather than as a broken image. But you should
   know which, so RUN `npm run check:images` after switching them on. It
   requests every one and names the failures, and you can delete those lines.
   ========================================================================= */

export interface StockEntry {
  /** An Unsplash photo id — the part of the address after `/photos/`. */
  id: string;
  /** Alt text for THIS photograph. Replaces the plate's description. */
  alt: string;
}

/** Keyed by the entry name in `src/data/images.ts`. */
export const STOCK: Record<string, StockEntry> = {
  heroTwilight: {
    id: 'photo-1600596542815-ffad4c1539a9',
    alt: 'A low modern house with a pale facade and large windows, photographed from the driveway in soft evening light.',
  },
  homeAerial: {
    id: 'photo-1512917774080-9991f1c4c750',
    alt: 'A large suburban house with a landscaped lawn and driveway, seen from a raised angle.',
  },
  homeInterior: {
    id: 'photo-1600607687939-ce8a6c25118c',
    alt: 'A bright living room with a sectional sofa, timber floor and a full-height window.',
  },
  homeFilm: {
    id: 'photo-1523217582562-09d0def993a6',
    alt: 'A contemporary house lit from within at dusk, its interiors visible through the glazing.',
  },

  reExteriorTwilight: {
    id: 'photo-1523217582562-09d0def993a6',
    alt: 'A house photographed at dusk with the interior lights on and the sky still holding colour.',
  },
  reExteriorDay: {
    id: 'photo-1568605114967-8130f3a36994',
    alt: 'A two-storey house with a pitched roof and a lawn, photographed in clear daylight from the front.',
  },
  reExteriorModern: {
    id: 'photo-1600585154340-be6161a56a0c',
    alt: 'A contemporary house of stacked rectangular volumes with wide glazing.',
  },
  reExteriorNight: {
    id: 'photo-1512918728675-ed5a9ecdebfd',
    alt: 'A modern house after dark, windows lit across the elevation.',
  },
  reLiving: {
    id: 'photo-1600607687920-4e2a09cf159d',
    alt: 'A living room with a pale sofa, timber flooring and tall windows.',
  },
  reKitchen: {
    id: 'photo-1600489000022-c2086d79f9d4',
    alt: 'A kitchen with a stone island, pendant lighting and full-height cabinetry.',
  },
  reBedroom: {
    id: 'photo-1600566753086-00f18fb6b3ea',
    alt: 'A bedroom with an upholstered headboard, bedside lamps and a window to one side.',
  },
  reBath: {
    id: 'photo-1600210492486-724fe5c67fb0',
    alt: 'A bathroom with a freestanding tub, stone tiling and a large mirror.',
  },
  reDining: {
    id: 'photo-1600121848594-d8644e57abab',
    alt: 'A dining room with a long table, upholstered chairs and pendant lighting above.',
  },
  reStair: {
    id: 'photo-1600607688969-a5bfcd646154',
    alt: 'A staircase with timber treads and a slim metal balustrade.',
  },
  entryStair: {
    id: 'photo-1600566753190-17f0baa2a6c3',
    alt: 'A double-height entry hall with a staircase rising to a landing above.',
  },
  reDetail: {
    id: 'photo-1600607687644-c7171b42498b',
    alt: 'A close detail of timber joinery and metal hardware, lit from the side.',
  },
  rePool: {
    id: 'photo-1571003123894-1f0594d2b5d9',
    alt: 'A rectangular swimming pool beside a house, with paved coping and a lawn beyond.',
  },
  reTerrace: {
    id: 'photo-1600585154526-990dced4db0d',
    alt: 'A covered outdoor terrace with seating, looking out onto a garden.',
  },
  reWalkthrough: {
    id: 'photo-1600585154084-4e5fe7c39198',
    alt: 'A hallway looking through to a bright room at the end.',
  },

  aerialProperty: {
    id: 'photo-1592595896551-12b371d546d5',
    alt: 'A house and its grounds photographed from directly above, showing the roof, drive and garden.',
  },
  aerialNeighborhood: {
    id: 'photo-1449844908441-8829872d2607',
    alt: 'A residential neighbourhood seen from the air, with streets, rooftops and mature trees.',
  },
  aerialLand: {
    id: 'photo-1500382017468-9049fed747ef',
    alt: 'Open farmland and fields photographed from above in low golden light.',
  },
  aerialWater: {
    id: 'photo-1507525428034-b723cf961d3e',
    alt: 'A shoreline meeting clear water, photographed from above.',
  },
  aerialHighway: {
    id: 'photo-1502920917128-1aa500764cbd',
    alt: 'A road running through open country, photographed from the air.',
  },
  droneInFlight: {
    id: 'photo-1473968512647-3e447244af8f',
    alt: 'A camera drone in flight against an open sky.',
  },

  filmFrameA: {
    id: 'photo-1600047509807-ba8f99d2cdde',
    alt: 'A wide interior view of a living space, framed as a film still.',
  },
  filmFrameB: {
    id: 'photo-1600607687644-c7171b42498b',
    alt: 'An interior detail shot, framed as a film still.',
  },

  commRestaurant: {
    id: 'photo-1517248135467-4c7edcad34c4',
    alt: 'A restaurant interior during service, with warm lighting over the tables.',
  },
  commGym: {
    id: 'photo-1534438327276-14e5300c3a48',
    alt: 'A gym floor with weight equipment and racks under overhead lighting.',
  },
  commAuto: {
    id: 'photo-1552519507-da3b142c6e3d',
    alt: 'A car photographed in three-quarter view under controlled lighting.',
  },
  commHotel: {
    id: 'photo-1566073771259-6a8506099945',
    alt: 'A hotel exterior at dusk with lit windows and a lit entrance.',
  },
  commRetail: {
    id: 'photo-1441986300917-64674bd600d8',
    alt: 'A retail interior with rails of stock and track lighting.',
  },
  commEvent: {
    id: 'photo-1492684223066-81342ee5ff30',
    alt: 'An event at night with stage lighting over a crowd.',
  },

  lifestyleTerrace: {
    id: 'photo-1600585154340-be6161a56a0c',
    alt: 'An outdoor terrace in evening light, set up for entertaining.',
  },
  gearStill: {
    id: 'photo-1502920917128-1aa500764cbd',
    alt: 'A professional camera body with a prime lens, photographed against a dark background.',
  },
};

/** The founder's portrait is NOT in this list, and never will be. A stock
    photograph of a stranger presented as the founder of this business would be
    a lie told to every visitor. That slot stays a drawn stand-in until a real
    photograph of the real person is added. */
export const NEVER_STOCK = ['founderPortrait'] as const;
