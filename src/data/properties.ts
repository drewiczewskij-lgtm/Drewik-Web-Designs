import type { ImageKey } from './images';

export interface Stat {
  label: string;
  value: string;
}

export interface Scene {
  id: string;
  index: string;
  name: string;
  image: ImageKey;
  /** One line of orientation, shown under the room name during the walkthrough. */
  note: string;
  /** Read out beside the frame; three facts, no more. */
  facts: [string, string, string];
  /** Hotspots in per-cent of the frame. `to` links to another scene. */
  hotspots?: { x: number; y: number; label: string; to?: string }[];
}

export interface FloorRoom {
  id: string;
  name: string;
  area: string;
  /** SVG polygon points in the floor-plan coordinate system (1000 x 620). */
  points: string;
  /** Where the label sits. */
  label: [number, number];
  /** Outdoor rooms are drawn with a dashed edge, as on a real plan. */
  outdoor?: boolean;
}

export interface FloorPlanSpec {
  level: string;
  note: string;
  /** The enclosed envelope, drawn heavy. Everything else is a partition. */
  outline: string;
  /** Overall dimension called out along the top of the drawing. */
  span: string;
  rooms: FloorRoom[];
}

export interface Property {
  slug: string;
  name: string;
  /** Short display name used in tight spaces. */
  shortName: string;
  city: string;
  region: string;
  locationLine: string;
  status: string;
  price: number;
  priceDisplay: string;
  priceCompact: string;
  beds: number;
  baths: number;
  sqft: number;
  lot: string;
  year: number;
  architect: string;
  /** One sentence. The line that sells it. */
  summary: string;
  /** The architecture narrative — two to three paragraphs. */
  narrative: string[];
  /** A single pulled quote from the architect or the listing. */
  pull: string;
  hero: ImageKey;
  cover: ImageKey;
  gallery: { image: ImageKey; caption: string }[];
  scenes: Scene[];
  floor: FloorPlanSpec;
  amenities: { group: string; items: string[] }[];
  neighborhood: string;
  /** Position on the dot map, in grid units matching US_MASK. */
  map: { col: number; row: number };
  agent: 'elena' | 'thomas';
}

