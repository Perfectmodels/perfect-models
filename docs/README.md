# Documentation Perfect Models Management

Cet index décrit l’architecture **actuelle** de PMM.

## État technique

- Web : Next.js App Router
- UI : React dans Next.js
- Base : Supabase PostgreSQL
- Auth : Supabase Auth + table `profiles`
- Images : ImgBB via API serveur
- Vidéos : Vercel Blob lorsque nécessaire
- Emails : Brevo
- Hébergement : Vercel

L’ancienne architecture SPA React/Vite, Firebase, React Router, `app_collections`, `legacy-pages` et les tables Legacy ne font plus partie du runtime actif.

## Documentation de référence

| Document | Objet |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture Next.js + Supabase |
| [FASHION_DAY.md](FASHION_DAY.md) | Gestion des éditions Perfect Fashion Day |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Preview Vercel et production |
| [FORMATION_MODULE.md](FORMATION_MODULE.md) | Module Formation |
| [technical/READY_TO_TEST.md](technical/READY_TO_TEST.md) | Checklist de validation |
| [technical/ROBUSTESSE_CONCURRENCE.md](technical/ROBUSTESSE_CONCURRENCE.md) | Cohérence et concurrence Supabase |
| [technical/ICONS_GENERATED.md](technical/ICONS_GENERATED.md) | Assets et icônes web/PWA |

## Documentation métier historique

Les fichiers `docs/miss5eme/` sont conservés comme spécifications métier historiques. Ils ne garantissent pas qu’une route équivalente soit active aujourd’hui et ne doivent pas servir de référence d’architecture technique.

## Principes de maintenance

1. La documentation de référence décrit uniquement l’architecture réellement présente.
2. Aucun secret, mot de passe, PIN ou token n’est écrit dans Git.
3. Les données métier utilisent les tables Supabase normalisées.
4. Les permissions sensibles sont contrôlées côté serveur.
5. Les nouveaux écrans utilisent Next.js App Router ; aucune nouvelle couche React Router/Vite ne doit être introduite.
6. Firebase ne doit pas être réintroduit comme dépendance ou datastore sans décision d’architecture explicite.
7. Toute modification de schéma Supabase doit mettre à jour les types TypeScript versionnés.
