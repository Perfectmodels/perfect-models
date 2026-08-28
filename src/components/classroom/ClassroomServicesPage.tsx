'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, BanknotesIcon, CameraIcon, ChatBubbleLeftRightIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

type Kind = 'absence' | 'contribution' | 'shooting-theme';
type RequestRow = { id: string; title?: string; kind?: string; createdAt?: string; created_at?: string; status?: string };
type MessageRow = { id: string; senderRole?: string; senderName?: string; message?: string };

const CARDS = [
  { kind: 'absence' as Kind, label: 'Justifier une absence', icon: DocumentArrowUpIcon, help: 'Envoyez le motif, la date et le lien vers votre justificatif.' },
  { kind: 'contribution' as Kind, label: 'Soumettre une cotisation', icon: BanknotesIcon, help: 'Déclarez la période, le montant et votre preuve de paiement.' },
  { kind: 'shooting-theme' as Kind, label: 'Proposer un thème de shooting', icon: CameraIcon, help: 'Soumettez une idée créative à la direction artistique.' },
];

export default function ClassroomServicesPage() {
  const { user } = useAuth();
  const [kind, setKind] = useState<Kind>('absence');
  const [form, setForm] = useState({ title: '', message: '', amount: '', period: '', eventDate: '', attachmentUrl: '' });
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    const [requestsResponse, messagesResponse] = await Promise.all([
      fetch('/api/classroom/requests', { cache: 'no-store', credentials: 'include' }),
      fetch('/api/classroom/messages', { cache: 'no-store', credentials: 'include' }),
    ]);
    if (requestsResponse.ok) setRequests((await requestsResponse.json()).requests || []);
    if (messagesResponse.ok) setMessages((await messagesResponse.json()).messages || []);
  };

  useEffect(() => { void load(); }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice('');
    const response = await fetch('/api/classroom/requests', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, kind }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { setNotice(payload.error || 'Envoi impossible.'); return; }
    setNotice('Demande transmise à l’administration.');
    setForm({ title: '', message: '', amount: '', period: '', eventDate: '', attachmentUrl: '' });
    await load();
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;
    const response = await fetch('/api/classroom/messages', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (response.ok) { setMessage(''); await load(); }
  };

  return <div className="min-h-screen bg-[#060606] text-white">
    <header className="border-b border-white/10 px-5 py-5"><div className="mx-auto flex max-w-6xl items-center justify-between"><Link href="/formations" className="flex items-center gap-2 text-sm text-white/50 hover:text-pm-gold"><ArrowLeftIcon className="h-4 w-4"/>Classroom</Link><span className="text-xs font-black uppercase tracking-[.25em] text-pm-gold">{user?.displayName || 'Espace mannequin'}</span></div></header>
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-10">
      <div><p className="text-[10px] font-black uppercase tracking-[.35em] text-pm-gold">Vie d&apos;agence</p><h1 className="mt-2 font-playfair text-4xl font-black">Demandes & échanges</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">Centralisez vos justificatifs, cotisations, propositions artistiques et échanges avec l’administration.</p></div>
      <div className="grid gap-3 md:grid-cols-3">{CARDS.map(card => <button key={card.kind} onClick={() => setKind(card.kind)} className={`rounded-2xl border p-5 text-left transition ${kind === card.kind ? 'border-pm-gold bg-pm-gold/10' : 'border-white/10 bg-white/[.03]'}`}><card.icon className="h-6 w-6 text-pm-gold"/><p className="mt-4 font-bold">{card.label}</p><p className="mt-2 text-xs leading-5 text-white/40">{card.help}</p></button>)}</div>
      <div className="grid gap-6 lg:grid-cols-[1fr_.9fr]">
        <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><h2 className="font-playfair text-2xl font-bold">Nouvelle demande</h2><div className="mt-5 grid gap-4"><input value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Objet" required className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-pm-gold"/>{kind === 'absence' && <input type="date" value={form.eventDate} onChange={event => setForm({ ...form, eventDate: event.target.value })} className="rounded-xl border border-white/10 bg-black/40 px-4 py-3"/>}{kind === 'contribution' && <div className="grid grid-cols-2 gap-3"><input value={form.period} onChange={event => setForm({ ...form, period: event.target.value })} placeholder="Période" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3"/><input type="number" value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} placeholder="Montant FCFA" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3"/></div>}<textarea value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} placeholder="Détails" rows={5} required className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none focus:border-pm-gold"/><input type="url" value={form.attachmentUrl} onChange={event => setForm({ ...form, attachmentUrl: event.target.value })} placeholder="Lien du justificatif / preuve / moodboard" className="rounded-xl border border-white/10 bg-black/40 px-4 py-3"/><button className="rounded-xl bg-pm-gold px-5 py-3 font-black text-black">Envoyer à l’administration</button>{notice && <p className="text-sm text-pm-gold">{notice}</p>}</div></form>
        <section className="rounded-2xl border border-white/10 bg-white/[.03] p-6"><div className="flex items-center gap-3"><ChatBubbleLeftRightIcon className="h-6 w-6 text-pm-gold"/><h2 className="font-playfair text-2xl font-bold">Messagerie</h2></div><div className="mt-5 h-[360px] space-y-3 overflow-y-auto pr-2">{messages.map(row => <div key={row.id} className={`rounded-xl p-3 text-sm ${row.senderRole === 'student' ? 'ml-8 border border-pm-gold/20 bg-pm-gold/10' : 'mr-8 border border-white/10 bg-white/5'}`}><p className="text-[9px] font-black uppercase tracking-wider text-white/35">{row.senderName}</p><p className="mt-1 leading-6 text-white/75">{row.message}</p></div>)}{!messages.length && <p className="text-sm text-white/30">Aucun message pour le moment.</p>}</div><form onSubmit={send} className="mt-4 flex gap-2"><input value={message} onChange={event => setMessage(event.target.value)} placeholder="Écrire à l’administration…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3"/><button className="rounded-xl bg-pm-gold px-4 font-black text-black">Envoyer</button></form></section>
      </div>
      <section><h2 className="font-playfair text-2xl font-bold">Historique</h2><div className="mt-4 space-y-2">{requests.map(row => <div key={row.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[.02] p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold">{row.title}</p><p className="mt-1 text-xs text-white/35">{row.kind} · {new Date(row.createdAt || row.created_at || Date.now()).toLocaleDateString('fr-FR')}</p></div><span className={`w-fit rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${row.status === 'approved' || row.status === 'processed' ? 'bg-emerald-500/15 text-emerald-300' : row.status === 'rejected' ? 'bg-red-500/15 text-red-300' : 'bg-amber-500/15 text-amber-300'}`}>{row.status}</span></div>)}</div></section>
    </main>
  </div>;
}
