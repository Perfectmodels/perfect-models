export type SiteImageSlot = {
  key: string;
  label: string;
  section: string;
  description: string;
  ratio: string;
  legacyKey?: string;
};

export type SiteImagePage = {
  id: string;
  label: string;
  path: string;
  description: string;
  slots: SiteImageSlot[];
};

const slot = (
  key: string,
  label: string,
  section: string,
  description: string,
  ratio: string,
  legacyKey?: string,
): SiteImageSlot => ({ key, label, section, description, ratio, legacyKey });

export const SITE_IMAGE_PAGES: SiteImagePage[] = [
  {
    id: 'home',
    label: 'Accueil',
    path: '/',
    description: 'Carrousel principal, mosaïque éditoriale et bloc Perfect Fashion Day.',
    slots: [
      slot('home.hero.primary', 'Image principale', 'Héros', 'Grande image du carrousel d’ouverture.', '3:4', 'hero'),
      slot('home.hero.secondary', 'Image secondaire', 'Héros', 'Image haute à droite du héros.', '4:5', 'about'),
      slot('home.hero.tertiary', 'Image tertiaire', 'Héros', 'Image basse à droite du héros.', '4:5', 'agencyHistory'),
      slot('home.gallery.1', 'Mosaïque 01', 'Une maison, plusieurs regards', 'Visuel principal de la mosaïque éditoriale.', '4:5', 'about'),
      slot('home.gallery.2', 'Mosaïque 02', 'Une maison, plusieurs regards', 'Deuxième visuel de la mosaïque.', '1:1', 'agencyHistory'),
      slot('home.gallery.3', 'Mosaïque 03', 'Une maison, plusieurs regards', 'Troisième visuel de la mosaïque.', '1:1', 'fashionDayBg'),
      slot('home.gallery.4', 'Mosaïque 04', 'Une maison, plusieurs regards', 'Quatrième visuel de la mosaïque.', '16:9', 'castingBg'),
      slot('home.gallery.5', 'Mosaïque 05', 'Une maison, plusieurs regards', 'Cinquième visuel de la mosaïque.', '1:1', 'classroomBg'),
      slot('home.fashionDay.background', 'Image de fond', 'Perfect Fashion Day', 'Grande image derrière le bloc de mise en avant de la dernière édition.', '16:9', 'fashionDayBg'),
    ],
  },
  {
    id: 'agency',
    label: 'Agence',
    path: '/agence',
    description: 'Héros, image de vision et bande photographique de la page agence.',
    slots: [
      slot('agency.hero.primary', 'Image principale', 'Héros', 'Visuel principal du héros Agence.', '3:4', 'agencyHistory'),
      slot('agency.hero.secondary', 'Image secondaire', 'Héros', 'Deuxième visuel du héros Agence.', '4:5', 'hero'),
      slot('agency.hero.tertiary', 'Image tertiaire', 'Héros', 'Troisième visuel du héros Agence.', '4:5', 'about'),
      slot('agency.story.main', 'Image de vision', 'Notre vision', 'Grande photographie accompagnant le texte de présentation.', '4:5', 'agencyHistory'),
      slot('agency.gallery.1', 'Galerie 01', 'Bande visuelle', 'Premier visuel de la bande photographique.', '4:5', 'agencyHistory'),
      slot('agency.gallery.2', 'Galerie 02', 'Bande visuelle', 'Deuxième visuel de la bande photographique.', '1:1', 'about'),
      slot('agency.gallery.3', 'Galerie 03', 'Bande visuelle', 'Troisième visuel de la bande photographique.', '1:1', 'fashionDayBg'),
      slot('agency.gallery.4', 'Galerie 04', 'Bande visuelle', 'Quatrième visuel de la bande photographique.', '4:5', 'castingBg'),
    ],
  },
  {
    id: 'models',
    label: 'Mannequins',
    path: '/mannequins',
    description: 'Héros du roster. Les portraits individuels restent reliés aux fiches mannequins.',
    slots: [
      slot('models.hero.primary', 'Image principale', 'Héros', 'Visuel principal de la page des talents.', '3:4', 'hero'),
      slot('models.hero.secondary', 'Image secondaire', 'Héros', 'Deuxième visuel de la page des talents.', '4:5', 'about'),
      slot('models.hero.tertiary', 'Image tertiaire', 'Héros', 'Troisième visuel de la page des talents.', '4:5', 'agencyHistory'),
    ],
  },
  {
    id: 'services',
    label: 'Services',
    path: '/services',
    description: 'Héros et bande visuelle qui introduisent les expertises.',
    slots: [
      slot('services.hero.primary', 'Image principale', 'Héros', 'Visuel principal de la page Services.', '3:4', 'castingBg'),
      slot('services.hero.secondary', 'Image secondaire', 'Héros', 'Deuxième visuel de la page Services.', '4:5', 'fashionDayBg'),
      slot('services.hero.tertiary', 'Image tertiaire', 'Héros', 'Troisième visuel de la page Services.', '4:5', 'about'),
      slot('services.strip.1', 'Bande 01', 'Bande visuelle', 'Premier visuel de la bande des expertises.', '3:4', 'castingBg'),
      slot('services.strip.2', 'Bande 02', 'Bande visuelle', 'Deuxième visuel de la bande des expertises.', '1:1', 'about'),
      slot('services.strip.3', 'Bande 03', 'Bande visuelle', 'Troisième visuel de la bande des expertises.', '1:1', 'agencyHistory'),
      slot('services.strip.4', 'Bande 04', 'Bande visuelle', 'Quatrième visuel de la bande des expertises.', '1:1', 'classroomBg'),
      slot('services.strip.5', 'Bande 05', 'Bande visuelle', 'Cinquième visuel de la bande des expertises.', '3:4', 'fashionDayBg'),
    ],
  },
  {
    id: 'blog',
    label: 'Journal',
    path: '/blog',
    description: 'Héros du journal. Les couvertures d’articles restent liées aux publications.',
    slots: [
      slot('blog.hero.primary', 'Image principale', 'Héros', 'Visuel principal du Journal PMM.', '3:4', 'about'),
      slot('blog.hero.secondary', 'Image secondaire', 'Héros', 'Deuxième visuel du Journal.', '4:5', 'fashionDayBg'),
      slot('blog.hero.tertiary', 'Image tertiaire', 'Héros', 'Troisième visuel du Journal.', '4:5', 'hero'),
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    path: '/contact',
    description: 'Mosaïque du héros de la page Contact.',
    slots: [
      slot('contact.hero.primary', 'Image principale', 'Héros', 'Visuel principal de la page Contact.', '3:4', 'hero'),
      slot('contact.hero.secondary', 'Image secondaire', 'Héros', 'Deuxième visuel de la page Contact.', '4:5', 'about'),
      slot('contact.hero.tertiary', 'Image tertiaire', 'Héros', 'Troisième visuel de la page Contact.', '4:5', 'agencyHistory'),
    ],
  },
  {
    id: 'fashion-day',
    label: 'Perfect Fashion Day',
    path: '/fashion-day',
    description: 'Le héros peut recevoir une image globale. Sans override, la couverture de l’édition sélectionnée reste prioritaire métier.',
    slots: [
      slot('fashionDay.hero.override', 'Image de héros globale', 'Héros', 'Override facultatif du fond du héros Perfect Fashion Day. Supprimez-le pour revenir à la couverture de chaque édition.', '16:9', 'fashionDayBg'),
    ],
  },
];

export const SITE_IMAGE_SLOT_KEYS = new Set(SITE_IMAGE_PAGES.flatMap((page) => page.slots.map((item) => item.key)));

export const SITE_IMAGE_MANAGED_COLLECTIONS = [
  { label: 'Portraits et portfolios mannequins', description: 'Images rattachées aux fiches talents et utilisées dans le roster, l’accueil et les profils publics.', href: '/admin/models' },
  { label: 'Couvertures du Journal', description: 'Images de une et couvertures des articles publiés.', href: '/admin/blog' },
  { label: 'Perfect Fashion Day par édition', description: 'Couverture, galerie, stylistes et artistes de chaque édition.', href: '/admin/fashion-day-events' },
  { label: 'Médiathèque publique', description: 'Images de la galerie et bibliothèque centrale utilisée par le sélecteur de médias.', href: '/admin/media-library' },
] as const;

export function legacyFallback(images: Record<string, unknown>, legacyKey?: string) {
  if (!legacyKey) return '';
  const value = images[legacyKey];
  return typeof value === 'string' ? value.trim() : '';
}
