import type { Article, Model, Service, FashionDayEvent } from '@/types';
import { collectionToArray, getPublicCollection } from '@/lib/app-data';

async function safeCollection(key: string) {
  try {
    return collectionToArray(await getPublicCollection(key));
  } catch {
    return [];
  }
}

function uniqueBy<T>(items: T[], keyOf: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = keyOf(item).trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

export function toPublicModel(model: Model): PublicModel {
  return {
    id: model.id,
    name: model.name,
    age: model.age,
    height: model.height,
    gender: model.gender,
    location: model.location,
    imageUrl: model.imageUrl,
    portfolioImages: Array.isArray(model.portfolioImages) ? model.portfolioImages : [],
    isPublic: true,
    level: model.level,
    distinctions: Array.isArray(model.distinctions) ? model.distinctions : [],
    measurements: model.measurements,
    categories: Array.isArray(model.categories) ? model.categories : [],
    experience: model.experience,
    journey: model.journey,
    fashionDayEditions: Array.isArray((model as any).fashionDayEditions) ? (model as any).fashionDayEditions : undefined,
  };
}

export async function getPublicArticles(): Promise<Article[]> {
  const remote = await safeCollection('articles');
  const published = (remote as Article[]).filter((article) => article && article.status !== 'draft' && Boolean(article.slug));
  return uniqueBy(published, (article) => String(article.slug));
}

export async function getPublicModels(): Promise<PublicModel[]> {
  const remote = await safeCollection('models');
  const published = (remote as Model[])
    .filter((model) => model && model.isPublic === true && Boolean(model.id))
    .map(toPublicModel);
  return uniqueBy(published, (model) => String(model.id));
}

export async function getPublicServices(): Promise<Service[]> {
  const remote = await safeCollection('agencyServices');
  const published = (remote as Service[]).filter((service) => service && !service.isComingSoon && Boolean(service.slug));
  return uniqueBy(published, (service) => String(service.slug));
}

export async function getFashionDayEvents(): Promise<Array<FashionDayEvent & { coverImageUrl?: string }>> {
  const remote = await safeCollection('fashionDayEvents');
  const events = (remote as Array<FashionDayEvent & { coverImageUrl?: string }>).filter(
    (event) => event && Number.isFinite(Number(event.edition)),
  );
  return uniqueBy(events, (event) => String(event.edition));
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
