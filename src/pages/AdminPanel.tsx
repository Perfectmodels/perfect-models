import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Upload, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function ConfirmModal({ open, onConfirm, onCancel, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
        <div className="mb-4 font-semibold">{message}</div>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm}>Supprimer</Button>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin, isLoading, error }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!username || !password) {
      setLocalError('Nom d\'utilisateur et mot de passe requis');
      return;
    }
    onLogin(username, password);
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <User className="w-12 h-12 text-[#22223B] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#22223B]">Connexion Admin</h1>
          <p className="text-[#4A4E69] mt-2">Accédez au panneau d'administration</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          
          {displayError && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded">
              {displayError}
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full bg-[#22223B] text-white font-semibold py-2 rounded hover:bg-[#343a55] transition"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
        
        <div className="mt-6 text-xs text-gray-500 text-center bg-gray-50 p-3 rounded">
          <div className="font-semibold mb-1">Identifiants par défaut:</div>
          <div>Nom d'utilisateur: <strong>admin</strong></div>
          <div>Mot de passe: <strong>admin123</strong></div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_FORM = {
  title: '',
  description: '',
  content_type: 'video',
  model_category: 'femme',
  course_type: 'theorique',
  duration: ''
};

export default function AdminPanel() {
  const [admin, setAdmin] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Vérifier si admin déjà connecté au chargement
  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch (e) {
        localStorage.removeItem('adminUser');
      }
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      console.log('Attempting login with:', username);
      const res = await fetch('/functions/v1/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const responseText = await res.text();
      console.log('Login response status:', res.status);
      console.log('Login response text:', responseText);
      
      if (!res.ok) {
        let errorMessage = 'Erreur de connexion';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      try {
        return JSON.parse(responseText);
      } catch (e) {
        throw new Error('Réponse invalide du serveur');
      }
    },
    onSuccess: (adminData) => {
      console.log('Login successful:', adminData);
      setAdmin(adminData);
      setLoginError('');
      localStorage.setItem('adminUser', JSON.stringify(adminData));
      toast({ title: 'Connexion réussie', description: `Bienvenue ${adminData.username}!` });
    },
    onError: (err: Error) => {
      console.error('Login error:', err);
      const errorMessage = err.message || 'Identifiants incorrects';
      setLoginError(errorMessage);
      toast({ 
        title: 'Erreur de connexion', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  });

  const handleLogin = (username: string, password: string) => {
    setLoginError('');
    loginMutation.mutate({ username, password });
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem('adminUser');
    toast({ title: 'Déconnexion', description: 'Vous avez été déconnecté.' });
  };

  const { data: contents = [], isFetching } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => {
      if (!admin?.id) return [];
      const res = await fetch('/functions/v1/admin-content', {
        headers: {
          'Authorization': `Bearer ${admin.id}`,
        },
      });
      if (!res.ok) throw new Error('Erreur chargement contenus');
      return res.json();
    },
    enabled: !!admin?.id,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      formData.append('adminId', admin.id);
      const res = await fetch('/functions/v1/admin-upload', {
        method: 'POST',
        body: formData,
      });
      setIsUploading(false);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Ajout réussi', description: 'Le contenu a été ajouté.' });
      setForm(DEFAULT_FORM);
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur ajout', description: err.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/functions/v1/admin-delete', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${admin.id}`,
        },
        body: JSON.stringify({ contentId: id }),
      });
      if (!res.ok) throw new Error('Erreur suppression');
    },
    onSuccess: () => {
      toast({ title: 'Suppression', description: 'Le contenu a été supprimé.' });
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur suppression', description: err.message, variant: 'destructive' });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'Fichier manquant', description: 'Ajoute un fichier.', variant: 'destructive' });
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('file', file);
    uploadMutation.mutate(fd);
  };

  // Si pas connecté, afficher le formulaire de connexion
  if (!admin) {
    return (
      <LoginForm 
        onLogin={handleLogin} 
        isLoading={loginMutation.isPending} 
        error={loginError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FB] py-10">
      {/* Header avec déconnexion */}
      <header className="mb-10 text-center relative">
        <div className="absolute top-0 right-6">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-[#22223B]">Panneau d'administration</h1>
        <p className="text-[#4A4E69] mt-2">Bienvenue {admin.username} - Gérez vos contenus de formation</p>
      </header>

      {/* Formulaire d'ajout */}
      <section className="mx-auto max-w-xl bg-white rounded-lg shadow-lg p-8 mb-12">
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Titre"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
              disabled={isUploading}
            />
            <Select
              value={form.content_type}
              onValueChange={value => setForm(f => ({ ...f, content_type: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.model_category}
              onValueChange={value => setForm(f => ({ ...f, model_category: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="femme">Femme</SelectItem>
                <SelectItem value="homme">Homme</SelectItem>
                <SelectItem value="enfant">Enfant</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.course_type}
              onValueChange={value => setForm(f => ({ ...f, course_type: value }))}
              disabled={isUploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="theorique">Théorique</SelectItem>
                <SelectItem value="pratique">Pratique</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            disabled={isUploading}
          />
          {form.content_type === 'video' && (
            <Input
              type="number"
              min={0}
              placeholder="Durée (en secondes)"
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
              disabled={isUploading}
            />
          )}
          <Input
            type="file"
            accept={form.content_type === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
            disabled={isUploading}
          />
          <Button
            type="submit"
            className="w-full bg-[#22223B] text-white font-semibold py-2 text-lg rounded hover:bg-[#343a55] transition"
            disabled={isUploading || uploadMutation.isPending}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading || uploadMutation.isPending ? 'Ajout en cours...' : 'Ajouter le contenu'}
          </Button>
        </form>
      </section>

      {/* Liste des contenus */}
      <section className="mx-auto max-w-2xl">
        <h2 className="text-xl font-bold mb-4 text-[#22223B]">Contenus existants</h2>
        {isFetching ? (
          <div>Chargement...</div>
        ) : (
          <div className="space-y-4">
            {contents.length === 0 && <div>Aucun contenu.</div>}
            {contents.map(content => (
              <div
                key={content.id}
                className="bg-white rounded-lg shadow flex items-center justify-between p-5"
              >
                <div>
                  <div className="font-bold text-[#22223B]">{content.title}</div>
                  <div className="text-gray-500 text-sm mb-1">{content.description}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge>{content.content_type}</Badge>
                    <Badge variant="outline">{content.model_category}</Badge>
                    <Badge variant="outline">{content.course_type}</Badge>
                    <Badge variant={content.is_published ? 'default' : 'secondary'}>
                      {content.is_published ? 'Publié' : 'Brouillon'}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteId(content.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal suppression */}
      <ConfirmModal
        open={!!deleteId}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
        message="Confirmer la suppression de ce contenu ? Cette action est irréversible."
      />
    </div>
  );
}
