import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { invalidateCache } from '../hooks/useFirebaseCollection';
import ImgBBUploader from '../components/ImgBBUploader';
import { notifyAdmin } from '../utils/adminNotify';
import { sendCastingConfirmationToUser, sendCastingNotificationToAdmin } from '../utils/brevoService';

const STEPS = ['Infos personnelles', 'Mensurations', 'Expérience', 'Photos & consentement'];

const EMPTY = {
  firstName: '',
  lastName: '',
  birthDate: '',
  gender: 'Femme',
  nationality: '',
  city: '',
  email: '',
  phone: '',
  height: '',
  weight: '',
  chest: '',
  waist: '',
  hips: '',
  shoeSize: '',
  eyeColor: '',
  hairColor: '',
  experience: 'none',
  instagram: '',
  portfolioLink: '',
  photoPortraitUrl: '',
  photoFullBodyUrl: '',
  photoProfileUrl: '',
};

type FormData = typeof EMPTY;

const inputCls = 'w-full bg-black/40 border border-pm-gold/20 rounded-lg px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold transition-colors';
const labelCls = 'text-xs uppercase tracking-widest text-pm-off-white/40 mb-1.5 block';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhone = (value: string) => value.replace(/\D/g, '').length >= 8;

const CastingForm: React.FC = () => {
  const navigate = useNavigate();
  const { addDocument, data } = useData();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof FormData, value: string) => setForm(current => ({ ...current, [field]: value }));

  const age = useMemo(() => {
    if (!form.birthDate) return null;
    const birth = new Date(form.birthDate);
    if (Number.isNaN(birth.getTime())) return null;
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
    if (beforeBirthday) years -= 1;
    return years;
  }, [form.birthDate]);

  const validateStep = (targetStep: number) => {
    if (targetStep === 0) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.birthDate || !form.city.trim() || !form.email.trim() || !form.phone.trim()) {
        return 'Complétez tous les champs obligatoires avant de continuer.';
      }
      if (!isValidEmail(form.email)) return 'Saisissez une adresse email valide.';
      if (!isValidPhone(form.phone)) return 'Saisissez un numéro de téléphone valide.';
      if (age !== null && (age < 14 || age > 80)) return 'Vérifiez la date de naissance saisie.';
    }

    if (targetStep === 1) {
      const height = Number(form.height);
      if (!form.height || Number.isNaN(height) || height < 120 || height > 230) {
        return 'Indiquez une taille valide en centimètres.';
      }
    }

    if (targetStep === 2 && !form.experience) return "Indiquez votre niveau d'expérience.";

    if (targetStep === 3) {
      if (!form.photoPortraitUrl && !form.photoFullBodyUrl && !form.photoProfileUrl) {
        return 'Ajoutez au moins une photo récente avant de soumettre votre candidature.';
      }
      if (!consent) return 'Vous devez accepter le traitement de vos informations et photos pour le casting.';
    }

    return '';
  };

  const goNext = () => {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setStep(current => Math.min(current + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrevious = () => {
    setError('');
    setStep(current => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const securePassageNumber = () => {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return (values[0] % 9000) + 1000;
  };

  const handleSubmit = async () => {
    const validationError = validateStep(3);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const id = await addDocument('castingApplications', {
        ...form,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        status: 'Nouveau',
        submissionDate: new Date().toISOString(),
        passageNumber: securePassageNumber(),
        consentAccepted: true,
        consentAcceptedAt: new Date().toISOString(),
        source: 'website',
      });

      if (!id) throw new Error("La candidature n'a pas pu être enregistrée.");

      invalidateCache('castingApplications');
      notifyAdmin('casting', `${form.firstName} ${form.lastName} — ${form.city}`, '/admin/casting-applications').catch(() => {});

      Promise.allSettled([
        sendCastingConfirmationToUser({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email.trim().toLowerCase(),
          city: form.city,
        }),
        sendCastingNotificationToAdmin({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email.trim().toLowerCase(),
          phone: form.phone,
          city: form.city,
          gender: form.gender,
          height: form.height,
          experience: form.experience,
          instagram: form.instagram || undefined,
          notificationEmail: data?.contactInfo?.notificationEmail || data?.contactInfo?.email || 'contact@perfectmodels.online',
        }),
      ]).catch(() => {});

      setDone(true);
    } catch (caught: any) {
      setError(caught?.message || 'Une erreur est survenue lors de la soumission. Réessayez dans quelques instants.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-pm-dark min-h-screen flex items-center justify-center px-6 text-pm-off-white">
        <SEO title="Candidature reçue" noIndex />
        <div className="text-center max-w-lg border border-pm-gold/20 p-8 sm:p-12 bg-black/30 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-pm-gold/10 border border-pm-gold/30 flex items-center justify-center mx-auto mb-6">
            <CheckIcon className="w-8 h-8 text-pm-gold" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-playfair font-black text-white mb-3">Candidature bien reçue</h1>
          <p className="text-pm-off-white/50 text-sm leading-relaxed mb-8">
            Votre dossier a été enregistré. L'équipe Perfect Models Management examinera votre profil et vous contactera si votre candidature est retenue pour la suite du processus.
          </p>
          <button onClick={() => navigate('/casting')} className="px-6 py-3 bg-pm-gold text-pm-dark font-black text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors">
            Retour au casting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white">
      <SEO title="Formulaire de candidature casting" description="Déposez votre candidature au casting Perfect Models Management." noIndex />
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-3xl">
        <button onClick={() => navigate('/casting')} className="inline-flex items-center gap-2 text-pm-gold/60 hover:text-pm-gold text-xs uppercase tracking-widest font-black mb-8 transition-colors">
          <ChevronLeftIcon className="w-4 h-4" /> Retour au casting
        </button>

        <div className="mb-8 sm:mb-10">
          <span className="section-label">Candidature PMM</span>
          <h1 className="mt-3 text-3xl sm:text-5xl font-playfair font-black italic text-white">Présentez votre profil</h1>
          <p className="mt-3 text-pm-off-white/40 text-sm">Étape {step + 1} sur {STEPS.length} — {STEPS[step]}</p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mb-8 sm:mb-10" aria-label={`Étape ${step + 1} sur ${STEPS.length}`}>
          {STEPS.map((item, index) => (
            <React.Fragment key={item}>
              <div className={`flex items-center gap-2 ${index <= step ? 'text-pm-gold' : 'text-white/20'}`}>
                <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black ${index < step ? 'bg-pm-gold border-pm-gold text-pm-dark' : index === step ? 'border-pm-gold' : 'border-white/10'}`}>
                  {index < step ? <CheckIcon className="w-4 h-4" /> : index + 1}
                </div>
                <span className="hidden md:block text-[9px] uppercase tracking-widest">{item}</span>
              </div>
              {index < STEPS.length - 1 && <div className={`flex-1 h-px ${index < step ? 'bg-pm-gold/40' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-black/30 border border-pm-gold/10 rounded-2xl p-5 sm:p-8">
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Field label="Prénom *"><input value={form.firstName} onChange={event => update('firstName', event.target.value)} autoComplete="given-name" className={inputCls} /></Field>
              <Field label="Nom *"><input value={form.lastName} onChange={event => update('lastName', event.target.value)} autoComplete="family-name" className={inputCls} /></Field>
              <Field label="Date de naissance *"><input type="date" value={form.birthDate} onChange={event => update('birthDate', event.target.value)} className={inputCls} /></Field>
              <Field label="Genre *">
                <select value={form.gender} onChange={event => update('gender', event.target.value)} className={inputCls}>
                  <option value="Femme">Femme</option>
                  <option value="Homme">Homme</option>
                </select>
              </Field>
              <Field label="Nationalité *">
                <select value={form.nationality} onChange={event => update('nationality', event.target.value)} className={inputCls}>
                  <option value="" disabled>Sélectionnez une nationalité…</option>
                  <option value="Gabonaise">Gabonaise 🇬🇦</option>
                  <option value="Camerounaise">Camerounaise 🇨🇲</option>
                  <option value="Ivoirienne">Ivoirienne 🇨🇮</option>
                  <option value="Congolaise (RDC)">Congolaise (RDC) 🇨🇩</option>
                  <option value="Congolaise (Brazzaville)">Congolaise (Brazzaville) 🇨🇬</option>
                  <option value="Sénégalaise">Sénégalaise 🇸🇳</option>
                  <option value="Togolaise">Togolaise 🇹🇬</option>
                  <option value="Béninoise">Béninoise 🇧🇯</option>
                  <option value="Guinéenne">Guinéenne 🇬🇳</option>
                  <option value="Malienne">Malienne 🇲🇱</option>
                  <option value="Tchadienne">Tchadienne 🇹🇩</option>
                  <option value="Autre">Autre nationalité</option>
                </select>
              </Field>
              <Field label="Ville *">
                <select value={form.city} onChange={event => update('city', event.target.value)} className={inputCls}>
                  <option value="" disabled>Sélectionnez une ville…</option>
                  <option value="Libreville">Libreville</option>
                  <option value="Akanda">Akanda</option>
                  <option value="Owendo">Owendo</option>
                  <option value="Port-Gentil">Port-Gentil</option>
                  <option value="Franceville">Franceville</option>
                  <option value="Oyem">Oyem</option>
                  <option value="Moanda">Moanda</option>
                  <option value="Lambaréné">Lambaréné</option>
                  <option value="Mouila">Mouila</option>
                  <option value="Tchibanga">Tchibanga</option>
                  <option value="Makokou">Makokou</option>
                  <option value="Koula-Moutou">Koula-Moutou</option>
                  <option value="Autre">Autre ville</option>
                </select>
              </Field>
              <Field label="Email *"><input type="email" value={form.email} onChange={event => update('email', event.target.value)} autoComplete="email" className={inputCls} /></Field>
              <Field label="Téléphone *"><input type="tel" value={form.phone} onChange={event => update('phone', event.target.value)} autoComplete="tel" placeholder="+241 ..." className={inputCls} /></Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
              {[
                ['Taille (cm) *', 'height', '175'],
                ['Poids (kg)', 'weight', '60'],
                ['Poitrine (cm)', 'chest', '90'],
                ['Tour de taille (cm)', 'waist', '65'],
                ['Hanches (cm)', 'hips', '95'],
                ['Pointure', 'shoeSize', '39'],
              ].map(([label, field, placeholder]) => (
                <Field key={field} label={label}>
                  <input type="number" min="1" value={form[field as keyof FormData]} onChange={event => update(field as keyof FormData, event.target.value)} placeholder={placeholder} className={inputCls} />
                </Field>
              ))}
              <Field label="Couleur des yeux">
                <select value={form.eyeColor} onChange={event => update('eyeColor', event.target.value)} className={inputCls}>
                  <option value="">Non spécifié</option>
                  <option value="Marrons">Marrons</option>
                  <option value="Noirs">Noirs</option>
                  <option value="Noisette">Noisette</option>
                  <option value="Verts">Verts</option>
                  <option value="Bleus">Bleus</option>
                  <option value="Gris">Gris</option>
                  <option value="Autre">Autre</option>
                </select>
              </Field>
              <Field label="Couleur des cheveux">
                <select value={form.hairColor} onChange={event => update('hairColor', event.target.value)} className={inputCls}>
                  <option value="">Non spécifié</option>
                  <option value="Noirs">Noirs</option>
                  <option value="Châtains">Châtains</option>
                  <option value="Bruns">Bruns</option>
                  <option value="Blonds">Blonds</option>
                  <option value="Tressés / Dreads">Tressés / Dreads</option>
                  <option value="Rasés / Chauve">Rasés / Chauve</option>
                  <option value="Autre">Autre</option>
                </select>
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className={labelCls}>Niveau d'expérience *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ['none', 'Débutant(e)', 'Aucune expérience professionnelle'],
                    ['beginner', 'Novice', 'Quelques shootings ou entraînements'],
                    ['intermediate', 'Intermédiaire', 'Défilés ou productions locales'],
                    ['professional', 'Professionnel(le)', 'Expérience régulière et portfolio solide'],
                  ].map(([value, title, description]) => (
                    <button key={value} type="button" onClick={() => update('experience', value)} className={`p-4 rounded-xl border text-left ${form.experience === value ? 'border-pm-gold bg-pm-gold/10' : 'border-white/10 hover:border-pm-gold/30'}`}>
                      <p className={`text-sm font-bold ${form.experience === value ? 'text-pm-gold' : 'text-white/70'}`}>{title}</p>
                      <p className="text-xs text-white/30 mt-1">{description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Instagram"><input value={form.instagram} onChange={event => update('instagram', event.target.value)} placeholder="@votre_compte" className={inputCls} /></Field>
              <Field label="Lien portfolio"><input type="url" value={form.portfolioLink} onChange={event => update('portfolioLink', event.target.value)} placeholder="https://..." className={inputCls} /></Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-xl font-playfair font-black text-white">Photos récentes</h2>
                <p className="mt-2 text-sm text-white/40">Ajoutez au moins une photo. Privilégiez une lumière naturelle, un fond simple et évitez les filtres.</p>
              </div>
              {[
                ['Portrait / visage', 'photoPortraitUrl'],
                ['Plein corps', 'photoFullBodyUrl'],
                ['Profil / côté', 'photoProfileUrl'],
              ].map(([label, field]) => (
                <div key={field}>
                  <label className={labelCls}>{label}</label>
                  <ImgBBUploader value={form[field as keyof FormData]} onChange={(url: string) => update(field as keyof FormData, url)} />
                </div>
              ))}

              <label className="flex items-start gap-3 p-4 border border-white/10 rounded-xl cursor-pointer">
                <input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} className="mt-1 accent-[#D4AF37]" />
                <span className="text-sm text-white/55 leading-relaxed">
                  J'accepte que Perfect Models Management traite les informations et photos de ce dossier pour l'étude de ma candidature. J'ai pris connaissance de la <Link to="/privacy-policy" target="_blank" className="text-pm-gold hover:underline">politique de confidentialité</Link> et des <Link to="/terms-of-use" target="_blank" className="text-pm-gold hover:underline">conditions d'utilisation</Link>.
                </span>
              </label>
            </div>
          )}
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{error}</p>}

        <div className="flex items-center justify-between mt-7">
          <button type="button" onClick={goPrevious} disabled={step === 0} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border border-pm-gold/20 text-pm-off-white/60 text-xs uppercase tracking-widest rounded-full hover:border-pm-gold/50 disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeftIcon className="w-4 h-4" /> Précédent
          </button>

          {step < STEPS.length - 1 ? (
            <button type="button" onClick={goNext} className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-pm-gold text-pm-dark font-black text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors">
              Suivant <ChevronRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={submitting} className="flex items-center gap-2 px-5 sm:px-6 py-2.5 bg-pm-gold text-pm-dark font-black text-xs uppercase tracking-widest rounded-full hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Envoi…' : <><CheckIcon className="w-4 h-4" /> Soumettre ma candidature</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

export default CastingForm;
