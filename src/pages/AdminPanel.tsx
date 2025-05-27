import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Upload } from 'lucide-react';
import MetaTags from '@/components/seo/MetaTags';

// Modal de confirmation simple
function ConfirmModal({ open, onConfirm, onCancel, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
        <div className="mb-4">{message}</div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm}>Confirmer</Button>
        </div>
      </div>
    </div>
  );
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
  const [contentForm, setContentForm] = useState({
    title: '',
    description: '',
    content_type: 'video',
    model_category: 'femme',
    course_type: 'theorique',
    duration: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contents, refetch: refetchContents, isFetching: isFetchingContents } = useQuery({
    queryKey: ['admin-classroom-content'],
    queryFn: async (): Promise<ClassroomContent[]> => {
      const response = await fetch('/functions/v1/admin-content', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Échec du chargement des contenus');
      return response.json();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
      const response = await fetch('/functions/v1/admin-upload', {
        method: 'POST',
        body: formData
      });
      setIsUploading(false);
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Échec de l’upload');
      }
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId })
      });
      if (!response.ok) throw new Error('Échec de la suppression');
    },
    onSuccess: () => {
      toast({ title: 'Suppression réussie', description: 'Le contenu a été supprimé' });
      refetchContents();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur de suppression',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner un fichier.', variant: 'destructive' });
      return;
    }
    const allowedTypes = contentForm.content_type === 'video'
      ? ['video/mp4', 'video/avi', 'video/webm', 'video/mov']
      : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast({ title: 'Type de fichier non autorisé', description: 'Veuillez sélectionner un fichier valide.', variant: 'destructive' });
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({ title: 'Fichier trop volumineux', description: 'Taille limite : 50 Mo.', variant: 'destructive' });
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <MetaTags 
        title="Panneau d'Administration - Perfect Models Management" 
        description="Gestion du contenu de formation pour mannequins"
      />
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Panneau d'Administration</h1>
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
                  disabled={isUploading}
                />
                
                <Select
                  value={contentForm.content_type}
                  onValueChange={(value: 'video' | 'pdf' | 'document') => 
                    setContentForm(prev => ({ ...prev, content_type: value }))
                  }
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
                  value={contentForm.model_category}
                  onValueChange={(value: 'femme' | 'homme' | 'enfant' | 'senior') => 
                    setContentForm(prev => ({ ...prev, model_category: value }))
                  }
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
                  value={contentForm.course_type}
                  onValueChange={(value: 'theorique' | 'pratique') => 
                    setContentForm(prev => ({ ...prev, course_type: value }))
                  }
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
                value={contentForm.description}
                onChange={(e) => setContentForm(prev => ({ ...prev, description: e.target.value }))}
                disabled={isUploading}
              />

              {contentForm.content_type === 'video' && (
                <Input
                  type="number"
                  placeholder="Durée en secondes"
                  value={contentForm.duration}
                  onChange={(e) => setContentForm(prev => ({ ...prev, duration: e.target.value }))}
                  disabled={isUploading}
                />
              )}

              <Input
                type="file"
                accept={contentForm.content_type === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                required
                disabled={isUploading}
              />

              <Button 
                type="submit" 
                disabled={isUploading || uploadMutation.isPending}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading || uploadMutation.isPending ? 'Upload en cours...' : 'Ajouter le contenu'}
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
            {isFetchingContents ? (
              <div>Chargement des contenus...</div>
            ) : (
              <div className="space-y-4">
                {contents?.length === 0 && (
                  <div>Aucun contenu pour le moment.</div>
                )}
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
                      onClick={() => setDeleteId(content.id)}
                      variant="destructive"
                      size="sm"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal confirmation suppression */}
        <ConfirmModal
          open={!!deleteId}
          onConfirm={() => {
            if (deleteId) deleteMutation.mutate(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
          message="Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible."
        />
      </div>
    </div>
  );
};

export default AdminPanel;
