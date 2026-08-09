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

export async function getPublicArticles(): Promise<Article[]> {
  const remote = await safeCollection('articles');
  const source = (remote.length ? remote : seedArticles) as Article[];
  return source.filter((article) => article && article.status !== 'draft' && Boolean(article.slug));
}

export async function getPublicModels(): Promise<Model[]> {
  const remote = await safeCollection('models');
  const source = (remote.length ? remote : seedModels) as Model[];
  return source.filter((model) => model && model.isPublic !== false && Boolean(model.id));
}

export async function getPublicServices(): Promise<Service[]> {
  const remote = await safeCollection('agencyServices');
  const source = (remote.length ? remote : seedServices) as Service[];
  return source.filter((service) => service && !service.isComingSoon && Boolean(service.slug));
}

export async function getFashionDayEvents(): Promise<Array<FashionDayEvent & { coverImageUrl?: string }>> {
  const remote = await safeCollection('fashionDayEvents');
  return (remote as Array<FashionDayEvent & { coverImageUrl?: string }>).filter(
    (event) => event && Number.isFinite(Number(event.edition)),
  );
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
