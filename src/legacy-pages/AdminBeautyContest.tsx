import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Upload, Star, Users, Award, ChevronUp, Key, Copy, Eye, EyeOff, Layers, Shuffle, Flag, ChevronRight, CheckCircle } from 'lucide-react';
import { rtdb } from '../firebase';
import { ref, set, remove, update, onValue, push, get } from 'firebase/database';
import { uploadToImgbb, validateFile } from '../utils/imgbbService';

export type ContestStage = 'preselection' | 'semifinal' | 'final';

export const STAGE_LABELS: Record<ContestStage, string> = {
  preselection: 'Présélection',
  semifinal: 'Demi-finale',
  final: 'Finale',
};
export const STAGE_COLORS: Record<ContestStage, string> = {
  preselection: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  semifinal: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  final: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
};
export const STAGE_ORDER: ContestStage[] = ['preselection', 'semifinal', 'final'];
const NEXT_STAGE: Record<ContestStage, ContestStage | null> = { preselection: 'semifinal', semifinal: 'final', final: null };

// ── Types ─────────────────────────────────────────────────────────────────
interface Contest { id: string; name: string; description: string; date: string; location: string; status: 'draft'|'active'|'closed'; currentStage: ContestStage; createdAt: string; }
interface Candidate { id: string; order: number; name: string; photo: string; bio: string; status: 'active'|'hidden'|'winner'; }
interface Jury { id: string; name: string; role: string; photo: string; username?: string; password?: string; }
interface Passage { id: string; order: number; name: string; description: string; }
interface ScoringCriteria { id: string; passageId?: string; label: string; weight: number; order: number; }
interface Score { id: string; juryId: string; candidateId: string; passageId: string; scores: Record<string,number>; comment: string; submittedAt: string; }

// Stage-scoped path helper
const stagePath = (contestId: string, stage: ContestStage) => `beautyContests/${contestId}/stages/${stage}`;
const RTDB_BASE = 'beautyContests';
// ── PassageCard component (hooks must be at top level of a component) ─────────
interface PassageCardProps {
  p: { id: string; order: number; name: string; description: string };
  criteria: { id: string; passageId?: string; label: string; weight: number; order: number }[];
  scores: { passageId: string }[];
  activeStage: ContestStage;
  inp: string;
  onEdit: () => void;
  onDelete: () => void;
  onSaveCriteria: (e: React.FormEvent, override?: { label: string; weight: string; order: string; passageId: string; editingId?: string | null }) => void;
  onDeleteCriteria: (id: string) => void;
}

