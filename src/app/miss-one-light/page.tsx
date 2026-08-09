import LegacyRoute from '@/app/_legacy/LegacyRoute';
import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';

export const metadata = buildPageMetadata(MARKETING_PAGES.missOneLight);

export default function Page() {
  return <LegacyRoute component="MissOneLight" />;
}
