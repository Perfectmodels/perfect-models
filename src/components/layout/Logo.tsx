
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
        className="h-10 w-auto"
      />
    </Link>
  );
};

export default Logo;
