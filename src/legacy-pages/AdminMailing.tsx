import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon, PaperAirplaneIcon, UsersIcon, CheckCircleIcon,
  EyeIcon, PlusIcon, TrashIcon, BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { sendBulkEmail, buildNewsletterBody, buildEmailTemplate, getBrevoDailyUsage } from '../utils/brevoService';

type Tab = 'compose' | 'newsletter' | 'preview';
type RecipientGroup = 'all' | 'models' | 'partners' | 'custom';

interface NewsSection {
  id: string;
  title: string;
  text: string;
  imageUrl: string;
  ctaLabel: string;
  ctaUrl: string;
}

interface ScheduledNewsletter {
  id: string;
  subject: string;
  headline: string;
  intro: string;
  html: string;
  recipients: { email: string; name?: string }[];
  scheduledAt: string;
}

const TEMPLATES = [
  {
    id: 'blank',
    label: 'Vide',
    subject: '',
    body: '',
  },
  {
    id: 'casting',
    label: 'Appel à Casting',
    subject: '🎬 Nouveau Casting — Perfect Models Management',
    body: `Bonjour,\n\nNous avons le plaisir de vous annoncer l'ouverture d'un nouveau casting.\n\n📅 Date : [DATE]\n📍 Lieu : [LIEU]\n\nPour postuler, rendez-vous sur notre site : https://perfectmodels.online/casting-formulaire\n\nNous comptons sur votre présence.\n\nCordialement,\nL'équipe Perfect Models Management`,
  },
  {
    id: 'fashionday',
    label: 'Fashion Day',
    subject: '✨ Perfect Fashion Day — Informations importantes',
    body: `Bonjour,\n\nLe Perfect Fashion Day approche ! Voici les informations essentielles :\n\n📅 Date : [DATE]\n📍 Lieu : [LIEU]\n🎨 Thème : [THÈME]\n\nMerci de confirmer votre participation avant le [DATE LIMITE].\n\nCordialement,\nL'équipe Perfect Models Management`,
  },
  {
    id: 'reminder',
    label: 'Rappel de séance',
    subject: '⏰ Rappel — Séance de formation',
    body: `Bonjour,\n\nCeci est un rappel pour votre prochaine séance de formation.\n\n📅 Date : [DATE]\n🕐 Heure : [HEURE]\n📍 Lieu : [LIEU]\n\nMerci d'être ponctuel(le).\n\nCordialement,\nL'équipe Perfect Models Management`,
  },
];

const NEWSLETTER_DRAFT_KEY = 'pmm_newsletter_draft';
const NEWSLETTER_SCHEDULE_KEY = 'pmm_newsletter_schedules';

