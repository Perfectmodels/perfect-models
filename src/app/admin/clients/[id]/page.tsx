import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import TalentRecordsPanel from '@/components/admin/TalentRecordsPanel';
import { getCurrentAppProfile } from '@/lib/auth/profile';
import { hasResourcePermission } from '@/lib/auth/admin-access';
import { RESOURCE_DEFINITIONS, type ResourceName, type CrudField } from '@/lib/agency-resource-registry';
import { hydrateAdminRelationOptions } from '@/lib/admin-relation-options';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { formatDate, formatMoney, formatStatus } from '@/lib/admin-formatters';

export const dynamic = 'force-dynamic';
type Row = Record<string, unknown>;
const sections: { key: string; label: string; resource: ResourceName }[] = [
  { key: 'company', label: 'Entreprise', resource: 'clients' },
  { key: 'contacts', label: 'Contacts', resource: 'client-contacts' },
  { key: 'castings', label: 'Castings', resource: 'castings' },
  { key: 'bookings', label: 'Bookings', resource: 'bookings' },
  { key: 'quotes', label: 'Devis', resource: 'quotes' },
  { key: 'contracts', label: 'Contrats & documents', resource: 'contracts' },
  { key: 'invoices', label: 'Factures', resource: 'invoices' },
  { key: 'payments', label: 'Paiements', resource: 'invoice-payments' },
  { key: 'selections', label: 'Sélections', resource: 'client-selections' },
  { key: 'talents', label: 'Talents sélectionnés', resource: 'selection-items' },
  { key: 'messages', label: 'Communications', resource: 'messages' },
  { key: 'notes', label: 'Notes internes', resource: 'clients' },
];
const relationPermissions: Record<string, ResourceName> = {
  casting_id: 'castings', booking_id: 'bookings', booking_request_id: 'booking-requests',
  quote_id: 'quotes', invoice_id: 'invoices', selection_id: 'client-selections',
};
const financialFields = new Set(['fee_gross', 'agency_commission_rate', 'agency_commission_amount', 'model_net_amount', 'travel_expenses']);
const pageSize = 20;

