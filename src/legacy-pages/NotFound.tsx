import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="h-screen bg-pm-dark flex flex-col items-center justify-center text-center px-6">
    <span className="text-[20vw] font-playfair font-black text-white/[0.03] select-none leading-none">404</span>
    <h1 className="text-4xl font-playfair font-black text-white -mt-8 mb-6">Page introuvable</h1>
    <p className="text-white/40 mb-12 max-w-md">Cette page n'existe pas ou a été déplacée.</p>
    <Link to="/" className="btn-premium">Retour à l'accueil</Link>
  </div>
);

export default NotFound;
