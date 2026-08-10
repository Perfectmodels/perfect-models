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
  return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
}

export async function GET() {
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

    return NextResponse.json({ ok: true, counts: { models: models.length, gallery: gallery.length, galleryAlbums: galleryAlbums.length, siteImages: Object.keys(siteImages).length, newsItems: newsItems.length }, models, gallery, galleryAlbums, siteImages, newsItems }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Legacy image diagnostic failed.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
