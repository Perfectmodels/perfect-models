import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, PlusIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { ModelDistinction, AchievementCategory } from '../types';

const AdminAgency: React.FC = () => {
  const { data, saveData } = useData();

  // --- Agency Info ---
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ p1: '', p2: '' });

  useEffect(() => {
    if (data?.agencyInfo) {
      setInfoForm({ p1: data.agencyInfo.about.p1, p2: data.agencyInfo.about.p2 });
    }
  }, [data?.agencyInfo]);

  const saveInfo = () => {
    if (!data) return;
    saveData({ ...data, agencyInfo: { ...data.agencyInfo, about: infoForm } });
    setEditingInfo(false);
  };

  // --- Partners ---
  const [newPartner, setNewPartner] = useState('');
  const partners = data?.agencyPartners ?? [];

  const addPartner = () => {
    if (!data || !newPartner.trim()) return;
    saveData({ ...data, agencyPartners: [...data.agencyPartners, { name: newPartner.trim() }] });
    setNewPartner('');
  };

  const removePartner = (name: string) => {
    if (!data) return;
    saveData({ ...data, agencyPartners: data.agencyPartners.filter(p => p.name !== name) });
  };

  // --- Timeline ---
  const [newTimeline, setNewTimeline] = useState({ year: '', event: '' });
  const timeline = data?.agencyTimeline ?? [];

  const addTimeline = () => {
    if (!data || !newTimeline.year.trim() || !newTimeline.event.trim()) return;
    saveData({ ...data, agencyTimeline: [...data.agencyTimeline, { year: newTimeline.year.trim(), event: newTimeline.event.trim() }] });
    setNewTimeline({ year: '', event: '' });
  };

  const removeTimeline = (year: string) => {
    if (!data) return;
    saveData({ ...data, agencyTimeline: data.agencyTimeline.filter(t => t.year !== year) });
  };

  // --- Distinctions ---
  const distinctions = data?.modelDistinctions ?? [];
  const [newDist, setNewDist] = useState<{ name: string; titles: string }>({ name: '', titles: '' });
  const [editingDist, setEditingDist] = useState<{ index: number; name: string; titles: string } | null>(null);

  const addDistinction = () => {
    if (!data || !newDist.name.trim()) return;
    const item: ModelDistinction = {
      name: newDist.name.trim(),
      titles: newDist.titles.split('\n').map(t => t.trim()).filter(Boolean),
    };
    saveData({ ...data, modelDistinctions: [...distinctions, item] });
    setNewDist({ name: '', titles: '' });
  };

  const saveDistinction = () => {
    if (!data || editingDist === null) return;
    const updated = distinctions.map((d, i) =>
      i === editingDist.index
        ? { name: editingDist.name.trim(), titles: editingDist.titles.split('\n').map(t => t.trim()).filter(Boolean) }
        : d
    );
    saveData({ ...data, modelDistinctions: updated });
    setEditingDist(null);
  };

  const removeDistinction = (index: number) => {
    if (!data || !window.confirm('Supprimer cette distinction ?')) return;
    saveData({ ...data, modelDistinctions: distinctions.filter((_, i) => i !== index) });
  };

  // --- Réalisations ---
  const achievements = data?.agencyAchievements ?? [];
  const [newAchiev, setNewAchiev] = useState<{ name: string; items: string }>({ name: '', items: '' });
  const [editingAchiev, setEditingAchiev] = useState<{ index: number; name: string; items: string } | null>(null);

  const addAchievement = () => {
    if (!data || !newAchiev.name.trim()) return;
    const item: AchievementCategory = {
      name: newAchiev.name.trim(),
      items: newAchiev.items.split('\n').map(t => t.trim()).filter(Boolean),
    };
    saveData({ ...data, agencyAchievements: [...achievements, item] });
    setNewAchiev({ name: '', items: '' });
  };

  const saveAchievement = () => {
    if (!data || editingAchiev === null) return;
    const updated = achievements.map((a, i) =>
      i === editingAchiev.index
        ? { ...a, name: editingAchiev.name.trim(), items: editingAchiev.items.split('\n').map(t => t.trim()).filter(Boolean) }
        : a
    );
    saveData({ ...data, agencyAchievements: updated });
    setEditingAchiev(null);
  };

  const removeAchievement = (index: number) => {
    if (!data || !window.confirm('Supprimer cette réalisation ?')) return;
    saveData({ ...data, agencyAchievements: achievements.filter((_, i) => i !== index) });
  };

  if (!data) return <div className="bg-pm-dark min-h-screen flex items-center justify-center text-pm-off-white">Chargement...</div>;

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white py-20">
      <SEO title="Admin — Agence" noIndex />
      <div className="container mx-auto px-6 max-w-4xl">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold/60 hover:text-pm-gold text-xs uppercase tracking-widest font-black mb-12 transition-colors">
          <ChevronLeftIcon className="w-4 h-4" /> Tableau de Bord
        </Link>
        <h1 className="text-4xl font-playfair font-black italic mb-10">Admin — Agence</h1>

        {/* Section À Propos */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-pm-gold uppercase tracking-widest">À Propos</h2>
            {!editingInfo ? (
              <button onClick={() => setEditingInfo(true)} className="flex items-center gap-1 text-xs text-pm-gold/70 hover:text-pm-gold border border-pm-gold/30 px-3 py-1 rounded">
                <PencilIcon className="w-3 h-3" /> Modifier
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={saveInfo} className="flex items-center gap-1 text-xs text-green-400 border border-green-400/30 px-3 py-1 rounded hover:bg-green-400/10">
                  <CheckIcon className="w-3 h-3" /> Sauvegarder
                </button>
                <button onClick={() => setEditingInfo(false)} className="flex items-center gap-1 text-xs text-red-400 border border-red-400/30 px-3 py-1 rounded hover:bg-red-400/10">
                  <XMarkIcon className="w-3 h-3" /> Annuler
                </button>
              </div>
            )}
          </div>
          <div className="bg-black/40 border border-pm-gold/20 rounded-lg p-6 space-y-4">
            {editingInfo ? (
              <>
                <div>
                  <label className="text-xs uppercase tracking-widest text-pm-off-white/50 mb-1 block">Paragraphe 1</label>
                  <textarea value={infoForm.p1} onChange={e => setInfoForm(f => ({ ...f, p1: e.target.value }))} rows={4} className="w-full bg-pm-dark border border-pm-gold/30 rounded p-3 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-pm-off-white/50 mb-1 block">Paragraphe 2</label>
                  <textarea value={infoForm.p2} onChange={e => setInfoForm(f => ({ ...f, p2: e.target.value }))} rows={4} className="w-full bg-pm-dark border border-pm-gold/30 rounded p-3 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-pm-off-white/80 leading-relaxed">{data.agencyInfo?.about.p1}</p>
                <p className="text-sm text-pm-off-white/80 leading-relaxed">{data.agencyInfo?.about.p2}</p>
              </>
            )}
          </div>
        </section>

        {/* Section Partenaires */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-pm-gold uppercase tracking-widest mb-4">Partenaires ({partners.length})</h2>
          <div className="bg-black/40 border border-pm-gold/20 rounded-lg p-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {partners.map(p => (
                <span key={p.name} className="flex items-center gap-2 bg-pm-dark border border-pm-gold/30 rounded-full px-3 py-1 text-sm">
                  {p.name}
                  <button onClick={() => removePartner(p.name)} className="text-red-400/70 hover:text-red-400">
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {partners.length === 0 && <p className="text-pm-off-white/40 text-sm">Aucun partenaire.</p>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPartner}
                onChange={e => setNewPartner(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addPartner()}
                placeholder="Nom du partenaire..."
                className="flex-1 bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
              />
              <button onClick={addPartner} className="flex items-center gap-1 bg-pm-gold text-pm-dark px-4 py-2 rounded text-sm font-bold hover:bg-pm-gold/80">
                <PlusIcon className="w-4 h-4" /> Ajouter
              </button>
            </div>
          </div>
        </section>

        {/* Section Timeline */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-pm-gold uppercase tracking-widest mb-4">Chronologie ({timeline.length})</h2>
          <div className="bg-black/40 border border-pm-gold/20 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-pm-dark/50 border-b border-pm-gold/20">
                <tr>
                  <th className="p-4 text-xs uppercase tracking-wider w-24">Année</th>
                  <th className="p-4 text-xs uppercase tracking-wider">Événement</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {timeline.map(t => (
                  <tr key={t.year} className="border-b border-pm-dark hover:bg-pm-dark/50">
                    <td className="p-4 font-bold text-pm-gold">{t.year}</td>
                    <td className="p-4 text-sm">{t.event}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => removeTimeline(t.year)} className="text-red-500/70 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {timeline.length === 0 && <p className="text-center p-6 text-pm-off-white/40 text-sm">Aucune entrée.</p>}
            <div className="p-4 border-t border-pm-gold/20 flex gap-2">
              <input type="text" value={newTimeline.year} onChange={e => setNewTimeline(f => ({ ...f, year: e.target.value }))} placeholder="Année" className="w-24 bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
              <input type="text" value={newTimeline.event} onChange={e => setNewTimeline(f => ({ ...f, event: e.target.value }))} placeholder="Description de l'événement..." className="flex-1 bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
              <button onClick={addTimeline} className="flex items-center gap-1 bg-pm-gold text-pm-dark px-4 py-2 rounded text-sm font-bold hover:bg-pm-gold/80">
                <PlusIcon className="w-4 h-4" /> Ajouter
              </button>
            </div>
          </div>
        </section>

        {/* Section Distinctions */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-pm-gold uppercase tracking-widest mb-4">Distinctions ({distinctions.length})</h2>
          <div className="space-y-3 mb-4">
            {distinctions.map((d, i) => (
              <div key={i} className="bg-black/40 border border-pm-gold/20 rounded-lg p-4">
                {editingDist?.index === i ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingDist.name}
                      onChange={e => setEditingDist(f => f && ({ ...f, name: e.target.value }))}
                      placeholder="Nom (ex: Meilleur Mannequin)"
                      className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
                    />
                    <textarea
                      value={editingDist.titles}
                      onChange={e => setEditingDist(f => f && ({ ...f, titles: e.target.value }))}
                      rows={3}
                      placeholder="Un titre par ligne..."
                      className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveDistinction} className="flex items-center gap-1 text-xs text-green-400 border border-green-400/30 px-3 py-1 rounded hover:bg-green-400/10">
                        <CheckIcon className="w-3 h-3" /> Sauvegarder
                      </button>
                      <button onClick={() => setEditingDist(null)} className="flex items-center gap-1 text-xs text-white/40 border border-white/10 px-3 py-1 rounded hover:bg-white/5">
                        <XMarkIcon className="w-3 h-3" /> Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-pm-gold text-sm">{d.name}</p>
                      <ul className="mt-1 space-y-0.5">
                        {d.titles.map((t, j) => <li key={j} className="text-xs text-pm-off-white/60">— {t}</li>)}
                      </ul>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditingDist({ index: i, name: d.name, titles: d.titles.join('\n') })} className="text-pm-gold/50 hover:text-pm-gold">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeDistinction(i)} className="text-red-500/50 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {distinctions.length === 0 && <p className="text-pm-off-white/30 text-sm">Aucune distinction.</p>}
          </div>
          <div className="bg-black/40 border border-pm-gold/20 rounded-lg p-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-pm-gold/50 font-black">Ajouter une distinction</p>
            <input
              type="text"
              value={newDist.name}
              onChange={e => setNewDist(f => ({ ...f, name: e.target.value }))}
              placeholder="Nom (ex: Meilleur Mannequin Féminin)"
              className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
            />
            <textarea
              value={newDist.titles}
              onChange={e => setNewDist(f => ({ ...f, titles: e.target.value }))}
              rows={3}
              placeholder="Un titre par ligne (ex: Fashion Day 2023&#10;Gala Mode 2024)"
              className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
            />
            <button onClick={addDistinction} className="flex items-center gap-1 bg-pm-gold text-pm-dark px-4 py-2 rounded text-sm font-bold hover:bg-pm-gold/80">
              <PlusIcon className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </section>

        {/* Section Réalisations */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-pm-gold uppercase tracking-widest mb-4">Réalisations ({achievements.length})</h2>
          <div className="space-y-3 mb-4">
            {achievements.map((a, i) => (
              <div key={i} className="bg-black/40 border border-pm-gold/20 rounded-lg p-4">
                {editingAchiev?.index === i ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editingAchiev.name}
                      onChange={e => setEditingAchiev(f => f && ({ ...f, name: e.target.value }))}
                      placeholder="Catégorie (ex: Défilés)"
                      className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
                    />
                    <textarea
                      value={editingAchiev.items}
                      onChange={e => setEditingAchiev(f => f && ({ ...f, items: e.target.value }))}
                      rows={4}
                      placeholder="Un élément par ligne..."
                      className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveAchievement} className="flex items-center gap-1 text-xs text-green-400 border border-green-400/30 px-3 py-1 rounded hover:bg-green-400/10">
                        <CheckIcon className="w-3 h-3" /> Sauvegarder
                      </button>
                      <button onClick={() => setEditingAchiev(null)} className="flex items-center gap-1 text-xs text-white/40 border border-white/10 px-3 py-1 rounded hover:bg-white/5">
                        <XMarkIcon className="w-3 h-3" /> Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-pm-gold text-sm">{a.name}</p>
                      <ul className="mt-1 space-y-0.5">
                        {a.items.map((item, j) => <li key={j} className="text-xs text-pm-off-white/60">— {item}</li>)}
                      </ul>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditingAchiev({ index: i, name: a.name, items: a.items.join('\n') })} className="text-pm-gold/50 hover:text-pm-gold">
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeAchievement(i)} className="text-red-500/50 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {achievements.length === 0 && <p className="text-pm-off-white/30 text-sm">Aucune réalisation.</p>}
          </div>
          <div className="bg-black/40 border border-pm-gold/20 rounded-lg p-4 space-y-3">
            <p className="text-xs uppercase tracking-widest text-pm-gold/50 font-black">Ajouter une catégorie de réalisations</p>
            <input
              type="text"
              value={newAchiev.name}
              onChange={e => setNewAchiev(f => ({ ...f, name: e.target.value }))}
              placeholder="Catégorie (ex: Défilés, Campagnes...)"
              className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
            />
            <textarea
              value={newAchiev.items}
              onChange={e => setNewAchiev(f => ({ ...f, items: e.target.value }))}
              rows={4}
              placeholder="Un élément par ligne (ex: Fashion Week Paris 2024&#10;Campagne Nike 2023)"
              className="w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold"
            />
            <button onClick={addAchievement} className="flex items-center gap-1 bg-pm-gold text-pm-dark px-4 py-2 rounded text-sm font-bold hover:bg-pm-gold/80">
              <PlusIcon className="w-4 h-4" /> Ajouter
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminAgency;
