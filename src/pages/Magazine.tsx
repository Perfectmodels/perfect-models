import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import Loading from '../components/Loading';

const PAGE_SIZE = 9;

const Magazine: React.FC = () => {
  const { data, isInitialized } = useData();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [page, setPage] = useState(1);

  const published = useMemo(
    () =>
      [...(data?.articles || [])]
        .filter(article => article.status !== 'draft')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [data?.articles],
  );

  const categories = useMemo(
    () => ['Toutes', ...Array.from(new Set(published.map(article => article.category).filter(Boolean))).sort()],
    [published],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return published.filter(article => {
      const matchesCategory = category === 'Toutes' || article.category === category;
      const matchesSearch = !query || [article.title, article.excerpt, article.author, ...(article.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [published, search, category]);

  const featured = filtered.find(article => article.isFeatured) || filtered[0];
  const others = filtered.filter(article => article.slug !== featured?.slug);
  const totalPages = Math.max(1, Math.ceil(others.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = others.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (!isInitialized) return <Loading />;

  const updateCategory = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <div className="bg-pm-dark min-h-screen pt-20 text-pm-off-white">
      <SEO
        title="Focus Model 241 — Magazine"
        description="Actualités, portraits, interviews, shootings et tendances de la mode gabonaise par Perfect Models Management."
      />

      <header className="page-container !pb-10 text-center">
        <span className="section-label">Éditorial mode</span>
        <h1 className="mt-3 text-5xl sm:text-7xl md:text-9xl font-playfair font-black gold-gradient-text uppercase tracking-tighter">
          Focus Model 241
        </h1>
        <p className="mt-5 max-w-2xl mx-auto text-white/45">Les visages, les créateurs, les événements et les histoires qui façonnent la mode gabonaise.</p>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <label className="sr-only" htmlFor="magazine-search">Rechercher un article</label>
          <input
            id="magazine-search"
            type="search"
            value={search}
            onChange={event => { setSearch(event.target.value); setPage(1); }}
            placeholder="Rechercher un sujet, un talent, un créateur..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-pm-gold"
          />
          <select
            aria-label="Filtrer par catégorie"
            value={category}
            onChange={event => updateCategory(event.target.value)}
            className="bg-black/50 border border-white/10 rounded-xl px-5 py-3 text-sm text-white/70 focus:outline-none focus:border-pm-gold"
          >
            {categories.map(item => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>

      {featured ? (
        <>
          <section className="max-w-[1700px] mx-auto px-4 sm:px-6 mb-20 sm:mb-28">
            <Link to={`/magazine/${featured.slug}`} className="group relative block min-h-[65vh] sm:h-[75vh] overflow-hidden bg-black">
              <img src={featured.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={featured.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 sm:p-10 lg:p-16 max-w-5xl">
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.28em] text-pm-gold">
                  {featured.category} · {new Date(featured.date).toLocaleDateString('fr-FR')} · {featured.author}
                </p>
                <h2 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-playfair font-black text-white leading-[0.95]">{featured.title}</h2>
                <p className="mt-5 max-w-2xl text-white/60 leading-relaxed line-clamp-3">{featured.excerpt}</p>
                <span className="mt-7 inline-block text-xs uppercase tracking-widest font-black text-pm-gold">Lire l'article →</span>
              </div>
            </Link>
          </section>

          <section className="page-container !pt-0">
            <div className="mb-8 flex items-end justify-between gap-5">
              <div>
                <span className="section-label">Dernières publications</span>
                <h2 className="mt-2 text-3xl sm:text-4xl font-playfair font-black text-white">À lire maintenant</h2>
              </div>
              <span className="text-xs text-white/30">{filtered.length} article{filtered.length > 1 ? 's' : ''}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {paginated.map((article, index) => (
                <motion.article
                  key={article.slug}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ delay: Math.min(index, 3) * 0.06 }}
                >
                  <Link to={`/magazine/${article.slug}`} className="group block">
                    <div className="aspect-[4/5] overflow-hidden bg-black">
                      <img src={article.imageUrl} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={article.title} />
                    </div>
                    <p className="mt-5 text-[10px] uppercase tracking-[0.25em] font-black text-pm-gold/80">
                      {article.category} · {new Date(article.date).toLocaleDateString('fr-FR')}
                    </p>
                    <h3 className="mt-2 text-2xl sm:text-3xl font-playfair font-bold text-white group-hover:text-pm-gold transition-colors">{article.title}</h3>
                    <p className="mt-3 text-sm text-white/40 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                    <p className="mt-4 text-xs text-white/25">Par {article.author}</p>
                  </Link>
                </motion.article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav aria-label="Pagination du magazine" className="mt-14 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(number => (
                  <button
                    key={number}
                    type="button"
                    aria-current={number === safePage ? 'page' : undefined}
                    onClick={() => { setPage(number); window.scrollTo({ top: 500, behavior: 'smooth' }); }}
                    className={`w-10 h-10 border text-xs font-black ${number === safePage ? 'bg-pm-gold border-pm-gold text-pm-dark' : 'border-white/10 text-white/40 hover:border-pm-gold/40'}`}
                  >
                    {number}
                  </button>
                ))}
              </nav>
            )}
          </section>
        </>
      ) : (
        <section className="page-container text-center py-24">
          <h2 className="text-3xl font-playfair font-black text-white/35">Aucun article ne correspond à votre recherche.</h2>
          <button type="button" onClick={() => { setSearch(''); updateCategory('Toutes'); }} className="mt-5 text-xs uppercase tracking-widest font-black text-pm-gold">Réinitialiser la recherche</button>
        </section>
      )}
    </div>
  );
};

export default Magazine;
