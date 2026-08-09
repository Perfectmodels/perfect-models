# Preview PMM — Next.js + Neon

Branche de validation : `preview/neon-next-migration`.

Cette Preview doit permettre de vérifier le site PMM avant toute nouvelle publication sur `main` :

- build Next.js ;
- authentification Neon ;
- lecture/écriture Neon PostgreSQL ;
- médias Vercel Blob ;
- navigation publique et admin ;
- module Perfect Fashion Day avec cover par édition ;
- spot YouTube ou vidéo Blob.

## Règle

Ne pas utiliser cette branche comme production. Les changements ne sont fusionnés vers `main` qu’après validation fonctionnelle.

## État de déploiement

Si Vercel renvoie `build-rate-limit`, conserver la branche sans multiplier les commits de relance. Le prochain build autorisé devra servir de build de validation complet.

Voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) pour la checklist.
