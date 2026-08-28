'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Tab = 'inbox' | 'sent' | 'campaigns' | 'contacts' | 'compose';
type TemplateId = 'partnership' | 'services' | 'sponsorship' | 'casting' | 'shooting' | 'followup';
type Contact = { id: string; name?: string | null; email?: string | null; category?: string | null };
type Message = {
  id: string;
  direction?: string | null;
  channel?: string | null;
  recipient?: string | null;
  sender?: string | null;
  subject?: string | null;
  body?: string | null;
  status?: string | null;
  provider_message_id?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
};

const TEMPLATES: Record<TemplateId, { label: string; subject: string; body: string }> = {
  partnership: { label: 'Demande de partenariat', subject: 'Proposition de partenariat — Perfect Models Management', body: 'Bonjour,\n\nPerfect Models Management souhaite vous proposer une collaboration autour de nos activités de mode, de production et de valorisation des talents.\n\nNous serions heureux d’échanger avec votre équipe afin d’identifier les possibilités de partenariat adaptées à vos objectifs.\n\nSeriez-vous disponible pour un échange ?\n\nCordialement,\nPerfect Models Management' },
  services: { label: 'Proposition de services', subject: 'Proposition de services — Perfect Models Management', body: 'Bonjour,\n\nNous vous contactons afin de vous présenter les services de Perfect Models Management : mannequins, casting, production de défilés, shootings et accompagnement de projets mode.\n\nNous pouvons vous proposer des profils et une production adaptés à vos prochaines campagnes.\n\nAu plaisir d’échanger avec vous.\n\nCordialement,\nPerfect Models Management' },
  sponsorship: { label: 'Demande de sponsoring', subject: 'Proposition de sponsoring — Perfect Fashion Day', body: 'Bonjour,\n\nPerfect Models Management prépare ses prochaines initiatives et souhaite proposer à votre entreprise un partenariat de sponsoring autour de nos événements et actions de promotion de la mode.\n\nNous pouvons vous présenter notre dossier de partenariat et les différentes contreparties disponibles.\n\nSeriez-vous disponible pour recevoir notre proposition ?\n\nCordialement,\nPerfect Models Management' },
  casting: { label: 'Proposition de casting', subject: 'Proposition de casting et de talents — Perfect Models Management', body: 'Bonjour,\n\nNous disposons d’un portefeuille de mannequins pouvant répondre à vos besoins de casting, campagne, défilé ou production audiovisuelle.\n\nNous pouvons vous transmettre une sélection de profils selon votre brief.\n\nCordialement,\nPerfect Models Management' },
  shooting: { label: 'Shooting / campagne', subject: 'Collaboration shooting & campagne — Perfect Models Management', body: 'Bonjour,\n\nNous souhaitons vous proposer une collaboration autour d’un shooting ou d’une campagne avec les talents de Perfect Models Management.\n\nNous pouvons construire une proposition selon votre univers, vos objectifs et votre budget.\n\nCordialement,\nPerfect Models Management' },
  followup: { label: 'Relance partenariat', subject: 'Relance — Proposition de partenariat Perfect Models Management', body: 'Bonjour,\n\nNous revenons vers vous concernant notre précédente proposition de collaboration avec Perfect Models Management.\n\nNous restons disponibles pour vous présenter plus précisément nos projets et possibilités de partenariat.\n\nCordialement,\nPerfect Models Management' },
};

const EXCLUDED_PREFIXES = ['rh@', 'recrutement@', 'recrutement.', 'ressources.humaines@', 'capital.humain@', 'capitalhumain@', 'cv@', 'jobs@', 'emploi@', 'emplois@', 'recruittalents@', 'recruitment@'];
const isCommercialContact = (email: string) => {
  const value = email.trim().toLowerCase();
  return !EXCLUDED_PREFIXES.some(prefix => value.startsWith(prefix)) && !value.endsWith('@gmail.com') && !value.endsWith('@yahoo.com') && !value.endsWith('@outlook.com');
};

