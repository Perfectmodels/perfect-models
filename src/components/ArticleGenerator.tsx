import React, { useState, useCallback } from 'react';
import { Type } from '@google/genai';
import { Article } from '../types';
import CloseIcon from './icons/CloseIcon';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface ArticleGeneratorProps {
    isOpen: boolean;
    onClose: () => void;
    onArticleGenerated: (articleData: Partial<Article>) => void;
}

const FormTextArea: React.FC<{label: string, name: string, value: any, onChange: any, rows: number}> = ({label, name, value, onChange, rows}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-pm-off-white/70 mb-1">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="admin-input admin-textarea" />
    </div>
);

const ArticleGenerator: React.FC<ArticleGeneratorProps> = ({ isOpen, onClose, onArticleGenerated }) => {
    const [formData, setFormData] = useState({
        subject: '',
        bio: '',
        role: '',
        event: '',
        photos: '',
        quotes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const prompt = `
            Tu es un assistant IA pour un site web de mode et d'événementiel (Perfect Models Management) basé au Gabon. 
            Ton rôle est de générer un article complet et formaté en JSON.
            
            Consignes de style :
            - Le ton doit être inspirant, professionnel et culturellement ancré dans le Gabon et l’Afrique.
            - Le contenu doit mettre en valeur le talent ou l'événement.
            - Les paragraphes doivent être fluides et bien structurés.
            - Laisse le champ "imageUrl" principal vide. Utilise les URLs des photos fournies UNIQUEMENT pour les blocs de type "image" dans le tableau "content".
            - Incorpore les citations fournies dans des blocs de type "quote".
            - Choisis une catégorie pertinente parmi : "Interview", "Événement", "Tendance", "Conseils".
            - Génère des tags pertinents pour le SEO.

            Informations fournies :
            - Sujet / Nom : ${formData.subject}
            - Biographie / Description : ${formData.bio}
            - Rôle : ${formData.role}
            - Événement associé : ${formData.event}
            - URLs des photos (une par ligne) : ${formData.photos}
            - Citations (une par ligne) : ${formData.quotes}

            Génère l'article en respectant scrupuleusement le schéma JSON.
        `;
        
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                author: { type: Type.STRING, description: "Doit être 'Perfect Models Management' ou 'Focus Model 241'" },
                date: { type: Type.STRING, description: "Date au format AAAA-MM-JJ" },
                category: { type: Type.STRING, description: "Ex: Interview, Événement, Tendance, Conseils"},
                excerpt: { type: Type.STRING, description: "Résumé court de 2-3 phrases." },
                imageUrl: { type: Type.STRING, description: "Laisse ce champ vide. Il sera rempli par l'utilisateur." },
                content: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, description: "heading, paragraph, quote, ou image" },
                            level: { type: Type.INTEGER, description: "Pour le type 'heading', 2 ou 3" },
                            text: { type: Type.STRING },
                            author: { type: Type.STRING, description: "Pour le type 'quote'" },
                            src: { type: Type.STRING, description: "Pour le type 'image'" },
                            alt: { type: Type.STRING, description: "Pour le type 'image'" },
                            caption: { type: Type.STRING, description: "Pour le type 'image'" }
                        },
                        required: ["type"]
                    }
                },
                tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ["title", "author", "date", "category", "excerpt", "content", "tags"]
        };

        try {
            if (!process.env.API_KEY) {
                throw new Error("La clé API Gemini n'est pas configurée.");
            }
            
            const { GoogleGenAI } = await import('@google/genai');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema
                }
            });

            const jsonResult = response.text;
            if (!jsonResult) {
                throw new Error("La génération IA n'a retourné aucun contenu exploitable.");
            }
            const parsedArticle: Partial<Article> = JSON.parse(jsonResult);
            onArticleGenerated(parsedArticle);

        } catch (err: any) {
            console.error("Erreur de l'API Gemini:", err);
            setError(err.message || "Une erreur est survenue lors de la génération de l'article.");
        } finally {
            setIsLoading(false);
        }

    }, [formData, onArticleGenerated]);

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-pm-dark border border-pm-gold/30 rounded-lg shadow-2xl shadow-pm-gold/10 w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-pm-gold/20">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-playfair text-pm-gold flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6" />
                            Générateur d'Article par IA
                        </h2>
                        <button onClick={onClose} className="text-pm-off-white/70 hover:text-white">
                            <CloseIcon />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                    <p className="text-sm text-pm-off-white/80">Fournissez les informations de base ci-dessous. L'IA rédigera un article complet et structuré que vous pourrez ensuite réviser et publier.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormTextArea label="Nom / Sujet Principal" name="subject" value={formData.subject} onChange={handleChange} rows={2} />
                        <FormTextArea label="Rôle / Fonction" name="role" value={formData.role} onChange={handleChange} rows={2} />
                    </div>
                    <FormTextArea label="Biographie / Description" name="bio" value={formData.bio} onChange={handleChange} rows={4} />
                    <FormTextArea label="Événement Associé (optionnel)" name="event" value={formData.event} onChange={handleChange} rows={2} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormTextArea label="URLs des Photos (une par ligne)" name="photos" value={formData.photos} onChange={handleChange} rows={4} />
                        <FormTextArea label="Citations (une par ligne)" name="quotes" value={formData.quotes} onChange={handleChange} rows={4} />
                    </div>
                    {error && <div className="p-3 bg-red-900/50 border border-red-500 text-red-300 text-sm rounded-md">{error}</div>}
                </div>
                
                <div className="p-6 border-t border-pm-gold/20 flex justify-end gap-4">
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading || !formData.subject}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Génération en cours...' : 'Générer l\'article'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArticleGenerator;
