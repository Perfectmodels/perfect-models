import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ modelId: string }> };

function objectValue(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
}

export async function generateMetadata({ params }: PageProps) {
  const { modelId } = await params;
  const supabase = createSupabaseAdminClient() as any;
  const { data: model } = await supabase.from('models').select('name,is_public,is_active,raw_data').eq('id', modelId).maybeSingle();
  const raw = objectValue(model?.raw_data);
  const visible = Boolean(model?.is_public && model?.is_active && raw.compCardIsPublic === true && raw.compCardUrl);
  return {
    title: visible ? `Composite · ${String(model.name)} · Perfect Models Management` : 'Composite · Perfect Models Management',
    description: visible ? `Composite professionnel de ${String(model.name)}, mannequin Perfect Models Management.` : 'Composite professionnel Perfect Models Management.',
    robots: { index: false, follow: false },
  };
}

export default async function PublicCompositePage({ params }: PageProps) {
  const { modelId } = await params;
  const supabase = createSupabaseAdminClient() as any;
  const { data: model } = await supabase
    .from('models')
    .select('id,name,username,is_public,is_active,raw_data')
    .eq('id', modelId)
    .maybeSingle();

  const raw = objectValue(model?.raw_data);
  const compositeUrl = String(raw.compCardUrl || '');
  if (!model?.id || model.is_public !== true || model.is_active !== true || raw.compCardIsPublic !== true || !compositeUrl) notFound();

  return (
    <main className="min-h-screen min-w-0 overflow-x-clip bg-pm-ivory px-3 py-6 text-pm-ink sm:px-6 sm:py-10">
      <div className="mx-auto min-w-0 max-w-6xl">
        <header className="min-w-0 rounded-[2rem] bg-pm-ink p-6 text-white sm:p-8">
          <p className="text-[9px] font-black uppercase tracking-[.22em] text-pm-gold-light">Perfect Models Management</p>
          <h1 className="mt-3 break-words font-playfair text-4xl font-semibold sm:text-5xl">{String(model.name)}</h1>
          {model.username && <p className="mt-3 break-words text-sm font-semibold text-white/45">{String(model.username)}</p>}
        </header>

        <section className="mt-5 grid min-w-0 gap-5 rounded-[2rem] border border-pm-ink/10 bg-white p-4 shadow-[0_22px_70px_rgba(37,24,32,.08)] sm:p-6 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0 overflow-hidden rounded-[1.5rem] bg-pm-ivory">
            <img src={compositeUrl} alt={`Composite de ${String(model.name)}`} className="mx-auto h-auto max-h-[1250px] w-full max-w-full object-contain" />
          </div>
          <aside className="min-w-0 self-start rounded-[1.5rem] bg-pm-wine p-5 text-white">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-pm-gold-light">Composite officiel</p>
            <p className="mt-3 text-sm leading-6 text-white/60">Document partagé par le mannequin depuis son espace Perfect Models Management.</p>
            <a href={compositeUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-pm-gold px-5 text-center text-[10px] font-black uppercase tracking-[.1em] text-pm-ink">Ouvrir / télécharger</a>
            <Link href={`/mannequins/${encodeURIComponent(String(model.id))}`} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/25 px-5 text-center text-[10px] font-black uppercase tracking-[.1em] text-white">Voir le profil</Link>
          </aside>
        </section>
      </div>
    </main>
  );
}