async function resource<T>(name: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/resources/${name}`, {
    credentials: 'include',
    cache: 'no-store',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || payload?.message || 'Opération Supabase impossible.');
  return (payload?.data ?? payload) as T;
}

export default function AdminMessagingPage() {
  const [tab, setTab] = useState<Tab>('inbox');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Entreprise');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([resource<Contact[]>('mailing'), resource<Message[]>('messages')])
      .then(([contactRows, messageRows]) => {
        if (!active) return;
        setContacts(contactRows.filter(c => c.email && isCommercialContact(c.email)));
        setMessages(messageRows);
      })
      .catch(error => active && setNotice(error instanceof Error ? error.message : 'Chargement impossible.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const orderedMessages = useMemo(() => [...messages].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))), [messages]);
  const sentLogs = useMemo(() => orderedMessages.filter(x => x.direction === 'outbound'), [orderedMessages]);
  const inbox = useMemo(() => orderedMessages.filter(x => x.direction === 'inbound'), [orderedMessages]);
  const campaigns = useMemo(() => sentLogs.filter(x => x.metadata?.kind === 'campaign'), [sentLogs]);

  const useTemplate = (id: TemplateId) => {
    const template = TEMPLATES[id];
    setSubject(template.subject);
    setBody(template.body);
    setTab('compose');
  };

  const saveContact = async () => {
    if (!contactName.trim() || !contactEmail.includes('@') || !isCommercialContact(contactEmail)) {
      setNotice('Seuls les contacts professionnels non-RH sont autorisés.');
      return;
    }
    const email = contactEmail.trim().toLowerCase();
    if (contacts.some(c => c.email?.toLowerCase() === email)) {
      setNotice('Ce contact existe déjà dans Supabase.');
      return;
    }
    try {
      const created = await resource<Contact>('mailing', {
        method: 'POST',
        body: JSON.stringify({ name: contactName.trim(), email, category: contactCategory, raw_data: { source: 'admin-messaging' } }),
      });
      setContacts(current => [created, ...current]);
      setContactName('');
      setContactEmail('');
      setNotice('Contact professionnel enregistré dans Supabase.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Enregistrement impossible.');
    }
  };

  const send = async (campaign = false) => {
    const recipients = [...new Set(to.split(/[\n,;]+/).map(x => x.trim().toLowerCase()).filter(x => x.includes('@') && isCommercialContact(x)))].map(email => ({ email }));
    if (!subject.trim() || !body.trim() || !recipients.length) {
      setNotice('Renseignez un objet, un message et au moins un destinataire professionnel.');
      return;
    }
    setSending(true);
    setNotice('');
    try {
      for (let index = 0; index < recipients.length; index += 25) {
        const batch = recipients.slice(index, index + 25);
        const response = await fetch('/api/email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'raw',
            to: batch,
            subject,
            htmlContent: `<div style="font-family:Arial;line-height:1.7;white-space:pre-wrap">${body.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</div>`,
          }),
        });
        const emailResult = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(emailResult.error || 'Échec de l’envoi');

        const created = await resource<Message>('messages', {
          method: 'POST',
          body: JSON.stringify({
            direction: 'outbound',
            channel: 'email',
            recipient: batch.map(x => x.email).join(', '),
            sender: 'Perfect Models Management',
            subject,
            body,
            status: 'sent',
            provider_message_id: emailResult.messageId || null,
            metadata: {
              kind: campaign || recipients.length > 1 ? 'campaign' : 'message',
              recipients: batch.map(x => x.email),
              provider: 'brevo',
            },
          }),
        });
        setMessages(current => [created, ...current]);
      }
      setNotice(`${recipients.length} destinataire(s) traité(s) et journalisé(s) dans Supabase.`);
      setTo('');
      setBody('');
      setSubject('');
      setTab('sent');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Erreur d’envoi');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (value?: string | null) => value ? new Date(value).toLocaleString('fr-FR') : '';

  return <div className="admin-messaging p-1 text-pm-ink md:p-3">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-[11px] uppercase tracking-[.3em] text-[#c9a84c]">Communication · Supabase</p><h1 className="mt-2 text-3xl font-semibold">Messagerie</h1><p className="mt-2 text-sm text-white/50">Messages, campagnes et contacts sont stockés dans les tables normalisées Supabase.</p></div>
        <button onClick={() => setTab('compose')} className="rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-black">Nouveau message</button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">{([['inbox','Boîte de réception'],['sent','Envoyés'],['campaigns','Campagnes'],['contacts','Contacts'],['compose','Composer']] as [Tab,string][]).map(([id,label]) => <button key={id} onClick={() => setTab(id)} className={`rounded-full px-4 py-2 text-sm ${tab === id ? 'bg-[#c9a84c] text-black' : 'bg-white/5 text-white/65 hover:bg-white/10'}`}>{label}</button>)}</div>
      {notice && <div className="mb-5 rounded-xl border border-[#c9a84c]/20 bg-[#c9a84c]/10 p-4 text-sm text-[#f4dc92]">{notice}</div>}
      {loading && <div className="py-16 text-center text-white/40">Chargement depuis Supabase…</div>}

      {!loading && tab === 'inbox' && <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-4 text-xl">Boîte de réception</h2>{inbox.length === 0 ? <div className="py-16 text-center text-white/40">Aucun message entrant synchronisé.</div> : inbox.map(message => <div key={message.id} className="border-b border-white/10 py-4"><div className="font-medium">{message.sender || 'Expéditeur'}</div><div className="text-sm text-white/60">{message.subject}</div><div className="mt-1 text-xs text-white/35">{formatDate(message.created_at)}</div></div>)}</section>}
      {!loading && tab === 'sent' && <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-4 text-xl">Messages envoyés</h2>{sentLogs.length === 0 ? <div className="py-16 text-center text-white/40">Aucun message envoyé.</div> : sentLogs.map(message => <div key={message.id} className="border-b border-white/10 py-4"><div className="flex justify-between gap-4"><div><div className="font-medium">{message.subject}</div><div className="text-sm text-white/55">À : {message.recipient}</div></div><span className="text-xs text-[#c9a84c]">{message.status}</span></div><div className="mt-1 text-xs text-white/35">{formatDate(message.created_at)}</div></div>)}</section>}
      {!loading && tab === 'campaigns' && <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-5 text-xl">Campagnes</h2><div className="grid gap-4 md:grid-cols-3">{Object.entries(TEMPLATES).map(([id, template]) => <button key={id} onClick={() => useTemplate(id as TemplateId)} className="rounded-xl border border-white/10 p-5 text-left hover:border-[#c9a84c]/50"><div className="font-medium">{template.label}</div><div className="mt-2 text-xs text-white/40">{template.subject}</div></button>)}</div><p className="mt-8 text-sm text-white/50">{campaigns.length} campagne(s) enregistrée(s) dans Supabase.</p></section>}
      {!loading && tab === 'contacts' && <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-5 text-xl">Ajouter un contact professionnel</h2><input value={contactName} onChange={event => setContactName(event.target.value)} placeholder="Entreprise" className="mb-3 w-full rounded-xl bg-white/5 p-3 outline-none"/><input value={contactEmail} onChange={event => setContactEmail(event.target.value)} placeholder="email professionnel" className="mb-3 w-full rounded-xl bg-white/5 p-3 outline-none"/><input value={contactCategory} onChange={event => setContactCategory(event.target.value)} placeholder="Catégorie" className="mb-4 w-full rounded-xl bg-white/5 p-3 outline-none"/><button onClick={saveContact} className="rounded-full bg-[#c9a84c] px-5 py-3 font-semibold text-black">Enregistrer dans Supabase</button></div><div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-4 text-xl">Destinataires ({contacts.length})</h2>{contacts.length === 0 ? <p className="py-10 text-center text-white/40">Aucun contact professionnel.</p> : contacts.map(contact => <div key={contact.id} className="border-b border-white/10 py-3"><div>{contact.name || 'Contact'}</div><div className="text-sm text-white/50">{contact.email} · {contact.category || 'Autre'}</div></div>)}</div></section>}
      {!loading && tab === 'compose' && <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><div className="mb-5 flex flex-wrap gap-2">{Object.entries(TEMPLATES).map(([id, template]) => <button key={id} onClick={() => useTemplate(id as TemplateId)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/65 hover:border-[#c9a84c]/50">{template.label}</button>)}</div><div className="grid gap-4"><textarea value={to} onChange={event => setTo(event.target.value)} placeholder="Destinataires — emails séparés par virgule, point-virgule ou retour à la ligne" className="min-h-24 rounded-xl bg-white/5 p-4 outline-none"/><input value={subject} onChange={event => setSubject(event.target.value)} placeholder="Objet" className="rounded-xl bg-white/5 p-4 outline-none"/><textarea value={body} onChange={event => setBody(event.target.value)} placeholder="Votre message" className="min-h-80 rounded-xl bg-white/5 p-4 outline-none"/><div className="flex flex-wrap justify-end gap-3"><button disabled={sending} onClick={() => send(false)} className="rounded-full border border-white/15 px-5 py-3 text-sm disabled:opacity-50">{sending ? 'Envoi…' : 'Envoyer'}</button><button disabled={sending} onClick={() => send(true)} className="rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50">{sending ? 'Envoi…' : 'Envoyer comme campagne'}</button></div></div></section>}
    </div>
  </div>;
}
