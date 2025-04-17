
import React from 'react';
import { Link } from 'react-router-dom';

interface FooterLinkProps {
  to: string;
  label: string;
}

const FooterLink = ({ to, label }: FooterLinkProps) => (
  <li>
    <Link to={to} className="text-light-gray hover-gold">
      {label}
    </Link>
  </li>
);

export default FooterLink;
