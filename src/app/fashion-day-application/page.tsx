import LegacyRoute from '@/app/_legacy/LegacyRoute';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Candidature Perfect Fashion Day',
  description: 'Formulaire de candidature et de participation au Perfect Fashion Day.',
  path: '/fashion-day-application',
  noIndex: true,
});

export default function Page() {
  return <LegacyRoute component="FashionDayApplicationForm" />;
}
