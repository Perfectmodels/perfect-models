import { NextResponse } from 'next/server';
import { collectionToArray, getCollection } from '@/lib/app-data';
import { getCurrentAppProfile } from '@/lib/auth/profile';

export const dynamic = 'force-dynamic';

type EntityType = 'styliste' | 'artiste' | 'partenaire' | 'mannequin' | 'promoteur' | 'mc';
type EntityStat = {
  key: string;
  name: string;
  type: EntityType;
  mentions: number;
  editions: number[];
  roles: string[];
  images: string[];
};

const normalizeName = (value: unknown) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export async function GET() {
  const profile = await getCurrentAppProfile();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const events = collectionToArray(await getCollection('fashionDayEvents')) as any[];
  const map = new Map<string, EntityStat>();
  const add = (type: EntityType, nameValue: unknown, edition: number, role?: unknown, images?: unknown) => {
    const name = String(nameValue || '').trim();
    const normalized = normalizeName(name);
    if (!normalized) return;
    const key = `${type}:${normalized}`;
    const existing = map.get(key) || { key, name, type, mentions: 0, editions: [], roles: [], images: [] };
    existing.mentions += 1;
    if (Number.isFinite(edition) && !existing.editions.includes(edition)) existing.editions.push(edition);
    const roleText = String(role || '').trim();
    if (roleText && !existing.roles.includes(roleText)) existing.roles.push(roleText);
    for (const image of Array.isArray(images) ? images : []) {
      const url = String(image || '').trim();
      if (url && !existing.images.includes(url) && existing.images.length < 6) existing.images.push(url);
    }
    map.set(key, existing);
  };

  for (const event of events) {
    const edition = Number(event?.edition);
    for (const stylist of Array.isArray(event?.stylists) ? event.stylists : []) add('styliste', stylist?.name, edition, 'Styliste', stylist?.images);
    for (const artist of Array.isArray(event?.artists) ? event.artists : []) add('artiste', artist?.name, edition, 'Artiste', artist?.images);
    for (const partner of Array.isArray(event?.partners) ? event.partners : []) add('partenaire', partner?.name, edition, partner?.type || 'Partenaire');
    for (const model of Array.isArray(event?.featuredModels) ? event.featuredModels : []) add('mannequin', model, edition, 'Mannequin');
    add('promoteur', event?.promoter, edition, 'Promoteur');
    add('mc', event?.mc, edition, 'Maître de cérémonie');
  }

  const entities = Array.from(map.values())
    .map((entity) => ({ ...entity, editions: entity.editions.sort((a, b) => a - b) }))
    .sort((a, b) => b.mentions - a.mentions || a.name.localeCompare(b.name, 'fr'));

  return NextResponse.json({
    entities,
    summary: {
      totalEntities: entities.length,
      recurringEntities: entities.filter((item) => item.mentions > 1).length,
      totalMentions: entities.reduce((sum, item) => sum + item.mentions, 0),
      byType: Object.fromEntries(['styliste', 'artiste', 'partenaire', 'mannequin', 'promoteur', 'mc'].map((type) => [type, entities.filter((item) => item.type === type).length])),
    },
  }, { headers: { 'Cache-Control': 'no-store' } });
}
