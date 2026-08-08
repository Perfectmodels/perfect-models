import React, { useMemo, useState } from 'react';
import ModelCard from '../components/ModelCard';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import Loading from '../components/Loading';
import { motion } from 'framer-motion';

const Models: React.FC = () => {
  const { data, isInitialized } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [gender, setGender] = useState('Tous');
  const [level, setLevel] = useState('Tous');
  const [category, setCategory] = useState('Toutes');
  const [location, setLocation] = useState('Toutes');

  const publicModels = useMemo(
    () => (data?.models || []).filter(model => model.isPublic === true),
    [data?.models],
  );

  const categories = useMemo(
    () => Array.from(new Set(publicModels.flatMap(model => model.categories || []))).sort(),
    [publicModels],
  );

  const locations = useMemo(
    () => Array.from(new Set(publicModels.map(model => model.location).filter(Boolean) as string[])).sort(),
    [publicModels],
  );

  const filteredModels = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return publicModels.filter(model => {
      const matchesSearch = !query || model.name.toLowerCase().includes(query);
      const matchesGender = gender === 'Tous' || model.gender === gender;
      const matchesLevel = level === 'Tous' || model.level === level;
      const matchesCategory = category === 'Toutes' || model.categories?.includes(category);
      const matchesLocation = location === 'Toutes' || model.location === location;
      return matchesSearch && matchesGender && matchesLevel && matchesCategory && matchesLocation;
    });
  }, [publicModels, searchTerm, gender, level, category, location]);

  if (!isInitialized) return <Loading />;

  const resetFilters = () => {
    setSearchTerm('');
    setGender('Tous');
    setLevel('Tous');
    setCategory('Toutes');
    setLocation('Toutes');
  };

  const selectClass = 'bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white/70 focus:outline-none focus:border-pm-gold';

  return (
    <div className="bg-pm-dark min-h-screen pt-20 text-pm-off-white">
      <SEO
        title="Nos Mannequins"
        description="Découvrez le catalogue des mannequins représentés par Perfect Models Management à Libreville : runway, éditorial, publicité et productions de marque."
      />

      <div className="page-container">
        <header className="mb-14 sm:mb-20 text-center">
          <span className="section-label">Notre roster</span>
          <h1 className="mt-3 text-5xl md:text-8xl font-playfair font-black italic tracking-tighter">
            Nos <span className="gold-gradient-text">Talents</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-white/45">
            Recherchez le profil adapté à votre défilé, campagne, shooting, clip ou activation de marque.
          </p>
        </header>

        <section className="mb-12 sm:mb-16 p-5 sm:p-7 border border-white/5 bg-black/25 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2">
              <label htmlFor="model-search" className="text-[10px] uppercase tracking-widest text-white/35 block mb-2">Rechercher</label>
              <input
                id="model-search"
                type="search"
                placeholder="Nom du mannequin"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold"
              />
            </div>
            <div>
              <label htmlFor="gender-filter" className="text-[10px] uppercase tracking-widest text-white/35 block mb-2">Genre</label>
              <select id="gender-filter" value={gender} onChange={event => setGender(event.target.value)} className={`w-full ${selectClass}`}>
                <option>Tous</option>
                <option>Femme</option>
                <option>Homme</option>
              </select>
            </div>
            <div>
              <label htmlFor="level-filter" className="text-[10px] uppercase tracking-widest text-white/35 block mb-2">Niveau</label>
              <select id="level-filter" value={level} onChange={event => setLevel(event.target.value)} className={`w-full ${selectClass}`}>
                <option>Tous</option>
                <option>Pro</option>
                <option>Débutant</option>
              </select>
            </div>
            <div className="flex items-end">
              <button type="button" onClick={resetFilters} className="w-full py-3 text-[10px] uppercase tracking-widest font-black border border-pm-gold/30 text-pm-gold rounded-xl hover:bg-pm-gold hover:text-pm-dark transition-colors">
                Réinitialiser
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label htmlFor="category-filter" className="text-[10px] uppercase tracking-widest text-white/35 block mb-2">Spécialité</label>
              <select id="category-filter" value={category} onChange={event => setCategory(event.target.value)} className={`w-full ${selectClass}`}>
                <option value="Toutes">Toutes les spécialités</option>
                {categories.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="location-filter" className="text-[10px] uppercase tracking-widest text-white/35 block mb-2">Localisation</label>
              <select id="location-filter" value={location} onChange={event => setLocation(event.target.value)} className={`w-full ${selectClass}`}>
                <option value="Toutes">Toutes les villes</option>
                {locations.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
          </div>

          <p className="mt-5 text-xs text-white/35">
            {filteredModels.length} profil{filteredModels.length > 1 ? 's' : ''} disponible{filteredModels.length > 1 ? 's' : ''} dans cette sélection.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredModels.map((model, index) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ delay: Math.min(index, 4) * 0.06, duration: 0.45 }}
            >
              <ModelCard model={model} />
            </motion.div>
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="text-center py-24 border border-white/5 rounded-2xl">
            <p className="font-playfair italic text-3xl text-white/25">Aucun talent ne correspond à ces critères.</p>
            <button type="button" onClick={resetFilters} className="mt-5 text-xs uppercase tracking-widest font-black text-pm-gold">Afficher tous les profils</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Models;
