# Module Formation — Perfect Models Management

## Objectif

Le module Formation accompagne les mannequins PMM dans leur progression professionnelle : fondamentaux du mannequinat, défilé, photographie, présence digitale et gestion de carrière.

La plateforme actuelle utilise **Next.js App Router**, le store applicatif PMM et les API connectées à **Neon PostgreSQL**. Les anciennes références à `src/pages`, au router React historique et à une progression exclusivement enregistrée dans `localStorage` ne décrivent plus l’architecture de référence.

## Routes actuelles

Les principaux parcours sont disponibles sous :

```text
/formation
/formation/module/[moduleId]
/formations
/formations/forum
/formations/forum/[threadId]
/formations/[moduleSlug]/[chapterSlug]
/profil
```

L’accès dépend du rôle de l’utilisateur et de ses permissions applicatives.

## Permissions

Un profil mannequin peut notamment disposer de :

- `canAccessFormation`
- `canAccessClassroom`
- `canAccessForum`
- `canViewPhotoshootBriefs`
- `canViewResults`
- `canEditProfile`

Les vérifications de sécurité doivent être appliquées côté serveur/API pour toute donnée privée ou toute écriture sensible.

## Contenu pédagogique

Le contenu pédagogique est structuré en modules, chapitres et quiz. Une partie du contenu peut encore être chargée depuis les constantes TypeScript du projet pendant la migration progressive vers une gestion entièrement administrable.

Structure conceptuelle :

```ts
interface Module {
  slug: string;
  title: string;
  chapters: Chapter[];
  quiz: QuizQuestion[];
}

interface Chapter {
  slug: string;
  title: string;
  content: string;
}
```

Des structures historiques plus détaillées existent également pour certains parcours avancés. Elles doivent être maintenues compatibles tant que les écrans correspondants sont encore utilisés.

## Parcours pédagogique

Le module couvre notamment :

### 1. Fondamentaux du mannequinat

- métier de mannequin ;
- posture et discipline ;
- préparation physique et mentale ;
- compréhension de l’écosystème mode.

### 2. Défilé et présence scénique

- marche podium ;
- poses ;
- gestion du rythme ;
- backstage ;
- présence scénique.

### 3. Photographie et image professionnelle

- techniques de pose ;
- préparation shooting ;
- portfolio ;
- personal branding ;
- présence digitale.

### 4. Gestion de carrière

- rémunération ;
- négociation ;
- contrats ;
- droits et obligations ;
- développement professionnel.

## Progression et résultats

La progression affichée à l’utilisateur doit provenir de la couche de données applicative et être synchronisée avec les données persistées lorsque le parcours concerné l’exige.

Les nouveaux développements ne doivent pas créer une deuxième source de vérité durable uniquement dans `localStorage`.

Les scores de quiz et états de progression doivent être rattachés au profil du mannequin par un identifiant stable.

## Forum

Le forum Formation utilise les collections applicatives pour :

- fils de discussion ;
- réponses ;
- auteur ;
- date de création ;
- contenu.

Les routes `/formations/forum` et `/formations/forum/[threadId]` doivent respecter les permissions `canAccessForum`.

## Administration

L’administration permet progressivement de suivre :

- accès à la formation ;
- progression des mannequins ;
- résultats ;
- contenu pédagogique ;
- Classroom ;
- briefings et ressources associés.

Toute nouvelle fonctionnalité d’administration doit utiliser les API applicatives plutôt qu’un accès direct à la base depuis le navigateur.

## Données et sécurité

- Authentification : Neon Auth.
- Profil métier et permissions : `auth_profiles`.
- Données applicatives : API Next.js et Neon PostgreSQL.
- Aucun mot de passe ou secret ne doit être stocké dans les données de formation.
- Une modification de progression appartenant à un mannequin doit vérifier l’identité et/ou l’autorisation côté serveur.

## Validation

Avant mise en production, tester :

1. connexion mannequin ;
2. accès `/formation` ;
3. ouverture d’un module ;
4. navigation entre chapitres ;
5. quiz ;
6. persistance de progression ;
7. forum ;
8. permissions désactivées ;
9. vue admin de progression ;
10. rendu mobile et desktop.

## Maintenance

Les anciens composants présents dans `src/legacy-pages/` peuvent encore être utilisés pendant la modernisation. Lorsqu’un écran Formation est migré vers `src/features/` ou un composant App Router natif, sa documentation doit être mise à jour dans ce fichier.
