# Miss 5ème — Vue complète

> **Statut : spécification historique.** La source de vérité métier est désormais [MISS_5EME.md](MISS_5EME.md). Ce document sert de vue opérationnelle et ne contient aucun secret d’accès.

## Composants fonctionnels

Une réactivation complète du concours comprend :

1. **Configuration du concours** — dates, statut, passages, critères, barèmes et poids.
2. **Candidates** — identité, numéro, photo, statut.
3. **Jurés** — comptes individuels Neon Auth et affectation au concours.
4. **Notation** — une fiche par juré/candidate/passage, validée côté serveur.
5. **Fiches individuelles** — détail des notes et des moyennes.
6. **Classement** — calcul à partir de la configuration du concours.
7. **Administration** — corrections tracées, exports et clôture.

## Workflow

```text
Admin configure le concours
        ↓
Admin ajoute les candidates
        ↓
Admin affecte les comptes jurés
        ↓
Ouverture d’un passage
        ↓
Jurés saisissent et valident leurs notes
        ↓
Serveur contrôle et enregistre
        ↓
Admin consulte les fiches et les notes manquantes
        ↓
Clôture des passages
        ↓
Calcul et validation du classement
        ↓
Publication éventuelle des résultats
```

## Architecture

- Next.js / React
- Neon Auth
- `auth_profiles`
- Neon PostgreSQL via API Next.js
- ImgBB via `/api/media/imgbb` pour les photos

Les anciennes implémentations Firebase et les identifiants partagés ne font pas partie de l’architecture de référence.

## Validation avant activation

- comptes jurés individuels ;
- permissions serveur ;
- barèmes vérifiés ;
- contrainte anti-doublon ;
- calculs testés avec cas d’égalité ;
- audit des corrections ;
- Preview Vercel validée ;
- résultats privés tant qu’ils ne sont pas officiellement publiés.

Pour les détails techniques et métier, voir [MISS_5EME.md](MISS_5EME.md).
