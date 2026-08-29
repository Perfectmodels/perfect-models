export type TalentQueryFilters = {
  limit?: number;
  gender?: string;
  category?: string;
  location?: string;
  hair?: string;
  eyes?: string;
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  from?: string;
  to?: string;
  interpretation: string[];
};

const CITY_NAMES = ['Libreville', 'Akanda', 'Owendo', 'Port-Gentil', 'Franceville', 'Oyem', 'Lambaréné', 'Mouila', 'Moanda'];
const CATEGORY_ALIASES: Array<[string, string[]]> = [
  ['beauty', ['beauty', 'beauté', 'beaute']],
  ['fashion', ['fashion', 'mode', 'editorial', 'éditorial', 'editoriel']],
  ['commercial', ['commercial', 'publicité', 'publicite', 'campagne']],
  ['runway', ['runway', 'défilé', 'defile', 'catwalk']],
  ['e-commerce', ['e-commerce', 'ecommerce', 'e commerce']],
  ['fitness', ['fitness', 'sport', 'sportif', 'sportive']],
  ['influence', ['influence', 'influenceur', 'influenceuse', 'contenu digital']],
];
const COLORS = ['noir', 'noire', 'noirs', 'noires', 'brun', 'brune', 'bruns', 'brunes', 'marron', 'marrons', 'châtain', 'chatain', 'châtains', 'chatains', 'blond', 'blonde', 'blonds', 'blondes', 'roux', 'rousse', 'gris', 'grise', 'bleu', 'bleus', 'bleue', 'vert', 'verts', 'verte', 'noisette'];
const WEEKDAYS: Record<string, number> = { dimanche: 0, lundi: 1, mardi: 2, mercredi: 3, jeudi: 4, vendredi: 5, samedi: 6 };

