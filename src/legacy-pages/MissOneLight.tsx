import { useState, useEffect, useRef } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { Heart, MessageCircle, X, Download } from 'lucide-react';
import HeroSlide from '../components/MissOneLight/HeroSlide';
import Top5Slide from '../components/MissOneLight/Top5Slide';
import CandidatesSlide from '../components/MissOneLight/CandidatesSlide';
import SEO from '../components/SEO';
import { sendVoteConfirmation } from '../utils/brevoService';

const WHATSAPP_NUMBER = '24174799319';
const PRICE_PER_VOTE = 100;
const VOTE_SUGGESTIONS = [5, 10, 20, 50, 100];
const calcBonus = (v: number) => Math.floor(v / 10) * 5;

// ── Countdown component ──────────────────────────────────────────────────────
function Countdown({ deadline }: { deadline: Date }) {
  const [diff, setDiff] = useState(deadline.getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setDiff(deadline.getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [deadline]);

  if (diff <= 0) return (
    <div className="text-center py-4">
      <span className="text-[#FCD116] font-playfair font-bold text-2xl">🎉 La finale a commencé !</span>
    </div>
  );

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const Unit = ({ v, label }: { v: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 border border-white/20 rounded-xl px-3 md:px-5 py-2 md:py-3 min-w-[52px] md:min-w-[72px] text-center">
        <span className="text-2xl md:text-4xl font-playfair font-black text-white tabular-nums">
          {String(v).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] uppercase tracking-widest text-white/40 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="text-center">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FCD116] mb-3">
        ⏳ Finale le 17 avril 2026 à 20h00
      </p>
      <div className="flex items-end justify-center gap-2 md:gap-3">
        <Unit v={d} label="Jours" />
        <span className="text-white/40 text-2xl font-bold mb-5">:</span>
        <Unit v={h} label="Heures" />
        <span className="text-white/40 text-2xl font-bold mb-5">:</span>
        <Unit v={m} label="Min" />
        <span className="text-white/40 text-2xl font-bold mb-5">:</span>
        <Unit v={s} label="Sec" />
      </div>
    </div>
  );
}

/** Generate and auto-download a payment instruction PDF (HTML→Blob) */
function downloadPaymentPDF(p: {
  candidateName: string;
  votes: number;
  bonusVotes: number;
  totalVotes: number;
  amount: number;
  txRef: string;
  email: string;
  phone: string;
}) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<style>
  body { font-family: Arial, sans-serif; background: #fff; color: #111; margin: 0; padding: 32px; }
  .header { text-align: center; border-bottom: 3px solid #009E60; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 22px; margin: 0 0 4px; color: #009E60; }
  .header p { font-size: 12px; color: #666; margin: 0; }
  .badge { display: inline-block; background: #009E60; color: #fff; font-size: 11px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; }
  td:first-child { color: #666; font-weight: bold; width: 160px; }
  td:last-child { color: #111; }
  .amount { font-size: 28px; font-weight: 900; color: #009E60; text-align: center; margin: 16px 0; }
  .section { background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
  .section h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #009E60; margin: 0 0 12px; }
  .step { display: flex; gap: 12px; margin-bottom: 10px; font-size: 13px; }
  .step-num { background: #009E60; color: #fff; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 11px; flex-shrink: 0; }
  .warning { background: #fff8e1; border: 1px solid #ffc107; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #7a5c00; margin-bottom: 20px; }
  .footer { text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
  .ref { font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style>
</head>
<body>
<div class="header">
  <h1>Miss One Light 2026</h1>
  <p>Perfect Models Management · perfectmodels.online</p>
</div>

<div style="text-align:center"><span class="badge">Bon de vote — À conserver</span></div>

<table>
  <tr><td>Candidate</td><td><strong>${p.candidateName}</strong></td></tr>
  <tr><td>Votes achetés</td><td>${p.votes}</td></tr>
  ${p.bonusVotes > 0 ? `<tr><td>Bonus offerts</td><td style="color:#009E60"><strong>+${p.bonusVotes} votes</strong></td></tr>` : ''}
  <tr><td>Total crédités</td><td><strong>${p.totalVotes} votes</strong></td></tr>
  <tr><td>Email</td><td>${p.email}</td></tr>
  <tr><td>Téléphone</td><td>${p.phone}</td></tr>
  <tr><td>Référence</td><td><span class="ref">${p.txRef}</span></td></tr>
  <tr><td>Date</td><td>${new Date().toLocaleString('fr-FR')}</td></tr>
</table>

<div class="amount">${p.amount.toLocaleString()} FCFA</div>

<div class="section">
  <h2>💳 Procédure de paiement</h2>
  <div class="step"><div class="step-num">1</div><div>Effectuez votre paiement via <strong>Airtel Money</strong> au <strong>074 79 93 19</strong> ou <strong>Moov Money</strong> au <strong>065 23 54 84</strong></div></div>
  <div class="step"><div class="step-num">2</div><div>Envoyez la <strong>capture d'écran</strong> de votre paiement sur WhatsApp au <strong>+241 74 79 93 19</strong></div></div>
  <div class="step"><div class="step-num">3</div><div>Vos votes seront activés dans le classement sous <strong>24h</strong> après confirmation</div></div>
</div>

<div class="warning">
  ⚠️ <strong>Important :</strong> Il est obligatoire d'envoyer votre capture d'écran de paiement pour la traçabilité. Sans capture, les votes ne pourront pas être activés.
</div>

<div class="footer">
  Perfect Models Management · Libreville, Gabon · contact@perfectmodels.ga<br/>
  Ce document est votre preuve de soumission. Conservez-le jusqu'à l'activation de vos votes.
</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MissOneLight_Vote_${p.txRef}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

interface Candidate {
  id: string; number: number; name: string; photo: string;
  votes: number; status: string; order: number; rank?: number;
}
interface VoteForm { name: string; email: string; phone: string; votes: number; }

export default function MissOneLight() {
  const [rawCandidates, setRawCandidates] = useState<Candidate[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [form, setForm] = useState<VoteForm>({ name: '', email: '', phone: '', votes: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ txRef: string; candidateName: string; total: number } | null>(null);
  const submitLock = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // NEW: Voting control state
  const [votingEnabled, setVotingEnabled] = useState(true);
  const [votingDeadline, setVotingDeadline] = useState('2026-04-17T20:00:00');
  
  // NEW: Live vote highlights
  const [recentVotes, setRecentVotes] = useState<Array<{
    id: string;
    candidateName: string;
    voterName: string;
    votes: number;
    timestamp: string;
  }>>([]);

  // Debounce RTDB updates — with hundreds of concurrent voters the realtime
  // listener fires very frequently; cap re-renders to every 800ms.
  useEffect(() => {
    const candidatesRef = ref(rtdb, 'missOneLight/candidates');
    const unsubscribe = onValue(candidatesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Candidate[] = data
        ? Object.entries(data)
            .map(([id, val]) => ({ id, ...(val as Omit<Candidate, 'id'>) }))
            .filter((c) => c.status !== 'hidden')
            .sort((a, b) => b.votes - a.votes)
            .map((c, i) => ({ ...c, rank: i + 1 }))
        : [];
      setRawCandidates(list);
      setLoading(false);
    }, (err) => {
      console.error('RTDB error:', err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Debounce: apply rawCandidates to display state max every 800ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setCandidates(rawCandidates), 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [rawCandidates]);

  // NEW: Load recent validated votes for live display
  const [displayedVoteIndex, setDisplayedVoteIndex] = useState(0);
  
  useEffect(() => {
    const pendingRef = ref(rtdb, 'missOneLight/pendingVotes');
    const unsubscribe = onValue(pendingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const validated = Object.entries(data)
          .map(([id, val]: [string, any]) => ({
            id,
            candidateName: val.candidateName,
            voterName: val.voterName || 'Anonyme',
            votes: val.totalVotes || val.votes,
            timestamp: val.timestamp,
            validated: val.validated,
            validatedAt: val.validatedAt,
          }))
          .filter((v) => v.validated === true)
          .sort((a, b) => new Date(b.validatedAt || b.timestamp).getTime() - new Date(a.validatedAt || a.timestamp).getTime())
          .slice(0, 20); // Keep last 20 validated votes
        setRecentVotes(validated);
        setDisplayedVoteIndex(0); // Reset index when data changes
      } else {
        setRecentVotes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // NEW: Load voting configuration
  useEffect(() => {
    const configRef = ref(rtdb, 'missOneLight/config');
    const unsubscribe = onValue(configRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVotingEnabled(data.votingEnabled ?? true);
        setVotingDeadline(data.votingDeadline ?? '2026-04-17T20:00:00');
      }
    });
    return () => unsubscribe();
  }, []);

  // Check if voting deadline has passed
  useEffect(() => {
    const checkDeadline = () => {
      const now = new Date();
      const deadline = new Date(votingDeadline);
      if (now >= deadline && votingEnabled) {
        // Voting deadline has passed, but still enabled - disable it
        setVotingEnabled(false);
      }
    };
    
    checkDeadline();
    const interval = setInterval(checkDeadline, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [votingDeadline, votingEnabled]);

  // Auto-rotate votes every 3 seconds
  useEffect(() => {
    if (recentVotes.length <= 1) return;
    
    const interval = setInterval(() => {
      setDisplayedVoteIndex((prev) => (prev + 1) % recentVotes.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [recentVotes.length]);

  const totalVotes = candidates.reduce((s, c) => s + (c.votes || 0), 0);

  const openVoteModal = (candidate: Candidate) => {
    // Check if voting is enabled
    if (!votingEnabled) {
      alert('Les votes sont actuellement fermés. Merci de votre participation !');
      return;
    }
    
    // Check if deadline has passed
    const now = new Date();
    const deadline = new Date(votingDeadline);
    if (now >= deadline) {
      alert('La période de vote est terminée. Merci de votre participation !');
      return;
    }
    
    setSelectedCandidate(candidate);
    setForm({ name: '', email: '', phone: '', votes: 5 });
    setSubmitted(null);
  };

  const closeModal = () => {
    if (submitting) return; // prevent accidental close during submit
    setSelectedCandidate(null);
    setSubmitted(null);
    submitLock.current = false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || submitLock.current) return;
    submitLock.current = true;
    setSubmitting(true);

    try {
      const votes = Math.max(1, Math.floor(Number(form.votes)) || 1);
      const bonusVotes = calcBonus(votes);
      const totalVotesVal = votes + bonusVotes;
      const amount = votes * PRICE_PER_VOTE;
      const txRef = `VOTE_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Write to RTDB — push() generates a unique key server-side,
      // safe for concurrent writes from hundreds of users simultaneously.
      const pendingRef = push(ref(rtdb, 'missOneLight/pendingVotes'));
      await set(pendingRef, {
        candidateId: selectedCandidate.id,
        candidateName: selectedCandidate.name,
        voterName: form.name.trim(),
        votes,
        bonusVotes,
        totalVotes: totalVotesVal,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        txRef,
        validated: false,
        timestamp: new Date().toISOString(),
      });

      // 1. Download payment instruction PDF automatically
      downloadPaymentPDF({
        candidateName: selectedCandidate.name,
        votes,
        bonusVotes,
        totalVotes: totalVotesVal,
        amount,
        txRef,
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });

      // 1b. Send confirmation email to voter (non-blocking)
      sendVoteConfirmation({
        email: form.email.trim().toLowerCase(),
        candidateName: selectedCandidate.name,
        votes,
        txRef,
      }).catch(() => {});

      // 2. Open WhatsApp with pre-filled message (slight delay so PDF triggers first)
      await new Promise(r => setTimeout(r, 400));
      const bonusLine = bonusVotes > 0
        ? `\n🎁 Bonus : +${bonusVotes} votes offerts\n✅ Total crédité : ${totalVotesVal} votes`
        : '';
      const msg = `VOTE MISS ONE LIGHT 2026\n\n� Votant : ${form.name.trim()}\n�👑 Candidate : ${selectedCandidate.name}\n🗳️ Votes achetés : ${votes}${bonusLine}\n💰 Montant : ${amount} FCFA\n📧 Email : ${form.email}\n📱 Téléphone : ${form.phone}\n🔖 Réf : ${txRef}\n\n📎 J'ai téléchargé le bon de vote et je vais effectuer le paiement.\n\nMerci de confirmer la réception.`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');

      setSubmitted({ txRef, candidateName: selectedCandidate.name, total: totalVotesVal });
    } catch (err) {
      console.error('Vote error:', err);
      alert('Une erreur est survenue. Veuillez réessayer.');
      submitLock.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-pm-dark flex items-center justify-center">
        <img src="/logo.svg" alt="PMM" className="w-24 h-24 animate-pulse" />
      </div>
    );
  }

  const voteCount = Math.max(1, Math.floor(Number(form.votes)) || 1);
  const bonus = calcBonus(voteCount);

  return (
    <div className="bg-pm-dark min-h-screen">
      <SEO
        title="Miss One Light 2026 — Votez pour votre candidate"
        description="Participez au concours Miss One Light 2026 organisé par Perfect Models Management. Votez pour votre candidate préférée et soutenez la beauté gabonaise !"
        image="https://i.ibb.co/C5rcPJHz/titostyle-53.jpg"
        type="website"
      />
      <section className="min-h-screen">
        <HeroSlide
          totalVotes={totalVotes}
          candidatesCount={candidates.length}
          onDiscover={() => document.getElementById('top5')?.scrollIntoView({ behavior: 'smooth' })}
        />
      </section>

      {/* Gradient transition from hero */}
      <div className="h-24 bg-gradient-to-b from-transparent to-pm-dark" />

      <section id="top5" className="px-4 md:px-6 lg:px-12 py-6 md:py-10 bg-pm-dark">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FCD116]/10 border border-[#FCD116]/30 text-[#FCD116] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FCD116] animate-pulse" />
            Classement en temps réel
          </span>
          <h2 className="text-3xl md:text-5xl font-playfair font-bold text-white">
            Le <span className="text-[#FCD116]">Top 5</span> des favorites
          </h2>
          <p className="text-white/40 text-sm mt-2 max-w-md mx-auto">
            Découvrez les candidates en tête du classement et votez pour votre favorite
          </p>
        </div>

        {/* Top5 + Sidebar side by side on desktop */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Top 5 */}
          <div className="flex-1 min-w-0">
            <Top5Slide
              candidates={candidates.slice(0, 5)}
              onVote={(id) => { const c = candidates.find(c => c.id === id); if (c) openVoteModal(c); }}
              votedCandidates={new Set()}
              votingEnabled={votingEnabled && new Date() < new Date(votingDeadline)}
            />
          </div>

          {/* Sidebar - Live votes & Payment */}
          <div className="lg:w-96 xl:w-[420px] shrink-0 space-y-4">
            {/* Live Vote Highlights Panel */}
            {recentVotes.length > 0 && (
              <div className="border border-[#009E60]/30 rounded-3xl overflow-hidden flex flex-col bg-gradient-to-b from-[#009E60]/10 to-[#009E60]/5 shadow-lg shadow-[#009E60]/5">
                <div className="bg-gradient-to-r from-[#009E60]/30 to-[#FCD116]/20 px-5 py-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#009E60] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#009E60]"></span>
                    </span>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#009E60]">Live</p>
                      <h2 className="text-base font-playfair font-bold text-white">Derniers votes validés</h2>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-4 min-h-[100px] flex items-center justify-center overflow-hidden">
                  {recentVotes.length > 0 && (
                    <div
                      key={displayedVoteIndex}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-[#009E60]/30 w-full animate-in fade-in slide-in-from-right duration-500"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#009E60] to-[#FCD116] flex items-center justify-center shrink-0 animate-pulse">
                        <Heart size={16} className="text-white" fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">
                          {recentVotes[displayedVoteIndex].voterName}
                        </p>
                        <p className="text-white/50 text-xs truncate">
                          a voté pour <span className="text-[#FCD116] font-bold">{recentVotes[displayedVoteIndex].candidateName}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[#009E60] font-black text-lg">+{recentVotes[displayedVoteIndex].votes}</p>
                        <p className="text-white/30 text-[10px]">
                          {new Date(recentVotes[displayedVoteIndex].timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Progress indicators */}
                <div className="px-4 pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 flex gap-1">
                      {recentVotes.slice(0, 5).map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            idx === displayedVoteIndex % recentVotes.length
                              ? 'bg-[#009E60] w-4'
                              : 'bg-white/20 w-2'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-white/40 text-[10px]">
                      {displayedVoteIndex + 1} / {recentVotes.length}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Procedure Card */}
            <div className="border border-[#FCD116]/40 rounded-3xl overflow-hidden flex flex-col bg-gradient-to-b from-[#FCD116]/10 to-transparent shadow-lg shadow-[#FCD116]/5">
              <div className="bg-gradient-to-r from-[#FCD116]/30 to-[#009E60]/20 px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#FCD116]">💳</span>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#FCD116]">Comment voter</p>
                </div>
                <h2 className="text-lg font-playfair font-bold text-white">Procédure de paiement</h2>
              </div>
              <div className="px-5 py-5 space-y-4 bg-white/[0.02]">
                {[
                  { n: '1', color: '#009E60', icon: '👆', title: 'Choisissez votre candidate', desc: 'Cliquez sur "Voter" et remplissez le formulaire.' },
                  { n: '2', color: '#FCD116', icon: '💰', title: 'Effectuez le paiement', desc: (<>Airtel Money <span className="text-[#FCD116] font-black">074 79 93 19</span> ou Moov <span className="text-[#FCD116] font-black">065 23 54 84</span></>) },
                  { n: '3', color: '#25D366', icon: '📱', title: "Envoyez la capture", desc: (<>WhatsApp <span className="text-[#25D366] font-black">+241 74 79 93 19</span> avec la capture d'écran.</>) },
                  { n: '4', color: '#3A75C4', icon: '✨', title: 'Votes activés sous 24h', desc: 'Vos votes apparaissent dans le classement en direct.' },
                ].map(({ n, color, icon, title, desc }) => (
                  <div key={n} className="flex gap-3 items-start group">
                    <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-pm-dark shadow-lg transition-transform group-hover:scale-110" style={{ background: color }}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm mb-0.5">{title}</p>
                      <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 bg-gradient-to-r from-[#009E60]/20 to-[#FCD116]/20 border-t border-[#FCD116]/30 flex items-center gap-3">
                <span className="text-xl">🎁</span>
                <p className="text-white/80 text-xs"><strong className="text-[#FCD116]">Bonus :</strong> +5 votes offerts pour chaque tranche de 10 votes achetés !</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="py-4 md:py-6 bg-pm-dark">
        <div className="max-w-4xl mx-auto px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>

      {/* All Candidates Section */}
      <section id="candidates" className="px-4 md:px-6 lg:px-12 pb-6 md:pb-8 bg-pm-dark">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#009E60]/10 border border-[#009E60]/30 text-[#009E60] text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#009E60] animate-pulse" />
            Toutes les candidates
          </span>
          <h2 className="text-3xl md:text-5xl font-playfair font-bold text-white mb-2">
            Découvrez <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009E60] via-[#FCD116] to-[#3A75C4]">toutes nos candidates</span>
          </h2>
          <p className="text-white/40 text-sm max-w-lg mx-auto">
            {candidates.length} candidates participent à cette édition 2026. Parcourez leurs profils et soutenez votre favorite !
          </p>
        </div>

        <CandidatesSlide
          candidates={candidates}
          onVote={(id) => { const c = candidates.find(c => c.id === id); if (c) openVoteModal(c); }}
          votedCandidates={new Set()}
          votingEnabled={votingEnabled && new Date() < new Date(votingDeadline)}
        />
      </section>

      {/* Vote Modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="relative w-full max-w-md bg-pm-dark border border-white/10 rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <button
              onClick={closeModal}
              disabled={submitting}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors disabled:opacity-30"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-[#009E60]/20 flex items-center justify-center mx-auto mb-4">
                  <Heart size={28} className="text-[#009E60]" fill="currentColor" />
                </div>
                <h2 className="text-2xl font-playfair font-bold text-white mb-2">Demande soumise !</h2>
                <p className="text-white/50 text-sm mb-4 leading-relaxed">
                  Vote pour <strong className="text-[#FCD116]">{submitted.candidateName}</strong> enregistré.<br />
                  Réf : <span className="font-mono text-[#FCD116]">{submitted.txRef}</span>
                </p>

                <div className="bg-[#009E60]/10 border border-[#009E60]/30 rounded-2xl p-4 text-left mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-[#009E60] mb-2">Votre bon de vote a été téléchargé</p>
                  <p className="text-white/70 text-xs leading-relaxed">
                    Le fichier contient la procédure complète de paiement. Effectuez le paiement puis envoyez votre capture d'écran sur WhatsApp pour activer vos <strong className="text-white">{submitted.total} votes</strong>.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-left mb-4">
                  <p className="text-[9px] uppercase tracking-widest text-white/30 mb-1">⚠️ Important</p>
                  <p className="text-white/50 text-xs">Envoyez obligatoirement votre capture d'écran de paiement pour la traçabilité. Sans capture, les votes ne seront pas activés.</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => downloadPaymentPDF({
                      candidateName: submitted.candidateName,
                      votes: submitted.total - calcBonus(submitted.total),
                      bonusVotes: calcBonus(submitted.total - calcBonus(submitted.total)),
                      totalVotes: submitted.total,
                      amount: (submitted.total - calcBonus(submitted.total)) * PRICE_PER_VOTE,
                      txRef: submitted.txRef,
                      email: '',
                      phone: '',
                    })}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all"
                  >
                    <Download size={14} /> Bon de vote
                  </button>
                  <button onClick={closeModal} className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all">
                    Fermer
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6">
                  {selectedCandidate.photo && (
                    <img src={selectedCandidate.photo} alt={selectedCandidate.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-white/10 shrink-0" />
                  )}
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Voter pour</p>
                    <h2 className="text-xl font-playfair font-bold text-white">{selectedCandidate.name}</h2>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Nom complet</label>
                    <input type="text" required value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Votre nom et prénom"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FCD116]/50 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Email</label>
                    <input type="email" required value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="votre@email.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FCD116]/50 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Téléphone</label>
                    <input type="tel" required value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="2417XXXXXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-[#FCD116]/50 text-sm" />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2">Nombre de votes</label>
                    <div className="grid grid-cols-5 gap-1.5 mb-3">
                      {VOTE_SUGGESTIONS.map(n => (
                        <button key={n} type="button"
                          onClick={() => setForm({ ...form, votes: n })}
                          className={`py-2 rounded-lg text-[10px] font-bold transition-all border flex flex-col items-center leading-tight ${
                            form.votes === n
                              ? 'bg-[#FCD116] text-pm-dark border-[#FCD116]'
                              : 'bg-white/5 text-white/60 border-white/10 hover:border-[#FCD116]/40 hover:text-white'
                          }`}>
                          <span>{n}</span>
                          <span className="font-normal opacity-70 text-[8px]">{(n * PRICE_PER_VOTE / 1000).toFixed(0)}k F</span>
                        </button>
                      ))}
                    </div>
                    <input type="number" required min={1} value={form.votes}
                      onChange={e => setForm({ ...form, votes: Math.max(1, parseInt(e.target.value) || 1) })}
                      placeholder="Saisir un nombre libre..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FCD116]/50 text-sm" />
                  </div>

                  {/* Payment procedure */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    <p className="text-[10px] uppercase tracking-widest text-white/40">Procédure de paiement</p>
                    <div className="space-y-2">
                      {[
                        { n: 1, text: <>Payez via <strong className="text-white">Airtel Money</strong> au <strong className="text-[#FCD116]">074 79 93 19</strong> ou <strong className="text-white">Moov Money</strong> au <strong className="text-[#FCD116]">065 23 54 84</strong></> },
                        { n: 2, text: <>Envoyez la <strong className="text-white">capture d'écran</strong> de votre paiement sur WhatsApp au <strong className="text-[#25D366]">+241 74 79 93 19</strong></> },
                        { n: 3, text: <>Vos votes seront activés sous <strong className="text-white">24h</strong> après confirmation</> },
                      ].map(({ n, text }) => (
                        <div key={n} className="flex items-start gap-3">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-[#009E60]/30 text-[#009E60] text-[10px] font-black flex items-center justify-center mt-0.5">{n}</span>
                          <p className="text-white/50 text-xs leading-relaxed">{text}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[9px] text-amber-400/70 border-t border-white/10 pt-2">
                      ⚠️ La capture d'écran est obligatoire pour la traçabilité.
                    </p>
                  </div>

                  {/* Price + bonus summary */}
                  <div className="bg-white/5 border border-[#FCD116]/20 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Montant</span>
                      <span className="text-[#FCD116] font-bold">{(voteCount * PRICE_PER_VOTE).toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Votes achetés</span>
                      <span className="text-white font-bold">{voteCount}</span>
                    </div>
                    {bonus > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#009E60]">🎁 Bonus (+5 / 10 votes)</span>
                        <span className="text-[#009E60] font-bold">+{bonus}</span>
                      </div>
                    )}
                    <div className="border-t border-white/10 pt-2 flex justify-between">
                      <span className="text-white/60 text-sm">Total crédité</span>
                      <span className="text-white font-black">{voteCount + bonus} votes</span>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all">
                    {submitting
                      ? <><span className="loading loading-spinner loading-sm" /> Envoi...</>
                      : <><MessageCircle size={18} /> Soumettre → WhatsApp</>
                    }
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-t from-black/40 to-pm-dark border-t border-white/10">
        <div className="px-4 md:px-6 lg:px-12 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Top bar with logo */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-white mb-1">
                  Miss <span className="text-[#FCD116]">One Light</span> 2026
                </h3>
                <p className="text-white/40 text-sm">Perfect Models Management</p>
              </div>
              <div className="flex items-center gap-4">
                <a 
                  href="https://wa.me/24174799319" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-sm font-semibold hover:bg-[#25D366]/30 transition-all"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Contact WhatsApp
                </a>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-[#FCD116] text-2xl mb-1">📅</p>
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Date de la finale</p>
                <p className="text-white font-bold">17 Avril 2026</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-[#009E60] text-2xl mb-1">🕐</p>
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Heure</p>
                <p className="text-white font-bold">20h00 (GMT+1)</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-[#3A75C4] text-2xl mb-1">📍</p>
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Lieu</p>
                <p className="text-white font-bold">Libreville, Gabon</p>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-6 border-t border-white/10 text-center">
              <p className="text-white/30 text-xs">
                © 2026 Perfect Models Management. Tous droits réservés. | Miss One Light 2026
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
