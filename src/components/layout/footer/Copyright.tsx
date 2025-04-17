
import React from 'react';
import { Link } from 'react-router-dom';

const Copyright = () => {
  return (
    <div className="border-t border-dark-gray mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
      <p className="text-medium-gray text-sm mb-4 md:mb-0">
        © {new Date().getFullYear()} Perfect Models Management. Tous droits réservés.
      </p>
      <div className="flex space-x-4 text-sm text-medium-gray">
        <Link to="/privacy" className="hover-gold">Politique de Confidentialité</Link>
        <Link to="/terms" className="hover-gold">Conditions d'Utilisation</Link>
      </div>
    </div>
  );
};

export default Copyright;
