import 'server-only';

import type { Article, Model, Service, FashionDayEvent } from '@/types';
import { privilegedSupabaseSelect } from '@/lib/supabase-backend';

function uniqueBy<T>(items: T[], keyOf: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item).trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function selectRows(path: string): Promise<any[]> {
  try {
    const rows = await privilegedSupabaseSelect(path);
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error(`[public-content] lecture Supabase impossible: ${path}`, error);
    return [];
  }
}

export type PublicModel = Pick<
  Model,
  | 'id'
  | 'name'
  | 'age'
  | 'height'
  | 'gender'
  | 'location'
  | 'imageUrl'
  | 'portfolioImages'
  | 'isPublic'
  | 'level'
  | 'distinctions'
  | 'measurements'
  | 'categories'
  | 'experience'
  | 'journey'
> & { fashionDayEditions?: number[] };

function mapModel(row: any, portfolioImages: string[]): PublicModel {
  return {
    id: String(row.id),
    name: String(row.name || ''),
    age: row.age == null ? undefined : Number(row.age),
    height: String(row.height || ''),
    gender: row.gender === 'Homme' ? 'Homme' : 'Femme',
    location: row.location || undefined,
    imageUrl: String(row.image_url || portfolioImages[0] || ''),
    portfolioImages,
    isPublic: true,
    level: row.level === 'Débutant' ? 'Débutant' : 'Pro',
    distinctions: Array.isArray(row.distinctions) ? row.distinctions : [],
    measurements: row.measurements || { chest: '', waist: '', hips: '', shoeSize: '' },
    categories: Array.isArray(row.categories) ? row.categories : [],
    experience: String(row.experience || ''),
    journey: String(row.journey || ''),
    fashionDayEditions: Array.isArray(row.fashion_day_editions) ? row.fashion_day_editions.map(Number) : undefined,
  };
}

export async function getPublicModels(): Promise<PublicModel[]> {
  const [rows, images] = await Promise.all([
    selectRows('models?select=id,name,age,height,gender,location,level,image_url,categories,measurements,distinctions,experience,journey,fashion_day_editions,is_public,is_active,status&is_public=eq.true&is_active=eq.true&status=neq.inactive&order=name.asc'),
    selectRows('model_portfolio_images?select=model_id,url,position&order=position.asc'),
  ]);

  const imageMap = new Map<string, string[]>();
  for (const image of images) {
    const modelId = String(image?.model_id || '');
    const url = String(image?.url || '');
    if (!modelId || !url) continue;
    const current = imageMap.get(modelId) || [];
    current.push(url);
    imageMap.set(modelId, current);
  }

  return uniqueBy(
    rows.filter((row) => row?.id && row?.name).map((row) => mapModel(row, imageMap.get(String(row.id)) || [])),
    (model) => String(model.id),
  );
}

export async function getPublicServices(): Promise<Service[]> {
  const rows = await selectRows('services?select=slug,icon,title,category,description,details,button_text,button_link,is_active,position&is_active=eq.true&order=position.asc');
  const services = rows
    .filter((row) => row?.slug && row?.title)
    .map((row) => ({
      slug: String(row.slug),
      icon: String(row.icon || ''),
      title: String(row.title),
      category: row.category as Service['category'],
      description: String(row.description || ''),
      details: row.details || undefined,
      buttonText: String(row.button_text || 'En savoir plus'),
      buttonLink: String(row.button_link || `/services/${row.slug}`),
      isComingSoon: false,
    }));
  return uniqueBy(services, (service) => service.slug);
}

export async function getFashionDayEvents(): Promise<Array<FashionDayEvent & { coverImageUrl?: string }>> {
  const rows = await selectRows('fashion_day_events?select=edition,theme,event_date,location,description,promoter,mc,cover_image_url,gallery_images,raw_data&order=edition.desc');
  const events = rows
    .filter((row) => Number.isFinite(Number(row?.edition)))
    .map((row) => {
      const raw = row?.raw_data && typeof row.raw_data === 'object' ? row.raw_data : {};
      return {
        ...raw,
        edition: Number(row.edition),
        date: String(row.event_date || raw.date || ''),
        theme: String(row.theme || raw.theme || ''),
        location: row.location || raw.location || undefined,
        description: String(row.description || raw.description || ''),
        promoter: row.promoter || raw.promoter || undefined,
        mc: row.mc || raw.mc || undefined,
        galleryImages: Array.isArray(row.gallery_images) ? row.gallery_images : Array.isArray(raw.galleryImages) ? raw.galleryImages : [],
        coverImageUrl: row.cover_image_url || raw.coverImageUrl || undefined,
      } as FashionDayEvent & { coverImageUrl?: string };
    });
  return uniqueBy(events, (event) => String(event.edition));
}

function articleContent(row: any): Article['content'] {
  const rawContent = row?.raw_data?.content;
  if (Array.isArray(rawContent)) return rawContent as Article['content'];
  const text = String(row?.content || '').trim();
  return text ? [{ type: 'paragraph', text }] : [];
}

export async function getPublicArticles(): Promise<Article[]> {
  const rows = await selectRows('blog_posts?select=slug,title,excerpt,content,cover_image_url,author_name,category,tags,status,published_at,created_at,raw_data&status=eq.published&order=published_at.desc');
  const articles = rows
    .filter((row) => row?.slug && row?.title)
    .map((row) => {
      const raw = row?.raw_data && typeof row.raw_data === 'object' ? row.raw_data : {};
      return {
        slug: String(row.slug),
        title: String(row.title),
        category: String(row.category || raw.category || 'Magazine'),
        excerpt: String(row.excerpt || raw.excerpt || ''),
        imageUrl: String(row.cover_image_url || raw.imageUrl || ''),
        author: String(row.author_name || raw.author || 'Perfect Models Management'),
        date: String(row.published_at || row.created_at || raw.date || ''),
        content: articleContent(row),
        tags: Array.isArray(row.tags) ? row.tags : Array.isArray(raw.tags) ? raw.tags : [],
        isFeatured: Boolean(raw.isFeatured),
        status: 'published' as const,
        photographer: raw.photographer,
        brands: Array.isArray(raw.brands) ? raw.brands : undefined,
        viewCount: Number(raw.viewCount || 0),
        reactions: raw.reactions,
      } satisfies Article;
    });
  return uniqueBy(articles, (article) => article.slug);
}

export async function getArticleBySlug(slug: string) {
  return (await getPublicArticles()).find((article) => String(article.slug) === slug) || null;
}

export async function getModelById(id: string) {
  return (await getPublicModels()).find((model) => String(model.id) === id) || null;
}

export async function getServiceBySlug(slug: string) {
  return (await getPublicServices()).find((service) => String(service.slug) === slug) || null;
}
