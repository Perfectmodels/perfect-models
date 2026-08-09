import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon, TrashIcon, XMarkIcon, PaperAirplaneIcon,
  EnvelopeIcon, MagnifyingGlassIcon, ArrowUturnLeftIcon, CheckCircleIcon,
  PencilSquareIcon, InboxIcon, PaperClipIcon, TagIcon, PhotoIcon,
  ArchiveBoxIcon, DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { ContactMessage } from '../types';
import { sendReplyToContact, sendEmail, buildEmailTemplate } from '../utils/brevoService';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import { ref, update, remove, push, set } from 'firebase/database';
import { db } from '../realtimedbConfig';
import { uploadToImgbb } from '../utils/imgbbService';
import { validateFile } from '../utils/imgbbService';

// ── Constantes ────────────────────────────────────────────────────────────────

const LABELS: { value: ContactMessage['label']; color: string; dot: string }[] = [
  { value: 'Partenariat', color: 'text-purple-300 border-purple-500/40 bg-purple-500/10', dot: 'bg-purple-400' },
  { value: 'Casting',     color: 'text-pm-gold border-pm-gold/40 bg-pm-gold/10',          dot: 'bg-pm-gold' },
  { value: 'Presse',      color: 'text-blue-300 border-blue-500/40 bg-blue-500/10',        dot: 'bg-blue-400' },
  { value: 'Booking',     color: 'text-green-300 border-green-500/40 bg-green-500/10',     dot: 'bg-green-400' },
  { value: 'Autre',       color: 'text-white/40 border-white/10 bg-white/5',               dot: 'bg-white/30' },
];

const STATUS_STYLES: Record<ContactMessage['status'], string> = {
  Nouveau: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
  Lu:      'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
  Archivé: 'bg-white/5 text-white/30 border-white/10',
};

