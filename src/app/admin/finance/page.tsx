import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, Banknote, FileText, ReceiptText, ShieldCheck } from 'lucide-react';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasAdminPermission } from '@/lib/auth/admin-access';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const money = (value: number) => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'XAF',maximumFractionDigits:0}).format(value || 0);

export default async function FinancePage() {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/finance');
  if (!['admin','manager'].includes(profile.role) || !hasAdminPermission(profile,'payments')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const supabase = createSupabaseAdminClient() as any;
  const today = new Date(); const in30 = new Date(today.getTime()+30*86400000); const in60 = new Date(today.getTime()+60*86400000);
  const [{data: bookings},{data: invoices},{data: modelPayments},{data: contracts},{data:rights},{data:quotes}] = await Promise.all([
    supabase.from('bookings').select('fee_gross,agency_commission_amount,model_net_amount,currency,status').in('status',['confirmed','in_production','completed']),
    supabase.from('invoices').select('id,invoice_number,total,amount_paid,currency,status,due_at').neq('status','cancelled'),
    supabase.from('monthly_payments').select('amount,currency,status'),
    supabase.from('contracts').select('id,title,expires_at,status').in('status',['sent','viewed','signed']).lte('expires_at',in30.toISOString()).gte('expires_at',today.toISOString()),
    supabase.from('image_rights').select('id,campaign,ends_on,status').in('status',['active','expiring']).lte('ends_on',in60.toISOString().slice(0,10)).gte('ends_on',today.toISOString().slice(0,10)),
    supabase.from('quotes').select('id,status,total,currency').neq('status','cancelled'),
  ]);
  const revenue = (bookings||[]).reduce((sum:number,row:any)=>sum+Number(row.fee_gross||0),0);
  const commission = (bookings||[]).reduce((sum:number,row:any)=>sum+Number(row.agency_commission_amount||0),0);
  const modelNet = (bookings||[]).reduce((sum:number,row:any)=>sum+Number(row.model_net_amount||0),0);
  const invoiced = (invoices||[]).reduce((sum:number,row:any)=>sum+Number(row.total||0),0);
  const collected = (invoices||[]).reduce((sum:number,row:any)=>sum+Number(row.amount_paid||0),0);
  const outstanding = Math.max(0,invoiced-collected);
  const overdue = (invoices||[]).filter((row:any)=>row.status==='overdue'||(row.due_at&&new Date(row.due_at)<today&&row.status!=='paid'));
  const cards = [
    ['Volume bookings',money(revenue),'Cachets bruts engagés','/admin/bookings'],
    ['Commission agence',money(commission),'Calculée automatiquement','/admin/bookings'],
    ['À encaisser',money(outstanding),`${overdue.length} facture(s) en retard`,'/admin/invoices'],
    ['Net mannequins',money(modelNet),'Montant théorique hors avances','/admin/payments'],
  ];
  return <div className="space-y-6 pb-12"><header className="rounded-[2rem] bg-pm-wine p-7 text-white sm:p-9"><p className="text-[10px] font-black uppercase tracking-[.2em] text-pm-gold-light">Finance agence</p><h1 className="mt-3 font-playfair text-5xl font-semibold">De l’option au paiement mannequin</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">Booking → devis → contrat → facture → encaissement → commission → cachet mannequin.</p></header><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,meta,href])=><Link key={label} href={href} className="control-card block transition hover:-translate-y-0.5"><p className="control-kicker">{label}</p><p className="mt-5 font-playfair text-4xl font-semibold">{value}</p><p className="mt-2 text-xs text-pm-ink/45">{meta}</p></Link>)}</section>
  <section className="grid gap-5 lg:grid-cols-2"><div className="control-card"><div className="flex items-center gap-3"><AlertTriangle className="text-pm-coral"/><div><p className="control-kicker">À traiter</p><h2 className="font-playfair text-2xl font-semibold">Échéances financières & juridiques</h2></div></div><div className="mt-5 space-y-2"><Link href="/admin/invoices" className="flex items-center justify-between rounded-xl bg-pm-ivory p-3 text-sm"><span>Factures en retard</span><b>{overdue.length}</b></Link><Link href="/admin/contracts" className="flex items-center justify-between rounded-xl bg-pm-ivory p-3 text-sm"><span>Contrats expirant sous 30 jours</span><b>{(contracts||[]).length}</b></Link><Link href="/admin/image-rights" className="flex items-center justify-between rounded-xl bg-pm-ivory p-3 text-sm"><span>Droits d’image expirant sous 60 jours</span><b>{(rights||[]).length}</b></Link></div></div><div className="control-card"><p className="control-kicker">Workflow</p><h2 className="mt-2 font-playfair text-2xl font-semibold">Documents financiers</h2><div className="mt-5 grid grid-cols-2 gap-3"><Link href="/admin/quotes" className="rounded-xl bg-pm-peach p-4"><FileText/><p className="mt-4 font-bold">Devis</p><p className="text-xs text-pm-ink/45">{(quotes||[]).length} dossiers</p></Link><Link href="/admin/invoices" className="rounded-xl bg-pm-peach p-4"><ReceiptText/><p className="mt-4 font-bold">Factures</p><p className="text-xs text-pm-ink/45">{(invoices||[]).length} dossiers</p></Link><Link href="/admin/invoice-payments" className="rounded-xl bg-pm-sage p-4"><Banknote/><p className="mt-4 font-bold">Encaissements</p><p className="text-xs text-pm-ink/45">{money(collected)}</p></Link><Link href="/admin/contracts" className="rounded-xl bg-pm-sage p-4"><ShieldCheck/><p className="mt-4 font-bold">Contrats</p><p className="text-xs text-pm-ink/45">Suivi signature</p></Link></div></div></section>
  </div>;
}
