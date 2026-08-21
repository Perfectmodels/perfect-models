# Preview PMM — Next.js + Neon

Branche de validation : `vercel-preview-production-check`.

Cette Preview sert à vérifier l’état exact de `main` sur Vercel sans toucher à la production :

- build Next.js ;
- authentification Neon ;
- lecture/écriture Neon PostgreSQL ;
- médias Vercel Blob ;
- navigation publique et admin ;
- module Perfect Fashion Day avec cover par édition ;
- spot YouTube ou vidéo Blob.

## Règle

Cette branche est réservée aux validations Vercel distantes. Elle ne doit pas devenir la branche de production.

## Déclenchement

Commit de validation ajouté le 9 août 2026 pour forcer une nouvelle Preview Vercel depuis l’état courant de `main`.

Voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) pour la checkl
