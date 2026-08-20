'use client';

import React, { useMemo, useState } from 'react';
import { useData } from '@/contexts/DataContext';

type Tab = 'inbox' | 'sent' | 'campaigns' | 'contacts' | 'compose';
type TemplateId = 'partnership' | 'services' | 'sponsorship' | 'casting' | 'shooting' | 'followup';

const TEMPLATES: Record<TemplateId, { label: string; subject: string; body: string }> = {
  partnership: { label: 'Demande de partenariat', subject: 'Proposition de partenariat — Perfect Models Management', body: 'Bonjour,\n\nPerfect Models Management souhaite vous proposer une collaboration autour de nos activités de mode, de production et de valorisation des talents.\n\nNous serions heureux d’échanger avec votre équipe afin d’identifier les possibilités de partenariat adaptées à vos objectifs.\n\nSeriez-vous disponible pour un échange ?\n\nCordialement,\nPerfect Models Management' },
  services: { label: 'Proposition de services', subject: 'Proposition de services — Perfect Models Management', body: 'Bonjour,\n\nNous vous contactons afin de vous présenter les services de Perfect Models Management : mannequins, casting, production de défilés, shootings et accompagnement de projets mode.\n\nNous pouvons vous proposer des profils et une production adaptés à vos prochaines campagnes.\n\nAu plaisir d’échanger avec vous.\n\nCordialement,\nPerfect Models Management' },
  sponsorship: { label: 'Demande de sponsoring', subject: 'Proposition de sponsoring — Perfect Fashion Day', body: 'Bonjour,\n\nPerfect Models Management prépare ses prochaines initiatives et souhaite proposer à votre entreprise un partenariat de sponsoring autour de nos événements et actions de promotion de la mode.\n\nNous pouvons vous présenter notre dossier de partenariat et les différentes contreparties disponibles.\n\nSeriez-vous disponible pour recevoir notre proposition ?\n\nCordialement,\nPerfect Models Management' },
  casting: { label: 'Proposition de casting', subject: 'Proposition de casting et de talents — Perfect Models Management', body: 'Bonjour,\n\nNous disposons d’un portefeuille de mannequins pouvant répondre à vos besoins de casting, campagne, défilé ou production audiovisuelle.\n\nNous pouvons vous transmettre une sélection de profils selon votre brief.\n\nCordialement,\nPerfect Models Management' },
  shooting: { label: 'Shooting / campagne', subject: 'Collaboration shooting & campagne — Perfect Models Management', body: 'Bonjour,\n\nNous souhaitons vous proposer une collaboration autour d’un shooting ou d’une campagne avec les talents de Perfect Models Management.\n\nNous pouvons construire une proposition selon votre univers, vos objectifs et votre budget.\n\nCordialement,\nPerfect Models Management' },
  followup: { label: 'Relance partenariat', subject: 'Relance — Proposition de partenariat Perfect Models Management', body: 'Bonjour,\n\nNous revenons vers vous concernant notre précédente proposition de collaboration avec Perfect Models Management.\n\nNous restons disponibles pour vous présenter plus précisément nos projets et possibilités de partenariat.\n\nCordialement,\nPerfect Models Management' },
};

const CONTACTS_KEY = 'pmm_messaging_contacts';

