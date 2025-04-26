
import { routes } from '../routes';

interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemap = (baseURL: string): string => {
  const today = new Date().toISOString();
  
  const sitemapUrls: SitemapURL[] = [
    { loc: '/', lastmod: today, changefreq: 'weekly', priority: 1.0 },
    { loc: '/women', lastmod: today, changefreq: 'daily', priority: 0.9 },
    { loc: '/men', lastmod: today, changefreq: 'daily', priority: 0.9 },
    { loc: '/gallery', lastmod: today, changefreq: 'weekly', priority: 0.8 },
    { loc: '/casting', lastmod: today, changefreq: 'monthly', priority: 0.7 },
    { loc: '/about', lastmod: today, changefreq: 'monthly', priority: 0.6 },
    { loc: '/contact', lastmod: today, changefreq: 'yearly', priority: 0.5 },
  ];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapUrls
    .map(
      (url) => `
  <url>
    <loc>${baseURL}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join('')}
</urlset>`;

  return xmlContent;
};
