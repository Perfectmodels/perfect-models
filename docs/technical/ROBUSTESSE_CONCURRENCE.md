# Robustesse et concurrence — Supabase

## Objectif

Garantir que plusieurs utilisateurs puissent lire ou modifier les données PMM sans écrasement silencieux, doublons métier ni exposition de données sensibles.

## Principes

### 1. Validation côté serveur

Les contrôles critiques sont appliqués dans les Route Handlers et composants serveur : session active, rôle, ownership, structure des données et règles métier.

### 2. Tables métier ciblées

Chaque domaine utilise sa table Supabase normalisée. Une opération ne doit jamais réécrire un objet global contenant tout l’état de l’application.

Exemples :

- casting : `casting_applications`, `casting_scores` ;
- mannequins : `models`, `model_portfolio_images` ;
- Fashion Day : `fashion_day_events`, `fashion_day_applications`, `fashion_day_reservations` ;
- Classroom : `courses`, `course_progress`, `classroom_requests`, `classroom_messages` ;
- forum : `forum_threads`, `forum_replies`.

### 3. Identifiants stables

Les ressources utilisent leurs clés relationnelles (`uuid`, clé métier ou clé composite selon la table). Les anciens identifiants de migration `legacy_*` ont été supprimés après migration.

### 4. Unicité et contraintes

Les règles d’unicité importantes doivent être garanties par PostgreSQL lorsqu’elles sont structurelles. Les contrôles applicatifs complètent les contraintes, mais ne les remplacent pas.

### 5. Transactions

Une opération qui modifie plusieurs lignes dépendantes doit utiliser une transaction/RPC PostgreSQL lorsqu’une atomicité stricte est nécessaire.

### 6. Gestion des erreurs

Une écriture distante doit attendre la confirmation serveur, traiter les statuts non 2xx, afficher une information utile et éviter d’annoncer un succès avant confirmation.

## Authentification et rôles

Supabase Auth gère la session. La table `profiles` contient le rôle et le contexte PMM.

```text
session Supabase Auth
      ↓
profil actif
      ↓
autorisation serveur
      ↓
opération sur la table métier
```

Une vérification frontend n’est jamais une barrière de sécurité suffisante.

## Médias

Les images ImgBB sont enregistrées par URL dans les ressources concernées et/ou `media_library`. Les vidéos Vercel Blob utilisent des noms uniques et des autorisations serveur.

## Données sensibles

- aucune clé Supabase serveur dans le navigateur ;
- aucune clé ImgBB/Brevo dans `NEXT_PUBLIC_*` ;
- aucun mot de passe en clair ;
- aucune collection globale contenant un mélange de données publiques et privées ;
- aucun datastore Firebase ou endpoint `/api/data` historique.

## Contrôle avant production

Tester au minimum :

- deux sessions différentes ;
- CRUD admin sur plusieurs ressources ;
- refus d’accès non autorisé ;
- création d’une candidature ;
- notation jury ;
- forum/Classroom ;
- upload média ;
- actualisation après modification ;
- absence de données sensibles dans les endpoints publics.
