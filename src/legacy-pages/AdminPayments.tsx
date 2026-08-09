import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeftIcon, PlusIcon, TrashIcon, FunnelIcon,
  ArrowTrendingUpIcon, ArrowTrendingDownIcon, BanknotesIcon,
  PencilIcon, XMarkIcon, CheckIcon
} from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { Transaction, TransactionType, TransactionCategory, MonthlyPayment } from '../types';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import { ref, update, remove, push, set } from 'firebase/database';
import { db } from '../realtimedbConfig';

const CATEGORIES_REVENU: TransactionCategory[] = ['Booking Client', 'Fashion Day', 'Casting', 'Formation', 'Paiement Mannequin', 'Autre'];
const CATEGORIES_DEPENSE: TransactionCategory[] = ['Loyer', 'Équipement', 'Marketing', 'Salaires', 'Fournitures', 'Transport', 'Autre'];
const ALL_CATEGORIES: TransactionCategory[] = [...new Set([...CATEGORIES_REVENU, ...CATEGORIES_DEPENSE])];
const METHODS: Transaction['method'][] = ['Virement', 'Espèces', 'Mobile Money', 'Chèque', 'Autre'];
const PAYMENT_STATUSES: MonthlyPayment['status'][] = ['Payé', 'En attente', 'En retard'];
const PAYMENT_METHODS: MonthlyPayment['method'][] = ['Virement', 'Espèces', 'Autre'];

const STATUS_COLORS: Record<MonthlyPayment['status'], string> = {
  'Payé': 'bg-green-500/20 text-green-300 border-green-500',
  'En attente': 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
  'En retard': 'bg-red-500/20 text-red-300 border-red-500',
};

const fmt = (n: number) => n.toLocaleString('fr-FR') + ' XAF';

const EMPTY_TX: Omit<Transaction, 'id' | 'createdAt'> = {
  date: new Date().toISOString().split('T')[0],
  type: 'Revenu',
  category: 'Booking Client',
  label: '',
  amount: 0,
  method: 'Virement',
  reference: '',
  notes: '',
};

const EMPTY_PAY: Omit<MonthlyPayment, 'id'> = {
  modelId: '', modelName: '', month: '', amount: 0,
  paymentDate: '', method: 'Virement', status: 'En attente', notes: ''
};

type Tab = 'overview' | 'transactions' | 'payments';

