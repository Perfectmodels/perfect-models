import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { invalidateCache } from '../hooks/useFirebaseCollection';
import ImgBBUploader from '../components/ImgBBUploader';
import { notifyAdmin } from '../utils/adminNotify';
import { sendCastingConfirmationToUser, sendCastingNotificationToAdmin } from '../utils/brevoService';

const STEPS = ['Infos personnelles', 'Mensurations', 'Expérience', 'Photos & consentement'];

type PickerOption = {
  value: string;
  label: string;
};

const NATIONALITIES: PickerOption[] = [
  { value: 'Gabonaise', label: '🇬🇦 Gabon' },
  { value: 'Camerounaise', label: '🇨🇲 Cameroun' },
  { value: 'Équato-guinéenne', label: '🇬🇶 Guinée équatoriale' },
  { value: 'Congolaise (Brazzaville)', label: '🇨🇬 Congo-Brazzaville' },
  { value: 'Congolaise (RDC)', label: '🇨🇩 République démocratique du Congo' },
  { value: 'Centrafricaine', label: '🇨🇫 République centrafricaine' },
  { value: 'Tchadienne', label: '🇹🇩 Tchad' },
  { value: 'Angolaise', label: '🇦🇴 Angola' },
  { value: 'Béninoise', label: '🇧🇯 Bénin' },
  { value: 'Burkinabè', label: '🇧🇫 Burkina Faso' },
  { value: 'Cap-verdienne', label: '🇨🇻 Cap-Vert' },
  { value: 'Ghanéenne', label: '🇬🇭 Ghana' },
  { value: 'Guinéenne', label: '🇬🇳 Guinée' },
  { value: 'Ivoirienne', label: "🇨🇮 Côte d'Ivoire" },
  { value: 'Malienne', label: '🇲🇱 Mali' },
  { value: 'Nigériane', label: '🇳🇬 Nigeria' },
  { value: 'Sénégalaise', label: '🇸🇳 Sénégal' },
  { value: 'Togolaise', label: '🇹🇬 Togo' },
  { value: 'Rwandaise', label: '🇷🇼 Rwanda' },
  { value: 'Burundaise', label: '🇧🇮 Burundi' },
  { value: 'Kényane', label: '🇰🇪 Kenya' },
  { value: 'Sud-africaine', label: '🇿🇦 Afrique du Sud' },
  { value: 'Marocaine', label: '🇲🇦 Maroc' },
  { value: 'Algérienne', label: '🇩🇿 Algérie' },
  { value: 'Tunisienne', label: '🇹🇳 Tunisie' },
  { value: 'Française', label: '🇫🇷 France' },
];

const CITIES: PickerOption[] = [
  { value: 'Libreville', label: 'Estuaire · Gabon' },
  { value: 'Akanda', label: 'Estuaire · Gabon' },
  { value: 'Owendo', label: 'Estuaire · Gabon' },
  { value: 'Ntoum', label: 'Estuaire · Gabon' },
  { value: 'Kango', label: 'Estuaire · Gabon' },
  { value: 'Port-Gentil', label: 'Ogooué-Maritime · Gabon' },
  { value: 'Gamba', label: 'Ogooué-Maritime · Gabon' },
  { value: 'Franceville', label: 'Haut-Ogooué · Gabon' },
  { value: 'Moanda', label: 'Haut-Ogooué · Gabon' },
  { value: 'Oyem', label: 'Woleu-Ntem · Gabon' },
  { value: 'Bitam', label: 'Woleu-Ntem · Gabon' },
  { value: 'Mitzic', label: 'Woleu-Ntem · Gabon' },
  { value: 'Lambaréné', label: 'Moyen-Ogooué · Gabon' },
  { value: 'Ndjolé', label: 'Moyen-Ogooué · Gabon' },
  { value: 'Mouila', label: 'Ngounié · Gabon' },
  { value: 'Fougamou', label: 'Ngounié · Gabon' },
  { value: 'Tchibanga', label: 'Nyanga · Gabon' },
  { value: 'Mayumba', label: 'Nyanga · Gabon' },
  { value: 'Makokou', label: 'Ogooué-Ivindo · Gabon' },
  { value: 'Koula-Moutou', label: 'Ogooué-Lolo · Gabon' },
  { value: 'Lastoursville', label: 'Ogooué-Lolo · Gabon' },
  { value: 'Brazzaville', label: 'République du Congo' },
  { value: 'Pointe-Noire', label: 'République du Congo' },
  { value: 'Douala', label: 'Cameroun' },
  { value: 'Yaoundé', label: 'Cameroun' },
  { value: 'Malabo', label: 'Guinée équatoriale' },
  { value: 'Kinshasa', label: 'RDC' },
  { value: 'Abidjan', label: "Côte d'Ivoire" },
  { value: 'Dakar', label: 'Sénégal' },
  { value: 'Paris', label: 'France' },
];

