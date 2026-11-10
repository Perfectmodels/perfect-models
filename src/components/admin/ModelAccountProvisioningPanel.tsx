'use client';

import { useEffect, useMemo, useState } from 'react';

type ModelAccountRow = {
  id: string;
  name: string;
  username?: string | null;
  email: string;
  status: 'linked' | 'eligible' | 'missing_email' | 'pending_claim';
};
type InvitationResult = { modelId: string; status: string; reason?: string };

export default function ModelAccountProvisioningPanel() {
  const [rows, setRows] = useState<ModelAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function refresh() {
    const response = await fetch('/api/admin/model-accounts', { credentials: 'include', cache: 'no-store' });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Impossible de lire les comptes.');
    setRows(Array.isArray(payload.models) ? payload.models : []);
  }

  useEffect(() => {
    let live = true;
    void fetch('/api/admin/model-accounts', { credentials: 'include', cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Impossible de lire les comptes.');
        if (live) setRows(Array.isArray(payload.models) ? payload.models : []);
      })
      .catch((cause) => { if (live) setError(cause instanceof Error ? cause.message : 'Chargement impossible.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);

  const ready = useMemo(() => rows.filter((row) => row.status === 'eligible'), [rows]);
  const linkedCount = rows.filter((row) => row.status === 'linked').length;
  const missing = rows.filter((row) => row.status === 'missing_email');
  const pendingCount = rows.filter((row) => row.status === 'pending_claim').length;

  async function provisionAll() {
    if (!ready.length || working) return;
    setWorking(true);
    setError('');
    setMessage('');
    let invited = 0;
    let failed = 0;
    try {
      // Process small batches to avoid long-running Vercel requests and rate limits.
      for (let index = 0; index < ready.length; index += 10) {
        const modelIds = ready.slice(index, index + 10).map((model) => model.id);
        const response = await fetch('/api/admin/model-accounts', {
          method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ modelIds }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'La création des accès a échoué.');
        const results: InvitationResult[] = Array.isArray(payload.results) ? payload.results : [];
        invited += results.filter((item) => item.status === 'invited').length;
        failed += results.filter((item) => item.status === 'error').length;
        setMessage(invited + ' invitation(s) envoyée(s) ; ' + failed + ' échec(s).');
      }
      await refresh();
      setMessage(invited + ' invitation(s) envoyée(s). ' + failed + ' échec(s). Les mannequins doivent confirmer leur e-mail et définir leur mot de passe.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Invitation impossible.');
      await refresh().catch(() => undefined);
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-pm-ink/10 bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="control-kicker">Comptes & sécurité</p>
          <h2 className="mt-2 font-playfair text-2xl font-semibold">Activation des mannequins sans compte</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-pm-ink/60">
            Chaque mannequin disposant d'une adresse e-mail valide reçoit un lien d'activation personnel.
            Aucun mot de passe partagé n'est envoyé. Il devra définir son mot de passe avant d'utiliser son espace.
          </p>
        </div>
        <button type="button" onClick={() => void provisionAll()} disabled={working || loading || !ready.length}
          className="min-h-11 rounded-full bg-pm-wine px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white disabled:opacity-40">
          {working ? 'Invitations en cours…' : 'Créer les ' + ready.length + ' accès manquants'}
        </button>
      </div>
      <div className="mt-5 flex flex-wrap gap-3 text-xs font-bold text-pm-ink/65">
        <span>{linkedCount} compte(s) lié(s)</span>
        <span>{ready.length} prêt(s) à inviter</span>
        <span>{missing.length} e-mail(s) manquant(s)</span>
        <span>{pendingCount} activation(s) en cours</span>
      </div>
      {loading && <p className="mt-3 text-sm text-pm-ink/60">Vérification des comptes…</p>}
      {message && <p role="status" className="mt-4 text-sm text-emerald-800">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      {missing.length > 0 && (
        <div className="mt-5 border-t border-pm-ink/10 pt-4">
          <p className="text-sm font-bold">E-mail à compléter avant activation :</p>
          <p className="mt-1 text-xs text-pm-ink/55">{missing.slice(0, 20).map((row) => row.name).join(' · ')}{missing.length > 20 ? '…' : ''}</p>
        </div>
      )}
    </section>
  );
}
