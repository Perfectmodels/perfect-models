

import React, { useState } from 'react';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { FashionDayApplication, FashionDayApplicationRole } from '../types';
import { Link } from 'react-router-dom';
import { notifyAdmin } from '../utils/adminNotify';
import { sendFashionDayConfirmationToUser, sendFashionDayNotificationToAdmin } from '../utils/brevoService';

const FashionDayApplicationForm: React.FC = () => {
    const { data, saveData } = useData();
    const [formData, setFormData] = useState<{
        name: string;
        email: string;
        phone: string;
        role: FashionDayApplicationRole;
        message: string;
    }>({
        name: '',
        email: '',
        phone: '',
        role: 'Mannequin',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        if (!data) {
            setStatus('error');
            setStatusMessage('Erreur: Impossible de charger les données de l\'application.');
            return;
        }

        const newApplication: FashionDayApplication = {
            ...formData,
            id: `pfd-${Date.now()}`,
            submissionDate: new Date().toISOString(),
            status: 'Nouveau',
        };

        try {
            const updatedApplications = [...(data.fashionDayApplications || []), newApplication];
            await saveData({ ...data, fashionDayApplications: updatedApplications });
            notifyAdmin('fashionday', `${formData.name} — ${formData.role}`, '/admin/fashion-day-applications').catch(() => {});

            // Emails Brevo (non-bloquant)
            Promise.allSettled([
              sendFashionDayConfirmationToUser({
                name: formData.name,
                email: formData.email,
                role: formData.role,
              }),
sendFashionDayNotificationToAdmin({
         name: formData.name,
         email: formData.email,
         phone: formData.phone,
         role: formData.role,
         message: formData.message,
         notificationEmail: data?.contactInfo?.notificationEmail || data?.contactInfo?.email || 'contact@perfectmodels.online',
       }),
            ]).catch(() => {});

            setStatus('success');
            setStatusMessage('Votre candidature a été envoyée ! L\'équipe du Perfect Fashion Day vous recontactera prochainement.');
            setFormData({ name: '', email: '', phone: '', role: 'Mannequin', message: '' });

        } catch (error) {
            setStatus('error');
            setStatusMessage("Une erreur est survenue lors de l'envoi de votre candidature.");
            console.error(error);
        }
    };
    
    return (
        <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
            <SEO title="Candidature Perfect Fashion Day" description="Postulez pour participer à la prochaine édition du Perfect Fashion Day. Mannequins, stylistes, photographes, partenaires, rejoignez l'aventure." noIndex />
            <div className="container mx-auto px-6 max-w-2xl">
                <h1 className="text-5xl font-playfair text-pm-gold text-center mb-4">Candidature Perfect Fashion Day</h1>
                <p className="text-center max-w-2xl mx-auto text-pm-off-white/80 mb-12">
                    Vous souhaitez participer à la prochaine édition ? Remplissez le formulaire ci-dessous.
                </p>
                <form onSubmit={handleSubmit} className="bg-black p-8 border border-pm-gold/20 space-y-6 rounded-lg shadow-lg">
                    <FormInput label="Nom Complet ou Nom de la Marque" name="name" value={formData.name} onChange={handleChange} required />
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                        <FormInput label="Téléphone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required />
                    </div>
                    <FormSelect label="Je postule en tant que" name="role" value={formData.role} onChange={handleChange} required>
                        <option value="Mannequin">Mannequin</option>
                        <option value="Styliste">Styliste / Créateur</option>
                        <option value="Partenaire">Partenaire / Sponsor</option>
                        <option value="Photographe">Photographe / Vidéaste</option>
                        <option value="MUA">Maquilleur(se) / Coiffeur(se) (MUA)</option>
                        <option value="Autre">Autre (précisez dans le message)</option>
                    </FormSelect>
                    <FormTextArea
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Présentez-vous, décrivez votre projet, ou laissez un lien vers votre portfolio..."
                        required
                    />
                     <div className="pt-4">
                        <button type="submit" disabled={status === 'loading'} className="w-full px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all hover:bg-white disabled:opacity-50">
                            {status === 'loading' ? 'Envoi en cours...' : 'Envoyer ma candidature'}
                        </button>
                    </div>

                    {statusMessage && (
                        <p className={`text-center text-sm p-3 rounded-md ${status === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                            {statusMessage}
                            {status === 'success' && <Link to="/fashion-day" className="underline ml-2">Retour à la page de l'événement</Link>}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

const FormInput: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, required?: boolean, placeholder?: string}> = (props) => (
    <div>
        <label htmlFor={props.name} className="admin-label">{props.label}</label>
        <input {...props} id={props.name} className="admin-input" />
    </div>
);
const FormSelect: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, required?: boolean, children: React.ReactNode}> = (props) => (
    <div>
        <label htmlFor={props.name} className="admin-label">{props.label}</label>
        <select {...props} id={props.name} className="admin-input">{props.children}</select>
    </div>
);
const FormTextArea: React.FC<{label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, rows: number, required?: boolean, placeholder?: string}> = (props) => (
    <div>
        <label htmlFor={props.name} className="admin-label">{props.label}</label>
        <textarea {...props} id={props.name} className="admin-input admin-textarea" />
    </div>
);

export default FashionDayApplicationForm;