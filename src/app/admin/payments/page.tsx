import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { rejectModelTransaction, validateModelTransaction } from './actions';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Row = {
  id: string;
  model_id: string;
  amount: number | string;
  currency: string;
  status: string;
  transaction_type?: string | null;
  payment_method?: string | null;
  reference?: string | null;
  proof_url?: string | null;
  paid_at?: string | null;
  submitted_at?: string | null;
  validated_at?: string | null;
  validation_notes?: string | null;
  raw_data?: Record<string, unknown> | null;
  models?: { name?: string | null; email?: string | null } | Array<{ name?: string | null; email?: string | null }> | null;
};

const TYPE_LABELS: Record<string, string> = {
  membership_package: 'Pack adhésion',
  registration: 'Inscription',
  membership_fee: 'Cotisation',
  agency_commission: 'Commission agence',
  other: 'Autre paiement',
};

const METHOD_LABELS: Record<string, string> = {
  manual: 'Saisie administrative',
  cash: 'Espèces / reçu',
  airtel_money: 'Airtel Money',
  moov_money: 'Moov Money',
  bank_transfer: 'Virement bancaire',
  other: 'Autre moyen',
};

function money(value: number | string | null | undefined) {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0))} FCFA`;
}

function formatDate(value?: string | null) {
  if (!value) return 'Non renseignée';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function modelFor(row: Row) {
  if (Array.isArray(row.models)) return row.models[0] || null;
  return row.models || null;
}

function statusTone(status: string) {
  if (status === 'validated') return 'bg-pm-sage text-pm-teal';
  if (status === 'rejected') return 'bg-pm-peach text-pm-wine';
  return 'bg-pm-gold-light/55 text-pm-ink';
}

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/payments');
  if (!['admin', 'manager'].includes(profile.role)) redirect('/profil');
  if (!hasAdminPermission(profile, 'payments')) redirect(profile.role === 'manager' ? '/manager' : '/admin');

  const params = await searchParams;
  const supabase = createSupabaseAdminClient() as any;
  const { data, error } = await supabase
    .from('monthly_payments')
    .select('id,model_id,amount,currency,status,transaction_type,payment_method,reference,proof_url,paid_at,submitted_at,validated_at,validation_notes,raw_data,models(name,email)')
    .order('created_at', { ascending: false })
    .limit(250);

  if (error) throw new Error(`Lecture des transactions impossible: ${error.message}`);
  const rows = (Array.isArray(data) ? data : []) as Row[];
  const pending = rows.filter((row) => row.status === 'pending');
  const validated = rows.filter((row) => row.status === 'validated');
  const rejected = rows.filter((row) => row.status === 'rejected');
  const validatedTotal = validated.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const pendingTotal = pending.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const updated = typeof params.updated === 'string' ? params.updated : null;
  const hasError = typeof params.error === 'string';
  const query = typeof params.q === 'string' ? params.q.trim().toLocaleLowerCase('fr') : '';
  const statusFilter = typeof params.status === 'string' ? params.status : '';
  const typeFilter = typeof params.type === 'string' ? params.type : '';
  const matchesFilters = (row: Row) => {
    const model = modelFor(row);
    const searchable = [model?.name, model?.email, row.reference, TYPE_LABELS[row.transaction_type || ''], METHOD_LABELS[row.payment_method || '']].filter(Boolean).join(' ').toLocaleLowerCase('fr');
    return (!query || searchable.includes(query)) && (!statusFilter || row.status === statusFilter) && (!typeFilter || row.transaction_type === typeFilter);
  };
  const filteredRows = rows.filter(matchesFilters);
  const filteredPending = pending.filter(matchesFilters);

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1600px] space-y-7">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-pm-wine p-6 text-white sm:p-9 lg:p-12">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-pm-coral/25 blur-3xl" />
          <div className="relative flex flex-wrap items-end justify-between gap-7">
            <div className="max-w-3xl">
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-pm-gold-light">Finance · Perfect Models Management</p>
              <h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.92] tracking-[-.04em] sm:text-6xl">Validation des transactions mannequins.</h1>
              <p className="mt-5 text-sm leading-7 text-white/72">Une déclaration mannequin n’entre dans les encaissements qu’après contrôle de sa référence ou de sa preuve puis validation administrative.</p>
            </div>
            <div className="flex flex-wrap gap-2"><Link href="/admin/finance/cotisations" className="control-button border-white/20 bg-white text-pm-wine">Saisir / modifier</Link><Link href="/admin/finance?view=cotisations" className="control-button border-white/25 bg-transparent text-white">Vue cotisations</Link></div>
          </div>
        </section>

        {updated && <div className="rounded-[1.4rem] bg-pm-sage px-5 py-4 text-sm font-bold text-pm-teal">Transaction mise à jour : {updated === 'validated' ? 'validée et comptabilisée' : 'rejetée'}.</div>}
        {hasError && <div className="rounded-[1.4rem] bg-pm-peach px-5 py-4 text-sm font-bold text-pm-wine">L’opération n’a pas pu être effectuée ou cette transaction a déjà été traitée.</div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs de transactions">
          <Metric label="Comptabilisé" value={money(validatedTotal)} note={`${validated.length} transaction${validated.length > 1 ? 's' : ''} validée${validated.length > 1 ? 's' : ''}`} tone="bg-pm-sage" />
          <Metric label="À vérifier" value={money(pendingTotal)} note={`${pending.length} déclaration${pending.length > 1 ? 's' : ''} en attente`} tone="bg-pm-gold-light/55" />
          <Metric label="Transactions" value={String(rows.length)} note="Historique chargé" tone="bg-pm-peach" />
          <Metric label="Rejetées" value={String(rejected.length)} note="Non comptabilisées" tone="bg-white" />
        </section>

        <form method="get" className="grid gap-3 rounded-[1.5rem] border border-pm-ink/[.07] bg-white p-4 sm:grid-cols-2 lg:grid-cols-[1fr_.45fr_.55fr_auto]">
          <label><span className="mb-2 block text-[10px] font-black uppercase tracking-[.08em] text-pm-ink/40">Recherche</span><input name="q" defaultValue={typeof params.q === 'string' ? params.q : ''} placeholder="Talent, e-mail ou référence…" className="min-h-11 w-full rounded-xl border border-pm-ink/12 bg-pm-ivory px-3 text-sm outline-none focus:border-pm-coral"/></label>
          <label><span className="mb-2 block text-[10px] font-black uppercase tracking-[.08em] text-pm-ink/40">Statut</span><select name="status" defaultValue={statusFilter} className="min-h-11 w-full rounded-xl border border-pm-ink/12 bg-pm-ivory px-3 text-sm"><option value="">Tous</option><option value="pending">À vérifier</option><option value="validated">Confirmé</option><option value="rejected">Rejeté</option></select></label>
          <label><span className="mb-2 block text-[10px] font-black uppercase tracking-[.08em] text-pm-ink/40">Objet</span><select name="type" defaultValue={typeFilter} className="min-h-11 w-full rounded-xl border border-pm-ink/12 bg-pm-ivory px-3 text-sm"><option value="">Tous</option>{Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <div className="flex items-end gap-2"><button type="submit" className="min-h-11 flex-1 rounded-xl bg-pm-ink px-4 text-xs font-black uppercase tracking-[.06em] text-white">Filtrer</button>{(query || statusFilter || typeFilter) && <Link href="/admin/payments" className="grid min-h-11 place-items-center rounded-xl border border-pm-ink/12 px-3 text-xs font-bold">Effacer</Link>}</div>
        </form>

        {filteredPending.length > 0 && (
          <section className="control-card">
            <div>
              <p className="control-kicker">Contrôle administratif</p>
              <h2 className="mt-2 font-playfair text-3xl font-semibold">Transactions en attente</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-pm-ink/55">Contrôlez la référence auprès du moyen de paiement concerné ou ouvrez la preuve transmise. Validez uniquement lorsque le versement est confirmé.</p>
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {filteredPending.map((row) => <PendingCard key={row.id} row={row} />)}
            </div>
          </section>
        )}

        <section className="control-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="control-kicker">Registre</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Historique des transactions</h2></div>
            <span className="rounded-full bg-pm-ink px-3 py-2 text-xs font-extrabold text-white">{filteredRows.length} opération{filteredRows.length > 1 ? 's' : ''}</span>
          </div>
          <div className="mt-6 grid gap-3">
            {filteredRows.map((row) => <HistoryRow key={row.id} row={row} />)}
            {!filteredRows.length && <p className="rounded-[1.4rem] bg-pm-ivory p-6 text-sm text-pm-ink/50">Aucune transaction ne correspond aux filtres.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function PendingCard({ row }: { row: Row }) {
  const model = modelFor(row);
  const raw = row.raw_data && typeof row.raw_data === 'object' ? row.raw_data : {};
  const declaredName = typeof raw?.declared_name === 'string' ? raw.declared_name : null;
  const note = typeof raw?.note === 'string' ? raw.note : null;
  return (
    <article className="rounded-[1.6rem] border border-pm-ink/8 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-wine/55">{TYPE_LABELS[row.transaction_type || ''] || 'Paiement'}</p>
          <h3 className="mt-2 font-playfair text-2xl font-semibold">{declaredName || model?.name || 'Talent non rattaché'}</h3>
          <p className="mt-1 text-xs font-semibold text-pm-ink/45">{model?.email || 'E-mail non renseigné'}</p>
        </div>
        <p className="font-playfair text-3xl font-semibold text-pm-wine">{money(row.amount)}</p>
      </div>
      <dl className="mt-5 grid gap-3 rounded-[1.2rem] bg-pm-ivory p-4 text-sm sm:grid-cols-2">
        <Info label="Moyen" value={METHOD_LABELS[row.payment_method || ''] || 'Non précisé'} />
        <Info label="Paiement" value={formatDate(row.paid_at)} />
        <Info label="Référence" value={row.reference || 'Non renseignée'} />
        <Info label="Soumise" value={formatDate(row.submitted_at)} />
      </dl>
      {note && <p className="mt-3 rounded-xl bg-pm-peach/55 px-4 py-3 text-xs leading-5 text-pm-ink/65">Note mannequin : {note}</p>}
      {row.proof_url && <a href={row.proof_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-extrabold text-pm-coral underline underline-offset-4">Ouvrir la preuve ↗</a>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <form action={validateModelTransaction} className="grid gap-3 rounded-[1.2rem] bg-pm-sage p-4">
          <input type="hidden" name="id" value={row.id} />
          <label className="grid gap-2 text-xs font-extrabold uppercase tracking-[.06em] text-pm-teal">Note de validation
            <input name="validation_notes" maxLength={1200} placeholder="Optionnel" className="min-h-11 rounded-xl border border-pm-teal/10 bg-white px-3 text-sm font-medium normal-case tracking-normal text-pm-ink outline-none" />
          </label>
          <button type="submit" className="min-h-11 rounded-xl bg-pm-teal px-4 text-sm font-extrabold text-white">Valider et comptabiliser</button>
        </form>
        <form action={rejectModelTransaction} className="grid gap-3 rounded-[1.2rem] bg-pm-peach p-4">
          <input type="hidden" name="id" value={row.id} />
          <label className="grid gap-2 text-xs font-extrabold uppercase tracking-[.06em] text-pm-wine">Motif du rejet
            <input name="validation_notes" maxLength={1200} placeholder="Référence introuvable, montant incorrect…" className="min-h-11 rounded-xl border border-pm-wine/10 bg-white px-3 text-sm font-medium normal-case tracking-normal text-pm-ink outline-none" />
          </label>
          <button type="submit" className="min-h-11 rounded-xl bg-pm-wine px-4 text-sm font-extrabold text-white">Rejeter la déclaration</button>
        </form>
      </div>
    </article>
  );
}

function HistoryRow({ row }: { row: Row }) {
  const model = modelFor(row);
  const raw = row.raw_data && typeof row.raw_data === 'object' ? row.raw_data : {};
  const declaredName = typeof raw?.declared_name === 'string' ? raw.declared_name : null;
  return (
    <article className="grid gap-4 rounded-[1.4rem] border border-pm-ink/8 bg-white p-4 md:grid-cols-[1.2fr_.7fr_.8fr_auto] md:items-center">
      <div><Link href={row.model_id ? `/admin/talents/${encodeURIComponent(row.model_id)}` : '/admin/models'} className="font-bold hover:text-pm-coral">{declaredName || model?.name || 'Talent non rattaché'}</Link><p className="mt-1 text-xs text-pm-ink/45">{TYPE_LABELS[row.transaction_type || ''] || 'Paiement'} · {METHOD_LABELS[row.payment_method || ''] || 'Non précisé'}</p></div>
      <div><p className="font-playfair text-xl font-semibold">{money(row.amount)}</p><p className="mt-1 text-xs text-pm-ink/45">{formatDate(row.paid_at)}</p></div>
      <div><p className="text-xs font-extrabold uppercase tracking-[.06em] text-pm-ink/40">Référence</p><p className="mt-1 break-all text-sm font-semibold">{row.reference || '—'}</p></div>
      <span className={`justify-self-start rounded-full px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.06em] ${statusTone(row.status)}`}>{row.status === 'validated' ? 'Comptabilisée' : row.status === 'rejected' ? 'Rejetée' : 'À vérifier'}</span>
      {row.validation_notes && <p className="md:col-span-4 rounded-xl bg-pm-ivory px-4 py-3 text-xs leading-5 text-pm-ink/55">{row.validation_notes}</p>}
    </article>
  );
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <article className={`rounded-[1.7rem] p-5 sm:p-6 ${tone}`}><p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/55">{label}</p><p className="mt-4 font-playfair text-4xl font-semibold">{value}</p><p className="mt-2 text-xs font-semibold text-pm-ink/50">{note}</p></article>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-[10px] font-extrabold uppercase tracking-[.08em] text-pm-ink/40">{label}</dt><dd className="mt-1 break-all font-semibold text-pm-ink/75">{value}</dd></div>;
}
