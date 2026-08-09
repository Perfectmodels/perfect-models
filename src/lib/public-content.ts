import type { Article, Model, Service, FashionDayEvent } from '@/types';
import { collectionToArray, getCollection } from '@/lib/app-data';
import { articles as seedArticles } from '@/constants/magazineData';
import { agencyServices as seedServices, models as seedModels } from '@/constants/data';

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
  const source = (remote.length ? remote : seedArticles) as Article[];
  const published = source.filter((article) => article && article.status !== 'draft' && Boolean(article.slug));
  return uniqueBy(published, (article) => String(article.slug));
}

export async function getPublicModels(): Promise<Model[]> {
  const remote = await safeCollection('models');
  const source = (remote.length ? remote : seedModels) as Model[];
  const published = source.filter((model) => model && model.isPublic !== false && Boolean(model.id));
  return uniqueBy(published, (model) => String(model.id));
}

export async function getPublicServices(): Promise<Service[]> {
  const remote = await safeCollection('agencyServices');
  const source = (remote.length ? remote : seedServices) as Service[];
  const published = source.filter((service) => service && !service.isComingSoon && Boolean(service.slug));
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
  const articles = await getPublicArticles();
  return articles.find((article) => String(article.slug) === slug) || null;
}

export async function getModelById(id: string) {
  const models = await getPublicModels();
  return models.find((model) => String(model.id) === id) || null;
}

export async function getServiceBySlug(slug: string) {
  const services = await getPublicServices();
  return services.find((service) => String(service.slug) === slug) || null;
}
