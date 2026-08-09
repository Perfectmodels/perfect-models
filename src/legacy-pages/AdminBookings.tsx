import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { BookingRequest } from '../types';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import { ref, update, remove } from 'firebase/database';
import { db } from '../realtimedbConfig';

const STATUS_COLORS: Record<BookingRequest['status'], string> = {
  'Nouveau': 'bg-blue-500/20 text-blue-300 border-blue-500',
  'Confirmé': 'bg-green-500/20 text-green-300 border-green-500',
  'Annulé': 'bg-red-500/20 text-red-300 border-red-500',
};

const AdminBookings: React.FC = () => {
  const { items: bookings, isLoading, refresh } = useFirebaseCollection<BookingRequest>('bookingRequests', {
    pageSize: 200,
    orderBy: 'submissionDate',
  });
  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<BookingRequest['status'] | 'Tous'>('Tous');

  const filtered = filterStatus === 'Tous' ? bookings : bookings.filter(b => b.status === filterStatus);
  const counts = { Nouveau: bookings.filter(b => b.status === 'Nouveau').length, total: bookings.length };

  const handleStatus = async (id: string, status: BookingRequest['status']) => {
    await update(ref(db, `bookingRequests/${id}`), { status });
    invalidateCache('bookingRequests');
    refresh();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    await remove(ref(db, `bookingRequests/${id}`));
    invalidateCache('bookingRequests');
    refresh();
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin - Bookings" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
          <ChevronLeftIcon className="w-5 h-5" /> Retour au Tableau de Bord
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-playfair text-pm-gold">Demandes de Booking</h1>
          <p className="text-pm-off-white/40 text-sm mt-1">{counts.total} demande(s) — {counts.Nouveau} nouvelle(s)</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(['Tous', 'Nouveau', 'Confirmé', 'Annulé'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterStatus === s ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-pm-gold/30 text-pm-off-white/60 hover:border-pm-gold/60'}`}>
              {s}
            </button>
          ))}
        </div>

        <div className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-pm-dark/50">
                <tr className="border-b border-pm-gold/20">
                  <th className="p-4 uppercase text-xs tracking-wider">Client</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden md:table-cell">Mannequins</th>
                  <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Dates</th>
                  <th className="p-4 uppercase text-xs tracking-wider">Statut</th>
                  <th className="p-4 uppercase text-xs tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id} className={`border-b border-pm-dark hover:bg-pm-dark/50 ${b.status === 'Nouveau' ? 'border-l-2 border-l-blue-500' : ''}`}>
                    <td className="p-4">
                      <div className="font-semibold">{b.clientName}</div>
                      <div className="text-xs text-pm-off-white/40">{b.clientEmail}</div>
                      {b.clientCompany && <div className="text-xs text-pm-off-white/30">{b.clientCompany}</div>}
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-pm-off-white/70 max-w-xs truncate">{b.requestedModels}</td>
                    <td className="p-4 hidden sm:table-cell text-xs text-pm-off-white/50">
                      <div>{b.startDate ?? '—'}</div>
                      {b.endDate && <div>→ {b.endDate}</div>}
                    </td>
                    <td className="p-4">
                      <select value={b.status} onChange={e => handleStatus(b.id, e.target.value as BookingRequest['status'])}
                        className={`text-xs font-bold rounded-full border px-2 py-1 bg-transparent cursor-pointer ${STATUS_COLORS[b.status]}`}>
                        <option value="Nouveau">Nouveau</option>
                        <option value="Confirmé">Confirmé</option>
                        <option value="Annulé">Annulé</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setSelected(b)} className="text-pm-gold/60 hover:text-pm-gold"><EyeIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleDelete(b.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isLoading && <p className="text-center p-8 text-pm-off-white/40 animate-pulse">Chargement...</p>}
            {!isLoading && filtered.length === 0 && <p className="text-center p-8 text-pm-off-white/60">Aucune demande.</p>}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-pm-dark border border-pm-gold/30 rounded-lg w-full max-w-lg max-h-[90vh] flex flex-col">
            <header className="p-4 flex justify-between items-center border-b border-pm-gold/20 flex-shrink-0">
              <h2 className="text-xl font-playfair text-pm-gold">Booking — {selected.clientName}</h2>
              <button onClick={() => setSelected(null)} className="text-pm-off-white/60 hover:text-white"><XMarkIcon className="w-6 h-6" /></button>
            </header>
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <Row label="Client" value={selected.clientName} />
              <Row label="Email" value={selected.clientEmail} />
              {selected.clientCompany && <Row label="Entreprise" value={selected.clientCompany} />}
              <Row label="Mannequins demandés" value={selected.requestedModels} />
              <Row label="Date début" value={selected.startDate ?? '—'} />
              <Row label="Date fin" value={selected.endDate ?? '—'} />
              <Row label="Soumis le" value={new Date(selected.submissionDate).toLocaleDateString('fr-FR')} />
              {selected.message && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-1">Message</p>
                  <p className="text-sm text-pm-off-white/80 whitespace-pre-wrap bg-black/30 rounded p-3">{selected.message}</p>
                </div>
              )}
            </div>
            <footer className="p-4 border-t border-pm-gold/20 flex items-center justify-between flex-shrink-0">
              <select value={selected.status} onChange={e => handleStatus(selected.id, e.target.value as BookingRequest['status'])}
                className={`text-xs font-bold rounded-full border px-3 py-1.5 bg-transparent cursor-pointer ${STATUS_COLORS[selected.status]}`}>
                <option value="Nouveau">Nouveau</option>
                <option value="Confirmé">Confirmé</option>
                <option value="Annulé">Annulé</option>
              </select>
              <button onClick={() => handleDelete(selected.id)} className="text-red-500/70 hover:text-red-500 flex items-center gap-1 text-sm">
                <TrashIcon className="w-4 h-4" /> Supprimer
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-widest text-pm-off-white/40 mb-0.5">{label}</p>
    <p className="text-sm text-pm-off-white/90">{value || '—'}</p>
  </div>
);

export default AdminBookings;
