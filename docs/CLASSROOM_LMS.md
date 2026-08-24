# PMM Classroom — architecture LMS

## Parcours mannequin

1. Le mannequin ouvre un module puis un chapitre.
2. Le système mesure séparément le pourcentage réellement parcouru et le temps de lecture actif.
3. Le quiz se déverrouille à 90 % de lecture et 60 secondes minimum sur le chapitre.
4. Chaque chapitre comporte exactement 30 questions. Les questions éditoriales du cours sont prioritaires ; si la banque historique est incomplète, des contrôles de compréhension sont dérivés des points clés et du texte du chapitre.
5. L'évaluation affiche une question à la fois, avec 20 secondes par question, 3 tentatives maximum et un seuil de validation de 60 %.
6. Les sorties d'onglet, pertes de focus et tentatives d'actualisation pendant l'évaluation sont journalisées. À 3 incidents, l'évaluation est soumise automatiquement.
7. Lecture, durée, scores, tentatives, incidents et dernière activité sont enregistrés dans `classroomProgress` côté serveur.

## Vie d'agence

Le hub `/classroom/services` centralise :
- justificatifs d'absence ;
- déclarations de cotisation et preuves ;
- propositions de thèmes / moodboards de shooting ;
- messagerie mannequin ↔ administration.

Les demandes sont stockées dans `classroomRequests`, les messages dans `classroomMessages`.

## Administration

`/admin/classroom` devient le cockpit principal : activité, progression, demandes, messages et incidents.
`/admin/classroom-progress` fournit le détail par mannequin, module et chapitre.

## Manager

Le rôle `manager` est distinct du super-administrateur. Son tableau de bord est `/manager`.
Par défaut, il peut intervenir sur les opérations mannequins, Classroom, absences, cotisations, messages, bookings et direction artistique. Les paramètres du site, clés/API, permissions, comptes administratifs, mailing et autres surfaces sensibles restent interdits, sauf modification explicite des permissions par le super-administrateur.

## Sécurité

Les API Classroom résolvent la session sur le serveur et imposent l'identité du mannequin. Les règles Realtime Database restreignent `classroomProgress`, `classroomRequests` et `classroomMessages` au profil concerné ainsi qu'aux administrateurs/managers autorisés.

> Important : le fichier `database.rules.json` doit être déployé vers Firebase Realtime Database pour que les nouvelles règles prennent effet en production. Un déploiement Vercel ne publie pas les règles Firebase.
