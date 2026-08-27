import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, EyeIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { CastingApplication, CastingApplicationStatus } from '../types';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import {
  sendCastingPresignedNotification,
  sendCastingRejectedNotification,
} from '../utils/brevoService';

const PAGE_SIZE = 15;
const FILTERS: Array<CastingApplicationStatus | 'Toutes'> = ['Nouveau', 'Présélectionné', 'Accepté', 'Refusé', 'Toutes'];

const AdminCasting: React.FC = () => {
  const { items, page, totalPages, nextPage, prevPage, isLoading, refresh } = useFirebaseCollection<CastingApplication>('castingApplications', {
    pageSize: PAGE_SIZE,
    orderBy: 'submissionDate',
  });
  const [filter, setFilter] = useState<CastingApplicationStatus | 'Toutes'>('Nouveau');
  const [selectedApp, setSelectedApp] = useState<CastingApplication | null>(null);
  const [provisioningId, setProvisioningId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const filteredApps = useMemo(
    () => filter === 'Toutes' ? items : items.filter((application) => application.status === filter),
    [filter, items],
  );

  async function updateApplication(appId: string, updates: Record<string, unknown>) {
    const { update, ref } = await import('firebase/database');
    const { db } = await import('../realtimedbConfig');
    await update(ref(db, `castingApplications/${appId}`), updates);
    invalidateCache('castingApplications');
    await refresh();
    setSelectedApp((current) => current?.id === appId ? { ...current, ...updates } as CastingApplication : current);
  }

  async function provisionAccount(application: CastingApplication) {
    setProvisioningId(application.id);
    setActionError('');
    try {
      const response = await fetch('/api/admin/casting/provision', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: application.id }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Création du compte mannequin impossible.');
      await refresh();
      alert(payload?.alreadyProvisioned
        ? `Le compte de ${application.firstName} ${application.lastName} existe déjà.`
        : `Le compte mannequin de ${application.firstName} ${application.lastName} a été créé. Une invitation sécurisée Supabase a été envoyée à ${payload.email}.`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Création du compte impossible.');
    } finally {
      setProvisioningId(null);
    }
  }

  async function handleUpdateStatus(application: CastingApplication, status: CastingApplicationStatus) {
    setActionError('');
    try {
      let rejectionReason = '';
      if (status === 'Refusé') {
        rejectionReason = window.prompt('Motif du refus (facultatif) :', 'Votre profil ne correspond pas à nos besoins actuels.') || '';
      }

      await updateApplication(application.id, { status });

      if (status === 'Accepté') {
        // Un seul geste administrateur : l'acceptation déclenche le provisioning.
        await provisionAccount({ ...application, status: 'Accepté' });
      } else if (status === 'Refusé') {
        await sendCastingRejectedNotification({
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          rejectionReasons: rejectionReason || 'Votre profil ne correspond pas à nos besoins actuels. Nous vous encourageons à réessayer lors de futurs castings.',
        }).catch(() => undefined);
      } else if (status === 'Présélectionné') {
        await sendCastingPresignedNotification({
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
        }).catch(() => undefined);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Mise à jour impossible.');
    }
  }

  async function handleDelete(appId: string) {
    if (!window.confirm('Supprimer définitivement cette candidature ?')) return;
    try {
      const { remove, ref } = await import('firebase/database');
      const { db } = await import('../realtimedbConfig');
      await remove(ref(db, `castingApplications/${appId}`));
      invalidateCache('castingApplications');
      await refresh();
      setSelectedApp((current) => current?.id === appId ? null : current);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Suppression impossible.');
    }
  }

  return (
    <div className="min-h-screen bg-pm-dark text-pm-off-white">
      <SEO title="Candidatures Casting | Admin PMM" noIndex />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link to="/admin" className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-pm-gold/60 hover:text-pm-gold">
              <ChevronLeftIcon className="h-4 w-4" /> Administration
            </Link>
            <h1 className="font-playfair text-4xl font-black text-white">Candidatures Casting</h1>
            <p className="mt-2 text-sm text-white/40">L’acceptation crée automatiquement le compte Supabase et envoie le lien d’activation.</p>
          </div>
        </div>

        {actionError && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{actionError}</div>}

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest transition ${filter === item ? 'bg-pm-gold text-black' : 'border border-white/10 text-white/45 hover:border-pm-gold/30 hover:text-pm-gold'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-[10px] uppercase tracking-[0.18em] text-white/35">
                <tr>
                  <th className="px-5 py-4">Candidat</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Ville</th>
                  <th className="px-5 py-4">Taille</th>
                  <th className="px-5 py-4">Statut</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-white/35">Chargement…</td></tr>
                ) : filteredApps.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-white/35">Aucune candidature dans cette catégorie.</td></tr>
                ) : filteredApps.map((application) => (
                  <tr key={application.id} className="hover:bg-white/[0.025]">
                    <td className="px-5 py-4 font-semibold text-white">{application.firstName} {application.lastName}</td>
                    <td className="px-5 py-4"><div>{application.email}</div><div className="text-xs text-white/35">{application.phone}</div></td>
                    <td className="px-5 py-4 text-white/60">{application.city}</td>
                    <td className="px-5 py-4 text-white/60">{application.height ? `${application.height} cm` : '—'}</td>
                    <td className="px-5 py-4"><StatusBadge status={application.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedApp(application)} className="rounded-lg border border-white/10 p-2 text-white/50 hover:border-pm-gold/30 hover:text-pm-gold" title="Voir"><EyeIcon className="h-4 w-4" /></button>
                        {application.status === 'Accepté' && (
                          <button disabled={provisioningId === application.id} onClick={() => provisionAccount(application)} className="rounded-lg bg-pm-gold px-3 py-2 text-[10px] font-black uppercase tracking-wider text-black disabled:opacity-50">
                            {provisioningId === application.id ? 'Création…' : 'Créer / renvoyer accès'}
                          </button>
                        )}
                        <button onClick={() => handleDelete(application.id)} className="rounded-lg border border-red-500/20 p-2 text-red-400/70 hover:bg-red-500/10" title="Supprimer"><TrashIcon className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-white/40">
          <button onClick={prevPage} disabled={page <= 1} className="rounded-lg border border-white/10 px-4 py-2 disabled:opacity-30">Précédent</button>
          <span>Page {page} / {Math.max(1, totalPages)}</span>
          <button onClick={nextPage} disabled={page >= totalPages} className="rounded-lg border border-white/10 px-4 py-2 disabled:opacity-30">Suivant</button>
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={() => setSelectedApp(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-pm-gold/20 bg-[#0d0d0d] p-6 sm:p-8" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div><p className="text-[10px] font-black uppercase tracking-widest text-pm-gold">Candidature</p><h2 className="mt-2 font-playfair text-3xl font-black text-white">{selectedApp.firstName} {selectedApp.lastName}</h2></div>
              <button onClick={() => setSelectedApp(null)} className="p-2 text-white/40 hover:text-white"><XMarkIcon className="h-5 w-5" /></button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Email" value={selectedApp.email} />
              <Info label="Téléphone" value={selectedApp.phone} />
              <Info label="Ville" value={selectedApp.city} />
              <Info label="Nationalité" value={selectedApp.nationality} />
              <Info label="Genre" value={selectedApp.gender} />
              <Info label="Taille" value={selectedApp.height ? `${selectedApp.height} cm` : '—'} />
              <Info label="Expérience" value={selectedApp.experience} />
              <Info label="Instagram" value={selectedApp.instagram || '—'} />
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              <button onClick={() => handleUpdateStatus(selectedApp, 'Présélectionné')} className="rounded-full border border-pm-gold/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-pm-gold">Présélectionner</button>
              <button disabled={provisioningId === selectedApp.id} onClick={() => handleUpdateStatus(selectedApp, 'Accepté')} className="rounded-full bg-pm-gold px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black disabled:opacity-50">Accepter + créer le compte</button>
              <button onClick={() => handleUpdateStatus(selectedApp, 'Refusé')} className="rounded-full border border-red-500/30 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-400">Refuser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{label}</p>
    <p className="mt-1 text-sm text-white/75">{value || '—'}</p>
  </div>
);

const StatusBadge = ({ status }: { status: CastingApplicationStatus }) => {
  const classes: Record<string, string> = {
    Nouveau: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
    Présélectionné: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    Accepté: 'border-green-500/20 bg-green-500/10 text-green-300',
    Refusé: 'border-red-500/20 bg-red-500/10 text-red-300',
  };
  return <span className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-wider ${classes[status] || 'border-white/10 text-white/50'}`}>{status}</span>;
};

export default AdminCasting;