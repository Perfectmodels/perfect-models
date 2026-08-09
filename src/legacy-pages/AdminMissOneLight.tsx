import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Upload, CheckCircle, Clock, TrendingUp, RotateCcw, User } from 'lucide-react';
import { rtdb } from '../firebase';
import {
  ref,
  set,
  remove,
  update,
  onValue,
  push,
  increment,
} from 'firebase/database';
import { MissOneLightPendingVote } from '../types';
import { uploadToImgbb, validateFile } from '../utils/imgbbService';
import { sendVoteValidatedEmail } from '../utils/brevoService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Candidate {
  id: string;
  order: number;
  name: string;
  slug: string;
  photo: string;
  bio: string;
  votes: number;
  status: 'active' | 'hidden' | 'winner';
}

const INITIAL_CANDIDATES = [
  { order: 1,  name: 'LÉONCIA',  slug: 'leoncia'  },
  { order: 2,  name: 'CELIA',    slug: 'celia'    },
  { order: 3,  name: 'LAÏCA',    slug: 'laica'    },
  { order: 4,  name: 'SARAH',    slug: 'sarah'    },
  { order: 5,  name: 'ANNA',     slug: 'anna'     },
  { order: 6,  name: 'RÉUSSITE', slug: 'reussite' },
  { order: 7,  name: 'JOHANNE',  slug: 'johanne'  },
  { order: 8,  name: 'LEÏLA',    slug: 'leila'    },
  { order: 9,  name: 'DJENIFER', slug: 'djenifer' },
  { order: 10, name: 'RENÉE',    slug: 'renee'    },
  { order: 11, name: 'FANELLA',  slug: 'fanella'  },
  { order: 12, name: 'ARIANA',   slug: 'ariana'   },
];

const EMPTY_FORM = {
  order: '', name: '', slug: '', photo: '', bio: '', status: 'active' as Candidate['status'],
};

const RTDB_PATH = 'missOneLight/candidates';

