import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ArrowLeftOnRectangleIcon, AcademicCapIcon, CheckCircleIcon, XCircleIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import BackToTopButton from '../components/BackToTopButton';
import { QuizQuestion, Module, SiteImages } from '../types';
import { useData } from '../contexts/DataContext';

// --- STUDENT VIEW ---
const StudentView: React.FC<{ onLogout: () => void; courseData: Module[]; siteImages: SiteImages; }> = ({ onLogout, courseData, siteImages }) => {
    const [openModule, setOpenModule] = useState<number | null>(0);

    const toggleModule = (index: number) => {
        setOpenModule(openModule === index ? null : index);
    };

    return (
        <>
            <section 
                className="relative min-h-[50vh] flex items-center justify-center text-center bg-cover bg-center"
                style={{ backgroundImage: `url('${siteImages.classroomBg}')` }}
                aria-labelledby="formations-title"
            >
                <div className="absolute inset-0 bg-pm-dark/80"></div>
                <div className="relative z-10 p-6">
                    <h1 id="formations-title" className="text-4xl md:text-6xl font-playfair text-pm-gold font-extrabold" style={{ textShadow: '0 0 15px rgba(212, 175, 55, 0.7)' }}>
                        PMM Classroom
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-pm-off-white/90 max-w-3xl mx-auto">
                        40 chapitres théoriques pour maîtriser l'art du mannequinat et lancer une carrière à succès.
                    </p>
                </div>
            </section>

            <div className="container mx-auto px-4 sm:px-6 py-20">
                <div className="lg:grid lg:grid-cols-12 lg:gap-12">
                     {/* Sidebar */}
                    <aside className="lg:col-span-3 lg:sticky lg:top-32 self-start mb-12 lg:mb-0">
                        <div className="bg-black p-6 border border-pm-gold/20">
                          <h3 className="text-xl font-playfair text-pm-gold mb-4">Navigation du Cours</h3>
                          <nav>
                            {courseData.map((module, moduleIndex) => (
                              <div key={moduleIndex} className="mb-3">
                                <a href={`#module-${moduleIndex}`} onClick={(e) => { e.preventDefault(); toggleModule(moduleIndex); document.getElementById(`module-${moduleIndex}`)?.scrollIntoView(); }} className="font-bold text-pm-off-white mb-2 text-sm hover:text-pm-gold">
                                    {module.title}
                                </a>
                                <ul className="mt-2 space-y-1 pl-2 border-l border-pm-gold/30">
                                  {module.chapters.map((chapter, chapterIndex) => (
                                    <li key={chapterIndex}>
                                      <Link to={`/formations/${module.slug}/${chapter.slug}`} className="block text-xs text-pm-off-white/70 hover:text-pm-gold">
                                        {chapter.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </nav>
                        </div>
                    </aside>
                    
                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        <section className="text-center mb-16 relative">
                             <h2 className="text-3xl font-playfair text-pm-gold mb-4">De l'Aspiration à la Professionnalisation</h2>
                             <p className="text-pm-off-white/80 leading-relaxed max-w-3xl mx-auto">
                                Notre programme complet est conçu pour vous doter de toutes les connaissances théoriques indispensables pour exceller. Chaque module explore en profondeur un aspect crucial du métier, vous préparant à naviguer avec confiance dans l'industrie de la mode.
                             </p>
                             <button 
                                onClick={onLogout}
                                className="absolute top-0 right-0 -mt-8 md:mt-0 inline-flex items-center gap-2 text-pm-gold/70 hover:text-pm-gold text-sm transition-colors"
                             >
                                 <ArrowLeftOnRectangleIcon className="w-5 h-5"/>
                                 <span className="hidden md:inline">Déconnexion</span>
                             </button>
                        </section>
                        
                        <div className="mb-12">
                            <Link to="/formations/forum" className="group block w-full text-left p-6 bg-pm-gold/10 border-2 border-dashed border-pm-gold/30 hover:border-pm-gold hover:bg-pm-gold/20 transition-all duration-300">
                                <div className="flex items-center gap-4">
                                    <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-pm-gold flex-shrink-0" />
                                    <div>
                                        <h3 className="text-xl font-bold text-pm-gold">Rejoindre le Forum de Discussion</h3>
                                        <p className="text-sm text-pm-off-white/80">Échangez avec les autres mannequins, posez vos questions et partagez votre expérience.</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    
                        <section aria-label="Modules de formation" className="space-y-4">
                            {courseData.map((module, index) => (
                                <div key={index} id={`module-${index}`} className="bg-black border border-pm-gold/20 overflow-hidden scroll-mt-24">
                                    <button
                                        onClick={() => toggleModule(index)}
                                        className="w-full flex justify-between items-center p-4 md:p-5 text-left text-lg md:text-xl font-bold text-pm-gold hover:bg-pm-gold/5"
                                        aria-expanded={openModule === index}
                                        aria-controls={`module-content-${index}`}
                                    >
                                        <span>{module.title}</span>
                                        <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${openModule === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div
                                        id={`module-content-${index}`}
                                        className={`transition-all duration-500 ease-in-out ${openModule === index ? 'max-h-full visible' : 'max-h-0 invisible'}`}
                                    >
                                        <div className="p-5 border-t border-pm-gold/20">
                                            <ul className="space-y-3 list-disc list-inside">
                                                {module.chapters.map((chapter) => (
                                                    <li key={chapter.slug}>
                                                        <Link to={`/formations/${module.slug}/${chapter.slug}`} className="text-pm-off-white/80 hover:text-pm-gold hover:underline">
                                                            {chapter.title}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </main>
                </div>
            </div>
            <BackToTopButton />
        </>
    );
};

// --- MAIN COMPONENT ---
const Formations: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Rediriger vers le nouveau système de formation avancée
        navigate('/formation', { replace: true });
    }, [navigate]);

    return (
        <div className="min-h-screen bg-pm-dark flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-px bg-pm-gold animate-pulse mx-auto mb-4" />
                <p className="text-white/40 text-sm">Redirection vers la formation avancée...</p>
            </div>
        </div>
    );
};

export default Formations;
