# Documentation Perfect Models Management

Cet index décrit la documentation **actuelle** de la plateforme PMM. Les anciens guides Android, iOS, Firebase Push et Capacitor ont été retirés de l’architecture active : le projet est désormais une plateforme web Next.js dont les images passent par ImgBB et les vidéos volumineuses par Vercel Blob.

## Documentation de référence

| Document | Objet |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture Next.js, Neon, auth, données et médias |
| [FASHION_DAY.md](FASHION_DAY.md) | Gestion des éditions Perfect Fashion Day |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Workflow branches, Preview Vercel et production |
| [FORMATION_MODULE.md](FORMATION_MODULE.md) | Fonctionnement du module Formation |
| [technical/READY_TO_TEST.md](technical/READY_TO_TEST.md) | Checklist de validation avant mise en production |
| [technical/ROBUSTESSE_CONCURRENCE.md](technical/ROBUSTESSE_CONCURRENCE.md) | Principes de cohérence et d’écriture concurrente |
| [technical/ICONS_GENERATED.md](technical/ICONS_GENERATED.md) | Assets et icônes web/PWA |

## Documentation métier historique Miss / Jury

Les fichiers `docs/miss5eme/` sont conservés comme **spécifications métier historiques**. Ils décrivent les concepts de candidates, jurés, passages, critères, fiches individuelles et classement, mais ne garantissent pas qu’une route équivalente soit actuellement activée dans le site.

Ils ont été nettoyés pour respecter l’architecture et les règles de sécurité actuelles :

- aucun PIN ou mot de passe en clair ;
- aucune instruction de connexion basée sur `sessionStorage` ;
- aucune dépendance active à Firebase présentée comme architecture actuelle ;
- authentification attendue via Neon Auth et profils applicatifs ;
- écritures sensibles attendues via API serveur ;
- règles de notation configurables plutôt que valeurs historiques contradictoires.

Documents :

- [CONNEXION_JURY_MISS5EME.md](miss5eme/CONNEXION_JURY_MISS5EME.md)
- [FICHES_INDIVIDUELLES_MISS5EME.md](miss5eme/FICHES_INDIVIDUELLES_MISS5EME.md)
- [MISS_5EME.md](miss5eme/MISS_5EME.md)
- [MISS_5EME_COMPLET.md](miss5eme/MISS_5EME_COMPLET.md)
- [MISS_5EME_GUIDE_RAPIDE.md](miss5eme/MISS_5EME_GUIDE_RAPIDE.md)
- [MISS_5EME_RESUME.md](miss5eme/MISS_5EME_RESUME.md)
- [MODALE_NOTATION_ADMIN.md](miss5eme/MODALE_NOTATION_ADMIN.md)

## Principes de maintenance

1. La documentation de référence doit décrire uniquement l’architecture réellement présente dans le dépôt.
2. Les secrets, mots de passe, PIN, tokens et chaînes de connexion ne sont jamais écrits dans les fichiers Markdown.
3. Une fonctionnalité modifiée doit entraîner la mise à jour du document métier associé.
4. Les instructions de déploiement doivent respecter le workflow Preview → validation → production.
5. Les anciens noms techniques conservés uniquement pour compatibilité ne doivent pas être présentés comme des dépendances actives.
6. Un document historique doit être explicitement identifié comme tel s’il ne correspond plus à une route active.

## État actuel

- Web : Next.js App Router
- Base : Neon PostgreSQL
- Auth : Neon Auth
- Images : ImgBB via API serveur
- Vidéos : Vercel Blob
- Hébergement : Vercel
- Dépôt : `Perfectmodels/perfect-models`
- Branche de preview de migration : `preview/neon-next-migration`