export default async function Client360Page({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const profile = await getCurrentAppProfile();
  if (!profile) redirect('/login?next=/admin/clients');
  if (!hasResourcePermission(profile, 'clients')) redirect(profile.role === 'manager' ? '/manager' : '/profil');
  const [{ id }, query] = await Promise.all([params, searchParams]);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const db = createSupabaseAdminClient() as any;
  const { data: client, error } = await db.from('agency_clients').select('id,name,client_type,industry,status,website_url,billing_email,billing_phone,address,city,country,notes,created_at,updated_at').eq('id', id).maybeSingle();
  if (error) throw new Error('Impossible de charger la fiche client. Réessayez.');
  if (!client) notFound();
  const allowed = sections.filter((section) => hasResourcePermission(profile, section.resource));
  const tab = query.tab || 'overview';
  const section = allowed.find((item) => item.key === tab);
  if (!section && !['overview', 'history'].includes(tab)) notFound();
  const href = (key: string, page = 1) => `/admin/clients/${encodeURIComponent(id)}?tab=${key}&page=${page}`;
  const page = Math.max(1, Math.min(10000, Math.floor(Number(query.page) || 1)));

  // Only the active tab loads records. Overview queries exact counts, never estimated totals.
  const counts = tab === 'overview' ? await Promise.all(allowed.filter((item) => !['clients', 'invoice-payments', 'selection-items'].includes(item.resource)).map(async (item) => {
    const definition = RESOURCE_DEFINITIONS[item.resource];
    const result = await db.from(definition.table).select('id', { count: 'exact', head: true }).eq('client_id', id);
    return { ...item, count: result.error ? null : result.count };
  })) : [];

  let rows: Row[] = [];
  let fields: CrudField[] = [];
  let columns: readonly string[] = [];
  let total = 0;
  let loadError = '';
  let canCreate = true;
  let documents: Row[] = [];
  let invoiceBalances: Row[] = [];
  const fixedValues: Record<string, unknown> = {};
  if (section) {
    const definition = RESOURCE_DEFINITIONS[section.resource];
    if (section.resource === 'clients') {
      rows = [client];
      total = 1;
      canCreate = false;
    } else {
      let request = db.from(definition.table).select('*', { count: 'exact' });
      if (section.resource === 'invoice-payments') {
        // Inner join prevents unrelated receipts from entering this client's dossier.
        request = db.from('invoice_payments').select('*,invoices!inner(client_id,currency)', { count: 'exact' }).eq('invoices.client_id', id);
      } else if (section.resource === 'selection-items') {
        request = db.from('client_selection_items').select('*,client_selections!inner(client_id)', { count: 'exact' }).eq('client_selections.client_id', id);
      } else {
        request = request.eq('client_id', id);
        fixedValues.client_id = id;
      }
      const result = await request.order(definition.orderBy, { ascending: false, nullsFirst: false }).order('id').range((page - 1) * pageSize, page * pageSize - 1);
      if (result.error) loadError = 'Ce volet ne peut pas être chargé. Réessayez avant toute modification.';
      rows = (result.data || []).map((row: any) => ({ ...row, ...(row.invoices?.currency ? { currency: row.invoices.currency } : {}) }));
      total = result.count || 0;
    }
    fields = definition.fields.filter((field) => {
      if (field.name in fixedValues || ['metadata', 'provider_message_id', 'booking_request_id', 'amount_paid'].includes(field.name)) return false;
      if (tab === 'notes') return field.name === 'notes';
      if (tab === 'company' && field.name === 'notes') return false;
      if (relationPermissions[field.name] && !hasResourcePermission(profile, relationPermissions[field.name])) return false;
      if (section.resource === 'bookings' && financialFields.has(field.name) && !hasResourcePermission(profile, 'invoices')) return false;
      return true;
    });
    try {
      fields = await hydrateAdminRelationOptions(db, fields, id);
    } catch {
      loadError = 'Les dossiers liés ne peuvent pas être chargés. Réessayez avant toute modification.';
    }
    if (section.resource === 'invoice-payments') canCreate = Boolean(fields.find((field) => field.name === 'invoice_id')?.options?.length);
    if (section.resource === 'selection-items') canCreate = Boolean(fields.find((field) => field.name === 'selection_id')?.options?.length);
    columns = definition.columns.filter((column) => fields.some((field) => field.name === column));
    if (tab === 'notes') columns = ['notes'];
    if (tab === 'invoices') columns = ['invoice_number', 'total', 'due_at', 'status'];
    if (tab === 'quotes') columns = ['quote_number', 'total', 'valid_until', 'status'];
    documents = tab === 'contracts' ? rows.filter((row) => typeof row.document_url === 'string' && /^https?:\/\//i.test(row.document_url)) : [];
    invoiceBalances = tab === 'invoices' ? rows.map((row) => ({ id: row.id, invoice_number: row.invoice_number, total: row.total, amount_paid: row.amount_paid, currency: row.currency, status: row.status })) : [];
    // Do not serialize hidden metadata or restricted financial fields into the browser.
    const visible = new Set(['id', 'currency', ...(section.resource === 'clients' ? ['name'] : []), ...fields.map((field) => field.name)]);
    rows = rows.map((row) => Object.fromEntries(Object.entries(row).filter(([key]) => visible.has(key))));
  }

  const history = tab === 'history' ? await Promise.all(allowed.filter((item) => !['clients', 'invoice-payments', 'selection-items'].includes(item.resource)).map(async (item) => {
    const definition = RESOURCE_DEFINITIONS[item.resource];
    const titleField = item.resource === 'client-contacts' ? 'first_name,last_name' : item.resource === 'quotes' ? 'quote_number' : item.resource === 'invoices' ? 'invoice_number' : item.resource === 'messages' ? 'subject' : 'title';
    const result = await db.from(definition.table).select(`id,${titleField},${definition.orderBy}`).eq('client_id', id).order(definition.orderBy, { ascending: false }).limit(10);
    return { error: Boolean(result.error), items: (result.data || []).map((row: any) => ({
      id: `${item.key}-${row.id}`, label: row.title || row.subject || row.quote_number || row.invoice_number || [row.first_name, row.last_name].filter(Boolean).join(' ') || item.label,
      date: String(row[definition.orderBy] || ''), section: item,
    })) };
  })) : [];

  return <div className="space-y-5">
    <header className="rounded-3xl border border-pm-ink/10 bg-white p-5 sm:p-7">
      <Link href="/admin/clients" className="text-xs font-bold text-pm-coral">← Tous les clients</Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0"><p className="control-kicker">Client 360°</p><h1 className="mt-1 break-words font-playfair text-3xl font-semibold sm:text-4xl">{client.name}</h1><p className="mt-2 text-sm text-pm-ink/60">{[client.industry, client.city, client.country].filter(Boolean).join(' · ') || 'Informations entreprise à compléter'}</p></div>
        <span className="rounded-full bg-pm-peach px-3 py-2 text-xs font-bold">{formatStatus(client.status)}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs"><Link href={href('company')} className="rounded-full border border-pm-ink/15 px-4 py-2 font-bold">Modifier l’entreprise / archiver</Link>{client.billing_email && <a href={`mailto:${client.billing_email}`} className="break-all px-2 py-2 text-pm-wine">{client.billing_email}</a>}</div>
    </header>
    <nav aria-label="Dossier client" className="flex flex-wrap gap-2">
      {[{ key: 'overview', label: 'Vue d’ensemble' }, ...allowed, { key: 'history', label: 'Activité récente' }].map((item) => <Link key={item.key} href={href(item.key)} aria-current={tab === item.key ? 'page' : undefined} className={`min-h-10 rounded-full px-4 py-2.5 text-xs font-bold ${tab === item.key ? 'bg-pm-wine text-white' : 'border border-pm-ink/10 bg-white text-pm-ink/70'}`}>{item.label}</Link>)}
    </nav>
    {tab === 'overview' && <>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{counts.map((item) => <Link key={item.key} href={href(item.key)} className="rounded-2xl border border-pm-ink/10 bg-white p-4"><p className="text-xs font-bold text-pm-ink/60">{item.label}</p><p className="mt-2 text-2xl font-semibold">{item.count ?? 'Indisponible'} <span className="text-sm text-pm-coral">→</span></p></Link>)}</section>
      <section className="rounded-2xl bg-white p-5"><h2 className="font-playfair text-xl font-semibold">À portée de main</h2><p className="mt-2 text-sm text-pm-ink/60">Créez et modifiez les dossiers depuis les onglets de ce client. Les contrats conservent leurs documents et les paiements restent rattachés à leurs factures.</p><dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-pm-ink/50">Téléphone</dt><dd>{client.billing_phone || 'Non renseigné'}</dd></div><div><dt className="text-xs text-pm-ink/50">Adresse</dt><dd className="whitespace-pre-line">{client.address || 'Non renseignée'}</dd></div></dl></section>
    </>}
    {section && <>
      {!loadError && invoiceBalances.length > 0 && <section className="rounded-2xl bg-white p-5"><h2 className="font-semibold">Règlements des factures affichées</h2><ul className="mt-3 grid gap-3 sm:grid-cols-2">{invoiceBalances.map((row) => <li key={String(row.id)} className="rounded-xl bg-pm-ivory p-3 text-sm"><p className="font-bold">{String(row.invoice_number)}</p><p className="mt-1">Payé : {formatMoney(row.amount_paid, String(row.currency))}</p><p>{row.status === 'cancelled' ? 'Facture annulée' : `Restant : ${formatMoney(Math.max(0, Number(row.total || 0) - Number(row.amount_paid || 0)), String(row.currency))}`}</p></li>)}</ul><Link href={href('payments')} className="mt-3 inline-block text-sm font-bold text-pm-wine underline">Consulter / enregistrer un paiement →</Link></section>}
      {loadError ? <p role="alert" className="rounded-2xl bg-rose-50 p-5 text-rose-900">{loadError} <Link href={href(tab, page)} className="underline">Réessayer</Link></p> : <TalentRecordsPanel key={`${tab}-${page}-${JSON.stringify(rows)}`} resource={section.resource} title={section.label} entityLabel="client" rows={rows} fields={fields} columns={columns} fixedValues={fixedValues} canCreate={canCreate} canDelete={false} maxVisible={pageSize} createLabel={tab === 'messages' ? 'Consigner un échange' : 'Ajouter'} description={tab === 'messages' ? 'Journal des échanges : enregistrer ici ne déclenche aucun envoi.' : tab === 'company' ? 'Le statut Archivé conserve le dossier et ses relations. Choisissez Actif pour le réactiver.' : tab === 'payments' ? 'Les encaissements utilisent la devise de leur facture. Créez d’abord une facture pour ajouter un paiement.' : tab === 'talents' ? 'Ajoutez des mannequins à une sélection de ce client. Créez d’abord la sélection.' : `Uniquement les dossiers de ${client.name}.`} />}
      {documents.length > 0 && <section className="rounded-2xl bg-white p-5"><h2 className="font-semibold">Documents des contrats affichés</h2><ul className="mt-3 space-y-3">{documents.map((row) => <li key={String(row.id)}><a href={String(row.document_url)} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-pm-wine underline">{String(row.title || 'Ouvrir le document')} ↗</a></li>)}</ul></section>}
      {total > pageSize && <nav aria-label="Pagination des dossiers client" className="flex items-center justify-between gap-3 text-sm">{page > 1 ? <Link href={href(tab, page - 1)}>← Précédent</Link> : <span/>}<span>{total} dossiers · Page {page}</span>{page * pageSize < total ? <Link href={href(tab, page + 1)}>Suivant →</Link> : <span/>}</nav>}
    </>}
    {tab === 'history' && <section className="rounded-2xl bg-white p-5"><h2 className="font-playfair text-2xl font-semibold">Activité récente</h2><p className="mt-2 text-xs text-pm-ink/60">Dernières mises à jour des dossiers accessibles. Cette vue n’est pas un journal d’audit exhaustif.</p>{history.some((group) => group.error) && <p role="alert" className="mt-3 text-sm text-rose-800">Certaines activités n’ont pas pu être chargées.</p>}<ul className="mt-4 space-y-3">{[{ id: 'client', label: 'Fiche entreprise', date: String(client.updated_at), section: { key: 'company', label: 'Entreprise' } }, ...history.flatMap((group) => group.items)].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30).map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-pm-ivory p-3"><Link href={href(item.section.key)} className="text-sm font-bold">{item.label}<span className="ml-2 text-xs font-normal text-pm-ink/60">{item.section.label}</span></Link><span className="text-xs text-pm-ink/60">{formatDate(item.date, true)}</span></li>)}</ul></section>}
  </div>;
}
