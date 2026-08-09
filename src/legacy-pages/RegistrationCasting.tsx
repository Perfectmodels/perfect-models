import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { CastingApplication } from '../types';
import SEO from '../components/SEO';
import { UserPlusIcon, PrinterIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import ChangePasswordModal from '../components/ChangePasswordModal';

const RegistrationCasting: React.FC = () => {
    const { data, saveData, isInitialized } = useData();
    const { user: authUser } = useAuth();
    const initialFormState = {
        firstName: '', lastName: '', birthDate: '', email: '', phone: '', nationality: '', city: '',
        gender: 'Femme' as 'Homme' | 'Femme', height: '', weight: '', chest: '', waist: '', hips: '', shoeSize: '',
        eyeColor: '', hairColor: '', experience: 'none', instagram: '', portfolioLink: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const staffName = authUser?.displayName ?? 'Staff';
    const [showChangePassword, setShowChangePassword] = useState(false);

    const registeredApplicants = useMemo(() => {
        return data?.castingApplications
            .filter(app => app.passageNumber)
            .sort((a, b) => a.passageNumber! - b.passageNumber!) || [];
    }, [data?.castingApplications]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!data || !formData.firstName.trim() || !formData.lastName.trim()) return;

        setIsSubmitting(true);

        const existingPassageNumbers = data.castingApplications
            .map(app => app.passageNumber)
            .filter((num): num is number => num !== undefined && num !== null);
        
        const nextPassageNumber = existingPassageNumbers.length > 0 ? Math.max(...existingPassageNumbers) + 1 : 1;

        const newApplicant: CastingApplication = {
            ...formData,
            id: `reg-${Date.now()}`,
            submissionDate: new Date().toISOString(),
            status: 'Présélectionné', // Automatically prescreened as they are on-site
            passageNumber: nextPassageNumber,
        };

        const updatedApplications = [...(data.castingApplications || []), newApplicant];

        try {
            await saveData({ ...data, castingApplications: updatedApplications });
            setFormData(initialFormState); // Reset form
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'enregistrement.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (!isInitialized) {
        return <div className="min-h-screen flex items-center justify-center bg-pm-dark text-pm-gold">Chargement...</div>;
    }

    return (
        <>
            <SEO title={`Enregistrement Casting - ${staffName}`} noIndex />
            <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
                <div className="container mx-auto px-6">
                    <div className="admin-page-header">
                        <div>
                            <h1 className="admin-page-title">Enregistrement Casting</h1>
                            <p className="admin-page-subtitle">Connecté en tant que {staffName}.</p>
                        </div>
                        <button
                          onClick={() => setShowChangePassword(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-pm-gold/10 hover:bg-pm-gold/20 border border-pm-gold/30 text-pm-gold text-sm font-bold rounded-lg transition-colors"
                        >
                          <LockClosedIcon className="w-4 h-4" />
                          Changer mon mot de passe
                        </button>
                    </div>

                    {showChangePassword && (
                      <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Registration Form */}
                        <div className="lg:col-span-1">
                            <form onSubmit={handleRegister} className="admin-section-wrapper">
                                <h2 className="admin-section-title flex items-center gap-2">
                                    <UserPlusIcon className="w-6 h-6" />
                                    Ajouter un Postulant
                                </h2>
                                
                                <Section title="Informations Personnelles">
                                    <FormInput label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} required />
                                    <FormInput label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} required />
                                    <FormInput label="Date de Naissance" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
                                    <FormSelect label="Genre" name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="Femme">Femme</option>
                                        <option value="Homme">Homme</option>
                                    </FormSelect>
                                    <FormInput label="Téléphone" name="phone" value={formData.phone} onChange={handleChange} />
                                    <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
                                </Section>

                                <Section title="Mensurations">
                                    <FormInput label="Taille (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
                                    <FormInput label="Poids (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
                                    <FormInput label="Pointure (EU)" name="shoeSize" type="number" value={formData.shoeSize} onChange={handleChange} />
                                    <FormInput label="Poitrine (cm)" name="chest" type="number" value={formData.chest} onChange={handleChange} />
                                    <FormInput label="Taille (vêtement, cm)" name="waist" type="number" value={formData.waist} onChange={handleChange} />
                                    <FormInput label="Hanches (cm)" name="hips" type="number" value={formData.hips} onChange={handleChange} />
                                </Section>

                                <Section title="Expérience">
                                    <FormSelect label="Niveau d'expérience" name="experience" value={formData.experience} onChange={handleChange}>
                                        <option value="none">Aucune expérience</option>
                                        <option value="beginner">Débutant(e)</option>
                                        <option value="intermediate">Intermédiaire</option>
                                        <option value="professional">Professionnel(le)</option>
                                    </FormSelect>
                                </Section>

                                <button type="submit" disabled={isSubmitting} className="w-full px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all hover:bg-white disabled:opacity-50 mt-6">
                                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer et Attribuer Numéro'}
                                </button>
                            </form>
                        </div>

                        {/* Registered List */}
                        <div className="lg:col-span-2">
                             <div className="flex justify-between items-center mb-6">
                                <h2 className="admin-page-title !text-3xl">Liste des Passages</h2>
                                <button onClick={handlePrint} className="print-hide inline-flex items-center gap-2 px-4 py-2 bg-pm-dark border border-pm-gold text-pm-gold font-bold uppercase tracking-widest text-sm rounded-full hover:bg-pm-gold hover:text-pm-dark">
                                    <PrinterIcon className="w-5 h-5"/> Imprimer la Liste
                                </button>
                            </div>
                            <div className="admin-section-wrapper printable-content">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-pm-dark/50">
                                            <tr className="border-b border-pm-gold/20">
                                                <th className="p-3 uppercase text-xs tracking-wider">Passage #</th>
                                                <th className="p-3 uppercase text-xs tracking-wider">Nom Complet</th>
                                                <th className="p-3 uppercase text-xs tracking-wider hidden sm:table-cell">Téléphone</th>
                                                <th className="p-3 uppercase text-xs tracking-wider hidden sm:table-cell">Heure</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {registeredApplicants.map(app => (
                                                <tr key={app.id} className="border-b border-pm-dark hover:bg-pm-dark/50">
                                                    <td className="p-3 font-bold text-pm-gold">#{String(app.passageNumber).padStart(3, '0')}</td>
                                                    <td className="p-3 font-semibold">{app.firstName} {app.lastName}</td>
                                                    <td className="p-3 text-sm hidden sm:table-cell">{app.phone || 'N/A'}</td>
                                                    <td className="p-3 text-xs hidden sm:table-cell">{new Date(app.submissionDate).toLocaleTimeString('fr-FR')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {registeredApplicants.length === 0 && (
                                        <p className="text-center p-8 text-pm-off-white/60">Aucun postulant enregistré pour le moment.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Reusable components
const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="pt-6 border-t border-pm-gold/20 first:pt-0 first:border-none">
        <h2 className="text-2xl font-playfair text-pm-gold mb-4">{title}</h2>
        <div className="space-y-4">{children}</div>
    </div>
);
const FormInput: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean}> = (props) => (
    <div>
        <label htmlFor={props.name} className="admin-label">{props.label}</label>
        <input {...props} id={props.name} className="admin-input" />
    </div>
);
const FormSelect: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = (props) => (
    <div>
        <label htmlFor={props.name} className="admin-label">{props.label}</label>
        <select {...props} id={props.name} className="admin-input">{props.children}</select>
    </div>
);


export default RegistrationCasting;
