import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PhoneIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';

const PhoneLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signInWithPhone, confirmPhoneCode } = useAuth();
  const { data } = useData();

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) return digits;
    return digits.slice(0, 10);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+${phone}`;
    }

    const result = await signInWithPhone(formattedPhone, 'recaptcha-container');
    if (result.success) {
      setStep('code');
    } else {
      setError(result.error || 'Erreur d\'envoi du code');
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await confirmPhoneCode(code);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Code invalide');
    }
    setLoading(false);
  };

  return (
    <>
      <SEO title="Connexion par Téléphone" noIndex />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pm-dark to-black">
        <div className="w-full max-w-sm bg-black/50 border border-pm-gold/20 p-8 rounded-lg shadow-2xl">
          <Link to="/" className="block mb-6">
            <img src={useData().data?.siteConfig.logo} alt="Logo" className="h-16 w-auto mx-auto" />
          </Link>

          {step === 'phone' ? (
            <form onSubmit={handleSendCode}>
              <h2 className="text-2xl font-playfair text-pm-gold mb-6 text-center">Connexion par SMS</h2>
              <div className="relative mb-6">
                <PhoneIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="6XXXXXXXX"
                  className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full disabled:opacity-50"
              >
                <span>{loading ? 'Envoi...' : 'Recevoir le code'}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <h2 className="text-2xl font-playfair text-pm-gold mb-6 text-center">Vérifier le code</h2>
              <p className="text-pm-off-white/70 text-sm mb-4 text-center">
                Code envoyé au +{phone}
              </p>
              <div className="relative mb-6">
                <LockClosedIcon className="h-5 w-5 text-pm-off-white/50 absolute top-1/2 left-4 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Code à 6 chiffres"
                  maxLength={6}
                  className="w-full bg-pm-dark/70 border-2 border-pm-off-white/20 rounded-full py-3 px-12 focus:outline-none focus:border-pm-gold text-center tracking-widest"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full disabled:opacity-50"
              >
                <span>{loading ? 'Vérification...' : 'Se connecter'}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </form>
          )}

          <div id="recaptcha-container" className="hidden"></div>
        </div>
      </div>
    </>
  );
};

export default PhoneLogin;