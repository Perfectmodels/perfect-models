import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  AlertTriangle, ArrowDownLeft, ArrowUpRight, Banknote, BriefcaseBusiness,
  CalendarClock, ChevronRight, CircleDollarSign, FileText, PieChart,
  ReceiptText, Scale, UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import {
  formatDate, formatMoney, formatPaymentMethod, formatPaymentType,
  formatStatus, statusTone,
} from '@/lib/admin-formatters';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type FinanceView = 'overview' | 'cotisations' | 'invoices' | 'ledger' | 'bookings' | 'budgets';
type NamedRelation = { name?: string | null; title?: string | null };

const VIEWS = new Set<FinanceView>(['overview', 'cotisations', 'invoices', 'ledger', 'bookings', 'budgets']);

function relation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] || null : value || null;
}

function amount(value: unknown) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isInvoiceOverdue(row: any, now: Date) {
  if (row.status === 'overdue') return true;
  if (!row.due_at || ['paid', 'cancelled'].includes(row.status)) return false;
  return new Date(row.due_at).getTime() < now.getTime();
}

function StatusPill({ value }: { value: unknown }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[.05em] ${statusTone(value)}`}>{formatStatus(value)}</span>;
}

function SectionHeader({ kicker, title, description, action }: { kicker: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="control-kicker">{kicker}</p><h2 className="mt-2 font-playfair text-3xl font-semibold">{title}</h2>{description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-pm-ink/50">{description}</p> : null}</div>{action}</div>;
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-pm-ink/12 bg-pm-ivory px-5 py-10 text-center text-sm text-pm-ink/45">{children}</p>;
}

function ActionLink({ href, icon: Icon, title, meta, tone = 'bg-pm-ivory' }: { href: string; icon: LucideIcon; title: string; meta: string; tone?: string }) {
  return <Link href={href} className={`group flex min-h-28 items-start justify-between gap-4 rounded-2xl p-4 transition hover:-translate-y-0.5 ${tone}`}><div><Icon size={19} className="text-pm-coral"/><p className="mt-3 text-sm font-black">{title}</p><p className="mt-1 text-xs leading-5 text-pm-ink/45">{meta}</p></div><ChevronRight size={17} className="mt-1 text-pm-ink/25 transition group-hover:translate-x-0.5"/></Link>;
}

export default async function FinancePage({ searchParams }: { searchParams: SearchParams }) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/finance');
  if (!['admin', 'manager'].includes(profile.role) || !hasAdminPermission(profile, 'payments')) redirect(profile.role === 'manager' ? '/manager' : '/profil');

  const params = await searchParams;
  const requestedView = typeof params.view === 'string' ? params.view : 'overview';
  const view: FinanceView = VIEWS.has(requestedView as FinanceView) ? requestedView as FinanceView : 'overview';
  const supabase = createSupabaseAdminClient() as any;
  const today = new Date();
  const in30 = new Date(today.getTime() + 30 * 86_400_000);
  const in60 = new Date(today.getTime() + 60 * 86_400_000);
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
  const monthLabel = monthStart.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  const [
    { data: bookings }, { data: invoices }, { data: modelPayments },
    { data: currentMemberships }, { data: activeModels }, { data: contracts },
    { data: rights }, { data: quotes }, { data: ledger }, { data: budgets },
  ] = await Promise.all([
    supabase.from('bookings').select('id,title,fee_gross,agency_commission_amount,model_net_amount,travel_expenses,currency,status,starts_at,models(name),agency_clients(name)').neq('status', 'cancelled').order('starts_at', { ascending: false, nullsFirst: false }).limit(120),
    supabase.from('invoices').select('id,invoice_number,total,amount_paid,currency,status,issued_at,due_at,agency_clients(name),bookings(title)').neq('status', 'cancelled').order('due_at', { ascending: true, nullsFirst: false }).limit(120),
    supabase.from('monthly_payments').select('id,model_id,amount,currency,status,transaction_type,payment_method,reference,period,paid_at,submitted_at,models(name)').order('created_at', { ascending: false }).limit(100),
    supabase.from('monthly_payments').select('id,model_id,status,period,transaction_type').eq('transaction_type', 'membership_fee').gte('period', monthStart.toISOString().slice(0, 10)).lt('period', nextMonthStart.toISOString().slice(0, 10)),
    supabase.from('models').select('id,name,email,status').eq('is_active', true).neq('status', 'archived').order('name').limit(500),
    supabase.from('contracts').select('id,title,expires_at,status').in('status', ['sent', 'viewed', 'signed']).lte('expires_at', in30.toISOString()).gte('expires_at', today.toISOString()),
    supabase.from('image_rights').select('id,campaign,ends_on,status').in('status', ['active', 'expiring']).lte('ends_on', in60.toISOString().slice(0, 10)).gte('ends_on', today.toISOString().slice(0, 10)),
    supabase.from('quotes').select('id,status,total,currency').neq('status', 'cancelled'),
    supabase.from('finance_transactions').select('id,transaction_date,direction,category,label,amount,currency,status,payment_method,account,counterparty,reference').neq('status', 'cancelled').order('transaction_date', { ascending: false }).limit(150),
    supabase.from('finance_budgets').select('id,name,category,period_start,period_end,planned_income,planned_expense,currency,status').neq('status', 'cancelled').order('period_start', { ascending: false }).limit(80),
  ]);

  const bookingRows = Array.isArray(bookings) ? bookings : [];
  const invoiceRows = Array.isArray(invoices) ? invoices : [];
  const paymentRows = Array.isArray(modelPayments) ? modelPayments : [];
  const ledgerRows = Array.isArray(ledger) ? ledger : [];
  const budgetRows = Array.isArray(budgets) ? budgets : [];
  const modelRows = Array.isArray(activeModels) ? activeModels : [];
  const currentPaymentRows = Array.isArray(currentMemberships) ? currentMemberships : [];
  const confirmedThisMonth = new Set(currentPaymentRows.filter((row: any) => row.status === 'validated').map((row: any) => row.model_id));
  const pendingThisMonth = new Set<string>(currentPaymentRows.filter((row: any) => row.status === 'pending').map((row: any) => String(row.model_id)));
  const talentsToCheck = modelRows.filter((row: any) => !confirmedThisMonth.has(row.id));

  const grossRevenue = bookingRows.reduce((sum: number, row: any) => sum + amount(row.fee_gross), 0);
  const agencyCommission = bookingRows.reduce((sum: number, row: any) => sum + amount(row.agency_commission_amount), 0);
  const modelNet = bookingRows.reduce((sum: number, row: any) => sum + amount(row.model_net_amount), 0);
  const invoiced = invoiceRows.reduce((sum: number, row: any) => sum + amount(row.total), 0);
  const collected = invoiceRows.reduce((sum: number, row: any) => sum + amount(row.amount_paid), 0);
  const outstanding = Math.max(0, invoiced - collected);
  const cashIncome = ledgerRows.filter((row: any) => row.direction === 'income' && row.status === 'confirmed').reduce((sum: number, row: any) => sum + amount(row.amount), 0);
  const cashExpense = ledgerRows.filter((row: any) => row.direction === 'expense' && row.status === 'confirmed').reduce((sum: number, row: any) => sum + amount(row.amount), 0);
  const overdue = invoiceRows.filter((row: any) => isInvoiceOverdue(row, today));
  const pendingPayments = paymentRows.filter((row: any) => row.status === 'pending');
  const tabs: Array<{ key: FinanceView; label: string; count?: number }> = [
    { key: 'overview', label: 'Vue d’ensemble' },
    { key: 'cotisations', label: 'Cotisations', count: pendingPayments.length },
    { key: 'invoices', label: 'Factures', count: overdue.length },
    { key: 'ledger', label: 'Recettes & dépenses', count: ledgerRows.length },
    { key: 'bookings', label: 'Cachets & commissions', count: bookingRows.length },
    { key: 'budgets', label: 'Budgets', count: budgetRows.length },
  ];

  return <main className="space-y-5 pb-12 text-pm-ink">
    <header className="relative overflow-hidden rounded-[2rem] bg-pm-wine p-6 text-white sm:p-8">
      <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-pm-coral/25 blur-3xl"/>
      <div className="relative flex flex-wrap items-end justify-between gap-6"><div className="max-w-3xl"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Cockpit financier 360°</p><h1 className="mt-3 font-playfair text-4xl font-semibold sm:text-5xl">Une lecture métier, pas comptable.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/68">Identités, échéances, marges et règlements sont réunis par dossier. Les références techniques restent en arrière-plan.</p></div><div className="flex flex-wrap gap-2"><Link href="/admin/finance/transactions" className="control-button border-white/15 bg-white text-pm-wine">Nouvelle opération</Link><Link href="/admin/invoices" className="control-button border-white/25 bg-transparent text-white">Nouvelle facture</Link></div></div>
    </header>

    <nav aria-label="Navigation Finance" className="grid grid-cols-2 gap-2 rounded-[1.5rem] border border-pm-ink/[.07] bg-white p-2 sm:grid-cols-3 xl:grid-cols-6">
      {tabs.map((tab) => <Link key={tab.key} href={tab.key === 'overview' ? '/admin/finance' : `/admin/finance?view=${tab.key}`} aria-current={view === tab.key ? 'page' : undefined} className={`flex min-h-11 items-center justify-between gap-2 rounded-xl px-3 text-xs font-black transition ${view === tab.key ? 'bg-pm-ink text-white' : 'text-pm-ink/55 hover:bg-pm-ivory hover:text-pm-ink'}`}><span>{tab.label}</span>{typeof tab.count === 'number' ? <span className={`rounded-full px-2 py-0.5 text-[9px] ${view === tab.key ? 'bg-white/15' : 'bg-pm-peach text-pm-wine'}`}>{tab.count}</span> : null}</Link>)}
    </nav>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicateurs financiers">
      <Metric label="Volume bookings" value={formatMoney(grossRevenue)} note="Cachets bruts engagés" icon={BriefcaseBusiness}/>
      <Metric label="Commission agence" value={formatMoney(agencyCommission)} note="Marge calculée sur les bookings" icon={Scale}/>
      <Metric label="Net talents" value={formatMoney(modelNet)} note="Cachets dus aux mannequins" icon={UsersRound}/>
      <Metric label="À encaisser" value={formatMoney(outstanding)} note={`${overdue.length} facture${overdue.length > 1 ? 's' : ''} à relancer`} icon={ReceiptText} alert={overdue.length > 0}/>
    </section>

    {view === 'overview' && <Overview overdue={overdue.length} pendingPayments={pendingPayments.length} contracts={Array.isArray(contracts) ? contracts.length : 0} rights={Array.isArray(rights) ? rights.length : 0} quoteCount={Array.isArray(quotes) ? quotes.length : 0} invoiceCount={invoiceRows.length} collected={collected} cashIncome={cashIncome} cashExpense={cashExpense} ledgerRows={ledgerRows.slice(0, 6)}/>}
    {view === 'cotisations' && <MembershipView payments={paymentRows} talentsToCheck={talentsToCheck} pendingThisMonth={pendingThisMonth} monthLabel={monthLabel}/>}
    {view === 'invoices' && <InvoiceView invoices={invoiceRows} now={today}/>}
    {view === 'ledger' && <LedgerView rows={ledgerRows} income={cashIncome} expense={cashExpense}/>}
    {view === 'bookings' && <BookingFinanceView bookings={bookingRows}/>}
    {view === 'budgets' && <BudgetView budgets={budgetRows}/>}
  </main>;
}

function Metric({ label, value, note, icon: Icon, alert = false }: { label: string; value: string; note: string; icon: LucideIcon; alert?: boolean }) {
  return <article className={`rounded-[1.5rem] border p-4 sm:p-5 ${alert ? 'border-pm-coral/25 bg-pm-peach/60' : 'border-pm-ink/[.07] bg-white'}`}><div className="flex items-center justify-between"><p className="control-kicker">{label}</p><Icon size={18} className={alert ? 'text-pm-coral' : 'text-pm-ink/30'}/></div><p className="mt-4 font-playfair text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-pm-ink/45">{note}</p></article>;
}

function Overview({ overdue, pendingPayments, contracts, rights, quoteCount, invoiceCount, collected, cashIncome, cashExpense, ledgerRows }: { overdue: number; pendingPayments: number; contracts: number; rights: number; quoteCount: number; invoiceCount: number; collected: number; cashIncome: number; cashExpense: number; ledgerRows: any[] }) {
  return <div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
    <section className="control-card"><SectionHeader kicker="Priorités" title="À traiter maintenant" description="Chaque alerte ouvre directement le registre concerné."/><div className="mt-5 grid gap-3 sm:grid-cols-2"><ActionLink href="/admin/finance?view=invoices" icon={AlertTriangle} title="Factures à relancer" meta={`${overdue} facture${overdue > 1 ? 's' : ''} en retard`} tone={overdue ? 'bg-pm-peach' : 'bg-pm-ivory'}/><ActionLink href="/admin/payments?status=pending" icon={CircleDollarSign} title="Paiements à contrôler" meta={`${pendingPayments} déclaration${pendingPayments > 1 ? 's' : ''} en attente`} tone={pendingPayments ? 'bg-pm-gold-light/50' : 'bg-pm-ivory'}/><ActionLink href="/admin/contracts" icon={FileText} title="Contrats à renouveler" meta={`${contracts} échéance${contracts > 1 ? 's' : ''} sous 30 jours`}/><ActionLink href="/admin/image-rights" icon={CalendarClock} title="Droits d’image" meta={`${rights} expiration${rights > 1 ? 's' : ''} sous 60 jours`}/></div></section>
    <section className="control-card"><SectionHeader kicker="Trésorerie" title="Mouvements confirmés" description={`${formatMoney(cashIncome)} encaissés · ${formatMoney(cashExpense)} dépensés · solde ${formatMoney(cashIncome - cashExpense)}`} action={<Link href="/admin/finance?view=ledger" className="text-xs font-black text-pm-coral">Tout voir →</Link>}/><div className="mt-5 space-y-2">{ledgerRows.length ? ledgerRows.map((row) => <LedgerLine key={row.id} row={row}/>) : <EmptyState>Aucun mouvement financier enregistré.</EmptyState>}</div></section>
    <section className="control-card xl:col-span-2"><SectionHeader kicker="Accès directs" title="Piloter les dossiers financiers"/><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><ActionLink href="/admin/quotes" icon={FileText} title="Devis" meta={`${quoteCount} dossier${quoteCount > 1 ? 's' : ''}`}/><ActionLink href="/admin/invoices" icon={ReceiptText} title="Factures clients" meta={`${invoiceCount} facture${invoiceCount > 1 ? 's' : ''}`}/><ActionLink href="/admin/invoice-payments" icon={Banknote} title="Encaissements" meta={`${formatMoney(collected)} reçus`}/><ActionLink href="/admin/finance/budgets" icon={PieChart} title="Budgets" meta="Prévisions et enveloppes"/></div></section>
  </div>;
}

function MembershipView({ payments, talentsToCheck, pendingThisMonth, monthLabel }: { payments: any[]; talentsToCheck: any[]; pendingThisMonth: Set<string>; monthLabel: string }) {
  return <div className="grid gap-5 xl:grid-cols-[.78fr_1.22fr]">
    <section className="control-card"><SectionHeader kicker="Suivi mensuel" title={`À vérifier · ${monthLabel}`} description="Talents actifs sans cotisation mensuelle confirmée pour la période. Cette liste sert à contrôler ou relancer, sans présumer d’une dette." action={<Link href="/admin/finance/cotisations" className="text-xs font-black text-pm-coral">Saisir / modifier →</Link>}/><div className="mt-5 space-y-2">{talentsToCheck.slice(0, 15).map((model) => <Link key={model.id} href={`/admin/talents/${encodeURIComponent(model.id)}`} className="flex items-center justify-between gap-4 rounded-xl bg-pm-ivory px-4 py-3 transition hover:bg-pm-peach/55"><div className="min-w-0"><p className="truncate text-sm font-black">{model.name || 'Talent sans nom'}</p><p className="mt-0.5 truncate text-xs text-pm-ink/40">{model.email || 'Coordonnées non renseignées'}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black ${pendingThisMonth.has(String(model.id)) ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-900'}`}>{pendingThisMonth.has(String(model.id)) ? 'À valider' : 'À contrôler'}</span></Link>)}{!talentsToCheck.length ? <EmptyState>Toutes les cotisations mensuelles attendues sont confirmées pour cette période.</EmptyState> : null}{talentsToCheck.length > 15 ? <p className="pt-2 text-center text-xs font-bold text-pm-ink/40">+ {talentsToCheck.length - 15} talent{talentsToCheck.length - 15 > 1 ? 's' : ''} à consulter dans le registre</p> : null}</div></section>
    <section className="control-card"><SectionHeader kicker="Cotisations & paiements talents" title="Qui a payé, quoi et quand" description="Montant, moyen, date, référence et statut sont lisibles sur une seule ligne." action={<Link href="/admin/payments" className="control-button bg-pm-ink text-white">Contrôler les paiements</Link>}/><div className="mt-5 space-y-2">{payments.length ? payments.slice(0, 25).map((row) => <PaymentLine key={row.id} row={row}/>) : <EmptyState>Aucun paiement talent enregistré.</EmptyState>}</div></section>
  </div>;
}

