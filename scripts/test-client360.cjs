/* Read-only route regression tests. No credentials or production writes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const root = path.resolve(__dirname, '..');
const clientId = '11111111-1111-4111-8111-111111111111';
let profile, calls, panels, failure;
const client = { id: clientId, name: 'Client de test', status: 'active', updated_at: '2026-09-21T10:00:00Z', notes: 'Note confidentielle' };
const db = {
  from(table) {
    const call = { table, filters: [] }; calls.push(call);
    const chain = {
      select(columns, options) { call.columns = columns; call.options = options; return chain; },
      eq(key, value) { call.filters.push([key, value]); return chain; },
      order() { return chain; }, range() { return chain; }, limit() { return chain; },
      maybeSingle() { call.single = true; return chain; },
      then(resolve, reject) {
        const row = table === 'agency_clients' ? client : table === 'bookings' ? { id: 'booking', title: 'Projet', fee_gross: 900, model_id: 'talent' } : table === 'invoices' ? { id: 'invoice', invoice_number: 'F-1', currency: 'EUR', total: 100, amount_paid: 40 } : table === 'invoice_payments' ? { id: 'payment', amount: 40, invoices: { client_id: clientId, currency: 'EUR' } } : null;
        return Promise.resolve({ data: call.single ? row : row ? [row] : [], count: row ? 1 : 0, error: failure === table ? { message: 'Test error' } : null }).then(resolve, reject);
      },
    }; return chain;
  },
};
const mocks = {
  'server-only': {},
  'next/link': { __esModule: true, default: ({ children, ...props }) => React.createElement('a', props, children) },
  'next/navigation': { redirect: (url) => { throw new Error(`REDIRECT:${url}`); }, notFound: () => { throw new Error('NOT_FOUND'); } },
  '@/lib/auth/profile': { getCurrentAppProfile: async () => profile },
  '@/lib/supabase/admin': { createSupabaseAdminClient: () => db },
  '@/components/admin/TalentRecordsPanel': { __esModule: true, default: (props) => { panels.push(props); return React.createElement('section', null, props.title); } },
};
const cache = new Map();
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} }; cache.set(filename, module);
  const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const localRequire = (name) => {
    if (mocks[name]) return mocks[name];
    if (name.startsWith('@/')) return load(path.join(root, 'src', `${name.slice(2)}.ts`));
    return require(name);
  };
  vm.runInThisContext(`(function(require,module,exports){${js}\n})`, { filename })(localRequire, module, module.exports);
  return module.exports;
}
const Page = load(path.join(root, 'src/app/admin/clients/[id]/page.tsx')).default;
async function render(tab, permissions) {
  calls = []; panels = []; profile = permissions === null ? null : permissions ? { role: 'manager', adminPermissions: permissions } : { role: 'admin' };
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ id: clientId }), searchParams: Promise.resolve({ tab }) }));
}
(async () => {
  await assert.rejects(() => render('overview', null), /REDIRECT/);
  await assert.rejects(() => render('company', { bookings: false }), /REDIRECT/);
  await render('overview', { bookings: true, payments: false });
  assert(!calls.some((call) => ['invoices', 'quotes', 'contracts', 'castings', 'messages'].includes(call.table)), 'overview must not query forbidden modules');
  await assert.rejects(() => render('invoices', { bookings: true, payments: false }), /NOT_FOUND/);
  await render('bookings', { bookings: true, payments: false });
  assert(!panels[0].fields.some((field) => field.name === 'fee_gross'));
  assert(!('fee_gross' in panels[0].rows[0]), 'hidden finance data must not cross the client boundary');
  assert.equal(panels[0].fixedValues.client_id, clientId);
  await render('payments');
  assert(calls.some((call) => call.table === 'invoice_payments' && call.filters.some(([key, value]) => key === 'invoices.client_id' && value === clientId)));
  assert.equal(panels[0].rows[0].currency, 'EUR');
  assert(calls.filter((call) => call.table === 'invoices').every((call) => call.filters.some(([key, value]) => key === 'client_id' && value === clientId)));
  await render('talents');
  assert(calls.some((call) => call.table === 'client_selection_items' && call.filters.some(([key, value]) => key === 'client_selections.client_id' && value === clientId)));
  await render('notes');
  assert.deepEqual(panels[0].fields.map((field) => field.name), ['notes']);
  assert.equal(panels[0].canCreate, false);
  const invoices = await render('invoices');
  assert(invoices.includes('Restant') && invoices.includes('60'));
  assert(!panels[0].fields.some((field) => field.name === 'amount_paid'), 'paid total is derived, not editable');
  failure = 'agency_contacts';
  const failed = await render('contacts');
  assert(failed.includes('ne peut pas être chargé'));
  assert.equal(panels.length, 0, 'failed load must not expose a create form');
  failure = undefined;
  const messages = await render('messages');
  assert(panels[0].description.includes('aucun envoi'));
  assert.equal(panels[0].fixedValues.client_id, clientId);
  console.log('Client 360: 12 read-only regression scenarios passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
