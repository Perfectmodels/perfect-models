'use client';

import { useEffect, useRef, useState } from 'react';

const POLL_MS = 2500;
const ACCEPTED_STATUSES = new Set(['accepté', 'accepte', 'accepted', 'approved']);

export default function CastingAccountProvisioner() {
  const baselineReady = useRef(false);
  const acceptedSeen = useRef(new Set<string>());
  const provisioning = useRef(new Set<string>());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    let timer: number | undefined;

    const poll = async () => {
      try {
        const response = await fetch('/api/admin/resources/casting-applications', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) return;
        const payload = await response.json().catch(() => ({}));
        const applications = Array.isArray(payload?.data) ? payload.data : [];
        const accepted = applications.filter((app: any) => ACCEPTED_STATUSES.has(String(app?.status || '').trim().toLowerCase()));

        if (!baselineReady.current) {
          for (const app of accepted) acceptedSeen.current.add(String(app.id));
          baselineReady.current = true;
          return;
        }

        for (const app of accepted) {
          const id = String(app?.id || '');
          if (!id || app?.account_provisioned_at || acceptedSeen.current.has(id) || provisioning.current.has(id)) continue;
          acceptedSeen.current.add(id);
          provisioning.current.add(id);
          setError('');
          setMessage(`Création du compte de ${app.first_name || ''} ${app.last_name || ''}…`);

          try {
            const provision = await fetch('/api/admin/casting/provision', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ applicationId: id }),
            });
            const result = await provision.json().catch(() => ({}));
            if (!provision.ok && provision.status !== 207) throw new Error(result?.error || 'Création du compte impossible.');
            window.dispatchEvent(new Event('pmm-auth-changed'));
            window.dispatchEvent(new Event('pmm-supabase-data-changed'));
            setMessage(result?.warning || `Compte mannequin créé et identifiants envoyés à ${result?.email || app.email}.`);
          } catch (cause: any) {
            acceptedSeen.current.delete(id);
            setError(cause?.message || 'Création automatique du compte impossible.');
            setMessage('');
          } finally {
            provisioning.current.delete(id);
          }
        }
      } catch {
        // Le polling ne doit jamais perturber l'interface Casting.
      }
    };

    void poll();
    timer = window.setInterval(() => { if (active) void poll(); }, POLL_MS);
    return () => {
      active = false;
      if (timer) window.clearInterval(timer);
    };
  }, []);

  if (!message && !error) return null;
  return (
    <div className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-xl border border-pm-gold/20 bg-[#0b0b0b]/95 p-4 text-xs shadow-2xl backdrop-blur-xl">
      {message && <p className="text-emerald-300">{message}</p>}
      {error && <p className="text-red-300">{error}</p>}
    </div>
  );
}
