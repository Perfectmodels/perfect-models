# Checklist de validation web PMM

Ce document remplace l’ancien guide de test Android/Capacitor. Les projets natifs Android/iOS ne font plus partie de l’architecture active.

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
- `/magazine`
- `/services`
- `/galerie`
- `/casting`
- `/contact`
- `/login`

Contrôler desktop, tablette et mobile.

## 3. Authentification

Tester avec des comptes prévus à cet effet :

- admin ;
- mannequin ;
- jury ;
- staff enregistrement si nécessaire.

Vérifier les redirections et l’interdiction d’accès aux pages d’administration pour les rôles non autorisés.

## 4. Données Neon

- chargement du contenu public ;
- sauvegarde d’un changement admin ;
- actualisation de la page après sauvegarde ;
- absence de données sensibles dans les réponses publiques ;
- absence de mot de passe en clair dans les collections applicatives.

## 5. Médias Vercel Blob

- upload d’une image ;
- affichage après rechargement ;
- upload d’une cover Fashion Day ;
- upload d’un spot vidéo ;
- progression d’upload ;
- lecture vidéo ;
- test multipart si une vidéo de plus de 100 Mo doit être utilisée.

## 6. Perfect Fashion Day

Créer une édition de test et vérifier :

- impossibilité de sauvegarder sans cover ;
- cover propre à l’édition ;
- thème/date/lieu ;
- spot YouTube ;
- spot fichier Blob ;
- galerie ;
- stylistes ;
- artistes ;
- mannequins vedettes ;
- partenaires ;
- changement d’édition sur la page publique ;
- changement simultané de cover et de contenu.

Supprimer l’édition de test après validation.

## 7. Preview Vercel

Avant production :

- vérifier le statut du déploiement ;
- lire les logs de build en cas d’échec ;
- tester la Preview réelle ;
- contrôler les variables d’environnement Preview ;
- ne pas pousser vers `main` tant que la validation n’est pas complète.

## 8. Critères de validation

Le lot est prêt pour production uniquement si :

- le build est vert ;
- les principales pages répondent ;
- l’authentification fonctionne ;
- les écritures Neon fonctionnent ;
- les médias Blob fonctionnent ;
- le module Fashion Day fonctionne de bout en bout ;
- aucune régression bloquante n’est constatée.