const AdminMailing: React.FC = () => {
  const { data, saveData } = useData();
  const models = data?.models ?? [];
  const brevoKey = data?.apiKeys?.brevoApiKey;
  const mailingContacts = data?.mailingContacts ?? [];

  const [tab, setTab] = useState<Tab>('compose');
  const [recipientGroup, setRecipientGroup] = useState<RecipientGroup>('all');
  const [customEmails, setCustomEmails] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ sent: 0, total: 0 });
  const [sendSummary, setSendSummary] = useState<{ sent: number; total: number; limitReached: boolean; remainingToday: number } | null>(null);
  const [nlHtml, setNlHtml] = useState(`<h1 style="color:#c9a84c;font-family:Georgia,serif;font-size:28px;margin:0 0 16px">Titre de la newsletter</h1>
<p style="color:#f5f0e8cc;line-height:1.8;margin:0 0 20px">Écrivez ici votre contenu HTML complet, y compris les images, boutons et liens.</p>`);
  const [scheduledAt, setScheduledAt] = useState('');
  const [draftStatus, setDraftStatus] = useState('');
  const [scheduleStatus, setScheduleStatus] = useState('');

  // Gestion contacts prédéfinis
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', email: '', category: 'Mode & Boutiques' });
  const [filterCategory, setFilterCategory] = useState<string>('Toutes');

  const categories = useMemo(() => {
    const cats = [...new Set(mailingContacts.map(c => c.category ?? 'Autre'))].sort();
    return ['Toutes', ...cats];
  }, [mailingContacts]);

  const dailyUsage = getBrevoDailyUsage();

  const filteredContacts = useMemo(() =>
    filterCategory === 'Toutes' ? mailingContacts : mailingContacts.filter(c => c.category === filterCategory),
    [mailingContacts, filterCategory]
  );

  const addContact = () => {
    if (!data || !newContact.name.trim() || !newContact.email.trim()) return;
    const contact = { ...newContact, id: `mc-${Date.now()}` };
    saveData({ ...data, mailingContacts: [...mailingContacts, contact] });
    setNewContact({ name: '', email: '', category: 'Mode & Boutiques' });
    setShowAddContact(false);
  };

  const removeContact = (id: string) => {
    if (!data) return;
    saveData({ ...data, mailingContacts: mailingContacts.filter(c => c.id !== id) });
  };

  // Newsletter state
  const [nlHeadline, setNlHeadline] = useState('');
  const [nlIntro, setNlIntro] = useState('');
  const [nlSections, setNlSections] = useState<NewsSection[]>([
    { id: '1', title: '', text: '', imageUrl: '', ctaLabel: '', ctaUrl: '' },
  ]);
  const [nlSubject, setNlSubject] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedDraft = window.localStorage.getItem(NEWSLETTER_DRAFT_KEY);
      if (storedDraft) {
        const draft = JSON.parse(storedDraft) as Partial<{
          nlHeadline: string;
          nlIntro: string;
          nlSections: NewsSection[];
          nlSubject: string;
          nlHtml: string;
          scheduledAt: string;
        }>;
        setNlHeadline(draft.nlHeadline ?? '');
        setNlIntro(draft.nlIntro ?? '');
        setNlSections(draft.nlSections ?? [{ id: '1', title: '', text: '', imageUrl: '', ctaLabel: '', ctaUrl: '' }]);
        setNlSubject(draft.nlSubject ?? '');
        setNlHtml(draft.nlHtml ?? '');
        setScheduledAt(draft.scheduledAt ?? '');
        setDraftStatus('Brouillon chargé');
      }
    } catch {
      setDraftStatus('');
    }
  }, []);

  const targetEmails = useMemo((): { email: string; name?: string }[] => {
    const modelList = (recipientGroup === 'models' || recipientGroup === 'all')
      ? models.filter(m => m.email).map(m => ({ email: m.email!, name: m.name }))
      : [];
    const partnerList = (recipientGroup === 'partners' || recipientGroup === 'all')
      ? filteredContacts.map(c => ({ email: c.email, name: c.name }))
      : [];
    const extra = (recipientGroup === 'custom' || recipientGroup === 'all')
      ? customEmails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.includes('@')).map(e => ({ email: e }))
      : [];
    const all = [...modelList, ...partnerList, ...extra];
    return all.filter((v, i, a) => a.findIndex(x => x.email === v.email) === i);
  }, [recipientGroup, customEmails, models, filteredContacts]);

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const previewHtml = useMemo(() => {
    if (tab === 'newsletter') {
      const htmlContent = nlHtml.trim() || buildNewsletterBody({
        headline: nlHeadline || 'Titre de la newsletter',
        intro: nlIntro || 'Introduction…',
        sections: nlSections.map(s => ({
          title: s.title || 'Section',
          text: s.text || 'Contenu…',
          imageUrl: s.imageUrl || undefined,
          ctaLabel: s.ctaLabel || undefined,
          ctaUrl: s.ctaUrl || undefined,
        })),
      });
      return buildEmailTemplate(htmlContent);
    }
    return buildEmailTemplate(
      `<h2 style="color:#c9a84c;font-family:Georgia,serif;font-size:22px;margin:0 0 20px">${subject || 'Objet'}</h2>
       <div style="color:#f5f0e8cc;line-height:1.8;white-space:pre-wrap">${body || 'Corps du message…'}</div>`
    );
  }, [tab, subject, body, nlHeadline, nlIntro, nlSections]);

  const handleSendCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || targetEmails.length === 0) return;
    setSending(true); setError(''); setProgress({ sent: 0, total: Math.min(targetEmails.length, dailyUsage.remaining) });
    setSendSummary(null);
    try {
      const result = await sendBulkEmail({
        to: targetEmails,
        subject,
        bodyHtml: `<h2 style="color:#c9a84c;font-family:Georgia,serif;font-size:22px;margin:0 0 20px">${subject}</h2>
          <div style="color:#f5f0e8cc;line-height:1.8;white-space:pre-wrap">${body.replace(/\n/g, '<br/>')}</div>`,
        apiKey: brevoKey,
        onProgress: (s, t) => setProgress({ sent: s, total: t }),
      });
      setSendSummary({ sent: result.sent, total: targetEmails.length, limitReached: result.limitReached, remainingToday: result.remainingToday });
      if (result.limitReached) {
        setError(`Envoi arrêté à ${result.sent} destinataire(s) pour respecter la limite quotidienne Brevo.`);
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setSending(false);
    }
  };

  const saveNewsletterDraft = () => {
    if (typeof window === 'undefined') return;
    const payload = { nlHeadline, nlIntro, nlSections, nlSubject, nlHtml, scheduledAt };
    window.localStorage.setItem(NEWSLETTER_DRAFT_KEY, JSON.stringify(payload));
    setDraftStatus(`Brouillon enregistré le ${new Date().toLocaleString('fr-FR')}`);
    setError('');
  };

  const sendScheduledNewsletter = async (campaign: ScheduledNewsletter) => {
    try {
      const result = await sendBulkEmail({
        to: campaign.recipients,
        subject: campaign.subject,
        bodyHtml: campaign.html,
        apiKey: brevoKey,
        onProgress: () => undefined,
      });
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem(NEWSLETTER_SCHEDULE_KEY);
        const list = stored ? (JSON.parse(stored) as ScheduledNewsletter[]) : [];
        window.localStorage.setItem(NEWSLETTER_SCHEDULE_KEY, JSON.stringify(list.filter(item => item.id !== campaign.id)));
      }
      if (result.limitReached) {
        setScheduleStatus(`Campagne programmée envoyée partiellement (${result.sent}/${campaign.recipients.length}) en raison de la limite quotidienne.`);
      }
    } catch (err: any) {
      setScheduleStatus(`Échec de l'envoi programmé : ${err.message || 'Erreur inconnue'}`);
    }
  };

  const scheduleNewsletter = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!nlSubject.trim() || !nlHeadline.trim() || targetEmails.length === 0) {
      setError('Complétez le sujet, le titre et au moins un destinataire.');
      return;
    }
    if (!scheduledAt) {
      setError('Choisissez une date et une heure pour programmer l’envoi.');
      return;
    }

    const scheduleDate = new Date(scheduledAt);
    if (Number.isNaN(scheduleDate.getTime()) || scheduleDate <= new Date()) {
      setError('La date de programmation doit être future.');
      return;
    }

    const campaign: ScheduledNewsletter = {
      id: `schedule-${Date.now()}`,
      subject: nlSubject,
      headline: nlHeadline,
      intro: nlIntro,
      html: nlHtml.trim() || buildNewsletterBody({
        headline: nlHeadline,
        intro: nlIntro,
        sections: nlSections.map(s => ({
          title: s.title, text: s.text,
          imageUrl: s.imageUrl || undefined,
          ctaLabel: s.ctaLabel || undefined,
          ctaUrl: s.ctaUrl || undefined,
        })),
      }),
      recipients: targetEmails,
      scheduledAt: scheduleDate.toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(NEWSLETTER_SCHEDULE_KEY);
      const list = stored ? (JSON.parse(stored) as ScheduledNewsletter[]) : [];
      window.localStorage.setItem(NEWSLETTER_SCHEDULE_KEY, JSON.stringify([...list, campaign]));
    }

    const delay = scheduleDate.getTime() - Date.now();
    window.setTimeout(() => {
      void sendScheduledNewsletter(campaign);
    }, delay);

    setScheduleStatus(`Newsletter programmée pour ${scheduleDate.toLocaleString('fr-FR')}`);
    setError('');
    setDraftStatus('');
  };

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlSubject.trim() || !nlHeadline.trim() || targetEmails.length === 0) return;
    setSending(true); setError(''); setProgress({ sent: 0, total: Math.min(targetEmails.length, dailyUsage.remaining) });
    setSendSummary(null);
    setScheduleStatus('');
    try {
      const result = await sendBulkEmail({
        to: targetEmails,
        subject: nlSubject,
        bodyHtml: nlHtml.trim() || buildNewsletterBody({
          headline: nlHeadline,
          intro: nlIntro,
          sections: nlSections.map(s => ({
            title: s.title, text: s.text,
            imageUrl: s.imageUrl || undefined,
            ctaLabel: s.ctaLabel || undefined,
            ctaUrl: s.ctaUrl || undefined,
          })),
        }),
        apiKey: brevoKey,
        onProgress: (s, t) => setProgress({ sent: s, total: t }),
      });
      setSendSummary({ sent: result.sent, total: targetEmails.length, limitReached: result.limitReached, remainingToday: result.remainingToday });
      if (result.limitReached) {
        setError(`Envoi arrêté à ${result.sent} destinataire(s) pour respecter la limite quotidienne Brevo.`);
      }
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setSending(false);
    }
  };

  const addSection = () => setNlSections(s => [...s, { id: Date.now().toString(), title: '', text: '', imageUrl: '', ctaLabel: '', ctaUrl: '' }]);
  const removeSection = (id: string) => setNlSections(s => s.filter(x => x.id !== id));
  const updateSection = (id: string, field: keyof NewsSection, val: string) =>
    setNlSections(s => s.map(x => x.id === id ? { ...x, [field]: val } : x));

  if (sent) return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
          <CheckCircleIcon className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-playfair text-pm-gold">Email envoyé</h2>
        <p className="text-pm-off-white/50">{(sendSummary?.sent ?? targetEmails.length)} destinataire(s) contacté(s){sendSummary?.limitReached ? ' (limite quotidienne atteinte)' : ''}.</p>
        {sendSummary?.limitReached && <p className="text-sm text-yellow-400">Il reste {sendSummary.remainingToday} place(s) disponible(s) aujourd'hui.</p>}
        <button onClick={() => { setSent(false); setSubject(''); setBody(''); setSendSummary(null); setError(''); }}
          className="px-6 py-2.5 bg-pm-gold text-pm-dark font-bold rounded-full text-sm hover:bg-white transition-colors">
          Envoyer un autre email
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white">
      <SEO title="Admin — Mailing" noIndex />
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold/60 hover:text-pm-gold text-xs uppercase tracking-widest font-black mb-10 transition-colors">
          <ChevronLeftIcon className="w-4 h-4" /> Tableau de bord
        </Link>

        <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-playfair font-black italic">Mailing</h1>
            <p className="text-pm-off-white/40 text-sm mt-1">Composez et envoyez des emails via Brevo.</p>
          </div>
          {!brevoKey && (
            <p className="text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2">
              ⚠️ Clé Brevo non configurée dans Paramètres — utilisation de la clé .env
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          <div className="rounded-full border border-pm-gold/20 bg-pm-gold/10 px-3 py-2 text-xs text-pm-gold">
            Envoi groupé: lots de 25 emails tous les 2s
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
            Limite Brevo: {dailyUsage.used}/{dailyUsage.limit} envoyés aujourd'hui · {dailyUsage.remaining} restant(s)
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

          {/* ── Colonne gauche ── */}
          <div className="xl:col-span-3 space-y-6">

            {/* Tabs */}
            <div className="flex gap-1 bg-black/40 border border-pm-gold/20 rounded-xl p-1">
              {([
                { id: 'compose', label: 'Composer' },
                { id: 'newsletter', label: 'Newsletter' },
                { id: 'preview', label: 'Aperçu' },
              ] as { id: Tab; label: string }[]).map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-colors ${tab === t.id ? 'bg-pm-gold text-pm-dark' : 'text-white/40 hover:text-white'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Destinataires (commun) ── */}
            <div className="bg-black border border-pm-gold/20 rounded-2xl p-6 space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-pm-gold">Destinataires</h2>
              <div className="flex flex-wrap gap-2">
                {([
                  { v: 'all', l: 'Tous' },
                  { v: 'models', l: 'Mannequins' },
                  { v: 'partners', l: `Entreprises (${mailingContacts.length})` },
                  { v: 'custom', l: 'Personnalisé' },
                ] as { v: RecipientGroup; l: string }[]).map(o => (
                  <button key={o.v} onClick={() => setRecipientGroup(o.v)}
                    className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${recipientGroup === o.v ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-white/10 text-white/40 hover:border-pm-gold/40'}`}>
                    {o.l}
                  </button>
                ))}
              </div>

              {/* Liste contacts entreprises */}
              {(recipientGroup === 'partners' || recipientGroup === 'all') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white/30 flex items-center gap-1">
                      <BuildingStorefrontIcon className="w-3.5 h-3.5" />
                      {filteredContacts.length} contact(s) — campagne ciblée
                    </p>
                    <button onClick={() => setShowAddContact(v => !v)} className="text-xs text-pm-gold hover:text-white flex items-center gap-1 transition-colors">
                      <PlusIcon className="w-3 h-3" /> Ajouter
                    </button>
                  </div>
                  {/* Filtre par catégorie */}
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => setFilterCategory(cat)}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-colors ${filterCategory === cat ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-white/10 text-white/30 hover:border-pm-gold/40 hover:text-white/60'}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  {showAddContact && (
                    <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                      <input value={newContact.name} onChange={e => setNewContact(c => ({ ...c, name: e.target.value }))}
                        placeholder="Nom" className="flex-1 min-w-[120px] bg-pm-dark border border-pm-gold/30 rounded-lg px-3 py-1.5 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold" />
                      <input value={newContact.email} onChange={e => setNewContact(c => ({ ...c, email: e.target.value }))}
                        placeholder="Email" className="flex-1 min-w-[160px] bg-pm-dark border border-pm-gold/30 rounded-lg px-3 py-1.5 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold" />
                      <select value={newContact.category} onChange={e => setNewContact(c => ({ ...c, category: e.target.value }))}
                        className="bg-pm-dark border border-pm-gold/30 rounded-lg px-3 py-1.5 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold">
                        {['Mode & Boutiques', 'Hôtellerie & Restauration', 'Digital & Tech', 'Logistique & Transport', 'Droit & Consulting', 'Santé', 'Institution', 'Média', 'Autre'].map(cat => <option key={cat}>{cat}</option>)}
                      </select>
                      <button onClick={addContact} className="bg-pm-gold text-pm-dark px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white transition-colors">OK</button>
                    </div>
                  )}
                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                    {filteredContacts.map(c => (
                      <div key={c.id} className="flex items-center gap-2 bg-white/3 rounded-lg px-3 py-1.5 text-xs">
                        <span className="font-semibold text-pm-off-white/80 truncate flex-1">{c.name}</span>
                        <span className="text-pm-off-white/40 truncate hidden sm:block">{c.email}</span>
                        <span className="text-[10px] text-pm-gold/50 shrink-0 hidden md:block">{c.category}</span>
                        <button onClick={() => removeContact(c.id)} className="text-red-500/50 hover:text-red-400 shrink-0">
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(recipientGroup === 'custom' || recipientGroup === 'all') && (
                <textarea
                  value={customEmails} onChange={e => setCustomEmails(e.target.value)}
                  rows={2} placeholder="email1@exemple.com, email2@exemple.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold resize-none"
                />
              )}
              <div className="flex items-center gap-2 text-xs text-white/30">
                <UsersIcon className="w-4 h-4" />
                <span>{targetEmails.length} destinataire(s)</span>
              </div>
            </div>

            {/* ── Compose ── */}
            {tab === 'compose' && (
              <form onSubmit={handleSendCompose} className="bg-black border border-pm-gold/20 rounded-2xl p-6 space-y-5">
                <h2 className="text-xs font-black uppercase tracking-widest text-pm-gold">Contenu</h2>

                {/* Templates */}
                <div>
                  <p className="text-xs text-white/30 mb-2">Templates rapides</p>
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map(t => (
                      <button key={t.id} type="button" onClick={() => applyTemplate(t)}
                        className="text-xs px-3 py-1.5 rounded-full border border-pm-gold/20 text-pm-gold/60 hover:border-pm-gold hover:text-pm-gold transition-colors">
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-white/30 mb-1.5 block">Objet *</label>
                  <input required value={subject} onChange={e => setSubject(e.target.value)}
                    placeholder="Objet de l'email…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/30 mb-1.5 block">Message *</label>
                  <textarea required value={body} onChange={e => setBody(e.target.value)}
                    rows={10} placeholder="Rédigez votre message…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold resize-none" />
                </div>

                {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={sending || targetEmails.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-pm-gold text-pm-dark font-black py-3 rounded-full text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {sending
                    ? <>
                        <span className="loading loading-spinner loading-sm text-pm-dark" />
                        Lot {Math.ceil(progress.sent / 25)}/{Math.ceil(progress.total / 25)} — {progress.sent}/{progress.total}
                      </>
                    : <><PaperAirplaneIcon className="w-4 h-4" />Envoyer à {targetEmails.length} destinataire(s)</>}
                </button>
                {sending && progress.total > 0 && (
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-pm-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${(progress.sent / progress.total) * 100}%` }} />
                  </div>
                )}
              </form>
            )}

            {/* ── Newsletter ── */}
            {tab === 'newsletter' && (
              <form onSubmit={handleSendNewsletter} className="bg-black border border-pm-gold/20 rounded-2xl p-6 space-y-5">
                <h2 className="text-xs font-black uppercase tracking-widest text-pm-gold">Newsletter</h2>

                <div>
                  <label className="text-xs uppercase tracking-widest text-white/30 mb-1.5 block">Objet de l'email *</label>
                  <input required value={nlSubject} onChange={e => setNlSubject(e.target.value)}
                    placeholder="Ex: PMM Newsletter — Juin 2025"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/30 mb-1.5 block">Titre principal *</label>
                  <input required value={nlHeadline} onChange={e => setNlHeadline(e.target.value)}
                    placeholder="Ex: L'Élégance au Cœur de l'Afrique"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-white/30 mb-1.5 block">Introduction</label>
                  <textarea value={nlIntro} onChange={e => setNlIntro(e.target.value)}
                    rows={3} placeholder="Texte d'introduction de la newsletter…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold resize-none" />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-white/30 mb-1.5 block">Contenu HTML *</label>
                  <textarea value={nlHtml} onChange={e => setNlHtml(e.target.value)}
                    rows={12} placeholder="Collez ici votre HTML complet…"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold resize-none" />
                  <p className="text-[11px] text-white/30 mt-2">Le contenu HTML est utilisé pour l’envoi, l’aperçu et le brouillon.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-white/30 mb-1.5 block">Programmer l'envoi</label>
                    <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold" />
                  </div>
                  <div className="flex items-end gap-2">
                    <button type="button" onClick={saveNewsletterDraft}
                      className="flex-1 bg-white/10 border border-white/10 text-white/70 py-3 rounded-full text-xs uppercase tracking-widest hover:bg-white/20 transition-colors">
                      Brouillon
                    </button>
                    <button type="button" onClick={scheduleNewsletter}
                      className="flex-1 bg-pm-gold/20 border border-pm-gold/30 text-pm-gold py-3 rounded-full text-xs uppercase tracking-widest hover:bg-pm-gold/30 transition-colors">
                      Programmer
                    </button>
                  </div>
                </div>

                {draftStatus && <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">{draftStatus}</p>}
                {scheduleStatus && <p className="text-xs text-pm-gold bg-pm-gold/10 border border-pm-gold/20 rounded-lg px-3 py-2">{scheduleStatus}</p>}

                {/* Sections */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-widest text-pm-gold/60">Sections</p>
                    <button type="button" onClick={addSection}
                      className="flex items-center gap-1 text-xs text-pm-gold hover:text-white transition-colors">
                      <PlusIcon className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  </div>
                  {nlSections.map((s, i) => (
                    <div key={s.id} className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/30">Section {i + 1}</span>
                        {nlSections.length > 1 && (
                          <button type="button" onClick={() => removeSection(s.id)} className="text-red-500/50 hover:text-red-400">
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <input value={s.title} onChange={e => updateSection(s.id, 'title', e.target.value)}
                        placeholder="Titre de la section"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
                      <textarea value={s.text} onChange={e => updateSection(s.id, 'text', e.target.value)}
                        rows={3} placeholder="Contenu…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold resize-none" />
                      <div className="grid grid-cols-2 gap-2">
                        <input value={s.imageUrl} onChange={e => updateSection(s.id, 'imageUrl', e.target.value)}
                          placeholder="URL image (optionnel)"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
                        <input value={s.ctaLabel} onChange={e => updateSection(s.id, 'ctaLabel', e.target.value)}
                          placeholder="Texte bouton (optionnel)"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
                      </div>
                      {s.ctaLabel && (
                        <input value={s.ctaUrl} onChange={e => updateSection(s.id, 'ctaUrl', e.target.value)}
                          placeholder="URL du bouton"
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
                      )}
                    </div>
                  ))}
                </div>

                {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

                <button type="submit" disabled={sending || targetEmails.length === 0}
                  className="w-full flex items-center justify-center gap-2 bg-pm-gold text-pm-dark font-black py-3 rounded-full text-xs uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {sending
                    ? <>
                        <span className="loading loading-spinner loading-sm text-pm-dark" />
                        Lot {Math.ceil(progress.sent / 25)}/{Math.ceil(progress.total / 25)} — {progress.sent}/{progress.total}
                      </>
                    : <><PaperAirplaneIcon className="w-4 h-4" />Envoyer la newsletter à {targetEmails.length} destinataire(s)</>}
                </button>
                {sending && progress.total > 0 && (
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-pm-gold h-full rounded-full transition-all duration-500"
                      style={{ width: `${(progress.sent / progress.total) * 100}%` }} />
                  </div>
                )}
              </form>
            )}

            {/* ── Preview tab (mobile) ── */}
            {tab === 'preview' && (
              <div className="bg-black border border-pm-gold/20 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-pm-gold/10 flex items-center gap-2">
                  <EyeIcon className="w-4 h-4 text-pm-gold" />
                  <span className="text-xs font-black uppercase tracking-widest text-pm-gold">Aperçu</span>
                </div>
                <iframe srcDoc={previewHtml} className="w-full h-[600px] border-0" title="Email preview" />
              </div>
            )}
          </div>

          {/* ── Aperçu desktop ── */}
          <div className="xl:col-span-2 hidden xl:flex flex-col bg-black border border-pm-gold/20 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-pm-gold/10 flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-pm-gold" />
              <span className="text-xs font-black uppercase tracking-widest text-pm-gold">Aperçu en temps réel</span>
            </div>
            <iframe srcDoc={previewHtml} className="flex-1 border-0 w-full" title="Email preview" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminMailing;
