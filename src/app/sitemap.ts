import type { MetadataRoute } from 'next';

const BASE_URL = 'https://perfectmodels.online';
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'perfectmodels-4e5fa';
export const revalidate = 7200;

const staticRoutes = [
  ['/', 1, 'daily'], ['/agence', 0.8, 'weekly'], ['/mannequins', 0.9, 'daily'], ['/magazine', 0.9, 'daily'],
  ['/services', 0.8, 'weekly'], ['/fashion-day', 0.8, 'weekly'], ['/casting', 0.7, 'weekly'], ['/galerie', 0.6, 'weekly'],
  ['/miss-one-light', 0.7, 'weekly'], ['/contact', 0.5, 'monthly'],
] as const;

const articleFallback = [
  'octobre-rose-le-dpistage-laccessoire-indispensable-dict-par-la-mode-1760796504871', '1',
  'portrait-beitch-faro-laudace-et-llgance-signes-clofas-241-1757849750614',
  'lclat-des-cultures-perfect-models-management-et-badu-cration-unissent-leurs-talents-1757124604640',
  'aj-caramela-nr-picture-collaboration',
  'stecya-minkoue-une-visionnaire-au-service-de-la-mode-et-de-lmancipation-des-jeunes-femmes-gabonaises-1757082956934',
  'axel-une-voix-et-un-pilier-de-la-mode-gabonaise-1757082628847', 'noemi-kim-au-dela-du-podium', 'retour-sur-le-perfect-fashion-day',
];
const modelFallback = ['noemi-kim', 'aj-caramela', 'yann-aubin'];
const services = ['casting-mannequins', 'booking-mannequins', 'mannequins-pour-defiles', 'mannequins-publicite-audiovisuel', 'mannequins-photo', 'mannequins-figurants', 'formation-mannequins', 'conseil-image-style', 'creation-tenues-sur-mesure'];

async function ids(collection: string, apiKey: string) {
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${collection}?key=${apiKey}&pageSize=100`, { next: { revalidate } });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.documents || []).map((document: any) => String(document.name || '').split('/').pop()).filter(Boolean) as string[];
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';
  const [remoteArticles, remoteModels] = apiKey ? await Promise.all([ids('articles', apiKey), ids('models', apiKey)]) : [[], []];
  const articles = remoteArticles.length ? remoteArticles : articleFallback;
  const models = remoteModels.length ? remoteModels : modelFallback;
  const now = new Date();
  return [
    ...staticRoutes.map(([path, priority, changeFrequency]) => ({ url: `${BASE_URL}${path}`, lastModified: now, changeFrequency, priority })),
    ...articles.map((slug) => ({ url: `${BASE_URL}/magazine/${slug}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 })),
    ...models.map((id) => ({ url: `${BASE_URL}/mannequins/${id}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 })),
    ...services.map((slug) => ({ url: `${BASE_URL}/services/${slug}`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 })),
  ];
}
