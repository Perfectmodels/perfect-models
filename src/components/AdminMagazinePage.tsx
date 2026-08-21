'use client';

/**
 * Native Next.js entry point for the editorial CMS.
 *
 * The underlying editor remains compatible with the existing data store, while
 * the route no longer depends on LegacyRoute. Articles are structured as
 * ordered content blocks (headings, paragraphs, quotes, images and video),
 * with draft autosave and preview handled by the editor itself.
 */
import AdminMagazine from '@/legacy-pages/AdminMagazine';

export default AdminMagazine;