const PHONE_PREFIXES = [
  { code: '+241', label: '🇬🇦 +241', country: 'Gabon' },
  { code: '+237', label: '🇨🇲 +237', country: 'Cameroun' },
  { code: '+240', label: '🇬🇶 +240', country: 'Guinée équatoriale' },
  { code: '+242', label: '🇨🇬 +242', country: 'Congo-Brazzaville' },
  { code: '+243', label: '🇨🇩 +243', country: 'RDC' },
  { code: '+236', label: '🇨🇫 +236', country: 'Centrafrique' },
  { code: '+235', label: '🇹🇩 +235', country: 'Tchad' },
  { code: '+244', label: '🇦🇴 +244', country: 'Angola' },
  { code: '+229', label: '🇧🇯 +229', country: 'Bénin' },
  { code: '+225', label: '🇨🇮 +225', country: "Côte d'Ivoire" },
  { code: '+224', label: '🇬🇳 +224', country: 'Guinée' },
  { code: '+223', label: '🇲🇱 +223', country: 'Mali' },
  { code: '+234', label: '🇳🇬 +234', country: 'Nigeria' },
  { code: '+221', label: '🇸🇳 +221', country: 'Sénégal' },
  { code: '+228', label: '🇹🇬 +228', country: 'Togo' },
  { code: '+33', label: '🇫🇷 +33', country: 'France' },
];

const EYE_COLORS = [
  { value: 'Noirs', swatch: '#171717' },
  { value: 'Marrons', swatch: '#5A3825' },
  { value: 'Noisette', swatch: '#92734A' },
  { value: 'Verts', swatch: '#4F6F52' },
  { value: 'Bleus', swatch: '#537FA5' },
  { value: 'Gris', swatch: '#8B9299' },
  { value: 'Autre', swatch: 'linear-gradient(135deg, #D4AF37, #537FA5)' },
];

const HAIR_COLORS = [
  { value: 'Noirs', swatch: '#101010' },
  { value: 'Bruns', swatch: '#3A241A' },
  { value: 'Châtains', swatch: '#6C4A32' },
  { value: 'Blonds', swatch: '#C7A869' },
  { value: 'Roux', swatch: '#9E4A2F' },
  { value: 'Colorés', swatch: 'linear-gradient(135deg, #9B5DE5, #F15BB5, #FEE440)' },
  { value: 'Autre', swatch: 'linear-gradient(135deg, #D4AF37, #537FA5)' },
];

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

const inputCls = 'w-full min-h-12 bg-black/40 border border-pm-gold/20 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/25 focus:outline-none focus:border-pm-gold focus:ring-2 focus:ring-pm-gold/10 transition-colors';
const labelCls = 'text-xs uppercase tracking-widest text-pm-off-white/40 mb-1.5 block';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const isValidPhone = (value: string) => value.replace(/\D/g, '').length >= 8;

const yearsAgo = (years: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
};

