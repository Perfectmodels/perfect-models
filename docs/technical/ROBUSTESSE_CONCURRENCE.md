# Robustesse et concurrence — architecture Neon

Ce document remplace les anciennes recommandations basées sur Firebase Realtime Database.

## Objectif

Garantir que plusieurs utilisateurs puissent lire ou modifier des données PMM sans écrasement silencieux, doublons métier ni exposition de données sensibles.

## Principes

### 1. Validation côté serveur

Les contrôles critiques doivent être appliqués dans les routes API et pas uniquement dans l’interface :

- session active ;
- rôle autorisé ;
- ownership pour un mannequin ;
- collection autorisée ;
- structure des données ;
- taille et type des médias.

### 2. Identifiants stables

Toute ressource qui peut être modifiée individuellement doit avoir un identifiant stable. Les index visuels d’un tableau ne doivent pas devenir des identifiants métier durables.

### 3. Unicité métier

Pour les concours, votes, notes ou inscriptions, les règles d’unicité importantes doivent être garanties par la base lorsque le schéma relationnel le permet, par exemple avec une contrainte unique sur une combinaison logique.

Exemple conceptuel :

```sql
UNIQUE (contest_id, jury_id, candidate_id, round_id)
```

### 4. Transactions

Les opérations qui modifient plusieurs lignes dépendantes doivent être regroupées dans une transaction PostgreSQL lorsque l’atomicité est nécessaire.

### 5. Éviter les lectures-modifications-écritures globales

Le store de compatibilité peut encore sauvegarder certaines collections complètes. Les nouveaux modules doivent privilégier progressivement les routes ciblées (`POST`, `PATCH`, `DELETE`) pour réduire le risque de conflit et la quantité de données transférées.

### 6. Gestion des erreurs

Une écriture distante doit :

1. attendre la réponse du serveur ;
2. traiter les statuts non 2xx ;
3. afficher une information claire ;
4. éviter d’annoncer un succès avant confirmation ;
5. permettre un nouvel essai lorsque l’opération est idempotente.

## Authentification et rôles

Neon Auth gère la session. `auth_profiles` ajoute le rôle et les permissions métier.

Pour une route sensible :

```text
session Neon Auth
      ↓
profil applicatif actif
      ↓
vérification du rôle
      ↓
opération autorisée
```

Une vérification frontend n’est jamais considérée comme une barrière de sécurité suffisante.

## Uploads concurrents

Les fichiers Vercel Blob utilisent des noms suffixés aléatoirement afin de réduire les collisions. Pour les gros fichiers, le multipart permet de reprendre les parties échouées sans recommencer nécessairement tout le transfert.

Le fichier n’est associé à une édition Fashion Day qu’après obtention de son URL finale et sauvegarde de l’édition.

## Perfect Fashion Day

Les éditions sont distinguées par leur numéro. Une cover, une galerie ou un spot doit toujours être sauvegardé dans l’objet de l’édition correspondante.

Scopes médias :

```text
fashion-day/editions/{edition}/cover
fashion-day/editions/{edition}/spot
fashion-day/editions/{edition}/gallery
fashion-day/editions/{edition}/stylists
fashion-day/editions/{edition}/artists
```

Cette séparation évite le mélange logique des médias entre deux éditions.

## Données sensibles

- aucun mot de passe en clair ;
- aucun token Blob dans le frontend ;
- aucune chaîne `DATABASE_URL` dans le navigateur ;
- aucune clé privée dans `app_collections` ;
- les collections privées restent filtrées par les politiques serveur.

## Contrôle avant production

Tester au minimum :

- deux sessions différentes ;
- sauvegardes successives ;
- refus d’accès non autorisé ;
- upload média avec compte admin ;
- refus d’upload sans compte admin ;
- actualisation après une modification ;
- absence de données sensibles dans les endpoints publics.

Pour les nouveaux modules à forte concurrence, préférer des tables relationnelles dédiées avec contraintes SQL aux gros objets JSONB modifiés en bloc.
