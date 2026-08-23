import type { Article, Model, Service, FashionDayEvent } from '@/types';
import { collectionToArray, getCollection } from '@/lib/app-data';

async function safeCollection(key: string) {
  try {
    return collectionToArray(await getCollection(key));
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

export async function getPublicArticles(): Promise<Article[]> {
  const remote = await safeCollection('articles');
  const published = (remote as Article[]).filter((article) => article && article.status !== 'draft' && Boolean(article.slug));
  return uniqueBy(published, (article) => String(article.slug));
}

export async function getPublicModels(): Promise<Model[]> {
  const remote = await safeCollection('models');
  const published = (remote as Model[]).filter((model) => model && model.isPublic !== false && Boolean(model.id));
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
