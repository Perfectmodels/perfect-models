import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * L'authentification par téléphone a été retirée du portail PMM.
 * Cette redirection conserve uniquement la compatibilité avec d'anciens liens.
 */
const PhoneLogin: React.FC = () => <Navigate to="/login" replace />;

export default PhoneLogin;