export default function AdminMissOneLight() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [formUploading, setFormUploading] = useState(false);
  const rowFileRef = useRef<HTMLInputElement>(null);
  const formFileRef = useRef<HTMLInputElement>(null);
  const pendingRowId = useRef<string | null>(null);

  // Pending votes state
  const [activeTab, setActiveTab] = useState<'candidates' | 'pending' | 'comptabilite' | 'voting-control'>('candidates');
  const [pendingVotes, setPendingVotes] = useState<MissOneLightPendingVote[]>([]);
  const [validating, setValidating] = useState<string | null>(null);
  const [pendingSubTab, setPendingSubTab] = useState<'waiting' | 'done'>('waiting');
  const [pendingSort, setPendingSort] = useState<'date' | 'candidate' | 'amount'>('date');
  const [pendingSortDir, setPendingSortDir] = useState<'asc' | 'desc'>('desc');
  
  // NEW: Advanced vote management states
  const [selectedVotes, setSelectedVotes] = useState<Set<string>>(new Set());
  const [batchValidating, setBatchValidating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCandidate, setFilterCandidate] = useState<string>('all');
  const [quickValidateMode, setQuickValidateMode] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<MissOneLightPendingVote | null>(null);
  const [voteStats, setVoteStats] = useState<{
    byCandidate: Record<string, { pending: number; validated: number; total: number; amount: number }>;
    totalPending: number;
    totalValidated: number;
    totalAmount: number;
  }>({ byCandidate: {}, totalPending: 0, totalValidated: 0, totalAmount: 0 });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Upload photo depuis le tableau (quick upload)
  const handleRowUpload = async (file: File) => {
    const id = pendingRowId.current;
    if (!id) return;
    const err = validateFile(file, 'image');
    if (err) { showToast(err, 'error'); return; }
    setUploadingId(id);
    try {
      const url = await uploadToImgbb(file, '');
      await update(ref(rtdb, `${RTDB_PATH}/${id}`), { photo: url });
      showToast('Photo mise à jour', 'success');
    } catch {
      showToast("Erreur lors de l'upload", 'error');
    } finally {
      setUploadingId(null);
      pendingRowId.current = null;
    }
  };

  // Upload photo depuis le formulaire
  const handleFormUpload = async (file: File) => {
    const err = validateFile(file, 'image');
    if (err) { showToast(err, 'error'); return; }
    setFormUploading(true);
    try {
      const url = await uploadToImgbb(file, '');
      setFormData(prev => ({ ...prev, photo: url }));
      showToast('Photo uploadée', 'success');
    } catch {
      showToast("Erreur lors de l'upload", 'error');
    } finally {
      setFormUploading(false);
    }
  };

  // Écoute temps réel RTDB
  useEffect(() => {
    const candidatesRef = ref(rtdb, RTDB_PATH);
    const unsubscribe = onValue(candidatesRef, (snapshot: { val: () => any; }) => {
      const data = snapshot.val();
      if (data) {
        const list: Candidate[] = Object.entries(data).map(([id, val]) => ({
          id,
          ...(val as Omit<Candidate, 'id'>),
        }));
        list.sort((a, b) => a.order - b.order);
        setCandidates(list);
      } else {
        setCandidates([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load pending votes
  useEffect(() => {
    const pendingRef = ref(rtdb, 'missOneLight/pendingVotes');
    const unsubscribe = onValue(pendingRef, (snapshot: { val: () => any; }) => {
      const data = snapshot.val();
      if (data) {
        const list: MissOneLightPendingVote[] = Object.entries(data).map(([id, val]) => ({
          id,
          ...(val as Omit<MissOneLightPendingVote, 'id'>),
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setPendingVotes(list);
      } else {
        setPendingVotes([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // NEW: Load voting configuration
  useEffect(() => {
    const configRef = ref(rtdb, 'missOneLight/config');
    const unsubscribe = onValue(configRef, (snapshot: { val: () => any; }) => {
      const data = snapshot.val();
      if (data) {
        setVotingEnabled(data.votingEnabled ?? true);
        setVotingDeadline(data.votingDeadline ?? '2026-04-17T20:00:00');
      }
    });
    return () => unsubscribe();
  }, []);

  // Calculate vote statistics whenever pendingVotes changes
  useEffect(() => {
    const stats = {
      byCandidate: {} as Record<string, { pending: number; validated: number; total: number; amount: number }>,
      totalPending: 0,
      totalValidated: 0,
      totalAmount: 0,
    };
    
    pendingVotes.forEach(vote => {
      const candidateName = vote.candidateName;
      if (!stats.byCandidate[candidateName]) {
        stats.byCandidate[candidateName] = { pending: 0, validated: 0, total: 0, amount: 0 };
      }
      
      const voteCount = vote.totalVotes ?? vote.votes;
      const amount = vote.votes * 100;
      
      if (vote.validated && !vote.cancelled) {
        stats.byCandidate[candidateName].validated += voteCount;
        stats.totalValidated += voteCount;
      } else if (!vote.validated && !vote.cancelled) {
        stats.byCandidate[candidateName].pending += voteCount;
        stats.totalPending += voteCount;
      }
      
      stats.byCandidate[candidateName].total += voteCount;
      stats.byCandidate[candidateName].amount += amount;
      stats.totalAmount += amount;
    });
    
    setVoteStats(stats);
  }, [pendingVotes]);


  const handleDeletePending = async (id: string) => {
    if (!confirm('Supprimer cette demande ?')) return;
    await remove(ref(rtdb, `missOneLight/pendingVotes/${id}`));
    showToast('Demande supprimée', 'success');
  };

  const handleWhatsApp = (pending: MissOneLightPendingVote) => {
    const voterPhone = pending.phone.replace(/\D/g, '');
    const msg = `Bonjour ${pending.voterName || ''}, votre vote pour ${pending.candidateName} (${pending.totalVotes ?? pending.votes} votes) a bien été validé ! Merci pour votre soutien. 🌟`;
    window.open(`https://wa.me/${voterPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // NEW: Batch validation function
  const handleBatchValidate = async () => {
    if (selectedVotes.size === 0) return;
    if (!confirm(`Valider ${selectedVotes.size} vote(s) en masse ?`)) return;
    
    setBatchValidating(true);
    const { get } = await import('firebase/database');
    let success = 0;
    let failed = 0;
    
    for (const voteId of selectedVotes) {
      const vote = pendingVotes.find(v => v.id === voteId);
      if (!vote || vote.validated || vote.cancelled) continue;
      
      try {
        const snap = await get(ref(rtdb, `missOneLight/pendingVotes/${vote.id}`));
        if (!snap.exists() || snap.val()?.validated === true) {
          failed++;
          continue;
        }
        
        const credited = vote.totalVotes ?? vote.votes;
        await update(ref(rtdb, `missOneLight/pendingVotes/${vote.id}`), {
          validated: true,
          validatedAt: new Date().toISOString(),
        });
        await update(ref(rtdb, `${RTDB_PATH}/${vote.candidateId}`), {
          votes: increment(credited),
        });
        
        sendVoteValidatedEmail({
          email: vote.email,
          candidateName: vote.candidateName,
          votes: vote.votes,
          bonusVotes: vote.bonusVotes ?? 0,
          totalVotes: credited,
          txRef: vote.txRef,
        }).catch(() => {});
        
        success++;
      } catch {
        failed++;
      }
    }
    
    setSelectedVotes(new Set());
    setBatchValidating(false);
    showToast(`✅ ${success} validé(s) · ❌ ${failed} échec(s)`, success > 0 ? 'success' : 'error');
  };

  // NEW: Toggle vote selection
  const toggleVoteSelection = (id: string) => {
    setSelectedVotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // NEW: Select all waiting votes
  const selectAllWaiting = () => {
    const waiting = pendingVotes.filter(v => !v.validated && !v.cancelled);
    if (selectedVotes.size === waiting.length) {
      setSelectedVotes(new Set());
    } else {
      setSelectedVotes(new Set(waiting.map(v => v.id)));
    }
  };

  // ENHANCED: Export votes to PDF - Official ranking from candidates collection
  const exportVotes = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    // Get official ranking from candidates (sorted by votes)
    const sortedCandidates = [...candidates]
      .filter(c => c.status === 'active') // Only active candidates
      .sort((a, b) => b.votes - a.votes); // Sort by votes descending
    
    // Calculate totals
    const totalVotes = sortedCandidates.reduce((s, c) => s + c.votes, 0);
    const totalTransactions = pendingVotes.filter(v => v.validated && !v.cancelled).length;
    const pendingTransactions = pendingVotes.filter(v => !v.validated && !v.cancelled).length;
    
    // Create PDF
    const doc = new jsPDF();
    
    // Colors
    const primaryColor: [number, number, number] = [252, 209, 22]; // #FCD116 - Gold
    const secondaryColor: [number, number, number] = [0, 158, 96]; // #009E60 - Green
    const darkColor: [number, number, number] = [26, 26, 26]; // #1a1a1a - Dark
    
    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('MISS ONE LIGHT 2026', 105, 15, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CLASSEMENT OFFICIEL', 105, 26, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Généré le ${dateStr} à ${timeStr}`, 105, 36, { align: 'center' });
    
    // Summary section
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉSUMÉ GÉNÉRAL', 14, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const summaryData = [
      ['Total des votes', totalVotes.toLocaleString('fr-FR')],
      ['Nombre de candidates', sortedCandidates.length.toString()],
      ['Transactions validées', totalTransactions.toString()],
      ['Transactions en attente', pendingTransactions.toString()],
    ];
    
    autoTable(doc, {
      startY: 60,
      head: [],
      body: summaryData,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [100, 100, 100] },
        1: { fontStyle: 'bold', textColor: [primaryColor[0], primaryColor[1], primaryColor[2]], halign: 'right' },
      },
      margin: { left: 14, right: 14 },
    });
    
    // Classement section
    const finalY = (doc as any).lastAutoTable.finalY || 95;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('CLASSEMENT OFFICIEL DES CANDIDATES', 14, finalY + 10);
    
    // Table data with medals for top 3
    const tableData = sortedCandidates.map((candidate, index) => {
      const position = index + 1;
      let positionText = position.toString();
      
      // Add medals for top 3
      if (position === 1) positionText = '🥇 1';
      else if (position === 2) positionText = '🥈 2';
      else if (position === 3) positionText = '🥉 3';
      
      return [
        positionText,
        candidate.name,
        candidate.votes.toLocaleString('fr-FR'),
        totalVotes > 0 ? `${((candidate.votes / totalVotes) * 100).toFixed(1)}%` : '0%',
      ];
    });
    
    autoTable(doc, {
      startY: finalY + 15,
      head: [['Position', 'Candidate', 'Votes', 'Pourcentage']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [primaryColor[0], primaryColor[1], primaryColor[2]],
        textColor: [darkColor[0], darkColor[1], darkColor[2]],
        fontStyle: 'bold',
        fontSize: 11,
        halign: 'center',
      },
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25, fontStyle: 'bold' },
        1: { fontStyle: 'bold', cellWidth: 80 },
        2: { halign: 'right', textColor: [secondaryColor[0], secondaryColor[1], secondaryColor[2]], fontStyle: 'bold', fontSize: 11 },
        3: { halign: 'center', textColor: [primaryColor[0], primaryColor[1], primaryColor[2]], fontStyle: 'bold' },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      margin: { left: 14, right: 14 },
      didParseCell: function(data) {
        // Highlight top 3
        if (data.section === 'body' && data.row.index < 3) {
          if (data.row.index === 0) {
            data.cell.styles.fillColor = [255, 250, 205]; // Light gold for 1st
          } else if (data.row.index === 1) {
            data.cell.styles.fillColor = [245, 245, 245]; // Light silver for 2nd
          } else if (data.row.index === 2) {
            data.cell.styles.fillColor = [255, 243, 224]; // Light bronze for 3rd
          }
        }
      },
    });
    
    // Add winner announcement if votes are closed
    const votingClosed = !votingEnabled || new Date() >= new Date(votingDeadline);
    if (votingClosed && sortedCandidates.length > 0) {
      const winnerY = (doc as any).lastAutoTable.finalY + 15;
      
      // Winner box
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.roundedRect(14, winnerY, 182, 25, 3, 3, 'F');
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('🏆 GAGNANTE', 105, winnerY + 10, { align: 'center' });
      
      doc.setFontSize(16);
      doc.text(sortedCandidates[0].name.toUpperCase(), 105, winnerY + 19, { align: 'center' });
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, doc.internal.pageSize.height - 20, 196, doc.internal.pageSize.height - 20);
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Perfect Models Management',
        14,
        doc.internal.pageSize.height - 12
      );
      doc.text(
        'perfectmodels.ga',
        14,
        doc.internal.pageSize.height - 7
      );
      doc.text(
        `Page ${i} / ${pageCount}`,
        doc.internal.pageSize.width - 14,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      
      // Official stamp
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(
        'DOCUMENT OFFICIEL',
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const filename = votingClosed 
      ? `miss-one-light-classement-OFFICIEL-${now.toISOString().split('T')[0]}.pdf`
      : `miss-one-light-classement-${now.toISOString().split('T')[0]}.pdf`;
    
    doc.save(filename);
    
    showToast(`Export PDF téléchargé (${sortedCandidates.length} candidates)`, 'success');
  };

  // NEW: Filter and search function
  const getFilteredVotes = (votes: MissOneLightPendingVote[]) => {
    return votes.filter(v => {
      const matchesCandidate = filterCandidate === 'all' || v.candidateName === filterCandidate;
      const matchesSearch = !searchQuery || 
        v.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.phone.includes(searchQuery) ||
        v.voterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.txRef.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCandidate && matchesSearch;
    });
  };

  // NEW: Quick validate without confirmation
  const handleQuickValidate = async (pending: MissOneLightPendingVote) => {
    setShowConfirmModal(pending);
  };

  // NEW: Edit voter information
  const [editingVote, setEditingVote] = useState<MissOneLightPendingVote | null>(null);
  const [editFormData, setEditFormData] = useState({
    voterName: '',
    email: '',
    phone: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // NEW: Voting control state
  const [votingEnabled, setVotingEnabled] = useState(true);
  const [votingDeadline, setVotingDeadline] = useState('2026-04-17T20:00:00');
  const [savingVotingConfig, setSavingVotingConfig] = useState(false);

  const startEditVote = (vote: MissOneLightPendingVote) => {
    setEditingVote(vote);
    setEditFormData({
      voterName: vote.voterName || '',
      email: vote.email,
      phone: vote.phone,
    });
  };

  const handleSaveEditVote = async () => {
    if (!editingVote) return;
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      showToast('Email invalide', 'error');
      return;
    }

    // Validate phone (at least 8 digits)
    const phoneDigits = editFormData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      showToast('Numéro de téléphone invalide (min 8 chiffres)', 'error');
      return;
    }

    setSavingEdit(true);
    try {
      await update(ref(rtdb, `missOneLight/pendingVotes/${editingVote.id}`), {
        voterName: editFormData.voterName.trim() || null,
        email: editFormData.email.trim(),
        phone: editFormData.phone.trim(),
      });
      showToast('Informations du votant mises à jour', 'success');
      setEditingVote(null);
    } catch {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // NEW: Save voting configuration
  const handleSaveVotingConfig = async () => {
    setSavingVotingConfig(true);
    try {
      await update(ref(rtdb, 'missOneLight/config'), {
        votingEnabled,
        votingDeadline,
        updatedAt: new Date().toISOString(),
      });
      showToast('Configuration des votes mise à jour', 'success');
    } catch {
      showToast('Erreur lors de la mise à jour', 'error');
    } finally {
      setSavingVotingConfig(false);
    }
  };

  const confirmValidate = async () => {
    if (!showConfirmModal) return;
    const pending = showConfirmModal;
    setShowConfirmModal(null);
    
    const credited = pending.totalVotes ?? pending.votes;
    setValidating(pending.id);
    try {
      const { get } = await import('firebase/database');
      const snap = await get(ref(rtdb, `missOneLight/pendingVotes/${pending.id}`));
      if (!snap.exists() || snap.val()?.validated === true) {
        showToast('Ce vote a deja ete valide ou supprime.', 'error');
        return;
      }
      
      await update(ref(rtdb, `missOneLight/pendingVotes/${pending.id}`), {
        validated: true,
        validatedAt: new Date().toISOString(),
      });
      await update(ref(rtdb, `${RTDB_PATH}/${pending.candidateId}`), {
        votes: increment(credited),
      });
      
      sendVoteValidatedEmail({
        email: pending.email,
        candidateName: pending.candidateName,
        votes: pending.votes,
        bonusVotes: pending.bonusVotes ?? 0,
        totalVotes: credited,
        txRef: pending.txRef,
      }).catch(() => {});
      
      showToast(`✅ ${credited} vote(s) credites pour ${pending.candidateName}`, 'success');
    } catch {
      showToast('Erreur lors de la validation', 'error');
    } finally {
      setValidating(null);
    }
  };

  const handleImport = async () => {
    if (!confirm('Importer les 12 candidates dans le Realtime Database ?')) return;
    setImporting(true);
    try {
      for (const c of INITIAL_CANDIDATES) {
        const newRef = push(ref(rtdb, RTDB_PATH));
        await set(newRef, {
          order: c.order,
          name: c.name,
          slug: c.slug,
          photo: '',
          bio: '',
          votes: 0,
          status: 'active',
        });
      }
      showToast('12 candidates importées avec succès', 'success');
    } catch {
      showToast("Erreur lors de l'import", 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.order || !formData.name || !formData.slug) {
      showToast('Numéro, nom et slug sont requis', 'error');
      return;
    }
    const payload = {
      order: parseInt(formData.order),
      name: formData.name,
      slug: formData.slug,
      photo: formData.photo,
      bio: formData.bio,
      status: formData.status,
    };
    try {
      if (editingId) {
        await update(ref(rtdb, `${RTDB_PATH}/${editingId}`), payload);
        showToast('Candidate mise à jour', 'success');
      } else {
        const newRef = push(ref(rtdb, RTDB_PATH));
        await set(newRef, { ...payload, votes: 0 });
        showToast('Candidate ajoutée', 'success');
      }
      setFormData(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
    } catch {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleEdit = (c: Candidate) => {
    setFormData({
      order: c.order.toString(), name: c.name, slug: c.slug,
      photo: c.photo, bio: c.bio, status: c.status,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette candidate ?')) return;
    try {
      await remove(ref(rtdb, `${RTDB_PATH}/${id}`));
      showToast('Candidate supprimée', 'success');
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleResetVotes = async (c: { id: string; name: string }) => {
    if (!confirm(`Remettre les votes de ${c.name} à zéro ?\nLes transactions validées seront marquées comme annulées dans la comptabilité.`)) return;
    try {
      // 1. Reset vote count on the candidate
      await update(ref(rtdb, `${RTDB_PATH}/${c.id}`), { votes: 0 });

      // 2. Mark all validated pending votes for this candidate as cancelled
      //    so the accounting tab stays balanced
      const toCancel = pendingVotes.filter(v => v.candidateId === c.id && v.validated && !v.cancelled);
      await Promise.all(toCancel.map(v =>
        update(ref(rtdb, `missOneLight/pendingVotes/${v.id}`), {
          cancelled: true,
          cancelledAt: new Date().toISOString(),
        })
      ));

      showToast(`Votes de ${c.name} remis à zéro${toCancel.length > 0 ? ` · ${toCancel.length} transaction(s) annulée(s)` : ''}`, 'success');
    } catch {
      showToast('Erreur lors de la remise à zéro', 'error');
    }
  };

  const handleCancel = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const statusLabel: Record<string, string> = { active: 'Active', hidden: 'Masquée', winner: 'Gagnante' };
  const statusColor: Record<string, string> = {
    active: 'bg-green-500/20 text-green-300',
    hidden: 'bg-gray-500/20 text-gray-400',
    winner: 'bg-yellow-500/20 text-yellow-300',
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <img src="/logo.svg" alt="PMM" className="w-24 h-24 animate-pulse" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white">Gestion Miss One Light</h1>
            <p className="text-white/40 text-sm mt-1">Realtime Database · missOneLight</p>
          </div>
          <div className="flex gap-3">
            {activeTab === 'candidates' && candidates.length === 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition-all"
              >
                <Upload size={18} />
                {importing ? 'Import...' : 'Importer les 12 candidates'}
              </button>
            )}
            {activeTab === 'candidates' && (
              <button
                onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData(EMPTY_FORM); }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition-all"
              >
                <Plus size={18} />
                Ajouter
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'candidates' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
          >
            Candidates ({candidates.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-amber-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
          >
            <Clock size={14} />
            Votes en attente
            {pendingVotes.filter(v => !v.validated).length > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
                {pendingVotes.filter(v => !v.validated).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('comptabilite')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'comptabilite' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
          >
            <TrendingUp size={14} />
            Comptabilité
          </button>
          <button
            onClick={() => setActiveTab('voting-control')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'voting-control' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
          >
            <CheckCircle size={14} />
            Contrôle des votes
          </button>
        </div>

        {/* Form */}
        {activeTab === 'candidates' && showForm && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-white mb-5">
              {editingId ? 'Modifier la candidate' : 'Nouvelle candidate'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-1">Ordre de passage</label>
                  <input type="number" min="1" value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    placeholder="1" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Nom</label>
                  <input type="text" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    placeholder="LÉONCIA" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Slug</label>
                  <input type="text" value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                    placeholder="leoncia" />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Photo</label>
                  <div className="flex gap-2">
                    <input type="url" value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                      placeholder="https://... ou uploader →" />
                    <button type="button" onClick={() => formFileRef.current?.click()}
                      disabled={formUploading}
                      className="bg-white/10 hover:bg-white/20 disabled:opacity-50 border border-white/20 text-white px-3 py-2 rounded-lg flex items-center gap-1 text-sm transition-all whitespace-nowrap">
                      <Upload size={14} />
                      {formUploading ? 'Upload...' : 'Fichier'}
                    </button>
                  </div>
                  {formData.photo && (
                    <img src={formData.photo} alt="Aperçu" className="h-20 w-20 object-cover rounded-lg mt-2" />
                  )}
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-1">Statut</label>
                  <select value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Candidate['status'] })}
                    className="w-full bg-slate-800 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500">
                    <option value="active">Active</option>
                    <option value="hidden">Masquée</option>
                    <option value="winner">Gagnante</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-1">Biographie courte</label>
                <textarea value={formData.bio} rows={3}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                  placeholder="Quelques mots sur la candidate..." />
              </div>
              {formData.photo && (
                <img src={formData.photo} alt="Aperçu" className="h-28 w-28 object-cover rounded-lg" />
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all">
                  <Save size={16} />
                  {editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button type="button" onClick={handleCancel}
                  className="bg-gray-500/30 hover:bg-gray-500/50 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-all">
                  <X size={16} />
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hidden file inputs */}
        <input ref={rowFileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleRowUpload(e.target.files[0]); e.target.value = ''; }} />
        <input ref={formFileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) handleFormUpload(e.target.files[0]); e.target.value = ''; }} />

        {/* Table */}
        {activeTab === 'candidates' && (
        <div>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-4 py-4 text-left text-white/70 text-sm font-semibold">#</th>
                  <th className="px-4 py-4 text-left text-white/70 text-sm font-semibold">Photo</th>
                  <th className="px-4 py-4 text-left text-white/70 text-sm font-semibold">Nom</th>
                  <th className="px-4 py-4 text-left text-white/70 text-sm font-semibold">Slug</th>
                  <th className="px-4 py-4 text-left text-white/70 text-sm font-semibold">Statut</th>
                  <th className="px-4 py-4 text-left text-white/70 text-sm font-semibold">Votes</th>
                  <th className="px-4 py-4 text-left text-white/70 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                    <td className="px-4 py-3 text-white font-bold">{c.order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.photo
                          ? <img src={c.photo} alt={c.name} className="h-10 w-10 object-cover rounded-lg" />
                          : <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center text-white/30 text-xs">—</div>
                        }
                        <button
                          onClick={() => { pendingRowId.current = c.id; rowFileRef.current?.click(); }}
                          disabled={uploadingId === c.id}
                          title="Changer la photo"
                          className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white/60 hover:text-white p-1.5 rounded-lg transition-all"
                        >
                          {uploadingId === c.id
                            ? <span className="loading loading-spinner loading-xs text-white" />
                            : <Upload size={14} />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">{c.name}</td>
                    <td className="px-4 py-3 text-white/50 text-sm font-mono">{c.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor[c.status]}`}>
                        {statusLabel[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-pink-400 font-bold">{c.votes}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(c)}
                          className="bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 p-2 rounded-lg transition-all">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleResetVotes(c)}
                          title="Remettre les votes à zéro"
                          className="bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 p-2 rounded-lg transition-all">
                          <RotateCcw size={16} />
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="bg-red-500/20 hover:bg-red-500/40 text-red-300 p-2 rounded-lg transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {candidates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">Aucune candidate. Cliquez sur "Importer les 12 candidates" pour démarrer.</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total candidates</p>
            <p className="text-4xl font-bold text-white">{candidates.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Total votes</p>
            <p className="text-4xl font-bold text-pink-400">{candidates.reduce((s, c) => s + c.votes, 0)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">En tête</p>
            <p className="text-2xl font-bold text-white">
              {candidates.length > 0 ? candidates.reduce((m, c) => c.votes > m.votes ? c : m).name : '—'}
            </p>
          </div>
        </div>
        </div>
        )} {/* end candidates tab */}

        {/* Pending Votes Tab */}
        {activeTab === 'pending' && (() => {
          const allWaiting = pendingVotes.filter(v => !v.validated && !v.cancelled);
          const allDone = pendingVotes.filter(v => v.validated || v.cancelled);
          
          // Apply filters
          const waiting = getFilteredVotes(allWaiting);
          const done = getFilteredVotes(allDone);

          const sortFn = (a: MissOneLightPendingVote, b: MissOneLightPendingVote) => {
            let cmp = 0;
            if (pendingSort === 'date')      cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
            if (pendingSort === 'candidate') cmp = a.candidateName.localeCompare(b.candidateName);
            if (pendingSort === 'amount')    cmp = a.votes - b.votes;
            return pendingSortDir === 'asc' ? cmp : -cmp;
          };

          const toggleSort = (col: typeof pendingSort) => {
            if (pendingSort === col) setPendingSortDir(d => d === 'asc' ? 'desc' : 'asc');
            else { setPendingSort(col); setPendingSortDir('desc'); }
          };

          const SortBtn = ({ col, label }: { col: typeof pendingSort; label: string }) => (
            <button
              onClick={() => toggleSort(col)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all border ${
                pendingSort === col
                  ? 'bg-white/20 border-white/30 text-white'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
              }`}
            >
              {label}
              {pendingSort === col && <span className="text-[10px]">{pendingSortDir === 'desc' ? '↓' : '↑'}</span>}
            </button>
          );

          const sortedWaiting = [...waiting].sort(sortFn);
          const sortedDone = [...done].sort(sortFn);

          const VoteCard = ({ v }: { v: MissOneLightPendingVote }) => (
            <div className={`bg-white/5 border rounded-2xl p-4 space-y-3 transition-all relative ${
              v.cancelled ? 'border-red-500/20 opacity-50' : v.validated ? 'border-green-500/20 opacity-70' : 'border-white/10 hover:border-amber-400/30'
            } ${selectedVotes.has(v.id) ? 'ring-2 ring-amber-400/50' : ''}`}>
              {/* Checkbox for batch selection */}
              {!v.validated && !v.cancelled && (
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedVotes.has(v.id)}
                    onChange={() => toggleVoteSelection(v.id)}
                    className="w-5 h-5 rounded border-white/30 bg-white/10 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </div>
              )}
              
              {/* Top row: candidate + status + amount */}
              <div className={`flex items-start justify-between gap-3 ${!v.validated && !v.cancelled ? 'pl-8' : ''}`}>
                <div className="min-w-0">
                  <p className="text-white font-bold truncate">{v.candidateName}</p>
                  <p className="text-white/40 text-xs font-mono mt-0.5 truncate">{v.txRef}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {v.cancelled
                    ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">Annulé</span>
                    : v.validated
                    ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">Validé</span>
                    : <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">En attente</span>
                  }
                  <span className="text-amber-400 font-black text-sm">{v.votes * 100} FCFA</span>
                </div>
              </div>

              {/* Votes row */}
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-white/30 text-xs">Achetés</span>
                  <p className="text-pink-400 font-bold">{v.votes}</p>
                </div>
                {(v.bonusVotes ?? 0) > 0 && (
                  <div>
                    <span className="text-white/30 text-xs">Bonus</span>
                    <p className="text-[#009E60] font-bold">+{v.bonusVotes}</p>
                  </div>
                )}
                <div>
                  <span className="text-white/30 text-xs">Total</span>
                  <p className="text-white font-black">{v.totalVotes ?? v.votes}</p>
                </div>
              </div>

              {/* Contact row */}
              <div className="text-xs text-white/40 space-y-0.5">
                {v.voterName && <p className="text-white/60 font-semibold">👤 {v.voterName}</p>}
                <p className="truncate">📧 {v.email}</p>
                <p>📱 {v.phone}</p>
                <p className="text-white/25">
                  🕐 {new Date(v.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {v.validatedAt && (
                    <span className="ml-2 text-green-400/60">
                      · validé {new Date(v.validatedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {v.cancelledAt && (
                    <span className="ml-2 text-red-400/60">
                      · annulé {new Date(v.cancelledAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className={`flex gap-2 pt-1 ${!v.validated && !v.cancelled ? 'pl-8' : ''}`}>
                {!v.validated && !v.cancelled && (
                  <button
                    onClick={() => handleQuickValidate(v)}
                    disabled={validating === v.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/40 disabled:opacity-50 text-green-300 text-xs font-bold transition-all"
                  >
                    {validating === v.id
                      ? <span className="loading loading-spinner loading-xs text-green-300" />
                      : <CheckCircle size={14} />
                    }
                    Valider
                  </button>
                )}
                <button
                  onClick={() => handleWhatsApp(v)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#25D366] text-xs font-bold transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WA
                </button>
                <button
                  onClick={() => handleDeletePending(v.id)}
                  className="flex items-center justify-center px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all"
                >
                  <Trash2 size={14} />
                </button>
                {/* Edit button - available for all non-cancelled votes (including validated) */}
                {!v.cancelled && (
                  <button
                    onClick={() => startEditVote(v)}
                    className="flex items-center justify-center px-3 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-all"
                    title="Modifier les informations du votant"
                  >
                    <User size={14} />
                  </button>
                )}
              </div>
            </div>
          );

          return (
            <div className="space-y-6">
              {/* ENHANCED KPI with Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">En attente</p>
                  <p className="text-2xl font-bold text-amber-400">{voteStats.totalPending}</p>
                  <p className="text-white/30 text-xs mt-1">{waiting.length} transactions</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Validés</p>
                  <p className="text-2xl font-bold text-green-400">{voteStats.totalValidated}</p>
                  <p className="text-white/30 text-xs mt-1">{pendingVotes.filter(v => v.validated && !v.cancelled).length} transactions</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Montant Total</p>
                  <p className="text-2xl font-bold text-pink-400">{voteStats.totalAmount.toLocaleString()} F</p>
                  <p className="text-white/30 text-xs mt-1">{pendingVotes.length} transactions</p>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Sélectionnés</p>
                  <p className="text-2xl font-bold text-blue-400">{selectedVotes.size}</p>
                  <p className="text-white/30 text-xs mt-1">votes à valider</p>
                </div>
              </div>

              {/* ENHANCED Controls: Search, Filter, Batch Actions, Export */}
              <div className="space-y-4">
                {/* Row 1: Search and Filter */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Rechercher (nom, email, téléphone, transaction...)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <select
                    value={filterCandidate}
                    onChange={(e) => setFilterCandidate(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="all" className="bg-slate-800">Toutes les candidates</option>
                    {candidates.map(c => (
                      <option key={c.id} value={c.name} className="bg-slate-800">
                        {c.name} ({voteStats.byCandidate[c.name]?.pending || 0} en attente)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={exportVotes}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Exporter PDF
                  </button>
                </div>

                {/* Row 2: Batch Actions and Mode */}
                {pendingSubTab === 'waiting' && selectedVotes.size > 0 && (
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <span className="text-amber-300 text-sm font-semibold">
                      {selectedVotes.size} vote(s) sélectionné(s)
                    </span>
                    <button
                      onClick={handleBatchValidate}
                      disabled={batchValidating}
                      className="bg-green-500/20 hover:bg-green-500/40 disabled:opacity-50 text-green-300 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                    >
                      {batchValidating ? (
                        <span className="loading loading-spinner loading-xs text-green-300" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Valider en masse
                    </button>
                    <button
                      onClick={() => setSelectedVotes(new Set())}
                      className="bg-white/10 hover:bg-white/20 text-white/70 px-3 py-2 rounded-lg text-sm transition-all"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Row 3: Sub-tabs and Sort */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPendingSubTab('waiting')}
                      className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 ${pendingSubTab === 'waiting' ? 'bg-amber-500 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                      En attente
                      {allWaiting.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{allWaiting.length}</span>
                      )}
                    </button>
                    <button
                      onClick={() => setPendingSubTab('done')}
                      className={`px-4 py-2.5 text-sm font-bold rounded-t-xl transition-all flex items-center gap-2 ${pendingSubTab === 'done' ? 'bg-green-600 text-white' : 'text-white/50 hover:text-white'}`}
                    >
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Traités ({allDone.length})
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingSubTab === 'waiting' && allWaiting.length > 0 && (
                      <button
                        onClick={selectAllWaiting}
                        className="text-xs font-semibold text-white/50 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                      >
                        {selectedVotes.size === allWaiting.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                      </button>
                    )}
                    <span className="text-white/30 text-xs">Trier :</span>
                    <SortBtn col="date" label="Date" />
                    <SortBtn col="candidate" label="Candidate" />
                    <SortBtn col="amount" label="Montant" />
                  </div>
                </div>
              </div>

              {/* Sub-tab content */}
              {pendingSubTab === 'waiting' && (
                sortedWaiting.length === 0
                  ? <p className="text-white/30 text-sm py-10 text-center border border-white/10 rounded-2xl">Aucune demande en attente</p>
                  : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sortedWaiting.map(v => <VoteCard key={v.id} v={v} />)}
                    </div>
              )}

              {pendingSubTab === 'done' && (
                sortedDone.length === 0
                  ? <p className="text-white/30 text-sm py-10 text-center border border-white/10 rounded-2xl">Aucune transaction traitée</p>
                  : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {sortedDone.map(v => <VoteCard key={v.id} v={v} />)}
                    </div>
              )}
            </div>
          );
        })()}

        {/* Comptabilité Tab */}
        {activeTab === 'comptabilite' && (() => {
          const validated = pendingVotes.filter(v => v.validated && !v.cancelled);
          const cancelled = pendingVotes.filter(v => v.cancelled);
          const pending = pendingVotes.filter(v => !v.validated && !v.cancelled);

          const totalRevenue = validated.reduce((s, v) => s + v.votes * 100, 0);
          const pendingRevenue = pending.reduce((s, v) => s + v.votes * 100, 0);
          const cancelledRevenue = cancelled.reduce((s, v) => s + v.votes * 100, 0);
          const totalVotesSold = validated.reduce((s, v) => s + v.votes, 0);
          const totalBonusGiven = validated.reduce((s, v) => s + (v.bonusVotes ?? 0), 0);
          const totalVotesCredited = validated.reduce((s, v) => s + (v.totalVotes ?? v.votes), 0);

          // Per-candidate breakdown
          const byCandidate: Record<string, {
            name: string;
            revenue: number;
            votesSold: number;
            bonusVotes: number;
            totalVotes: number;
            transactions: number;
          }> = {};
          for (const v of validated) {
            if (!byCandidate[v.candidateId]) {
              byCandidate[v.candidateId] = { name: v.candidateName, revenue: 0, votesSold: 0, bonusVotes: 0, totalVotes: 0, transactions: 0 };
            }
            byCandidate[v.candidateId].revenue += v.votes * 100;
            byCandidate[v.candidateId].votesSold += v.votes;
            byCandidate[v.candidateId].bonusVotes += v.bonusVotes ?? 0;
            byCandidate[v.candidateId].totalVotes += v.totalVotes ?? v.votes;
            byCandidate[v.candidateId].transactions += 1;
          }
          const candidateRows = Object.values(byCandidate).sort((a, b) => b.revenue - a.revenue);

          return (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5">
                  <p className="text-emerald-400/60 text-xs uppercase tracking-widest mb-1">Revenus encaissés</p>
                  <p className="text-2xl font-black text-emerald-400">{totalRevenue.toLocaleString()} FCFA</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                  <p className="text-amber-400/60 text-xs uppercase tracking-widest mb-1">En attente</p>
                  <p className="text-2xl font-black text-amber-400">{pendingRevenue.toLocaleString()} FCFA</p>
                </div>
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-2xl p-5">
                  <p className="text-pink-400/60 text-xs uppercase tracking-widest mb-1">Votes vendus</p>
                  <p className="text-2xl font-black text-pink-400">{totalVotesSold}</p>
                </div>
                <div className="bg-[#009E60]/10 border border-[#009E60]/30 rounded-2xl p-5">
                  <p className="text-[#009E60]/60 text-xs uppercase tracking-widest mb-1">Bonus offerts</p>
                  <p className="text-2xl font-black text-[#009E60]">+{totalBonusGiven}</p>
                </div>
              </div>

              {/* Summary row */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-wrap gap-6">
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Total votes crédités</p>
                  <p className="text-xl font-black text-white">{totalVotesCredited}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Transactions validées</p>
                  <p className="text-xl font-black text-white">{validated.length}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Taux bonus moyen</p>
                  <p className="text-xl font-black text-[#009E60]">
                    {totalVotesSold > 0 ? ((totalBonusGiven / totalVotesSold) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Revenu total (+ attente)</p>
                  <p className="text-xl font-black text-white">{(totalRevenue + pendingRevenue).toLocaleString()} FCFA</p>
                </div>
                {cancelledRevenue > 0 && (
                  <div>
                    <p className="text-red-400/60 text-xs uppercase tracking-widest mb-1">Annulés (reset)</p>
                    <p className="text-xl font-black text-red-400">-{cancelledRevenue.toLocaleString()} FCFA</p>
                  </div>
                )}
              </div>

              {/* Per-candidate breakdown */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10">
                  <h3 className="text-white font-bold">Répartition par candidate</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        <th className="px-4 py-3 text-left text-white/60 text-xs uppercase tracking-widest">Candidate</th>
                        <th className="px-4 py-3 text-right text-white/60 text-xs uppercase tracking-widest">Transactions</th>
                        <th className="px-4 py-3 text-right text-white/60 text-xs uppercase tracking-widest">Votes achetés</th>
                        <th className="px-4 py-3 text-right text-[#009E60]/60 text-xs uppercase tracking-widest">Bonus</th>
                        <th className="px-4 py-3 text-right text-white/60 text-xs uppercase tracking-widest">Total crédités</th>
                        <th className="px-4 py-3 text-right text-emerald-400/60 text-xs uppercase tracking-widest">Revenus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateRows.map((row, i) => (
                        <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-all">
                          <td className="px-4 py-3 text-white font-semibold">{row.name}</td>
                          <td className="px-4 py-3 text-white/50 text-right">{row.transactions}</td>
                          <td className="px-4 py-3 text-pink-400 font-bold text-right">{row.votesSold}</td>
                          <td className="px-4 py-3 text-[#009E60] font-bold text-right">+{row.bonusVotes}</td>
                          <td className="px-4 py-3 text-white font-black text-right">{row.totalVotes}</td>
                          <td className="px-4 py-3 text-emerald-400 font-black text-right">{row.revenue.toLocaleString()} FCFA</td>
                        </tr>
                      ))}
                      {candidateRows.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-8 text-white/30">Aucune transaction validée</td></tr>
                      )}
                    </tbody>
                    {candidateRows.length > 0 && (
                      <tfoot>
                        <tr className="bg-white/5 border-t-2 border-white/20">
                          <td className="px-4 py-3 text-white font-black">TOTAL</td>
                          <td className="px-4 py-3 text-white/50 text-right font-bold">{validated.length}</td>
                          <td className="px-4 py-3 text-pink-400 font-black text-right">{totalVotesSold}</td>
                          <td className="px-4 py-3 text-[#009E60] font-black text-right">+{totalBonusGiven}</td>
                          <td className="px-4 py-3 text-white font-black text-right">{totalVotesCredited}</td>
                          <td className="px-4 py-3 text-emerald-400 font-black text-right">{totalRevenue.toLocaleString()} FCFA</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Bonus rule reminder */}
              <div className="bg-[#009E60]/5 border border-[#009E60]/20 rounded-2xl p-4 flex items-start gap-3">
                <span className="text-[#009E60] text-xl">🎁</span>
                <div>
                  <p className="text-[#009E60] font-bold text-sm mb-1">Règle bonus active</p>
                  <p className="text-white/50 text-sm">+5 votes offerts par tranche de 10 votes achetés (20%). Ex : 10 votes achetés = 15 crédités, 20 = 30, 50 = 75.</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-2xl backdrop-blur-xl text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/40 text-green-300' : 'bg-red-500/10 border-red-500/40 text-red-300'}`}>
          {toast.message}
          <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Confirmer la validation</h3>
            <div className="space-y-2 text-sm mb-6">
              <p className="text-white/70">
                <span className="text-white font-semibold">Candidate:</span> {showConfirmModal.candidateName}
              </p>
              <p className="text-white/70">
                <span className="text-white font-semibold">Votant:</span> {showConfirmModal.voterName || 'Anonyme'} ({showConfirmModal.email})
              </p>
              <p className="text-white/70">
                <span className="text-white font-semibold">Votes:</span>{' '}
                <span className="text-pink-400 font-bold">{showConfirmModal.votes}</span> achetés
                {(showConfirmModal.bonusVotes ?? 0) > 0 && (
                  <span className="text-[#009E60]"> + {showConfirmModal.bonusVotes} bonus</span>
                )}
                {' = '}
                <span className="text-amber-400 font-black">{showConfirmModal.totalVotes ?? showConfirmModal.votes} total</span>
              </p>
              <p className="text-white/70">
                <span className="text-white font-semibold">Montant:</span>{' '}
                <span className="text-emerald-400 font-bold">{(showConfirmModal.votes * 100).toLocaleString()} FCFA</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
              >
                Annuler
              </button>
              <button
                onClick={confirmValidate}
                disabled={validating === showConfirmModal.id}
                className="flex-1 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/40 disabled:opacity-50 text-green-300 font-bold transition-all flex items-center justify-center gap-2"
              >
                {validating === showConfirmModal.id ? (
                  <span className="loading loading-spinner loading-xs text-green-300" />
                ) : (
                  <CheckCircle size={18} />
                )}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Voter Modal */}
      {editingVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-1">Modifier le votant</h3>
            <p className="text-white/50 text-sm mb-3">
              Candidate: <span className="text-pink-400 font-semibold">{editingVote.candidateName}</span>
            </p>
            {editingVote.validated && (
              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2.5 mb-4">
                <span className="text-amber-400 text-base mt-0.5">⚠️</span>
                <p className="text-amber-300 text-xs leading-relaxed">
                  Ce vote est déjà <strong>validé</strong>. La modification met à jour uniquement les coordonnées du votant, sans affecter les votes crédités.
                </p>
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Nom du votant</label>
                <input
                  type="text"
                  value={editFormData.voterName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, voterName: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                  placeholder="Nom complet"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Email *</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <label className="block text-white/60 text-sm mb-1.5">Téléphone *</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                  placeholder="+237 6XX XXX XXX"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingVote(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEditVote}
                disabled={savingEdit}
                className="flex-1 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/40 disabled:opacity-50 text-blue-300 font-bold transition-all flex items-center justify-center gap-2"
              >
                {savingEdit ? (
                  <span className="loading loading-spinner loading-xs text-blue-300" />
                ) : (
                  <Save size={18} />
                )}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voting Control Tab */}
      {activeTab === 'voting-control' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-2">Contrôle des votes</h2>
            <p className="text-white/50 text-sm">
              Activez ou désactivez les votes manuellement, ou configurez une date limite pour une désactivation automatique.
            </p>
          </div>

          {/* Status Card */}
          <div className={`border rounded-2xl p-6 ${votingEnabled ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${votingEnabled ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <h3 className="text-xl font-bold text-white">
                Statut actuel : {votingEnabled ? 'Votes ACTIVÉS' : 'Votes DÉSACTIVÉS'}
              </h3>
            </div>
            <p className="text-white/60 text-sm">
              {votingEnabled 
                ? '✅ Les utilisateurs peuvent actuellement voter pour les candidates.' 
                : '🚫 Les votes sont actuellement désactivés. Les utilisateurs ne peuvent pas voter.'}
            </p>
          </div>

          {/* Configuration Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Configuration</h3>
              
              {/* Manual Toggle */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold mb-1">Activation manuelle</p>
                    <p className="text-white/50 text-xs">Activez ou désactivez les votes immédiatement</p>
                  </div>
                  <button
                    onClick={() => setVotingEnabled(!votingEnabled)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      votingEnabled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        votingEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Deadline Configuration */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <p className="text-white font-semibold mb-1">Date limite des votes</p>
                <p className="text-white/50 text-xs mb-3">
                  Les votes seront automatiquement désactivés à cette date
                </p>
                <input
                  type="datetime-local"
                  value={votingDeadline}
                  onChange={(e) => setVotingDeadline(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
                />
                <p className="text-white/40 text-xs mt-2">
                  📅 Actuellement configuré pour : {new Date(votingDeadline).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveVotingConfig}
              disabled={savingVotingConfig}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              {savingVotingConfig ? (
                <span className="loading loading-spinner loading-sm text-white" />
              ) : (
                <Save size={18} />
              )}
              Enregistrer la configuration
            </button>
          </div>

          {/* Info Card */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 text-xl">ℹ️</span>
              <div className="flex-1">
                <p className="text-blue-300 font-semibold mb-2">Comment ça fonctionne ?</p>
                <ul className="text-white/60 text-sm space-y-1.5">
                  <li>• <strong>Activation manuelle :</strong> Désactivez immédiatement les votes avec le bouton toggle</li>
                  <li>• <strong>Date limite :</strong> Les votes seront automatiquement désactivés à la date configurée</li>
                  <li>• <strong>Compte à rebours :</strong> Le compte à rebours sur la page publique s'arrête automatiquement</li>
                  <li>• <strong>Boutons de vote :</strong> Les boutons "Voter" disparaissent quand les votes sont désactivés</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Temps restant</p>
              <p className="text-2xl font-bold text-white">
                {(() => {
                  const now = new Date();
                  const deadline = new Date(votingDeadline);
                  const diff = deadline.getTime() - now.getTime();
                  if (diff <= 0) return 'Terminé';
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  return `${days}j ${hours}h`;
                })()}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Total votes validés</p>
              <p className="text-2xl font-bold text-pink-400">
                {pendingVotes.filter(v => v.validated && !v.cancelled).reduce((s, v) => s + (v.totalVotes ?? v.votes), 0)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Candidates actives</p>
              <p className="text-2xl font-bold text-white">
                {candidates.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
