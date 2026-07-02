import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role: UserRole | 'beginner'; // 'beginner' conservé pour compatibilité (non utilisé)
}

/**
 * Garde de route basé sur Firebase Auth via AuthContext.
 * - Pendant le chargement initial de Firebase, affiche un écran de chargement
 *   pour éviter toute redirection prématurée.
 * - Redirige vers /login si l'utilisateur n'est pas authentifié ou n'a pas le bon rôle.
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

  return children;
};

export default ProtectedRoute;
