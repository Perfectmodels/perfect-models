# Checklist de validation web PMM

## 1. Installation et compilation

```bash
npm install
npm run typecheck
npm run build
```

Le build doit terminer sans erreur TypeScript ni erreur Next.js.

## 2. Pages publiques

Vérifier au minimum :

- `/`
- `/agence`
- `/mannequins`
- `/fashion-day`
- `/blog`
- `/services`
- `/galerie`
- `/casting`
- `/contact`
- `/login`

Contrôler desktop, tablette et mobile.

## 3. Authentification Supabase

Tester les rôles disponibles : admin, manager, mannequin, jury et enregistrement. Vérifier connexion, renouvellement de session, déconnexion, redirections et protections serveur.

## 4. Données Supabase

- chargement du contenu public ;
- CRUD admin sur les tables normalisées ;
- actualisation après sauvegarde ;
- casting et Fashion Day ;
- Classroom et forum ;
- absence de données sensibles dans les réponses publiques ;
- absence d’appel à `app_collections`, `/api/data` ou à une table Legacy.

## 5. Médias et emails

- upload ImgBB ;
- affichage après rechargement ;
- enregistrement médiathèque ;
- cover/galerie Fashion Day ;
- vidéo Blob lorsque nécessaire ;
- email transactionnel Brevo et journalisation.

## 6. Perfect Fashion Day

Tester au minimum : thème/date/lieu, cover, vidéo, galerie, stylistes, artistes, partenaires et changement d’édition côté public.

## 7. Preview Vercel

- Framework Preset = Next.js ;
- variables Supabase disponibles ;
- build vert ;
- logs sans erreur bloquante ;
- test réel de la Preview ;
- aucun déploiement basé sur Vite.

## 8. Critères de validation

Le lot est prêt uniquement si :

- typecheck et build sont verts ;
- les pages principales répondent ;
- Supabase Auth fonctionne ;
- les écritures Supabase fonctionnent ;
- les médias et emails fonctionnent ;
- aucune dépendance Firebase/Vite/React Router ni ancien endpoint `/api/data` n’est nécessaire au runtime.
