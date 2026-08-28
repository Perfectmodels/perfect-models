# Perfect Models Management

Plateforme web officielle de **Perfect Models Management (PMM)** : site institutionnel, gestion de l’agence, mannequins, formations, castings, contenus éditoriaux et éditions **Perfect Fashion Day**.

> Dépôt canonique : `Perfectmodels/perfect-models`.

## Stack actuelle

- **Next.js 16** — App Router, Server Components et Route Handlers
- **React + TypeScript** — couche UI de Next.js
- **Tailwind CSS**
- **Supabase PostgreSQL** — source de vérité des données métier
- **Supabase Auth** — authentification et sessions
- **ImgBB** — stockage des nouvelles images via API serveur
- **Vercel Blob** — médias vidéo lorsque nécessaire
- **Brevo** — emails transactionnels
- **Vercel** — Preview et production

Il n’existe plus de runtime Firebase, de React Router, de datastore `app_collections`, de pages `legacy-pages` ni de configuration Vite dans l’application active.

## Architecture

```text
Navigateur
   │
   ├── Next.js App Router (`src/app`)
   ├── composants React (`src/components`, `src/features`)
   │
   └── Route Handlers Next.js
          │
          ├── Supabase Auth
          ├── Supabase PostgreSQL
          ├── ImgBB
          ├── Vercel Blob
          └── Brevo
```

Les pages publiques lisent les tables Supabase normalisées. Les opérations administratives utilisent des routes serveur dédiées et le registre de ressources `src/lib/resource-registry.ts`.

## Données principales

La base est relationnelle et normalisée. Exemples :

- `models`, `model_portfolio_images`
- `casting_applications`, `casting_scores`
- `fashion_day_events`, `fashion_day_applications`, `fashion_day_reservations`
- `services`, `blog_posts`, `media_library`
- `courses`, `course_progress`
- `forum_threads`, `forum_replies`
- `booking_requests`, `contact_messages`, `messages`, `notifications`
- `profiles`, `admin_permissions`
- `site_settings`, `content_blocks`, `navigation_items`, `social_links`

Les anciennes tables globales et tables de migration Legacy ont été supprimées après migration des données utiles.

## Authentification et rôles

Supabase Auth gère les sessions. La table `profiles` porte les informations applicatives et les rôles PMM.

Rôles utilisés selon les modules :

- `admin`
- `manager`
- `student`
- `jury`
- `registration`
- `jury-contest`

Toute action sensible doit être vérifiée côté serveur ; masquer un bouton côté client n’est jamais considéré comme une autorisation.

## Fonctionnalités

### Site public

- Agence
- Mannequins et profils publics
- Perfect Fashion Day
- Magazine / actualités
- Galerie
- Services et booking
- Casting
- Contact

### Espaces authentifiés

- Espace mannequin
- Classroom / formation
- Forum
- Jury casting
- Enregistrement casting
- Espace manager
- Administration

### Administration

Le back-office travaille directement avec les tables Supabase normalisées : mannequins, casting, Fashion Day, magazine, médias, mailing, messages, formations, paiements, absences, paramètres, permissions et autres ressources métier.

## Médias

Les nouvelles images passent par la route serveur ImgBB. La médiathèque est enregistrée dans `media_library`.

- Aucun secret ImgBB n’est exposé au navigateur.
- Aucun préfixe `VITE_*` n’est utilisé.
- Les vidéos peuvent utiliser Vercel Blob.
- Les médias historiques externes restent lisibles par leur URL, sans imposer un ancien provider au runtime.

## Développement

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

Le développement et le build utilisent exclusivement Next.js. Le projet ne possède plus de `vite.config`, `index.html`, `src/main.tsx` ou point d’entrée SPA Vite.

## Variables d’environnement

Voir `.env.example`. Les groupes principaux sont :

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
IMGBB_API_KEY
BLOB_READ_WRITE_TOKEN
BREVO_API_KEY
```

Aucune clé secrète ne doit être placée dans une variable `NEXT_PUBLIC_*`.

## Déploiement

- Projet Vercel : `perfectmodelsga`
- Framework attendu : **Next.js**
- Branche de travail actuelle : `fix/auth-transactional-email-hardening`
- `vercel.json` déclare `framework: nextjs`

Avant fusion sur `main` :

1. `npm run typecheck` ;
2. `npm run build` ;
3. Preview Vercel ;
4. tests navigation/auth/données/médias ;
5. validation des contrôles CI et revue ;
6. fusion et production.

Voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/FASHION_DAY.md`](docs/FASHION_DAY.md)
- [`docs/FORMATION_MODULE.md`](docs/FORMATION_MODULE.md)
- [`docs/technical/READY_TO_TEST.md`](docs/technical/READY_TO_TEST.md)
- [`docs/technical/ROBUSTESSE_CONCURRENCE.md`](docs/technical/ROBUSTESSE_CONCURRENCE.md)

Les documents sous `docs/miss5eme/` sont des spécifications métier historiques et ne décrivent pas nécessairement une route active.

---

**Perfect Models Management — Libreville, Gabon**
