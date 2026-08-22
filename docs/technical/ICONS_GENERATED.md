# Assets et icônes web PMM

Ce document remplace l’ancien inventaire d’icônes Android/Capacitor. Les projets natifs Android/iOS ont été retirés du dépôt.

## Référence actuelle

Les assets du site sont servis depuis `public/` et utilisés par Next.js pour :

- logo de navigation ;
- favicon ;
- icônes web/PWA lorsqu’elles sont présentes ;
- images statiques de fallback ;
- Open Graph / partage social selon les pages.

## Règles

- Conserver les logos officiels dans une qualité suffisante.
- Éviter d’ajouter plusieurs copies identiques sous des noms différents.
- Préférer WEBP/AVIF pour les visuels web lorsque le workflow le permet.
- Les images administrables (covers, galeries, profils) doivent être stockées dans ImgBB via `/api/media/imgbb` et non ajoutées manuellement dans `public/`.
- Les fichiers vidéo administrables restent stockés dans Vercel Blob.
- Ne pas réintroduire `resources/`, `android/`, `ios/` ou des commandes Capacitor dans la documentation web actuelle.

## Covers et médias dynamiques

Perfect Fashion Day utilise des scopes ImgBB pour les images et Vercel Blob pour les spots vidéo :

```text
ImgBB: fashion-day/editions/{edition}/cover
ImgBB: fashion-day/editions/{edition}/gallery
Blob:  pmm/fashion-day/editions/{edition}/spot/
```

Ces fichiers ne sont pas versionnés dans Git.

## Vérification

Après modification des assets statiques :

```bash
npm run typecheck
npm run build
```

Puis contrôler la Preview Vercel sur desktop et mobile.
