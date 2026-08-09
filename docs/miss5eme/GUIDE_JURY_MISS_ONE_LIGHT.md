# Guide Jury — Concours PMM / Miss One Light

> **Statut : guide fonctionnel générique.** Les routes exactes et le concours actif doivent être vérifiés dans la version déployée avant utilisation.

## Accès

Un juré doit utiliser un compte individuel PMM. L’authentification passe par Neon Auth ; aucun code partagé ne doit être stocké dans ce fichier.

Après connexion, le juré ne doit voir que les concours auxquels il est affecté et les opérations autorisées par son profil.

## Avant la notation

Vérifier :

- identité du concours ;
- liste des candidates ;
- passage ou manche active ;
- critères et barèmes ;
- période de notation ouverte ;
- consignes particulières de l’organisation.

## Noter une candidate

1. sélectionner la candidate ;
2. sélectionner le passage actif ;
3. renseigner chaque critère dans les limites du barème ;
4. vérifier le récapitulatif ;
5. valider la fiche ;
6. contrôler que l’interface confirme l’enregistrement.

## Règles

- ne jamais partager son compte ;
- ne pas utiliser le compte d’un autre juré ;
- ne pas communiquer ses notes pendant une phase confidentielle ;
- ne pas modifier une fiche validée si le règlement ne l’autorise pas ;
- signaler immédiatement un problème de candidate, passage ou barème à l’administration.

## Sécurité

L’autorisation de noter doit être contrôlée côté serveur à chaque enregistrement. Une information stockée uniquement dans le navigateur ne constitue pas une preuve d’identité ou de rôle.

## Incident

Si une note ne s’enregistre pas :

1. ne pas multiplier les clics ;
2. vérifier le message d’erreur ;
3. actualiser uniquement si l’interface indique que la sauvegarde n’a pas abouti ;
4. prévenir l’administration avec la candidate et le passage concernés ;
5. ne jamais envoyer son mot de passe ou un token de session au support.

## Fin de session

Se déconnecter depuis l’interface PMM lorsque la session de jury est terminée, en particulier sur un appareil partagé.
