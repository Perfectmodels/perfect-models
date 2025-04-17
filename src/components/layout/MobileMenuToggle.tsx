
import React from 'react';
import { Menu, X } from 'lucide-react';

interface MobileMenuToggleProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ isOpen, setIsOpen }) => {
  return (
    <button 
      onClick={() => setIsOpen(!isOpen)} 
      className="md:hidden text-model-white"
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {isOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  );
};

export default MobileMenuToggle;
