import LegacyRoute from '@/app/_legacy/LegacyRoute';
import { buildPageMetadata } from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Formulaire de candidature casting PMM',
  description: 'Formulaire de candidature au casting Perfect Models Management.',
  path: '/casting-formulaire',
  noIndex: true,
});

export default function Page() {
  return <LegacyRoute component="CastingForm" />;
}
