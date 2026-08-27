'use client';

import { useEffect, useState } from 'react';

export default function SupabaseMigrationPage() {
  const [status, setStatus] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = async () => {
    const response = await fetch('/api/admin/supabase/migration-status', { cache: 'no-store' });
    setStatus(await response.json());
  };

  useEffect(() => { refresh().catch((e) => setError(String(e?.message || e))); }, []);

  const migrate = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/admin/supabase/migrate', { method: 'POST' });
      const body = await response.json();
      setResult(body);
      if (!response.ok && response.status !== 207) setError(body?.error || 'Migration impossible.');
      await refresh();
    } catch (e:any) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">Migration Firebase → Supabase</h1>
      <p className="mt-2 text-sm text-gray-600">Outil réservé à l’administration. Aucun mot de passe, token ou secret Firebase n’est copié vers Supabase.</p>

      <section className="mt-8 rounded-2xl border p-5">
        <h2 className="text-lg font-semibold">État des prérequis</h2>
        {!status ? <p className="mt-4">Chargement…</p> : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ['Clé serveur Supabase', status.supabasePrivilegedKeyConfigured],
              ['Session Firebase', status.firebaseSessionAvailable],
              ['Données Firebase privées lisibles', status.privateFirebaseReadable],
              ['Session administrateur', status.role === 'admin'],
            ].map(([label, ok]: any) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span>{label}</span><strong>{ok ? 'OK' : 'À configurer'}</strong>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={migrate}
          disabled={loading || !status?.readyForPrivateMigration}
          className="mt-6 rounded-xl bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-40"
        >{loading ? 'Migration en cours…' : 'Lancer la migration privée'}</button>
      </section>

      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {result && (
        <section className="mt-8 rounded-2xl border p-5">
          <h2 className="text-lg font-semibold">Résultat</h2>
          <p className="mt-2">Lignes normalisées : <strong>{result.totalNormalized ?? 0}</strong></p>
          <p>Collections en erreur : <strong>{result.failed?.length ?? 0}</strong></p>
          <div className="mt-4 space-y-2">
            {Object.entries(result.summary || {}).map(([key, value]: any) => (
              <div key={key} className="flex flex-wrap justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span>{key}</span>
                <span>{value.error ? `Erreur : ${value.error}` : `${value.normalized} normalisé(s)`}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