function strip(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function iso(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function nextWeekday(base: Date, target: number) {
  const date = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  let delta = (target - date.getDay() + 7) % 7;
  if (delta === 0) delta = 7;
  date.setDate(date.getDate() + delta);
  return date;
}
function numberFromMeters(raw: string) {
  const match = raw.match(/(\d)\s*m\s*(\d{1,2})/i);
  if (!match) return null;
  return Number(match[1]) * 100 + Number(match[2].padEnd(2, '0'));
}
function addLabel(result: TalentQueryFilters, label: string) {
  if (!result.interpretation.includes(label)) result.interpretation.push(label);
}

export function parseTalentQuery(input: string, baseDate = new Date()): TalentQueryFilters {
  const raw = input.trim();
  const normalized = strip(raw);
  const result: TalentQueryFilters = { interpretation: [] };
  if (!raw) return result;

  const limit = normalized.match(/\b(\d{1,3})\s*(?:profils?|mannequins?|talents?)\b/);
  if (limit) {
    result.limit = Math.min(100, Math.max(1, Number(limit[1])));
    addLabel(result, `${result.limit} profils max.`);
  }

  if (/\b(femme|femmes|feminin|feminine|filles?)\b/.test(normalized)) {
    result.gender = 'Femme'; addLabel(result, 'Femmes');
  } else if (/\b(homme|hommes|masculin|masculine|garcons?)\b/.test(normalized)) {
    result.gender = 'Homme'; addLabel(result, 'Hommes');
  }

  for (const [category, aliases] of CATEGORY_ALIASES) {
    if (aliases.some((alias) => normalized.includes(strip(alias)))) {
      result.category = category; addLabel(result, category); break;
    }
  }

  for (const city of CITY_NAMES) {
    if (normalized.includes(strip(city))) {
      result.location = city; addLabel(result, city); break;
    }
  }

  const hairMatch = normalized.match(new RegExp(`cheveux\\s+(${COLORS.map(strip).join('|')})`));
  if (hairMatch) { result.hair = hairMatch[1]; addLabel(result, `Cheveux ${hairMatch[1]}`); }
  const eyeMatch = normalized.match(new RegExp(`yeux\\s+(${COLORS.map(strip).join('|')})`));
  if (eyeMatch) { result.eyes = eyeMatch[1]; addLabel(result, `Yeux ${eyeMatch[1]}`); }

  const ageRange = normalized.match(/\b(?:age\s*)?(\d{1,2})\s*(?:-|a|à)\s*(\d{1,2})\s*ans?\b/);
  if (ageRange) {
    result.ageMin = Math.min(Number(ageRange[1]), Number(ageRange[2]));
    result.ageMax = Math.max(Number(ageRange[1]), Number(ageRange[2]));
    addLabel(result, `${result.ageMin}–${result.ageMax} ans`);
  } else {
    const ageMin = normalized.match(/(?:plus de|minimum|min\.?|au moins)\s*(\d{1,2})\s*ans?/);
    const ageMax = normalized.match(/(?:moins de|maximum|max\.?|jusqu.?a)\s*(\d{1,2})\s*ans?/);
    if (ageMin) { result.ageMin = Number(ageMin[1]); addLabel(result, `≥ ${result.ageMin} ans`); }
    if (ageMax) { result.ageMax = Number(ageMax[1]); addLabel(result, `≤ ${result.ageMax} ans`); }
  }

  const cmRange = normalized.match(/\b(1\d{2}|2[0-2]\d)\s*(?:-|a|à)\s*(1\d{2}|2[0-2]\d)\s*cm\b/);
  const meterRange = normalized.match(/(\d\s*m\s*\d{1,2})\s*(?:-|a|à)\s*(\d\s*m\s*\d{1,2})/);
  if (cmRange) {
    result.heightMin = Math.min(Number(cmRange[1]), Number(cmRange[2]));
    result.heightMax = Math.max(Number(cmRange[1]), Number(cmRange[2]));
    addLabel(result, `${result.heightMin}–${result.heightMax} cm`);
  } else if (meterRange) {
    const a = numberFromMeters(meterRange[1]); const b = numberFromMeters(meterRange[2]);
    if (a && b) { result.heightMin = Math.min(a, b); result.heightMax = Math.max(a, b); addLabel(result, `${result.heightMin}–${result.heightMax} cm`); }
  } else {
    const exactMeters = normalized.match(/\b(\d\s*m\s*\d{1,2})\b/);
    if (exactMeters) {
      const value = numberFromMeters(exactMeters[1]);
      if (value) { result.heightMin = value - 2; result.heightMax = value + 2; addLabel(result, `Autour de ${value} cm`); }
    } else {
      const hMin = normalized.match(/(?:plus de|minimum|min\.?|au moins)\s*(1\d{2}|2[0-2]\d)\s*cm/);
      const hMax = normalized.match(/(?:moins de|maximum|max\.?|jusqu.?a)\s*(1\d{2}|2[0-2]\d)\s*cm/);
      if (hMin) { result.heightMin = Number(hMin[1]); addLabel(result, `≥ ${result.heightMin} cm`); }
      if (hMax) { result.heightMax = Number(hMax[1]); addLabel(result, `≤ ${result.heightMax} cm`); }
    }
  }

  const today = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  if (/\baujourd.?hui\b/.test(normalized)) {
    result.from = iso(today); result.to = result.from; addLabel(result, `Disponible ${result.from}`);
  } else if (/\bdemain\b/.test(normalized)) {
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    result.from = iso(tomorrow); result.to = result.from; addLabel(result, `Disponible ${result.from}`);
  } else {
    for (const [name, day] of Object.entries(WEEKDAYS)) {
      if (normalized.includes(name)) {
        const date = nextWeekday(today, day); result.from = iso(date); result.to = result.from; addLabel(result, `Disponible ${name} ${result.from}`); break;
      }
    }
  }

  const numericDate = normalized.match(/(?:le|du)?\s*(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/);
  if (!result.from && numericDate) {
    const yearRaw = numericDate[3] ? Number(numericDate[3]) : baseDate.getFullYear();
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    const date = new Date(year, Number(numericDate[2]) - 1, Number(numericDate[1]));
    result.from = iso(date); result.to = result.from; addLabel(result, `Disponible ${result.from}`);
  }

  return result;
}
