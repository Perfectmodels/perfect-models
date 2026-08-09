const BASE_URL = 'https://perfectmodels.online';
const SITE_NAME = 'Perfect Models Management';
const SITE_DESCRIPTION = 'Actualités, interviews et tendances mode au Gabon. Découvrez les coulisses de la mode gabonaise avec Perfect Models Management.';
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'perfectmodels-4e5fa';

const fallbackArticles = [
  { slug: 'octobre-rose-le-dpistage-laccessoire-indispensable-dict-par-la-mode-1760796504871', title: "Octobre Rose : Le Dépistage, l'Accessoire Indispensable Dicté par la Mode", excerpt: 'Cet Octobre Rose, la mode dicte une tendance qui transcende les podiums : le dépistage.', imageUrl: 'https://i.ibb.co/RpXtWzq/1005252341.png', author: 'Focus Model 241', date: '2025-10-18', category: 'Actualités' },
  { slug: '1', title: 'Dorcas Moira SAPHOU : Son ticket pour Top Models FIMA est validé', excerpt: "L'heure est à la consécration pour Dorcas Moira SAPHOU.", imageUrl: 'https://i.ibb.co/Pzm6kdQ/559155589-797412703143073-47429732447466306-n.jpg', author: 'Focus Model 241', date: '2025-10-15', category: 'Actualités' },
  { slug: 'portrait-beitch-faro-laudace-et-llgance-signes-clofas-241-1757849750614', title: "Portrait – Beitch Faro : l'audace et l'élégance signées CLOFAS 241", excerpt: 'Dans le paysage foisonnant de la mode gabonaise...', imageUrl: '', author: 'Focus Model 241', date: '2025-09-14', category: 'Portrait' },
  { slug: 'aj-caramela-nr-picture-collaboration', title: "AJ Caramela x NR Picture : L'Alliance Iconique", excerpt: 'Quand la présence magnétique du mannequin AJ Caramela rencontre l’œil expert...', imageUrl: 'https://i.postimg.cc/k5skXhC2/NR-09474.jpg', author: 'Focus Model 241', date: '2024-07-28', category: 'Shooting' },
];

type FeedArticle = (typeof fallbackArticles)[number];

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function fetchArticles(apiKey: string): Promise<FeedArticle[] | null> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/articles?key=${apiKey}&pageSize=20&orderBy=createdAt%20desc`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.documents) return null;
    return data.documents.map((document: any) => {
      const fields = document.fields || {};
      const id = String(document.name || '').split('/').pop() || '';
      return {
        slug: id,
        title: fields.title?.stringValue || '',
        excerpt: fields.excerpt?.stringValue || '',
        imageUrl: fields.coverImageUrl?.stringValue || '',
        author: fields.authorName?.stringValue || 'Perfect Models',
        date: fields.createdAt?.timestampValue || fields.date?.stringValue || new Date().toISOString(),
        category: fields.category?.stringValue || 'Actualités',
      };
    });
  } catch {
    return null;
  }
}

function generateRss(articles: FeedArticle[]) {
  const now = new Date().toUTCString();
  const items = articles.map((article) => {
    const articleUrl = `${BASE_URL}/magazine/${article.slug}`;
    return `<item><title>${escapeXml(article.title)}</title><link>${articleUrl}</link><guid isPermaLink="true">${articleUrl}</guid><pubDate>${new Date(article.date).toUTCString()}</pubDate><dc:creator>${escapeXml(article.author)}</dc:creator><category>${escapeXml(article.category)}</category><description>${escapeXml(article.excerpt)}</description><content:encoded><![CDATA[${article.imageUrl ? `<img src="${article.imageUrl}" alt="${article.title}" />` : ''}<p>${article.excerpt}</p><p><a href="${articleUrl}">Lire l'article complet</a></p>]]></content:encoded></item>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${escapeXml(SITE_NAME)} - Magazine</title><link>${BASE_URL}/magazine</link><description>${escapeXml(SITE_DESCRIPTION)}</description><language>fr</language><lastBuildDate>${now}</lastBuildDate><generator>Next.js</generator><atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;
}

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || '';
  const remote = apiKey ? await fetchArticles(apiKey) : null;
  const xml = generateRss(remote?.length ? remote : fallbackArticles);
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=1800, s-maxage=3600' } });
}
