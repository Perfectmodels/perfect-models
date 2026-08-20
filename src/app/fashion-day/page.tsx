import type { Metadata } from 'next';
import Link from 'next/link';
import FashionDayPage from '@/features/fashion-day/FashionDayPage';
import JsonLd from '@/components/JsonLd';
import { getFashionDayEvents } from '@/lib/public-content';
import { absoluteUrl, buildPageMetadata, MARKETING_PAGES, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const events = (await getFashionDayEvents()).slice().sort((a, b) => b.edition - a.edition);
  const latest = events[0];
  if (!latest) return buildPageMetadata(MARKETING_PAGES.fashionDay);

  return buildPageMetadata({
    ...MARKETING_PAGES.fashionDay,
    title: `Perfect Fashion Day — Édition ${latest.edition} : ${latest.theme}`,
    description: latest.description || MARKETING_PAGES.fashionDay.description,
    image: latest.coverImageUrl || latest.galleryImages?.[0],
    keywords: [...MARKETING_PAGES.fashionDay.keywords, latest.theme, `édition ${latest.edition}`],
  });
}

export default async function Page() {
  const events = (await getFashionDayEvents()).slice().sort((a, b) => b.edition - a.edition);
  const eventSchemas = events.slice(0, 6).map((event) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${SITE_URL}/fashion-day#edition-${event.edition}`,
    name: `Perfect Fashion Day — Édition ${event.edition} : ${event.theme}`,
    description: event.description,
    startDate: event.date,
    eventStatus:
      event.date && new Date(`${event.date}T23:59:59`).getTime() >= Date.now()
        ? 'https://schema.org/EventScheduled'
        : 'https://schema.org/EventCompleted',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.location || 'Libreville, Gabon',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Libreville',
        addressCountry: 'GA',
      },
    },
    image: event.coverImageUrl
      ? [absoluteUrl(event.coverImageUrl)]
      : event.galleryImages?.[0]
        ? [absoluteUrl(event.galleryImages[0])]
        : undefined,
    organizer: { '@id': `${SITE_URL}/#organization` },
    url: `${SITE_URL}/fashion-day`,
    inLanguage: 'fr-GA',
  }));

  return (
    <>
      {eventSchemas.length > 0 && <JsonLd data={eventSchemas} />}
      <div className="border-b border-pm-gold/20 bg-black px-4 py-3 text-center">
        <Link href="/fashion-day/edition-2" className="text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold hover:underline sm:text-xs">
          Consulter le programme officiel · PFD Édition 2 · L’Art de se Révéler →
        </Link>
      </div>
      <FashionDayPage />
    </>
  );
}