export const PROPERTIES: Property[] = [
  {
    slug: 'casa-aurelia',
    name: 'Casa Aurelia',
    shortName: 'Aurelia',
    city: 'Malibu',
    region: 'California',
    locationLine: 'Malibu, California',
    status: 'Private Residence',
    price: 8_950_000,
    priceDisplay: '$8,950,000',
    priceCompact: '$8.95M',
    beds: 4,
    baths: 5,
    sqft: 5420,
    lot: '1.4 Acres',
    year: 2021,
    architect: 'Solveig Náray, Náray Ferrer',
    summary:
      'A private coastal residence where natural stone, warm oak, and expansive glass frame uninterrupted Pacific views.',
    narrative: [
      'Casa Aurelia occupies the last buildable parcel on a bluff above Escondido Beach, and the house is organised entirely around that single fact. Rather than face the ocean head-on, Náray set the plan on a five-degree rotation, so the view arrives obliquely — first as a bright edge at the end of the entry gallery, then as the whole horizon once you have turned the corner into the living room.',
      'The material palette is narrow and deliberate. Walls are hand-troweled lime plaster. Floors run in a single width of rift-sawn white oak, continuing without threshold from the interior out onto the stone terrace. Where the house meets the weather it is clad in Portuguese limestone, laid in courses that shorten as the elevation rises, so the mass appears to lift.',
      'Glazing is structural and frameless at the corners, achieved with a hidden steel moment frame that lets the living volume open on two sides with no visible support. Nothing about the detailing announces itself. The house was designed so that after a week you stop noticing it, and notice only the water.',
    ],
    pull: 'The brief was a single sentence: build something that disappears by four in the afternoon.',
    hero: 'aureliaHero',
    cover: 'aureliaExterior',
    gallery: [
      { image: 'aureliaExterior', caption: 'West elevation, late afternoon' },
      { image: 'aureliaLiving', caption: 'Living room, looking south-west' },
      { image: 'aureliaKitchen', caption: 'Kitchen — honed limestone, single slab' },
      { image: 'aureliaStair', caption: 'Gallery stair, solid oak treads' },
      { image: 'aureliaSuite', caption: 'Primary suite, upper level' },
      { image: 'aureliaBath', caption: 'Primary bath, travertine' },
      { image: 'aureliaDining', caption: 'Dining room beneath the clerestory' },
      { image: 'aureliaPool', caption: 'Pool terrace at the bluff edge' },
      { image: 'aureliaDetail', caption: 'Detail — oak joinery, bronze pull' },
      { image: 'aureliaDusk', caption: 'The house after sunset' },
    ],
    scenes: [
      {
        id: 'exterior',
        index: '01',
        name: 'Exterior',
        image: 'aureliaExterior',
        note: 'Arrival court, west elevation',
        facts: ['1.4 acre parcel', 'Limestone, coursed', 'Gated motor court'],
        hotspots: [
          { x: 26, y: 62, label: 'Entry gallery', to: 'living' },
          { x: 74, y: 48, label: 'Terrace', to: 'terrace' },
        ],
      },
      {
        id: 'living',
        index: '02',
        name: 'Living Room',
        image: 'aureliaLiving',
        note: 'Principal volume, double-height at the corner',
        facts: ['11 ft ceilings', 'Frameless corner glazing', 'Limestone hearth'],
        hotspots: [
          { x: 71, y: 44, label: 'Dining', to: 'kitchen' },
          { x: 33, y: 71, label: 'To the terrace', to: 'terrace' },
        ],
      },
      {
        id: 'kitchen',
        index: '03',
        name: 'Kitchen',
        image: 'aureliaKitchen',
        note: 'Working kitchen and scullery beyond',
        facts: ['Single-slab island', 'Concealed scullery', 'Clerestory daylight'],
        hotspots: [{ x: 60, y: 38, label: 'Upper level', to: 'suite' }],
      },
      {
        id: 'suite',
        index: '04',
        name: 'Primary Suite',
        image: 'aureliaSuite',
        note: 'Upper level, opening on two sides',
        facts: ['Private terrace', 'Dressing room', 'Ocean on two elevations'],
        hotspots: [{ x: 78, y: 55, label: 'Suite terrace', to: 'terrace' }],
      },
      {
        id: 'terrace',
        index: '05',
        name: 'Terrace',
        image: 'aureliaTerrace',
        note: 'Stone deck, full length of the house',
        facts: ['92 ft run', 'Outdoor hearth', 'Shaded dining'],
        hotspots: [{ x: 52, y: 66, label: 'Pool deck', to: 'pool' }],
      },
      {
        id: 'pool',
        index: '06',
        name: 'Pool',
        image: 'aureliaPool',
        note: 'Infinity edge, set level with the horizon',
        facts: ['62 ft lap pool', 'Heated year-round', 'Bluff-edge deck'],
        hotspots: [{ x: 24, y: 40, label: 'Back to the house', to: 'exterior' }],
      },
    ],
    floor: {
      level: 'Main Level',
      note: 'Upper level and guest pavilion shown in the full plan set.',
      outline: 'M96,132 H880 V410 H96 Z',
      span: "92′ 0″",
      rooms: [
        {
          id: 'living',
          name: 'Living Room',
          area: '41′ × 28′',
          points: '96,132 430,132 430,352 96,352',
          label: [263, 242],
        },
        {
          id: 'dining',
          name: 'Dining',
          area: '22′ × 18′',
          points: '430,132 604,132 604,268 430,268',
          label: [517, 200],
        },
        {
          id: 'kitchen',
          name: 'Kitchen',
          area: '24′ × 19′',
          points: '430,268 604,268 604,410 430,410',
          label: [517, 339],
        },
        {
          id: 'suite',
          name: 'Primary Suite',
          area: '26′ × 22′',
          points: '604,132 880,132 880,300 604,300',
          label: [742, 216],
        },
        {
          id: 'bath',
          name: 'Primary Bath',
          area: '17′ × 14′',
          points: '740,300 880,300 880,410 740,410',
          label: [810, 355],
        },
        {
          id: 'gallery',
          name: 'Entry Gallery',
          area: '38′ × 9′',
          points: '96,352 604,352 604,410 96,410',
          label: [300, 381],
        },
        {
          id: 'garage',
          name: 'Garage',
          area: '3 Cars',
          points: '604,300 740,300 740,410 604,410',
          label: [672, 355],
        },
        {
          id: 'terrace',
          name: 'Terrace',
          area: '92′ × 16′',
          points: '96,410 880,410 880,502 96,502',
          label: [488, 456],
          outdoor: true,
        },
      ],
    },
    amenities: [
      {
        group: 'The House',
        items: [
          'Frameless structural glazing, two elevations',
          'Rift-sawn white oak flooring throughout',
          'Hand-troweled lime plaster walls',
          'Limestone hearth, board-formed surround',
          'Concealed scullery and service entry',
          'Solid-core oak joinery with bronze hardware',
        ],
      },
      {
        group: 'Grounds',
        items: [
          '62-foot infinity-edge lap pool',
          'Bluff-edge stone deck with outdoor hearth',
          'Mature olive and Torrey pine planting',
          'Private stair to Escondido Beach',
          'Gated motor court, three-car garage',
        ],
      },
      {
        group: 'Systems',
        items: [
          'Radiant hydronic floors, four zones',
          'Whole-house water filtration',
          'Photovoltaic array with battery storage',
          'Lutron lighting and shade control',
          'Seismic base isolation at the cantilever',
        ],
      },
    ],
    neighborhood:
      'Escondido Beach sits between Point Dume and Paradise Cove — the quiet stretch of Malibu, where the Pacific Coast Highway runs behind the houses rather than in front of them. Thirty-one minutes to Santa Monica outside of traffic; forty to the Westside.',
    map: { col: 7.4, row: 18.4 },
    agent: 'elena',
  },

  {
    slug: 'the-ridge-house',
    name: 'The Ridge House',
    shortName: 'Ridge House',
    city: 'Aspen',
    region: 'Colorado',
    locationLine: 'Aspen, Colorado',
    status: 'Mountain Estate',
    price: 12_400_000,
    priceDisplay: '$12,400,000',
    priceCompact: '$12.4M',
    beds: 6,
    baths: 7,
    sqft: 8140,
    lot: '11 Acres',
    year: 2019,
    architect: 'Halvard Lunde, Lunde Works',
    summary:
      'Blackened timber and glass set low into an eleven-acre slope, holding the Elk Mountains across its full southern face.',
    narrative: [
      'Lunde buried two-thirds of The Ridge House in the hillside. What remains above grade is a single storey of charred cedar, forty feet of it glazed, reading from the valley as a dark line rather than a building. The decision was practical before it was aesthetic: at 8,900 feet the earth does more for a house than any insulation specification can.',
      'Inside, the great room runs the full southern elevation with a twenty-two-foot ceiling and no column. Steel does the work, concealed. The fireplace is a single block of local granite, split rather than cut, and the hearth is the only object in the room that is not either glass, timber or stone.',
      'The house is engineered for the whole year, not the season. Snowmelt runs under the drive and the terrace. Two independent mechanical plants mean the house can be closed to a single wing without freezing the rest. It has never been listed publicly.',
    ],
    pull: 'At nine thousand feet you are not building a house. You are building a reason to stay through February.',
    hero: 'ridgeHero',
    cover: 'ridgeHero',
    gallery: [
      { image: 'ridgeHero', caption: 'South elevation under early snow' },
      { image: 'ridgeInterior', caption: 'Great room, twenty-two feet clear' },
      { image: 'ridgeDetail', caption: 'Charred cedar and steel surround' },
      { image: 'aspen', caption: 'The Elk Mountains from the terrace' },
    ],
    scenes: [
      {
        id: 'approach',
        index: '01',
        name: 'Approach',
        image: 'ridgeHero',
        note: 'South elevation from the drive',
        facts: ['11 acre parcel', 'Charred cedar cladding', 'Heated approach'],
        hotspots: [{ x: 58, y: 54, label: 'Great room', to: 'great-room' }],
      },
      {
        id: 'great-room',
        index: '02',
        name: 'Great Room',
        image: 'ridgeInterior',
        note: 'Full southern elevation, no column',
        facts: ['22 ft clear ceiling', 'Split granite hearth', '40 ft of glazing'],
        hotspots: [{ x: 30, y: 62, label: 'Detail', to: 'detail' }],
      },
      {
        id: 'detail',
        index: '03',
        name: 'Envelope',
        image: 'ridgeDetail',
        note: 'Cladding and window surround',
        facts: ['Shou sugi ban cedar', 'Thermally broken steel', 'Triple glazing'],
        hotspots: [{ x: 70, y: 40, label: 'Back to the approach', to: 'approach' }],
      },
    ],
    amenities: [
      {
        group: 'The House',
        items: [
          'Twenty-two-foot great room, column-free',
          'Split granite hearth, locally quarried',
          'Two independent mechanical plants',
          'Ski room with boot conditioning',
          'Screening room and wine cellar below grade',
        ],
      },
      {
        group: 'Grounds',
        items: [
          'Eleven acres with recorded view easement',
          'Snowmelt to drive, terrace and stair',
          'Direct trail access to the Elk range',
          'Guest cabin, two bedrooms',
        ],
      },
    ],
    floor: {
      level: 'Entry Level',
      note: 'Two further levels below grade: screening room, wine cellar and four guest rooms.',
      outline: 'M80,150 H900 V400 H470 V520 H80 Z',
      span: "118′ 0″",
      rooms: [
        {
          id: 'great-room',
          name: 'Great Room',
          area: "52′ × 28′",
          points: '80,150 470,150 470,400 80,400',
          label: [275, 275],
        },
        {
          id: 'kitchen',
          name: 'Kitchen',
          area: "25′ × 19′",
          points: '470,150 660,150 660,290 470,290',
          label: [565, 220],
        },
        {
          id: 'dining',
          name: 'Dining',
          area: "32′ × 19′",
          points: '660,150 900,150 900,290 660,290',
          label: [780, 220],
        },
        {
          id: 'suite',
          name: 'Primary Suite',
          area: "33′ × 15′",
          points: '470,290 720,290 720,400 470,400',
          label: [595, 345],
        },
        {
          id: 'bath',
          name: 'Primary Bath',
          area: "24′ × 15′",
          points: '720,290 900,290 900,400 720,400',
          label: [810, 345],
        },
        {
          id: 'ski',
          name: 'Ski Room',
          area: "52′ × 16′",
          points: '80,400 470,400 470,520 80,520',
          label: [275, 460],
        },
      ],
    },
    neighborhood:
      'Eleven acres on the Starwood side, above the valley floor and outside the town grid. Fourteen minutes to Aspen Highlands, nineteen to town, and eight to the airport.',
    map: { col: 19.8, row: 12.5 },
    agent: 'thomas',
  },

  {
    slug: 'villa-no-17',
    name: 'Villa No. 17',
    shortName: 'Villa No. 17',
    city: 'Miami Beach',
    region: 'Florida',
    locationLine: 'Miami Beach, Florida',
    status: 'Waterfront Residence',
    price: 6_750_000,
    priceDisplay: '$6,750,000',
    priceCompact: '$6.75M',
    beds: 5,
    baths: 6,
    sqft: 6280,
    lot: '0.4 Acres',
    year: 2022,
    architect: 'Marisol Aguayo',
    summary:
      'White stucco wrapped in deep loggias on ninety feet of protected water, five minutes from the Atlantic.',
    narrative: [
      'Aguayo built Villa No. 17 for shade. The loggias are nine feet deep on the south and west, which in Miami is the difference between a house you can use in August and one you cannot. The stucco is float-finished and left slightly irregular, so it holds a shadow.',
      'The plan is a shallow U, opening to the water. Every principal room sees the Intracoastal, and the sliding walls on the ground floor retract fully into the piers, leaving a single sixty-foot opening between the living room and the pool terrace.',
      'The dock is the reason the parcel exists. Ninety feet of protected frontage with no fixed bridges between here and Government Cut — which means a boat of real size, and open water in under fifteen minutes.',
    ],
    pull: 'In this climate, the architecture is mostly a question of where you put the shadow.',
    hero: 'villaHero',
    cover: 'villaHero',
    gallery: [
      { image: 'villaHero', caption: 'Street elevation, deep loggias' },
      { image: 'villaWater', caption: 'Pool terrace and private dock' },
      { image: 'villaInterior', caption: 'Waterside bedroom, second level' },
      { image: 'miami', caption: 'Biscayne Bay from the dock' },
    ],
    scenes: [
      {
        id: 'elevation',
        index: '01',
        name: 'Elevation',
        image: 'villaHero',
        note: 'Street front, float-finished stucco',
        facts: ['9 ft loggias', 'Float-finished stucco', 'Gated forecourt'],
        hotspots: [{ x: 62, y: 58, label: 'To the water', to: 'terrace' }],
      },
      {
        id: 'terrace',
        index: '02',
        name: 'Water Terrace',
        image: 'villaWater',
        note: 'Pool deck and dock beyond',
        facts: ['90 ft frontage', 'No fixed bridges', 'Salt pool'],
        hotspots: [{ x: 38, y: 46, label: 'Upper level', to: 'bedroom' }],
      },
      {
        id: 'bedroom',
        index: '03',
        name: 'Waterside Room',
        image: 'villaInterior',
        note: 'Second level, facing the Intracoastal',
        facts: ['Full-height sliders', 'Private balcony', 'Water on two sides'],
        hotspots: [{ x: 26, y: 62, label: 'Back to the front', to: 'elevation' }],
      },
    ],
    amenities: [
      {
        group: 'The House',
        items: [
          'Sixty-foot retracting glass wall',
          'Nine-foot loggias, south and west',
          'Impact glazing throughout',
          'Elevator to all three levels',
          'Summer kitchen on the water terrace',
        ],
      },
      {
        group: 'The Water',
        items: [
          'Ninety feet of protected frontage',
          'Private dock, no fixed bridges to Government Cut',
          'Boat lift and shore power',
          'Salt-water pool and cold plunge',
        ],
      },
    ],
    floor: {
      level: 'Ground Level',
      note: 'Second and third levels hold four further bedrooms and the roof deck.',
      outline: 'M90,140 H910 V500 H700 V300 H300 V500 H90 Z',
      span: "104′ 0″",
      rooms: [
        {
          id: 'living',
          name: 'Living Room',
          area: "44′ × 20′",
          points: '300,140 700,140 700,300 300,300',
          label: [500, 220],
        },
        {
          id: 'kitchen',
          name: 'Kitchen',
          area: "24′ × 20′",
          points: '90,140 300,140 300,300 90,300',
          label: [195, 220],
        },
        {
          id: 'dining',
          name: 'Dining',
          area: "24′ × 20′",
          points: '700,140 910,140 910,300 700,300',
          label: [805, 220],
        },
        {
          id: 'suite',
          name: 'Primary Suite',
          area: "24′ × 25′",
          points: '90,300 300,300 300,500 90,500',
          label: [195, 400],
        },
        {
          id: 'guest',
          name: 'Guest Suite',
          area: "24′ × 25′",
          points: '700,300 910,300 910,500 700,500',
          label: [805, 400],
        },
        {
          id: 'court',
          name: 'Pool Court',
          area: "46′ × 25′",
          points: '300,300 700,300 700,500 300,500',
          label: [500, 400],
          outdoor: true,
        },
      ],
    },
    neighborhood:
      'A guarded island off the Venetian Causeway, four streets long. Eleven minutes to South Beach, sixteen to the Design District, twenty-two to Miami International.',
    map: { col: 47.3, row: 27.6 },
    agent: 'elena',
  },

  {
    slug: 'the-glass-house',
    name: 'The Glass House',
    shortName: 'Glass House',
    city: 'Austin',
    region: 'Texas',
    locationLine: 'Austin, Texas',
    status: 'Architectural Residence',
    price: 4_900_000,
    priceDisplay: '$4,900,000',
    priceCompact: '$4.9M',
    beds: 3,
    baths: 4,
    sqft: 3960,
    lot: '6.2 Acres',
    year: 2020,
    architect: 'Idris Vance, Vance & Okonjo',
    summary:
      'A steel-framed pavilion lifted clear of the live oaks, one uninterrupted room under an exposed deck.',
    narrative: [
      'The site is six acres of oak savannah west of the city, and Vance refused to clear any of it. The house sits on eight piers, lifted nine feet, so the canopy runs beneath the floor plate as well as above the roof. From inside you are in the trees rather than beside them.',
      'The plan is one room. Kitchen, living and dining occupy a single volume seventy feet long; the bedrooms are held in a blackened steel core at the eastern end, which also carries the lateral load. The only doors in the public half of the house are the ones on the core.',
      'It is glass on all four sides, which in central Texas requires an answer. The answer is a four-foot roof overhang calculated for the summer sun angle, a low-emissivity coating with no visible tint, and a ground-source loop under the meadow.',
    ],
    pull: 'We were asked for a house in the trees. We took that literally and then argued about it for a year.',
    hero: 'glassHero',
    cover: 'glassHero',
    gallery: [
      { image: 'glassHero', caption: 'The pavilion from the meadow' },
      { image: 'glassInterior', caption: 'The single room, looking east' },
      { image: 'austin', caption: 'Hill country at dusk' },
    ],
    scenes: [
      {
        id: 'meadow',
        index: '01',
        name: 'The Meadow',
        image: 'glassHero',
        note: 'Approach from the west, house on piers',
        facts: ['6.2 acres', 'Lifted 9 ft', 'Eight-pier structure'],
        hotspots: [{ x: 54, y: 52, label: 'Inside', to: 'room' }],
      },
      {
        id: 'room',
        index: '02',
        name: 'The Room',
        image: 'glassInterior',
        note: 'Seventy feet, uninterrupted',
        facts: ['70 ft long', 'Exposed steel deck', 'Glass on four sides'],
        hotspots: [{ x: 74, y: 44, label: 'The land', to: 'land' }],
      },
      {
        id: 'land',
        index: '03',
        name: 'The Land',
        image: 'austin',
        note: 'Oak savannah, unimproved',
        facts: ['Oak savannah', 'No clearing', 'Ground-source loop'],
        hotspots: [{ x: 32, y: 58, label: 'Back to the house', to: 'meadow' }],
      },
    ],
    amenities: [
      {
        group: 'The House',
        items: [
          'Seventy-foot principal room, single volume',
          'Blackened steel service core',
          'Four-foot calculated overhang',
          'Low-emissivity glazing, no visible tint',
          'Exposed structural deck ceiling',
        ],
      },
      {
        group: 'The Land',
        items: [
          'Six-plus acres of unimproved oak savannah',
          'Ground-source loop beneath the meadow',
          'Rainwater capture, 30,000 gallons',
          'Separate studio building',
        ],
      },
    ],
    floor: {
      level: 'Pavilion Level',
      note: 'The whole house is one level, lifted nine feet on eight piers.',
      outline: 'M90,200 H910 V440 H90 Z',
      span: "70′ 0″",
      rooms: [
        {
          id: 'room',
          name: 'The Room',
          area: "46′ × 21′",
          points: '90,200 620,200 620,440 90,440',
          label: [355, 320],
        },
        {
          id: 'core',
          name: 'Service Core',
          area: "12′ × 21′",
          points: '620,200 760,200 760,440 620,440',
          label: [690, 320],
        },
        {
          id: 'suite',
          name: 'Primary Suite',
          area: "13′ × 11′",
          points: '760,200 910,200 910,320 760,320',
          label: [835, 260],
        },
        {
          id: 'guest',
          name: 'Guest Room',
          area: "13′ × 10′",
          points: '760,320 910,320 910,440 760,440',
          label: [835, 380],
        },
        {
          id: 'deck',
          name: 'Deck',
          area: "70′ × 8′",
          points: '90,440 910,440 910,530 90,530',
          label: [500, 485],
          outdoor: true,
        },
      ],
    },
    neighborhood:
      'West of the city past the last subdivision, on a road that ends. Twenty-six minutes to downtown Austin, thirty-four to the airport, and dark enough at night to see the Milky Way.',
    map: { col: 29.2, row: 22.6 },
    agent: 'thomas',
  },
];

