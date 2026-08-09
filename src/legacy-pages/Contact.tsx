import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  MapPinIcon, EnvelopeIcon, PhoneIcon,
  PaperAirplaneIcon, CheckCircleIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from '../components/icons/SocialIcons';
import { ContactMessage, BookingRequest } from '../types';
import {
  sendContactNotificationToAdmin,
  sendContactConfirmationToUser,
  sendBookingConfirmationToUser,
  sendBookingNotificationToAdmin,
} from '../utils/brevoService';
import { notifyAdmin } from '../utils/adminNotify';
import { ref, push, set } from 'firebase/database';
import { db } from '../realtimedbConfig';
import { invalidateCache } from '../hooks/useFirebaseCollection';

const SUBJECTS = [
  'Demande de booking',
  'Partenariat / Collaboration',
  'Presse & Médias',
  'Renseignements généraux',
  'Autre',
];

type FormType = 'message' | 'booking';

const Contact: React.FC = () => {
  const { data } = useData();
  const location = useLocation();
  const contactInfo = data?.contactInfo;
  const socialLinks = data?.socialLinks;

  const [formType, setFormType] = useState<FormType>('message');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Champs message
  const [msg, setMsg] = useState({ name: '', email: '', phone: '', subject: '', customSubject: '', message: '' });
  // Champs booking
  const [bk, setBk] = useState({ clientName: '', clientEmail: '', clientCompany: '', requestedModels: '', startDate: '', endDate: '', message: '' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const service = params.get('service');
    const model = params.get('model');
    if (service) {
      setMsg(prev => ({ ...prev, subject: 'Autre', customSubject: `Demande de devis pour : ${service}` }));
    }
    if (model) {
      setFormType('booking');
      setBk(prev => ({ ...prev, requestedModels: model }));
    }
  }, [location.search]);

  const handleSubmitMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setStatusMessage('');
    if (!data) { setStatus('error'); setStatusMessage("Erreur de chargement."); return; }

    const finalSubject = msg.subject === 'Autre' && msg.customSubject.trim() ? msg.customSubject.trim() : msg.subject;

    const newMessage: ContactMessage = {
      id: `contact-${Date.now()}`,
      submissionDate: new Date().toISOString(),
      status: 'Nouveau',
      name: msg.name,
      email: msg.email,
      subject: finalSubject,
      message: msg.message,
    };

    try {
      const newRef = push(ref(db, 'contactMessages'));
      await set(newRef, { ...newMessage, id: newRef.key });
      invalidateCache('contactMessages');
      notifyAdmin('contact', `${msg.name} — ${finalSubject}`, '/admin/messages').catch(() => {});

      const notifEmail = data.contactInfo?.notificationEmail || data.contactInfo?.email || 'contact@perfectmodels.online';
      await Promise.allSettled([
        sendContactNotificationToAdmin({ name: msg.name, email: msg.email, subject: finalSubject, message: msg.message, notificationEmail: notifEmail }),
        sendContactConfirmationToUser({ name: msg.name, email: msg.email, subject: finalSubject }),
      ]);

      setStatus('success');
      setMsg({ name: '', email: '', phone: '', subject: '', customSubject: '', message: '' });
    } catch (err) {
      setStatus('error');
      setStatusMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setStatusMessage('');
    if (!data) { setStatus('error'); setStatusMessage("Erreur de chargement."); return; }

    const newRequest: BookingRequest = {
      id: `booking-${Date.now()}`,
      submissionDate: new Date().toISOString(),
      status: 'Nouveau',
      ...bk,
    };

    try {
      const newRef = push(ref(db, 'bookingRequests'));
      await set(newRef, { ...newRequest, id: newRef.key });
      invalidateCache('bookingRequests');
      notifyAdmin('booking', `${bk.clientName} — ${bk.requestedModels}`, '/admin/bookings').catch(() => {});

      // Emails Brevo (non-bloquant)
      Promise.allSettled([
        sendBookingConfirmationToUser({
          clientName: bk.clientName,
          clientEmail: bk.clientEmail,
          requestedModels: bk.requestedModels,
          startDate: bk.startDate || undefined,
          endDate: bk.endDate || undefined,
        }),
        sendBookingNotificationToAdmin({
          clientName: bk.clientName,
          clientEmail: bk.clientEmail,
          clientCompany: bk.clientCompany || undefined,
          requestedModels: bk.requestedModels,
          startDate: bk.startDate || undefined,
          endDate: bk.endDate || undefined,
          message: bk.message,
          notificationEmail: data.contactInfo?.notificationEmail || data.contactInfo?.email || 'contact@perfectmodels.online',
        }),
      ]).catch(() => {});

      setStatus('success');
      setBk({ clientName: '', clientEmail: '', clientCompany: '', requestedModels: '', startDate: '', endDate: '', message: '' });
    } catch (err) {
      setStatus('error');
      setStatusMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold transition-colors";

  return (
    <div className="bg-pm-dark text-pm-off-white min-h-screen">
      <SEO
        title="Contact | Perfect Models Management"
        description="Contactez-nous pour toute demande de booking, de partenariat ou d'information."
        keywords="contacter agence mannequin, booking mannequin gabon, partenariat mode, pmm contact"
        image={data?.siteImages.about}
      />

      {/* Hero */}
      <div className="relative py-16 sm:py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-pm-dark to-pm-dark" />
        <div className="relative container mx-auto px-4 sm:px-6 text-center">
          <span className="section-label">Parlons-nous</span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-playfair font-black text-white italic leading-tight mt-4">
            Contactez-<span className="text-pm-gold">nous</span>
          </h1>
          <p className="mt-4 sm:mt-6 max-w-xl mx-auto text-pm-off-white/60 text-base sm:text-lg">
            Une question, un projet ou une demande de booking ? Notre équipe vous répond sous 24h.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-16 sm:pb-24 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">

          {/* Colonne gauche — infos */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-black border border-pm-gold/20 rounded-2xl p-6 sm:p-8 space-y-5 sm:space-y-6">
              <h2 className="text-xl font-playfair text-pm-gold">Nos coordonnées</h2>
              {contactInfo && (
                <div className="space-y-4 sm:space-y-5">
                  <InfoItem icon={MapPinIcon} label="Adresse" text={contactInfo.address} />
                  <InfoItem icon={PhoneIcon} label="Téléphone" text={contactInfo.phone} href={`tel:${contactInfo.phone}`} />
                  <InfoItem icon={EnvelopeIcon} label="Email" text={contactInfo.email} href={`mailto:${contactInfo.email}`} />
                </div>
              )}
            </div>

            <div className="bg-black border border-pm-gold/20 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-playfair text-pm-gold mb-5 sm:mb-6">Suivez-nous</h2>
              {socialLinks && (
                <div className="flex gap-4 sm:gap-5">
                  {socialLinks.facebook && <SocialLink href={socialLinks.facebook} icon={FacebookIcon} label="Facebook" />}
                  {socialLinks.instagram && <SocialLink href={socialLinks.instagram} icon={InstagramIcon} label="Instagram" />}
                  {socialLinks.youtube && <SocialLink href={socialLinks.youtube} icon={YoutubeIcon} label="YouTube" />}
                </div>
              )}
            </div>

            <div className="bg-pm-gold/5 border border-pm-gold/20 rounded-2xl p-5 sm:p-6 flex gap-4 items-start">
              <ClockIcon className="w-6 h-6 text-pm-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-pm-gold uppercase tracking-widest mb-1">Délai de réponse</p>
                <p className="text-sm text-pm-off-white/60">Nous répondons généralement sous 24 à 48 heures ouvrées.</p>
              </div>
            </div>
          </div>

          {/* Colonne droite — formulaire unifié */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <SuccessCard
                isBooking={formType === 'booking'}
                onReset={() => setStatus('idle')}
              />
            ) : (
              <div className="bg-black border border-pm-gold/20 rounded-2xl p-5 sm:p-8 lg:p-10">

                {/* Toggle */}
                <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-6 sm:mb-8">
                  {([
                    { key: 'message', label: 'Message' },
                    { key: 'booking', label: 'Booking' },
                  ] as { key: FormType; label: string }[]).map(({ key, label }) => (
                    <button key={key} type="button" onClick={() => { setFormType(key); setStatus('idle'); setStatusMessage(''); }}
                      className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${formType === key ? 'bg-pm-gold text-pm-dark' : 'text-white/40 hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>

                {/* Formulaire message */}
                {formType === 'message' && (
                  <form onSubmit={handleSubmitMessage} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Nom complet *">
                        <input name="name" value={msg.name} onChange={e => setMsg(p => ({ ...p, name: e.target.value }))} required placeholder="Jean Dupont" className={inputCls} />
                      </Field>
                      <Field label="Email *">
                        <input name="email" type="email" value={msg.email} onChange={e => setMsg(p => ({ ...p, email: e.target.value }))} required placeholder="vous@exemple.com" className={inputCls} />
                      </Field>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Téléphone (optionnel)">
                        <input name="phone" type="tel" value={msg.phone} onChange={e => setMsg(p => ({ ...p, phone: e.target.value }))} placeholder="+241 XX XX XX XX" className={inputCls} />
                      </Field>
                      <Field label="Sujet *">
                        <select name="subject" value={msg.subject} onChange={e => setMsg(p => ({ ...p, subject: e.target.value }))} required className={inputCls}>
                          <option value="" disabled>Choisir un sujet…</option>
                          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </Field>
                    </div>
                    {msg.subject === 'Autre' && (
                      <Field label="Précisez votre sujet *">
                        <input name="customSubject" value={msg.customSubject} onChange={e => setMsg(p => ({ ...p, customSubject: e.target.value }))} required placeholder="Décrivez brièvement votre demande" className={inputCls} />
                      </Field>
                    )}
                    <Field label="Message *">
                      <textarea name="message" value={msg.message} onChange={e => setMsg(p => ({ ...p, message: e.target.value }))} required rows={6} placeholder="Décrivez votre projet ou votre demande en détail…" className={`${inputCls} resize-none`} />
                    </Field>
                    {status === 'error' && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">{statusMessage}</p>}
                    <SubmitButton loading={status === 'loading'} label="Envoyer le message" />
                  </form>
                )}

                {/* Formulaire booking */}
                {formType === 'booking' && (
                  <form onSubmit={handleSubmitBooking} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Votre nom complet *">
                        <input value={bk.clientName} onChange={e => setBk(p => ({ ...p, clientName: e.target.value }))} required placeholder="Jean Dupont" className={inputCls} />
                      </Field>
                      <Field label="Email *">
                        <input type="email" value={bk.clientEmail} onChange={e => setBk(p => ({ ...p, clientEmail: e.target.value }))} required placeholder="vous@exemple.com" className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Société (optionnel)">
                      <input value={bk.clientCompany} onChange={e => setBk(p => ({ ...p, clientCompany: e.target.value }))} placeholder="Nom de votre entreprise" className={inputCls} />
                    </Field>
                    <Field label="Mannequin(s) souhaité(s) *">
                      <input value={bk.requestedModels} onChange={e => setBk(p => ({ ...p, requestedModels: e.target.value }))} required placeholder="Ex: Amina K., ou plusieurs noms" className={inputCls} />
                    </Field>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Field label="Date de début (souhaitée)">
                        <input type="date" value={bk.startDate} onChange={e => setBk(p => ({ ...p, startDate: e.target.value }))} className={inputCls} />
                      </Field>
                      <Field label="Date de fin (souhaitée)">
                        <input type="date" value={bk.endDate} onChange={e => setBk(p => ({ ...p, endDate: e.target.value }))} className={inputCls} />
                      </Field>
                    </div>
                    <Field label="Détails du projet *">
                      <textarea value={bk.message} onChange={e => setBk(p => ({ ...p, message: e.target.value }))} required rows={5} placeholder="Décrivez votre projet, le type de prestation, le budget estimé…" className={`${inputCls} resize-none`} />
                    </Field>
                    {status === 'error' && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">{statusMessage}</p>}
                    <SubmitButton loading={status === 'loading'} label="Envoyer la demande de booking" />
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ─────────────────────────────────────────── */

const SuccessCard: React.FC<{ isBooking: boolean; onReset: () => void }> = ({ isBooking, onReset }) => (
  <div className="bg-black border border-green-500/30 rounded-2xl p-10 flex flex-col items-center text-center h-full justify-center gap-6">
    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
      <CheckCircleIcon className="w-10 h-10 text-green-400" />
    </div>
    <div>
      <h3 className="text-2xl font-playfair text-white mb-3">
        {isBooking ? 'Demande envoyée !' : 'Message envoyé !'}
      </h3>
      <p className="text-pm-off-white/60 max-w-sm">
        {isBooking
          ? 'Nous avons bien reçu votre demande de booking. Notre équipe vous contactera prochainement.'
          : 'Nous avons bien reçu votre message. Un email de confirmation vous a été envoyé. Notre équipe vous répondra sous 24–48h.'}
      </p>
    </div>
    <div className="flex gap-4 flex-wrap justify-center">
      <button onClick={onReset} className="px-6 py-2 border border-pm-gold/40 text-pm-gold rounded-full text-sm hover:bg-pm-gold/10 transition-colors">
        {isBooking ? 'Nouvelle demande' : 'Nouveau message'}
      </button>
      <Link to="/" className="px-6 py-2 bg-pm-gold text-pm-dark font-bold rounded-full text-sm hover:bg-white transition-colors">
        Retour à l'accueil
      </Link>
    </div>
  </div>
);

const SubmitButton: React.FC<{ loading: boolean; label: string }> = ({ loading, label }) => (
  <button type="submit" disabled={loading}
    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-pm-gold text-pm-dark font-black uppercase tracking-widest rounded-full transition-all hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
    {loading
      ? <><span className="loading loading-spinner loading-sm text-pm-dark" />Envoi en cours…</>
      : <><PaperAirplaneIcon className="w-5 h-5" />{label}</>}
  </button>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-2">
    <label className="block text-xs font-black uppercase tracking-widest text-pm-off-white/50">{label}</label>
    {children}
  </div>
);

const InfoItem: React.FC<{ icon: React.ElementType; label: string; text: string; href?: string }> = ({ icon: Icon, label, text, href }) => (
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 rounded-full bg-pm-gold/10 flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-pm-gold" />
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-pm-gold/60 mb-0.5">{label}</p>
      {href
        ? <a href={href} className="text-pm-off-white/80 hover:text-pm-gold transition-colors text-sm">{text}</a>
        : <p className="text-pm-off-white/80 text-sm">{text}</p>}
    </div>
  </div>
);

const SocialLink: React.FC<{ href: string; icon: React.ElementType; label: string }> = ({ href, icon: Icon, label }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
    className="w-12 h-12 rounded-full bg-pm-gold/10 border border-pm-gold/20 flex items-center justify-center text-pm-off-white/60 hover:text-pm-gold hover:border-pm-gold/60 hover:bg-pm-gold/20 transition-all">
    <Icon className="w-5 h-5" />
  </a>
);

export default Contact;
