import { useEffect } from 'react';
import { Hero } from '@/components/Hero';
import { FeaturedResidence, Intent } from '@/components/FeaturedResidence';
import { Walkthrough } from '@/components/Walkthrough';
import { PropertyCollection } from '@/components/PropertyCollection';
import { PropertyMap } from '@/components/PropertyMap';
import { Neighborhoods } from '@/components/Neighborhoods';
import { Agent } from '@/components/Agent';
import { PrivateOffice } from '@/components/PrivateOffice';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';
import { FEATURED } from '@/data/properties';
import { BRAND } from '@/data/site';

export default function Home({ ready }: { ready: boolean }) {
  useEffect(() => {
    document.title = `${BRAND.name} — ${BRAND.tagline}`;
  }, []);

  return (
    <>
      <h1 className="sr-only">
        {BRAND.name} — {BRAND.tagline}
      </h1>
      <Hero ready={ready} />
      <FeaturedResidence />
      <Intent />
      <Walkthrough property={FEATURED} index="03" />
      <PropertyCollection />
      <PropertyMap />
      <Neighborhoods />
      <Agent />
      <PrivateOffice />
      <Contact index="09" />
      <Footer />
    </>
  );
}
