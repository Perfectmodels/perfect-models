# Miss 5ème — Résumé du module

> **Statut : spécification métier historique.** Le concours n’est pas considéré actif tant que ses routes, données et comptes n’ont pas été explicitement validés dans la version déployée.

## Finalité

Le module de concours doit permettre de gérer de manière fiable :

- candidates ;
- jurés ;
- passages ;
- critères ;
- notes ;
- fiches individuelles ;
- classement ;
- publication contrôlée des résultats.

## Architecture de référence

```text
Neon Auth
   ↓
auth_profiles / affectation jury
   ↓
API Next.js
   ↓
Neon PostgreSQL
```

Les photos éventuelles sont stockées dans Vercel Blob.

## Authentification

Chaque juré utilise un compte individuel. Aucun PIN partagé, mot de passe ou secret ne doit être stocké dans la documentation, dans les collections métier ou dans le code client.

## Notation

Les critères, maxima, poids et passages doivent provenir de la configuration du concours. La documentation ne fixe plus de barème historique susceptible de contredire l’interface ou le règlement réel.

## Classement

Le classement est produit à partir des fiches validées. Avant publication :

- vérifier les notes manquantes ;
- contrôler les égalités ;
- appliquer les poids ;
- confirmer les corrections administratives ;
- figer la version officielle des résultats.

## Sécurité

- session serveur ;
- rôles vérifiés côté API ;
- contrôle anti-doublon ;
- audit des corrections ;
- résultats privés par défaut ;
- aucune donnée d’accès dans Git.

## Documentation associée

- [MISS_5EME.md](MISS_5EME.md) — spécification complète
- [CONNEXION_JURY_MISS5EME.md](CONNEXION_JURY_MISS5EME.md) — authentification jury
- [FICHES_INDIVIDUELLES_MISS5EME.md](FICHES_INDIVIDUELLES_MISS5EME.md) — fiches candidates
- [MODALE_NOTATION_ADMIN.md](MODALE_NOTATION_ADMIN.md) — saisie/correction admin
- [MISS_5EME_GUIDE_RAPIDE.md](MISS_5EME_GUIDE_RAPIDE.md) — procédure courte
