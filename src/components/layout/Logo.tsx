
import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ className = '' }) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-3 ${className}`}
      aria-label="Perfect Model Management Home"
    >
      <img 
        src="/lovable-uploads/fac4cbec-7fcf-4d4e-89a3-07667c562515.png" 
        alt="Perfect Model Management Logo" 
        className="h-10 w-auto"
      />
      <div className="hidden md:block">
        <span className="text-model-white text-lg font-playfair font-medium">
          Perfect Model Management
        </span>
      </div>
    </Link>
  );
};

export default Logo;
