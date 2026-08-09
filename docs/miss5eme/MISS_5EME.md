# Miss 5ème — Spécification métier historique

> **Statut : historique / à réactiver explicitement.** Ce document conserve le fonctionnement métier du concours. Il ne doit pas être interprété comme preuve qu’une route Miss 5ème est actuellement active sur le site.

## Objectif

Le module permet d’organiser la notation d’un concours avec :

- candidates ;
- jurés identifiés individuellement ;
- plusieurs passages ou manches ;
- critères de notation configurables ;
- une note par juré, candidate et passage ;
- fiches individuelles ;
- calcul de moyennes ;
- classement final ;
- corrections administratives tracées.

## Architecture à utiliser en cas de réactivation

- **Frontend** : Next.js / React.
- **Authentification** : Neon Auth.
- **Profils** : `auth_profiles` avec rôle `jury`, `jury-contest` ou permission dédiée.
- **Données** : Neon PostgreSQL via API Next.js.
- **Médias candidates** : Vercel Blob.

Aucun accès ne doit reposer sur un PIN commun codé en dur, une valeur documentée dans Git ou une simple donnée `sessionStorage` considérée comme preuve d’identité.

## Modèle métier recommandé

### Concours

```text
contest
- id
- name
- status
- starts_at
- ends_at
- scoring_config
```

### Candidates

```text
candidate
- id
- contest_id
- number
- name
- photo_url
- status
```

### Jurés

```text
contest_jury
- contest_id
- user_id
- display_name
- permissions
```

### Passages

```text
round
- id
- contest_id
- name
- position
```

### Critères

```text
criterion
- id
- contest_id
- label
- max_score
- weight
```

### Notes

```text
score
- contest_id
- jury_id
- candidate_id
- round_id
- criterion_id
- value
- created_at
- updated_at
```

## Règle d’unicité

Un juré ne doit disposer que d’une notation active par candidate, passage et critère. Une contrainte SQL ou une transaction serveur doit empêcher les doublons concurrents.

Exemple conceptuel :

```sql
UNIQUE (contest_id, jury_id, candidate_id, round_id, criterion_id)
```

## Calculs

Les barèmes historiques ne doivent pas être figés dans la documentation. Le total maximum dépend de la configuration des critères.

Principes :

1. calculer le total d’un juré pour un passage à partir des critères actifs ;
2. calculer la moyenne du passage à partir des jurés ayant validé leur fiche ;
3. calculer la note finale selon les poids définis pour les passages ;
4. classer par note finale ;
5. appliquer une règle de départage explicitement configurée en cas d’égalité.

## Fiches individuelles

Une fiche candidate doit afficher :

- identité et numéro ;
- notes de chaque juré ;
- détail par passage ;
- détail par critère ;
- moyenne du passage ;
- note finale ;
- état des notes manquantes ;
- historique des corrections si l’administration modifie une note.

## Administration

L’administration peut prévoir :

- création et modification des candidates ;
- attribution des jurés ;
- configuration des passages et critères ;
- ouverture/fermeture des notations ;
- consultation des fiches ;
- classement ;
- export ;
- correction exceptionnelle avec audit ;
- clôture du concours.

Une réinitialisation globale doit demander une confirmation forte et être réservée à l’administrateur.

## Sécurité

- aucun mot de passe ou PIN en clair dans Git ;
- session vérifiée côté serveur ;
- chaque juré utilise un compte individuel ;
- rôle et concours contrôlés avant chaque écriture ;
- impossibilité de soumettre une note hors barème ;
- audit des modifications administratives ;
- résultats non publiés avant décision de l’administration ;
- données privées exclues des endpoints publics.

## Réactivation

Avant de remettre ce module en service :

1. confirmer le concours et les règles exactes ;
2. créer les tables/collections Neon nécessaires ;
3. vérifier les routes App Router réelles ;
4. créer les comptes jurés avec Neon Auth ;
5. effectuer un test de notation concurrente ;
6. tester le calcul de classement ;
7. effectuer une Preview Vercel ;
8. activer le module uniquement après validation.
