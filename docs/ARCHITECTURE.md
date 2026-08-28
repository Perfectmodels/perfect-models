# Architecture de la plateforme PMM

## Vue d’ensemble

Perfect Models Management est une application **Next.js App Router**. Le navigateur utilise l’interface React fournie par Next.js ; les opérations sensibles passent par des Server Components ou des Route Handlers Next.js.

```text
Navigateur
   │
   ├── Pages Next.js / React
   │
   └── Route Handlers Next.js
          │
          ├── Supabase Auth
          ├── Supabase PostgreSQL
          ├── ImgBB
          ├── Vercel Blob
          └── Brevo
```

Il n’existe plus de couche React Router, Vite, Firebase SDK, `DataContext`, `useRealtimeDB`, `app_collections` ou `legacy-pages` dans l’architecture active.

## Frontend

- `src/app/` : App Router, layouts, pages, Route Handlers.
- `src/components/` : composants partagés.
- `src/features/` : modules métier.
- `src/hooks/` : hooks React propres à l’application Next.js.
- `src/lib/` : Supabase, authentification, contenu public, permissions et ressources métier.

Next.js reste basé sur React : la présence de `react` et `react-dom` est donc normale et nécessaire. Ce qui a été supprimé est l’ancienne architecture SPA React/Vite et son routage client autonome.

## Données

### Supabase PostgreSQL

Supabase PostgreSQL est la source de vérité. Les données sont stockées dans des tables métier normalisées, notamment :

- `models`, `model_portfolio_images` ;
- `casting_applications`, `casting_scores` ;
- `fashion_day_events`, `fashion_day_applications`, `fashion_day_reservations` ;
- `services`, `blog_posts`, `media_library` ;
- `courses`, `course_progress` ;
- `forum_threads`, `forum_replies` ;
- `messages`, `notifications`, `booking_requests`, `contact_messages` ;
- `profiles`, `admin_permissions` ;
- `site_settings`, `content_blocks`, `navigation_items`, `social_links`.

Les anciennes collections JSON globales et tables de migration ont été supprimées. Les identifiants `legacy_*`/Firebase de migration ont également été retirés du schéma après vérification de leurs dépendances.

### Accès serveur

Les pages publiques utilisent les lecteurs dans `src/lib/public-content.ts` et `src/lib/public-app-state.ts`.

Le back-office utilise les Route Handlers sous `/api/admin/resources/[resource]` et le registre `src/lib/resource-registry.ts`. Les formulaires publics utilisent des endpoints métier dédiés.

## Authentification

Supabase Auth gère les sessions. La table `profiles` apporte le rôle et le contexte métier.

Schéma de contrôle :

```text
session Supabase Auth
      ↓
profil PMM actif (`profiles`)
      ↓
vérification du rôle/permission côté serveur
      ↓
opération Supabase autorisée
```

Les rôles principaux sont `admin`, `manager`, `student`, `jury`, `registration` et `jury-contest` selon les modules.

## Médias

### Images

Les nouveaux uploads d’images passent par l’API serveur ImgBB. Les références sont enregistrées dans les tables métier ou `media_library`.

Aucune variable `VITE_*`, clé Firebase ou clé secrète ImgBB ne doit être exposée au navigateur.

### Vidéos

Les vidéos volumineuses peuvent utiliser Vercel Blob avec autorisation serveur et upload client contrôlé.

## Notifications et messagerie

Les notifications navigateur utilisent l’API Web Notification lorsque disponible. Les données de candidatures sont lues depuis les ressources Supabase normalisées ; aucun Firebase Cloud Messaging n’est requis pour le fonctionnement web actuel.

Les emails transactionnels utilisent Brevo et sont journalisés dans `email_delivery_log`.

## Configuration Next.js

`next.config.mjs` ne contient plus de webpack aliases vers Firebase/React Router, de `DefinePlugin(import.meta.env)` ni de désactivation de la validation TypeScript.

`vercel.json` déclare :

```json
{
  "framework": "nextjs"
}
```

## Secrets

Variables sensibles typiques :

- `SUPABASE_SECRET_KEY`
- `IMGBB_API_KEY`
- `BLOB_READ_WRITE_TOKEN`
- `BREVO_API_KEY`

Elles restent côté serveur.

## Déploiement

Le projet Vercel attendu est `perfectmodelsga`, framework Next.js. Toute Preview doit valider : build, authentification, données Supabase, médias et routes sensibles avant promotion en production.

Voir [DEPLOYMENT.md](DEPLOYMENT.md).
