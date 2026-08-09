import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { AppData } from '../hooks/useRealtimeDB';
import { Testimonial, Partner, FAQCategory, FAQItem } from '../types';
import SEO from '../components/SEO';
import { ChevronDownIcon, TrashIcon, PlusIcon, KeyIcon, PhotoIcon, LinkIcon, UserGroupIcon, ChatBubbleBottomCenterTextIcon, QuestionMarkCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';
import ImageInput from '../components/icons/ImageInput';
import ImageUploader from '../components/ImageUploader';

type EditableData = Pick<AppData, 'contactInfo' | 'siteConfig' | 'siteImages' | 'socialLinks' | 'agencyPartners' | 'testimonials' | 'faqData' | 'apiKeys'>;

const TABS = [
    { id: 'contact',     label: 'Contact',      icon: PhoneIcon },
    { id: 'api',         label: 'Clés API',      icon: KeyIcon },
    { id: 'images',      label: 'Images',        icon: PhotoIcon },
    { id: 'social',      label: 'Réseaux',       icon: LinkIcon },
    { id: 'partners',    label: 'Partenaires',   icon: UserGroupIcon },
    { id: 'testimonials',label: 'Témoignages',   icon: ChatBubbleBottomCenterTextIcon },
    { id: 'faq',         label: 'FAQ',           icon: QuestionMarkCircleIcon },
] as const;

type TabId = typeof TABS[number]['id'];

const AdminSettings: React.FC = () => {
    const { data, saveData, isInitialized } = useData();
    const [localData, setLocalData] = useState<EditableData | null>(null);
    const [activeTab, setActiveTab] = useState<TabId>('contact');

    useEffect(() => {
        if (isInitialized && data) {
            const { contactInfo, siteConfig, siteImages, socialLinks, agencyPartners, testimonials, faqData, apiKeys } = data;
            setLocalData(JSON.parse(JSON.stringify({ contactInfo, siteConfig, siteImages, socialLinks, agencyPartners, testimonials, faqData, apiKeys })));
        }
    }, [isInitialized, data]);

    const handleSave = () => {
        if (!data || !localData) return;
        const dataToSave = JSON.parse(JSON.stringify(localData));
        if (dataToSave.agencyPartners) dataToSave.agencyPartners = dataToSave.agencyPartners.filter(Boolean);
        if (dataToSave.testimonials) dataToSave.testimonials = dataToSave.testimonials.filter(Boolean);
        if (dataToSave.faqData) {
            dataToSave.faqData = dataToSave.faqData.filter(Boolean);
            dataToSave.faqData.forEach((cat: FAQCategory) => { if (cat.items) cat.items = cat.items.filter(Boolean); });
        }
        saveData({ ...data, ...dataToSave });
        alert("Changements enregistrés avec succès.");
    };

    const handleSimpleChange = (section: keyof EditableData, key: string, value: any) => {
        if (!localData) return;
        setLocalData(prev => {
            if (!prev) return null;
            const sectionData = prev[section];
            if (typeof sectionData === 'object' && sectionData !== null) {
                return { ...prev, [section]: { ...(sectionData as object), [key]: value } };
            }
            return prev;
        });
    };

    if (!localData || !data) {
        return <div className="min-h-screen flex items-center justify-center text-pm-gold">Chargement...</div>;
    }

    return (
        <>
            <SEO title="Admin - Paramètres du Site" noIndex />

            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <span className="section-label">Configuration</span>
                    <h1 className="text-4xl font-playfair font-black text-white">Paramètres du Site</h1>
                </div>
                <button onClick={handleSave} className="btn-premium !py-3 !px-10 text-[10px]">
                    Sauvegarder
                </button>
            </div>

            {/* Tab bar */}
            <div className="flex flex-wrap gap-1 mb-10 border-b border-white/5 pb-0">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 border-b-2 -mb-px ${
                                isActive
                                    ? 'border-pm-gold text-pm-gold'
                                    : 'border-transparent text-white/30 hover:text-white/60'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            <div className="space-y-6">

                {activeTab === 'contact' && (
                    <div className="glass-card p-10 space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">Informations de Contact</h2>
                        <FormInput label="Email public" value={localData.contactInfo.email} onChange={e => handleSimpleChange('contactInfo', 'email', e.target.value)} />
                        <FormInput label="Téléphone" value={localData.contactInfo.phone} onChange={e => handleSimpleChange('contactInfo', 'phone', e.target.value)} />
                        <FormInput label="Adresse" value={localData.contactInfo.address} onChange={e => handleSimpleChange('contactInfo', 'address', e.target.value)} />
                    </div>
                )}

                {activeTab === 'api' && (
                    <div className="glass-card p-10 space-y-8">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">Clés API</h2>

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">Email & Communication</p>
                            <div className="space-y-4">
                                <SecretInput label="Clé API Brevo" value={localData.apiKeys.brevoApiKey || ''} onChange={v => handleSimpleChange('apiKeys', 'brevoApiKey', v)} />
                                <FormInput label="Email expéditeur par défaut" value={localData.apiKeys.defaultFromEmail || ''} onChange={e => handleSimpleChange('apiKeys', 'defaultFromEmail', e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">Images & Stockage</p>
                            <div className="space-y-4">
                                <SecretInput label="Clé API ImgBB" value={localData.apiKeys.imgbbApiKey || ''} onChange={v => handleSimpleChange('apiKeys', 'imgbbApiKey', v)} />
                                <SecretInput label="Dropbox Access Token" value={localData.apiKeys.dropboxAccessToken || ''} onChange={v => handleSimpleChange('apiKeys', 'dropboxAccessToken', v)} />
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">IA & Notifications</p>
                            <div className="space-y-4">
                                <SecretInput label="Gemini API Key" value={localData.apiKeys.geminiApiKey || ''} onChange={v => handleSimpleChange('apiKeys', 'geminiApiKey', v)} />
                                <SecretInput label="Firebase VAPID Key (Push)" value={localData.apiKeys.vapidKey || ''} onChange={v => handleSimpleChange('apiKeys', 'vapidKey', v)} />
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mb-5">Chatbot</p>
                            <div className="space-y-4">
                                <SecretInput label="Chatbase Bot ID" value={localData.apiKeys.chatbotId || ''} onChange={v => handleSimpleChange('apiKeys', 'chatbotId', v)} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'images' && (
                    <div className="glass-card p-10 space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">Images du Site</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ImageInput label="Logo" value={localData.siteConfig.logo} onChange={value => handleSimpleChange('siteConfig', 'logo', value)} />
                            <ImageInput label="Image Héros (Accueil)" value={localData.siteImages.hero} onChange={value => handleSimpleChange('siteImages', 'hero', value)} />
                            <ImageInput label="Image 'À Propos' (Accueil)" value={localData.siteImages.about} onChange={value => handleSimpleChange('siteImages', 'about', value)} />
                            <ImageInput label="Fond 'Fashion Day' (Accueil)" value={localData.siteImages.fashionDayBg} onChange={value => handleSimpleChange('siteImages', 'fashionDayBg', value)} />
                            <ImageInput label="Image 'Notre Histoire' (Agence)" value={localData.siteImages.agencyHistory} onChange={value => handleSimpleChange('siteImages', 'agencyHistory', value)} />
                            <ImageInput label="Fond 'Classroom'" value={localData.siteImages.classroomBg} onChange={value => handleSimpleChange('siteImages', 'classroomBg', value)} />
                            <ImageInput label="Affiche 'Casting'" value={localData.siteImages.castingBg} onChange={value => handleSimpleChange('siteImages', 'castingBg', value)} />
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="glass-card p-10 space-y-6">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">Réseaux Sociaux</h2>
                        <FormInput label="URL Facebook" value={localData.socialLinks.facebook} onChange={e => handleSimpleChange('socialLinks', 'facebook', e.target.value)} />
                        <FormInput label="URL Instagram" value={localData.socialLinks.instagram} onChange={e => handleSimpleChange('socialLinks', 'instagram', e.target.value)} />
                        <FormInput label="URL YouTube" value={localData.socialLinks.youtube} onChange={e => handleSimpleChange('socialLinks', 'youtube', e.target.value)} />
                    </div>
                )}

                {activeTab === 'partners' && (
                    <div className="glass-card p-10">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">Partenaires de l'Agence</h2>
                        <ArrayEditor
                            items={localData.agencyPartners}
                            setItems={newItems => setLocalData(p => ({ ...p!, agencyPartners: newItems }))}
                            renderItem={(item: Partner, updateItem) => (
                                <FormInput label="Nom du partenaire" value={item.name} onChange={e => updateItem({ ...item, name: e.target.value })} />
                            )}
                            getNewItem={() => ({ name: 'Nouveau Partenaire' })}
                            getItemTitle={item => item.name}
                        />
                    </div>
                )}

                {activeTab === 'testimonials' && (
                    <div className="glass-card p-10">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">Témoignages</h2>
                        <ArrayEditor
                            items={localData.testimonials}
                            setItems={newItems => setLocalData(p => ({ ...p!, testimonials: newItems }))}
                            renderItem={(item: Testimonial, updateItem) => (
                                <>
                                    <FormInput label="Nom" value={item.name} onChange={e => updateItem({ ...item, name: e.target.value })} />
                                    <FormInput label="Rôle" value={item.role} onChange={e => updateItem({ ...item, role: e.target.value })} />
                                    <ImageUploader label="Photo" value={item.imageUrl} onChange={value => updateItem({ ...item, imageUrl: value })} />
                                    <FormTextArea label="Citation" value={item.quote} onChange={e => updateItem({ ...item, quote: e.target.value })} />
                                </>
                            )}
                            getNewItem={() => ({ name: 'Nouveau Témoin', role: 'Rôle', quote: '', imageUrl: '' })}
                            getItemTitle={item => item.name}
                        />
                    </div>
                )}

                {activeTab === 'faq' && (
                    <div className="glass-card p-10">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-pm-gold mb-8">FAQ — Foire Aux Questions</h2>
                        <ArrayEditor
                            items={localData.faqData}
                            setItems={newItems => setLocalData(p => ({ ...p!, faqData: newItems }))}
                            renderItem={(item: FAQCategory, updateItem) => (
                                <>
                                    <FormInput label="Catégorie" value={item.category} onChange={e => updateItem('category', e.target.value)} />
                                    <SubArrayEditor
                                        title="Questions"
                                        items={item.items || []}
                                        setItems={newItems => updateItem('items', newItems)}
                                        getNewItem={() => ({ question: 'Nouvelle Question ?', answer: 'Réponse...' })}
                                        getItemTitle={item => item.question}
                                        renderItem={(faq: FAQItem, onFaqChange) => (
                                            <>
                                                <FormInput label="Question" value={faq.question} onChange={e => onFaqChange('question', e.target.value)} />
                                                <FormTextArea label="Réponse" value={faq.answer} onChange={e => onFaqChange('answer', e.target.value)} />
                                            </>
                                        )}
                                    />
                                </>
                            )}
                            getNewItem={() => ({ category: 'Nouvelle Catégorie', items: [] })}
                            getItemTitle={item => item.category}
                        />
                    </div>
                )}

            </div>
        </>
    );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const FormInput: React.FC<{ label: string; value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="admin-label">{label}</label>
        <input type="text" value={value} onChange={onChange} className="admin-input" />
    </div>
);

const SecretInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div>
            <label className="admin-label">{label}</label>
            <div className="relative">
                <input
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="admin-input pr-20"
                    autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={() => setVisible(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase tracking-[0.2em] text-pm-gold/60 hover:text-pm-gold transition-colors"
                >
                    {visible ? 'Masquer' : 'Voir'}
                </button>
            </div>
        </div>
    );
};

const FormTextArea: React.FC<{ label: string; value: any; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }> = ({ label, value, onChange }) => (
    <div>
        <label className="admin-label">{label}</label>
        <textarea value={value} onChange={onChange} rows={5} className="admin-input admin-textarea" />
    </div>
);

const ArrayEditor: React.FC<{
    items: any[];
    setItems: (items: any[]) => void;
    renderItem: (item: any, onChange: any, index: number) => React.ReactNode;
    getNewItem: () => any;
    getItemTitle: (item: any) => string;
}> = ({ items, setItems, renderItem, getNewItem, getItemTitle }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleItemChange = (index: number, key: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [key]: value };
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, getNewItem()]);
        setOpenIndex(items.length);
    };

    const handleDeleteItem = (index: number) => {
        if (window.confirm(`Supprimer "${getItemTitle(items[index])}" ?`)) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="border border-white/5 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full px-5 py-4 text-left text-sm font-bold flex justify-between items-center hover:bg-white/[0.02] transition-colors"
                    >
                        <span className="truncate pr-4 text-white/70">{getItemTitle(item)}</span>
                        <ChevronDownIcon className={`w-4 h-4 text-white/30 transition-transform shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} />
                    </button>
                    {openIndex === index && (
                        <div className="px-5 pb-5 pt-2 border-t border-white/5 space-y-4 bg-black/20">
                            {renderItem(item, (key: any, value: any) => handleItemChange(index, key, value), index)}
                            <div className="text-right pt-2">
                                <button type="button" onClick={() => handleDeleteItem(index)} className="text-red-500/60 hover:text-red-500 text-xs inline-flex items-center gap-1 transition-colors">
                                    <TrashIcon className="w-4 h-4" /> Supprimer
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
            <button
                type="button"
                onClick={handleAddItem}
                className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-pm-gold border border-pm-gold/30 px-5 py-2.5 hover:bg-pm-gold/10 transition-colors"
            >
                <PlusIcon className="w-4 h-4" /> Ajouter
            </button>
        </div>
    );
};

const SubArrayEditor: React.FC<{
    title: string;
    items: any[];
    setItems: (items: any[]) => void;
    renderItem: (item: any, onChange: any, index: number) => React.ReactNode;
    getNewItem: () => any;
    getItemTitle: (item: any) => string;
}> = ({ title, ...props }) => (
    <div className="mt-4 p-4 border border-white/5 bg-black/20">
        <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-pm-gold/50 mb-4">{title}</h4>
        <ArrayEditor {...props} />
    </div>
);

export default AdminSettings;
