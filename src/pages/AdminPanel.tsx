import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Textarea, Select, SelectItem, Badge } from '@/components/ui';
import { Trash2, Upload } from 'lucide-react';
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contents = [], isFetching } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => {
      const res = await fetch('/functions/v1/admin-content');
      if (!res.ok) throw new Error('Erreur chargement contenus');
      return res.json();
    },
  });

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

  return (
    <div className="min-h-screen bg-[#F6F8FB] py-10">
      {/* Header */}
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-[#22223B]">Panneau d’administration</h1>
        <p className="text-[#4A4E69] mt-2">Gérez vos contenus de formation</p>
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
              <SelectItem value="video">Vidéo</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="document">Document</SelectItem>
            </Select>
            <Select
              value={form.model_category}
              onValueChange={value => setForm(f => ({ ...f, model_category: value }))}
              disabled={isUploading}
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
            >
              <SelectItem value="theorique">Théorique</SelectItem>
              <SelectItem value="pratique">Pratique</SelectItem>
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
        message="Confirmer la suppression de ce contenu ? Cette action est irréversible."
      />
    </div>
  );
}
