import type { ImageKey } from './images';

export const BRAND = {
  name: 'Arcadia Estates',
  mark: ['Arcadia', 'Estates'] as const,
  tagline: 'Properties Worth Remembering.',
  founded: 2009,
  email: 'private@arcadiaestates.com',
  phone: '+1 310 555 0147',
  phoneHref: 'tel:+13105550147',
  offices: [
    { city: 'Malibu', line: '22440 Pacific Coast Highway' },
    { city: 'Aspen', line: '410 East Hyman Avenue' },
    { city: 'Miami Beach', line: '1 Lincoln Road, Suite 900' },
  ],
  licence: 'DRE 01920344 · Equal Housing Opportunity',
};

export const NAV = [
  { label: 'Properties', href: '#properties' },
  { label: 'Residences', href: '#residences' },
  { label: 'Neighborhoods', href: '#neighborhoods' },
  { label: 'About', href: '#about' },
] as const;

export interface Neighborhood {
  id: string;
  name: string;
  region: string;
  image: ImageKey;
  lines: [string, string, string];
  body: string;
  stats: { label: string; value: string }[];
}

export const NEIGHBORHOODS: Neighborhood[] = [
  {
    id: 'malibu',
    name: 'Malibu',
    region: 'California',
    image: 'malibu',
    lines: ['Oceanfront living.', 'Private beaches.', 'Architectural residences.'],
    body: 'Twenty-one miles of coast and, in practice, perhaps forty parcels that matter. Arcadia has closed on eleven of them since 2016, most of them before they reached the open market.',
    stats: [
      { label: 'Median, bluff parcels', value: '$11.4M' },
      { label: 'Arcadia closings', value: '11' },
      { label: 'To Santa Monica', value: '31 min' },
    ],
  },
  {
    id: 'aspen',
    name: 'Aspen',
    region: 'Colorado',
    image: 'aspen',
    lines: ['Mountain estates.', 'Privacy.', 'Year-round living.'],
    body: 'The market has quietly become a twelve-month one. The houses that hold their value here are the ones engineered for February, not the ones photographed in July.',
    stats: [
      { label: 'Median, Starwood', value: '$14.9M' },
      { label: 'Off-market share', value: '62%' },
      { label: 'To the airport', value: '8 min' },
    ],
  },
  {
    id: 'miami-beach',
    name: 'Miami Beach',
    region: 'Florida',
    image: 'miami',
    lines: ['Waterfront architecture.', 'Modern design.', 'Global access.'],
    body: 'What is scarce here is not square footage but water: protected frontage with no fixed bridges between the dock and open ocean. That single condition sets the price of every island parcel.',
    stats: [
      { label: 'Median, guarded islands', value: '$8.2M' },
      { label: 'Frontage premium', value: '+34%' },
      { label: 'To open water', value: '15 min' },
    ],
  },
];

export interface Agent {
  id: 'elena' | 'thomas';
  name: string;
  role: string;
  portrait: ImageKey;
  quote: string;
  bio: string[];
  since: number;
  volume: string;
  transactions: string;
  markets: string[];
  email: string;
  phone: string;
  phoneHref: string;
}

export const AGENTS: Record<'elena' | 'thomas', Agent> = {
  elena: {
    id: 'elena',
    name: 'Elena Marlowe',
    role: 'Principal Broker',
    portrait: 'agentPortrait',
    quote:
      'Real estate is not simply about finding a property. It is about recognizing the place that will become part of your story.',
    bio: [
      'Elena founded Arcadia in 2009 after eleven years representing architects rather than sellers — a background that still shows in how she reads a house. She will tell you what a room is doing before she tells you what it cost.',
      'She works on a small number of listings at a time, by design. Most of what she closes is never advertised.',
    ],
    since: 2009,
    volume: '$1.8B',
    transactions: '214',
    markets: ['Malibu', 'Miami Beach', 'New York'],
    email: 'elena@arcadiaestates.com',
    phone: '+1 310 555 0147',
    phoneHref: 'tel:+13105550147',
  },
  thomas: {
    id: 'thomas',
    name: 'Thomas Reyes',
    role: 'Director, Architecture Sales',
    portrait: 'agentSecondary',
    quote:
      'A significant house is not a harder sale. It is a slower one, and it deserves to be.',
    bio: [
      'Thomas trained as an architect at Rice and practised for six years before moving to the other side of the table. He leads Arcadia’s mountain and inland markets.',
      'He has represented work by fourteen AIA Honor Award recipients, and reads a set of construction documents faster than he reads a comparative market analysis.',
    ],
    since: 2014,
    volume: '$740M',
    transactions: '96',
    markets: ['Aspen', 'Austin', 'Santa Fe'],
    email: 'thomas@arcadiaestates.com',
    phone: '+1 970 555 0188',
    phoneHref: 'tel:+19705550188',
  },
};
