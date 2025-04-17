
import React from 'react';
import FooterSections from './footer/FooterSections';
import Copyright from './footer/Copyright';

const Footer = () => {
  return (
    <footer className="bg-model-black text-model-white py-12">
      <div className="container mx-auto px-6">
        <FooterSections />
        <Copyright />
      </div>
    </footer>
  );
};

export default Footer;
