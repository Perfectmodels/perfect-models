
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
    {/* Updated TikTok icon path with more accurate representation */}
    <path d="M16.6 5.82c.9.8 2.1 1.18 3.4 1.18v3c-.6 0-1.2-.13-1.7-.29-.5-.14-1-.39-1.5-.68v5.1c0 5.05-5.5 8.4-10 5.54-2.7-1.7-3.8-5.55-1.9-8.05 1.9-2.5 5.2-3.23 7.9-1.28v3.3a4.1 4.1 0 0 0-4-1.31c-1.3.31-2.4 1.5-2.5 2.82-.2 2.37 2.1 3.82 4.3 2.77.6-.29 1.1-.73 1.5-1.3.3-.41.4-.88.5-1.4V5h3c0 .23 0 .54.1.82z" />
  </svg>
);