/** A fifth location carried on the map only — representation, not a listing. */
export const MAP_ONLY_PLACES = [
  {
    slug: 'new-york',
    name: 'New York',
    city: 'New York',
    region: 'New York',
    label: 'Representation',
    detail: 'Tribeca · Upper East Side · The Hamptons',
    priceCompact: 'By enquiry',
    image: 'newYork' as const,
    map: { col: 53.7, row: 10.9 },
  },
];

export const BY_SLUG = new Map(PROPERTIES.map((p) => [p.slug, p]));

export function getProperty(slug: string | undefined): Property | undefined {
  return slug ? BY_SLUG.get(slug) : undefined;
}

export const FEATURED = PROPERTIES[0];

/* ---------------------------------------------------------------------------
   THE MAP
   A 62 × 30 dot matrix of the continental United States. Editing the silhouette
   means editing these strings: `#` is land, `.` is not.
   ------------------------------------------------------------------------ */

export const US_MASK = [
  '..............................................................',
  '...##############################.............................',
  '..##################################..........................',
  '.######################################...................#...',
  '.###########################################............###...',
  '.#######################################...###....#########...',
  '.#######################################...###....#########...',
  '.#######################################...####..##########...',
  '.#######################################...####.###########...',
  '.#######################################..###....##########...',
  '.###########################################....###########...',
  '..#######################################################.....',
  '..#####################################################.......',
  '..#####################################################.......',
  '...###################################################........',
  '...##################################################.........',
  '....#################################################.........',
  '.....###############################################..........',
  '.....##############################################...........',
  '.......###########################################............',
  '.........#######################################..............',
  '............###################################...............',
  '......................#########################...............',
  '.......................#######################................',
  '.......................###########........#####...............',
  '..........................######............####..............',
  '...........................####.............####..............',
  '............................###..............###..............',
  '.............................................###..............',
  '..............................................................',
] as const;

export const MASK_COLS = US_MASK[0].length;
export const MASK_ROWS = US_MASK.length;
