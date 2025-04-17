
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = '' }) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center ${className}`}
      aria-label="Perfect Model Management Home"
    >
      <img 
        src="/lovable-uploads/fac4cbec-7fcf-4d4e-89a3-07667c562515.png" 
        alt="Perfect Model Management Logo" 
        className="h-10 w-10 mr-2"
      />
      <span className="font-playfair text-model-white text-xl md:text-2xl font-bold tracking-wider hidden md:inline">
        PERFECT MODELS
      </span>
    </Link>
  );
};

export default Logo;
