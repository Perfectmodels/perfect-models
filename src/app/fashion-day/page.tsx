import type { Metadata } from 'next';
import FashionDayClient from '@/features/fashion-day/FashionDayClient';
import JsonLd from '@/components/JsonLd';
import { getFashionDayEvents } from '@/lib/public-content';
import { getPublicSiteImages } from '@/lib/site-images';
import { absoluteUrl, buildPageMetadata, MARKETING_PAGES, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const [rawEvents, siteImages] = await Promise.all([getFashionDayEvents(), getPublicSiteImages()]);
  const events = rawEvents.slice().sort((a, b) => b.edition - a.edition);
  const latest = events[0];
  if (!latest) return buildPageMetadata(MARKETING_PAGES.fashionDay);
  return buildPageMetadata({
    ...MARKETING_PAGES.fashionDay,
    title: `Perfect Fashion Day — Édition ${latest.edition} : ${latest.theme}`,
    description: latest.description || MARKETING_PAGES.fashionDay.description,
    image: siteImages['fashionDay.hero.override'] || latest.coverImageUrl || latest.galleryImages?.[0],
    keywords: [...MARKETING_PAGES.fashionDay.keywords, latest.theme, `édition ${latest.edition}`],
  });
}

export default async function Page() {
  const [rawEvents, siteImages] = await Promise.all([getFashionDayEvents(), getPublicSiteImages()]);
  const override = siteImages['fashionDay.hero.override'];
  const events = rawEvents.slice().sort((a, b) => b.edition - a.edition).map((event) => override ? { ...event, coverImageUrl: override } : event);
  const eventSchemas = events.slice(0, 6).map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${SITE_URL}/fashion-day#edition-${event.edition}`,
    name: `Perfect Fashion Day — Édition ${event.edition} : ${event.theme}`,
    description: event.description,
    startDate: event.date,
    eventStatus: event.date && new Date(`${event.date}T23:59:59`).getTime() >= Date.now() ? 'https://schema.org/EventScheduled' : 'https://schema.org/EventCompleted',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: event.location || 'Libreville, Gabon', address: { '@type': 'PostalAddress', addressLocality: 'Libreville', addressCountry: 'GA' } },
    image: event.coverImageUrl ? [absoluteUrl(event.coverImageUrl)] : event.galleryImages?.[0] ? [absoluteUrl(event.galleryImages[0])] : undefined,
    organizer: { '@id': `${SITE_URL}/#organization` },
    url: `${SITE_URL}/fashion-day`,
    inLanguage: 'fr-GA',
  }));

  return <>{eventSchemas.length > 0 && <JsonLd data={eventSchemas} />}<FashionDayClient events={events} /></>;
}