function PassageCard({ p, criteria, scores, activeStage, inp, onEdit, onDelete, onSaveCriteria, onDeleteCriteria }: PassageCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [inlineForm, setInlineForm] = useState<{ label: string; weight: string } | null>(null);
  const [editingInlineId, setEditingInlineId] = useState<string | null>(null);

  const passageCriteria = criteria.filter(c => c.passageId === p.id);

  return (
    <div className='bg-white/10 border border-white/20 rounded-2xl overflow-hidden'>
      <div className='flex items-center gap-4 p-5'>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shrink-0 ${STAGE_COLORS[activeStage]}`}>{p.order}</div>
        <div className='flex-1 min-w-0'>
          <p className='text-white font-bold'>{p.name}</p>
          {p.description && <p className='text-white/40 text-sm mt-0.5'>{p.description}</p>}
          <div className='flex items-center gap-3 mt-1'>
            <span className='text-teal-400 text-xs'>{passageCriteria.length} critère(s)</span>
            <span className='text-white/20 text-xs'>·</span>
            <span className='text-white/30 text-xs'>{scores.filter(s => s.passageId === p.id).length} note(s)</span>
          </div>
        </div>
        <div className='flex gap-2'>
          <button onClick={() => setExpanded(!expanded)} className={`px-3 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${expanded ? 'bg-teal-500 text-white' : 'bg-teal-500/20 hover:bg-teal-500/40 text-teal-300'}`}>
            <Star size={14} />Critères
          </button>
          <button onClick={onEdit} className='bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded-xl'><Edit2 size={16} /></button>
          <button onClick={onDelete} className='bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded-xl'><Trash2 size={16} /></button>
        </div>
      </div>

      {expanded && (
        <div className='border-t border-white/10 bg-black/20 p-5 space-y-4'>
          <div className='flex items-center justify-between'>
            <p className='text-white/60 text-sm font-semibold flex items-center gap-2'><Star size={14} className='text-amber-400' />Critères de ce passage</p>
            {inlineForm === null && (
              <button onClick={() => { setEditingInlineId(null); setInlineForm({ label: '', weight: '1' }); }} className='text-xs bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1'>
                <Plus size={12} />Ajouter
              </button>
            )}
          </div>

          {inlineForm !== null && (
            <form onSubmit={e => { onSaveCriteria(e, { label: inlineForm.label, weight: inlineForm.weight, order: String(passageCriteria.length + 1), passageId: p.id, editingId: editingInlineId }); setInlineForm(null); setEditingInlineId(null); }}
              className='bg-white/5 border border-amber-500/20 rounded-xl p-4 space-y-3'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div className='md:col-span-2'>
                  <label className='block text-white/60 text-xs mb-1'>Libellé *</label>
                  <input type='text' value={inlineForm.label} onChange={e => setInlineForm({ ...inlineForm, label: e.target.value })} className={inp} placeholder='Ex: Élégance' autoFocus />
                </div>
                <div>
                  <label className='block text-white/60 text-xs mb-1'>Coefficient</label>
                  <input type='number' min='0.1' max='10' step='0.1' value={inlineForm.weight} onChange={e => setInlineForm({ ...inlineForm, weight: e.target.value })} className={inp} />
                </div>
              </div>
              <div className='flex gap-2'>
                <button type='submit' className='bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm'><Save size={14} />{editingInlineId ? 'Mettre à jour' : 'Ajouter'}</button>
                <button type='button' onClick={() => { setInlineForm(null); setEditingInlineId(null); }} className='bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm'><X size={14} />Annuler</button>
              </div>
            </form>
          )}

          {passageCriteria.length === 0 && inlineForm === null ? (
            <div className='text-center py-6 border border-dashed border-white/10 rounded-xl'><p className='text-white/20 text-sm'>Aucun critère.</p></div>
          ) : (
            <div className='space-y-2'>
              {passageCriteria.map((cr, idx) => (
                <div key={cr.id} className='flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3'>
                  <span className='text-white/30 text-xs w-5 text-center'>{idx + 1}</span>
                  <div className='flex-1 min-w-0'><p className='text-white font-semibold text-sm'>{cr.label}</p></div>
                  <span className='text-amber-400 font-bold text-sm shrink-0'>×{cr.weight}</span>
                  <span className='text-white/30 text-xs shrink-0'>/10</span>
                  <div className='flex gap-1.5'>
                    <button onClick={() => { setEditingInlineId(cr.id); setInlineForm({ label: cr.label, weight: String(cr.weight) }); }} className='bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-1.5 rounded-lg'><Edit2 size={12} /></button>
                    <button onClick={() => onDeleteCriteria(cr.id)} className='bg-red-500/20 hover:bg-red-500/40 text-red-300 p-1.5 rounded-lg'><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {passageCriteria.length > 0 && (
            <div className='flex items-center justify-between pt-2 border-t border-white/10'>
              <p className='text-white/30 text-xs'>{passageCriteria.length} critère(s) · coeff. total : {passageCriteria.reduce((s, c) => s + c.weight, 0)}</p>
              <p className='text-white/40 text-xs'>Note max : <span className='text-amber-400 font-bold'>10/10</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminBeautyContest() {
  // ── Global state ──────────────────────────────────────────────────────────
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest|null>(null);
  const [activeStage, setActiveStage] = useState<ContestStage>('preselection');
  const [activeTab, setActiveTab] = useState<'contests'|'candidates'|'jury'|'passages'|'scoring'|'results'>('contests');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);

  // Stage-scoped data (reloaded when selectedContest or activeStage changes)
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [passages, setPassages] = useState<Passage[]>([]);
  const [criteria, setCriteria] = useState<ScoringCriteria[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  // Jury is contest-level (shared across stages)
  const [juries, setJuries] = useState<Jury[]>([]);

  // ── Forms ─────────────────────────────────────────────────────────────────
  const [showContestForm, setShowContestForm] = useState(false);
  const [editingContestId, setEditingContestId] = useState<string|null>(null);
  const [contestForm, setContestForm] = useState({ name:'', description:'', date:'', location:'', status:'draft' as Contest['status'], currentStage:'preselection' as ContestStage });

  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string|null>(null);
  const [candidateForm, setCandidateForm] = useState({ name:'', photo:'', bio:'', status:'active' as Candidate['status'] });
  const [formUploading, setFormUploading] = useState(false);
  const [uploadingCandidateId, setUploadingCandidateId] = useState<string|null>(null);
  const rowFileRef = useRef<HTMLInputElement>(null);
  const formFileRef = useRef<HTMLInputElement>(null);
  const pendingRowId = useRef<string|null>(null);
  const [drawing, setDrawing] = useState(false);

  const [showJuryForm, setShowJuryForm] = useState(false);
  const [editingJuryId, setEditingJuryId] = useState<string|null>(null);
  const [juryForm, setJuryForm] = useState({ name:'', role:'', photo:'' });
  const [juryPhotoUploading, setJuryPhotoUploading] = useState(false);
  const juryFileRef = useRef<HTMLInputElement>(null);
  const [newJuryCredentials, setNewJuryCredentials] = useState<{name:string;username:string;password:string}|null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string,boolean>>({});

  const [showPassageForm, setShowPassageForm] = useState(false);
  const [editingPassageId, setEditingPassageId] = useState<string|null>(null);
  const [passageForm, setPassageForm] = useState({ order:'', name:'', description:'' });

  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [editingCriteriaId, setEditingCriteriaId] = useState<string|null>(null);
  const [criteriaForm, setCriteriaForm] = useState({ label:'', weight:'1', order:'', passageId:'' });

  const [scoringJuryId, setScoringJuryId] = useState('');
  const [scoringCandidateId, setScoringCandidateId] = useState('');
  const [scoringPassageId, setScoringPassageId] = useState('');
  const [scoreInputs, setScoreInputs] = useState<Record<string,string>>({});
  const [scoreComment, setScoreComment] = useState('');
  const [savingScore, setSavingScore] = useState(false);

  const showToast = (msg:string, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };
  const cid = selectedContest?.id ?? '';
  const sp = cid ? stagePath(cid, activeStage) : '';
  // ── Firebase listeners ────────────────────────────────────────────────────
  // Load all contests
  useEffect(() => {
    const unsub = onValue(ref(rtdb, RTDB_BASE), (snap:any) => {
      const d = snap.val();
      if (d) {
        const list: Contest[] = Object.entries(d).map(([id,v]:any) => ({ id, ...v }));
        list.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setContests(list);
      } else setContests([]);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Load juries (contest-level, shared)
  useEffect(() => {
    if (!cid) return;
    const unsub = onValue(ref(rtdb, `${RTDB_BASE}/${cid}/juries`), (snap:any) => {
      const d = snap.val();
      setJuries(d ? Object.entries(d).map(([id,v]:any) => ({ id, ...v })) : []);
    });
    return () => unsub();
  }, [cid]);

  // Load stage-scoped data whenever contest or active stage changes
  useEffect(() => {
    if (!cid || !sp) return;
    const u: (()=>void)[] = [];
    u.push(onValue(ref(rtdb, `${sp}/candidates`), (snap:any) => {
      const d = snap.val();
      if (d) {
        const l: Candidate[] = Object.entries(d).map(([id,v]:any) => ({ id, ...v }));
        l.sort((a,b) => a.order - b.order);
        setCandidates(l);
      } else setCandidates([]);
    }));
    u.push(onValue(ref(rtdb, `${sp}/passages`), (snap:any) => {
      const d = snap.val();
      if (d) {
        const l: Passage[] = Object.entries(d).map(([id,v]:any) => ({ id, ...v }));
        l.sort((a,b) => a.order - b.order);
        setPassages(l);
      } else setPassages([]);
    }));
    u.push(onValue(ref(rtdb, `${sp}/criteria`), (snap:any) => {
      const d = snap.val();
      if (d) {
        const l: ScoringCriteria[] = Object.entries(d).map(([id,v]:any) => ({ id, ...v }));
        l.sort((a,b) => a.order - b.order);
        setCriteria(l);
      } else setCriteria([]);
    }));
    u.push(onValue(ref(rtdb, `${sp}/scores`), (snap:any) => {
      const d = snap.val();
      setScores(d ? Object.entries(d).map(([id,v]:any) => ({ id, ...v })) : []);
    }));
    // Reset scoring selectors when stage changes
    setScoringJuryId(''); setScoringCandidateId(''); setScoringPassageId('');
    setScoreInputs({}); setScoreComment('');
    return () => u.forEach(f => f());
  }, [cid, activeStage]);
  // ── Contest CRUD ──────────────────────────────────────────────────────────
  const handleSaveContest = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!contestForm.name) { showToast('Nom requis', false); return; }
    try {
      if (editingContestId) {
        await update(ref(rtdb, `${RTDB_BASE}/${editingContestId}`), contestForm);
        showToast('Concours mis à jour');
      } else {
        const r = push(ref(rtdb, RTDB_BASE));
        await set(r, { ...contestForm, createdAt: new Date().toISOString() });
        showToast('Concours créé');
      }
      setContestForm({ name:'', description:'', date:'', location:'', status:'draft', currentStage:'preselection' });
      setEditingContestId(null); setShowContestForm(false);
    } catch { showToast('Erreur', false); }
  };
  const handleDeleteContest = async (id:string) => {
    if (!confirm('Supprimer ce concours et toutes ses données ?')) return;
    await remove(ref(rtdb, `${RTDB_BASE}/${id}`));
    if (selectedContest?.id === id) setSelectedContest(null);
    showToast('Concours supprimé');
  };
  const handleAdvanceStage = async () => {
    if (!selectedContest) return;
    const next = NEXT_STAGE[selectedContest.currentStage];
    if (!next) { showToast('Déjà en finale', false); return; }
    if (!confirm(`Passer à l'étape "${STAGE_LABELS[next]}" ?`)) return;
    await update(ref(rtdb, `${RTDB_BASE}/${cid}`), { currentStage: next });
    setActiveStage(next);
    showToast(`Étape avancée : ${STAGE_LABELS[next]}`);
  };

  // ── Candidate CRUD (stage-scoped) ─────────────────────────────────────────
  const handleSaveCandidate = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!sp || !candidateForm.name) { showToast('Nom requis', false); return; }
    const payload = { order: candidates.length + 1, name: candidateForm.name, photo: candidateForm.photo, bio: candidateForm.bio, status: candidateForm.status };
    try {
      if (editingCandidateId) {
        await update(ref(rtdb, `${sp}/candidates/${editingCandidateId}`), { name: payload.name, photo: payload.photo, bio: payload.bio, status: payload.status });
        showToast('Candidate mise à jour');
      } else {
        const r = push(ref(rtdb, `${sp}/candidates`));
        await set(r, payload);
        showToast('Candidate ajoutée');
      }
      setCandidateForm({ name:'', photo:'', bio:'', status:'active' });
      setEditingCandidateId(null); setShowCandidateForm(false);
    } catch { showToast('Erreur', false); }
  };
  const handleDeleteCandidate = async (id:string) => {
    if (!sp || !confirm('Supprimer ?')) return;
    await remove(ref(rtdb, `${sp}/candidates/${id}`));
    showToast('Candidate supprimée');
  };
  const handleCandidatePhotoUpload = async (file:File, candidateId?:string) => {
    const err = validateFile(file, 'image'); if (err) { showToast(err, false); return; }
    if (candidateId) {
      setUploadingCandidateId(candidateId);
      try { const url = await uploadToImgbb(file, ''); await update(ref(rtdb, `${sp}/candidates/${candidateId}`), { photo: url }); showToast('Photo mise à jour'); }
      catch { showToast('Erreur upload', false); } finally { setUploadingCandidateId(null); pendingRowId.current = null; }
    } else {
      setFormUploading(true);
      try { const url = await uploadToImgbb(file, ''); setCandidateForm(p => ({ ...p, photo: url })); showToast('Photo uploadée'); }
      catch { showToast('Erreur upload', false); } finally { setFormUploading(false); }
    }
  };
  const handleDraw = async () => {
    if (!sp || candidates.length < 2) return;
    if (!confirm(`Tirage au sort pour ${candidates.length} candidates ?`)) return;
    setDrawing(true);
    try {
      const shuffled = [...candidates];
      for (let i = shuffled.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
      await Promise.all(shuffled.map((c, idx) => update(ref(rtdb, `${sp}/candidates/${c.id}`), { order: idx + 1 })));
      showToast(`🎲 Tirage effectué — ${candidates.length} candidates renumérotées`);
    } catch { showToast('Erreur lors du tirage', false); } finally { setDrawing(false); }
  };
  // Promote candidates to next stage (copy to next stage path, no duplicates)
  const handlePromoteToNextStage = async (selected: Candidate[]) => {
    const next = NEXT_STAGE[activeStage];
    if (!next || !cid) return;
    if (!confirm(`Qualifier ${selected.length} candidate(s) pour ${STAGE_LABELS[next]} ?`)) return;
    const nextPath = stagePath(cid, next);
    // Load existing candidates in next stage to avoid duplicates
    const existingSnap = await get(ref(rtdb, `${nextPath}/candidates`));
    const existingNames = new Set<string>();
    if (existingSnap.exists()) {
      Object.values(existingSnap.val() as Record<string, any>).forEach((v: any) => {
        existingNames.add(v.name?.toLowerCase().trim());
      });
    }
    const toAdd = selected.filter(c => !existingNames.has(c.name?.toLowerCase().trim()));
    const skipped = selected.length - toAdd.length;
    if (toAdd.length === 0) {
      showToast(`Toutes ces candidates sont déjà en ${STAGE_LABELS[next]}`, false);
      return;
    }
    await Promise.all(toAdd.map((c, idx) => {
      const r = push(ref(rtdb, `${nextPath}/candidates`));
      return set(r, { order: idx + 1, name: c.name, photo: c.photo, bio: c.bio, status: 'active' });
    }));
    setSelectedCandidates(new Set());
    showToast(`${toAdd.length} qualifiée(s) pour ${STAGE_LABELS[next]}${skipped > 0 ? ` · ${skipped} déjà présente(s)` : ''}`);
  };

  // Import candidates from a previous stage into the current stage
  const [importingFromStage, setImportingFromStage] = useState(false);
  const [prevStageCandidates, setPrevStageCandidates] = useState<Candidate[]>([]);
  const [selectedImports, setSelectedImports] = useState<Set<string>>(new Set());
  const [showImportPanel, setShowImportPanel] = useState(false);

  const loadPrevStageCandidates = async () => {
    const stageIdx = STAGE_ORDER.indexOf(activeStage);
    if (stageIdx === 0 || !cid) return;
    const prevStage = STAGE_ORDER[stageIdx - 1];
    const prevPath = stagePath(cid, prevStage);
    const snap = await get(ref(rtdb, `${prevPath}/candidates`));
    if (snap.exists()) {
      const list: Candidate[] = Object.entries(snap.val() as Record<string, any>)
        .map(([id, v]: any) => ({ id, ...v }))
        .sort((a, b) => a.order - b.order);
      // Filter out already imported (by name)
      const existingNames = new Set(candidates.map(c => c.name?.toLowerCase().trim()));
      setPrevStageCandidates(list.filter(c => !existingNames.has(c.name?.toLowerCase().trim())));
    } else {
      setPrevStageCandidates([]);
    }
    setSelectedImports(new Set());
    setShowImportPanel(true);
  };

  const handleImportFromPrevStage = async () => {
    if (!cid || selectedImports.size === 0) return;
    setImportingFromStage(true);
    try {
      const toImport = prevStageCandidates.filter(c => selectedImports.has(c.id));
      await Promise.all(toImport.map((c, idx) => {
        const r = push(ref(rtdb, `${sp}/candidates`));
        return set(r, { order: candidates.length + idx + 1, name: c.name, photo: c.photo, bio: c.bio, status: 'active' });
      }));
      showToast(`${toImport.length} candidate(s) importée(s) dans ${STAGE_LABELS[activeStage]}`);
      setShowImportPanel(false);
      setSelectedImports(new Set());
    } catch { showToast('Erreur lors de l\'import', false); }
    finally { setImportingFromStage(false); }
  };

  // Import passages from previous stage
  const [importingPassages, setImportingPassages] = useState(false);
  const [prevStagePassages, setPrevStagePassages] = useState<Passage[]>([]);
  const [selectedPassageImports, setSelectedPassageImports] = useState<Set<string>>(new Set());
  const [showPassageImportPanel, setShowPassageImportPanel] = useState(false);

  const loadPrevStagePassages = async () => {
    const stageIdx = STAGE_ORDER.indexOf(activeStage);
    if (stageIdx === 0 || !cid) return;
    const prevStage = STAGE_ORDER[stageIdx - 1];
    const snap = await get(ref(rtdb, `${stagePath(cid, prevStage)}/passages`));
    if (snap.exists()) {
      const list: Passage[] = Object.entries(snap.val() as Record<string, any>)
        .map(([id, v]: any) => ({ id, ...v }))
        .sort((a, b) => a.order - b.order);
      const existingNames = new Set(passages.map(p => p.name?.toLowerCase().trim()));
      setPrevStagePassages(list.filter(p => !existingNames.has(p.name?.toLowerCase().trim())));
    } else {
      setPrevStagePassages([]);
    }
    setSelectedPassageImports(new Set());
    setShowPassageImportPanel(true);
  };

  const handleImportPassages = async () => {
    if (!cid || selectedPassageImports.size === 0) return;
    setImportingPassages(true);
    try {
      const toImport = prevStagePassages.filter(p => selectedPassageImports.has(p.id));
      await Promise.all(toImport.map((p, idx) => {
        const r = push(ref(rtdb, `${sp}/passages`));
        return set(r, { order: passages.length + idx + 1, name: p.name, description: p.description });
      }));
      showToast(`${toImport.length} passage(s) importé(s) dans ${STAGE_LABELS[activeStage]}`);
      setShowPassageImportPanel(false);
      setSelectedPassageImports(new Set());
    } catch { showToast('Erreur lors de l\'import', false); }
    finally { setImportingPassages(false); }
  };

  // Import criteria from previous stage
  const [importingCriteria, setImportingCriteria] = useState(false);
  const [prevStageCriteria, setPrevStageCriteria] = useState<ScoringCriteria[]>([]);
  const [selectedCriteriaImports, setSelectedCriteriaImports] = useState<Set<string>>(new Set());
  const [showCriteriaImportPanel, setShowCriteriaImportPanel] = useState(false);

  const loadPrevStageCriteria = async () => {
    const stageIdx = STAGE_ORDER.indexOf(activeStage);
    if (stageIdx === 0 || !cid) return;
    const prevStage = STAGE_ORDER[stageIdx - 1];
    const snap = await get(ref(rtdb, `${stagePath(cid, prevStage)}/criteria`));
    if (snap.exists()) {
      const list: ScoringCriteria[] = Object.entries(snap.val() as Record<string, any>)
        .map(([id, v]: any) => ({ id, ...v }))
        .sort((a, b) => a.order - b.order);
      const existingLabels = new Set(criteria.map(c => c.label?.toLowerCase().trim()));
      setPrevStageCriteria(list.filter(c => !existingLabels.has(c.label?.toLowerCase().trim())));
    } else {
      setPrevStageCriteria([]);
    }
    setSelectedCriteriaImports(new Set());
    setShowCriteriaImportPanel(true);
  };

  const handleImportCriteria = async () => {
    if (!cid || selectedCriteriaImports.size === 0) return;
    setImportingCriteria(true);
    try {
      const toImport = prevStageCriteria.filter(c => selectedCriteriaImports.has(c.id));
      await Promise.all(toImport.map((c, idx) => {
        const r = push(ref(rtdb, `${sp}/criteria`));
        return set(r, { label: c.label, weight: c.weight, order: criteria.length + idx + 1, passageId: null });
      }));
      showToast(`${toImport.length} critère(s) importé(s) dans ${STAGE_LABELS[activeStage]}`);
      setShowCriteriaImportPanel(false);
      setSelectedCriteriaImports(new Set());
    } catch { showToast('Erreur lors de l\'import', false); }
    finally { setImportingCriteria(false); }
  };
  // ── Jury CRUD (contest-level) ─────────────────────────────────────────────
  const genUsername = (name:string) => name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/s+/g,'.').replace(/[^a-z0-9.]/g,'') + '.' + cid.slice(-4);
  const genPassword = () => { const c='ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'; return Array.from({length:8},()=>c[Math.floor(Math.random()*c.length)]).join(''); };
  const handleSaveJury = async (e:React.FormEvent) => {
    e.preventDefault(); if (!cid || !juryForm.name) { showToast('Nom requis', false); return; }
    try {
      if (editingJuryId) {
        await update(ref(rtdb, `${RTDB_BASE}/${cid}/juries/${editingJuryId}`), { name: juryForm.name, role: juryForm.role, photo: juryForm.photo });
        showToast('Jury mis à jour');
      } else {
        const username = genUsername(juryForm.name); const password = genPassword();
        const r = push(ref(rtdb, `${RTDB_BASE}/${cid}/juries`));
        await set(r, { name: juryForm.name, role: juryForm.role, photo: juryForm.photo, username, password, createdAt: new Date().toISOString() });
        setNewJuryCredentials({ name: juryForm.name, username, password });
        showToast('Jury ajouté · identifiants générés');
      }
      setJuryForm({ name:'', role:'', photo:'' }); setEditingJuryId(null); setShowJuryForm(false);
    } catch { showToast('Erreur', false); }
  };
  const handleDeleteJury = async (id:string) => {
    if (!cid || !confirm('Supprimer ce jury ?')) return;
    await remove(ref(rtdb, `${RTDB_BASE}/${cid}/juries/${id}`)); showToast('Jury supprimé');
  };
  const handleJuryPhotoUpload = async (file:File) => {
    const err = validateFile(file, 'image'); if (err) { showToast(err, false); return; }
    setJuryPhotoUploading(true);
    try { const url = await uploadToImgbb(file, ''); setJuryForm(p => ({ ...p, photo: url })); showToast('Photo uploadée'); }
    catch { showToast('Erreur upload', false); } finally { setJuryPhotoUploading(false); }
  };

  // ── Passage CRUD (stage-scoped) ───────────────────────────────────────────
  const handleSavePassage = async (e:React.FormEvent) => {
    e.preventDefault(); if (!sp || !passageForm.name) { showToast('Nom requis', false); return; }
    const payload = { order: parseInt(passageForm.order) || passages.length + 1, name: passageForm.name, description: passageForm.description };
    try {
      if (editingPassageId) { await update(ref(rtdb, `${sp}/passages/${editingPassageId}`), payload); showToast('Passage mis à jour'); }
      else { const r = push(ref(rtdb, `${sp}/passages`)); await set(r, payload); showToast('Passage ajouté'); }
      setPassageForm({ order:'', name:'', description:'' }); setEditingPassageId(null); setShowPassageForm(false);
    } catch { showToast('Erreur', false); }
  };
  const handleDeletePassage = async (id:string) => {
    if (!sp || !confirm('Supprimer ce passage ?')) return;
    await remove(ref(rtdb, `${sp}/passages/${id}`)); showToast('Passage supprimé');
  };

  // ── Criteria CRUD (stage-scoped) ──────────────────────────────────────────
  const handleSaveCriteria = async (e:React.FormEvent, override?:{label:string;weight:string;order:string;passageId:string;editingId?:string|null}) => {
    e.preventDefault();
    const data = override ?? criteriaForm;
    const resolvedId = override !== undefined ? (override.editingId ?? null) : editingCriteriaId;
    if (!sp || !data.label) { showToast('Libellé requis', false); return; }
    const payload = { label: data.label, weight: parseFloat(data.weight)||1, order: parseInt(data.order)||criteria.length+1, passageId: data.passageId||null };
    try {
      if (resolvedId) { await update(ref(rtdb, `${sp}/criteria/${resolvedId}`), payload); showToast('Critère mis à jour'); }
      else { const r = push(ref(rtdb, `${sp}/criteria`)); await set(r, payload); showToast('Critère ajouté'); }
      setCriteriaForm({ label:'', weight:'1', order:'', passageId:'' }); setEditingCriteriaId(null); setShowCriteriaForm(false);
    } catch { showToast('Erreur', false); }
  };
  const handleDeleteCriteria = async (id:string) => {
    if (!sp || !confirm('Supprimer ce critère ?')) return;
    await remove(ref(rtdb, `${sp}/criteria/${id}`)); showToast('Critère supprimé');
  };

  // ── Scoring (stage-scoped) ────────────────────────────────────────────────
  const getScore = (juryId:string, candidateId:string, passageId:string) =>
    scores.find(s => s.juryId===juryId && s.candidateId===candidateId && s.passageId===passageId);
  const criteriaForPassage = (passageId:string) =>
    criteria.filter(c => !c.passageId || c.passageId===passageId);
  const handleSaveScore = async () => {
    if (!sp || !scoringJuryId || !scoringCandidateId || !scoringPassageId) return;
    const crits = criteriaForPassage(scoringPassageId);
    const scoresMap: Record<string,number> = {};
    crits.forEach(cr => { scoresMap[cr.id] = Math.min(10, Math.max(0, parseFloat(scoreInputs[cr.id]||'0'))); });
    setSavingScore(true);
    try {
      const payload = { juryId: scoringJuryId, candidateId: scoringCandidateId, passageId: scoringPassageId, scores: scoresMap, comment: scoreComment, submittedAt: new Date().toISOString() };
      const ex = getScore(scoringJuryId, scoringCandidateId, scoringPassageId);
      if (ex) await update(ref(rtdb, `${sp}/scores/${ex.id}`), payload);
      else { const r = push(ref(rtdb, `${sp}/scores`)); await set(r, payload); }
      showToast('Notes enregistrées');
      setScoringJuryId(''); setScoringCandidateId(''); setScoringPassageId(''); setScoreInputs({}); setScoreComment('');
    } catch { showToast('Erreur', false); } finally { setSavingScore(false); }
  };

  // ── Results ───────────────────────────────────────────────────────────────
  const computeResults = () => {
    const totalWeight = criteria.reduce((s,c) => s+c.weight, 0) || 1;
    return candidates.map(candidate => {
      let grandTotal = 0; let grandCount = 0;
      const byPassage: Record<string,number> = {};
      passages.forEach(p => {
        const crits = criteriaForPassage(p.id);
        const tw = crits.reduce((s,c) => s+c.weight, 0) || 1;
        const ps = scores.filter(s => s.candidateId===candidate.id && s.passageId===p.id);
        if (!ps.length) return;
        const avg = ps.map(s => crits.reduce((sum,cr) => sum+(s.scores[cr.id]??0)*cr.weight, 0)/tw).reduce((a,b)=>a+b,0)/ps.length;
        byPassage[p.id] = avg; grandTotal += avg; grandCount++;
      });
      if (passages.length === 0) {
        const cs = scores.filter(s => s.candidateId===candidate.id);
        if (cs.length) { grandTotal = cs.map(s => criteria.reduce((sum,cr)=>sum+(s.scores[cr.id]??0)*cr.weight,0)/totalWeight).reduce((a,b)=>a+b,0)/cs.length; grandCount=1; }
      }
      return { candidate, average: grandCount>0 ? grandTotal/grandCount : 0, byPassage };
    }).sort((a,b) => b.average - a.average);
  };
  // ── Helpers ───────────────────────────────────────────────────────────────
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const toggleSelect = (id:string) => setSelectedCandidates(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });
  const selectAll = () => setSelectedCandidates(candidates.length===selectedCandidates.size ? new Set() : new Set(candidates.map(c=>c.id)));

  const statusLabel: Record<string,string> = { draft:'Brouillon', active:'Actif', closed:'Clôturé' };
  const statusColor: Record<string,string> = { draft:'bg-gray-500/20 text-gray-400', active:'bg-green-500/20 text-green-300', closed:'bg-red-500/20 text-red-300' };
  const cStatusLabel: Record<string,string> = { active:'Active', hidden:'Masquée', winner:'Gagnante' };
  const cStatusColor: Record<string,string> = { active:'bg-green-500/20 text-green-300', hidden:'bg-gray-500/20 text-gray-400', winner:'bg-yellow-500/20 text-yellow-300' };
  const inp = 'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-pink-500';
  const btnP = 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition-all';
  const btnS = 'bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-all text-sm';

  if (loading) return <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center'><img src="/logo.svg" alt="PMM" className="w-24 h-24 animate-pulse" /></div>;

  // ── Stage selector bar (shown when a contest is selected) ─────────────────
  const StageSelectorBar = () => (
    <div className='flex items-center gap-2 mb-6 p-3 bg-white/5 border border-white/10 rounded-2xl overflow-x-auto no-scrollbar'>
      <span className='text-white/30 text-xs uppercase tracking-widest shrink-0 mr-1'>Étape :</span>
      {STAGE_ORDER.map((stage, i) => {
        const isCurrent = stage === selectedContest!.currentStage;
        const isActive = stage === activeStage;
        const stageIdx = STAGE_ORDER.indexOf(selectedContest!.currentStage);
        const isPast = i < stageIdx;
        return (
          <div key={stage} className='flex items-center gap-2 shrink-0'>
            <button
              onClick={() => setActiveStage(stage)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
                isActive
                  ? STAGE_COLORS[stage] + ' ring-2 ring-offset-1 ring-offset-slate-900'
                  : isPast
                  ? 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                  : 'bg-white/5 border-white/10 text-white/20 hover:border-white/20'
              }`}
            >
              {isCurrent && <span className='w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse'/>}
              {STAGE_LABELS[stage]}
              {isCurrent && <span className='text-[9px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-black'>En cours</span>}
            </button>
            {i < STAGE_ORDER.length - 1 && <ChevronRight size={14} className='text-white/20'/>}
          </div>
        );
      })}
      {NEXT_STAGE[selectedContest!.currentStage] && (
        <button onClick={handleAdvanceStage} className='ml-auto shrink-0 bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 border border-orange-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all'>
          <ChevronRight size={12}/>Avancer vers {STAGE_LABELS[NEXT_STAGE[selectedContest!.currentStage]!]}
        </button>
      )}
    </div>
  );
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6'>
      <div className='max-w-6xl mx-auto'>
        {toast && <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-white shadow-xl ${toast.ok?'bg-green-600':'bg-red-600'}`}>{toast.msg}</div>}

        {/* Header */}
        <div className='flex flex-wrap items-center justify-between gap-4 mb-8'>
          <div>
            <h1 className='text-4xl font-bold text-white'>Concours de Beauté</h1>
            <p className='text-white/40 text-sm mt-1'>
              {selectedContest ? <><span className='text-white/60'>{selectedContest.name}</span> · <span className={`font-bold ${STAGE_COLORS[activeStage].split(' ')[1]}`}>{STAGE_LABELS[activeStage]}</span></> : 'Gestion des concours'}
            </p>
          </div>
          <div className='flex gap-2 flex-wrap'>
            {activeTab==='contests' && <button onClick={()=>{setShowContestForm(true);setEditingContestId(null);setContestForm({name:'',description:'',date:'',location:'',status:'draft',currentStage:'preselection'});}} className={btnP}><Plus size={18}/>Nouveau concours</button>}
            {selectedContest && activeTab==='candidates' && <button onClick={()=>{setShowCandidateForm(true);setEditingCandidateId(null);setCandidateForm({name:'',photo:'',bio:'',status:'active'});}} className={btnP}><Plus size={18}/>Ajouter candidate</button>}
            {selectedContest && activeTab==='jury' && <button onClick={()=>{setShowJuryForm(true);setEditingJuryId(null);setJuryForm({name:'',role:'',photo:''});}} className={btnP}><Plus size={18}/>Ajouter jury</button>}
            {selectedContest && activeTab==='passages' && <button onClick={()=>{setShowPassageForm(true);setEditingPassageId(null);setPassageForm({order:'',name:'',description:''});}} className={btnP}><Plus size={18}/>Ajouter passage</button>}
            {selectedContest && activeTab==='scoring' && <button onClick={()=>{setShowCriteriaForm(true);setEditingCriteriaId(null);setCriteriaForm({label:'',weight:'1',order:'',passageId:''});}} className={btnP}><Plus size={18}/>Ajouter critère</button>}
          </div>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-6 flex-wrap'>
          <button onClick={()=>{setSelectedContest(null);setActiveTab('contests');}} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab==='contests'&&!selectedContest?'bg-pink-500 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}><Award size={14}/>Concours ({contests.length})</button>
          {selectedContest && <>
            <button onClick={()=>setActiveTab('candidates')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab==='candidates'?'bg-purple-500 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}><Users size={14}/>Candidates ({candidates.length})</button>
            <button onClick={()=>setActiveTab('jury')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab==='jury'?'bg-blue-500 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}><Users size={14}/>Jury ({juries.length})</button>
            <button onClick={()=>setActiveTab('passages')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab==='passages'?'bg-teal-500 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}><Layers size={14}/>Passages ({passages.length})</button>
            <button onClick={()=>setActiveTab('scoring')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab==='scoring'?'bg-amber-500 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}><Star size={14}/>Notation</button>
            <button onClick={()=>setActiveTab('results')} className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab==='results'?'bg-emerald-500 text-white':'bg-white/10 text-white/60 hover:bg-white/20'}`}><ChevronUp size={14}/>Résultats</button>
          </>}
        </div>

        {/* Stage selector — shown on all tabs except contests */}
        {selectedContest && activeTab !== 'contests' && activeTab !== 'jury' && <StageSelectorBar/>}
        {/* ── CONTESTS TAB ── */}
        {(activeTab==='contests' || !selectedContest) && (
          <div className='space-y-6'>
            {showContestForm && (
              <div className='bg-white/10 border border-white/20 rounded-2xl p-6'>
                <h2 className='text-xl font-bold text-white mb-5'>{editingContestId?'Modifier le concours':'Nouveau concours'}</h2>
                <form onSubmit={handleSaveContest} className='space-y-5'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div><label className='block text-white/70 text-sm mb-1'>Nom *</label><input type='text' value={contestForm.name} onChange={e=>setContestForm({...contestForm,name:e.target.value})} className={inp} placeholder='Miss One Light 2026' autoFocus/></div>
                    <div><label className='block text-white/70 text-sm mb-1'>Date</label><input type='date' value={contestForm.date} onChange={e=>setContestForm({...contestForm,date:e.target.value})} className={inp}/></div>
                    <div><label className='block text-white/70 text-sm mb-1'>Lieu</label><input type='text' value={contestForm.location} onChange={e=>setContestForm({...contestForm,location:e.target.value})} className={inp} placeholder='Libreville, Gabon'/></div>
                    <div><label className='block text-white/70 text-sm mb-1'>Statut</label><select value={contestForm.status} onChange={e=>setContestForm({...contestForm,status:e.target.value as Contest['status']})} className='w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none'><option value='draft'>Brouillon</option><option value='active'>Actif</option><option value='closed'>Clôturé</option></select></div>
                  </div>
                  <div><label className='block text-white/70 text-sm mb-1'>Description</label><textarea value={contestForm.description} onChange={e=>setContestForm({...contestForm,description:e.target.value})} rows={2} className={inp+' resize-none'} placeholder='Description...'/></div>
                  <div className='border border-white/10 rounded-xl p-4 space-y-3 bg-white/5'>
                    <p className='text-white/60 text-xs font-bold uppercase tracking-widest flex items-center gap-2'><Flag size={12} className='text-orange-400'/>Étape actuelle</p>
                    <div className='flex items-center gap-2'>
                      {STAGE_ORDER.map((stage,i) => (
                        <div key={stage} className='flex items-center gap-2 flex-1'>
                          <button type='button' onClick={()=>setContestForm({...contestForm,currentStage:stage})} className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition-all border text-center ${contestForm.currentStage===stage?STAGE_COLORS[stage]+' ring-2 ring-offset-1 ring-offset-slate-900':'bg-white/5 border-white/10 text-white/30 hover:border-white/20'}`}>{STAGE_LABELS[stage]}</button>
                          {i<STAGE_ORDER.length-1&&<ChevronRight size={14} className='text-white/20 shrink-0'/>}
                        </div>
                      ))}
                    </div>
                    <p className='text-white/30 text-xs'>{contestForm.currentStage==='preselection'?'Présélections en cours.':contestForm.currentStage==='semifinal'?'Demi-finale en cours.':'Grande finale.'}</p>
                  </div>
                  <div className='flex gap-3'><button type='submit' className={btnP}><Save size={16}/>{editingContestId?'Mettre à jour':'Créer'}</button><button type='button' onClick={()=>{setShowContestForm(false);setEditingContestId(null);}} className='bg-gray-500/30 hover:bg-gray-500/50 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2'><X size={16}/>Annuler</button></div>
                </form>
              </div>
            )}
            {contests.length===0&&!showContestForm&&<div className='text-center py-20 border border-white/10 rounded-2xl'><Award size={48} className='text-white/20 mx-auto mb-4'/><p className='text-white/40'>Aucun concours.</p></div>}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {contests.map(c => {
                const stage = (c.currentStage||'preselection') as ContestStage;
                const stageIdx = STAGE_ORDER.indexOf(stage);
                return (
                  <div key={c.id} className={`bg-white/10 border rounded-2xl overflow-hidden transition-all hover:border-pink-500/40 ${selectedContest?.id===c.id?'border-pink-500/60 ring-2 ring-pink-500/20':'border-white/20'}`}>
                    <div className='px-5 pt-4 pb-3 border-b border-white/10'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${STAGE_COLORS[stage]}`}>{STAGE_LABELS[stage]}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[c.status]}`}>{statusLabel[c.status]}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        {STAGE_ORDER.map((s,i) => (
                          <div key={s} className='flex items-center gap-1 flex-1'>
                            <div className={`h-1.5 flex-1 rounded-full ${i<=stageIdx?(s===stage?'bg-orange-400':'bg-white/40'):'bg-white/10'}`}/>
                            {i<STAGE_ORDER.length-1&&<div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i<stageIdx?'bg-white/40':'bg-white/10'}`}/>}
                          </div>
                        ))}
                      </div>
                      <div className='flex justify-between mt-1'>{STAGE_ORDER.map((s,i)=>(<span key={s} className={`text-[9px] font-semibold ${i<=stageIdx?(s===stage?'text-orange-400':'text-white/40'):'text-white/15'}`}>{STAGE_LABELS[s]}</span>))}</div>
                    </div>
                    <div className='p-5 space-y-3'>
                      <div><h3 className='text-white font-bold truncate'>{c.name}</h3><p className='text-white/40 text-xs mt-0.5'>{c.date} · {c.location}</p></div>
                      {c.description&&<p className='text-white/50 text-sm line-clamp-2'>{c.description}</p>}
                      <div className='flex gap-2 pt-1'>
                        <button onClick={()=>{setSelectedContest(c);setActiveStage(c.currentStage||'preselection');setActiveTab('candidates');}} className='flex-1 bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-1'><Users size={14}/>Gérer</button>
                        <button onClick={()=>{setContestForm({name:c.name,description:c.description,date:c.date,location:c.location,status:c.status,currentStage:stage});setEditingContestId(c.id);setShowContestForm(true);}} className='bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded-xl'><Edit2 size={16}/></button>
                        <button onClick={()=>handleDeleteContest(c.id)} className='bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded-xl'><Trash2 size={16}/></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ── CANDIDATES TAB ── */}
        {activeTab==='candidates' && selectedContest && (
          <div className='space-y-6'>
            {showCandidateForm && (
              <div className='bg-white/10 border border-white/20 rounded-2xl p-6'>
                <h2 className='text-xl font-bold text-white mb-1'>{editingCandidateId?'Modifier':'Nouvelle candidate'}</h2>
                <p className='text-white/30 text-xs mb-5 flex items-center gap-1'><Flag size={10}/>{STAGE_LABELS[activeStage]}</p>
                <form onSubmit={handleSaveCandidate} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div><label className='block text-white/70 text-sm mb-1'>Nom *</label><input type='text' value={candidateForm.name} onChange={e=>setCandidateForm({...candidateForm,name:e.target.value})} className={inp} placeholder='LÉONCIA' autoFocus/></div>
                    <div><label className='block text-white/70 text-sm mb-1'>Statut</label><select value={candidateForm.status} onChange={e=>setCandidateForm({...candidateForm,status:e.target.value as Candidate['status']})} className='w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none'><option value='active'>Active</option><option value='hidden'>Masquée</option><option value='winner'>Gagnante</option></select></div>
                    <div className='md:col-span-2'><label className='block text-white/70 text-sm mb-1'>Photo</label><div className='flex gap-2'><input type='url' value={candidateForm.photo} onChange={e=>setCandidateForm({...candidateForm,photo:e.target.value})} className={inp} placeholder='https://...'/><button type='button' onClick={()=>formFileRef.current?.click()} disabled={formUploading} className={btnS+' shrink-0'}><Upload size={14}/>{formUploading?'...':'Upload'}</button></div>{candidateForm.photo&&<img src={candidateForm.photo} alt='' className='h-20 w-20 object-cover rounded-lg mt-2'/>}</div>
                  </div>
                  <div><label className='block text-white/70 text-sm mb-1'>Biographie</label><textarea value={candidateForm.bio} onChange={e=>setCandidateForm({...candidateForm,bio:e.target.value})} rows={2} className={inp+' resize-none'} placeholder='Quelques mots...'/></div>
                  <div className='flex gap-3'><button type='submit' className={btnP}><Save size={16}/>{editingCandidateId?'Mettre à jour':'Ajouter'}</button><button type='button' onClick={()=>{setShowCandidateForm(false);setEditingCandidateId(null);}} className='bg-gray-500/30 hover:bg-gray-500/50 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2'><X size={16}/>Annuler</button></div>
                </form>
              </div>
            )}
            <input ref={formFileRef} type='file' accept='image/*' className='hidden' onChange={e=>{if(e.target.files?.[0])handleCandidatePhotoUpload(e.target.files[0]);e.target.value='';}}/>
            <input ref={rowFileRef} type='file' accept='image/*' className='hidden' onChange={e=>{if(e.target.files?.[0]&&pendingRowId.current)handleCandidatePhotoUpload(e.target.files[0],pendingRowId.current);e.target.value='';}}/>

            {/* Import depuis étape précédente */}
            {STAGE_ORDER.indexOf(activeStage) > 0 && (
              <div>
                {!showImportPanel ? (
                  <button
                    onClick={loadPrevStageCandidates}
                    className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-bold transition-all'
                  >
                    <Users size={14}/>
                    Importer depuis {STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(activeStage) - 1]]}
                  </button>
                ) : (
                  <div className='bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5 space-y-4'>
                    <div className='flex items-center justify-between'>
                      <p className='text-blue-300 font-bold text-sm flex items-center gap-2'>
                        <Users size={14}/>
                        Candidates de {STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(activeStage) - 1]]} disponibles
                      </p>
                      <button onClick={() => setShowImportPanel(false)} className='text-white/30 hover:text-white'><X size={16}/></button>
                    </div>
                    {prevStageCandidates.length === 0 ? (
                      <p className='text-white/30 text-sm text-center py-4'>
                        Toutes les candidates sont déjà dans cette étape, ou aucune candidate dans l&apos;étape précédente.
                      </p>
                    ) : (
                      <>
                        <div className='flex items-center justify-between'>
                          <button
                            onClick={() => setSelectedImports(
                              selectedImports.size === prevStageCandidates.length
                                ? new Set()
                                : new Set(prevStageCandidates.map(c => c.id))
                            )}
                            className='text-xs text-blue-300 hover:text-white transition-colors'
                          >
                            {selectedImports.size === prevStageCandidates.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                          </button>
                          <span className='text-white/30 text-xs'>{prevStageCandidates.length} disponible(s)</span>
                        </div>
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto'>
                          {prevStageCandidates.map(c => (
                            <button
                              key={c.id}
                              onClick={() => setSelectedImports(prev => {
                                const s = new Set(prev);
                                s.has(c.id) ? s.delete(c.id) : s.add(c.id);
                                return s;
                              })}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                                selectedImports.has(c.id)
                                  ? 'bg-blue-500/20 border-blue-500/50'
                                  : 'bg-white/5 border-white/10 hover:border-blue-500/30'
                              }`}
                            >
                              {c.photo
                                ? <img src={c.photo} alt={c.name} className='h-9 w-9 object-cover rounded-lg shrink-0'/>
                                : <div className='h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center text-white/30 font-bold shrink-0'>{c.name[0]}</div>
                              }
                              <div className='flex-1 min-w-0'>
                                <p className='text-white text-sm font-semibold truncate'>{c.name}</p>
                                <p className='text-white/30 text-xs'>Passage #{c.order || '?'}</p>
                              </div>
                              {selectedImports.has(c.id) && <CheckCircle size={16} className='text-blue-400 shrink-0'/>}
                            </button>
                          ))}
                        </div>
                        <div className='flex gap-3 pt-2 border-t border-white/10'>
                          <button
                            onClick={handleImportFromPrevStage}
                            disabled={selectedImports.size === 0 || importingFromStage}
                            className='flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all'
                          >
                            {importingFromStage
                              ? <span className='loading loading-spinner loading-sm'/>
                              : <CheckCircle size={16}/>
                            }
                            Importer {selectedImports.size > 0 ? `(${selectedImports.size})` : ''} dans {STAGE_LABELS[activeStage]}
                          </button>
                          <button onClick={() => setShowImportPanel(false)} className='px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all'>
                            Annuler
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tirage au sort */}
            {candidates.length >= 2 && (
              <div className='flex items-center justify-between gap-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl'>
                <div><p className='text-white font-semibold text-sm'>Tirage au sort</p><p className='text-white/40 text-xs mt-0.5'>Attribue les numéros de passage 1→{candidates.length} pour la {STAGE_LABELS[activeStage]}</p></div>
                <button onClick={handleDraw} disabled={drawing} className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl flex items-center gap-2 shrink-0'>
                  {drawing?<span className='loading loading-spinner loading-sm'/>:<Shuffle size={16}/>}{drawing?'Tirage...':'Lancer le tirage'}
                </button>
              </div>
            )}

            {/* Promote to next stage */}
            {NEXT_STAGE[activeStage] && selectedCandidates.size > 0 && (
              <div className='flex items-center justify-between gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-2xl'>
                <p className='text-white/70 text-sm'><span className='text-green-300 font-bold'>{selectedCandidates.size}</span> candidate(s) sélectionnée(s)</p>
                <button onClick={()=>handlePromoteToNextStage(candidates.filter(c=>selectedCandidates.has(c.id)))} className='bg-green-500/20 hover:bg-green-500/40 text-green-300 border border-green-500/30 font-bold py-2 px-4 rounded-xl text-sm flex items-center gap-2'>
                  <CheckCircle size={14}/>Qualifier pour {STAGE_LABELS[NEXT_STAGE[activeStage]!]}
                </button>
              </div>
            )}

            <div className='bg-white/10 border border-white/20 rounded-2xl overflow-hidden'>
              <div className='overflow-x-auto'><table className='w-full'>
                <thead><tr className='border-b border-white/10 bg-white/5'>
                  {NEXT_STAGE[activeStage]&&<th className='px-4 py-3 w-10'><input type='checkbox' checked={candidates.length>0&&selectedCandidates.size===candidates.length} onChange={selectAll} className='rounded accent-pink-500'/></th>}
                  <th className='px-4 py-3 text-left text-white/70 text-sm w-12'>N°</th>
                  <th className='px-4 py-3 text-left text-white/70 text-sm'>Photo</th>
                  <th className='px-4 py-3 text-left text-white/70 text-sm'>Nom</th>
                  <th className='px-4 py-3 text-left text-white/70 text-sm'>Bio</th>
                  <th className='px-4 py-3 text-left text-white/70 text-sm'>Statut</th>
                  <th className='px-4 py-3 text-left text-white/70 text-sm'>Actions</th>
                </tr></thead>
                <tbody>
                  {candidates.map(c=>(
                    <tr key={c.id} className='border-b border-white/10 hover:bg-white/5'>
                      {NEXT_STAGE[activeStage]&&<td className='px-4 py-3'><input type='checkbox' checked={selectedCandidates.has(c.id)} onChange={()=>toggleSelect(c.id)} className='rounded accent-pink-500'/></td>}
                      <td className='px-4 py-3'><span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-black ${c.order?'bg-purple-500/20 text-purple-300':'bg-white/10 text-white/20'}`}>{c.order||'—'}</span></td>
                      <td className='px-4 py-3'><div className='flex items-center gap-2'>{c.photo?<img src={c.photo} alt={c.name} className='h-10 w-10 object-cover rounded-lg'/>:<div className='h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white/30'>—</div>}<button onClick={()=>{pendingRowId.current=c.id;rowFileRef.current?.click();}} disabled={uploadingCandidateId===c.id} className='bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white/60 p-1.5 rounded-lg'><Upload size={14}/></button></div></td>
                      <td className='px-4 py-3 text-white font-semibold'>{c.name}</td>
                      <td className='px-4 py-3 text-white/50 text-sm max-w-xs truncate'>{c.bio||'—'}</td>
                      <td className='px-4 py-3'><span className={`text-xs font-semibold px-2 py-1 rounded-full ${cStatusColor[c.status]}`}>{cStatusLabel[c.status]}</span></td>
                      <td className='px-4 py-3'><div className='flex gap-2'><button onClick={()=>{setCandidateForm({name:c.name,photo:c.photo,bio:c.bio,status:c.status});setEditingCandidateId(c.id);setShowCandidateForm(true);}} className='bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded-lg'><Edit2 size={16}/></button><button onClick={()=>handleDeleteCandidate(c.id)} className='bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded-lg'><Trash2 size={16}/></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
              {candidates.length===0&&<div className='text-center py-12 text-white/30'>Aucune candidate pour la {STAGE_LABELS[activeStage]}.</div>}
            </div>
            <div className='grid grid-cols-3 gap-4'>
              <div className='bg-white/10 border border-white/20 rounded-2xl p-5'><p className='text-white/40 text-sm mb-1'>Total {STAGE_LABELS[activeStage]}</p><p className='text-3xl font-bold text-white'>{candidates.length}</p></div>
              <div className='bg-white/10 border border-white/20 rounded-2xl p-5'><p className='text-white/40 text-sm mb-1'>Actives</p><p className='text-3xl font-bold text-green-400'>{candidates.filter(c=>c.status==='active').length}</p></div>
              <div className='bg-white/10 border border-white/20 rounded-2xl p-5'><p className='text-white/40 text-sm mb-1'>Gagnante</p><p className='text-xl font-bold text-yellow-400'>{candidates.find(c=>c.status==='winner')?.name||'—'}</p></div>
            </div>
          </div>
        )}
        {/* ── JURY TAB (contest-level, no stage filter) ── */}
        {activeTab==='jury' && selectedContest && (
          <div className='space-y-6'>
            <div className='flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs'><Users size={12}/>Le jury est partagé entre toutes les étapes du concours.</div>
            {showJuryForm && (
              <div className='bg-white/10 border border-white/20 rounded-2xl p-6'>
                <h2 className='text-xl font-bold text-white mb-5'>{editingJuryId?'Modifier':'Nouveau jury'}</h2>
                <form onSubmit={handleSaveJury} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div><label className='block text-white/70 text-sm mb-1'>Nom *</label><input type='text' value={juryForm.name} onChange={e=>setJuryForm({...juryForm,name:e.target.value})} className={inp} placeholder='Jean Dupont'/></div>
                    <div><label className='block text-white/70 text-sm mb-1'>Rôle</label><input type='text' value={juryForm.role} onChange={e=>setJuryForm({...juryForm,role:e.target.value})} className={inp} placeholder='Directeur artistique'/></div>
                    <div className='md:col-span-2'><label className='block text-white/70 text-sm mb-1'>Photo</label><div className='flex gap-2'><input type='url' value={juryForm.photo} onChange={e=>setJuryForm({...juryForm,photo:e.target.value})} className={inp} placeholder='https://...'/><button type='button' onClick={()=>juryFileRef.current?.click()} disabled={juryPhotoUploading} className={btnS+' shrink-0'}><Upload size={14}/>{juryPhotoUploading?'...':'Upload'}</button></div>{juryForm.photo&&<img src={juryForm.photo} alt='' className='h-16 w-16 object-cover rounded-full mt-2'/>}</div>
                  </div>
                  {!editingJuryId&&<p className='text-white/40 text-xs bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2'>🔑 Les identifiants de connexion seront générés automatiquement.</p>}
                  <div className='flex gap-3'><button type='submit' className={btnP}><Save size={16}/>{editingJuryId?'Mettre à jour':'Ajouter'}</button><button type='button' onClick={()=>{setShowJuryForm(false);setEditingJuryId(null);}} className='bg-gray-500/30 hover:bg-gray-500/50 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2'><X size={16}/>Annuler</button></div>
                </form>
              </div>
            )}
            <input ref={juryFileRef} type='file' accept='image/*' className='hidden' onChange={e=>{if(e.target.files?.[0])handleJuryPhotoUpload(e.target.files[0]);e.target.value='';}}/>
            {juries.length===0&&!showJuryForm&&<div className='text-center py-20 border border-white/10 rounded-2xl'><Users size={48} className='text-white/20 mx-auto mb-4'/><p className='text-white/40'>Aucun jury.</p></div>}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {juries.map(j=>(
                <div key={j.id} className='bg-white/10 border border-white/20 rounded-2xl p-5 space-y-3'>
                  <div className='flex items-center gap-4'>
                    {j.photo?<img src={j.photo} alt={j.name} className='h-12 w-12 object-cover rounded-full shrink-0'/>:<div className='h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300 text-xl font-bold shrink-0'>{j.name[0]}</div>}
                    <div className='flex-1 min-w-0'><p className='text-white font-bold truncate'>{j.name}</p><p className='text-white/40 text-sm'>{j.role||'Jury'}</p></div>
                    <div className='flex gap-2'><button onClick={()=>{setJuryForm({name:j.name,role:j.role||'',photo:j.photo||''});setEditingJuryId(j.id);setShowJuryForm(true);}} className='bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded-lg'><Edit2 size={14}/></button><button onClick={()=>handleDeleteJury(j.id)} className='bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded-lg'><Trash2 size={14}/></button></div>
                  </div>
                  {j.username&&(
                    <div className='bg-black/30 border border-white/10 rounded-xl p-3 space-y-2'>
                      <p className='text-white/40 text-[10px] uppercase tracking-widest flex items-center gap-1'><Key size={10}/>Identifiants · /concours/jury</p>
                      <div className='flex items-center justify-between'><span className='text-white/50 text-xs'>Login :</span><div className='flex items-center gap-1'><span className='font-mono text-blue-300 text-xs'>{j.username}</span><button onClick={()=>navigator.clipboard.writeText(j.username!)} className='text-white/30 hover:text-white p-1'><Copy size={10}/></button></div></div>
                      <div className='flex items-center justify-between'><span className='text-white/50 text-xs'>Mot de passe :</span><div className='flex items-center gap-1'><span className='font-mono text-amber-300 text-xs'>{showPasswords[j.id]?j.password:'••••••••'}</span><button onClick={()=>setShowPasswords(p=>({...p,[j.id]:!p[j.id]}))} className='text-white/30 hover:text-white p-1'>{showPasswords[j.id]?<EyeOff size={10}/>:<Eye size={10}/>}</button><button onClick={()=>navigator.clipboard.writeText(j.password!)} className='text-white/30 hover:text-white p-1'><Copy size={10}/></button></div></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ── PASSAGES TAB (stage-scoped) ── */}
        {activeTab==='passages' && selectedContest && (
          <div className='space-y-4'>
            {showPassageForm && (
              <div className='bg-white/10 border border-white/20 rounded-2xl p-6'>
                <h2 className='text-xl font-bold text-white mb-1'>{editingPassageId?'Modifier':'Nouveau passage'}</h2>
                <p className='text-white/30 text-xs mb-5 flex items-center gap-1'><Flag size={10}/>{STAGE_LABELS[activeStage]}</p>
                <form onSubmit={handleSavePassage} className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div><label className='block text-white/70 text-sm mb-1'>Ordre</label><input type='number' min='1' value={passageForm.order} onChange={e=>setPassageForm({...passageForm,order:e.target.value})} className={inp} placeholder={String(passages.length+1)}/></div>
                    <div><label className='block text-white/70 text-sm mb-1'>Nom *</label><input type='text' value={passageForm.name} onChange={e=>setPassageForm({...passageForm,name:e.target.value})} className={inp} placeholder='Tenue de soirée' autoFocus/></div>
                  </div>
                  <div><label className='block text-white/70 text-sm mb-1'>Description</label><textarea value={passageForm.description} onChange={e=>setPassageForm({...passageForm,description:e.target.value})} rows={2} className={inp+' resize-none'} placeholder='Ex: Robe longue, couleurs vives...'/></div>
                  <div className='flex gap-3'><button type='submit' className={btnP}><Save size={16}/>{editingPassageId?'Mettre à jour':'Créer'}</button><button type='button' onClick={()=>{setShowPassageForm(false);setEditingPassageId(null);}} className='bg-gray-500/30 hover:bg-gray-500/50 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2'><X size={16}/>Annuler</button></div>
                </form>
              </div>
            )}
            {!showPassageForm && <button onClick={()=>{setShowPassageForm(true);setEditingPassageId(null);setPassageForm({order:'',name:'',description:''});}} className={btnP+' w-fit'}><Plus size={16}/>Ajouter un passage</button>}
            {/* Import passages depuis étape précédente */}
            {STAGE_ORDER.indexOf(activeStage) > 0 && !showPassageForm && (
              <div>
                {!showPassageImportPanel ? (
                  <button onClick={loadPrevStagePassages} className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-sm font-bold transition-all'>
                    <Layers size={14}/>Importer depuis {STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(activeStage)-1]]}
                  </button>
                ) : (
                  <div className='bg-teal-500/10 border border-teal-500/30 rounded-2xl p-5 space-y-4'>
                    <div className='flex items-center justify-between'>
                      <p className='text-teal-300 font-bold text-sm flex items-center gap-2'><Layers size={14}/>Passages de {STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(activeStage)-1]]} disponibles</p>
                      <button onClick={()=>setShowPassageImportPanel(false)} className='text-white/30 hover:text-white'><X size={16}/></button>
                    </div>
                    {prevStagePassages.length === 0 ? (
                      <p className='text-white/30 text-sm text-center py-4'>Tous les passages sont déjà dans cette étape.</p>
                    ) : (
                      <>
                        <div className='flex items-center justify-between'>
                          <button onClick={()=>setSelectedPassageImports(selectedPassageImports.size===prevStagePassages.length?new Set():new Set(prevStagePassages.map(p=>p.id)))} className='text-xs text-teal-300 hover:text-white transition-colors'>
                            {selectedPassageImports.size===prevStagePassages.length?'Tout désélectionner':'Tout sélectionner'}
                          </button>
                          <span className='text-white/30 text-xs'>{prevStagePassages.length} disponible(s)</span>
                        </div>
                        <div className='space-y-2 max-h-48 overflow-y-auto'>
                          {prevStagePassages.map(p=>(
                            <button key={p.id} onClick={()=>setSelectedPassageImports(prev=>{const s=new Set(prev);s.has(p.id)?s.delete(p.id):s.add(p.id);return s;})}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedPassageImports.has(p.id)?'bg-teal-500/20 border-teal-500/50':'bg-white/5 border-white/10 hover:border-teal-500/30'}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${STAGE_COLORS[STAGE_ORDER[STAGE_ORDER.indexOf(activeStage)-1]]}`}>{p.order}</div>
                              <div className='flex-1 min-w-0'><p className='text-white text-sm font-semibold truncate'>{p.name}</p>{p.description&&<p className='text-white/30 text-xs truncate'>{p.description}</p>}</div>
                              {selectedPassageImports.has(p.id)&&<CheckCircle size={16} className='text-teal-400 shrink-0'/>}
                            </button>
                          ))}
                        </div>
                        <div className='flex gap-3 pt-2 border-t border-white/10'>
                          <button onClick={handleImportPassages} disabled={selectedPassageImports.size===0||importingPassages} className='flex-1 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2'>
                            {importingPassages?<span className='loading loading-spinner loading-sm'/>:<CheckCircle size={16}/>}
                            Importer {selectedPassageImports.size>0?`(${selectedPassageImports.size})`:''} dans {STAGE_LABELS[activeStage]}
                          </button>
                          <button onClick={()=>setShowPassageImportPanel(false)} className='px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold'>Annuler</button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            {passages.length===0&&!showPassageForm&&<div className='text-center py-20 border border-white/10 rounded-2xl'><Layers size={48} className='text-white/20 mx-auto mb-4'/><p className='text-white/40'>Aucun passage pour la {STAGE_LABELS[activeStage]}.</p></div>}
            <div className='space-y-3'>
              {passages.map(p => (
                <PassageCard
                  key={p.id}
                  p={p}
                  criteria={criteria}
                  scores={scores}
                  activeStage={activeStage}
                  inp={inp}
                  onEdit={()=>{setPassageForm({order:p.order.toString(),name:p.name,description:p.description});setEditingPassageId(p.id);setShowPassageForm(true);}}
                  onDelete={()=>handleDeletePassage(p.id)}
                  onSaveCriteria={handleSaveCriteria}
                  onDeleteCriteria={handleDeleteCriteria}
                />
              ))}
            </div>
          </div>
        )}
        {/* ── SCORING TAB (stage-scoped) ── */}
        {activeTab==='scoring' && selectedContest && (
          <div className='space-y-8'>
            {/* Global criteria for this stage */}
            <div>
              <h2 className='text-lg font-bold text-white mb-4 flex items-center gap-2'><Star size={18} className='text-amber-400'/>Critères globaux — {STAGE_LABELS[activeStage]}</h2>
              {/* Import critères depuis étape précédente */}
              {STAGE_ORDER.indexOf(activeStage) > 0 && !showCriteriaForm && (
                <div className='mb-4'>
                  {!showCriteriaImportPanel ? (
                    <button onClick={loadPrevStageCriteria} className='flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-bold transition-all'>
                      <Star size={14}/>Importer depuis {STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(activeStage)-1]]}
                    </button>
                  ) : (
                    <div className='bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 space-y-4'>
                      <div className='flex items-center justify-between'>
                        <p className='text-amber-300 font-bold text-sm flex items-center gap-2'><Star size={14}/>Critères de {STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(activeStage)-1]]} disponibles</p>
                        <button onClick={()=>setShowCriteriaImportPanel(false)} className='text-white/30 hover:text-white'><X size={16}/></button>
                      </div>
                      {prevStageCriteria.length === 0 ? (
                        <p className='text-white/30 text-sm text-center py-4'>Tous les critères sont déjà dans cette étape.</p>
                      ) : (
                        <>
                          <div className='flex items-center justify-between'>
                            <button onClick={()=>setSelectedCriteriaImports(selectedCriteriaImports.size===prevStageCriteria.length?new Set():new Set(prevStageCriteria.map(c=>c.id)))} className='text-xs text-amber-300 hover:text-white transition-colors'>
                              {selectedCriteriaImports.size===prevStageCriteria.length?'Tout désélectionner':'Tout sélectionner'}
                            </button>
                            <span className='text-white/30 text-xs'>{prevStageCriteria.length} disponible(s)</span>
                          </div>
                          <div className='space-y-2 max-h-48 overflow-y-auto'>
                            {prevStageCriteria.map(c=>(
                              <button key={c.id} onClick={()=>setSelectedCriteriaImports(prev=>{const s=new Set(prev);s.has(c.id)?s.delete(c.id):s.add(c.id);return s;})}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${selectedCriteriaImports.has(c.id)?'bg-amber-500/20 border-amber-500/50':'bg-white/5 border-white/10 hover:border-amber-500/30'}`}>
                                <div className='flex-1 min-w-0'><p className='text-white text-sm font-semibold'>{c.label}</p></div>
                                <span className='text-amber-400 font-bold text-sm shrink-0'>×{c.weight}</span>
                                {selectedCriteriaImports.has(c.id)&&<CheckCircle size={16} className='text-amber-400 shrink-0'/>}
                              </button>
                            ))}
                          </div>
                          <div className='flex gap-3 pt-2 border-t border-white/10'>
                            <button onClick={handleImportCriteria} disabled={selectedCriteriaImports.size===0||importingCriteria} className='flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2'>
                              {importingCriteria?<span className='loading loading-spinner loading-sm'/>:<CheckCircle size={16}/>}
                              Importer {selectedCriteriaImports.size>0?`(${selectedCriteriaImports.size})`:''} dans {STAGE_LABELS[activeStage]}
                            </button>
                            <button onClick={()=>setShowCriteriaImportPanel(false)} className='px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold'>Annuler</button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
              {showCriteriaForm && (
                <div className='bg-white/10 border border-white/20 rounded-2xl p-5 mb-4'>
                  <form onSubmit={handleSaveCriteria} className='space-y-3'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                      <div className='md:col-span-2'><label className='block text-white/70 text-sm mb-1'>Libellé *</label><input type='text' value={criteriaForm.label} onChange={e=>setCriteriaForm({...criteriaForm,label:e.target.value})} className={inp} placeholder='Beauté naturelle'/></div>
                      <div><label className='block text-white/70 text-sm mb-1'>Coefficient</label><input type='number' min='0.1' max='10' step='0.1' value={criteriaForm.weight} onChange={e=>setCriteriaForm({...criteriaForm,weight:e.target.value})} className={inp}/></div>
                    </div>
                    <div className='flex gap-3'><button type='submit' className={btnP}><Save size={16}/>{editingCriteriaId?'Mettre à jour':'Ajouter'}</button><button type='button' onClick={()=>{setShowCriteriaForm(false);setEditingCriteriaId(null);}} className='bg-gray-500/30 hover:bg-gray-500/50 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2'><X size={16}/>Annuler</button></div>
                  </form>
                </div>
              )}
              {criteria.filter(c=>!c.passageId).length===0 ? <div className='text-center py-8 border border-white/10 rounded-2xl text-white/30'>Aucun critère global. Ajoutez-en ou gérez-les par passage.</div> : (
                <div className='bg-white/10 border border-white/20 rounded-2xl overflow-hidden'>
                  <table className='w-full'><thead><tr className='border-b border-white/10 bg-white/5'>
                    <th className='px-4 py-3 text-left text-white/70 text-sm'>Critère</th>
                    <th className='px-4 py-3 text-left text-white/70 text-sm'>Coeff.</th>
                    <th className='px-4 py-3 text-left text-white/70 text-sm'>Actions</th>
                  </tr></thead><tbody>
                    {criteria.filter(c=>!c.passageId).map(cr=>(
                      <tr key={cr.id} className='border-b border-white/10 hover:bg-white/5'>
                        <td className='px-4 py-3 text-white font-semibold'>{cr.label}</td>
                        <td className='px-4 py-3 text-amber-400 font-bold'>x{cr.weight}</td>
                        <td className='px-4 py-3'><div className='flex gap-2'><button onClick={()=>{setCriteriaForm({label:cr.label,weight:String(cr.weight),order:String(cr.order),passageId:''});setEditingCriteriaId(cr.id);setShowCriteriaForm(true);}} className='bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded-lg'><Edit2 size={14}/></button><button onClick={()=>handleDeleteCriteria(cr.id)} className='bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded-lg'><Trash2 size={14}/></button></div></td>
                      </tr>
                    ))}
                  </tbody></table>
                </div>
              )}
            </div>

            {/* Score entry */}
            {criteria.length>0 && candidates.length>0 && juries.length>0 && (
              <div>
                <h2 className='text-lg font-bold text-white mb-4 flex items-center gap-2'><Star size={18} className='text-amber-400'/>Saisie des notes — {STAGE_LABELS[activeStage]}</h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                  <div><label className='block text-white/70 text-sm mb-2'>Jury</label><select value={scoringJuryId} onChange={e=>{setScoringJuryId(e.target.value);setScoringCandidateId('');setScoringPassageId('');}} className='w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none'><option value=''>-- Jury --</option>{juries.map(j=><option key={j.id} value={j.id}>{j.name}</option>)}</select></div>
                  <div><label className='block text-white/70 text-sm mb-2'>Candidate</label><select value={scoringCandidateId} onChange={e=>{setScoringCandidateId(e.target.value);setScoringPassageId('');}} className='w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none'><option value=''>-- Candidate --</option>{candidates.filter(c=>c.status==='active').map(c=><option key={c.id} value={c.id}>#{c.order||'?'} {c.name}</option>)}</select></div>
                  <div><label className='block text-white/70 text-sm mb-2'>Passage</label><select value={scoringPassageId} onChange={e=>{setScoringPassageId(e.target.value);if(scoringJuryId&&scoringCandidateId){const ex=getScore(scoringJuryId,scoringCandidateId,e.target.value);if(ex){const i:Record<string,string>={};Object.entries(ex.scores).forEach(([k,v])=>{i[k]=String(v);});setScoreInputs(i);setScoreComment(ex.comment||'');}else{setScoreInputs({});setScoreComment('');}}}} className='w-full bg-slate-800 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none'><option value=''>-- Passage --</option>{passages.length>0?passages.map(p=><option key={p.id} value={p.id}>{p.name}</option>):<option value='global'>Notation globale</option>}</select></div>
                </div>
                {scoringJuryId&&scoringCandidateId&&(scoringPassageId||passages.length===0)&&(
                  <div className='bg-white/10 border border-white/20 rounded-2xl p-6 space-y-5'>
                    <div className='flex items-center justify-between'><h3 className='text-white font-bold'>{juries.find(j=>j.id===scoringJuryId)?.name} → {candidates.find(c=>c.id===scoringCandidateId)?.name}{scoringPassageId&&passages.length>0?' · '+passages.find(p=>p.id===scoringPassageId)?.name:''}</h3>{getScore(scoringJuryId,scoringCandidateId,scoringPassageId||'global')&&<span className='text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full'>Déjà noté</span>}</div>
                    {criteriaForPassage(scoringPassageId||'global').map(cr=>(
                      <div key={cr.id} className='space-y-2'>
                        <div className='flex items-center justify-between'><label className='text-white/80 font-semibold text-sm'>{cr.label} <span className='text-amber-400 text-xs'>x{cr.weight}</span></label><span className='text-white font-black text-lg'>{scoreInputs[cr.id]||'0'}<span className='text-white/30 text-sm'>/10</span></span></div>
                        <input type='range' min='0' max='10' step='0.5' value={scoreInputs[cr.id]||'0'} onChange={e=>setScoreInputs(p=>({...p,[cr.id]:e.target.value}))} className='w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-amber-400'/>
                        <div className='flex justify-between text-white/20 text-xs'>{[0,1,2,3,4,5,6,7,8,9,10].map(n=><span key={n}>{n}</span>)}</div>
                      </div>
                    ))}
                    <div><label className='block text-white/70 text-sm mb-1'>Commentaire</label><textarea value={scoreComment} onChange={e=>setScoreComment(e.target.value)} rows={2} className={inp+' resize-none'}/></div>
                    <div className='flex items-center justify-between pt-2'>
                      <div className='text-white/50 text-sm'>Moy. : <span className='text-amber-400 font-bold text-lg'>{(criteriaForPassage(scoringPassageId||'global').reduce((s,cr)=>s+(parseFloat(scoreInputs[cr.id]||'0')*cr.weight),0)/(criteriaForPassage(scoringPassageId||'global').reduce((s,cr)=>s+cr.weight,0)||1)).toFixed(2)}/10</span></div>
                      <button onClick={handleSaveScore} disabled={savingScore} className={btnP+' disabled:opacity-50'}><Save size={16}/>{savingScore?'Enregistrement...':'Enregistrer'}</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Overview matrix */}
            {passages.length>0 && candidates.length>0 && (
              <div>
                <h2 className='text-lg font-bold text-white mb-4'>Matrice des notes — {STAGE_LABELS[activeStage]}</h2>
                {passages.map(p=>(
                  <div key={p.id} className='mb-6'>
                    <div className='flex items-center gap-2 mb-3'><div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${STAGE_COLORS[activeStage]}`}>{p.order}</div><h3 className='text-white font-semibold'>{p.name}</h3></div>
                    <div className='overflow-x-auto'><table className='w-full bg-white/5 border border-white/10 rounded-xl overflow-hidden text-sm'>
                      <thead><tr className='border-b border-white/10 bg-white/5'><th className='px-3 py-2 text-left text-white/60'>Candidate</th>{juries.map(j=><th key={j.id} className='px-3 py-2 text-center text-white/60 whitespace-nowrap'>{j.name}</th>)}<th className='px-3 py-2 text-center text-amber-400 font-bold'>Moy.</th></tr></thead>
                      <tbody>{candidates.filter(c=>c.status==='active').map(c=>{
                        const tw=criteriaForPassage(p.id).reduce((s,cr)=>s+cr.weight,0)||1;
                        const juryAvgs=juries.map(j=>{const sc=getScore(j.id,c.id,p.id);return sc?criteriaForPassage(p.id).reduce((s,cr)=>s+(sc.scores[cr.id]??0)*cr.weight,0)/tw:null;});
                        const valid=juryAvgs.filter(v=>v!==null) as number[];
                        const avg=valid.length>0?valid.reduce((a,b)=>a+b,0)/valid.length:null;
                        return(<tr key={c.id} className='border-b border-white/10 hover:bg-white/5'>
                          <td className='px-3 py-2 text-white font-semibold'>#{c.order||'?'} {c.name}</td>
                          {juries.map((j,i)=>(<td key={j.id} className='px-3 py-2 text-center'>{juryAvgs[i]!==null?<span className='text-amber-400 font-bold'>{(juryAvgs[i] as number).toFixed(1)}</span>:<span className='text-white/20'>—</span>}</td>))}
                          <td className='px-3 py-2 text-center'>{avg!==null?<span className='text-amber-400 font-black'>{avg.toFixed(2)}</span>:<span className='text-white/20'>—</span>}</td>
                        </tr>);
                      })}</tbody>
                    </table></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* ── RESULTS TAB (stage-scoped) ── */}
        {activeTab==='results' && selectedContest && (() => {
          const results = computeResults();
          return (
            <div className='space-y-6'>
              <div className='grid grid-cols-3 gap-4'>
                <div className='bg-white/10 border border-white/20 rounded-2xl p-5'><p className='text-white/40 text-sm mb-1'>Candidates notées</p><p className='text-3xl font-bold text-white'>{results.filter(r=>r.average>0).length}</p></div>
                <div className='bg-white/10 border border-white/20 rounded-2xl p-5'><p className='text-white/40 text-sm mb-1'>Passages</p><p className='text-3xl font-bold text-teal-400'>{passages.length||1}</p></div>
                <div className='bg-white/10 border border-white/20 rounded-2xl p-5'><p className='text-white/40 text-sm mb-1'>Notes saisies</p><p className='text-3xl font-bold text-amber-400'>{scores.length}</p></div>
              </div>
              {results.length===0?<div className='text-center py-20 border border-white/10 rounded-2xl text-white/30'>Aucune note pour la {STAGE_LABELS[activeStage]}.</div>:(
                <div className='space-y-3'>
                  {results.map((r,i)=>(
                    <div key={r.candidate.id} className={`bg-white/10 border rounded-2xl p-5 flex items-center gap-5 ${i===0?'border-yellow-500/50 bg-yellow-500/5':i===1?'border-gray-400/30':i===2?'border-amber-700/30':'border-white/10'}`}>
                      <div className={`text-3xl font-black w-12 text-center shrink-0 ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-white/30'}`}>{i===0?'🥇':i===1?'🥈':i===2?'🥉':i+1}</div>
                      {r.candidate.photo?<img src={r.candidate.photo} alt={r.candidate.name} className='h-14 w-14 object-cover rounded-full shrink-0'/>:<div className='h-14 w-14 rounded-full bg-white/10 flex items-center justify-center text-white/30 text-xl font-bold shrink-0'>{r.candidate.name[0]}</div>}
                      <div className='flex-1 min-w-0'>
                        <p className='text-white font-bold text-lg'>#{r.candidate.order||'?'} {r.candidate.name}</p>
                        {passages.length>0&&(
                          <div className='flex flex-wrap gap-2 mt-2'>
                            {passages.map(p=>(<span key={p.id} className='text-xs text-white/40'>{p.name}: <span className='text-white/70 font-semibold'>{r.byPassage[p.id]!==undefined?r.byPassage[p.id].toFixed(1)+'/10':'—'}</span></span>))}
                          </div>
                        )}
                      </div>
                      <div className='text-right shrink-0'>
                        <p className={`text-3xl font-black ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-white'}`}>{r.average>0?r.average.toFixed(2):'—'}</p>
                        <p className='text-white/30 text-xs'>/10</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

      </div>

      {/* Credentials modal */}
      {newJuryCredentials && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'>
          <div className='bg-slate-900 border border-blue-500/40 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6'>
            <div className='flex items-center gap-3'><div className='w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center'><Key size={20} className='text-blue-400'/></div><div><h2 className='text-white font-bold text-lg'>Identifiants créés</h2><p className='text-white/40 text-sm'>Pour {newJuryCredentials.name}</p></div></div>
            <div className='bg-black/40 border border-white/10 rounded-xl p-5 space-y-4'>
              <div><p className='text-white/40 text-xs uppercase tracking-widest mb-1'>Identifiant</p><div className='flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5'><span className='font-mono text-blue-300 font-bold'>{newJuryCredentials.username}</span><button onClick={()=>navigator.clipboard.writeText(newJuryCredentials!.username)} className='text-white/40 hover:text-white'><Copy size={14}/></button></div></div>
              <div><p className='text-white/40 text-xs uppercase tracking-widest mb-1'>Mot de passe</p><div className='flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5'><span className='font-mono text-amber-300 font-bold'>{newJuryCredentials.password}</span><button onClick={()=>navigator.clipboard.writeText(newJuryCredentials!.password)} className='text-white/40 hover:text-white'><Copy size={14}/></button></div></div>
              <div><p className='text-white/40 text-xs uppercase tracking-widest mb-1'>URL</p><div className='flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5'><span className='text-white/60 text-sm'>/login → /concours/jury</span><button onClick={()=>navigator.clipboard.writeText(window.location.origin+'/login')} className='text-white/40 hover:text-white'><Copy size={14}/></button></div></div>
            </div>
            <div className='bg-amber-500/10 border border-amber-500/30 rounded-xl p-3'><p className='text-amber-300 text-xs'>⚠️ Notez ces identifiants maintenant.</p></div>
            <button onClick={()=>setNewJuryCredentials(null)} className='w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl'>J&apos;ai noté les identifiants</button>
          </div>
        </div>
      )}
    </div>
  );
}
