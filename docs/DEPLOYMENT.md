# Déploiement PMM

## Principe

Perfect Models Management est déployé sur Vercel comme application **Next.js**. Les changements sont validés sur une Preview avant fusion sur `main`.

## Workflow

```text
branche de travail
      ↓
typecheck + build
      ↓
Preview Vercel
      ↓
tests fonctionnels
      ↓
main
      ↓
production
```

Branche de travail actuelle :

```text
fix/auth-transactional-email-hardening
```

## Contrôles avant production

### Build

```bash
npm install
npm run typecheck
npm run build
```

La validation TypeScript fait partie du build : `next.config.mjs` ne désactive plus les erreurs TypeScript.

### Navigation

Valider au minimum : accueil, agence, mannequins, Fashion Day, blog, galerie, contact, casting, login, espace mannequin, Classroom, forum et administration.

### Authentification Supabase

- connexion admin ;
- connexion mannequin ;
- déconnexion ;
- renouvellement de session ;
- protections serveur ;
- rôles jury, registration et manager selon les comptes disponibles.

### Supabase PostgreSQL

- lecture des données publiques ;
- CRUD admin sur les tables normalisées ;
- création/modification de profil ;
- casting et candidatures Fashion Day ;
- forum/Classroom ;
- absence d’appel à `app_collections` ou à une table Legacy ;
- absence d’exposition d’un secret serveur.

### Médias et emails

- upload ImgBB ;
- enregistrement dans `media_library` lorsque nécessaire ;
- cover et galerie Fashion Day ;
- vidéo Vercel Blob si utilisée ;
- email transactionnel Brevo et journalisation.

## Variables Preview/Production

Variables principales selon les fonctions activées :

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

Ne jamais placer la clé Supabase serveur, la clé ImgBB ou la clé Brevo dans une variable `NEXT_PUBLIC_*`.

## Configuration Vercel

Le dépôt contient `vercel.json` avec `framework: nextjs`. Le projet Vercel `perfectmodelsga` doit également être configuré avec **Framework Preset = Next.js**.

Si le tableau de bord Vercel conserve une ancienne valeur `Vite`, la corriger dans les paramètres du projet avant le build de production. Cette valeur enregistrée dans Vercel est indépendante du code Git.

## Quota de builds

En cas de `build-rate-limit` :

- ne pas multiplier les commits artificiels ;
- conserver la branche prête ;
- relancer un seul build consolidé dès que le quota est disponible ;
- contrôler les logs complets avant promotion.

## Production

Ne promouvoir en production qu’un commit dont la Preview a été construite et testée. Les migrations Supabase doivent être appliquées avant les fonctionnalités qui dépendent du nouveau schéma.
