# Référencement et acquisition — Perfect Models Management

## Objectif

Le site PMM est optimisé pour la visibilité organique, sociale, locale et machine-readable, tout en préparant des pages d’atterrissage propres pour les campagnes payantes.

## SEO / référencement naturel

- Métadonnées Next.js rendues côté serveur.
- Canonical sur `https://www.perfectmodels.online`, qui correspond à l’hôte public final servi après redirection.
- Titres et descriptions propres aux pages stratégiques.
- Métadonnées dynamiques pour articles, mannequins et services.
- `robots.txt` limitant l’exploration des espaces privés.
- `sitemap.xml` alimenté par Neon avec fallback statique et déduplication des URLs.
- RSS pour le magazine.
- Langue `fr-GA` et signaux géographiques Libreville/Gabon.

## Données structurées

Le site émet du JSON-LD Schema.org pour :

- Organization / ProfessionalService ;
- WebSite ;
- Article ;
- ProfilePage / Person ;
- Service ;
- Event pour Perfect Fashion Day ;
- BreadcrumbList.

## SMO / Open Graph

- Image sociale native 1200 × 630.
- Open Graph et Twitter Card côté serveur.
- Covers propres aux contenus dynamiques lorsqu’elles existent.
- Canonical cohérent pour les partages Facebook, WhatsApp, LinkedIn et X.

## AEO / GEO / moteurs IA

- Données structurées explicites.
- Contenu public disponible via `/api/content`.
- RSS via `/rss.xml`.
- Fichier `/llms.txt` indiquant les ressources publiques canoniques.
- Sitemap sans dépendance à l’ancienne infrastructure Firebase.

## SEA

Les pages `/services`, `/casting`, `/mannequins`, `/contact` et leurs pages de détail sont structurées comme pages d’atterrissage avec une intention propre. Les formulaires transactionnels sont `noindex` afin d’éviter la concurrence interne avec leurs pages d’acquisition.

Les identifiants Google Ads / Google Tag peuvent être définis dans les variables d’environnement lorsque le plan de mesure et le consentement sont validés. Aucun identifiant ni script publicitaire n’est codé en dur dans le dépôt.

## Maintenance

Lorsqu’une nouvelle page publique est créée :

1. ajouter une metadata serveur spécifique ;
2. ajouter l’URL au sitemap si elle doit être indexée ;
3. utiliser un canonical unique ;
4. ajouter un schéma Schema.org lorsqu’un type métier s’applique ;
5. ne pas indexer les interfaces privées, formulaires de traitement ou dashboards ;
6. fournir des images sociales suffisamment grandes pour les contenus prioritaires.
