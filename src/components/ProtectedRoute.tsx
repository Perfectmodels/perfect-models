import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { ADMIN_PAGE_PERMISSION_MAP } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  role: UserRole | 'beginner';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen bg-pm-dark flex items-center justify-center"><div className="flex flex-col items-center gap-4"><div className="w-10 h-10 border-4 border-pm-gold border-t-transparent rounded-full animate-spin"/><p className="text-pm-off-white/50 text-sm">Vérification de l'accès…</p></div></div>;
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  const managerOnAdminSurface = role === 'admin' && user.role === 'manager';
  if (user.role !== role && !managerOnAdminSurface) {
    const roleRedirect: Record<UserRole, string> = {
      admin: '/admin', manager: '/manager', student: '/profil', jury: '/jury/casting', registration: '/enregistrement/casting', 'jury-contest': '/concours/jury',
    };
    return <Navigate to={roleRedirect[user.role] ?? '/login'} replace />;
  }

  if ((role === 'admin' || user.role === 'manager') && user.adminPermissions !== null && user.adminPermissions !== undefined) {
    const permKey = ADMIN_PAGE_PERMISSION_MAP[location.pathname];
    if (permKey && !user.adminPermissions[permKey]) {
      return <div className="min-h-screen bg-pm-dark flex items-center justify-center px-6"><div className="max-w-md text-center"><div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20"><svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg></div><h2 className="font-playfair text-2xl font-bold text-pm-off-white mb-2">Accès refusé</h2><p className="text-sm text-white/45 mb-6">Cette fonction n'est pas autorisée pour votre profil.</p><a href={user.role === 'manager' ? '/manager' : '/admin'} className="inline-flex rounded-lg bg-pm-gold px-5 py-2.5 text-sm font-bold text-[#1d1607]">Retour au tableau de bord</a></div></div>;
    }
  }

  return children;
};
export default ProtectedRoute;
