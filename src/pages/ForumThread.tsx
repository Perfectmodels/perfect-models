

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ForumReply } from '../types';
import NotFound from './NotFound';

const ForumThread: React.FC = () => {
    const { data, saveData, isInitialized } = useData();
    const { user: authUser } = useAuth();
    const { threadId } = useParams<{ threadId: string }>();
    const [newReply, setNewReply] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const userId = authUser?.userId ?? null;
    const user = data?.models.find(m => m.id === userId);

    const thread = data?.forumThreads.find(t => t.id === threadId);
    const replies = data?.forumReplies.filter(r => r.threadId === threadId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) || [];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [replies]);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newReply.trim() || !user || !data || !thread) return;

        const replyData: ForumReply = {
            id: Date.now().toString(),
            threadId: thread.id,
            authorId: user.id,
            authorName: user.name,
            createdAt: new Date().toISOString(),
            content: newReply
        };

        const updatedReplies = [...data.forumReplies, replyData];
        try {
            await saveData({ ...data, forumReplies: updatedReplies });
            setNewReply('');
        } catch (error) {
            console.error("Erreur lors de l'envoi de la réponse:", error);
            alert("Impossible d'envoyer la réponse.");
        }
    };
    
    if (!isInitialized) {
        return <div className="bg-pm-dark text-pm-off-white min-h-screen flex items-center justify-center"><p>Chargement...</p></div>;
    }

    if (!thread) {
        return <NotFound />;
    }
    
    const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      return date.toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <SEO title={thread.title} noIndex />
             <div className="bg-pm-dark text-pm-off-white h-screen flex flex-col pt-28">
                <div className="container mx-auto px-4 sm:px-6 flex-grow flex flex-col h-full overflow-hidden">
                    <header className="flex items-center gap-4 mb-4 flex-shrink-0">
                        <Link to="/formations/forum" className="text-pm-gold hover:underline p-2">
                            <ArrowLeftIcon className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-playfair text-pm-gold truncate">{thread.title}</h1>
                            <p className="text-xs text-pm-off-white/60">Lancé par {thread.authorName}</p>
                        </div>
                    </header>
                    
                    <main className="flex-grow bg-black border border-pm-gold/20 rounded-t-lg overflow-y-auto p-4 space-y-4">
                        {/* Initial Post */}
                        <div className="bg-pm-dark p-4 border border-pm-gold/20 rounded-lg">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <p className="font-bold text-pm-gold">{thread.authorName}</p>
                                <p className="text-xs text-pm-off-white/50">{formatTimestamp(thread.createdAt)}</p>
                            </div>
                            <p className="whitespace-pre-wrap">{thread.initialPost}</p>
                        </div>

                        {/* Replies */}
                        {replies.map(reply => {
                            const isCurrentUser = reply.authorId === userId;
                            return (
                                <div key={reply.id} className={`flex items-start gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                    {!isCurrentUser && (
                                        <div className="flex-shrink-0 bg-pm-dark rounded-full h-10 w-10 flex items-center justify-center mt-1">
                                            <UserCircleIcon className="h-8 w-8 text-pm-gold/50" />
                                        </div>
                                    )}
                                    <div className={`max-w-md md:max-w-lg p-3 rounded-lg flex flex-col ${isCurrentUser ? 'bg-pm-gold/80 text-pm-dark' : 'bg-pm-dark'}`}>
                                        <div className="flex justify-between items-center gap-4">
                                            {!isCurrentUser && <p className="font-bold text-sm text-pm-gold">{reply.authorName}</p>}
                                            <p className={`text-xs ${isCurrentUser ? 'text-pm-dark/70' : 'text-pm-off-white/50'}`}>{formatTimestamp(reply.createdAt)}</p>
                                        </div>
                                        <p className="whitespace-pre-wrap mt-1">{reply.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </main>

                    <footer className="flex-shrink-0">
                        <form onSubmit={handleReplySubmit} className="bg-black border-x border-b border-pm-gold/20 rounded-b-lg p-3 flex items-center gap-3">
                            <input
                                type="text"
                                value={newReply}
                                onChange={(e) => setNewReply(e.target.value)}
                                placeholder="Écrivez votre réponse..."
                                className="flex-grow bg-pm-dark border border-pm-off-white/30 rounded-full p-3 px-5 focus:outline-none focus:border-pm-gold transition-colors"
                            />
                            <button type="submit" disabled={!newReply.trim()} className="bg-pm-gold text-pm-dark p-3 rounded-full hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed">
                                <PaperAirplaneIcon className="w-6 h-6" />
                            </button>
                        </form>
                    </footer>
                </div>
             </div>
        </>
    );
};

export default ForumThread;
