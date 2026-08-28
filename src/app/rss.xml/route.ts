import { getPublicArticles } from '@/lib/public-content';

const BASE = 'https://perfectmodels.online';
const esc = (value: string) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export async function GET() {
  const articles = (await getPublicArticles()).slice(0, 30);
  const items = articles.map((article) => {
    const slug = article.slug;
    const url = `${BASE}/blog/${slug}`;
    const date = new Date(article.date || Date.now()).toUTCString();
    return `<item><title>${esc(article.title || 'Article')}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${date}</pubDate><description>${esc(article.excerpt || '')}</description></item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Perfect Models Management - Journal</title><link>${BASE}/blog</link><description>Actualités, talents et culture mode au Gabon.</description><language>fr</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
    },
  });
}
