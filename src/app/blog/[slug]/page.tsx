'use client';

import ArticleDetail from '@/legacy-pages/ArticleDetail';

/** Canonical blog article route; data is loaded from the database by ArticleDetail. */
export default function BlogArticlePage() {
  return <ArticleDetail />;
}
