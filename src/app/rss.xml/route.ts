import { collectionToArray, getCollection } from '@/lib/app-data';
import { articles as seedArticles } from '@/constants/magazineData';

const BASE = 'https://perfectmodels.online';
const esc = (value: string) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

export async function GET() {
  const dbArticles = collectionToArray(await getCollection('articles'));
  const articles = (dbArticles.length ? dbArticles : seedArticles).slice(0, 30);
  const items = articles.map((article: any) => {
    const slug = article.slug || article.id;
    const url = `${BASE}/magazine/${slug}`;
    const date = new Date(article.createdAt || article.publishDate || article.date || Date.now()).toUTCString();
    return `<item><title>${esc(article.title || 'Article')}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${date}</pubDate><description>${esc(article.excerpt || '')}</description></item>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Perfect Models Management - Magazine</title><link>${BASE}/magazine</link><description>Actualités et tendances mode au Gabon.</description><language>fr</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600',
    },
  });
}
