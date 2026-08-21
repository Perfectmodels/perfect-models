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
      const matchesSearch = !query || [
        article.title,
        article.excerpt,
        article.author,
        ...(article.tags || []),
      ].join(' ').toLowerCase().includes(query);
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

  const resetFilters = () => {
    setSearch('');
    updateCategory('Toutes');
  };

  return (
    <div className="min-h-screen bg-pm-dark text-pm-off-white pt-20">
      <SEO
        title="Focus Model 241 — Magazine mode gabonaise"
        description="Actualités, portraits, interviews, créateurs, événements et tendances qui façonnent la mode gabonaise."
      />

      {/* Editorial masthead */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.13),transparent_38%)]" />
        <div className="page-container relative !pb-12 sm:!pb-16">
          <div className="flex items-center justify-between gap-6 border-y border-white/10 py-4 text-[9px] sm:text-[10px] uppercase tracking-[0.28em] text-white/35">
            <span>Perfect Models Management</span>
            <span className="hidden sm:block">Libreville · Gabon</span>
            <span>{published.length} publication{published.length > 1 ? 's' : ''}</span>
          </div>

          <div className="pt-12 sm:pt-16 grid lg:grid-cols-[1fr_360px] gap-10 items-end">
            <div>
              <p className="section-label">Le magazine de la mode gabonaise</p>
              <h1 className="mt-4 text-[clamp(3.8rem,10vw,9.5rem)] leading-[0.78] font-playfair font-black uppercase tracking-[-0.065em] gold-gradient-text">
                Focus<br />Model <span className="text-white">241</span>
              </h1>
            </div>
            <div className="lg:pb-2">
              <p className="text-lg sm:text-xl leading-relaxed text-white/55">
                Les visages, les créateurs, les scènes et les histoires qui donnent une nouvelle voix à la mode au Gabon.
              </p>
              <div className="mt-6 h-px w-20 bg-pm-gold" />
            </div>
          </div>
        </div>
      </header>

      {/* Search + editorial filters */}
      <section className="page-container !py-8 sm:!py-10">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-2xl">
            <label className="sr-only" htmlFor="magazine-search">Rechercher un article</label>
            <input
              id="magazine-search"
              type="search"
              value={search}
              onChange={event => { setSearch(event.target.value); setPage(1); }}
              placeholder="Rechercher un sujet, un talent, un créateur..."
              className="w-full h-12 bg-white/[0.035] border border-white/10 rounded-none px-5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-pm-gold/70 transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Catégories du magazine">
            {categories.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => updateCategory(item)}
                aria-selected={category === item}
                role="tab"
                className={`shrink-0 px-4 h-10 border text-[10px] uppercase tracking-[0.18em] font-black transition-all ${
                  category === item
                    ? 'bg-pm-gold border-pm-gold text-pm-dark'
                    : 'border-white/10 text-white/40 hover:text-white hover:border-white/25'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {featured ? (
        <>
          {/* Cover story */}
          <section className="max-w-[1700px] mx-auto px-4 sm:px-6 mb-20 sm:mb-28">
            <Link to={`/magazine/${featured.slug}`} className="group relative block overflow-hidden bg-black min-h-[620px] sm:min-h-[720px]">
              <img
                src={featured.imageUrl}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1400ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/10" />
              <div className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-pm-gold" />
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-black text-white/70">À la une</span>
              </div>
              <div className="absolute bottom-0 left-0 p-7 sm:p-12 lg:p-16 max-w-4xl">
                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.26em] text-pm-gold">
                  {featured.category} · {new Date(featured.date).toLocaleDateString('fr-FR')} · {featured.author}
                </p>
                <h2 className="mt-4 text-4xl sm:text-6xl lg:text-7xl font-playfair font-black text-white leading-[0.9] tracking-tight">
                  {featured.title}
                </h2>
                <p className="mt-6 max-w-2xl text-sm sm:text-base text-white/60 leading-relaxed line-clamp-3">
                  {featured.excerpt}
                </p>
                <span className="mt-8 inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.22em] font-black text-pm-gold">
                  Lire l'article <span className="text-lg transition-transform group-hover:translate-x-2">→</span>
                </span>
              </div>
            </Link>
          </section>

          {/* Latest */}
          <section className="page-container !pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 border-b border-white/10 pb-6 mb-10">
              <div>
                <span className="section-label">Le dernier regard</span>
                <h2 className="mt-2 text-4xl sm:text-5xl font-playfair font-black text-white">À lire maintenant</h2>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-7 gap-y-14">
              {paginated.map((article, index) => (
                <motion.article
                  key={article.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ delay: Math.min(index, 4) * 0.05, duration: 0.55 }}
                >
                  <Link to={`/magazine/${article.slug}`} className="group block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-black">
                      <img
                        src={article.imageUrl}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        alt={article.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-[9px] uppercase tracking-[0.18em] font-black text-pm-gold">
                        {article.category}
                      </span>
                    </div>
                    <p className="mt-5 text-[9px] uppercase tracking-[0.24em] font-black text-white/30">
                      {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <h3 className="mt-2 text-2xl sm:text-[1.75rem] leading-tight font-playfair font-bold text-white group-hover:text-pm-gold transition-colors">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-sm text-white/40 line-clamp-3 leading-relaxed">{article.excerpt}</p>
                    <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-white/25">Par {article.author}</p>
                  </Link>
                </motion.article>
              ))}
            </div>

            {paginated.length === 0 && (
              <div className="py-24 text-center border border-white/10">
                <h3 className="text-2xl font-playfair font-black text-white/40">Aucun article trouvé.</h3>
                <button type="button" onClick={resetFilters} className="mt-5 text-[10px] uppercase tracking-[0.22em] font-black text-pm-gold hover:text-white transition-colors">
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            {totalPages > 1 && (
              <nav aria-label="Pagination du magazine" className="mt-16 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-2">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map(number => (
                  <button
                    key={number}
                    type="button"
                    aria-current={number === safePage ? 'page' : undefined}
                    onClick={() => { setPage(number); window.scrollTo({ top: 700, behavior: 'smooth' }); }}
                    className={`w-11 h-11 border text-[10px] font-black transition-all ${
                      number === safePage
                        ? 'bg-pm-gold border-pm-gold text-pm-dark'
                        : 'border-white/10 text-white/35 hover:border-pm-gold/50 hover:text-white'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </nav>
            )}
          </section>

          {/* Editorial signature */}
          <section className="page-container !py-24 sm:!py-32">
            <div className="relative overflow-hidden border-y border-white/10 py-14 sm:py-20 text-center">
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(212,175,55,0.09),transparent_55%)]" />
              <span className="section-label relative">Focus Model 241</span>
              <h2 className="relative mt-4 text-4xl sm:text-6xl font-playfair font-black text-white">La mode raconte nos histoires.</h2>
              <p className="relative mt-5 max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-white/40">
                Un espace éditorial dédié aux talents, aux créateurs et aux initiatives qui font avancer la mode gabonaise.
              </p>
              <Link to="/contact" className="relative mt-8 inline-flex px-6 py-3 border border-pm-gold text-pm-gold text-[10px] uppercase tracking-[0.22em] font-black hover:bg-pm-gold hover:text-pm-dark transition-colors">
                Proposer un sujet
              </Link>
            </div>
          </section>
        </>
      ) : (
        <section className="page-container py-24 text-center">
          <h2 className="text-3xl font-playfair font-black text-white/35">Le magazine est momentanément vide.</h2>
        </section>
      )}
    </div>
  );
};

export default Magazine;
