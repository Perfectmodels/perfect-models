# Module Perfect Fashion Day

## Objectif

Le module permet d’administrer et d’afficher plusieurs éditions de Perfect Fashion Day sans mélanger leurs contenus. Une édition est autonome : sa cover, son spot, sa galerie, ses participants et ses partenaires lui appartiennent exclusivement.

## Données d’une édition

Une édition contient notamment :

```ts
{
  edition: number;
  date: string;
  theme: string;
  description: string;
  location?: string;
  mc?: string;
  promoter?: string;
  coverImageUrl?: string;
  announcementVideoEmbedUrl?: string;
  announcementVideoUrl?: string;
  galleryImages?: string[];
  stylists?: Stylist[];
  artists?: Artist[];
  featuredModels?: string[];
  partners?: { type: string; name: string }[];
}
```

`coverImageUrl` est le visuel principal propre à l’édition.

## Création d’une édition

Depuis `/admin/fashion-day-events` :

1. cliquer sur **Nouvelle édition** ;
2. renseigner thème et date ;
3. téléverser la cover de l’édition ;
4. compléter lieu, description, MC et promoteur ;
5. choisir le mode du spot vidéo ;
6. ajouter galerie, stylistes, artistes, mannequins et partenaires ;
7. sauvegarder.

La nouvelle édition ne peut pas être enregistrée sans cover.

## Covers

Chaque édition utilise le chemin Blob logique :

```text
pmm/fashion-day/editions/{edition}/cover/
```

Sur la page publique, l’ordre de priorité du hero est :

1. `coverImageUrl` de l’édition ;
2. première image de galerie pour une ancienne édition ;
3. ancienne photo de styliste disponible ;
4. image Fashion Day globale du site.

Ce fallback permet de conserver l’affichage des éditions historiques en attendant l’ajout de leurs covers dédiées.

## Spot vidéo

Deux modes sont disponibles.

### YouTube

Le champ `announcementVideoEmbedUrl` reçoit un lien YouTube. La page publique accepte les formats courants :

- `youtube.com/watch?v=...`
- `youtu.be/...`
- `youtube.com/shorts/...`
- `youtube.com/embed/...`
- `youtube.com/live/...`

Le lecteur public utilise l’intégration YouTube.

### Fichier Vercel Blob

Le champ `announcementVideoUrl` reçoit l’URL obtenue après téléversement direct vers Blob.

Formats acceptés :

- MP4
- WebM
- MOV / QuickTime

Taille applicative maximale : **1 Go**.

Au-delà de 100 Mo, le composant utilise le mode multipart pour rendre le transfert plus robuste.

Le token d’upload est délivré uniquement à un compte ayant le rôle `admin` et uniquement pour un scope `fashion-day/*`.

## Galerie et participants

Les galeries d’édition sont stockées sous :

```text
pmm/fashion-day/editions/{edition}/gallery/
```

Les photos de stylistes et artistes utilisent des sous-scopes dédiés à l’édition. Les URLs sont ensuite sauvegardées dans les données de l’édition.

## Page publique

`/fashion-day` :

- sélectionne par défaut l’édition la plus récente ;
- affiche la cover propre à l’édition ;
- propose un sélecteur visuel avec les covers des autres éditions ;
- affiche les informations, spot, galerie, créateurs, artistes, mannequins et partenaires de l’édition sélectionnée ;
- affiche les appels à candidature/partenariat pour une édition future.

Changer d’édition ne mélange jamais les médias de deux éditions.

## Sécurité

- La page admin vérifie le rôle côté serveur.
- L’API de génération du token Blob vérifie de nouveau le rôle admin.
- Les types et tailles de fichiers sont contrôlés côté client et côté serveur.
- Le token permanent Blob n’est jamais envoyé au navigateur.
- Les données sauvegardées ne contiennent que les URLs finales des médias.

## Migration des anciennes éditions

Après mise en ligne du module :

1. ouvrir chaque ancienne édition dans l’administration ;
2. ajouter sa cover officielle ;
3. vérifier son spot vidéo ;
4. sauvegarder ;
5. contrôler le rendu public sur desktop et mobile.