const AdminPayments: React.FC = () => {
  const { data } = useData();
  const { items: transactions, refresh: refreshTx } = useFirebaseCollection<Transaction>('transactions', { pageSize: 500, orderBy: 'date' });
  const { items: payments, refresh: refreshPay } = useFirebaseCollection<MonthlyPayment>('monthlyPayments', { pageSize: 500, orderBy: 'month' });
  const models = data?.models ?? [];

  const [tab, setTab] = useState<Tab>('overview');
  const [showTxForm, setShowTxForm] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [txForm, setTxForm] = useState(EMPTY_TX);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState(EMPTY_PAY);

  // Filters for transactions
  const [filterType, setFilterType] = useState<TransactionType | 'Tous'>('Tous');
  const [filterCat, setFilterCat] = useState<string>('Tous');
  const [filterMonth, setFilterMonth] = useState('');

  // Filters for payments
  const [payFilterStatus, setPayFilterStatus] = useState<MonthlyPayment['status'] | 'Tous'>('Tous');
  const [payFilterModel, setPayFilterModel] = useState('Tous');
  const [payFilterMonth, setPayFilterMonth] = useState('');

  // --- Stats ---
  const stats = useMemo(() => {
    const totalRevenu = transactions.filter(t => t.type === 'Revenu').reduce((s, t) => s + t.amount, 0);
    const totalDepense = transactions.filter(t => t.type === 'Dépense').reduce((s, t) => s + t.amount, 0);
    const solde = totalRevenu - totalDepense;
    const paysPaid = payments.filter(p => p.status === 'Payé').reduce((s, p) => s + p.amount, 0);
    const paysPending = payments.filter(p => p.status !== 'Payé').reduce((s, p) => s + p.amount, 0);

    // By category
    const byCat: Record<string, number> = {};
    transactions.forEach(t => {
      byCat[t.category] = (byCat[t.category] ?? 0) + (t.type === 'Revenu' ? t.amount : -t.amount);
    });

    // By month (last 6)
    const byMonth: Record<string, { revenu: number; depense: number }> = {};
    transactions.forEach(t => {
      const m = t.date.slice(0, 7);
      if (!byMonth[m]) byMonth[m] = { revenu: 0, depense: 0 };
      if (t.type === 'Revenu') byMonth[m].revenu += t.amount;
      else byMonth[m].depense += t.amount;
    });
    const months = Object.keys(byMonth).sort().slice(-6);

    return { totalRevenu, totalDepense, solde, paysPaid, paysPending, byCat, byMonth, months };
  }, [transactions, payments]);

  // --- Filtered transactions ---
  const filteredTx = useMemo(() => transactions.filter(t => {
    const matchType = filterType === 'Tous' || t.type === filterType;
    const matchCat = filterCat === 'Tous' || t.category === filterCat;
    const matchMonth = !filterMonth || t.date.startsWith(filterMonth);
    return matchType && matchCat && matchMonth;
  }).sort((a, b) => b.date.localeCompare(a.date)), [transactions, filterType, filterCat, filterMonth]);

  // --- Filtered payments ---
  const filteredPay = useMemo(() => payments.filter(p => {
    const matchStatus = payFilterStatus === 'Tous' || p.status === payFilterStatus;
    const matchModel = payFilterModel === 'Tous' || p.modelName === payFilterModel;
    const matchMonth = !payFilterMonth || p.month === payFilterMonth;
    return matchStatus && matchModel && matchMonth;
  }).sort((a, b) => b.month.localeCompare(a.month)), [payments, payFilterStatus, payFilterModel, payFilterMonth]);

  const modelOptions = ['Tous', ...Array.from(new Set(payments.map(p => p.modelName))).sort()];

  // --- Handlers ---
  const handleSaveTx = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.label || !txForm.amount) return;
    if (editingTx) {
      await update(ref(db, `transactions/${editingTx.id}`), { ...txForm });
    } else {
      const newRef = push(ref(db, 'transactions'));
      await set(newRef, { ...txForm, id: newRef.key, createdAt: new Date().toISOString() });
    }
    invalidateCache('transactions');
    refreshTx();
    setTxForm(EMPTY_TX);
    setShowTxForm(false);
    setEditingTx(null);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxForm({ date: tx.date, type: tx.type, category: tx.category, label: tx.label, amount: tx.amount, method: tx.method, reference: tx.reference ?? '', notes: tx.notes ?? '' });
    setShowTxForm(true);
    setTab('transactions');
  };

  const handleDeleteTx = async (id: string) => {
    if (!window.confirm('Supprimer cette transaction ?')) return;
    await remove(ref(db, `transactions/${id}`));
    invalidateCache('transactions');
    refreshTx();
  };

  const handleSavePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.modelId || !payForm.month) return;
    const model = models.find(m => m.id === payForm.modelId);
    const newRef = push(ref(db, 'monthlyPayments'));
    await set(newRef, { ...payForm, id: newRef.key, modelName: model?.name ?? payForm.modelId });
    invalidateCache('monthlyPayments');
    refreshPay();
    setPayForm(EMPTY_PAY);
    setShowPayForm(false);
  };

  const handlePayStatus = async (id: string, status: MonthlyPayment['status']) => {
    await update(ref(db, `monthlyPayments/${id}`), { status });
    invalidateCache('monthlyPayments');
    refreshPay();
  };

  const handleDeletePay = async (id: string) => {
    if (!window.confirm('Supprimer ce paiement ?')) return;
    await remove(ref(db, `monthlyPayments/${id}`));
    invalidateCache('monthlyPayments');
    refreshPay();
  };

  const inputCls = "w-full bg-pm-dark border border-pm-gold/30 rounded px-3 py-2 text-sm text-pm-off-white focus:outline-none focus:border-pm-gold";
  const labelCls = "text-xs uppercase tracking-widest text-pm-off-white/40 mb-1 block";

  return (
    <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
      <SEO title="Admin — Finances" noIndex />
      <div className="container mx-auto px-6">
        <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-6 hover:underline text-sm">
          <ChevronLeftIcon className="w-4 h-4" /> Retour au Tableau de Bord
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-playfair text-pm-gold">Gestion Financière</h1>
            <p className="text-pm-off-white/40 text-sm mt-1">Revenus, dépenses et paiements mannequins</p>
          </div>
          <div className="flex gap-2">
            {tab === 'transactions' && (
              <button onClick={() => { setShowTxForm(v => !v); setEditingTx(null); setTxForm(EMPTY_TX); }}
                className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full hover:bg-pm-gold/80">
                <PlusIcon className="w-4 h-4" /> Nouvelle transaction
              </button>
            )}
            {tab === 'payments' && (
              <button onClick={() => setShowPayForm(v => !v)}
                className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full hover:bg-pm-gold/80">
                <PlusIcon className="w-4 h-4" /> Ajouter paiement
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-black/40 p-1 rounded-xl w-fit">
          {([['overview', 'Vue d\'ensemble'], ['transactions', 'Transactions'], ['payments', 'Paiements Mannequins']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${tab === key ? 'bg-pm-gold text-pm-dark' : 'text-pm-off-white/50 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ===== VUE D'ENSEMBLE ===== */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-black/40 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-400" />
                  <p className="text-xs text-pm-off-white/40 uppercase tracking-widest">Total Revenus</p>
                </div>
                <p className="text-3xl font-black text-green-400">{fmt(stats.totalRevenu)}</p>
              </div>
              <div className="bg-black/40 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
                  <p className="text-xs text-pm-off-white/40 uppercase tracking-widest">Total Dépenses</p>
                </div>
                <p className="text-3xl font-black text-red-400">{fmt(stats.totalDepense)}</p>
              </div>
              <div className={`bg-black/40 border rounded-xl p-6 ${stats.solde >= 0 ? 'border-pm-gold/30' : 'border-red-500/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <BanknotesIcon className="w-5 h-5 text-pm-gold" />
                  <p className="text-xs text-pm-off-white/40 uppercase tracking-widest">Solde Net</p>
                </div>
                <p className={`text-3xl font-black ${stats.solde >= 0 ? 'text-pm-gold' : 'text-red-400'}`}>{fmt(stats.solde)}</p>
              </div>
            </div>

            {/* Paiements mannequins résumé */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 border border-green-500/10 rounded-xl p-5">
                <p className="text-xs text-pm-off-white/40 uppercase tracking-widest mb-1">Paiements Encaissés</p>
                <p className="text-2xl font-black text-green-400">{fmt(stats.paysPaid)}</p>
              </div>
              <div className="bg-black/40 border border-yellow-500/10 rounded-xl p-5">
                <p className="text-xs text-pm-off-white/40 uppercase tracking-widest mb-1">En attente / Retard</p>
                <p className="text-2xl font-black text-yellow-400">{fmt(stats.paysPending)}</p>
              </div>
            </div>

            {/* Évolution mensuelle */}
            {stats.months.length > 0 && (
              <div className="bg-black/40 border border-pm-gold/10 rounded-xl p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-pm-gold mb-6">Évolution Mensuelle</h3>
                <div className="space-y-3">
                  {stats.months.map(m => {
                    const d = stats.byMonth[m];
                    const maxVal = Math.max(...stats.months.map(mo => Math.max(stats.byMonth[mo].revenu, stats.byMonth[mo].depense)), 1);
                    return (
                      <div key={m} className="space-y-1">
                        <div className="flex justify-between text-xs text-pm-off-white/40">
                          <span>{m}</span>
                          <span className="text-green-400">+{fmt(d.revenu)}</span>
                          <span className="text-red-400">-{fmt(d.depense)}</span>
                        </div>
                        <div className="flex gap-1 h-2">
                          <div className="bg-green-500/60 rounded-full" style={{ width: `${(d.revenu / maxVal) * 100}%` }} />
                          <div className="bg-red-500/60 rounded-full" style={{ width: `${(d.depense / maxVal) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Répartition par catégorie */}
            {Object.keys(stats.byCat).length > 0 && (
              <div className="bg-black/40 border border-pm-gold/10 rounded-xl p-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-pm-gold mb-6">Répartition par Catégorie</h3>
                <div className="space-y-3">
                  {Object.entries(stats.byCat).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).map(([cat, val]) => (
                    <div key={cat} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-pm-off-white/70 w-40 truncate">{cat}</span>
                      <div className="flex-1 bg-white/5 rounded-full h-2">
                        <div className={`h-2 rounded-full ${val >= 0 ? 'bg-green-500/60' : 'bg-red-500/60'}`}
                          style={{ width: `${Math.min(Math.abs(val) / Math.max(...Object.values(stats.byCat).map(Math.abs), 1) * 100, 100)}%` }} />
                      </div>
                      <span className={`text-sm font-mono font-bold w-36 text-right ${val >= 0 ? 'text-green-400' : 'text-red-400'}`}>{val >= 0 ? '+' : ''}{fmt(val)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transactions.length === 0 && payments.length === 0 && (
              <div className="text-center py-16 text-pm-off-white/30 italic">
                Aucune donnée financière. Commencez par ajouter des transactions.
              </div>
            )}
          </div>
        )}

        {/* ===== TRANSACTIONS ===== */}
        {tab === 'transactions' && (
          <div>
            {/* Formulaire transaction */}
            {showTxForm && (
              <form onSubmit={handleSaveTx} className="bg-black border border-pm-gold/20 rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <h3 className="sm:col-span-2 text-sm font-black uppercase tracking-widest text-pm-gold">
                  {editingTx ? 'Modifier la transaction' : 'Nouvelle transaction'}
                </h3>
                <div>
                  <label className={labelCls}>Type *</label>
                  <div className="flex gap-2">
                    {(['Revenu', 'Dépense'] as TransactionType[]).map(t => (
                      <button key={t} type="button" onClick={() => setTxForm(f => ({ ...f, type: t, category: t === 'Revenu' ? 'Booking Client' : 'Loyer' }))}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${txForm.type === t ? (t === 'Revenu' ? 'bg-green-500/20 border-green-500 text-green-300' : 'bg-red-500/20 border-red-500 text-red-300') : 'border-pm-gold/20 text-pm-off-white/40 hover:border-pm-gold/40'}`}>
                        {t === 'Revenu' ? '↑ Revenu' : '↓ Dépense'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Catégorie *</label>
                  <select required value={txForm.category} onChange={e => setTxForm(f => ({ ...f, category: e.target.value as TransactionCategory }))} className={inputCls}>
                    {(txForm.type === 'Revenu' ? CATEGORIES_REVENU : CATEGORIES_DEPENSE).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Libellé *</label>
                  <input required value={txForm.label} onChange={e => setTxForm(f => ({ ...f, label: e.target.value }))} placeholder="Ex: Booking Marque X, Loyer bureau..." className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Montant (XAF) *</label>
                  <input type="number" required min={1} value={txForm.amount || ''} onChange={e => setTxForm(f => ({ ...f, amount: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date *</label>
                  <input type="date" required value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Méthode</label>
                  <select value={txForm.method} onChange={e => setTxForm(f => ({ ...f, method: e.target.value as Transaction['method'] }))} className={inputCls}>
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Référence</label>
                  <input value={txForm.reference} onChange={e => setTxForm(f => ({ ...f, reference: e.target.value }))} placeholder="N° facture, reçu..." className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea value={txForm.notes} onChange={e => setTxForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full">
                    <CheckIcon className="w-4 h-4" /> {editingTx ? 'Mettre à jour' : 'Enregistrer'}
                  </button>
                  <button type="button" onClick={() => { setShowTxForm(false); setEditingTx(null); setTxForm(EMPTY_TX); }}
                    className="flex items-center gap-2 px-4 py-2 border border-pm-gold/30 text-pm-off-white text-sm rounded-full">
                    <XMarkIcon className="w-4 h-4" /> Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Filtres */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <FunnelIcon className="w-4 h-4 text-pm-off-white/30" />
              <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="bg-black border border-pm-gold/20 rounded px-3 py-1.5 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold" />
              <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
                className="bg-black border border-pm-gold/20 rounded px-3 py-1.5 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold">
                <option value="Tous">Toutes catégories</option>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {(['Tous', 'Revenu', 'Dépense'] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${filterType === t ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-pm-gold/30 text-pm-off-white/60 hover:border-pm-gold/60'}`}>
                  {t}
                </button>
              ))}
              {(filterMonth || filterCat !== 'Tous' || filterType !== 'Tous') && (
                <button onClick={() => { setFilterMonth(''); setFilterCat('Tous'); setFilterType('Tous'); }}
                  className="text-xs text-pm-off-white/40 hover:text-pm-off-white underline">Réinitialiser</button>
              )}
            </div>

            {/* Résumé filtré */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-black/40 border border-green-500/10 rounded-lg p-3 text-center">
                <p className="text-xs text-pm-off-white/40">Revenus</p>
                <p className="text-lg font-black text-green-400">{fmt(filteredTx.filter(t => t.type === 'Revenu').reduce((s, t) => s + t.amount, 0))}</p>
              </div>
              <div className="bg-black/40 border border-red-500/10 rounded-lg p-3 text-center">
                <p className="text-xs text-pm-off-white/40">Dépenses</p>
                <p className="text-lg font-black text-red-400">{fmt(filteredTx.filter(t => t.type === 'Dépense').reduce((s, t) => s + t.amount, 0))}</p>
              </div>
              <div className="bg-black/40 border border-pm-gold/10 rounded-lg p-3 text-center">
                <p className="text-xs text-pm-off-white/40">{filteredTx.length} entrée(s)</p>
                <p className="text-lg font-black text-pm-gold">{fmt(filteredTx.reduce((s, t) => s + (t.type === 'Revenu' ? t.amount : -t.amount), 0))}</p>
              </div>
            </div>

            <div className="bg-black border border-pm-gold/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-pm-dark/50">
                    <tr className="border-b border-pm-gold/20">
                      <th className="p-4 text-xs uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs uppercase tracking-wider">Type</th>
                      <th className="p-4 text-xs uppercase tracking-wider">Catégorie</th>
                      <th className="p-4 text-xs uppercase tracking-wider">Libellé</th>
                      <th className="p-4 text-xs uppercase tracking-wider hidden md:table-cell">Méthode</th>
                      <th className="p-4 text-xs uppercase tracking-wider hidden lg:table-cell">Réf.</th>
                      <th className="p-4 text-xs uppercase tracking-wider text-right">Montant</th>
                      <th className="p-4 text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map(tx => (
                      <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 text-sm text-pm-off-white/60">{tx.date}</td>
                        <td className="p-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${tx.type === 'Revenu' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {tx.type === 'Revenu' ? '↑' : '↓'} {tx.type}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-pm-off-white/50">{tx.category}</td>
                        <td className="p-4 text-sm font-medium max-w-[160px] truncate">{tx.label}</td>
                        <td className="p-4 text-xs text-pm-off-white/40 hidden md:table-cell">{tx.method}</td>
                        <td className="p-4 text-xs text-pm-off-white/30 hidden lg:table-cell">{tx.reference || '—'}</td>
                        <td className={`p-4 text-right font-mono font-bold ${tx.type === 'Revenu' ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.type === 'Revenu' ? '+' : '-'}{fmt(tx.amount)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEditTx(tx)} className="text-pm-gold/50 hover:text-pm-gold"><PencilIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteTx(tx.id)} className="text-red-500/50 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredTx.length === 0 && <p className="text-center p-8 text-pm-off-white/40 italic">Aucune transaction.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ===== PAIEMENTS MANNEQUINS ===== */}
        {tab === 'payments' && (
          <div>
            {showPayForm && (
              <form onSubmit={handleSavePay} className="bg-black border border-pm-gold/20 rounded-xl p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <h3 className="sm:col-span-2 text-sm font-black uppercase tracking-widest text-pm-gold">Nouveau paiement mannequin</h3>
                <div>
                  <label className={labelCls}>Mannequin *</label>
                  <select required value={payForm.modelId} onChange={e => setPayForm(f => ({ ...f, modelId: e.target.value }))} className={inputCls}>
                    <option value="">-- Sélectionner --</option>
                    {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Mois *</label>
                  <input type="month" required value={payForm.month} onChange={e => setPayForm(f => ({ ...f, month: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Montant (XAF)</label>
                  <input type="number" value={payForm.amount || ''} onChange={e => setPayForm(f => ({ ...f, amount: Number(e.target.value) }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Date de paiement</label>
                  <input type="date" value={payForm.paymentDate} onChange={e => setPayForm(f => ({ ...f, paymentDate: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Méthode</label>
                  <select value={payForm.method} onChange={e => setPayForm(f => ({ ...f, method: e.target.value as MonthlyPayment['method'] }))} className={inputCls}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Statut</label>
                  <select value={payForm.status} onChange={e => setPayForm(f => ({ ...f, status: e.target.value as MonthlyPayment['status'] }))} className={inputCls}>
                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={inputCls} />
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark text-sm font-bold rounded-full">
                    <CheckIcon className="w-4 h-4" /> Enregistrer
                  </button>
                  <button type="button" onClick={() => setShowPayForm(false)}
                    className="flex items-center gap-2 px-4 py-2 border border-pm-gold/30 text-pm-off-white text-sm rounded-full">
                    <XMarkIcon className="w-4 h-4" /> Annuler
                  </button>
                </div>
              </form>
            )}

            {/* Résumé paiements */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-black/40 border border-green-500/20 rounded-lg p-4">
                <p className="text-xs text-pm-off-white/40 uppercase tracking-widest">Encaissé</p>
                <p className="text-xl font-black text-green-400">{fmt(filteredPay.filter(p => p.status === 'Payé').reduce((s, p) => s + p.amount, 0))}</p>
              </div>
              <div className="bg-black/40 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-xs text-pm-off-white/40 uppercase tracking-widest">En attente</p>
                <p className="text-xl font-black text-yellow-400">{fmt(filteredPay.filter(p => p.status !== 'Payé').reduce((s, p) => s + p.amount, 0))}</p>
              </div>
              <div className="bg-black/40 border border-pm-gold/20 rounded-lg p-4">
                <p className="text-xs text-pm-off-white/40 uppercase tracking-widest">Total</p>
                <p className="text-xl font-black text-pm-gold">{fmt(filteredPay.reduce((s, p) => s + p.amount, 0))}</p>
              </div>
            </div>

            {/* Filtres paiements */}
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <FunnelIcon className="w-4 h-4 text-pm-off-white/30" />
              <input type="month" value={payFilterMonth} onChange={e => setPayFilterMonth(e.target.value)}
                className="bg-black border border-pm-gold/20 rounded px-3 py-1.5 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold" />
              <select value={payFilterModel} onChange={e => setPayFilterModel(e.target.value)}
                className="bg-black border border-pm-gold/20 rounded px-3 py-1.5 text-xs text-pm-off-white focus:outline-none focus:border-pm-gold">
                {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {(['Tous', ...PAYMENT_STATUSES] as const).map(s => (
                <button key={s} onClick={() => setPayFilterStatus(s)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${payFilterStatus === s ? 'bg-pm-gold text-pm-dark border-pm-gold font-bold' : 'border-pm-gold/30 text-pm-off-white/60 hover:border-pm-gold/60'}`}>
                  {s}
                </button>
              ))}
              {(payFilterMonth || payFilterModel !== 'Tous' || payFilterStatus !== 'Tous') && (
                <button onClick={() => { setPayFilterMonth(''); setPayFilterModel('Tous'); setPayFilterStatus('Tous'); }}
                  className="text-xs text-pm-off-white/40 hover:text-pm-off-white underline">Réinitialiser</button>
              )}
            </div>

            <div className="bg-black border border-pm-gold/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-pm-dark/50">
                    <tr className="border-b border-pm-gold/20">
                      <th className="p-4 text-xs uppercase tracking-wider">Mannequin</th>
                      <th className="p-4 text-xs uppercase tracking-wider hidden sm:table-cell">Mois</th>
                      <th className="p-4 text-xs uppercase tracking-wider hidden md:table-cell">Montant</th>
                      <th className="p-4 text-xs uppercase tracking-wider hidden lg:table-cell">Méthode</th>
                      <th className="p-4 text-xs uppercase tracking-wider hidden lg:table-cell">Notes</th>
                      <th className="p-4 text-xs uppercase tracking-wider">Statut</th>
                      <th className="p-4 text-xs uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPay.map(p => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 font-semibold">{p.modelName}</td>
                        <td className="p-4 hidden sm:table-cell text-sm text-pm-off-white/60">{p.month}</td>
                        <td className="p-4 hidden md:table-cell text-sm font-mono">{fmt(p.amount)}</td>
                        <td className="p-4 hidden lg:table-cell text-xs text-pm-off-white/50">{p.method}</td>
                        <td className="p-4 hidden lg:table-cell text-xs text-pm-off-white/40 max-w-[120px] truncate">{p.notes || '—'}</td>
                        <td className="p-4">
                          <select value={p.status} onChange={e => handlePayStatus(p.id, e.target.value as MonthlyPayment['status'])}
                            className={`text-xs font-bold rounded-full border px-2 py-1 bg-transparent cursor-pointer ${STATUS_COLORS[p.status]}`}>
                            {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeletePay(p.id)} className="text-red-500/50 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredPay.length === 0 && <p className="text-center p-8 text-pm-off-white/40 italic">Aucun paiement.</p>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPayments;
