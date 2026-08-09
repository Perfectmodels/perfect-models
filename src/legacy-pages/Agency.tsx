import React from 'react';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
    CheckBadgeIcon, 
    ArrowLongRightIcon,
    SparklesIcon,
    GlobeAltIcon,
    TrophyIcon,
    ShieldCheckIcon,
    AcademicCapIcon
} from '@heroicons/react/24/outline';
import Loading from '../components/Loading';

const Agency: React.FC = () => {
  const { data, isInitialized } = useData();

  if (!isInitialized || !data) {
    return <Loading />;
  }
  
  const { agencyInfo, modelDistinctions, agencyTimeline, siteImages, agencyAchievements } = data;

  const commitments = [
    {
      title: "Intégrité Absolue",
      description: "Nous garantissons une transparence totale dans la gestion des carrières et une éthique contractuelle stricte pour protéger nos talents.",
      icon: ShieldCheckIcon
    },
    {
      title: "Standard International",
      description: "Notre mission est d'élever les visages du Gabon aux sommets des exigences de la mode mondiale, sans compromis sur la qualité.",
      icon: GlobeAltIcon
    },
    {
      title: "Accompagnement Elite",
      description: "Plus qu'une agence, nous sommes un mentor. Nous investissons dans la formation continue et le bien-être psychologique de nos mannequins.",
      icon: AcademicCapIcon
    }
  ];

  return (
    <div className="bg-pm-dark overflow-x-hidden">
      <SEO title="Notre Histoire | Agence PMM" description="Agence de mannequins d'élite à Libreville, Gabon." />
      
      {/* 1. EDITORIAL HEADER */}
      <section className="relative pt-28 sm:pt-36 lg:pt-40 pb-12 sm:pb-20 px-4 sm:px-8 lg:px-20">
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="section-label"
        >
          Depuis 2021
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="text-4xl sm:text-6xl md:text-9xl font-playfair font-black text-white leading-tight tracking-tighter"
        >
          Fondée sur <br/><span className="italic gold-gradient-text">l'Excellence</span>
        </motion.h1>
      </section>

      {/* 2. CORE NARRATIVE */}
      <section className="page-container flex flex-col lg:flex-row gap-12 sm:gap-20 lg:gap-32">
        <div className="lg:w-1/2">
           <div className="relative aspect-[3/4] overflow-hidden bg-pm-gray">
              <img src={siteImages.agencyHistory} alt="Heritage" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-pm-dark via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 text-[6rem] sm:text-[10rem] font-playfair font-black text-white/5 pointer-events-none">PMM</div>
           </div>
        </div>
        <div className="lg:w-1/2 space-y-10 sm:space-y-16 lg:pt-32">
            <div className="space-y-6 sm:space-y-8">
                <h2 className="text-2xl sm:text-4xl md:text-6xl font-playfair font-black italic">"Redéfinir les standards de la beauté africaine."</h2>
                <div className="h-px w-24 bg-pm-gold"></div>
            </div>
            <div className="space-y-8 sm:space-y-12 text-lg sm:text-xl font-light leading-relaxed text-white/60 italic">
                <p>{agencyInfo.about.p1}</p>
                <p>{agencyInfo.about.p2}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 border-t border-white/5 pt-8 sm:pt-12">
                {agencyInfo.values.map(val => (
                    <div key={val.name} className="space-y-3 sm:space-y-4">
                        <h3 className="text-pm-gold font-black uppercase tracking-[0.3em] text-[10px]">{val.name}</h3>
                        <p className="text-xs text-white/40 leading-relaxed uppercase tracking-widest">{val.description}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 3. NOS ENGAGEMENTS */}
      <section className="bg-[#050505] py-20 sm:py-32 lg:py-40 border-y border-white/5">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20">
          <div className="text-center mb-12 sm:mb-24">
            <span className="section-label">Notre Promesse</span>
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-playfair font-black italic">Nos Engagements</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
            {commitments.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group p-8 sm:p-12 border border-white/5 bg-pm-dark hover:bg-pm-gold/[0.02] transition-all duration-700"
              >
                <div className="mb-6 sm:mb-10 inline-block">
                  <item.icon className="w-10 h-10 sm:w-14 sm:h-14 text-pm-gold/30 group-hover:text-pm-gold group-hover:scale-110 transition-all duration-700" strokeWidth={1} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-playfair font-bold text-white mb-4 sm:mb-6 group-hover:text-pm-gold transition-colors">{item.title}</h3>
                <p className="text-white/40 leading-relaxed font-light group-hover:text-white/60 transition-colors">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TIMELINE */}
      <section className="py-20 sm:py-32 lg:py-40 overflow-hidden">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20 mb-12 sm:mb-24">
            <span className="section-label">Notre Parcours</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-black">Notre Histoire</h2>
        </div>
        <div className="overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
            <style>{`
                @keyframes scroll-timeline { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .scroll-timeline:hover { animation-play-state: paused; }
            `}</style>
            <div className="scroll-timeline flex" style={{ width: 'max-content', animation: 'scroll-timeline 60s linear infinite' }}>
                {[...agencyTimeline, ...agencyTimeline].map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-[260px] sm:w-[340px] p-6 sm:p-10 glass-card mx-3 sm:mx-4">
                        <span className="text-4xl sm:text-5xl font-playfair font-black text-pm-gold/20 block mb-4 sm:mb-6">{item.year}</span>
                        <p className="text-base sm:text-lg font-bold text-white leading-snug">{item.event}</p>
                        <div className="mt-6 sm:mt-8 flex justify-end"><div className="w-10 h-[2px] bg-pm-gold/20"></div></div>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 5. DISTINCTIONS */}
      <section className="py-20 sm:py-32 lg:py-40 overflow-hidden">
         <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20 mb-12 sm:mb-24 text-center">
            <span className="section-label">Nos Récompenses</span>
            <h2 className="text-5xl sm:text-7xl font-playfair font-black italic">Distinctions</h2>
         </div>
         <div className="overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
            <style>{`
                @keyframes scroll-distinctions { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .scroll-distinctions:hover { animation-play-state: paused; }
            `}</style>
            <div className="scroll-distinctions flex" style={{ width: 'max-content', animation: 'scroll-distinctions 50s linear infinite reverse' }}>
                {[...modelDistinctions, ...modelDistinctions].map((dist, i) => (
                    <div key={i} className="flex-shrink-0 w-[240px] sm:w-[300px] p-8 sm:p-12 border border-white/5 hover:bg-pm-gold/5 transition-all duration-700 text-center group mx-1">
                        <TrophyIcon className="w-10 h-10 sm:w-12 sm:h-12 text-pm-gold/20 mx-auto mb-6 sm:mb-10 group-hover:text-pm-gold group-hover:scale-110 transition-all duration-700" strokeWidth={1} />
                        <h3 className="text-xl sm:text-2xl font-playfair font-bold text-white mb-4 sm:mb-6 leading-tight">{dist.name}</h3>
                        <ul className="space-y-2">
                            {dist.titles.map((t, j) => (
                                <li key={j} className="text-[10px] uppercase font-black tracking-[0.3em] text-white/30 group-hover:text-white/60 transition-colors">{t}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
         </div>
      </section>

      {/* 6. RÉALISATIONS */}
      {agencyAchievements && agencyAchievements.length > 0 && (
      <section className="py-20 sm:py-32 lg:py-40 overflow-hidden border-t border-white/5">
         <div className="max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-20 mb-12 sm:mb-24">
            <span className="section-label">Notre Bilan</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-black">Réalisations</h2>
         </div>
         <div className="overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)' }}>
            <style>{`
                @keyframes scroll-achievements { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .scroll-achievements:hover { animation-play-state: paused; }
            `}</style>
            <div className="scroll-achievements flex items-stretch gap-3 sm:gap-4 px-3 sm:px-4" style={{ width: 'max-content', animation: 'scroll-achievements 120s linear infinite' }}>
                {[...agencyAchievements, ...agencyAchievements].map((cat, i) => (
                    <div key={i} className="flex-shrink-0 w-[260px] sm:w-[320px] p-8 sm:p-10 border border-white/5 hover:bg-pm-gold/5 transition-all duration-700 group">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-pm-gold mb-6 sm:mb-8">{cat.name}</h3>
                        <ul className="space-y-3 sm:space-y-4">
                            {cat.items.map((item, j) => (
                                <li key={j} className="flex items-start gap-3">
                                    <span className="text-pm-gold/30 mt-1 shrink-0">◆</span>
                                    <span className="text-sm font-medium text-white/50 group-hover:text-white/70 transition-colors leading-snug">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
         </div>
      </section>
      )}

      {/* 7. FINAL CTA */}
      <section className="relative min-h-[60vh] sm:h-[80vh] flex items-center justify-center border-t border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-pm-dark">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] bg-pm-gold rounded-full opacity-[0.02] blur-[150px] animate-glow"></div>
          </div>
          <div className="relative z-10 text-center max-w-4xl px-4 sm:px-6 space-y-10 sm:space-y-16 py-20">
              <h2 className="text-4xl sm:text-5xl md:text-8xl font-playfair font-black italic">Prêt à laisser <br/><span className="gold-gradient-text">votre empreinte</span> ?</h2>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 justify-center">
                  <Link to="/contact" className="btn-premium">Contacter l'Agence</Link>
                  <Link to="/mannequins" className="btn-premium bg-white text-pm-dark border-none">Voir les Talents</Link>
              </div>
          </div>
      </section>
    </div>
  );
};

export default Agency;
