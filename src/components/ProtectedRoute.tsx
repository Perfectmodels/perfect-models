import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { ADMIN_PAGE_PERMISSION_MAP } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role: UserRole | 'beginner'; // 'beginner' conservé pour compatibilité (non utilisé)
}

/**
 * Garde de route basé sur Firebase Auth via AuthContext.
 * - Pendant le chargement initial de Firebase, affiche un écran de chargement
 *   pour éviter toute redirection prématurée.
 * - Redirige vers /login si l'utilisateur n'est pas authentifié ou n'a pas le bon rôle.
 * - Pour les admins délégués (adminPermissions présent), vérifie que la page courante
 *   est dans leurs permissions autorisées.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Firebase n'a pas encore résolu l'état auth — on attend
  if (loading) {
    return (
      <div
        className="min-h-screen bg-pm-dark flex items-center justify-center"
        aria-label="Chargement en cours"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-pm-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-pm-off-white/50 text-sm">Vérification de l'accès…</p>
        </div>
      </div>
    );
  }

  // Non authentifié
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Mauvais rôle
  if (user.role !== role) {
    // Redirige vers le panel correspondant au rôle réel
    const roleRedirect: Record<UserRole, string> = {
      admin: '/admin',
      student: '/profil',
      jury: '/jury/casting',
      registration: '/enregistrement/casting',
      'jury-contest': '/concours/jury',
    };
    const destination = roleRedirect[user.role] ?? '/login';
    return <Navigate to={destination} replace />;
  }

  // Vérification des permissions admin granulaires
  // Un admin avec adminPermissions === null/undefined est super-admin → accès total
  // Un admin avec adminPermissions défini est délégué → accès limité aux pages autorisées
  if (role === 'admin' && user.adminPermissions !== null && user.adminPermissions !== undefined) {
    const permKey = ADMIN_PAGE_PERMISSION_MAP[location.pathname];
    if (permKey && !user.adminPermissions[permKey]) {
      return (
        <div className="min-h-screen bg-pm-dark flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <h2 className="font-playfair text-2xl font-bold text-pm-off-white mb-2">Accès refusé</h2>
            <p className="text-sm text-white/45 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette section.<br />
              Contactez l'administrateur principal pour obtenir l'accès.
            </p>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 rounded-lg bg-pm-gold px-5 py-2.5 text-sm font-bold text-[#1d1607] hover:bg-pm-gold-light transition"
            >
              ← Retour au tableau de bord
            </a>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
