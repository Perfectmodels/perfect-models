import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function SurveyAdminPage() {
  const user = await getCurrentAppProfile();
  if (!user) redirect('/login?next=/admin/sondage');
  if (user.role !== 'admin') redirect('/admin');
  const db = createSupabaseAdminClient() as any;
  const [{count: total},{count: withComments}] = await Promise.all([
    db.from('agency_survey_responses').select('id',{head:true,count:'exact'}),
    db.from('agency_survey_responses').select('id',{head:true,count:'exact'}).eq('moderation_status','approved'),
  ]);
  return <div className="space-y-6 pb-14">
    <header className="rounded-[2rem] bg-[#1A1A1A] p-7 text-white sm:p-10">
      <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#D0B178]">Écoute des talents · Administration</p>
      <h1 className="mt-4 font-playfair text-4xl sm:text-5xl">Sondage · Statistiques publiques</h1>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70">Les réponses sont conservées sans identité déclarée. Les statistiques et témoignages sont publics automatiquement à partir du seuil de confidentialité, sans intervention de l’administrateur.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/sondage" className="rounded-full border border-white/30 px-5 py-3 text-xs font-bold">Page publique du sondage ↗</Link>
        <Link href="/sondage/participer" className="rounded-full border border-white/30 px-5 py-3 text-xs font-bold">Formulaire de participation ↗</Link>
        <Link href="/sondage/resultats" className="rounded-full bg-[#C5A467] px-5 py-3 text-xs font-bold text-black">Consulter les statistiques ↗</Link>
      </div>
    </header>
    <div className="grid gap-4 sm:grid-cols-3"><div className="control-card"><p className="control-kicker">Participations</p><p className="mt-3 font-playfair text-5xl font-bold">{total || 0}</p></div><div className="control-card"><p className="control-kicker">Contributions écrites publiables</p><p className="mt-3 font-playfair text-5xl font-bold">{withComments || 0}</p></div><div className="control-card"><p className="control-kicker">Mode de publication</p><p className="mt-3 text-lg font-bold">Automatique</p><p className="mt-2 text-sm text-pm-ink/60">Aucune approbation nécessaire</p></div></div>
    <div className="control-card"><h2 className="font-playfair text-3xl">Accès rapide</h2><p className="mt-3 text-sm leading-7 text-pm-ink/60">Toutes les statistiques par question et les témoignages publics figurent sur la page de résultats. Les réponses originales ne sont pas affichées séparément dans le tableau de bord pour protéger la confidentialité.</p><div className="mt-5 flex flex-wrap gap-3"><Link href="/sondage/resultats" className="rounded-full bg-pm-ink px-5 py-3 text-sm font-semibold text-white">Voir les données publiques →</Link><Link href="/sondage/participer" className="rounded-full border border-pm-ink/20 px-5 py-3 text-sm font-semibold">Tester le questionnaire</Link></div></div>
  </div>;
}
