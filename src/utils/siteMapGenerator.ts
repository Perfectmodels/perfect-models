
import { routes } from '../routes';

interface SitemapURL {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemap = (baseURL: string): string => {
  const today = new Date().toISOString().split('T')[0];
  
  // Map routes to sitemap URLs with appropriate metadata
  const sitemapUrls: SitemapURL[] = routes.map(route => {
    // Assign different priorities and change frequencies based on the route
    let priority = 0.5;
    let changefreq: SitemapURL['changefreq'] = 'monthly';
    
    // Home page gets highest priority
    if (route.path === '/') {
      priority = 1.0;
      changefreq = 'weekly';
    } 
    // Model pages updated frequently
    else if (route.path === '/women' || route.path === '/men') {
      priority = 0.9;
      changefreq = 'daily';
    }
    // Gallery updated regularly
    else if (route.path === '/gallery') {
      priority = 0.8;
      changefreq = 'weekly';
    }
    // Casting page
    else if (route.path === '/casting') {
      priority = 0.7;
      changefreq = 'monthly';
    }
    // About page
    else if (route.path === '/about') {
      priority = 0.6;
      changefreq = 'monthly';
    }
    // Contact page rarely changes
    else if (route.path === '/contact') {
      priority = 0.5;
      changefreq = 'yearly';
    }
    
    return {
      loc: route.path,
      lastmod: today,
      changefreq,
      priority
    };
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
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
