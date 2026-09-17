import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { submitModelPayment } from './actions';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type Payment = {
  id: string;
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
  cash: 'Espèces',
  airtel_money: 'Airtel Money',
  moov_money: 'Moov Money',
  bank_transfer: 'Virement bancaire',
  other: 'Autre moyen',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'En vérification',
  validated: 'Validée et comptabilisée',
  rejected: 'Rejetée',
};

function money(value: number | string | null | undefined) {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0))} FCFA`;
}

function date(value?: string | null) {
  if (!value) return 'Date non renseignée';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function tone(status: string) {
  if (status === 'validated') return 'bg-pm-sage text-pm-teal';
  if (status === 'rejected') return 'bg-pm-peach text-pm-wine';
  return 'bg-pm-gold-light/55 text-pm-ink';
}

export default async function PaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/profil/paiements');
  if (profile.role === 'admin') redirect('/admin/payments');
  if (profile.role === 'manager') redirect('/admin/payments');
  if (profile.role !== 'student') redirect('/profil');

  const params = await searchParams;
  const supabase = createSupabaseAdminClient() as any;
  const { data: model } = await supabase.from('models').select('id,name').eq('id', profile.profileId).maybeSingle();
  if (!model?.id) redirect('/profil');

  const { data, error } = await supabase
    .from('monthly_payments')
    .select('id,amount,currency,status,transaction_type,payment_method,reference,proof_url,paid_at,submitted_at,validated_at,validation_notes,raw_data')
    .eq('model_id', model.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) throw new Error(`Lecture des paiements impossible: ${error.message}`);

  const payments = (Array.isArray(data) ? data : []) as Payment[];
  const validatedTotal = payments.filter((item) => item.status === 'validated').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingTotal = payments.filter((item) => item.status === 'pending').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingCount = payments.filter((item) => item.status === 'pending').length;
  const submitted = params.submitted === '1';
  const hasError = typeof params.error === 'string';

  return (
    <main className="min-h-screen bg-pm-ivory px-5 py-10 text-pm-ink sm:px-8 lg:px-10">
      <div className="mx-auto max-w-[1500px] space-y-7">
        <section className="relative overflow-hidden rounded-[2.2rem] bg-pm-teal p-6 text-white sm:p-9 lg:p-12">
          <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-pm-gold-light/35 blur-3xl" />
          <div className="relative grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.15em] text-pm-gold-light">Paiements & transactions</p>
              <h1 className="mt-4 font-playfair text-5xl font-semibold leading-[.92] tracking-[-.04em] sm:text-6xl">Déclarez vos paiements à l’agence.</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75">Une déclaration reste en vérification jusqu’à ce que l’administration confirme l’existence de la transaction. Seules les opérations validées sont comptabilisées.</p>
            </div>
            <div className="rounded-[1.7rem] border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-extrabold uppercase tracking-[.1em] text-white/65">Référence adhésion actuelle</p>
              <p className="mt-3 font-playfair text-5xl font-semibold">20 000</p>
              <p className="mt-2 text-xs leading-5 text-white/70">15 000 inscription + 1 500 cotisation + 3 500 commission agence.</p>
            </div>
          </div>
        </section>

        {submitted && <div className="rounded-[1.4rem] bg-pm-sage px-5 py-4 text-sm font-bold text-pm-teal">Transaction envoyée. Elle apparaîtra comme comptabilisée après validation par l’administration.</div>}
        {hasError && <div className="rounded-[1.4rem] bg-pm-peach px-5 py-4 text-sm font-bold text-pm-wine">La déclaration n’a pas pu être enregistrée. Vérifiez le montant, la date, le moyen de paiement et la référence puis réessayez.</div>}

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Résumé financier">
          <Metric label="Total validé" value={money(validatedTotal)} note="Montant réellement comptabilisé" tone="bg-pm-sage" />
          <Metric label="En vérification" value={money(pendingTotal)} note={`${pendingCount} transaction${pendingCount > 1 ? 's' : ''} à contrôler`} tone="bg-pm-gold-light/45" />
          <Metric label="Historique" value={String(payments.length)} note="Déclarations et saisies administratives" tone="bg-pm-peach" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
          <section className="control-card">
            <p className="control-kicker">Nouvelle déclaration</p>
            <h2 className="mt-2 font-playfair text-3xl font-semibold">Soumettre une transaction</h2>
            <p className="mt-3 text-sm leading-6 text-pm-ink/55">Renseignez exactement la référence figurant sur votre reçu, transfert Mobile Money ou preuve de paiement. L’administration vérifiera ces informations avant validation.</p>

            <form action={submitModelPayment} className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-bold">
                Objet du paiement
                <select name="transaction_type" required defaultValue="membership_package" className="min-h-12 rounded-2xl border border-pm-ink/10 bg-white px-4 font-medium outline-none focus:border-pm-coral">
                  <option value="membership_package">Pack adhésion — 20 000 FCFA</option>
                  <option value="registration">Inscription</option>
                  <option value="membership_fee">Cotisation</option>
                  <option value="agency_commission">Commission agence</option>
                  <option value="other">Autre paiement</option>
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Montant versé (FCFA)
                  <input name="amount" type="number" min="1" max="10000000" step="1" required inputMode="numeric" placeholder="20000" className="min-h-12 rounded-2xl border border-pm-ink/10 bg-white px-4 font-medium outline-none focus:border-pm-coral" />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Date du paiement
                  <input name="payment_date" type="date" required className="min-h-12 rounded-2xl border border-pm-ink/10 bg-white px-4 font-medium outline-none focus:border-pm-coral" />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-bold">
                Moyen de paiement
                <select name="payment_method" required defaultValue="airtel_money" className="min-h-12 rounded-2xl border border-pm-ink/10 bg-white px-4 font-medium outline-none focus:border-pm-coral">
                  <option value="airtel_money">Airtel Money</option>
                  <option value="moov_money">Moov Money</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="cash">Espèces / reçu</option>
                  <option value="other">Autre moyen</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Référence de transaction / n° de reçu
                <input name="reference" type="text" required minLength={3} maxLength={160} placeholder="Ex. référence Airtel Money ou numéro de reçu" className="min-h-12 rounded-2xl border border-pm-ink/10 bg-white px-4 font-medium outline-none focus:border-pm-coral" />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Lien vers une preuve <span className="font-medium text-pm-ink/45">(facultatif)</span>
                <input name="proof_url" type="url" maxLength={1000} placeholder="https://…" className="min-h-12 rounded-2xl border border-pm-ink/10 bg-white px-4 font-medium outline-none focus:border-pm-coral" />
              </label>

              <label className="grid gap-2 text-sm font-bold">
                Note <span className="font-medium text-pm-ink/45">(facultatif)</span>
                <textarea name="note" maxLength={1200} rows={3} placeholder="Précision utile pour la vérification" className="rounded-2xl border border-pm-ink/10 bg-white px-4 py-3 font-medium outline-none focus:border-pm-coral" />
              </label>

              <button type="submit" className="control-button mt-2 w-full justify-center">Soumettre à l’administration ↗</button>
            </form>
          </section>

          <section className="control-card">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div><p className="control-kicker">Historique</p><h2 className="mt-2 font-playfair text-3xl font-semibold">Mes transactions</h2></div>
              <Link href="/profil" className="inline-flex min-h-11 items-center text-xs font-extrabold text-pm-coral underline underline-offset-4">Retour au tableau de bord ↗</Link>
            </div>

            <div className="mt-6 grid gap-3">
              {payments.map((item) => {
                const raw = item.raw_data && typeof item.raw_data === 'object' ? item.raw_data : {};
                const declaredName = typeof raw?.declared_name === 'string' ? raw.declared_name : null;
                return (
                  <article key={item.id} className="rounded-[1.5rem] border border-pm-ink/8 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/45">{TYPE_LABELS[item.transaction_type || ''] || 'Paiement'} · {METHOD_LABELS[item.payment_method || ''] || 'Moyen non précisé'}</p>
                        <p className="mt-2 font-playfair text-3xl font-semibold">{money(item.amount)}</p>
                        {declaredName && <p className="mt-1 text-xs font-semibold text-pm-ink/45">Enregistré pour {declaredName}</p>}
                      </div>
                      <span className={`rounded-full px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.06em] ${tone(item.status)}`}>{STATUS_LABELS[item.status] || item.status}</span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-pm-ink/60 sm:grid-cols-2">
                      <p><strong className="text-pm-ink">Paiement :</strong> {date(item.paid_at)}</p>
                      <p><strong className="text-pm-ink">Référence :</strong> {item.reference || 'Non renseignée'}</p>
                    </div>
                    {item.validation_notes && <p className="mt-4 rounded-xl bg-pm-ivory px-4 py-3 text-xs leading-5 text-pm-ink/60">{item.validation_notes}</p>}
                    {item.proof_url && <a href={item.proof_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex text-xs font-extrabold text-pm-coral underline underline-offset-4">Voir la preuve ↗</a>}
                  </article>
                );
              })}
              {!payments.length && <p className="rounded-[1.5rem] bg-pm-ivory p-6 text-sm text-pm-ink/50">Aucune transaction n’est encore enregistrée sur votre fiche.</p>}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <article className={`rounded-[1.7rem] p-5 sm:p-6 ${tone}`}><p className="text-xs font-extrabold uppercase tracking-[.08em] text-pm-ink/55">{label}</p><p className="mt-4 font-playfair text-4xl font-semibold">{value}</p><p className="mt-2 text-xs font-semibold text-pm-ink/50">{note}</p></article>;
}
