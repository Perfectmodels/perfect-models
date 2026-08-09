import React from 'react';
import SEO from '../components/SEO';

const TermsOfUse: React.FC = () => (
  <div className="bg-pm-dark min-h-screen text-pm-off-white">
    <SEO title="Conditions d'Utilisation" noIndex />
    <div className="page-container max-w-3xl">
      <h1 className="text-5xl font-playfair font-black italic mb-12">Conditions d'Utilisation</h1>
      <div className="space-y-8 text-white/60 leading-relaxed">
        <p>En accédant à ce site, vous acceptez les présentes conditions d'utilisation. Perfect Models Management se réserve le droit de modifier ces conditions à tout moment.</p>
        <p>Tout le contenu présent sur ce site (textes, images, vidéos) est la propriété exclusive de Perfect Models Management et est protégé par les lois sur la propriété intellectuelle.</p>
        <p>L'utilisation de ce site à des fins commerciales sans autorisation préalable est strictement interdite.</p>
        <p>Pour toute question, contactez-nous à <a href="mailto:contact@perfectmodels.online" className="text-pm-gold hover:underline">contact@perfectmodels.online</a>.</p>
        <p className="text-white/30 text-sm">Dernière mise à jour : Janvier 2025</p>
      </div>
    </div>
  </div>
);

export default TermsOfUse;
