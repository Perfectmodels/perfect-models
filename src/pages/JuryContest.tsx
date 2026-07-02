import { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, push, set, update } from 'firebase/database';
import { Star, LogOut, CheckCircle, ChevronRight, ChevronLeft, Layers } from 'lucide-react';
import SEO from '../components/SEO';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { STAGE_LABELS, STAGE_ORDER, type ContestStage } from './AdminBeautyContest';

// ... types ...
interface Candidate { id: string; order: number; name: string; photo: string; bio: string; status: string; }
interface ScoringCriteria { id: string; passageId?: string; label: string; weight: number; order: number; }
interface Passage { id: string; order: number; name: string; description: string; }
interface Score { id: string; juryId: string; candidateId: string; passageId: string; scores: Record<string,number>; comment: string; submittedAt: string; }
interface Contest { id: string; name: string; date: string; location: string; status: string; currentStage: ContestStage; }

const RTDB_BASE = 'beautyContests';

export default function JuryContest() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const juryId    = authUser?.userId ?? '';
  const juryName  = authUser?.displayName ?? '';
  const contestId = authUser?.contestId ?? '';

  const stagePath = (cId: string, stage: ContestStage) => `${RTDB_BASE}/${cId}/stages/${stage}`;
  const [contest, setContest] = useState<Contest|null>(null);
  const [activeStage, setActiveStage] = useState<ContestStage>('preselection');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [criteria, setCriteria] = useState<ScoringCriteria[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentCandidateIndex, setCurrentCandidateIndex] = useState(0);
  const [currentPassageIndex, setCurrentPassageIndex] = useState(0);
  const [scoreInputs, setScoreInputs] = useState<Record<string,string>>({});
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);

  const showToast = (msg:string, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  // Load contest info
  useEffect(() => {
    if (!contestId) return;
    const unsub = onValue(ref(rtdb, `${RTDB_BASE}/${contestId}`), (snap) => {
      const d = snap.val();
      if (d) {
        const c: Contest = { id: contestId, name: d.name, date: d.date, location: d.location, status: d.status, currentStage: d.currentStage || 'preselection' };
        setContest(c);
        setActiveStage(c.currentStage);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [contestId]);

  // Load stage-scoped data
  useEffect(() => {
    if (!contestId || !activeStage) return;
    const sp = stagePath(contestId, activeStage);
    const u: (()=>void)[] = [];
    u.push(onValue(ref(rtdb, `${sp}/candidates`), (snap) => {
      const d = snap.val();
      if (d) {
        const l: Candidate[] = Object.entries(d).map(([id,v]:any) => ({ id, ...v }));
        setCandidates(l.filter(c => c.status === 'active').sort((a,b) => a.order - b.order));
      } else setCandidates([]);
    }));
    u.push(onValue(ref(rtdb, `${sp}/passages`), (snap) => {
      const d = snap.val();
      if (d) {
        const l: Passage[] = Object.entries(d).map(([id,v]:any) => ({ id, ...v }));
        setPassages(l.sort((a,b) => a.order - b.order));
      } else setPassages([]);
    }));
    u.push(onValue(ref(rtdb, `${sp}/criteria`), (snap) => {
      const d = snap.val();
      if (d) {
        const l: ScoringCriteria[] = Object.entries(d).map(([id,v]:any) => ({ id, ...v }));
        setCriteria(l.sort((a,b) => a.order - b.order));
      } else setCriteria([]);
    }));
    u.push(onValue(ref(rtdb, `${sp}/scores`), (snap) => {
      const d = snap.val();
      if (d) {
        const l: Score[] = Object.entries(d).map(([id,v]:any) => ({ id, ...v }));
        setScores(l.filter(s => s.juryId === juryId));
      } else setScores([]);
    }));
    // Reset navigation when stage changes
    setCurrentCandidateIndex(0); setCurrentPassageIndex(0);
    setScoreInputs({}); setComment('');
    return () => u.forEach(f => f());
  }, [contestId, activeStage, juryId]);
  // Derived
  const effectivePassages: Passage[] = passages.length > 0 ? passages : [{ id: 'global', order: 1, name: 'Notation globale', description: '' }];
  const currentCandidate = candidates[currentCandidateIndex];
  const currentPassage   = effectivePassages[currentPassageIndex];

  const criteriaForPassage = (passageId: string) =>
    criteria.filter(c => !c.passageId || c.passageId === passageId);

  const getScore = (candidateId: string, passageId: string) =>
    scores.find(s => s.candidateId === candidateId && s.passageId === passageId);

  const totalCells  = candidates.length * effectivePassages.length;
  const scoredCells = candidates.reduce((n, c) => n + effectivePassages.filter(p => getScore(c.id, p.id)).length, 0);

  const currentCriteria = currentPassage ? criteriaForPassage(currentPassage.id) : [];
  const totalWeight     = currentCriteria.reduce((s, c) => s + c.weight, 0) || 1;
  const currentAvg      = currentCriteria.reduce((s, cr) => s + (parseFloat(scoreInputs[cr.id] || '0') * cr.weight), 0) / totalWeight;
  const existingScore   = currentCandidate && currentPassage ? getScore(currentCandidate.id, currentPassage.id) : null;

  // Load score when candidate or passage changes
  useEffect(() => {
    if (!currentCandidate || !currentPassage) return;
    const ex = getScore(currentCandidate.id, currentPassage.id);
    if (ex) {
      const inp: Record<string,string> = {};
      Object.entries(ex.scores).forEach(([k,v]) => { inp[k] = String(v); });
      setScoreInputs(inp); setComment(ex.comment || '');
    } else { setScoreInputs({}); setComment(''); }
  }, [currentCandidateIndex, currentPassageIndex, scores]);

  const handleSave = async (andNext = false) => {
    if (!currentCandidate || !currentPassage || !contestId) return;
    const sp = stagePath(contestId, activeStage);
    const scoresMap: Record<string,number> = {};
    currentCriteria.forEach(cr => { scoresMap[cr.id] = Math.min(10, Math.max(0, parseFloat(scoreInputs[cr.id] || '0'))); });
    setSaving(true);
    try {
      const payload = { juryId, candidateId: currentCandidate.id, passageId: currentPassage.id, scores: scoresMap, comment, submittedAt: new Date().toISOString() };
      if (existingScore) { await update(ref(rtdb, `${sp}/scores/${existingScore.id}`), payload); }
      else { const r = push(ref(rtdb, `${sp}/scores`)); await set(r, payload); }
      showToast('Notes enregistrées ✓');
      if (andNext) {
        if (currentPassageIndex < effectivePassages.length - 1) { setCurrentPassageIndex(i => i + 1); }
        else if (currentCandidateIndex < candidates.length - 1) { setCurrentCandidateIndex(i => i + 1); setCurrentPassageIndex(0); }
      }
    } catch { showToast('Erreur lors de la sauvegarde', false); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };
  if (loading) return <div className='min-h-screen bg-pm-dark flex items-center justify-center'><img src="/logo.svg" alt="PMM" className="w-24 h-24 animate-pulse" /></div>;
  if (!contestId || !contest) return (
    <div className='min-h-screen bg-pm-dark flex flex-col items-center justify-center gap-4 px-4 text-center'>
      <SEO title='Jury — Notation' noIndex/>
      <p className='text-white/40'>Session invalide. Veuillez vous reconnecter.</p>
      <button onClick={handleLogout} className='px-6 py-2 bg-pm-gold text-pm-dark font-bold rounded-full'>Se connecter</button>
    </div>
  );
  if (criteria.length === 0) return (
    <div className='min-h-screen bg-pm-dark flex flex-col items-center justify-center gap-4 px-4 text-center'>
      <SEO title='Jury — Notation' noIndex/>
      <Star size={48} className='text-white/10'/>
      <p className='text-white/40'>Aucun critère défini pour cette étape.</p>
      <p className='text-white/20 text-sm'>Contactez l&apos;administrateur.</p>
    </div>
  );

  return (
    <div className='min-h-screen bg-pm-dark text-white'>
      <SEO title={'Jury — ' + (contest?.name || 'Notation')} noIndex/>
      {toast && <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl font-semibold text-white shadow-xl ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>{toast.msg}</div>}

      {/* Header */}
      <header className='sticky top-0 z-40 bg-pm-dark/95 backdrop-blur-xl border-b border-white/5 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-[9px] uppercase tracking-[0.3em] text-pm-gold/60'>Jury · {juryName}</p>
            <h1 className='text-sm font-bold text-white truncate max-w-[200px]'>{contest?.name}</h1>
          </div>
          <div className='flex items-center gap-3'>
            <div className='text-right'>
              <p className='text-xs text-white/40'>{scoredCells}/{totalCells} notés</p>
              <div className='w-24 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden'>
                <div className='h-full bg-pm-gold rounded-full transition-all' style={{width: totalCells > 0 ? (scoredCells/totalCells*100)+'%' : '0%'}}/>
              </div>
            </div>
            <button onClick={handleLogout} className='p-2 text-white/30 hover:text-red-400 transition-colors'><LogOut size={18}/></button>
          </div>
        </div>

        {/* Stage tabs */}
        <div className='flex gap-2 mt-3 overflow-x-auto no-scrollbar'>
          {STAGE_ORDER.map(stage => {
            const stageIdx = STAGE_ORDER.indexOf(contest!.currentStage);
            const thisIdx  = STAGE_ORDER.indexOf(stage);
            const accessible = thisIdx <= stageIdx;
            return (
              <button key={stage} onClick={() => accessible && setActiveStage(stage)} disabled={!accessible}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  stage === activeStage
                    ? 'bg-pm-gold text-pm-dark border-pm-gold'
                    : accessible
                    ? 'bg-white/10 text-white/60 border-white/10 hover:border-white/20'
                    : 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed'
                }`}
              >
                {STAGE_LABELS[stage]}
                {stage === contest!.currentStage && <span className='ml-1 w-1.5 h-1.5 rounded-full bg-orange-400 inline-block animate-pulse'/>}
              </button>
            );
          })}
        </div>
      </header>

      <div className='max-w-2xl mx-auto px-4 py-6 space-y-5'>

        {/* Passage tabs */}
        {effectivePassages.length > 1 && (
          <div className='space-y-2'>
            <p className='text-white/40 text-xs uppercase tracking-widest flex items-center gap-1'><Layers size={12}/>Passage</p>
            <div className='flex gap-2 overflow-x-auto no-scrollbar pb-1'>
              {effectivePassages.map((p, i) => (
                <button key={p.id} onClick={() => setCurrentPassageIndex(i)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                    i === currentPassageIndex ? 'bg-teal-500 text-white border-teal-500' : 'bg-white/5 text-white/50 border-white/10 hover:border-teal-500/40'
                  }`}
                >
                  <span className='mr-1 opacity-60'>{p.order}.</span>{p.name}
                  {candidates.filter(c => getScore(c.id, p.id)).length > 0 && (
                    <span className='ml-2 text-[10px] bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full'>
                      {candidates.filter(c => getScore(c.id, p.id)).length}/{candidates.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            {currentPassage.description && <p className='text-white/30 text-xs italic'>{currentPassage.description}</p>}
          </div>
        )}

        {/* Candidate navigation */}
        <div className='flex items-center gap-3'>
          <button onClick={() => setCurrentCandidateIndex(i => Math.max(0, i-1))} disabled={currentCandidateIndex === 0} className='p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30'><ChevronLeft size={20}/></button>
          <div className='flex-1 flex gap-1 overflow-x-auto no-scrollbar'>
            {candidates.map((c, i) => {
              const scored = currentPassage ? !!getScore(c.id, currentPassage.id) : false;
              return (
                <button key={c.id} onClick={() => setCurrentCandidateIndex(i)}
                  className={`shrink-0 w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                    i === currentCandidateIndex ? 'bg-pm-gold text-pm-dark'
                    : scored ? 'bg-green-500/30 text-green-300 border border-green-500/40'
                    : 'bg-white/10 text-white/40 hover:bg-white/20'
                  }`}
                >{c.order}</button>
              );
            })}
          </div>
          <button onClick={() => setCurrentCandidateIndex(i => Math.min(candidates.length-1, i+1))} disabled={currentCandidateIndex === candidates.length-1} className='p-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30'><ChevronRight size={20}/></button>
        </div>
        {/* Scoring card */}
        {currentCandidate && currentPassage && (
          <div className='bg-white/5 border border-white/10 rounded-3xl overflow-hidden'>
            <div className='flex items-center gap-4 p-5 border-b border-white/10'>
              {currentCandidate.photo
                ? <img src={currentCandidate.photo} alt={currentCandidate.name} className='h-16 w-16 object-cover rounded-2xl shrink-0'/>
                : <div className='h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center text-white/30 text-2xl font-bold shrink-0'>{currentCandidate.name[0]}</div>
              }
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap'>
                  <p className='text-white font-bold text-xl'>#{currentCandidate.order} {currentCandidate.name}</p>
                  {existingScore && <CheckCircle size={16} className='text-green-400 shrink-0'/>}
                </div>
                {effectivePassages.length > 1 && <p className='text-teal-400 text-sm mt-0.5 flex items-center gap-1'><Layers size={12}/>{currentPassage.name}</p>}
                {currentCandidate.bio && <p className='text-white/40 text-xs mt-1 line-clamp-1'>{currentCandidate.bio}</p>}
              </div>
              <div className='text-right shrink-0'>
                <p className='text-3xl font-black text-pm-gold'>{currentAvg.toFixed(1)}</p>
                <p className='text-white/30 text-xs'>/10</p>
              </div>
            </div>

            <div className='p-5 space-y-6'>
              {currentCriteria.length === 0 && <p className='text-white/30 text-center py-4'>Aucun critère pour ce passage.</p>}
              {currentCriteria.map(cr => (
                <div key={cr.id} className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <label className='text-white font-semibold'>{cr.label} <span className='text-pm-gold/60 text-xs font-normal'>coeff.{cr.weight}</span></label>
                    <span className='text-white font-black text-xl'>{scoreInputs[cr.id] || '0'}<span className='text-white/30 text-sm font-normal'>/10</span></span>
                  </div>
                  <input type='range' min='0' max='10' step='0.5'
                    value={scoreInputs[cr.id] || '0'}
                    onChange={e => setScoreInputs(p => ({ ...p, [cr.id]: e.target.value }))}
                    className='w-full h-3 rounded-full appearance-none cursor-pointer accent-pm-gold bg-white/10'
                  />
                  <div className='flex justify-between text-white/20 text-[10px] px-0.5'>
                    {[0,1,2,3,4,5,6,7,8,9,10].map(n => <span key={n}>{n}</span>)}
                  </div>
                </div>
              ))}

              <div>
                <label className='block text-white/50 text-sm mb-2'>Commentaire</label>
                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={2}
                  className='w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-pm-gold/50 text-sm resize-none'
                  placeholder='Observations...'/>
              </div>

              <div className='flex gap-3 pt-2'>
                <button onClick={() => handleSave(false)} disabled={saving}
                  className='flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2'>
                  {saving ? <span className='loading loading-spinner loading-sm'/> : <Star size={16}/>}Enregistrer
                </button>
                {(currentPassageIndex < effectivePassages.length - 1 || currentCandidateIndex < candidates.length - 1) && (
                  <button onClick={() => handleSave(true)} disabled={saving}
                    className='flex-1 py-3 rounded-xl bg-pm-gold text-pm-dark font-bold disabled:opacity-50 flex items-center justify-center gap-2'>
                    {saving ? <span className='loading loading-spinner loading-sm'/> : <ChevronRight size={16}/>}
                    {currentPassageIndex < effectivePassages.length - 1 ? 'Passage suivant' : 'Candidate suivante'}
                  </button>
                )}
                {currentPassageIndex === effectivePassages.length - 1 && currentCandidateIndex === candidates.length - 1 && (
                  <button onClick={() => handleSave(false)} disabled={saving}
                    className='flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2'>
                    <CheckCircle size={16}/>Terminer
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary grid */}
        {candidates.length > 0 && (
          <div className='bg-white/5 border border-white/10 rounded-2xl p-5'>
            <p className='text-white/40 text-xs uppercase tracking-widest mb-3'>Récapitulatif — {STAGE_LABELS[activeStage]}</p>
            {effectivePassages.length > 1 ? (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead><tr className='border-b border-white/10'>
                    <th className='text-left text-white/40 pb-2 pr-3'>Candidate</th>
                    {effectivePassages.map(p => <th key={p.id} className='text-center text-white/40 pb-2 px-2 whitespace-nowrap text-xs'>{p.name}</th>)}
                    <th className='text-center text-pm-gold pb-2 pl-2'>Moy.</th>
                  </tr></thead>
                  <tbody>
                    {candidates.map(c => {
                      const passageAvgs = effectivePassages.map(p => {
                        const sc = getScore(c.id, p.id);
                        if (!sc) return null;
                        const crits = criteriaForPassage(p.id);
                        const tw = crits.reduce((s,cr) => s+cr.weight, 0) || 1;
                        return crits.reduce((s,cr) => s+(sc.scores[cr.id]??0)*cr.weight, 0) / tw;
                      });
                      const valid = passageAvgs.filter(v => v !== null) as number[];
                      const avg = valid.length > 0 ? valid.reduce((a,b) => a+b, 0)/valid.length : null;
                      return (
                        <tr key={c.id} className={`border-b border-white/5 ${candidates.indexOf(c)===currentCandidateIndex?'bg-pm-gold/5':''}`}>
                          <td className='py-2 pr-3'><button onClick={()=>setCurrentCandidateIndex(candidates.indexOf(c))} className='text-white/70 hover:text-white text-left'>#{c.order} {c.name}</button></td>
                          {effectivePassages.map((p,i) => (
                            <td key={p.id} className='py-2 px-2 text-center'>
                              <button onClick={()=>{setCurrentCandidateIndex(candidates.indexOf(c));setCurrentPassageIndex(i);}}
                                className={passageAvgs[i]!==null?'text-pm-gold font-bold hover:underline':'text-white/20 hover:text-white/50 text-xs'}
                              >{passageAvgs[i]!==null?(passageAvgs[i] as number).toFixed(1):'—'}</button>
                            </td>
                          ))}
                          <td className='py-2 pl-2 text-center'>{avg!==null?<span className='text-pm-gold font-black'>{avg.toFixed(2)}</span>:<span className='text-white/20'>—</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='space-y-2'>
                {candidates.map(c => {
                  const sc = getScore(c.id, 'global');
                  const tw = criteria.reduce((s,cr) => s+cr.weight, 0) || 1;
                  const avg = sc ? criteria.reduce((s,cr) => s+(sc.scores[cr.id]??0)*cr.weight, 0)/tw : null;
                  return (
                    <button key={c.id} onClick={()=>setCurrentCandidateIndex(candidates.indexOf(c))}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${candidates.indexOf(c)===currentCandidateIndex?'bg-pm-gold/10 border border-pm-gold/30':'hover:bg-white/5'}`}
                    >
                      <span className='text-white/70 text-sm'>#{c.order} {c.name}</span>
                      {avg!==null?<span className='text-pm-gold font-bold text-sm'>{avg.toFixed(1)}/10</span>:<span className='text-white/20 text-xs'>Non noté</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
