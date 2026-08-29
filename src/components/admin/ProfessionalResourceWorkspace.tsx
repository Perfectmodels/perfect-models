import Link from 'next/link';
import {
  ArrowUpRight, BriefcaseBusiness, CheckCircle2, CircleAlert, Gauge, Sparkles, Workflow,
} from 'lucide-react';
import type { ProfessionalWorkspaceConfig, WorkspaceTone } from '@/lib/professional-workspaces';

type Snapshot = {
  total: number;
  completeness: number;
  metrics: Array<{ label: string; value: number; tone?: WorkspaceTone }>;
};

const TONES: Record<WorkspaceTone, string> = {
  wine: 'bg-pm-wine text-white',
  coral: 'bg-pm-peach text-pm-wine',
  gold: 'bg-amber-50 text-amber-900',
  emerald: 'bg-emerald-50 text-emerald-900',
  blue: 'bg-blue-50 text-blue-900',
  violet: 'bg-violet-50 text-violet-900',
  amber: 'bg-amber-50 text-amber-900',
  slate: 'bg-stone-100 text-stone-800',
};

function KpiCard({ label, value, tone = 'slate' }: { label: string; value: number | string; tone?: WorkspaceTone }) {
  return (
    <div className={`rounded-[1.35rem] p-4 ${TONES[tone]}`}>
      <p className="text-[10px] font-black uppercase tracking-[.14em] opacity-55">{label}</p>
      <p className="mt-2 font-playfair text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function ProfessionalResourceWorkspace({
  title,
  config,
  snapshot,
  children,
}: {
  title: string;
  config: ProfessionalWorkspaceConfig;
  snapshot: Snapshot;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6 pb-10 text-pm-ink">
      <section className="overflow-hidden rounded-[2.2rem] bg-pm-ink text-white shadow-[0_22px_70px_rgba(65,38,32,.14)]">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_.8fr] lg:p-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-pm-gold-light">
              <BriefcaseBusiness size={14} /> {config.family}
            </div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-[.2em] text-white/40">{config.kicker}</p>
            <h1 className="mt-3 max-w-4xl font-playfair text-4xl font-semibold leading-[.98] sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/58 sm:text-base">{config.mission}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <KpiCard label="Dossiers" value={snapshot.total} tone="wine" />
            <KpiCard label="Complétude affichée" value={`${snapshot.completeness}%`} tone="gold" />
            {snapshot.metrics.slice(0, 2).map((metric) => (
              <KpiCard key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-5 2xl:grid-cols-[1fr_21rem]">
        <div className="space-y-5">
          <section className="rounded-[1.8rem] border border-pm-ink/[.08] bg-white p-5 shadow-[0_16px_55px_rgba(91,46,37,.05)] sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.18em] text-pm-coral"><Workflow size={14} /> Processus métier</p>
                <h2 className="mt-2 font-playfair text-3xl font-semibold">Du dossier à l’action.</h2>
              </div>
              <p className="max-w-md text-xs leading-5 text-pm-ink/45">Le registre ci-dessous reste disponible, mais il s’inscrit désormais dans un processus professionnel explicite.</p>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {config.workflow.map((stage, index) => (
                <article key={stage.label} className="relative rounded-[1.35rem] bg-pm-ivory p-4">
                  <div className="flex items-center justify-between">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-pm-wine text-xs font-black text-white">{index + 1}</span>
                    {index < config.workflow.length - 1 ? <ArrowUpRight size={16} className="text-pm-ink/20" /> : <CheckCircle2 size={16} className="text-emerald-600" />}
                  </div>
                  <h3 className="mt-4 text-sm font-black">{stage.label}</h3>
                  <p className="mt-2 text-xs leading-5 text-pm-ink/48">{stage.detail}</p>
                </article>
              ))}
            </div>
          </section>

          {snapshot.metrics.length > 2 && (
            <section className="grid gap-3 sm:grid-cols-3">
              {snapshot.metrics.slice(2).map((metric) => (
                <KpiCard key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
              ))}
            </section>
          )}

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-pm-coral">Registre opérationnel</p>
                <h2 className="mt-1 font-playfair text-3xl font-semibold">Données, dossiers et exécution.</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black uppercase tracking-[.1em] text-emerald-800"><Gauge size={14} /> Données Supabase réelles</span>
            </div>
            {children}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-[1.7rem] bg-pm-wine p-5 text-white">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-pm-gold-light"><Sparkles size={14} /> Centre d’actions</p>
            <div className="mt-4 space-y-2">
              {config.actions.map((action) => (
                <Link key={`${action.href}-${action.label}`} href={action.href} className="group block rounded-[1.2rem] border border-white/10 bg-white/[.06] p-4 transition hover:bg-white/[.11]">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-sm font-black">{action.label}</p><p className="mt-1 text-xs leading-5 text-white/45">{action.description}</p></div>
                    <ArrowUpRight size={15} className="mt-0.5 shrink-0 text-white/35 transition group-hover:text-pm-gold-light" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5">
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-pm-coral"><CircleAlert size={14} /> Règles métier</p>
            <div className="mt-4 space-y-3">
              {config.rules.map((rule) => (
                <div key={rule} className="flex gap-3 text-xs leading-5 text-pm-ink/58"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pm-coral" />{rule}</div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.7rem] bg-pm-peach p-5">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-pm-wine">Qualité opérationnelle</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70"><div className="h-full rounded-full bg-pm-wine" style={{ width: `${snapshot.completeness}%` }} /></div>
            <p className="mt-3 font-playfair text-3xl font-semibold text-pm-wine">{snapshot.completeness}%</p>
            <p className="mt-1 text-xs leading-5 text-pm-wine/60">Complétude moyenne calculée sur les champs requis des dossiers actuellement chargés.</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
