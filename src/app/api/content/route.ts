import { NextRequest, NextResponse } from 'next/server';
import { collectionToArray, getCollection } from '@/lib/app-data';
import { articles as seedArticles } from '@/constants/magazineData';
import { agencyServices as seedServices, models as seedModels } from '@/constants/data';

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

  const [articlesRaw, modelsRaw, servicesRaw] = await Promise.all([
    getCollection('articles'),
    getCollection('models'),
    getCollection('agencyServices'),
  ]);

  const articleSource = collectionToArray(articlesRaw);
  const serviceSource = collectionToArray(servicesRaw);
  const modelSource = collectionToArray(modelsRaw);

  const articles = (articleSource.length ? articleSource : seedArticles).map((article: any) => ({
    ...article,
    slug: article.slug || article.id,
    url: `${BASE}/magazine/${article.slug || article.id}`,
  }));

  const models = (modelSource.length ? modelSource : seedModels)
    .filter((model: any) => model?.isPublic !== false)
    .map((model: any) => ({ ...model, url: `${BASE}/mannequins/${model.id}` }));

  const services = (serviceSource.length ? serviceSource : seedServices).map((service: any) => ({
    ...service,
    slug: service.slug || service.id,
    url: `${BASE}/services/${service.slug || service.id}`,
  }));

  const pages = [
    ['/', 'Accueil'],
    ['/agence', "L'Agence"],
    ['/mannequins', 'Mannequins'],
    ['/magazine', 'Magazine'],
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
