import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BRAND, CONTACT, SOCIALS } from '@/data/site';
import { PACKAGES } from '@shared/catalog.mjs';
import { workingDaysSummary } from '@shared/schedule.mjs';

/* ============================================================================
   SEO
   ----------------------------------------------------------------------------
   This is a single-page application, so the document head has to be maintained
   as routes change. Each page declares what it is; this keeps the head honest.

   `index.html` carries a full set of tags too. That is not duplication — it is
   what a crawler that does not run JavaScript, and any link preview fetched
   before hydration, will actually read.
   ========================================================================= */

interface SeoProps {
  title: string;
  description: string;
  /** Path only. The canonical is built from BRAND.url. */
  path?: string;
  /** Structured data for this page, if it has any worth stating. */
  schema?: object | object[];
  /** Search engines should not index the confirmation page. */
  noIndex?: boolean;
}

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function Seo({ title, description, path, schema, noIndex }: SeoProps) {
  const location = useLocation();
  const resolvedPath = path ?? location.pathname;

  useEffect(() => {
    const full = title.includes(BRAND.name) ? title : `${title} — ${BRAND.name}`;
    document.title = full;

    setMeta('meta[name="description"]', 'name', 'description', description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', full);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', BRAND.name);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', full);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow',
    );

    const canonical = `${BRAND.url.replace(/\/$/, '')}${resolvedPath === '/' ? '' : resolvedPath}`;
    setLink('canonical', canonical);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
  }, [title, description, resolvedPath, noIndex]);

  useEffect(() => {
    if (!schema) return;
    const node = document.createElement('script');
    node.type = 'application/ld+json';
    node.textContent = JSON.stringify(schema);
    node.dataset.seo = 'page';
    document.head.appendChild(node);
    return () => {
      node.remove();
    };
  }, [schema]);

  return null;
}

/* ---------------------------------------------------------------------------
   Structured data
   ------------------------------------------------------------------------ */

/** The business itself. Emitted once, from the app shell. */
export function localBusinessSchema() {
  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressLocality: CONTACT.city,
    addressRegion: CONTACT.region,
    addressCountry: CONTACT.country,
  };
  if (CONTACT.street) address.streetAddress = CONTACT.street;
  if (CONTACT.postalCode) address.postalCode = CONTACT.postalCode;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${BRAND.url}/#business`,
    name: BRAND.name,
    description: BRAND.description,
    url: BRAND.url,
    telephone: CONTACT.phoneHref,
    email: CONTACT.email,
    image: `${BRAND.url}/og.png`,
    priceRange: '$$',
    address,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: CONTACT.geo.lat,
      longitude: CONTACT.geo.lng,
    },
    areaServed: { '@type': 'Place', name: CONTACT.serviceArea },
    sameAs: SOCIALS.map((s) => s.url),
    openingHoursSpecification: workingDaysSummary().map((d) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: d.day,
      description: d.hours,
    })),
    // Only the packages with a real online price are advertised as offers.
    // A "quote only" service has no price, and inventing one for a crawler
    // would put a number in a search result that nobody would honour.
    makesOffer: PACKAGES.filter((p) => !p.quoteOnly).map((p) => ({
      '@type': 'Offer',
      name: `${p.name} package`,
      description: p.summary,
      price: (p.basePriceCents / 100).toFixed(2),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    })),
  };
}

export function serviceSchema(name: string, description: string, priceCents?: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@type': 'ProfessionalService', name: BRAND.name, url: BRAND.url },
    areaServed: CONTACT.serviceArea,
    ...(priceCents
      ? {
          offers: {
            '@type': 'Offer',
            price: (priceCents / 100).toFixed(2),
            priceCurrency: 'USD',
          },
        }
      : {}),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: `${BRAND.url.replace(/\/$/, '')}${t.path}`,
    })),
  };
}
