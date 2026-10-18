import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import SurveyModeration from '@/components/admin/SurveyModeration';

export const dynamic = 'force-dynamic';

export default async function SurveyAdminPage() {
  const user = await getCurrentAppProfile();
  if (!user) redirect('/login?next=/admin/sondage');
  if (user.role !== 'admin') redirect('/admin');
  return <div className="space-y-6 pb-14">
    <header className="rounded-[2rem] bg-[#1A1A1A] p-7 text-white sm:p-10">
      <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#D0B178]">Écoute des talents · Administration</p>
      <h1 className="mt-4 font-playfair text-4xl sm:text-5xl">Modération du sondage</h1>
      <p className="mt-5 max-w-3xl text-sm leading-7 text-white/70">Les réponses fermées alimentent les statistiques publiques sans modification. Chaque témoignage doit être relu, anonymisé puis approuvé avant sa publication.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/sondage" className="rounded-full border border-white/30 px-5 py-3 text-xs font-bold">Voir le questionnaire ↗</Link>
        <Link href="/sondage/resultats" className="rounded-full bg-[#C5A467] px-5 py-3 text-xs font-bold text-black">Consulter les statistiques ↗</Link>
      </div>
    </header>
    <SurveyModeration />
  </div>;
}
