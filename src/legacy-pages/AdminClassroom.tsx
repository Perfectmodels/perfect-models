import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const AdminClassroom: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger vers le nouveau système de formation avancée
    navigate('/formation', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-pm-dark flex items-center justify-center">
      <SEO title="Admin - Formation Avancée" noIndex />
      <div className="text-center">
        <div className="w-12 h-px bg-pm-gold animate-pulse mx-auto mb-4" />
        <p className="text-white/40 text-sm">Redirection vers la formation avancée...</p>
      </div>
    </div>
  );
};

export default AdminClassroom;
