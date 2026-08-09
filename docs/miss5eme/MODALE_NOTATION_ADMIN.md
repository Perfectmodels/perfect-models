# Saisie / correction de notation Admin — Miss 5ème

> **Statut : spécification historique.** Toute interface admin de notation doit respecter les contrôles serveur et l’audit décrits ici.

## Objectif

Permettre à un administrateur autorisé de saisir une note manquante ou de corriger exceptionnellement une notation, sans contourner la traçabilité du concours.

## Informations à sélectionner

L’interface doit identifier explicitement :

- concours ;
- candidate ;
- juré concerné ;
- passage ;
- critères ;
- valeur de chaque critère.

Les critères et leurs maxima proviennent de la configuration active du concours.

## Saisie

L’interface peut utiliser une modale ou une page dédiée. Avant l’enregistrement :

1. vérifier que le concours existe ;
2. vérifier que la candidate appartient au concours ;
3. vérifier que le juré est affecté au concours ;
4. vérifier que le passage et les critères sont actifs ;
5. valider chaque valeur contre le barème ;
6. détecter une notation déjà existante.

## Correction d’une note existante

Une correction ne doit pas écraser silencieusement l’historique. Conserver au minimum :

```text
score_audit
- score_id
- changed_by
- old_value
- new_value
- reason
- changed_at
```

Un motif peut être rendu obligatoire pour toute modification après validation initiale.

## Permissions

Seuls les comptes disposant du rôle ou de la permission administrative adaptée peuvent accéder à cette action. Le contrôle doit être effectué côté serveur, pas uniquement par le rendu du bouton.

## Anti-doublon

L’écriture doit respecter la règle d’unicité définie par le concours. Si une note existe déjà, l’API choisit explicitement entre :

- refuser la création ;
- ouvrir le workflow de correction ;
- mettre à jour dans une transaction avec audit.

## Messages d’interface

Prévoir des états distincts :

- enregistrement en cours ;
- succès confirmé par le serveur ;
- valeur hors barème ;
- note déjà existante ;
- concours fermé ;
- accès refusé ;
- erreur serveur.

L’interface ne doit jamais afficher un succès avant confirmation de l’API.

## Sécurité

- session Neon Auth valide ;
- rôle admin vérifié ;
- aucune connexion PostgreSQL depuis le navigateur ;
- aucune donnée d’accès dans les logs UI ;
- audit obligatoire des corrections sensibles ;
- réinitialisation globale séparée de la saisie normale et protégée par confirmation forte.

Voir [MISS_5EME.md](MISS_5EME.md) pour le modèle général.
