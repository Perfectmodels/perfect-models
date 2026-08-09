# Architecture de la plateforme PMM

## Vue d’ensemble

Perfect Models Management est une application web Next.js. Le navigateur consomme les pages React et les routes applicatives Next.js ; les données et l’authentification sont centralisées côté serveur.

```text
Navigateur
   │
   ├── Pages Next.js / React
   │
   ├── /api/auth/* ──────────────> Neon Auth
   │
   ├── /api/data/* ──────────────> Neon PostgreSQL
   │
   └── /api/media/* ─────────────> Vercel Blob
```

## Frontend

- Next.js App Router dans `src/app/`.
- Composants partagés dans `src/components/`.
- Nouveaux modules métier dans `src/features/`.
- Certains anciens écrans sont encore dans `src/legacy-pages/` pendant leur modernisation progressive.
- `src/compat/` permet de maintenir temporairement des signatures héritées sans charger le SDK Firebase.

## Données

### Neon PostgreSQL

La couche serveur utilise `@neondatabase/serverless`. Les données de contenu historique sont notamment exposées sous forme de collections JSONB dans `app_collections`, tandis que les informations d’authentification sont séparées des données métier.

L’accès frontend ne doit pas utiliser directement une chaîne de connexion PostgreSQL. Les opérations passent par :

- `GET /api/data`
- `PUT /api/data`
- routes ciblées sous `/api/data/[...path]`

Les politiques d’accès sont définies côté serveur selon les collections et les rôles.

## Authentification

Neon Auth fournit la session. La plateforme associe ensuite l’utilisateur à `auth_profiles` afin de déterminer :

- rôle applicatif ;
- identifiant PMM ;
- profil métier ;
- statut du compte ;
- permissions spécifiques.

Rôles : `admin`, `student`, `jury`, `registration`, `jury-contest`.

Une page d’administration sensible ne doit pas se contenter de masquer les boutons côté navigateur : la route ou l’API doit vérifier le rôle côté serveur.

## Médias

### Images

Les images publiques sont stockées dans Vercel Blob. Selon le module, elles peuvent être téléversées via une route serveur pour les petits fichiers ou via un client upload.

### Vidéos

Les spots Perfect Fashion Day utilisent un **client upload Blob** : le serveur autorise l’opération et génère un token temporaire, puis le navigateur envoie directement le fichier vers Blob.

Avantages :

- les vidéos ne traversent pas le corps d’une Vercel Function ;
- progression d’upload disponible ;
- multipart pour les fichiers volumineux ;
- contrôle du type, de la taille, du scope et du rôle admin avant émission du token.

## Perfect Fashion Day

Le module modernisé est isolé dans :

```text
src/features/fashion-day/
├── AdminFashionDayEventsPage.tsx
└── FashionDayPage.tsx
```

La page admin `/admin/fashion-day-events` vérifie le rôle admin côté serveur. La page publique `/fashion-day` sélectionne une édition et utilise en priorité sa `coverImageUrl`.

## Secrets

Variables sensibles typiques :

- `DATABASE_URL`
- `NEON_AUTH_COOKIE_SECRET`
- `BLOB_READ_WRITE_TOKEN`

Elles restent exclusivement dans l’environnement serveur. Aucun secret ne doit être ajouté au Git, au README, à un composant client ou à une variable publique.

## Compatibilité historique

Le dépôt peut encore contenir des fichiers dont le nom fait référence à Firebase ou ImgBB. Ces noms sont conservés temporairement pour éviter une réécriture brutale de tous les imports historiques. La documentation de référence doit distinguer le **nom de compatibilité** du **service réellement utilisé**.

La suppression d’une ancienne source de données externe ne doit intervenir qu’après export, migration et vérification d’intégrité.

## Déploiement

- Développement sur branche.
- Preview Vercel pour validation.
- `main` réservé au lot validé.
- Production uniquement après contrôle fonctionnel.

Voir [DEPLOYMENT.md](DEPLOYMENT.md).
