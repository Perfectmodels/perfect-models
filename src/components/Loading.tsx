import React from 'react';

const Loading: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-pm-dark" role="status" aria-live="polite">
    <img 
      src="/logo.svg" 
      alt=""
      aria-hidden="true"
      className="w-24 h-24 animate-pulse"
    />
    <span className="sr-only">Chargement en cours...</span>
  </div>
);

export default Loading;