// Auto-tag basé sur le sujet
const autoLabel = (subject?: string): ContactMessage['label'] => {
  const s = (subject ?? '').toLowerCase();
  if (s.includes('partenariat') || s.includes('sponsor') || s.includes('collaboration')) return 'Partenariat';
  if (s.includes('casting') || s.includes('mannequin') || s.includes('modèle')) return 'Casting';
  if (s.includes('presse') || s.includes('média') || s.includes('interview')) return 'Presse';
  if (s.includes('booking') || s.includes('réservation') || s.includes('prestation')) return 'Booking';
  return 'Autre';
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

// ── Compose Modal ─────────────────────────────────────────────────────────────

interface ComposeProps {
  onClose: () => void;
  replyTo?: ContactMessage;
  adminName?: string;
  onSent: () => void;
}

const ComposeModal: React.FC<ComposeProps> = ({ onClose, replyTo, adminName, onSent }) => {
  const [to, setTo] = useState(replyTo?.email ?? '');
  const [toName, setToName] = useState(replyTo?.name ?? '');
  const [subject, setSubject] = useState(replyTo ? `Re: ${replyTo.subject}` : '');
  const [body, setBody] = useState('');
  const [mediaLinks, setMediaLinks] = useState<{ name: string; url: string }[]>([]);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadToImgbb(file, '');
      setMediaLinks(p => [...p, { name: file.name, url: res }]);
    } catch { setErr('Erreur upload'); }
    setUploading(false);
  };

  const removeMedia = (i: number) => setMediaLinks(p => p.filter((_, idx) => idx !== i));

  const mediaHtml = mediaLinks.length > 0
    ? `<div style="margin-top:24px;padding-top:16px;border-top:1px solid #333">
        <p style="color:#c9a84c;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">Médias joints</p>
        ${mediaLinks.map(m => `<a href="${m.url}" style="display:block;color:#c9a84c;font-size:14px;margin-bottom:6px;text-decoration:none">📎 ${m.name}</a>`).join('')}
       </div>`
    : '';

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !body) return;
    setSending(true); setErr('');
    try {
      await sendEmail({
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: buildEmailTemplate(`
          <p style="color:#f5f0e8;font-size:16px;margin:0 0 20px">Bonjour${toName ? ` <strong style="color:#c9a84c">${toName}</strong>` : ''},</p>
          <div style="color:#f5f0e8cc;line-height:1.8;white-space:pre-wrap;margin-bottom:32px">${body}</div>
          <p style="color:#f5f0e8cc;margin:0">Cordialement,<br/><strong style="color:#c9a84c">${adminName || "L'équipe Perfect Models Management"}</strong></p>
          ${mediaHtml}
        `, body.substring(0, 80)),
      });

      // Sauvegarder dans "sent"
      const sentRef = push(ref(db, 'contactMessages'));
      const sentMsg: ContactMessage = {
        id: sentRef.key!,
        submissionDate: new Date().toISOString(),
        status: 'Lu',
        name: adminName || 'Admin',
        email: to,
        subject,
        message: body,
        folder: 'sent',
        mediaLinks: mediaLinks.length > 0 ? mediaLinks : undefined,
      };
      await set(sentRef, sentMsg);
      invalidateCache('contactMessages');
      setDone(true);
      setTimeout(() => { onSent(); onClose(); }, 1500);
    } catch (e: any) {
      setErr(e.message || 'Erreur envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#0d0d0d] border border-pm-gold/20 rounded-2xl w-full max-w-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <PencilSquareIcon className="w-5 h-5 text-pm-gold" />
            <span className="text-sm font-black uppercase tracking-widest text-white">{replyTo ? 'Répondre' : 'Nouveau message'}</span>
          </div>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-white/30 hover:text-white" /></button>
        </div>

        {done ? (
          <div className="p-8 flex flex-col items-center gap-3 text-center">
            <CheckCircleIcon className="w-10 h-10 text-green-400" />
            <p className="text-green-300 font-bold">Message envoyé</p>
          </div>
        ) : (
          <form onSubmit={handleSend} className="p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">À (email) *</label>
                <input value={to} onChange={e => setTo(e.target.value)} required type="email" placeholder="contact@exemple.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">Nom destinataire</label>
                <input value={toName} onChange={e => setToName(e.target.value)} placeholder="Nom (optionnel)"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">Objet *</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Objet du message"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-1">Message *</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} required rows={6} placeholder="Rédigez votre message…"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold resize-none" />
            </div>

             {/* Médias joints */}
            {mediaLinks.length > 0 && (
              <div className="space-y-1">
                {mediaLinks.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <PaperClipIcon className="w-3.5 h-3.5 text-pm-gold/60 shrink-0" />
                    <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-pm-gold/80 hover:text-pm-gold truncate flex-1">{m.name}</a>
                    <button type="button" onClick={() => removeMedia(i)}><XMarkIcon className="w-3.5 h-3.5 text-white/30 hover:text-red-400" /></button>
                  </div>
                ))}
              </div>
            )}

            {err && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{err}</p>}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" className="hidden"
                  onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-pm-gold transition-colors disabled:opacity-50">
                  <PhotoIcon className="w-4 h-4" />
                  {uploading ? 'Upload…' : 'Insérer média'}
                </button>
              </div>
              <button type="submit" disabled={sending || !to || !subject || !body}
                className="flex items-center gap-2 px-5 py-2.5 bg-pm-gold text-pm-dark font-black text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {sending ? <span className="loading loading-spinner loading-xs text-pm-dark" /> : <PaperAirplaneIcon className="w-4 h-4" />}
                {sending ? 'Envoi…' : 'Envoyer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Page principale ───────────────────────────────────────────────────────────

const AdminMessages: React.FC = () => {
  const { data } = useData();
  const { items: messages, isLoading, refresh } = useFirebaseCollection<ContactMessage>('contactMessages', {
    pageSize: 300,
    orderBy: 'submissionDate',
  });

  type Folder = 'inbox' | 'sent' | 'drafts';
  type LabelFilter = ContactMessage['label'] | 'all';

  const [folder, setFolder] = useState<Folder>('inbox');
  const [labelFilter, setLabelFilter] = useState<LabelFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [compose, setCompose] = useState<{ open: boolean; replyTo?: ContactMessage }>({ open: false });
  const [replyBody, setReplyBody] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyDone, setReplyDone] = useState(false);
  const [replyError, setReplyError] = useState('');

  // Comptes par dossier
  const inboxMsgs = messages.filter(m => !m.folder || m.folder === 'inbox');
  const sentMsgs  = messages.filter(m => m.folder === 'sent');
  const newCount  = inboxMsgs.filter(m => m.status === 'Nouveau').length;

  const folderMsgs = folder === 'inbox' ? inboxMsgs : folder === 'sent' ? sentMsgs : [];

  const filtered = useMemo(() => folderMsgs.filter(m => {
    const matchLabel = labelFilter === 'all' || m.label === labelFilter || (!m.label && autoLabel(m.subject) === labelFilter);
    const q = search.toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
    return matchLabel && matchSearch;
  }).sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()),
  [folderMsgs, labelFilter, search]);

  // Comptes par label (inbox seulement)
  const labelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    inboxMsgs.forEach(m => {
      const l = m.label ?? autoLabel(m.subject);
      counts[l] = (counts[l] ?? 0) + 1;
    });
    return counts;
  }, [inboxMsgs]);

  const updateMsg = async (id: string, patch: Partial<ContactMessage>) => {
    await update(ref(db, `contactMessages/${id}`), patch);
    invalidateCache('contactMessages');
    refresh();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, ...patch } : null);
  };

  const deleteMsg = async (id: string) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    await remove(ref(db, `contactMessages/${id}`));
    invalidateCache('contactMessages');
    refresh();
    if (selected?.id === id) setSelected(null);
  };

  const openMessage = (msg: ContactMessage) => {
    setSelected(msg);
    setReplyBody('');
    setReplyDone(false);
    setReplyError('');
    if (msg.status === 'Nouveau') updateMsg(msg.id, { status: 'Lu' });
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyBody.trim()) return;
    setReplySending(true); setReplyError('');
    try {
      await sendReplyToContact({
        toName: selected.name,
        toEmail: selected.email,
        originalSubject: selected.subject,
        replyBody,
        adminName: data?.adminProfile?.name,
      });
      setReplyDone(true);
      setReplyBody('');
      updateMsg(selected.id, { status: 'Archivé' });
    } catch (err: any) {
      setReplyError(err.message || "Erreur lors de l'envoi");
    } finally {
      setReplySending(false);
    }
  };

  const getLabelStyle = (msg: ContactMessage) => {
    const l = msg.label ?? autoLabel(msg.subject);
    return LABELS.find(x => x.value === l) ?? LABELS[LABELS.length - 1];
  };

  return (
    <div className="bg-pm-dark min-h-screen text-pm-off-white flex flex-col">
      <SEO title="Admin — Messages" noIndex />

      {/* Top bar */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between gap-4 shrink-0">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold/60 hover:text-pm-gold text-xs uppercase tracking-widest font-black transition-colors">
          <ChevronLeftIcon className="w-4 h-4" /> Tableau de bord
        </Link>
        <div className="flex items-center gap-3">
          {newCount > 0 && (
            <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full font-bold">
              {newCount} nouveau{newCount > 1 ? 'x' : ''}
            </span>
          )}
          <button onClick={() => setCompose({ open: true })}
            className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-xs font-black uppercase tracking-widest rounded-full hover:bg-white transition-colors">
            <PencilSquareIcon className="w-4 h-4" /> Nouveau message
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 73px)' }}>

        {/* ── Colonne 1 : Dossiers ── */}
        <aside className="w-52 shrink-0 border-r border-white/5 flex flex-col py-4 px-3 gap-1 overflow-y-auto">
          <p className="text-[9px] font-black uppercase tracking-widest text-white/20 px-2 mb-2">Dossiers</p>

          {([
            { id: 'inbox', label: 'Boîte de réception', icon: InboxIcon, count: newCount },
            { id: 'sent',  label: 'Envoyés',            icon: PaperAirplaneIcon, count: 0 },
          ] as const).map(f => (
            <button key={f.id} onClick={() => { setFolder(f.id); setSelected(null); setLabelFilter('all'); }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${folder === f.id ? 'bg-pm-gold/10 text-pm-gold' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>
              <f.icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold flex-1 truncate">{f.label}</span>
              {f.count > 0 && <span className="text-[10px] font-black bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">{f.count}</span>}
            </button>
          ))}

          <div className="mt-4 mb-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 px-2 mb-2">Dossiers intelligents</p>
            <button onClick={() => { setFolder('inbox'); setLabelFilter('all'); setSelected(null); }}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all ${labelFilter === 'all' && folder === 'inbox' ? 'text-pm-gold' : 'text-white/30 hover:text-white/60'}`}>
              <TagIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-xs">Tous</span>
              <span className="ml-auto text-[10px] text-white/20">{inboxMsgs.length}</span>
            </button>
            {LABELS.map(l => (
              <button key={l.value} onClick={() => { setFolder('inbox'); setLabelFilter(l.value); setSelected(null); }}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl w-full text-left transition-all ${labelFilter === l.value ? 'bg-white/5' : 'hover:bg-white/[0.03]'}`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${l.dot}`} />
                <span className={`text-xs truncate ${labelFilter === l.value ? 'text-white' : 'text-white/40'}`}>{l.value}</span>
                <span className="ml-auto text-[10px] text-white/20">{labelCounts[l.value!] ?? 0}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* ── Colonne 2 : Liste messages ── */}
        <div className="w-72 shrink-0 border-r border-white/5 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <div className="relative">
              <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && <p className="text-center text-white/20 text-xs p-6 animate-pulse">Chargement…</p>}
            {!isLoading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/20">
                <EnvelopeIcon className="w-8 h-8" />
                <p className="text-xs">Aucun message</p>
              </div>
            )}
            {filtered.map(m => {
              const ls = getLabelStyle(m);
              return (
                <button key={m.id} onClick={() => openMessage(m)}
                  className={`w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] ${selected?.id === m.id ? 'bg-pm-gold/5 border-l-2 border-l-pm-gold' : ''}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={`text-xs font-bold truncate ${m.status === 'Nouveau' ? 'text-white' : 'text-white/50'}`}>{m.name}</span>
                    <span className="text-[9px] text-white/20 shrink-0">{fmt(m.submissionDate)}</span>
                  </div>
                  <p className={`text-[11px] truncate mb-1.5 ${m.status === 'Nouveau' ? 'text-pm-gold font-semibold' : 'text-white/40'}`}>{m.subject}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${ls.color}`}>{m.label ?? autoLabel(m.subject)}</span>
                    {m.status === 'Nouveau' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                    {m.mediaLinks && m.mediaLinks.length > 0 && <PaperClipIcon className="w-3 h-3 text-white/20" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Colonne 3 : Lecture / Réponse ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-white/15">
              <EnvelopeIcon className="w-16 h-16" />
              <p className="text-sm">Sélectionnez un message</p>
              <button onClick={() => setCompose({ open: true })}
                className="flex items-center gap-2 text-xs text-pm-gold/50 hover:text-pm-gold transition-colors mt-2">
                <PencilSquareIcon className="w-4 h-4" /> Rédiger un nouveau message
              </button>
            </div>
          ) : (
            <>
              {/* Header message */}
              <div className="px-6 py-4 border-b border-white/5 flex items-start justify-between gap-4 shrink-0">
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-bold text-white truncate">{selected.subject}</h2>
                  <p className="text-xs text-white/40 mt-1">
                    De <span className="text-pm-gold">{selected.name}</span>
                    {' · '}<a href={`mailto:${selected.email}`} className="text-pm-gold/60 hover:text-pm-gold">{selected.email}</a>
                    {' · '}<span>{fmt(selected.submissionDate)}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Label selector */}
                  <select value={selected.label ?? autoLabel(selected.subject)}
                    onChange={e => updateMsg(selected.id, { label: e.target.value as ContactMessage['label'] })}
                    className="text-[10px] bg-pm-dark border border-white/10 rounded-lg px-2 py-1.5 text-white/50 focus:outline-none focus:border-pm-gold">
                    {LABELS.map(l => <option key={l.value} value={l.value}>{l.value}</option>)}
                  </select>
                  {/* Status */}
                  <select value={selected.status}
                    onChange={e => updateMsg(selected.id, { status: e.target.value as ContactMessage['status'] })}
                    className="text-[10px] bg-pm-dark border border-pm-gold/20 rounded-lg px-2 py-1.5 text-pm-off-white focus:outline-none focus:border-pm-gold">
                    <option value="Nouveau">Nouveau</option>
                    <option value="Lu">Lu</option>
                    <option value="Archivé">Archivé</option>
                  </select>
                  <button onClick={() => setCompose({ open: true, replyTo: selected })}
                    className="p-1.5 text-pm-gold/50 hover:text-pm-gold transition-colors" title="Répondre">
                    <ArrowUturnLeftIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => updateMsg(selected.id, { status: 'Archivé' })}
                    className="p-1.5 text-white/20 hover:text-white/60 transition-colors" title="Archiver">
                    <ArchiveBoxIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMsg(selected.id)} className="p-1.5 text-red-500/40 hover:text-red-400 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <button onClick={() => setSelected(null)} className="p-1.5 text-white/20 hover:text-white transition-colors">
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Corps du message */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5 text-pm-off-white/80 leading-relaxed whitespace-pre-wrap text-sm">
                  {selected.message}
                </div>

                {/* Médias joints */}
                {selected.mediaLinks && selected.mediaLinks.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">Médias joints</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.mediaLinks.map((m, i) => (
                        <a key={i} href={m.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-pm-gold/70 hover:text-pm-gold bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                          <PaperClipIcon className="w-3.5 h-3.5" /> {m.name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zone réponse rapide (inline) */}
                {folder === 'inbox' && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ArrowUturnLeftIcon className="w-4 h-4 text-pm-gold" />
                      <span className="text-xs font-black uppercase tracking-widest text-pm-gold">Réponse rapide</span>
                    </div>
                    {replyDone ? (
                      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                        <CheckCircleIcon className="w-5 h-5 text-green-400 shrink-0" />
                        <p className="text-sm text-green-300">Réponse envoyée à <strong>{selected.email}</strong></p>
                      </div>
                    ) : (
                      <form onSubmit={handleReply} className="space-y-3">
                        <div className="text-xs text-white/25 bg-white/[0.03] rounded-lg px-3 py-2">
                          À : <span className="text-pm-gold">{selected.email}</span>
                          {' · '}Re: <span className="text-white/40">{selected.subject}</span>
                        </div>
                        <textarea value={replyBody} onChange={e => setReplyBody(e.target.value)} required rows={4}
                          placeholder="Rédigez votre réponse…"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-pm-off-white placeholder:text-white/20 focus:outline-none focus:border-pm-gold resize-none" />
                        {replyError && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{replyError}</p>}
                        <div className="flex items-center gap-3">
                          <button type="submit" disabled={replySending || !replyBody.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-pm-gold text-pm-dark font-black text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            {replySending
                              ? <><span className="loading loading-spinner loading-xs text-pm-dark" />Envoi…</>
                              : <><PaperAirplaneIcon className="w-4 h-4" />Envoyer</>}
                          </button>
                          <button type="button" onClick={() => setCompose({ open: true, replyTo: selected })}
                            className="text-xs text-white/30 hover:text-pm-gold transition-colors flex items-center gap-1">
                            <DocumentDuplicateIcon className="w-3.5 h-3.5" /> Réponse complète avec médias
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compose modal */}
      {compose.open && (
        <ComposeModal
          onClose={() => setCompose({ open: false })}
          replyTo={compose.replyTo}
          adminName={data?.adminProfile?.name}
          onSent={() => { invalidateCache('contactMessages'); refresh(); }}
        />
      )}
    </div>
  );
};

export default AdminMessages;
