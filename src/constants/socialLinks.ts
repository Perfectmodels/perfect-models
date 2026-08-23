export const OFFICIAL_SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/perfectmodels.ga/',
  instagram: 'https://www.instagram.com/perfectmodels.ga/',
  tiktok: 'https://www.tiktok.com/@perfectmodels.ga',
  youtube: 'https://www.youtube.com/@perfectmodelsga',
  whatsapp: 'https://whatsapp.com/channel/0029VbATGBK0wajp1ACtN82S',
} as const;

const LEGACY_SOCIAL_LINKS: Record<string, string> = {
  'https://www.facebook.com/PerfectModels241': OFFICIAL_SOCIAL_LINKS.facebook,
  'https://www.facebook.com/PerfectModels241/': OFFICIAL_SOCIAL_LINKS.facebook,
  'https://www.instagram.com/perfectmodelsmanagement_': OFFICIAL_SOCIAL_LINKS.instagram,
  'https://www.instagram.com/perfectmodelsmanagement_/': OFFICIAL_SOCIAL_LINKS.instagram,
  'https://www.youtube.com/@perfectmodelsmanagement6013': OFFICIAL_SOCIAL_LINKS.youtube,
};

export const normalizeOfficialSocialLinks = (value: any) => {
  const current = value && typeof value === 'object' ? value : {};
  const normalized: Record<string, string> = {
    ...OFFICIAL_SOCIAL_LINKS,
    ...current,
  };

  for (const key of ['facebook', 'instagram', 'youtube']) {
    const url = normalized[key];
    if (url && LEGACY_SOCIAL_LINKS[url]) normalized[key] = LEGACY_SOCIAL_LINKS[url];
  }

  if (!normalized.tiktok) normalized.tiktok = OFFICIAL_SOCIAL_LINKS.tiktok;
  if (!normalized.whatsapp) normalized.whatsapp = OFFICIAL_SOCIAL_LINKS.whatsapp;

  return normalized;
};
