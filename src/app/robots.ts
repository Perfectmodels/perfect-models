import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/login', '/register', '/api/'] },
      { userAgent: ['Googlebot', 'Bingbot', 'facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp'], allow: '/' },
    ],
    sitemap: 'https://perfectmodels.online/sitemap.xml',
    host: 'https://perfectmodels.online',
  };
}
