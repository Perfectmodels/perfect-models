import React, { useState, useEffect } from 'react';
import { Model, ModelDistinction } from '../types';
import ImgBBUploader from './ImgBBUploader';
import ImgBBMultiUploader from './ImgBBMultiUploader';
import { ChevronDownIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ModelFormProps {
    model: Model;
    onSave: (model: Model) => void;
    onCancel: () => void;
    isCreating: boolean;
    mode: 'admin' | 'model';
}

const ModelForm: React.FC<ModelFormProps> = ({ model, onSave, onCancel, isCreating, mode }) => {
    const [formData, setFormData] = useState<Model>(model);

    useEffect(() => {
        setFormData(model);
    }, [model]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            const isNumber = type === 'number';
            setFormData(prev => ({ ...prev, [name]: isNumber && value !== '' ? Number(value) : value }));
        }
    };

    const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            measurements: {
                ...prev.measurements,
                [name]: value,
            }
        }));
    };

    const handleArrayChange = (name: 'categories', value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value.split(',').map(item => item.trim()).filter(Boolean)
        }));
    };

    const handlePortfolioImagesChange = (index: number, value: string) => {
        const newImages = [...(formData.portfolioImages || [])];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, portfolioImages: newImages }));
    };

    const handleAddPortfolioImage = () => {
        setFormData(prev => ({ ...prev, portfolioImages: [...(prev.portfolioImages || []), ''] }));
    };

    const handleRemovePortfolioImage = (index: number) => {
        setFormData(prev => ({ ...prev, portfolioImages: (prev.portfolioImages || []).filter((_, i) => i !== index) }));
    };

    const handleImageChange = (value: string) => {
        setFormData(prev => ({ ...prev, imageUrl: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isAdmin = mode === 'admin';

    return (
        <div className="space-y-12">
            <header className="flex justify-between items-end border-b border-white/5 pb-12">
                <div>
                   <span className="section-label">{isAdmin ? "Console Admin" : "Portail Mannequin"}</span>
                   <h1 className="text-6xl font-playfair font-black">
                       {isCreating ? 'Nouveau Profil' : 'Modifier le Profil'}
                   </h1>
                </div>
                <div className="flex gap-6">
                    <button onClick={onCancel} className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors">Annuler</button>
                    <button onClick={handleSubmit} className="btn-premium !py-3 !px-12 text-[10px]">Sauvegarder</button>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-24">
                
                {/* Main Column */}
                <div className="lg:col-span-8 space-y-24">
                    
                    <Section title="Identité & Mensurations">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <FormInput label="Nom Complet" name="name" value={formData.name} onChange={handleChange} disabled={!isAdmin} placeholder="ex: Jane Doe" />
                            <FormInput label="Ville de Résidence" name="location" value={formData.location || ''} onChange={handleChange} placeholder="ex: Libreville, Gabon" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <FormInput label="Âge" name="age" type="number" value={formData.age || ''} onChange={handleChange} placeholder="Années" />
                            <FormSelect label="Genre" name="gender" value={formData.gender} onChange={handleChange}>
                                <option value="Femme">Femme</option>
                                <option value="Homme">Homme</option>
                            </FormSelect>
                             <FormInput label="Taille" name="height" value={formData.height} onChange={handleChange} placeholder="ex: 1m80" />
                        </div>
                    </Section>
                    
                    <Section title="Mensurations">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                            <FormInput label="Poitrine (cm)" name="chest" value={formData.measurements.chest} onChange={handleMeasurementChange} />
                            <FormInput label="Taille (cm)" name="waist" value={formData.measurements.waist} onChange={handleMeasurementChange} />
                            <FormInput label="Hanches (cm)" name="hips" value={formData.measurements.hips} onChange={handleMeasurementChange} />
                            <FormInput label="Pointure" name="shoeSize" value={formData.measurements.shoeSize} onChange={handleMeasurementChange} />
                        </div>
                    </Section>

                    <Section title="Parcours Éditorial">
                        <FormTextArea label="Expérience Professionnelle" name="experience" value={formData.experience} onChange={handleChange} rows={5} placeholder="Décrivez vos campagnes, défilés..." />
                        <FormTextArea label="Parcours & Objectifs" name="journey" value={formData.journey} onChange={handleChange} rows={5} placeholder="Comment avez-vous commencé ? Quels sont vos objectifs ?" />
                        <FormTextArea label="Catégories (séparées par virgule)" name="categories" value={(formData.categories || []).join(', ')} onChange={(e) => handleArrayChange('categories', e.target.value)} placeholder="Défilé, Commercial, Beauté..." />
                    </Section>

                    <Section title="Gestion du Portfolio">
                        <ImgBBMultiUploader
                            label="Photos du portfolio"
                            values={formData.portfolioImages || []}
                            onChange={(urls) => setFormData(prev => ({ ...prev, portfolioImages: urls }))}
                            maxFiles={20}
                            scope="models/portfolio"
                        />
                    </Section>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-16">
                    <div className="glass-card p-10 space-y-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">Photo Principale</h3>
                        <ImgBBUploader label="" value={formData.imageUrl} onChange={handleImageChange} scope="models/profile" allowUrl />
                        <p className="text-[10px] text-white/20 italic">Cette image représente le mannequin sur la page du répertoire.</p>
                    </div>

                    <Section title="Coordonnées">
                        <FormInput label="Email Professionnel" name="email" type="email" value={formData.email || ''} onChange={handleChange} />
                        <FormInput label="Téléphone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
                    </Section>

                    {isAdmin && (
                        <div className="glass-card p-10 space-y-10 border-pm-gold/20">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold">Contrôles Système</h3>
                            <div className="space-y-8">
                                <FormInput label="Identifiant Système" name="username" value={formData.username} onChange={handleChange} disabled={!isCreating} />
                                <FormInput label="Mot de Passe Système" name="password" value={formData.password} onChange={handleChange} />
                                <FormSelect label="Niveau" name="level" value={formData.level || 'Débutant'} onChange={handleChange}>
                                    <option value="Débutant">Nouveau Talent</option>
                                    <option value="Pro">Elite Pro</option>
                                </FormSelect>
                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pm-gold focus:ring-offset-2 bg-pm-dark">
                                        <input 
                                            type="checkbox"
                                            id="isPublic"
                                            name="isPublic"
                                            checked={!!formData.isPublic}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <label htmlFor="isPublic" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.isPublic ? 'translate-x-5 !bg-pm-gold' : 'translate-x-0'}`}></label>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">Visibilité Publique</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="space-y-10">
        <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 border-b border-white/5 pb-4">{title}</h2>
        <div className="space-y-10">{children}</div>
    </div>
);

const FormInput: React.FC<{label: string, name: string, value: any, onChange: any, type?: string, disabled?: boolean, placeholder?: string}> = (props) => (
    <div>
        <label htmlFor={props.name} className="admin-label">{props.label}</label>
        <input type={props.type || "text"} {...props} className="admin-input" />
    </div>
);

const FormSelect: React.FC<{label: string, name: string, value: any, onChange: any, children: React.ReactNode, disabled?: boolean}> = (props) => (
     <div>
        <label htmlFor={props.name} className="admin-label">{props.label}</label>
        <select {...props} className="admin-select">
            {props.children}
        </select>
    </div>
);

const FormTextArea: React.FC<{label: string, name: string, value: any, onChange: any, rows?: number, disabled?: boolean, placeholder?: string}> = (props) => (
    <div>
        <label htmlFor={props.name} className="admin-label">{props.label}</label>
        <textarea {...props} rows={props.rows || 3} className="admin-textarea" />
    </div>
);

export default ModelForm;
