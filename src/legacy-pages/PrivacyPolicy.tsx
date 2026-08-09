import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicy: React.FC = () => (
  <div className="bg-pm-dark min-h-screen text-pm-off-white">
    <SEO title="Politique de Confidentialité" noIndex />
    <div className="page-container max-w-3xl">
      <h1 className="text-5xl font-playfair font-black italic mb-12">Politique de Confidentialité</h1>
      <div className="prose prose-invert prose-gold space-y-8 text-white/60 leading-relaxed">
        <p>Perfect Models Management s'engage à protéger la vie privée de ses utilisateurs. Les données collectées via ce site (formulaires de contact, candidatures) sont utilisées uniquement dans le cadre de nos activités et ne sont jamais cédées à des tiers.</p>
        <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à <a href="mailto:contact@perfectmodels.online" className="text-pm-gold hover:underline">contact@perfectmodels.online</a>.</p>
        <p>Les cookies utilisés sur ce site sont strictement nécessaires au bon fonctionnement de l'application.</p>
        <p className="text-white/30 text-sm">Dernière mise à jour : Janvier 2025</p>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
