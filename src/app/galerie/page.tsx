import { buildPageMetadata, MARKETING_PAGES } from '@/lib/seo';
import GalleryPage from '@/components/GalleryPage';

export const metadata = buildPageMetadata(MARKETING_PAGES.gallery);

export default function Page() {
  return <GalleryPage />;
}
