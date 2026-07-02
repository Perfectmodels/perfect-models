import React, { useState } from 'react';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LockClosedIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import ChangePasswordModal from '../components/ChangePasswordModal';

const JuryCasting: React.FC = () => {
  const { data } = useData();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const applications = data?.castingApplications?.filter(a => a.status !== 'Refusé') || [];
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white">
      <SEO title="Jury — Casting" noIndex />

      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-pm-dark/80 backdrop-blur-xl px-6">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold">PMM</span>
          <span className="text-white/10">|</span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Interface Jury</span>
          {authUser?.displayName && (
            <span className="text-[9px] text-white/20">— {authUser.displayName}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-pm-gold transition-colors"
          >
            <LockClosedIcon className="w-4 h-4" /> Mot de passe
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-red-400 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </header>

      <div className="page-container">
        <h1 className="text-4xl font-playfair font-black italic mb-8">Interface Jury</h1>
        <p className="text-white/40 mb-8">{applications.length} candidature(s) à évaluer.</p>
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="border border-white/5 p-6 flex justify-between items-center">
              <div>
                <p className="font-bold text-white">{app.firstName} {app.lastName}</p>
                <p className="text-white/40 text-sm">{app.email}</p>
              </div>
              <span className="text-[10px] uppercase tracking-widest font-black text-pm-gold border border-pm-gold/20 px-3 py-1">{app.status}</span>
            </div>
          ))}
        </div>
      </div>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
};

export default JuryCasting;
