import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import SEO from '../components/SEO';
import { ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isInitialized } = useData();

  if (!isInitialized || !data) return <div className="h-screen bg-pm-dark flex items-center justify-center"><div className="w-12 h-px bg-pm-gold animate-pulse" /></div>;

  const service = data.agencyServices.find(s => s.slug === slug);
  if (!service) return <div className="h-screen bg-pm-dark flex items-center justify-center text-white">Service introuvable.</div>;

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white">
      <SEO title={service.title} description={service.description} />
      <div className="page-container max-w-4xl">
        <Link to="/services" className="inline-flex items-center gap-2 text-pm-gold/60 hover:text-pm-gold text-xs uppercase tracking-widest font-black mb-16 transition-colors">
          <ArrowLeftIcon className="w-4 h-4" /> Tous les services
        </Link>
        <span className="section-label">{service.category}</span>
        <h1 className="text-5xl md:text-7xl font-playfair font-black italic mt-4 mb-12">{service.title}</h1>
        <p className="text-xl text-white/60 font-light leading-relaxed mb-16">{service.description}</p>
        {service.details && (
          <div className="border border-white/5 p-12">
            <h2 className="text-2xl font-playfair font-bold text-pm-gold mb-8">{service.details.title}</h2>
            <ul className="space-y-4">
              {service.details.points.map((point, i) => (
                <li key={i} className="flex items-start gap-4 text-white/60">
                  <CheckCircleIcon className="w-5 h-5 text-pm-gold shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {service.buttonLink && (
          <div className="mt-16">
            <Link to={service.buttonLink} className="btn-premium">{service.buttonText || 'Réserver'}</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;
