'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Code2, Loader2, Plus, Save, Search } from 'lucide-react';

type SettingRow = { key: string; value: unknown; updated_at?: string | null };
type JsonObject = Record<string, any>;

const objectValue = (value: unknown): JsonObject => value && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : {};

function Field({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[.15em] text-pm-ink/45">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-12 w-full rounded-xl border border-pm-ink/12 bg-white px-4 text-sm outline-none transition placeholder:text-pm-ink/25 focus:border-pm-coral focus:ring-4 focus:ring-pm-coral/10" /></label>;
}

export default function SiteSettingsManager() {
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [siteConfig, setSiteConfig] = useState<JsonObject>({});
  const [contactInfo, setContactInfo] = useState<JsonObject>({});
  const [seoConfig, setSeoConfig] = useState<JsonObject>({});
  const [selectedKey, setSelectedKey] = useState('');
  const [advancedValue, setAdvancedValue] = useState('{}');
  const [newKey, setNewKey] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/site-settings', { credentials: 'include', cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Chargement impossible.');
      const next: SettingRow[] = Array.isArray(payload.settings) ? payload.settings : [];
      setRows(next);
      const byKey = new Map(next.map((row) => [row.key, row.value]));
      setSiteConfig(objectValue(byKey.get('siteConfig')));
      setContactInfo(objectValue(byKey.get('contactInfo')));
      setSeoConfig(objectValue(byKey.get('seoConfig')));
      if (!selectedKey && next[0]) setSelectedKey(next[0].key);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Chargement impossible.');
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  const selected = useMemo(() => rows.find((row) => row.key === selectedKey), [rows, selectedKey]);
  useEffect(() => {
    if (!selected) return;
    setAdvancedValue(JSON.stringify(selected.value, null, 2));
  }, [selected]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('fr');
    return term ? rows.filter((row) => row.key.toLocaleLowerCase('fr').includes(term)) : rows;
  }, [rows, query]);

  async function saveSetting(key: string, value: unknown, successMessage = 'Paramètre enregistré.') {
    setBusyKey(key); setError(''); setNotice('');
    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Enregistrement impossible.');
      setRows((current) => {
        const exists = current.some((row) => row.key === key);
        const nextRow = payload.setting || { key, value, updated_at: new Date().toISOString() };
        return exists ? current.map((row) => row.key === key ? nextRow : row) : [...current, nextRow].sort((a, b) => a.key.localeCompare(b.key));
      });
      setNotice(successMessage);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Enregistrement impossible.');
      return false;
    } finally { setBusyKey(''); }
  }

  async function saveAdvanced() {
    if (!selectedKey) return;
    try {
      const parsed = JSON.parse(advancedValue);
      await saveSetting(selectedKey, parsed, `${selectedKey} a été mis à jour.`);
    } catch {
      setError('Le JSON avancé n’est pas valide.');
    }
  }

  async function createSetting() {
    const key = newKey.trim();
    if (!key) return;
    const ok = await saveSetting(key, {}, `Le paramètre ${key} a été créé.`);
    if (ok) { setSelectedKey(key); setAdvancedValue('{}'); setNewKey(''); }
  }

  const setSite = (key: string, value: string) => setSiteConfig((current) => ({ ...current, [key]: value }));
  const setContact = (key: string, value: string) => setContactInfo((current) => ({ ...current, [key]: value }));
  const setSeo = (key: string, value: string | string[]) => setSeoConfig((current) => ({ ...current, [key]: value }));

  return <div className="space-y-6">
    {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p>}
    {notice && <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900"><CheckCircle2 className="h-4 w-4" />{notice}</p>}

    <section className="grid gap-5 xl:grid-cols-3">
      <div className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-6">
        <p className="control-kicker">Identité</p><h2 className="mt-1 font-playfair text-3xl font-semibold">Site</h2>
        <div className="mt-5 space-y-4">
          <Field label="Nom du site" value={String(siteConfig.name || '')} onChange={(value) => setSite('name', value)} placeholder="Perfect Models Management" />
          <Field label="Nom court" value={String(siteConfig.shortName || '')} onChange={(value) => setSite('shortName', value)} placeholder="PMM" />
          <Field label="Logo" value={String(siteConfig.logo || '')} onChange={(value) => setSite('logo', value)} placeholder="/logo.svg" />
        </div>
        <button disabled={busyKey === 'siteConfig'} onClick={() => void saveSetting('siteConfig', siteConfig, 'Identité du site enregistrée.')} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-ink px-5 text-[10px] font-black uppercase tracking-[.1em] text-white disabled:opacity-50">{busyKey === 'siteConfig' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Enregistrer</button>
      </div>

      <div className="rounded-[1.7rem] border border-pm-ink/[.08] bg-white p-5 sm:p-6">
        <p className="control-kicker">Coordonnées</p><h2 className="mt-1 font-playfair text-3xl font-semibold">Contact</h2>
        <div className="mt-5 space-y-4">
          <Field label="Email public" type="email" value={String(contactInfo.email || '')} onChange={(value) => setContact('email', value)} />
          <Field label="Email notifications" type="email" value={String(contactInfo.notificationEmail || '')} onChange={(value) => setContact('notificationEmail', value)} />
          <Field label="Téléphone" value={String(contactInfo.phone || '')} onChange={(value) => setContact('phone', value)} />
          <Field label="Adresse" value={String(contactInfo.address || '')} onChange={(value) => setContact('address', value)} />
        </div>
        <button disabled={busyKey === 'contactInfo'} onClick={() => void saveSetting('contactInfo', contactInfo, 'Coordonnées enregistrées.')} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-wine px-5 text-[10px] font-black uppercase tracking-[.1em] text-white disabled:opacity-50">{busyKey === 'contactInfo' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Enregistrer</button>
      </div>

      <div className="rounded-[1.7rem] border border-pm-ink/[.08] bg-pm-peach/55 p-5 sm:p-6">
        <p className="control-kicker">Référencement</p><h2 className="mt-1 font-playfair text-3xl font-semibold">SEO global</h2>
        <div className="mt-5 space-y-4">
          <Field label="URL principale" type="url" value={String(seoConfig.siteUrl || '')} onChange={(value) => setSeo('siteUrl', value)} />
          <Field label="Nom SEO" value={String(seoConfig.siteName || '')} onChange={(value) => setSeo('siteName', value)} />
          <Field label="Ville" value={String(seoConfig.city || '')} onChange={(value) => setSeo('city', value)} />
          <Field label="Région" value={String(seoConfig.region || '')} onChange={(value) => setSeo('region', value)} />
          <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[.15em] text-pm-ink/45">Description</span><textarea value={String(seoConfig.description || '')} onChange={(event) => setSeo('description', event.target.value)} rows={4} className="w-full rounded-xl border border-pm-ink/12 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-pm-coral" /></label>
          <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[.15em] text-pm-ink/45">Mots-clés</span><textarea value={Array.isArray(seoConfig.keywords) ? seoConfig.keywords.join(', ') : ''} onChange={(event) => setSeo('keywords', event.target.value.split(',').map((item) => item.trim()).filter(Boolean))} rows={3} placeholder="agence mannequin, booking, Gabon…" className="w-full rounded-xl border border-pm-ink/12 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-pm-coral" /></label>
        </div>
        <button disabled={busyKey === 'seoConfig'} onClick={() => void saveSetting('seoConfig', seoConfig, 'Configuration SEO enregistrée.')} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-coral px-5 text-[10px] font-black uppercase tracking-[.1em] text-white disabled:opacity-50">{busyKey === 'seoConfig' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Enregistrer</button>
      </div>
    </section>

    <section className="grid gap-5 xl:grid-cols-[.55fr_1.45fr]">
      <aside className="overflow-hidden rounded-[1.7rem] border border-pm-ink/[.08] bg-white">
        <div className="border-b border-pm-ink/[.08] p-5">
          <div className="flex items-center gap-2"><Code2 className="h-4 w-4 text-pm-wine" /><p className="control-kicker">Tous les paramètres</p></div>
          <h2 className="mt-1 font-playfair text-3xl font-semibold">Avancé</h2>
          <label className="mt-4 flex min-h-11 items-center gap-3 rounded-xl border border-pm-ink/10 bg-pm-ivory px-4"><Search className="h-4 w-4 text-pm-wine/50" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une clé…" className="w-full bg-transparent py-2 text-sm outline-none" /></label>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-pm-wine" /></div> : filtered.map((row) => <button key={row.key} onClick={() => setSelectedKey(row.key)} className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${selectedKey === row.key ? 'bg-pm-peach text-pm-wine' : 'hover:bg-pm-ivory'}`}>{row.key}</button>)}
        </div>
        <div className="border-t border-pm-ink/[.08] p-4"><div className="flex gap-2"><input value={newKey} onChange={(event) => setNewKey(event.target.value)} placeholder="nouveauParametre" className="min-w-0 flex-1 rounded-xl border border-pm-ink/10 px-3 text-sm outline-none focus:border-pm-coral" /><button onClick={() => void createSetting()} disabled={!newKey.trim() || Boolean(busyKey)} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-pm-ink text-white disabled:opacity-40" aria-label="Créer le paramètre"><Plus className="h-4 w-4" /></button></div></div>
      </aside>

      <div className="rounded-[1.7rem] border border-pm-ink/[.08] bg-[#161316] p-5 text-white sm:p-7">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[8px] font-black uppercase tracking-[.2em] text-pm-gold-light">Éditeur JSON sécurisé</p><h3 className="mt-1 font-playfair text-3xl font-semibold">{selectedKey || 'Sélectionnez un paramètre'}</h3></div>{selectedKey && <button onClick={() => void saveAdvanced()} disabled={busyKey === selectedKey} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pm-gold px-5 text-[10px] font-black uppercase tracking-[.1em] text-black disabled:opacity-50">{busyKey === selectedKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Enregistrer</button>}</div>
        <p className="mt-5 text-xs leading-6 text-white/45">Cette zone permet de modifier les paramètres qui n’ont pas encore de formulaire dédié : FAQ, contenus éditoriaux, partenaires, slides, témoignages ou toute nouvelle configuration ajoutée à <code>site_settings</code>.</p>
        <textarea value={advancedValue} onChange={(event) => setAdvancedValue(event.target.value)} disabled={!selectedKey} spellCheck={false} rows={20} className="mt-5 w-full resize-y rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-xs leading-6 text-pm-gold-light outline-none focus:border-pm-gold/50 disabled:opacity-30" />
      </div>
    </section>
  </div>;
}
