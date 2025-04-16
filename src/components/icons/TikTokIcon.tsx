
import React from 'react';

interface TikTokIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const TikTokIcon: React.FC<TikTokIconProps> = ({ 
  size = 24, 
  color = 'currentColor', 
  className = '' 
}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 7.5v9a3 3 0 0 1 -3 3h-9a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3h9a3 3 0 0 1 3 3z" />
    <path d="M10 12a4 4 0 1 0 4 4" />
    <path d="M10 12a4 4 0 1 0 4 4" />
  </svg>
);
