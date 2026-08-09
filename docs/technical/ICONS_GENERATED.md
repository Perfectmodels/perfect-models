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
- Les médias administrables (covers, galeries, spots) doivent être stockés dans Vercel Blob et non ajoutés manuellement dans `public/`.
- Ne pas réintroduire `resources/`, `android/`, `ios/` ou des commandes Capacitor dans la documentation web actuelle.

## Covers et médias dynamiques

Perfect Fashion Day utilise Vercel Blob :

```text
pmm/fashion-day/editions/{edition}/cover/
pmm/fashion-day/editions/{edition}/gallery/
pmm/fashion-day/editions/{edition}/spot/
```

Ces fichiers ne sont pas versionnés dans Git.

## Vérification

Après modification des assets statiques :

```bash
npm run typecheck
npm run build
```

Puis contrôler la Preview Vercel sur desktop et mobile.
