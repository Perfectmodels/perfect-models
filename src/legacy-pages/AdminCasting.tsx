import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { CastingApplication, CastingApplicationStatus, Model } from '../types';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, TrashIcon, EyeIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import PrintableCastingSheet from '../components/icons/PrintableCastingSheet';
import { useFirebaseCollection, invalidateCache } from '../hooks/useFirebaseCollection';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { sendCastingAcceptedNotification, sendCastingRejectedNotification, sendCastingPresignedNotification } from '../utils/brevoService';
import { notifyAdmin } from '../utils/adminNotify';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const PAGE_SIZE = 15;

const AdminCasting: React.FC = () => {
    const { data, saveData } = useData();
    const {
        items: pagedApps,
        page, totalPages, nextPage, prevPage, isLoading, refresh,
    } = useFirebaseCollection<CastingApplication>('castingApplications', {
        pageSize: PAGE_SIZE,
        orderBy: 'submissionDate',
    });

    const [filter, setFilter] = useState<CastingApplicationStatus | 'Toutes'>('Nouveau');
    const [selectedApp, setSelectedApp] = useState<CastingApplication | null>(null);
    const [printingApp, setPrintingApp] = useState<CastingApplication | null>(null);

    const filteredApps = useMemo(() => {
        if (filter === 'Toutes') return pagedApps;
        return pagedApps.filter(app => app.status === filter);
    }, [filter, pagedApps]);

    const handleDelete = async (appId: string) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette candidature ?")) return;
        try {
            const { remove, ref: fbRef } = await import('firebase/database');
            const { db: fbDb } = await import('../realtimedbConfig');
            await remove(fbRef(fbDb, `castingApplications/${appId}`));
            invalidateCache('castingApplications');
            refresh();
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdateStatus = async (app: CastingApplication, newStatus: CastingApplicationStatus, rejectionReason?: string) => {
        try {
            const { update, ref: fbRef } = await import('firebase/database');
            const { db: fbDb } = await import('../realtimedbConfig');
            await update(fbRef(fbDb, `castingApplications/${app.id}`), { status: newStatus });
            invalidateCache('castingApplications');
            refresh();
            if (selectedApp?.id === app.id) setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);

            if (newStatus === 'Accepté') {
                sendCastingAcceptedNotification({
                    firstName: app.firstName,
                    lastName: app.lastName,
                    email: app.email,
                    phone: app.phone,
                    city: app.city,
                    height: app.height,
                    instagram: app.instagram,
                }).catch(() => {});
            } else if (newStatus === 'Refusé') {
                const reasons = rejectionReason?.trim() || 'Votre profil ne correspond pas à nos besoins actuels. Nous vous encourageons à réessayer lors de futurs castings.';
                sendCastingRejectedNotification({
                    firstName: app.firstName,
                    lastName: app.lastName,
                    email: app.email,
                    rejectionReasons: reasons,
                }).catch(() => {});
            } else if (newStatus === 'Présélectionné') {
                sendCastingPresignedNotification({
                    firstName: app.firstName,
                    lastName: app.lastName,
                    email: app.email,
                }).catch(() => {});
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleValidateAndCreateModel = async (app: CastingApplication) => {
        if (!data) return;

        const modelExists = data.models.some(m => m.name.toLowerCase() === `${app.firstName} ${app.lastName}`.toLowerCase());
        if (modelExists) {
            alert("Un mannequin avec ce nom existe déjà. Impossible de créer un duplicata.");
            return;
        }

        const currentYear = new Date().getFullYear();
        const sanitizeForPassword = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\']/g, "").replace(/[^a-z0-9-]/g, "");
        const sanitizeForEmail = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f\']/g, "").replace(/[^a-z0-9-]/g, "");

        const initial = app.firstName.charAt(0).toUpperCase();
        const modelsWithSameInitial = data.models.filter(m => m.username && m.username.startsWith(`Man-PMM${initial}`));
        const existingNumbers = modelsWithSameInitial.map(m => {
            const numPart = m.username.replace(`Man-PMM${initial}`, '');
            return parseInt(numPart, 10) || 0;
        });
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        const username = `Man-PMM${initial}${String(nextNumber).padStart(2, '0')}`;
        const password = `${sanitizeForPassword(app.firstName)}${currentYear}`;
        const id = `${app.lastName.toLowerCase()}-${app.firstName.toLowerCase()}`.replace(/[^a-z0-9-]/g, '') + `-${app.id}`;
        const email = `${sanitizeForEmail(app.firstName)}.${sanitizeForEmail(app.lastName)}@perfectmodels.online`;

        let experienceText = "Expérience à renseigner par l'administrateur.";
        switch (app.experience) {
            case 'none': experienceText = "Débutant(e) sans expérience préalable, prêt(e) à apprendre les bases du métier."; break;
            case 'beginner': experienceText = "A déjà participé à quelques shootings photo en amateur ou pour de petites marques."; break;
            case 'intermediate': experienceText = "A une expérience préalable en agence et a participé à des défilés ou des campagnes locales."; break;
            case 'professional': experienceText = "Carrière de mannequin professionnel(le) établie avec un portfolio solide."; break;
        }
        
        const age = app.birthDate ? new Date().getFullYear() - new Date(app.birthDate).getFullYear() : undefined;

        const newModel: Model = {
            id: id,
            name: `${app.firstName} ${app.lastName}`,
            username: username,
            password: password,
            email: email,
            phone: app.phone,
            age: age,
            height: `${app.height}cm`,
            gender: app.gender,
            location: app.city,
            imageUrl: app.photoPortraitUrl || app.photoFullBodyUrl || `https://i.ibb.co/fVBxPNTP/T-shirt.png`,
            isPublic: false,
            distinctions: [],
            measurements: {
                chest: `${app.chest || '0'}cm`,
                waist: `${app.waist || '0'}cm`,
                hips: `${app.hips || '0'}cm`,
                shoeSize: `${app.shoeSize || '0'}`,
            },
            categories: ['Défilé', 'Commercial'],
            experience: experienceText,
            journey: "Parcours à renseigner par l'administrateur.",
            quizScores: {}
        };

        const updatedModels = [...data.models, newModel];
        const updatedApps: CastingApplication[] = data.castingApplications.map(localApp => localApp.id === app.id ? { ...localApp, status: 'Accepté' } : localApp);

        try {
            // Try to create Firebase Auth account
            let firebaseUid = null;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                firebaseUid = userCredential.user.uid;
            } catch (authError: any) {
                // If email already exists, continue without error
                if (authError.code !== 'auth/email-already-in-use') {
                    throw authError;
                }
            }

            // Save model to RTDB
            const { set: rtdbSet, ref: rtdbRef } = await import('firebase/database');
            const rtdbDb = (await import('../realtimedbConfig')).default;
            
            if (firebaseUid) {
                await rtdbSet(rtdbRef(rtdbDb, `models/${id}`), {
                    ...newModel,
                    firebaseUid,
                    createdAt: new Date().toISOString()
                });
            } else {
                // Email already exists in Firebase - just save the model
                await rtdbSet(rtdbRef(rtdbDb, `models/${id}`), {
                    ...newModel,
                    createdAt: new Date().toISOString()
                });
            }

await saveData({ ...data, models: updatedModels, castingApplications: updatedApps });
             sendCastingAcceptedNotification({
                 firstName: app.firstName,
                 lastName: app.lastName,
                 email: app.email,
                 phone: app.phone,
                 city: app.city,
                 height: app.height,
                 instagram: app.instagram,
             }).catch(() => {});
             
             // Notify admin of successful Firebase account creation
             notifyAdmin('migration', `Nouveau compte Firebase créé: ${newModel.name} (${email})`, '/admin/model-access').catch(() => {});
             
             alert(`Le mannequin ${newModel.name} a été créé avec succès et la candidature a été marquée comme "Accepté".\n\nIdentifiants de connexion:\nEmail: ${email}\nMot de passe: ${password}\n\nConservez ces informations pour la connexion.`);
             setSelectedApp(null);
        } catch (error: any) {
            console.error("Erreur lors de la création du mannequin:", error);
            if (error.code === 'auth/email-already-in-use') {
                alert("Un compte existe déjà avec cet email. Le mannequin sera créé sans créer de nouveau compte Firebase.");
                await saveData({ ...data, models: updatedModels, castingApplications: updatedApps });
                setSelectedApp(null);
            } else {
                alert("Une erreur est survenue lors de la sauvegarde.");
            }
        }
    };
    
    const getStatusColor = (status: CastingApplicationStatus) => {
        switch (status) {
            case 'Nouveau': return 'bg-blue-500/20 text-blue-300 border-blue-500';
            case 'Présélectionné': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500';
            case 'Accepté': return 'bg-green-500/20 text-green-300 border-green-500';
            case 'Refusé': return 'bg-red-500/20 text-red-300 border-red-500';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    }

    const statusOptions: (CastingApplicationStatus | 'Toutes')[] = ['Toutes', 'Nouveau', 'Présélectionné', 'Accepté', 'Refusé'];

    if (printingApp) {
        return <PrintableCastingSheet app={printingApp} juryMembers={data?.juryMembers || []} onDonePrinting={() => setPrintingApp(null)} />;
    }

    return (
        <>
        <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
            <SEO title="Admin - Candidatures Casting" noIndex />
            <div className="container mx-auto px-6">
                <Link to="/admin" className="inline-flex items-center gap-2 text-pm-gold mb-4 hover:underline">
                    <ChevronLeftIcon className="w-5 h-5" />
                    Retour au Tableau de Bord
                </Link>
                <h1 className="text-4xl font-playfair text-pm-gold mb-8">Candidatures Casting</h1>

                <div className="flex flex-wrap items-center gap-4 mb-8">
                    {statusOptions.map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 text-sm uppercase tracking-wider rounded-full transition-all ${filter === f ? 'bg-pm-gold text-pm-dark' : 'bg-black border border-pm-gold text-pm-gold hover:bg-pm-gold/20'}`}>
                            {f}
                        </button>
                    ))}
                </div>

                <div className="bg-black border border-pm-gold/20 rounded-lg overflow-hidden shadow-lg shadow-black/30">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-pm-dark/50">
                                <tr className="border-b border-pm-gold/20">
                                    <th className="p-4 uppercase text-xs tracking-wider">Nom</th>
                                    <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Âge</th>
                                    <th className="p-4 uppercase text-xs tracking-wider hidden sm:table-cell">Taille</th>
                                    <th className="p-4 uppercase text-xs tracking-wider">Statut</th>
                                    <th className="p-4 uppercase text-xs tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApps.map(app => (
                                    <tr key={app.id} className="border-b border-pm-dark hover:bg-pm-dark/50">
                                        <td className="p-4 font-semibold">{app.firstName} {app.lastName}</td>
                                        <td className="p-4 hidden sm:table-cell">{app.birthDate ? `${new Date().getFullYear() - new Date(app.birthDate).getFullYear()} ans` : 'N/A'}</td>
                                        <td className="p-4 hidden sm:table-cell">{app.height} cm</td>
                                        <td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full border ${getStatusColor(app.status)}`}>{app.status}</span></td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-4">
                                                <button onClick={() => setSelectedApp(app)} className="text-pm-gold/70 hover:text-pm-gold"><EyeIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDelete(app.id)} className="text-red-500/70 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredApps.length === 0 && !isLoading && <p className="text-center p-8 text-pm-off-white/60">Aucune candidature trouvée.</p>}
                        {isLoading && <p className="text-center p-8 text-pm-off-white/40 animate-pulse">Chargement...</p>}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-pm-gold/10">
                            <span className="text-xs text-pm-off-white/40">
                                Page {page} / {totalPages}
                            </span>
                            <div className="flex gap-2">
                                <button
                                    onClick={prevPage}
                                    disabled={page === 1}
                                    className="p-1.5 border border-pm-gold/20 text-pm-gold/60 hover:text-pm-gold hover:border-pm-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeftIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={nextPage}
                                    disabled={page === totalPages}
                                    className="p-1.5 border border-pm-gold/20 text-pm-gold/60 hover:text-pm-gold hover:border-pm-gold/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRightIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        {selectedApp && <ApplicationModal app={selectedApp} onClose={() => setSelectedApp(null)} onUpdateStatus={handleUpdateStatus} getStatusColor={getStatusColor} onValidateAndCreateModel={handleValidateAndCreateModel} />}
        </>
    );
};

const ApplicationModal: React.FC<{
    app: CastingApplication,
    onClose: () => void,
    onUpdateStatus: (app: CastingApplication, status: CastingApplicationStatus, rejectionReason?: string) => void,
    getStatusColor: (status: CastingApplicationStatus) => string,
    onValidateAndCreateModel: (app: CastingApplication) => void,
}> = ({ app, onClose, onUpdateStatus, getStatusColor, onValidateAndCreateModel }) => {
    const [pendingStatus, setPendingStatus] = useState<CastingApplicationStatus>(app.status);
    const [rejectionReason, setRejectionReason] = useState('');
    const [confirmAction, setConfirmAction] = useState<{ status: CastingApplicationStatus; reason?: string } | null>(null);

    useEffect(() => {
        setPendingStatus(app.status);
        setRejectionReason('');
        setConfirmAction(null);
    }, [app.id, app.status]);

    const statusLabel = (status: CastingApplicationStatus) => {
        switch (status) {
            case 'Nouveau': return 'Mettre en Nouveau';
            case 'Présélectionné': return 'Mettre en Présélectionné';
            case 'Accepté': return 'Accepter la candidature';
            case 'Refusé': return 'Refuser la candidature';
        }
    };

    const handleSaveStatus = () => {
        if (pendingStatus === app.status) return;
        if (pendingStatus === 'Refusé' && !rejectionReason.trim()) return;
        setConfirmAction({ status: pendingStatus, reason: pendingStatus === 'Refusé' ? rejectionReason.trim() : undefined });
    };

    const confirmMessage = confirmAction
        ? confirmAction.status === 'Refusé'
            ? 'Le candidat recevra un email de refus. Confirmez-vous l’envoi ?'
            : confirmAction.status === 'Accepté'
                ? 'Le candidat sera marqué comme accepté et recevra un email de notification. Confirmez-vous ?'
                : 'Voulez-vous mettre à jour le statut de cette candidature ?'
        : '';

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog">
            <div className="bg-pm-dark border border-pm-gold/30 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <header className="p-4 flex justify-between items-center border-b border-pm-gold/20">
                    <h2 className="text-2xl font-playfair text-pm-gold">Candidature de {app.firstName} {app.lastName}</h2>
                    <button onClick={onClose} className="text-pm-off-white/70 hover:text-white"><XMarkIcon className="w-6 h-6"/></button>
                </header>
                <main className="p-6 overflow-y-auto flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Section title="Informations Personnelles">
                        <InfoItem label="Nom complet" value={`${app.firstName} ${app.lastName}`} />
                        <InfoItem label="Date de naissance" value={app.birthDate} />
                        <InfoItem label="Email" value={app.email} />
                        <InfoItem label="Téléphone" value={app.phone} />
                        <InfoItem label="Nationalité" value={app.nationality} />
                        <InfoItem label="Ville" value={app.city} />
                        <InfoItem label="Genre" value={app.gender} />
                    </Section>
                    <Section title="Mensurations & Physique">
                        <InfoItem label="Taille" value={`${app.height} cm`} />
                        <InfoItem label="Poids" value={`${app.weight} kg`} />
                        <InfoItem label="Poitrine" value={`${app.chest} cm`} />
                        <InfoItem label="Taille (vêtement)" value={`${app.waist} cm`} />
                        <InfoItem label="Hanches" value={`${app.hips} cm`} />
                        <InfoItem label="Pointure" value={app.shoeSize} />
                        <InfoItem label="Couleur des yeux" value={app.eyeColor} />
                        <InfoItem label="Couleur des cheveux" value={app.hairColor} />
                    </Section>
                    <div className="md:col-span-2">
                        <Section title="Expérience & Portfolio">
                            <InfoItem label="Niveau d'expérience" value={app.experience} />
                            <InfoItem label="Instagram" value={app.instagram} />
                            <InfoItem label="Portfolio" value={app.portfolioLink} />
                        </Section>
                    </div>
                    {(app.photoPortraitUrl || app.photoFullBodyUrl || app.photoProfileUrl) && (
                        <div className="md:col-span-2">
                            <Section title="Photos de candidature">
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    {app.photoPortraitUrl && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-pm-off-white/40 mb-1">Portrait</p>
                                            <img src={app.photoPortraitUrl} alt="Portrait" className="w-full aspect-[3/4] object-cover rounded border border-pm-gold/20" />
                                        </div>
                                    )}
                                    {app.photoFullBodyUrl && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-pm-off-white/40 mb-1">Plein corps</p>
                                            <img src={app.photoFullBodyUrl} alt="Plein corps" className="w-full aspect-[3/4] object-cover rounded border border-pm-gold/20" />
                                        </div>
                                    )}
                                    {app.photoProfileUrl && (
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-pm-off-white/40 mb-1">Profil</p>
                                            <img src={app.photoProfileUrl} alt="Profil" className="w-full aspect-[3/4] object-cover rounded border border-pm-gold/20" />
                                        </div>
                                    )}
                                </div>
                            </Section>
                        </div>
                    )}
                    <div className="md:col-span-2">
                        <Section title="Statut">
                            <div className="flex items-center gap-2 flex-wrap">
                                {(['Nouveau', 'Présélectionné', 'Accepté', 'Refusé'] as const).map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setPendingStatus(status)}
                                        className={`px-2 py-0.5 text-xs font-bold rounded-full border transition-all ${pendingStatus === status ? getStatusColor(status) : 'border-pm-off-white/50 text-pm-off-white/80 hover:bg-pm-dark'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 space-y-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-pm-off-white/40 mb-1">Statut actuel</p>
                                    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(app.status)}`}>{app.status}</span>
                                </div>
                                {pendingStatus !== app.status && (
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-pm-off-white/40 mb-1">Nouveau statut</p>
                                        <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(pendingStatus)}`}>{pendingStatus}</span>
                                    </div>
                                )}
                            </div>

                            {pendingStatus === 'Refusé' && (
                                <div className="mt-4">
                                    <label className="text-[10px] uppercase tracking-widest text-pm-off-white/40 block mb-2">Raisons du refus (email envoyé au candidat)</label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Ex: La sélection actuelle cible un type de profil différent."
                                        className="w-full bg-pm-dark/50 border border-pm-gold/30 rounded-lg px-3 py-2 text-sm text-pm-off-white placeholder:text-pm-off-white/30 focus:outline-none focus:border-pm-gold"
                                        rows={4}
                                    />
                                    <p className="text-xs text-pm-off-white/50 mt-2">L'email de refus sera envoyé uniquement après l'enregistrement.</p>
                                </div>
                            )}
                        </Section>
                    </div>
                </main>
                <footer className="p-4 border-t border-pm-gold/20 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                        {pendingStatus !== app.status && (
                            <button
                                type="button"
                                onClick={handleSaveStatus}
                                disabled={pendingStatus === app.status || (pendingStatus === 'Refusé' && !rejectionReason.trim())}
                                className="w-full md:w-auto px-4 py-2 text-sm font-bold rounded-full bg-pm-gold text-pm-dark hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {statusLabel(pendingStatus)}
                            </button>
                        )}
                    </div>
                    {app.status === 'Présélectionné' && (
                        <button onClick={() => onValidateAndCreateModel(app)} className="w-full md:w-auto px-4 py-2 text-sm bg-green-600 text-white font-bold rounded-full hover:bg-green-500">
                            Valider & Créer Profil Mannequin
                        </button>
                    )}
                </footer>
            </div>
            {confirmAction && (
                <ConfirmDialog
                    isOpen={true}
                    onClose={() => setConfirmAction(null)}
                    onConfirm={() => {
                        onUpdateStatus(app, confirmAction.status, confirmAction.reason);
                        setConfirmAction(null);
                    }}
                    title="Confirmer le changement de statut"
                    message={confirmMessage}
                    confirmLabel="Oui, confirmer"
                    cancelLabel="Annuler"
                    variant={confirmAction.status === 'Refusé' ? 'danger' : confirmAction.status === 'Accepté' ? 'warning' : 'default'}
                />
            )}
        </div>
    );
};

const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div>
        <h3 className="text-lg font-bold text-pm-gold mb-3 border-b border-pm-gold/20 pb-1">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);

const InfoItem: React.FC<{label: string, value: React.ReactNode}> = ({label, value}) => (
    <div className="grid grid-cols-3 text-sm">
        <strong className="text-pm-off-white/70 col-span-1">{label}:</strong>
        <span className="truncate col-span-2">{value}</span>
    </div>
);

export default AdminCasting;
