'use client';

import Magazine from '@/legacy-pages/Magazine';

/**
 * Blog editorial hub.
 *
 * The editorial source remains the single `articles` collection in the
 * database. This route is now the canonical public URL; the former
 * /magazine route is kept only as a compatibility redirect.
 */
export default function BlogPage() {
  return <Magazine />;
}
