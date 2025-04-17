
import React from 'react';
import FooterSections from './footer/FooterSections';
import PartnersCarousel from './footer/PartnersCarousel';
import Copyright from './footer/Copyright';

const Footer = () => {
  return (
    <footer className="bg-model-black text-model-white py-12">
      <div className="container mx-auto px-6">
        <FooterSections />

        {/* Partners Carousel */}
        <div className="mt-12 pt-8 border-t border-dark-gray">
          <h3 className="font-playfair text-xl mb-6 text-center">NOS PARTENAIRES</h3>
          <PartnersCarousel />
        </div>

        <Copyright />
      </div>
    </footer>
  );
};

export default Footer;
