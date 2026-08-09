# Perfect Models Management

Site officiel et plateforme de gestion de Perfect Models Management, désormais architecturés avec **Next.js App Router**, React, TypeScript et Tailwind CSS.

## Architecture

- `src/app/` : routage Next.js, metadata, handlers serveur et shell applicatif.
- `src/legacy-pages/` : écrans métier React conservés pendant la modernisation progressive.
- `src/components/` : composants partagés et interfaces d'administration.
- `src/contexts/` et `src/hooks/` : état applicatif et accès aux données.
- `public/` : ressources statiques et PWA.
- `android/` / `ios/` : sources Capacitor conservées séparément du build web Next.js.

## Commandes

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

Node.js 20.9+ est requis.

## Variables d'environnement

Copier `.env.example` vers `.env.local`. Les secrets serveur ne doivent jamais utiliser le préfixe `NEXT_PUBLIC_`.

La compatibilité `VITE_*` restante est transitoire et doit disparaître au terme de la migration Firebase → Neon PostgreSQL.

## Déploiement

Le projet est prévu pour Vercel avec détection native Next.js. Les mises en production doivent être déclenchées uniquement après validation du lot complet de modifications.