function PaymentLine({ row }: { row: any }) {
  const model = relation<NamedRelation>(row.models);
  return <article className="grid gap-3 rounded-2xl border border-pm-ink/[.07] bg-white p-4 sm:grid-cols-[1.1fr_1fr_auto] sm:items-center"><div className="min-w-0"><Link href={row.model_id ? `/admin/talents/${encodeURIComponent(row.model_id)}` : '/admin/models'} className="truncate text-sm font-black hover:text-pm-coral">{model?.name || 'Talent non rattaché'}</Link><p className="mt-1 text-xs text-pm-ink/42">{formatPaymentType(row.transaction_type)} · {formatPaymentMethod(row.payment_method)}</p></div><div><p className="font-playfair text-xl font-semibold">{formatMoney(row.amount, row.currency)}</p><p className="mt-1 text-xs text-pm-ink/42">{formatDate(row.paid_at || row.submitted_at)} · {row.reference || 'Sans référence'}</p></div><StatusPill value={row.status}/></article>;
}

function InvoiceView({ invoices, now }: { invoices: any[]; now: Date }) {
  return <section className="control-card"><SectionHeader kicker="Facturation client" title="Factures, paiements et impayés" description="Le client, le projet, l’échéance et le reste à payer sont rapprochés dans la même vue." action={<div className="flex gap-2"><Link href="/admin/invoice-payments" className="control-button border border-pm-ink/12 bg-white">Encaissements</Link><Link href="/admin/invoices" className="control-button bg-pm-ink text-white">Gérer les factures</Link></div>}/><div className="mt-6 grid gap-3 lg:grid-cols-2">{invoices.length ? invoices.map((row) => { const client = relation<NamedRelation>(row.agency_clients); const booking = relation<NamedRelation>(row.bookings); const remaining = Math.max(0, amount(row.total) - amount(row.amount_paid)); const late = isInvoiceOverdue(row, now); return <article key={row.id} className={`rounded-2xl border p-4 ${late ? 'border-pm-coral/25 bg-pm-peach/45' : 'border-pm-ink/[.07] bg-white'}`}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.07em] text-pm-coral">{row.invoice_number || 'Facture'}</p><h3 className="mt-2 font-playfair text-2xl font-semibold">{client?.name || 'Client non rattaché'}</h3><p className="mt-1 text-xs text-pm-ink/45">{booking?.title || 'Projet non précisé'}</p></div><StatusPill value={late ? 'overdue' : row.status}/></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><MiniInfo label="Total" value={formatMoney(row.total, row.currency)}/><MiniInfo label="Payé" value={formatMoney(row.amount_paid, row.currency)}/><MiniInfo label="Reste" value={formatMoney(remaining, row.currency)}/><MiniInfo label="Échéance" value={formatDate(row.due_at)}/></div></article>; }) : <div className="lg:col-span-2"><EmptyState>Aucune facture client enregistrée.</EmptyState></div>}</div></section>;
}

function LedgerView({ rows, income, expense }: { rows: any[]; income: number; expense: number }) {
  return <section className="control-card"><SectionHeader kicker="Grand livre" title="Recettes, dépenses et transferts" description={`${formatMoney(income)} de recettes confirmées · ${formatMoney(expense)} de dépenses confirmées`} action={<Link href="/admin/finance/transactions" className="control-button bg-pm-ink text-white">Créer / modifier</Link>}/><div className="mt-6 space-y-2">{rows.length ? rows.map((row) => <LedgerLine key={row.id} row={row}/>) : <EmptyState>Aucun mouvement financier enregistré.</EmptyState>}</div></section>;
}

function LedgerLine({ row }: { row: any }) {
  const income = row.direction === 'income';
  const direction = income ? 'Recette' : row.direction === 'expense' ? 'Dépense' : 'Transfert';
  return <article className="grid gap-3 rounded-2xl border border-pm-ink/[.07] bg-white p-4 sm:grid-cols-[auto_1.2fr_.8fr_auto] sm:items-center"><span className={`grid h-10 w-10 place-items-center rounded-full ${income ? 'bg-emerald-100 text-emerald-800' : row.direction === 'expense' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'}`}>{income ? <ArrowDownLeft size={18}/> : <ArrowUpRight size={18}/>}</span><div className="min-w-0"><p className="truncate text-sm font-black">{row.label || 'Opération financière'}</p><p className="mt-1 truncate text-xs text-pm-ink/42">{direction} · {row.category || 'Sans catégorie'} · {row.counterparty || 'Tiers non précisé'}</p></div><div><p className="font-playfair text-xl font-semibold">{formatMoney(row.amount, row.currency)}</p><p className="mt-1 text-xs text-pm-ink/42">{formatDate(row.transaction_date)} · {formatPaymentMethod(row.payment_method)}</p></div><StatusPill value={row.status}/></article>;
}

function BookingFinanceView({ bookings }: { bookings: any[] }) {
  return <section className="control-card"><SectionHeader kicker="Rentabilité des missions" title="Cachets mannequins & commissions agence" description="Chaque ligne rapproche le projet, le client, le talent et la ventilation financière." action={<Link href="/admin/bookings" className="control-button bg-pm-ink text-white">Gérer les bookings</Link>}/><div className="mt-6 grid gap-3 lg:grid-cols-2">{bookings.length ? bookings.map((row) => { const model = relation<NamedRelation>(row.models); const client = relation<NamedRelation>(row.agency_clients); return <article key={row.id} className="rounded-2xl border border-pm-ink/[.07] bg-white p-4"><div className="flex items-start justify-between gap-4"><div><h3 className="font-playfair text-2xl font-semibold">{row.title || 'Booking'}</h3><p className="mt-1 text-xs text-pm-ink/45">{model?.name || 'Talent non rattaché'} · {client?.name || 'Client non rattaché'}</p></div><StatusPill value={row.status}/></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><MiniInfo label="Brut" value={formatMoney(row.fee_gross, row.currency)}/><MiniInfo label="Commission" value={formatMoney(row.agency_commission_amount, row.currency)}/><MiniInfo label="Net talent" value={formatMoney(row.model_net_amount, row.currency)}/><MiniInfo label="Frais" value={formatMoney(row.travel_expenses, row.currency)}/></div></article>; }) : <div className="lg:col-span-2"><EmptyState>Aucun booking financier enregistré.</EmptyState></div>}</div></section>;
}

function BudgetView({ budgets }: { budgets: any[] }) {
  return <section className="control-card"><SectionHeader kicker="Prévisions" title="Budgets & enveloppes" description="Recettes prévues, dépenses prévues et marge cible restent visibles sans ouvrir le formulaire." action={<Link href="/admin/finance/budgets" className="control-button bg-pm-ink text-white">Créer / modifier</Link>}/><div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{budgets.length ? budgets.map((row) => <article key={row.id} className="rounded-2xl border border-pm-ink/[.07] bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.08em] text-pm-coral">{row.category || 'Budget agence'}</p><h3 className="mt-2 font-playfair text-2xl font-semibold">{row.name || 'Budget'}</h3></div><StatusPill value={row.status}/></div><div className="mt-4 grid grid-cols-2 gap-2"><MiniInfo label="Recettes prévues" value={formatMoney(row.planned_income, row.currency)}/><MiniInfo label="Dépenses prévues" value={formatMoney(row.planned_expense, row.currency)}/><MiniInfo label="Solde cible" value={formatMoney(amount(row.planned_income) - amount(row.planned_expense), row.currency)}/><MiniInfo label="Période" value={`${formatDate(row.period_start)} → ${formatDate(row.period_end)}`}/></div></article>) : <div className="md:col-span-2 xl:col-span-3"><EmptyState>Aucun budget enregistré.</EmptyState></div>}</div></section>;
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl bg-pm-ivory px-3 py-2"><p className="text-[9px] font-black uppercase tracking-[.06em] text-pm-ink/35">{label}</p><p className="mt-1 break-words text-xs font-bold text-pm-ink/70">{value}</p></div>;
}