const CastingForm: React.FC = () => {
  const navigate = useNavigate();
  const { addDocument, data } = useData();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(EMPTY);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const birthDateLimits = useMemo(() => ({ min: yearsAgo(80), max: yearsAgo(14) }), []);

  const update = (field: keyof FormData, value: string) => {
    setForm(current => ({ ...current, [field]: value }));
    if (error) setError('');
  };

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
      if (!form.firstName.trim() || !form.lastName.trim() || !form.birthDate || !form.nationality.trim() || !form.city.trim() || !form.email.trim() || !form.phone.trim()) {
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
      const optionalMeasurements: Array<[keyof FormData, number, number, string]> = [
        ['weight', 25, 300, 'poids'],
        ['chest', 30, 250, 'tour de poitrine'],
        ['waist', 30, 250, 'tour de taille'],
        ['hips', 30, 250, 'tour de hanches'],
        ['shoeSize', 20, 55, 'pointure'],
      ];
      for (const [field, min, max, label] of optionalMeasurements) {
        const rawValue = form[field];
        const numericValue = Number(rawValue);
        if (rawValue && (!Number.isFinite(numericValue) || numericValue < min || numericValue > max)) {
          return `Vérifiez la valeur indiquée pour ${label}.`;
        }
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
              <Field label="Prénom *" htmlFor="casting-first-name">
                <input id="casting-first-name" required maxLength={80} value={form.firstName} onChange={event => update('firstName', event.target.value)} autoComplete="given-name" placeholder="Votre prénom" className={inputCls} />
              </Field>
              <Field label="Nom *" htmlFor="casting-last-name">
                <input id="casting-last-name" required maxLength={80} value={form.lastName} onChange={event => update('lastName', event.target.value)} autoComplete="family-name" placeholder="Votre nom" className={inputCls} />
              </Field>
              <Field
                label="Date de naissance *"
                htmlFor="casting-birth-date"
                hint={age === null ? 'Candidatures de 14 à 80 ans' : `${age} ans`}
              >
                <input
                  id="casting-birth-date"
                  type="date"
                  required
                  min={birthDateLimits.min}
                  max={birthDateLimits.max}
                  value={form.birthDate}
                  onChange={event => update('birthDate', event.target.value)}
                  autoComplete="bday"
                  className={inputCls}
                />
              </Field>
              <div>
                <span id="casting-gender-label" className={labelCls}>Genre *</span>
                <div role="radiogroup" aria-labelledby="casting-gender-label" className="grid grid-cols-2 gap-2">
                  {[
                    ['Femme', 'F'],
                    ['Homme', 'H'],
                  ].map(([value, short]) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={form.gender === value}
                      onClick={() => update('gender', value)}
                      className={`min-h-12 rounded-xl border px-3 py-2.5 text-left transition-colors ${form.gender === value ? 'border-pm-gold bg-pm-gold/10 text-pm-gold' : 'border-pm-gold/20 bg-black/40 text-white/55 hover:border-pm-gold/50'}`}
                    >
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/5 text-[10px] font-black">{short}</span>
                      <span className="text-sm font-bold">{value}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Nationalité *" htmlFor="casting-nationality" hint="Recherchez ou saisissez une autre nationalité">
                <SearchablePicker
                  id="casting-nationality"
                  value={form.nationality}
                  onChange={value => update('nationality', value)}
                  options={NATIONALITIES}
                  placeholder="Ex. Gabonaise"
                  autoComplete="country-name"
                />
              </Field>
              <Field label="Ville de résidence *" htmlFor="casting-city" hint="Les autres villes peuvent être saisies librement">
                <SearchablePicker
                  id="casting-city"
                  value={form.city}
                  onChange={value => update('city', value)}
                  options={CITIES}
                  placeholder="Rechercher une ville…"
                  autoComplete="address-level2"
                />
              </Field>
              <Field label="Email *" htmlFor="casting-email">
                <input id="casting-email" type="email" required maxLength={160} value={form.email} onChange={event => update('email', event.target.value)} autoComplete="email" inputMode="email" placeholder="nom@exemple.com" className={inputCls} />
              </Field>
              <Field label="Téléphone / WhatsApp *" htmlFor="casting-phone" hint="Choisissez d’abord l’indicatif du pays">
                <PhoneInput id="casting-phone" value={form.phone} onChange={value => update('phone', value)} />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-xl font-playfair font-black text-white">Vos mensurations</h2>
                <p className="mt-2 text-sm text-white/40">Utilisez les boutons − et + ou saisissez directement la valeur exacte.</p>
              </div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                <NumberPicker id="casting-height" label="Taille *" value={form.height} onChange={value => update('height', value)} min={120} max={230} placeholder="175" unit="cm" required />
                <NumberPicker id="casting-weight" label="Poids" value={form.weight} onChange={value => update('weight', value)} min={25} max={300} placeholder="60" unit="kg" />
                <NumberPicker id="casting-chest" label="Poitrine" value={form.chest} onChange={value => update('chest', value)} min={30} max={250} placeholder="90" unit="cm" />
                <NumberPicker id="casting-waist" label="Tour de taille" value={form.waist} onChange={value => update('waist', value)} min={30} max={250} placeholder="65" unit="cm" />
                <NumberPicker id="casting-hips" label="Hanches" value={form.hips} onChange={value => update('hips', value)} min={30} max={250} placeholder="95" unit="cm" />
                <NumberPicker id="casting-shoe-size" label="Pointure EU" value={form.shoeSize} onChange={value => update('shoeSize', value)} min={20} max={55} step={0.5} placeholder="39" unit="EU" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <VisualChoicePicker label="Couleur des yeux" value={form.eyeColor} onChange={value => update('eyeColor', value)} options={EYE_COLORS} />
                <VisualChoicePicker label="Couleur des cheveux" value={form.hairColor} onChange={value => update('hairColor', value)} options={HAIR_COLORS} />
              </div>
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
              <Field label="Instagram" htmlFor="casting-instagram"><input id="casting-instagram" maxLength={120} value={form.instagram} onChange={event => update('instagram', event.target.value)} autoComplete="off" placeholder="@votre_compte" className={inputCls} /></Field>
              <Field label="Lien portfolio" htmlFor="casting-portfolio"><input id="casting-portfolio" type="url" maxLength={600} value={form.portfolioLink} onChange={event => update('portfolioLink', event.target.value)} autoComplete="url" placeholder="https://..." className={inputCls} /></Field>
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
                  <ImgBBUploader
                    value={form[field as keyof FormData]}
                    onChange={(url: string) => update(field as keyof FormData, url)}
                    scope="casting"
                    publicMode
                    allowUrl={false}
                  />
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

const SearchablePicker: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: PickerOption[];
  placeholder: string;
  autoComplete?: string;
}> = ({ id, value, onChange, options, placeholder, autoComplete }) => {
  const listId = `${id}-suggestions`;

  return (
    <div className="relative">
      <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pm-gold/45" />
      <input
        id={id}
        list={listId}
        required
        maxLength={80}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete || 'off'}
        className={`${inputCls} pl-10 pr-10`}
      />
      <ChevronDownIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
      <datalist id={listId}>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </datalist>
    </div>
  );
};

const PhoneInput: React.FC<{
  id: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ id, value, onChange }) => {
  const detectedPrefix = PHONE_PREFIXES.find(option => value.startsWith(option.code))?.code || '+241';
  const [prefix, setPrefix] = useState(detectedPrefix);
  const nationalNumber = value.startsWith(prefix)
    ? value.slice(prefix.length).trimStart()
    : value.replace(/^\+\d{1,4}\s*/, '');

  const changePrefix = (nextPrefix: string) => {
    setPrefix(nextPrefix);
    onChange(nationalNumber ? `${nextPrefix} ${nationalNumber}` : '');
  };

  return (
    <div className="flex min-h-12 overflow-hidden rounded-xl border border-pm-gold/20 bg-black/40 focus-within:border-pm-gold focus-within:ring-2 focus-within:ring-pm-gold/10">
      <label className="sr-only" htmlFor={`${id}-prefix`}>Indicatif du pays</label>
      <select
        id={`${id}-prefix`}
        value={prefix}
        onChange={event => changePrefix(event.target.value)}
        autoComplete="tel-country-code"
        className="w-[112px] shrink-0 border-r border-pm-gold/15 bg-black/20 px-3 text-sm text-pm-off-white focus:outline-none sm:w-[126px]"
      >
        {PHONE_PREFIXES.map(option => (
          <option key={option.code} value={option.code}>{option.label} · {option.country}</option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        required
        maxLength={30}
        value={nationalNumber}
        onChange={event => {
          const nextNumber = event.target.value.replace(/[^\d\s().-]/g, '');
          onChange(nextNumber ? `${prefix} ${nextNumber}` : '');
        }}
        autoComplete="tel-national"
        inputMode="tel"
        placeholder="074 00 00 00"
        className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-pm-off-white placeholder:text-white/25 focus:outline-none"
      />
    </div>
  );
};

const NumberPicker: React.FC<{
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  placeholder: string;
  unit: string;
  step?: number;
  required?: boolean;
}> = ({ id, label, value, onChange, min, max, placeholder, unit, step = 1, required = false }) => {
  const numericValue = Number(value);
  const isAtMin = value !== '' && Number.isFinite(numericValue) && numericValue <= min;
  const isAtMax = value !== '' && Number.isFinite(numericValue) && numericValue >= max;

  const changeBy = (direction: -1 | 1) => {
    const current = value && Number.isFinite(numericValue) ? numericValue : Number(placeholder);
    const next = Math.min(max, Math.max(min, current + direction * step));
    onChange(String(next));
  };

  return (
    <div>
      <label className={labelCls} htmlFor={id}>{label}</label>
      <div className="flex min-h-12 overflow-hidden rounded-xl border border-pm-gold/20 bg-black/40 focus-within:border-pm-gold focus-within:ring-2 focus-within:ring-pm-gold/10">
        <button type="button" aria-label={`Diminuer ${label.toLowerCase()}`} onClick={() => changeBy(-1)} disabled={isAtMin} className="flex w-10 shrink-0 items-center justify-center border-r border-white/10 text-white/45 transition-colors hover:bg-pm-gold/10 hover:text-pm-gold disabled:opacity-20">
          <MinusIcon className="h-4 w-4" />
        </button>
        <input
          id={id}
          type="number"
          required={required}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={event => onChange(event.target.value)}
          inputMode="decimal"
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-center text-sm font-bold text-pm-off-white placeholder:text-white/20 focus:outline-none"
        />
        <span className="flex items-center border-l border-white/10 px-2 text-[10px] font-bold uppercase text-white/30">{unit}</span>
        <button type="button" aria-label={`Augmenter ${label.toLowerCase()}`} onClick={() => changeBy(1)} disabled={isAtMax} className="flex w-10 shrink-0 items-center justify-center border-l border-white/10 text-white/45 transition-colors hover:bg-pm-gold/10 hover:text-pm-gold disabled:opacity-20">
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1.5 text-[10px] text-white/25">{min}–{max} {unit}</p>
    </div>
  );
};

const VisualChoicePicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; swatch: string }>;
}> = ({ label, value, onChange, options }) => (
  <div>
    <span className={labelCls}>{label}</span>
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${value === option.value ? 'border-pm-gold bg-pm-gold/10 text-pm-gold' : 'border-white/10 bg-black/30 text-white/50 hover:border-pm-gold/40'}`}
        >
          <span aria-hidden="true" className="h-4 w-4 rounded-full border border-white/20" style={{ background: option.swatch }} />
          {option.value}
        </button>
      ))}
      <button
        type="button"
        role="radio"
        aria-checked={value === ''}
        onClick={() => onChange('')}
        className={`min-h-10 rounded-full border px-3 py-2 text-xs transition-colors ${value === '' ? 'border-white/25 bg-white/5 text-white/60' : 'border-white/10 text-white/30 hover:text-white/55'}`}
      >
        Non précisé
      </button>
    </div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode; htmlFor?: string; hint?: string }> = ({ label, children, htmlFor, hint }) => (
  <div>
    {htmlFor ? <label className={labelCls} htmlFor={htmlFor}>{label}</label> : <span className={labelCls}>{label}</span>}
    {children}
    {hint && <p className="mt-1.5 text-[10px] leading-relaxed text-white/30">{hint}</p>}
  </div>
);

export default CastingForm;
