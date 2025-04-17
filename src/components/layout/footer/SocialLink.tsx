
import React from 'react';

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
}

const SocialLink = ({ href, icon }: SocialLinkProps) => (
  <a 
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-8 h-8 rounded-full bg-dark-gray flex items-center justify-center hover:bg-model-gold transition-colors duration-300"
  >
    {icon}
  </a>
);

export default SocialLink;
