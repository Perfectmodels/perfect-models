'use client';

import React, { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

type MediaKind = 'image' | 'video';

interface BlobMediaUploaderProps {
  kind: MediaKind;
  value?: string;
  onChange: (url: string) => void;
  scope: string;
  label?: string;
  compact?: boolean;
  required?: boolean;
}

const IMAGE_TYPES = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
const VIDEO_TYPES = 'video/mp4,video/webm,video/quicktime';
const IMAGE_MAX = 15 * 1024 * 1024;
const VIDEO_MAX = 1024 * 1024 * 1024;
const MULTI_UPLOAD_CONCURRENCY = 3;

const safeFilename = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'media';

export default function BlobMediaUploader({
  kind,
  value = '',
  onChange,
  scope,
  label,
  compact = false,
  required = false,
}: BlobMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedCount, setSelectedCount] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [error, setError] = useState('');

  const accept = kind === 'image' ? IMAGE_TYPES : VIDEO_TYPES;
  const maxBytes = kind === 'image' ? IMAGE_MAX : VIDEO_MAX;
  const multi = kind === 'image' && compact;

  const validateFile = (file: File) => {
    if (!file.type.startsWith(`${kind}/`) && !(kind === 'video' && file.type === 'video/quicktime')) {
      throw new Error(kind === 'image' ? 'Format image non accepté.' : 'Format vidéo non accepté. Utilisez MP4, WebM ou MOV.');
    }
    if (file.size > maxBytes) {
      throw new Error(kind === 'image' ? 'Image trop lourde (15 Mo maximum).' : 'Vidéo trop lourde (1 Go maximum).');
    }
  };

  const uploadSingle = async (file: File, index: number) => {
    validateFile(file);

    const pathname = `pmm/${scope}/${Date.now()}-${index}-${safeFilename(file.name)}`;
    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/media/client-upload',
      clientPayload: JSON.stringify({ kind, scope }),
      multipart: file.size > 100 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => {
        if (!multi) setProgress(Math.round(percentage));
      },
    });

    return blob.url;
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setError('');
    setUploading(true);
    setProgress(0);
    setSelectedCount(files.length);
    setUploadedCount(0);

    const validFiles: File[] = [];
    const validationErrors: string[] = [];

    for (const file of files) {
      try {
        validateFile(file);
        validFiles.push(file);
      } catch (cause: any) {
        validationErrors.push(`${file.name}: ${cause?.message || 'fichier invalide'}`);
      }
    }

    if (!validFiles.length) {
      setError(validationErrors.join(' '));
      setUploading(false);
      setSelectedCount(0);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    let completed = 0;
    let firstError = validationErrors[0] || '';
    let cursor = 0;

    const worker = async () => {
      while (cursor < validFiles.length) {
        const index = cursor++;
        const file = validFiles[index];
        try {
          const url = await uploadSingle(file, index);
          onChange(url);
        } catch (cause: any) {
          if (!firstError) firstError = `${file.name}: ${cause?.message || 'Échec du téléversement.'}`;
        } finally {
          completed += 1;
          setUploadedCount(completed);
          setProgress(Math.round((completed / validFiles.length) * 100));
        }
      }
    };

    try {
      const workers = Array.from(
        { length: Math.min(MULTI_UPLOAD_CONCURRENCY, validFiles.length) },
        () => worker(),
      );
      await Promise.all(workers);
      if (firstError) setError(firstError);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs uppercase tracking-widest text-pm-off-white/50">
          {label}{required ? ' *' : ''}
        </label>
      )}

      {value && !multi && (
        <div className="relative overflow-hidden rounded-lg border border-pm-gold/20 bg-black">
          {kind === 'image' ? (
            <img src={value} alt="Aperçu" className="h-44 w-full object-cover" />
          ) : (
            <video src={value} controls preload="metadata" className="max-h-72 w-full bg-black" />
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-full bg-black/80 p-1.5 text-white/70 hover:text-red-400"
            title="Retirer le média"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`inline-flex items-center justify-center gap-2 border border-pm-gold/30 text-pm-gold hover:bg-pm-gold/10 disabled:opacity-50 ${
          compact ? 'px-3 py-2 text-[10px]' : 'w-full rounded-lg border-dashed px-4 py-5 text-xs'
        } font-bold uppercase tracking-widest transition-colors`}
      >
        <ArrowUpTrayIcon className="h-4 w-4" />
        {uploading
          ? multi
            ? `Téléversement ${uploadedCount}/${selectedCount} — ${progress}%`
            : `Téléversement ${progress}%`
          : multi
            ? 'Ajouter plusieurs images'
            : value
              ? 'Remplacer'
              : kind === 'image'
                ? 'Téléverser une image'
                : 'Téléverser la vidéo'}
      </button>

      {uploading && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-pm-gold transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}

      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept={accept}
        multiple={multi}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) void handleFiles(files);
        }}
      />

      {!compact && (
        <p className="text-[10px] text-white/30">
          {kind === 'image' ? 'JPG, PNG, WEBP, GIF ou AVIF — stockage sécurisé via Vercel Blob.' : 'MP4, WebM ou MOV — 1 Go max. Stockage via Vercel Blob.'}
        </p>
      )}
      {multi && !uploading && <p className="text-[10px] text-white/30">Sélection multiple activée — vous pouvez choisir plus de 10 photos en une seule fois.</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
