import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/login/',
          '/profil/',
          '/formation/',
          '/formations/',
          '/jury/',
          '/enregistrement/',
        ],
      },
      {
        userAgent: ['Googlebot', 'Googlebot-Image', 'Bingbot'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/login/', '/profil/', '/formation/', '/formations/', '/jury/', '/enregistrement/'],
      },
      {
        userAgent: ['facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'WhatsApp'],
        allow: '/',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
