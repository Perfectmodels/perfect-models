import { NextRequest, NextResponse } from 'next/server';
import { getPublicArticles, getPublicModels, getPublicServices } from '@/lib/public-content';

const BASE = 'https://perfectmodels.online';

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type');
  const q = (request.nextUrl.searchParams.get('q') || '').toLowerCase();
  const limit = Math.max(1, Math.min(100, Number(request.nextUrl.searchParams.get('limit') || 50) || 50));

  const [articleRows, modelRows, serviceRows] = await Promise.all([
    getPublicArticles(),
    getPublicModels(),
    getPublicServices(),
  ]);

  const articles = articleRows.map(article => ({
    ...article,
    url: `${BASE}/blog/${encodeURIComponent(article.slug)}`,
  }));
  const models = modelRows.map(model => ({
    ...model,
    url: `${BASE}/mannequins/${encodeURIComponent(String(model.id))}`,
  }));
  const services = serviceRows.map(service => ({
    ...service,
    url: `${BASE}/services/${encodeURIComponent(service.slug)}`,
  }));
  const pages = [
    ['/', 'Accueil'],
    ['/agence', "L’Agence"],
    ['/mannequins', 'Mannequins'],
    ['/blog', 'Blog'],
    ['/services', 'Services'],
    ['/fashion-day', 'Fashion Day'],
  ].map(([path, title]) => ({ path, title, url: `${BASE}${path}` }));

  let content: Record<string, any[]> = { articles, models, services, pages };
  if (type && content[type]) content = { [type]: content[type] };
  if (q) {
    content = Object.fromEntries(
      Object.entries(content).map(([key, items]) => [key, items.filter(item => JSON.stringify(item).toLowerCase().includes(q))]),
    );
  }
  content = Object.fromEntries(Object.entries(content).map(([key, items]) => [key, items.slice(0, limit)]));
  const total = Object.values(content).reduce((sum, items) => sum + items.length, 0);

  return NextResponse.json(
    { meta: { site: BASE, generatedAt: new Date().toISOString(), total }, content },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300, s-maxage=600' } },
  );
}
