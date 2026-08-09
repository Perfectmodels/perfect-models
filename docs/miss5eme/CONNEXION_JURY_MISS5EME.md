# Connexion Jury Miss 5ème — Spécification sécurisée

> **Statut : historique / non garanti actif.** Les anciens mécanismes basés sur un PIN partagé et une session navigateur locale ne doivent pas être réutilisés.

## Principe actuel

Toute réactivation d’un espace jury doit utiliser l’authentification centrale PMM :

1. le juré dispose d’un compte individuel Neon Auth ;
2. `auth_profiles` associe ce compte au rôle `jury` ou `jury-contest` ;
3. le serveur vérifie que le juré est affecté au concours concerné ;
4. la session est établie par Neon Auth ;
5. les routes de notation vérifient de nouveau l’identité et l’autorisation avant toute écriture.

## Connexion

Le point d’entrée commun peut rester `/login` lorsque le module est activé. L’interface ne doit pas demander un code partagé documenté dans le dépôt.

Une fois authentifié, le serveur peut rediriger le juré vers l’espace correspondant à son concours selon son profil et les routes réellement activées dans la version déployée.

## Informations de compte

Les informations suivantes ne doivent **jamais** apparaître dans ce document :

- mot de passe ;
- PIN ;
- token de session ;
- secret Neon ;
- clé API ;
- cookie de session.

Les accès sont créés et administrés depuis les mécanismes sécurisés de la plateforme.

## Session

La session d’identité provient de Neon Auth. `sessionStorage` ou `localStorage` peut éventuellement servir à un état d’interface non sensible, mais ne doit jamais remplacer une session serveur ou prouver le rôle jury.

## Autorisations

Avant d’afficher ou enregistrer une note, vérifier :

```text
session valide
   ↓
profil actif
   ↓
rôle jury autorisé
   ↓
affectation au concours
   ↓
concours ouvert à la notation
   ↓
opération autorisée
```

## Déconnexion

La déconnexion doit invalider la session d’authentification de la plateforme puis rediriger vers `/login` ou la page publique appropriée.

## Dépannage

En cas d’accès refusé :

1. vérifier que le compte juré est actif ;
2. vérifier son rôle dans `auth_profiles` ;
3. vérifier son affectation au concours ;
4. vérifier que la période de notation est ouverte ;
5. consulter les logs serveur si une API retourne 401 ou 403.

## Référence métier

Voir [MISS_5EME.md](MISS_5EME.md) pour la spécification métier générale du module.
