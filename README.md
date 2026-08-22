# Perfect Models Management

Plateforme web officielle de **Perfect Models Management (PMM)** : site institutionnel, gestion de l’agence, mannequins, formations, castings, contenus éditoriaux et éditions **Perfect Fashion Day**.

> Dépôt GitHub canonique : `Perfectmodels/perfect-models`.

## Stack actuelle

- **Next.js 16** — App Router et routes API
- **React 18 + TypeScript**
- **Tailwind CSS**
- **Neon PostgreSQL** — données applicatives
- **Neon Auth** — authentification et rôles
- **ImgBB** — stockage de toutes les images via une route serveur unique
- **Vercel Blob** — fichiers vidéo uniquement
- **Vercel** — previews et production

Le runtime applicatif ne dépend plus du SDK Google Firebase. Quelques fichiers de compatibilité portant encore des noms `firebase*` peuvent subsister pendant la modernisation des anciens écrans React ; ils redirigent vers les API Next/Neon et ne constituent pas une connexion au SDK Firebase.

Les anciens projets natifs Android/iOS ne font plus partie du dépôt. PMM est aujourd’hui maintenu comme plateforme web responsive.

## Fonctionnalités principales

## Site public

- Présentation de l’agence
- Catalogue des mannequins et profils publics
- Perfect Fashion Day par édition
- Magazine et actualités
- Galerie
- Services et booking
- Casting et formulaires de candidature
- Contact et partenariats

### Espaces authentifiés

- Espace mannequin
- Formation / Classroom
- Forum
- Profils et résultats
- Espaces jury et enregistrement

### Administration

- Mannequins et accès
- Castings et candidatures
- Perfect Fashion Day
- Magazine / actualités
- Galerie et médiathèque
- Formation et progression
- Messages, bookings et demandes
- Paiements, absences et opérations internes
- Paramètres du site

## Perfect Fashion Day

Chaque édition est un contenu autonome avec :

- numéro d’édition ;
- thème, date, lieu, description ;
- **cover propre à l’édition** ;
- spot officiel via **YouTube** ou fichier vidéo **Vercel Blob** ;
- galerie ;
- stylistes/créateurs ;
- artistes ;
- mannequins vedettes ;
- partenaires ;
- promoteur et maître de cérémonie.

Les nouvelles éditions doivent avoir une cover avant leur sauvegarde. Les éditions historiques qui n’en possèdent pas encore utilisent temporairement le visuel Fashion Day global comme fallback jusqu’à leur mise à jour.

Voir [`docs/FASHION_DAY.md`](docs/FASHION_DAY.md).

## Arborescence utile

```text
src/
├── app/                    # App Router, pages et API Next.js
├── components/             # Composants partagés
│   └── admin/              # Composants d’administration
├── contexts/               # Contextes React
├── features/               # Modules métier modernisés
│   └── fashion-day/
├── hooks/                  # Store et hooks de données
├── legacy-pages/           # Écrans historiques encore migrés progressivement
├── lib/                    # Neon, auth, politiques de données
└── types.ts                # Types métier principaux

docs/                       # Documentation technique et fonctionnelle
public/                     # Assets publics
```

## Données et authentification

Les données applicatives sont servies via les routes Next `/api/data` et stockées dans Neon PostgreSQL. L’authentification utilise Neon Auth avec des profils applicatifs et des rôles PMM.

Rôles principaux :

- `admin`
- `student`
- `jury`
- `registration`
- `jury-contest`

Les secrets ne doivent jamais être ajoutés au dépôt ni exposés dans des variables `NEXT_PUBLIC_*`.

## Médias

Toutes les nouvelles images sont téléversées vers ImgBB par la route serveur `/api/media/imgbb`.

- La clé `IMGBB_API_KEY` reste exclusivement côté serveur.
- Les anciens noms préfixés `VITE_` ne sont plus acceptés et restent explicitement exclus du bundle client.
- Casting public : upload ImgBB limité au scope `casting`, sans accès à la médiathèque.
- Images administratives et profils : upload ImgBB avec contrôle du rôle côté serveur.
- Spots Fashion Day : YouTube ou upload Blob client authentifié.
- L’ancienne route Blob image est conservée en lecture seule pour ne pas casser les médias historiques.
- Les gros fichiers vidéo sont téléversés directement du navigateur vers Blob afin d’éviter le transit par une Function Next.js.

## Développement

Prérequis : **Node.js 20.9+**.

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

## Variables d’environnement

Créer `.env.local` à partir de la configuration d’environnement du projet. Les valeurs réelles restent dans les environnements sécurisés Vercel/Neon.

Variables serveur principales :

```text
DATABASE_URL
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
BLOB_READ_WRITE_TOKEN
IMGBB_API_KEY
```

D’autres variables peuvent exister pour des services métier encore utilisés par certains modules. Ne jamais documenter leur valeur réelle.

## Déploiement

Politique PMM :

1. travailler sur une branche dédiée ;
2. obtenir une Preview Vercel ;
3. valider navigation, authentification, données et médias ;
4. ne fusionner/publier sur `main` qu’après validation ;
5. limiter les déploiements inutiles afin de préserver le quota de builds.

Branche de validation actuelle : `preview/neon-next-migration`.

Voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Documentation

- [`docs/README.md`](docs/README.md) — index
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — architecture actuelle
- [`docs/FASHION_DAY.md`](docs/FASHION_DAY.md) — module Perfect Fashion Day
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — previews et production
- [`docs/FORMATION_MODULE.md`](docs/FORMATION_MODULE.md) — module Formation
- [`docs/technical/READY_TO_TEST.md`](docs/technical/READY_TO_TEST.md) — checklist de validation web
- [`docs/technical/ROBUSTESSE_CONCURRENCE.md`](docs/technical/ROBUSTESSE_CONCURRENCE.md) — cohérence et concurrence avec Neon

Les documents `docs/miss5eme/` sont conservés comme spécifications métier historiques. Ils ne doivent pas être considérés comme preuve qu’une route ou un concours est actuellement actif.

## Règles de sécurité

- Aucun mot de passe, PIN ou secret en clair dans la documentation ou les collections applicatives.
- Aucun token Blob, secret Neon ou clé API dans Git.
- Les routes d’upload sensibles vérifient le rôle côté serveur.
- Les données privées ne doivent jamais être rendues publiques par une route de contenu.
- Une ancienne source de données ne doit pas être supprimée avant export, migration et contrôle d’intégrité.

---

**Perfect Models Management — Libreville, Gabon**
