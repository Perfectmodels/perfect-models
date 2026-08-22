# Déploiement PMM

## Principe

Le site Perfect Models Management utilise Vercel. Les changements doivent être validés sur une branche Preview avant toute publication sur `main`.

## Workflow recommandé

```text
branche de travail
      ↓
commit groupé
      ↓
Preview Vercel
      ↓
validation fonctionnelle
      ↓
main
      ↓
production
```

## Branche de validation actuelle

```text
preview/neon-next-migration
```

Cette branche sert à valider la migration Next.js + Neon ainsi que les nouveaux modules avant bascule définitive.

## Contrôles avant production

### Build

- `npm install`
- `npm run typecheck`
- `npm run build`

### Navigation

- accueil ;
- agence ;
- mannequins ;
- Fashion Day ;
- magazine ;
- contact ;
- login ;
- espace mannequin ;
- administration.

### Authentification

- connexion admin ;
- connexion mannequin ;
- déconnexion ;
- protections de routes ;
- permissions jury/staff selon les comptes de test.

### Neon

- lecture des données publiques ;
- écriture admin ;
- modification d’un profil ;
- vérification qu’aucun secret n’est exposé dans les réponses publiques.

### ImgBB et Vercel Blob

- upload ImgBB d’une image ;
- affichage de l’URL ImgBB après rechargement ;
- upload ImgBB d’une cover Fashion Day ;
- upload petit spot vidéo ;
- upload multipart d’une vidéo volumineuse si nécessaire ;
- lecture du média depuis la Preview.

### Perfect Fashion Day

- création d’une édition avec cover ;
- édition d’une ancienne édition ;
- YouTube ;
- vidéo Blob ;
- galerie ;
- rendu responsive ;
- changement d’édition et changement de cover.

## Variables d’environnement Preview

La Preview doit disposer des variables serveur nécessaires, notamment :

```text
DATABASE_URL
NEON_AUTH_BASE_URL
NEON_AUTH_COOKIE_SECRET
BLOB_READ_WRITE_TOKEN
IMGBB_API_KEY
```

Ne jamais copier leurs valeurs dans Git ou dans un document Markdown.

## Économie des builds

Pour limiter les builds inutiles :

1. préparer plusieurs changements sur une même branche ;
2. les regrouper dans un commit cohérent lorsque possible ;
3. éviter les commits uniquement destinés à relancer Vercel tant que le quota est bloqué ;
4. ne pousser sur `main` qu’après validation.

## Incident `build-rate-limit`

Si Vercel refuse un build à cause de la limite de builds :

- ne pas multiplier les commits de relance ;
- conserver la branche Preview prête ;
- attendre la réouverture du quota ;
- vérifier ensuite le premier build complet et ses logs.

## Production

La production ne doit être modifiée qu’après validation explicite du lot sur Preview. Une migration de données historique doit être contrôlée avant suppression de sa source d’origine.
