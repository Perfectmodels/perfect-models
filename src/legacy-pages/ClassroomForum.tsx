import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, PlusIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ForumThread } from '../types';

const ClassroomForum: React.FC = () => {
    const { data, saveData, isInitialized } = useData();
    const { user: authUser } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [newThread, setNewThread] = useState({ title: '', initialPost: '' });

    const userId = authUser?.userId ?? null;
    const user = data?.models.find(m => m.id === userId);
    
    const threads = data?.forumThreads.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) || [];

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newThread.title.trim() || !newThread.initialPost.trim() || !user || !data) return;

        const threadData: ForumThread = {
            id: Date.now().toString(),
            title: newThread.title,
            initialPost: newThread.initialPost,
            authorId: user.id,
            authorName: user.name,
            createdAt: new Date().toISOString()
        };

        const updatedThreads = [...data.forumThreads, threadData];
        try {
            await saveData({ ...data, forumThreads: updatedThreads });
            setNewThread({ title: '', initialPost: '' });
            setIsCreating(false);
        } catch (error) {
            console.error("Erreur lors de la création de la discussion:", error);
            alert("Impossible de créer la discussion.");
        }
    };
    
    if (!isInitialized || !user) {
        return <div className="bg-pm-dark text-pm-off-white min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
    }

    return (
        <>
            <SEO title="Forum | PMM Classroom" noIndex />
            <div className="bg-pm-dark text-pm-off-white py-20 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
                    <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <ChatBubbleLeftRightIcon className="w-10 h-10 text-pm-gold" />
                            <div>
                                <h1 className="text-4xl font-playfair text-pm-gold">Forum de Discussion</h1>
                                <p className="text-sm text-pm-off-white/70">Échangez, posez des questions et partagez avec la communauté.</p>
                            </div>
                        </div>
                        <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white shadow-lg shadow-pm-gold/20">
                            <PlusIcon className="w-5 h-5"/> Lancer une Discussion
                        </button>
                    </header>

                    {isCreating && (
                        <div className="bg-black p-6 border border-pm-gold/20 rounded-lg mb-8">
                            <h2 className="text-2xl font-playfair text-pm-gold mb-4">Nouvelle Discussion</h2>
                            <form onSubmit={handleCreateThread} className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Titre de la discussion"
                                    value={newThread.title}
                                    onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                                    className="admin-input"
                                    required
                                />
                                <textarea
                                    placeholder="Votre premier message..."
                                    value={newThread.initialPost}
                                    onChange={(e) => setNewThread(prev => ({ ...prev, initialPost: e.target.value }))}
                                    className="admin-input admin-textarea"
                                    rows={5}
                                    required
                                />
                                <div className="flex justify-end gap-4">
                                    <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-pm-off-white/70 hover:text-white">Annuler</button>
                                    <button type="submit" className="px-6 py-2 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest text-sm rounded-full hover:bg-white">Publier</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {threads.map(thread => (
                            <Link to={`/formations/forum/${thread.id}`} key={thread.id} className="block bg-black p-4 border border-pm-gold/10 rounded-lg hover:border-pm-gold hover:bg-pm-dark transition-all duration-300">
                                <h3 className="text-xl font-bold text-pm-gold">{thread.title}</h3>
                                <div className="flex items-center justify-between text-xs text-pm-off-white/60 mt-2">
                                    <p>Par <span className="font-semibold">{thread.authorName}</span></p>
                                    <p>{new Date(thread.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                </div>
                            </Link>
                        ))}
                         {threads.length === 0 && !isCreating && (
                            <div className="text-center py-16">
                                <p className="text-pm-off-white/70">Aucune discussion pour le moment.</p>
                                <p className="mt-2 text-pm-off-white/70">Soyez le premier à en lancer une !</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

export default ClassroomForum;