export default function AdminMessagingPage() {
  const { data, addDocument } = useData();
  const [tab, setTab] = useState<Tab>('inbox');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCategory, setContactCategory] = useState('Entreprise');
  const [contacts, setContacts] = useState<{id:string;name:string;email:string;category:string}[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]'); } catch { return []; }
  });

  const sentLogs = useMemo(() => ((data as any)?.messagingLogs || []).filter((x: any) => x.direction === 'outbound').sort((a:any,b:any) => String(b.createdAt).localeCompare(String(a.createdAt))), [data]);
  const inbox = useMemo(() => ((data as any)?.messagingLogs || []).filter((x: any) => x.direction === 'inbound').sort((a:any,b:any) => String(b.createdAt).localeCompare(String(a.createdAt))), [data]);
  const campaigns = useMemo(() => sentLogs.filter((x:any) => x.kind === 'campaign'), [sentLogs]);

  const useTemplate = (id: TemplateId) => { const t = TEMPLATES[id]; setSubject(t.subject); setBody(t.body); setTab('compose'); };

  const saveContact = () => {
    if (!contactName.trim() || !contactEmail.includes('@')) return;
    const next = [...contacts, { id: crypto.randomUUID(), name: contactName.trim(), email: contactEmail.trim(), category: contactCategory }];
    setContacts(next); localStorage.setItem(CONTACTS_KEY, JSON.stringify(next)); setContactName(''); setContactEmail(''); setNotice('Contact enregistré.');
  };

  const send = async (campaign = false) => {
    const recipients = to.split(/[\n,;]+/).map(x => x.trim()).filter(x => x.includes('@')).map(email => ({ email }));
    if (!subject.trim() || !body.trim() || !recipients.length) { setNotice('Renseignez un objet, un message et au moins un destinataire.'); return; }
    setSending(true); setNotice('');
    try {
      for (let i = 0; i < recipients.length; i += 25) {
        const batch = recipients.slice(i, i + 25);
        const res = await fetch('/api/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'raw', to: batch, subject, htmlContent: `<div style="font-family:Arial;line-height:1.7;white-space:pre-wrap">${body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</div>` }) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Échec de l’envoi');
        await addDocument('messagingLogs', { direction: 'outbound', kind: campaign || recipients.length > 1 ? 'campaign' : 'message', to: batch.map(x=>x.email), subject, body, createdAt: new Date().toISOString(), status: 'sent', messageId: json.messageId || null });
      }
      setNotice(`${recipients.length} destinataire(s) traité(s) et enregistré(s) dans les messages envoyés.`); setTo(''); setBody(''); setSubject(''); setTab('sent');
    } catch (e) { setNotice(e instanceof Error ? e.message : 'Erreur d’envoi'); } finally { setSending(false); }
  };

  return <div className="min-h-screen bg-[#080808] text-white p-4 md:p-8">
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-[11px] uppercase tracking-[.3em] text-[#c9a84c]">Communication</p><h1 className="mt-2 text-3xl font-semibold">Messagerie</h1><p className="mt-2 text-sm text-white/50">Boîte de réception, messages envoyés, campagnes et contacts dans un seul espace.</p></div>
        <button onClick={()=>setTab('compose')} className="rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-black">Nouveau message</button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2 border-b border-white/10 pb-3">{([['inbox','Boîte de réception'],['sent','Envoyés'],['campaigns','Campagnes'],['contacts','Contacts'],['compose','Composer']] as [Tab,string][]).map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-full px-4 py-2 text-sm ${tab===id?'bg-[#c9a84c] text-black':'bg-white/5 text-white/65 hover:bg-white/10'}`}>{label}</button>)}</div>
      {notice && <div className="mb-5 rounded-xl border border-[#c9a84c]/20 bg-[#c9a84c]/10 p-4 text-sm text-[#f4dc92]">{notice}</div>}

      {tab==='inbox' && <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-4 text-xl">Boîte de réception</h2>{inbox.length===0?<div className="py-16 text-center text-white/40">Aucun message entrant synchronisé.</div>:inbox.map((m:any)=><div key={m.id} className="border-b border-white/10 py-4"><div className="font-medium">{m.from || 'Expéditeur'}</div><div className="text-sm text-white/60">{m.subject}</div><div className="mt-1 text-xs text-white/35">{new Date(m.createdAt).toLocaleString('fr-FR')}</div></div>)}</section>}
      {tab==='sent' && <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-4 text-xl">Messages envoyés</h2>{sentLogs.length===0?<div className="py-16 text-center text-white/40">Aucun message envoyé depuis ce module.</div>:sentLogs.map((m:any)=><div key={m.id} className="border-b border-white/10 py-4"><div className="flex justify-between gap-4"><div><div className="font-medium">{m.subject}</div><div className="text-sm text-white/55">À : {Array.isArray(m.to)?m.to.join(', '):m.to}</div></div><span className="text-xs text-[#c9a84c]">{m.status}</span></div><div className="mt-1 text-xs text-white/35">{new Date(m.createdAt).toLocaleString('fr-FR')}</div></div>)}</section>}
      {tab==='campaigns' && <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-5 text-xl">Campagnes</h2><div className="grid gap-4 md:grid-cols-3">{Object.entries(TEMPLATES).map(([id,t])=><button key={id} onClick={()=>useTemplate(id as TemplateId)} className="rounded-xl border border-white/10 p-5 text-left hover:border-[#c9a84c]/50"><div className="font-medium">{t.label}</div><div className="mt-2 text-xs text-white/40">{t.subject}</div></button>)}</div><div className="mt-8">{campaigns.length===0?<p className="text-sm text-white/40">Aucune campagne envoyée.</p>:<p className="text-sm text-white/60">{campaigns.length} campagne(s) enregistrée(s).</p>}</div></section>}
      {tab==='contacts' && <section className="grid gap-6 lg:grid-cols-[1fr_1.5fr]"><div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-5 text-xl">Ajouter un contact professionnel</h2><input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Entreprise" className="mb-3 w-full rounded-xl bg-white/5 p-3 outline-none"/><input value={contactEmail} onChange={e=>setContactEmail(e.target.value)} placeholder="email professionnel" className="mb-3 w-full rounded-xl bg-white/5 p-3 outline-none"/><input value={contactCategory} onChange={e=>setContactCategory(e.target.value)} placeholder="Catégorie" className="mb-4 w-full rounded-xl bg-white/5 p-3 outline-none"/><button onClick={saveContact} className="rounded-full bg-[#c9a84c] px-5 py-3 font-semibold text-black">Enregistrer</button></div><div className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><h2 className="mb-4 text-xl">Destinataires ({contacts.length})</h2>{contacts.length===0?<p className="py-10 text-center text-white/40">Ajoutez des contacts professionnels ou importez-les ultérieurement.</p>:contacts.map(c=><div key={c.id} className="border-b border-white/10 py-3"><div>{c.name}</div><div className="text-sm text-white/50">{c.email} · {c.category}</div></div>)}</div></section>}
      {tab==='compose' && <section className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><div className="mb-5 flex flex-wrap gap-2">{Object.entries(TEMPLATES).map(([id,t])=><button key={id} onClick={()=>useTemplate(id as TemplateId)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/65 hover:border-[#c9a84c]/50">{t.label}</button>)}</div><div className="grid gap-4"><textarea value={to} onChange={e=>setTo(e.target.value)} placeholder="Destinataires — emails séparés par virgule, point-virgule ou retour à la ligne" className="min-h-24 rounded-xl bg-white/5 p-4 outline-none"/><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Objet" className="rounded-xl bg-white/5 p-4 outline-none"/><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Votre message" className="min-h-80 rounded-xl bg-white/5 p-4 outline-none"/><div className="flex flex-wrap justify-end gap-3"><button disabled={sending} onClick={()=>send(false)} className="rounded-full border border-white/15 px-5 py-3 text-sm">{sending?'Envoi…':'Envoyer'}</button><button disabled={sending} onClick={()=>send(true)} className="rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-black">{sending?'Envoi…':'Envoyer comme campagne'}</button></div></div></section>}
    </div>
  </div>;
}
