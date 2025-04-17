
import React from 'react';
import { Link } from 'react-router-dom';

interface FooterLinkProps {
  to: string;
  label: string;
}

const FooterLink = ({ to, label }: FooterLinkProps) => (
  <li>
    <Link 
      to={to} 
      className="text-gray-400 hover:text-model-gold transition-colors duration-300"
    >
      {label}
    </Link>
  </li>
);

export default FooterLink;
