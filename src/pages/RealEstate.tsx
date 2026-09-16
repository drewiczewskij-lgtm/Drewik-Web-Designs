import { PageHeader } from '@/components/layout/PageHeader';
import { Footer } from '@/components/layout/Footer';
import { Figure } from '@/components/Figure';
import { Reveal } from '@/components/fx/Reveal';
import { SectionHead, IncludeList, Pill, Stat } from '@/components/ui/Bits';
import { Button, Arrow } from '@/components/ui/Button';
import { PortfolioGrid } from '@/components/portfolio/PortfolioGrid';
import { CtaBand } from '@/components/sections/CtaBand';
import { Process } from '@/components/sections/Process';
import { Seo, serviceSchema, breadcrumbSchema } from '@/lib/seo';
import { PORTFOLIO } from '@/data/portfolio';
import { CONTACT } from '@/data/site';
import { getPackage, money } from '@shared/catalog.mjs';
import type { ImageKey } from '@/data/images';

/* ============================================================================
   REAL ESTATE
   The page a listing agent lands on. It has to answer one question — what
   exactly do I get, and what does it cost — before it does anything else.
   ========================================================================= */

interface Coverage {
  id: string;
  name: string;
  image: ImageKey;
  body: string;
  points: string[];
}

const COVERAGE: Coverage[] = [
  {
    id: 'interior',
    name: 'Interior photography',
    image: 'reLiving',
    body: 'Every room lit and blended so the windows keep their view and the walls keep their real colour. Verticals corrected in camera with a tilt-shift, not stretched afterwards, which is why the rooms look the size they are.',
    points: [
      'Flambient blending — ambient for colour, flash for detail',
      'Windows retained, never blown out',
      'Tilt-shift verticals, no software stretch',
      'Consistent height and horizon across the set',
    ],
  },
  {
    id: 'exterior',
    name: 'Exterior photography',
    image: 'reExteriorDay',
    body: 'Front, rear, both elevations and the approach, shot from the angles a buyer will actually stand at. Grey skies are replaced conservatively and the light on the house is matched to the new sky, so it does not read as a cut-out.',
    points: [
      'Front, rear and both elevations',
      'Approach and street context',
      'Conservative sky replacement, included',
      'Outbuildings, garage and yard',
    ],
  },
  {
    id: 'twilight',
    name: 'Twilight photography',
    image: 'reExteriorTwilight',
    body: 'The twenty minutes after sunset when the sky still holds colour and the windows have come on. It is consistently the best-performing single photograph on a listing, and there is exactly one of them per day.',
    points: [
      'Shot in the real blue-hour window',
      'Every interior light checked first',
      'Landscape and path lighting lit',
      'Never a fake sky — that sky is real',
    ],
  },
  {
    id: 'drone',
    name: 'Drone photography',
    image: 'aerialProperty',
    body: 'Overhead and oblique frames showing the lot, the roofline, the approach and what is next door — everything a ground-level camera physically cannot reach. Flown under a commercial licence and inside airspace rules.',
    points: [
      'Overhead plan view and obliques',
      'Lot boundaries and acreage context',
      'Roofline and condition coverage',
      'Licensed commercial operation',
    ],
  },
  {
    id: 'video',
    name: 'Property video',
    image: 'filmFrameA',
    body: 'A 60–90 second film that moves through the house the way a buyer would walk it. Graded, scored with licensed music, and delivered twice — horizontal for the portals, vertical for social.',
    points: [
      'Gimbal-stabilised throughout',
      'Licensed music and sound design',
      'Full colour grade',
      '4K, horizontal and vertical cuts',
    ],
  },
  {
    id: 'walkthrough',
    name: 'Cinematic walkthrough',
    image: 'reWalkthrough',
    body: 'One continuous move from the front door through the main living space, paced so each room lands. It is the part of the film people rewatch, and it is the hardest part to shoot, which is why most listings do not have one.',
    points: [
      'Continuous, unbroken movement',
      'Paced to let each room read',
      'Aerial reveal cut in where it helps',
      'Opening eight seconds built to hold',
    ],
  },
];

