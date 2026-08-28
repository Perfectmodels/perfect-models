# Preview PMM — Next.js + Supabase

Branche de validation actuelle : `fix/auth-transactional-email-hardening`.

La Preview doit vérifier :

- build Next.js ;
- authentification Supabase ;
- lecture/écriture Supabase PostgreSQL ;
- routes publiques et administratives ;
- images ImgBB et vidéos Vercel Blob ;
- emails transactionnels Brevo ;
- Perfect Fashion Day ;
- casting, Classroom et forum.

Le dépôt déclare Next.js dans `vercel.json`. Le projet Vercel `perfectmodelsga` doit également utiliser le preset **Next.js** dans ses paramètres.

Aucune Preview ne doit nécessiter Vite, Firebase, React Router ou l’ancien endpoint `/api/data`.

Voir [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) pour la checklist complète.
