import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BASE = 'https://perfect-156b5-default-rtdb.firebaseio.com';

async function read(path: string) {
  const response = await fetch(`${BASE}/${path}.json`, { cache: 'no-store' });
  const text = await response.text();
  if (!response.ok) throw new Error(`${path}: ${response.status} ${text.slice(0, 120)}`);
  return text ? JSON.parse(text) : null;
}

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value && typeof value === 'object') return Object.entries(value).map(([key, item]: any) => ({ id: item?.id ?? key, ...item }));
  return [];
}

function strings(value: any) {
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string' && item.trim()) : [];
}

async function checkUrl(url: string) {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: { Range: 'bytes=0-0', 'User-Agent': 'PMM-Media-Recovery/1.0' },
      signal: AbortSignal.timeout(8000),
    });
    const type = response.headers.get('content-type') || '';
    return { url, ok: response.ok && type.startsWith('image/'), status: response.status, type };
  } catch {
    return { url, ok: false, status: 0, type: '' };
  }
}

export async function GET(request: Request) {
  try {
    const [modelsRaw, galleryRaw, galleryAlbumsRaw, siteImagesRaw, newsRaw] = await Promise.all([
      read('models'), read('gallery'), read('galleryAlbums'), read('siteImages'), read('newsItems'),
    ]);

    const models = asArray(modelsRaw).map((model) => ({
      id: String(model.id ?? ''),
      name: String(model.name ?? ''),
      imageUrl: model.imageUrl || model.photoUrl || model.profileImage || model.photo || null,
      portfolioImages: strings(model.portfolioImages || model.images || model.photos),
    })).filter((model) => model.imageUrl || model.portfolioImages.length);

    const gallery = asArray(galleryRaw).map((item) => ({
      id: String(item.id ?? ''),
      title: String(item.title ?? item.name ?? ''),
      url: item.url || item.imageUrl || item.src || item.image || null,
      albumId: item.albumId || item.album || null,
    })).filter((item) => item.url);

    const galleryAlbums = asArray(galleryAlbumsRaw).map((album) => ({
      id: String(album.id ?? ''),
      title: String(album.title ?? album.name ?? ''),
      cover: album.cover || album.coverUrl || album.imageUrl || null,
      images: strings(album.images || album.photos || album.imageUrls),
    })).filter((album) => album.cover || album.images.length);

    const siteImages = siteImagesRaw && typeof siteImagesRaw === 'object'
      ? Object.fromEntries(Object.entries(siteImagesRaw).filter(([, value]) => typeof value === 'string'))
      : {};

    const newsItems = asArray(newsRaw).map((item) => ({
      id: String(item.id ?? ''),
      imageUrl: item.imageUrl || item.image || item.url || null,
    })).filter((item) => item.imageUrl);

    const search = new URL(request.url).searchParams;
    if (search.get('check') === '1') {
      const urls = Array.from(new Set([
        ...models.map((m) => m.imageUrl).filter(Boolean),
        ...Object.values(siteImages),
        ...newsItems.map((n) => n.imageUrl).filter(Boolean),
      ])) as string[];
      const checks = await Promise.all(urls.map(checkUrl));
      return NextResponse.json({
        ok: true,
        checked: checks.length,
        reachable: checks.filter((item) => item.ok).length,
        broken: checks.filter((item) => !item.ok),
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (search.get('compact') === '1') {
      return NextResponse.json({
        models: Object.fromEntries(models.map((model) => [model.name.toLocaleLowerCase('fr'), { imageUrl: model.imageUrl, portfolioImages: model.portfolioImages }])),
        siteImages,
        newsItems,
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ ok: true, counts: { models: models.length, gallery: gallery.length, galleryAlbums: galleryAlbums.length, siteImages: Object.keys(siteImages).length, newsItems: newsItems.length }, models, gallery, galleryAlbums, siteImages, newsItems }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Legacy image diagnostic failed.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
