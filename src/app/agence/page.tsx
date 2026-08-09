import LegacyRoute from '@/app/_legacy/LegacyRoute';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.agency);

export default function Page() {
  return <LegacyRoute component="Agency" />;
}
