import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import MetaTags from '@/components/seo/MetaTags';
import { Trash2, Upload } from 'lucide-react';

// Modal de confirmation
function ConfirmModal({ open, onConfirm, onCancel, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="mb-4 font-semibold text-center">{message}</div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm}>Supprimer</Button>
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
  const [form, setForm] = useState(DEFAULT_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des contenus existants
  const { data: contents = [], isFetching } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => {
      const res = await fetch('/functions/v1/admin-content');
      if (!res.ok) throw new Error('Erreur chargement contenus');
      return res.json();
    },
  });

  // Ajout de contenu
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      setIsUploading(true);
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
      queryClient.invalidateQueries(['admin-content']);
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur ajout', description: err.message, variant: 'destructive' });
    }
  });

  // Suppression de contenu
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/functions/v1/admin-delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId: id }),
      });
      if (!res.ok) throw new Error('Erreur suppression');
    },
    onSuccess: () => {
      toast({ title: 'Suppression', description: 'Le contenu a été supprimé.' });
      queryClient.invalidateQueries(['admin-content']);
    },
    onError: (err: Error) => {
      toast({ title: 'Erreur suppression', description: err.message, variant: 'destructive' });
    }
  });

  // Soumission formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({ title: 'Fichier manquant', description: 'Ajoute un fichier.', variant: 'destructive' });
      return;
    }
    const allowedTypes = form.content_type === 'video'
      ? ['video/mp4', 'video/avi', 'video/webm', 'video/mov']
      : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Type invalide', description: 'Fichier non autorisé.', variant: 'destructive' });
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast({ title: 'Fichier trop volumineux', description: 'Max 50 Mo.', variant: 'destructive' });
      return;
    }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append('file', file);
    uploadMutation.mutate(fd);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <MetaTags title="Admin - Perfect Models" description="Gestion des contenus de formation" />
      <div className="container mx-auto max-w-3xl px-6">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-2">Panneau d'administration</h1>
          <p className="text-gray-500">Ajoute, modifie ou supprime le contenu de formation.</p>
        </header>

        {/* Formulaire d'ajout */}
        <section className="mb-12">
          <form
            className="bg-white rounded-lg shadow-md p-6 grid gap-6"
            onSubmit={handleSubmit}
          >
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Titre"
                placeholder="Titre du contenu"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
                disabled={isUploading}
              />
              <Select
                value={form.content_type}
                onValueChange={value => setForm(f => ({ ...f, content_type: value }))}
                disabled={isUploading}
                label="Type de contenu"
              >
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="document">Document</SelectItem>
              </Select>
              <Select
                value={form.model_category}
                onValueChange={value => setForm(f => ({ ...f, model_category: value }))}
                disabled={isUploading}
                label="Catégorie"
              >
                <SelectItem value="femme">Femme</SelectItem>
                <SelectItem value="homme">Homme</SelectItem>
                <SelectItem value="enfant">Enfant</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </Select>
              <Select
                value={form.course_type}
                onValueChange={value => setForm(f => ({ ...f, course_type: value }))}
                disabled={isUploading}
                label="Type de cours"
              >
                <SelectItem value="theorique">Théorique</SelectItem>
                <SelectItem value="pratique">Pratique</SelectItem>
              </Select>
            </div>
            <Textarea
              label="Description"
              placeholder="Description du contenu"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              disabled={isUploading}
            />
            {form.content_type === 'video' && (
              <Input
                type="number"
                min={0}
                label="Durée en secondes"
                placeholder="Durée (secondes)"
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
              label="Fichier"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isUploading || uploadMutation.isPending}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading || uploadMutation.isPending ? 'Ajout en cours...' : 'Ajouter'}
            </Button>
          </form>
        </section>

        {/* Liste des contenus */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Contenus existants</h2>
          {isFetching ? (
            <div>Chargement...</div>
          ) : (
            <div className="space-y-4">
              {contents.length === 0 && <div>Aucun contenu.</div>}
              {contents.map(content => (
                <div key={content.id} className="bg-white rounded shadow flex items-center justify-between p-4">
                  <div>
                    <span className="block font-semibold">{content.title}</span>
                    <span className="block text-gray-400 text-sm mb-2">{content.description}</span>
                    <div className="flex gap-2">
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
                    onClick={() => setShowDelete(content.id)}
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
          open={!!showDelete}
          onConfirm={() => {
            if (showDelete) deleteMutation.mutate(showDelete);
            setShowDelete(null);
          }}
          onCancel={() => setShowDelete(null)}
          message="Confirmer la suppression de ce contenu ? Cette action est irréversible."
        />
      </div>
    </div>
  );
}
