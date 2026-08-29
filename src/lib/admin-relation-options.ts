import 'server-only';
import type { CrudField } from '@/lib/resource-registry';

type SupabaseAdmin = any;
type Option = { label: string; value: string };

const RELATIONS: Record<string, { table: string; select: string; order?: string; label: (row: any) => string }> = {
  model_id: { table: 'models', select: 'id,name,email', order: 'name', label: (row) => `${row.name || row.id}${row.email ? ` · ${row.email}` : ''}` },
  client_id: { table: 'agency_clients', select: 'id,name,client_type,status', order: 'name', label: (row) => `${row.name || row.id}${row.client_type ? ` · ${row.client_type}` : ''}` },
  casting_id: { table: 'castings', select: 'id,title,status,starts_at', order: 'title', label: (row) => `${row.title || row.id}${row.status ? ` · ${row.status}` : ''}` },
  booking_id: { table: 'bookings', select: 'id,title,status,starts_at', order: 'title', label: (row) => `${row.title || row.id}${row.status ? ` · ${row.status}` : ''}` },
  booking_request_id: { table: 'booking_requests', select: 'id,name,email,status,created_at', label: (row) => `${row.name || row.email || row.id}${row.status ? ` · ${row.status}` : ''}` },
  option_id: { table: 'booking_options', select: 'id,title,status,starts_at', order: 'title', label: (row) => `${row.title || row.id}${row.status ? ` · ${row.status}` : ''}` },
  quote_id: { table: 'quotes', select: 'id,quote_number,status,total,currency', order: 'quote_number', label: (row) => `${row.quote_number || row.id}${row.status ? ` · ${row.status}` : ''}` },
  invoice_id: { table: 'invoices', select: 'id,invoice_number,status,total,currency', order: 'invoice_number', label: (row) => `${row.invoice_number || row.id}${row.status ? ` · ${row.status}` : ''}` },
  selection_id: { table: 'client_selections', select: 'id,title,status,expires_at', order: 'title', label: (row) => `${row.title || row.id}${row.status ? ` · ${row.status}` : ''}` },
};

export async function hydrateAdminRelationOptions(supabase: SupabaseAdmin, fields: readonly CrudField[]): Promise<CrudField[]> {
  const names = [...new Set(fields.map((field) => field.name).filter((name) => RELATIONS[name]))];
  if (!names.length) return [...fields];

  const resolved = await Promise.all(names.map(async (name) => {
    const config = RELATIONS[name];
    let query = supabase.from(config.table).select(config.select).limit(400);
    if (config.order) query = query.order(config.order, { ascending: true, nullsFirst: false });
    else query = query.order('created_at', { ascending: false, nullsFirst: false });
    const { data } = await query;
    const options: Option[] = (data || []).map((row: any) => ({ value: String(row.id), label: config.label(row) }));
    return [name, options] as const;
  }));

  const options = Object.fromEntries(resolved) as Record<string, Option[]>;
  return fields.map((field) => options[field.name] ? { ...field, type: 'select', options: options[field.name] } : field);
}