export default function RealEstate() {
  const photo = getPackage('photo');
  const reWork = PORTFOLIO.filter(
    (p) => p.category === 'real-estate-photo' || p.category === 'real-estate-video' || p.category === 'drone',
  );

  return (
    <>
      <Seo
        title="Real Estate Photography, Video & Drone"
        description={`Interior, exterior, twilight, aerial and cinematic video for property listings across ${CONTACT.serviceArea}. Booked online, delivered the next business day.`}
        path="/real-estate"
        schema={[
          serviceSchema(
            'Real estate photography and videography',
            'Interior, exterior, twilight, aerial and cinematic video for property listings.',
            photo?.basePriceCents,
          ),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Real Estate', path: '/real-estate' },
          ]),
        ]}
      />

      <PageHeader
        label="Real estate"
        title={['Every listing', 'deserves its', 'best light.']}
        lead="Interior, exterior, twilight, aerial and film — everything a property needs to stop a buyer mid-scroll, shot on one visit by one photographer."
        image="reExteriorTwilight"
        breadcrumb={[
          { name: 'Home', path: '/' },
          { name: 'Real Estate', path: '/real-estate' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button to="/book" size="lg" className="group" trailing={<Arrow />}>
            Book your property shoot
          </Button>
          <Button to="/pricing" variant="ghost" size="lg">
            {photo ? `From ${money(photo.basePriceCents)}` : 'See pricing'}
          </Button>
        </div>
      </PageHeader>

      {/* The numbers that matter to an agent. */}
      <section className="border-b border-line">
        <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value="24h" label="Photos delivered" note="Shoot in the morning, gallery the next business day." />
          <Stat value="35" label="Finished frames" note="Up to thirty-five edited images on a standard property." />
          <Stat value="4K" label="Film resolution" note="Every property film graded and delivered in 4K." />
          <Stat value="30mi" label="Travel included" note="Beyond that, billed at cost and shown before you pay." />
        </div>
      </section>

      {/* Coverage — alternating spreads rather than a grid of equal cards. */}
      <section className="section">
        <div className="shell">
          <SectionHead
            index="01"
            label="What gets shot"
            title={
              <>
                Six kinds of coverage, <span className="t-accent">one appointment.</span>
              </>
            }
            lead="Mix them however the property needs. Each one is either in a package or available as an add-on."
          />

          <div className="mt-16 flex flex-col gap-20 sm:gap-28">
            {COVERAGE.map((item, i) => {
              const flipped = i % 2 === 1;
              return (
                <Reveal
                  key={item.id}
                  id={item.id}
                  className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
                >
                  <div
                    className={`zoom-host edge relative aspect-[4/3] overflow-hidden ${
                      flipped ? 'lg:order-2' : ''
                    }`}
                  >
                    <Figure
                      image={item.image}
                      className="absolute inset-0 h-full w-full"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent"
                    />
                    <span className="t-label absolute bottom-5 left-5 text-cyan-soft">
                      {String(i + 1).padStart(2, '0')} / {item.name}
                    </span>
                  </div>

                  <div className={`flex flex-col gap-6 ${flipped ? 'lg:order-1' : ''}`}>
                    <h3 className="t-h2 text-[clamp(1.5rem,3vw,2.2rem)]">{item.name}</h3>
                    <p className="t-lead max-w-[48ch] text-muted">{item.body}</p>
                    <IncludeList items={item.points} />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before / after, told honestly: this is about method, not a slider
          comparing our work to a straw man. */}
      <section className="section relative overflow-hidden border-t border-line">
        <div className="aurora opacity-40" aria-hidden="true" />
        <div className="shell relative">
          <SectionHead
            index="02"
            label="The difference"
            title={
              <>
                What “properly lit” actually <span className="t-accent">means.</span>
              </>
            }
            lead="Three things separate a professional set from a phone. None of them is a filter."
          />

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'The windows still work',
                body: 'A single exposure forces a choice: a bright room with a white window, or a visible view with a dark room. Blending several exposures keeps both, which is why the view out of the kitchen is still there.',
                tag: 'Flambient blending',
              },
              {
                title: 'The walls are the right colour',
                body: 'Mixed lighting — daylight, tungsten, LED — turns walls green and beige grey. Balancing each source separately means the paint on the wall is the paint in the photograph.',
                tag: 'Colour balancing',
              },
              {
                title: 'The verticals are vertical',
                body: 'A wide lens tilted upward makes walls lean in and rooms look small. Shooting level on a tilt-shift keeps every line true, which is what makes a room read at its real size.',
                tag: 'Perspective control',
              },
            ].map((card, i) => (
              <Reveal key={card.title} index={i} className="glass edge flex flex-col gap-4 p-7">
                <Pill tone="neon">{card.tag}</Pill>
                <h3 className="t-h3 text-[18px]">{card.title}</h3>
                <p className="text-[13.5px] leading-relaxed text-muted">{card.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Process label="From booking to gallery" index="03" />

      <section className="section border-t border-line">
        <div className="shell">
          <SectionHead
            index="04"
            label="The work"
            title={
              <>
                Recent property work, <span className="t-accent">filterable.</span>
              </>
            }
          />
          <PortfolioGrid items={reWork} className="mt-12" />
        </div>
      </section>

      <CtaBand
        label="Book a shoot"
        title={
          <>
            Book your property shoot in <span className="t-accent">under two minutes.</span>
          </>
        }
        lead="Pick a package, choose a time that is genuinely free, and see the total before you enter a card."
        image="rePool"
        primary={{ label: 'Check availability', to: '/book' }}
        secondary={{ label: 'Compare packages', to: '/pricing' }}
      />

      <Footer />
    </>
  );
}
