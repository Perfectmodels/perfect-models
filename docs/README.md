# Documentation Perfect Models Management

Cet index décrit la documentation **actuelle** de la plateforme PMM. Les anciens guides Android, iOS, Firebase Push et Capacitor ont été retirés de l’architecture active : le projet est désormais une plateforme web Next.js connectée à Neon et Vercel Blob.

## Documentation de référence

| Document | Objet |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architecture Next.js, Neon, auth, données et médias |
| [FASHION_DAY.md](FASHION_DAY.md) | Gestion des éditions Perfect Fashion Day |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Workflow branches, Preview Vercel et production |
| [FORMATION_MODULE.md](FORMATION_MODULE.md) | Fonctionnement du module formation |
| [technical/READY_TO_TEST.md](technical/READY_TO_TEST.md) | Checklist de validation avant mise en production |
| [technical/ROBUSTESSE_CONCURRENCE.md](technical/ROBUSTESSE_CONCURRENCE.md) | Principes de cohérence et d’écriture concurrente |
| [technical/ICONS_GENERATED.md](technical/ICONS_GENERATED.md) | Assets et icônes web/PWA |

## Documentation métier Miss / Jury

Les fichiers `docs/miss5eme/` documentent les parcours métier liés aux concours et aux jurys. Ils restent disponibles comme documentation fonctionnelle, mais toute référence historique à Firebase doit être interprétée selon l’architecture actuelle : les accès aux données passent désormais par les API applicatives et Neon.

- [CONNEXION_JURY_MISS5EME.md](miss5eme/CONNEXION_JURY_MISS5EME.md)
- [FICHES_INDIVIDUELLES_MISS5EME.md](miss5eme/FICHES_INDIVIDUELLES_MISS5EME.md)
- [GUIDE_JURY_MISS_ONE_LIGHT.md](miss5eme/GUIDE_JURY_MISS_ONE_LIGHT.md)
- [MISS_5EME.md](miss5eme/MISS_5EME.md)
- [MISS_5EME_COMPLET.md](miss5eme/MISS_5EME_COMPLET.md)
- [MISS_5EME_GUIDE_RAPIDE.md](miss5eme/MISS_5EME_GUIDE_RAPIDE.md)
- [MISS_5EME_RESUME.md](miss5eme/MISS_5EME_RESUME.md)
- [MODALE_NOTATION_ADMIN.md](miss5eme/MODALE_NOTATION_ADMIN.md)

## Principes de maintenance

1. La documentation de référence doit décrire uniquement l’architecture réellement présente dans le dépôt.
2. Les secrets, mots de passe, tokens et chaînes de connexion ne sont jamais écrits dans les fichiers Markdown.
3. Une fonctionnalité modifiée doit entraîner la mise à jour du document métier associé.
4. Les instructions de déploiement doivent respecter le workflow Preview → validation → production.
5. Les anciens noms techniques conservés uniquement pour compatibilité ne doivent pas être présentés comme des dépendances actives.

## État actuel

- Web : Next.js App Router
- Base : Neon PostgreSQL
- Auth : Neon Auth
- Médias : Vercel Blob
- Hébergement : Vercel
- Dépôt cible : `perfect-models-management`
- Branche de preview de migration : `preview/neon-next-migration`
