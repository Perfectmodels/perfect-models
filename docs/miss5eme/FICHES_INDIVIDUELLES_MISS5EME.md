# Fiches individuelles Miss 5ème — Spécification métier

> **Statut : historique / à réactiver avec l’architecture actuelle.**

## Objectif

La fiche individuelle permet à l’administration d’analyser les résultats d’une candidate sans perdre le détail des évaluations.

## Informations à afficher

Pour chaque candidate :

- numéro ;
- nom ;
- photo si disponible ;
- statut ;
- passages prévus ;
- jurés ayant validé leur notation ;
- notes par critère ;
- total ou moyenne par passage ;
- note finale ;
- notes manquantes ;
- éventuelles corrections administratives.

## Tableau recommandé

Le tableau détaillé doit être généré à partir de la configuration réelle du concours et non de quatre critères ou d’un nombre fixe de jurés codés en dur.

Structure conceptuelle :

```text
Passage
├── Juré A
│   ├── Critère 1
│   ├── Critère 2
│   └── Total
├── Juré B
│   ├── Critère 1
│   ├── Critère 2
│   └── Total
└── Moyenne du passage
```

## Calcul

Les calculs doivent être réalisés côté serveur ou à partir de données validées par le serveur :

- ignorer les brouillons non validés lorsque la règle du concours l’exige ;
- afficher clairement le nombre de jurés pris en compte ;
- éviter de présenter une moyenne définitive si des notes obligatoires manquent ;
- appliquer les poids des critères et passages configurés ;
- conserver la précision interne et arrondir seulement pour l’affichage.

## Administration

L’administrateur peut consulter une fiche détaillée et, si le règlement le permet, corriger une note exceptionnelle. Toute correction doit conserver :

- auteur de la correction ;
- date ;
- ancienne valeur ;
- nouvelle valeur ;
- motif.

## Sécurité

- accès réservé aux rôles autorisés ;
- aucune information d’authentification affichée ;
- aucune écriture directe depuis le navigateur vers PostgreSQL ;
- les résultats non publiés restent privés ;
- une fiche ne doit pas permettre de modifier l’identité d’un juré.

## Référence

Voir [MISS_5EME.md](MISS_5EME.md) pour le modèle métier général.
