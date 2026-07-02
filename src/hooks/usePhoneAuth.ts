import { auth } from '../firebase';
import { 
  signInWithPhoneNumber as firebaseSignInWithPhoneNumber,
  RecaptchaVerifier as FirebaseRecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { useState, useCallback, useRef } from 'react';

export const usePhoneAuth = () => {
  const recaptchaVerifierRef = useRef<FirebaseRecaptchaVerifier | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [verificationId, setVerificationId] = useState<string | null>(null);

  const setupRecaptcha = useCallback((containerId: string) => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new FirebaseRecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          recaptchaVerifierRef.current = null;
        }
      });
    }
    return recaptchaVerifierRef.current;
  }, []);

  const signInWithPhoneNumber = useCallback(async (phoneNumber: string) => {
    try {
      const recaptcha = recaptchaVerifierRef.current;
      if (!recaptcha) {
        throw new Error('Recaptcha non initialisé');
      }
      const result = await firebaseSignInWithPhoneNumber(auth, phoneNumber, recaptcha);
      setVerificationId(result.verificationId || null);
      setConfirmationResult(result);
      return { success: true, verificationId: result.verificationId };
    } catch (error: any) {
      return { success: false, error: error.message || 'Échec de l\'envoi du SMS' };
    }
  }, []);

  const confirmCode = useCallback(async (code: string) => {
    if (!confirmationResult) {
      return { success: false, error: 'Aucune vérification en attente' };
    }
    try {
      await confirmationResult.confirm(code);
      setConfirmationResult(null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Code de vérification invalide' };
    }
  }, [confirmationResult]);

  const reset = useCallback(() => {
    setConfirmationResult(null);
    setVerificationId(null);
  }, []);

  return {
    setupRecaptcha,
    signInWithPhoneNumber,
    confirmCode,
    reset,
    verificationId,
    isVerifying: !!confirmationResult
  };
};