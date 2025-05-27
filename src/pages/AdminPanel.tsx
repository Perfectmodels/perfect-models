
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Upload, LogOut } from 'lucide-react';
import MetaTags from '@/components/seo/MetaTags';

interface AdminSession {
  id: string;
  username: string;
}

interface ClassroomContent {
  id: string;
  title: string;
  description: string;
  content_type: 'video' | 'pdf' | 'document';
  model_category: 'femme' | 'homme' | 'enfant' | 'senior';
  course_type: 'theorique' | 'pratique';
  file_url: string;
  file_size: number;
  duration: number;
  thumbnail_url: string;
  is_published: boolean;
  created_at: string;
}

const AdminPanel = () => {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    content_type: 'video' as const,
    model_category: 'femme' as const,
    course_type: 'theorique' as const,
    duration: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contents, refetch: refetchContents } = useQuery({
    queryKey: ['admin-classroom-content'],
    queryFn: async () => {
      const response = await fetch('/functions/v1/admin-content', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminSession?.id}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch contents');
      return response.json() as ClassroomContent[];
    },
    enabled: !!adminSession
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/functions/v1/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setAdminSession(data);
      toast({ title: 'Connexion réussie', description: 'Bienvenue dans le panneau d\'administration' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erreur de connexion', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/functions/v1/admin-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSession?.id}`
        },
        body: formData
      });
      
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Upload réussi', description: 'Le contenu a été ajouté avec succès' });
      setContentForm({
        title: '',
        description: '',
        content_type: 'video',
        model_category: 'femme',
        course_type: 'theorique',
        duration: ''
      });
      setSelectedFile(null);
      refetchContents();
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Erreur d\'upload', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const response = await fetch('/functions/v1/admin-delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminSession?.id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contentId })
      });
      
      if (!response.ok) throw new Error('Delete failed');
    },
    onSuccess: () => {
      toast({ title: 'Suppression réussie', description: 'Le contenu a été supprimé' });
      refetchContents();
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un fichier', variant: 'destructive' });
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', contentForm.title);
    formData.append('description', contentForm.description);
    formData.append('content_type', contentForm.content_type);
    formData.append('model_category', contentForm.model_category);
    formData.append('course_type', contentForm.course_type);
    if (contentForm.duration) {
      formData.append('duration', contentForm.duration);
    }

    uploadMutation.mutate(formData);
  };

  const handleLogout = () => {
    setAdminSession(null);
    setLoginForm({ username: '', password: '' });
  };

  if (!adminSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <MetaTags title="Administration - Perfect Models Management" />
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Administration</CardTitle>
            <CardDescription>Connectez-vous pour accéder au panneau d'administration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="text"
                placeholder="Nom d'utilisateur"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                required
              />
              <Input
                type="password"
                placeholder="Mot de passe"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
              />
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <MetaTags title="Panneau d'Administration - Perfect Models Management" />
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panneau d'Administration</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Upload Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ajouter du contenu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Titre"
                  value={contentForm.title}
                  onChange={(e) => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
                
                <Select
                  value={contentForm.content_type}
                  onValueChange={(value: 'video' | 'pdf' | 'document') => 
                    setContentForm(prev => ({ ...prev, content_type: value }))
                  }
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
                  value={contentForm.model_category}
                  onValueChange={(value: 'femme' | 'homme' | 'enfant' | 'senior') => 
                    setContentForm(prev => ({ ...prev, model_category: value }))
                  }
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
                  value={contentForm.course_type}
                  onValueChange={(value: 'theorique' | 'pratique') => 
                    setContentForm(prev => ({ ...prev, course_type: value }))
                  }
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
                value={contentForm.description}
                onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
              />

              {contentForm.content_type === 'video' && (
                <Input
                  type="number"
                  placeholder="Durée en secondes"
                  value={contentForm.duration}
                  onChange={(e) => setContentForm(prev => ({ ...prev, duration: e.target.value }))}
                />
              )}

              <Input
                type="file"
                accept={contentForm.content_type === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                required
              />

              <Button 
                type="submit" 
                disabled={uploadMutation.isPending}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadMutation.isPending ? 'Upload en cours...' : 'Ajouter le contenu'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle>Contenu existant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contents?.map((content) => (
                <div key={content.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <h3 className="font-semibold">{content.title}</h3>
                    <p className="text-sm text-gray-600">{content.description}</p>
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
                    onClick={() => deleteMutation.mutate(content.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
