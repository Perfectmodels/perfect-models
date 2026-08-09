import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://perfectmodels.online';
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'perfectmodels-4e5fa';

const embeddedData = {
  articles: [
    { slug: 'octobre-rose-le-dpistage-laccessoire-indispensable-dict-par-la-mode-1760796504871', title: 'Octobre Rose', type: 'article', date: '2025-10-18' },
    { slug: '1', title: 'Dorcas Moira SAPHOU', type: 'article', date: '2025-10-15' },
    { slug: 'portrait-beitch-faro-laudace-et-llgance-signes-clofas-241-1757849750614', title: 'Beitch Faro', type: 'article', date: '2025-09-14' },
    { slug: 'aj-caramela-nr-picture-collaboration', title: 'AJ Caramela x NR Picture', type: 'article', date: '2024-07-28' },
  ],
  models: [
    { id: 'noemi-kim', name: 'Noemi Kim', type: 'model', level: 'Pro' },
    { id: 'aj-caramela', name: 'AJ Caramela', type: 'model', level: 'Pro' },
    { id: 'yann-aubin', name: 'Yann Aubin', type: 'model', level: 'Pro' },
  ],
  services: [
    { slug: 'casting-mannequins', title: 'Casting Mannequins', category: 'Mannequinat' },
    { slug: 'booking-mannequins', title: 'Booking Mannequins', category: 'Mannequinat' },
    { slug: 'formation-mannequins', title: 'Formation', category: 'Mannequinat' },
  ],
  pages: [
    { path: '/', title: 'Accueil' },
    { path: '/agence', title: "L'Agence" },
    { path: '/mannequins', title: 'Mannequins' },
    { path: '/magazine', title: 'Magazine' },
    { path: '/services', title: 'Services' },
    { path: '/fashion-day', title: 'Fashion Day' },
  ],
};

async function fetchFromFirestore(collection: string, apiKey: string) {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}?key=${apiKey}&pageSize=100`;
  try {
    const response = await fetch(url, { next: { revalidate: 600 } });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.documents) return null;
    return data.documents.map((document: any) => {
      const fields = document.fields || {};
      const id = String(document.name || '').split('/').pop() || '';
      return {
        id,
        slug: id,
        title: fields.title?.stringValue || fields.name?.stringValue || id,
        name: fields.name?.stringValue || fields.title?.stringValue || id,
        excerpt: fields.excerpt?.stringValue || fields.description?.stringValue || '',
        imageUrl: fields.coverImageUrl?.stringValue || fields.imageUrl?.stringValue || '',
        author: fields.authorName?.stringValue || '',
        date: fields.createdAt?.timestampValue || fields.date?.stringValue || '',
        category: fields.category?.stringValue || '',
        type: collection === 'articles' ? 'article' : collection === 'models' ? 'model' : 'content',
      };
    });
  } catch {
    return null;
  }
}

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
  const query = request.nextUrl.searchParams.get('q')?.toLowerCase() || '';
  const maxResults = Math.max(1, Math.min(100, Number(request.nextUrl.searchParams.get('limit') || 50) || 50));
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';

  let articles: any[] = embeddedData.articles;
  let models: any[] = embeddedData.models;
  const services: any[] = embeddedData.services;

  if (apiKey) {
    const [firestoreArticles, firestoreModels] = await Promise.all([
      fetchFromFirestore('articles', apiKey),
      fetchFromFirestore('models', apiKey),
    ]);
    if (firestoreArticles) articles = firestoreArticles;
    if (firestoreModels) models = firestoreModels;
  }

  const allContent: Record<string, any[]> = {
    articles: articles.map((item) => ({ ...item, url: `${BASE_URL}/magazine/${item.slug}` })),
    models: models.map((item) => ({ ...item, url: `${BASE_URL}/mannequins/${item.id}` })),
    services: services.map((item) => ({ ...item, url: `${BASE_URL}/services/${item.slug}` })),
    pages: embeddedData.pages.map((item) => ({ ...item, url: `${BASE_URL}${item.path}` })),
  };

  let content = allContent;
  if (type && Object.prototype.hasOwnProperty.call(allContent, type)) content = { [type]: allContent[type] };

  if (query) {
    content = Object.fromEntries(
      Object.entries(content).map(([key, items]) => [
        key,
        items.filter((item) => JSON.stringify(item).toLowerCase().includes(query)),
      ]),
    );
  }

  content = Object.fromEntries(Object.entries(content).map(([key, items]) => [key, items.slice(0, maxResults)]));
  const total = Object.values(content).reduce((sum, items) => sum + items.length, 0);

  return NextResponse.json(
    { meta: { site: BASE_URL, generatedAt: new Date().toISOString(), total }, content },
    { headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=300, s-maxage=600' } },
  );
}
