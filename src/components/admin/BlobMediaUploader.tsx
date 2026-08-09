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
  const [error, setError] = useState('');

  const accept = kind === 'image' ? IMAGE_TYPES : VIDEO_TYPES;
  const maxBytes = kind === 'image' ? IMAGE_MAX : VIDEO_MAX;

  const handleFile = async (file: File) => {
    setError('');
    if (!file.type.startsWith(`${kind}/`) && !(kind === 'video' && file.type === 'video/quicktime')) {
      setError(kind === 'image' ? 'Format image non accepté.' : 'Format vidéo non accepté. Utilisez MP4, WebM ou MOV.');
      return;
    }
    if (file.size > maxBytes) {
      setError(kind === 'image' ? 'Image trop lourde (15 Mo maximum).' : 'Vidéo trop lourde (1 Go maximum).');
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const pathname = `pmm/${scope}/${Date.now()}-${safeFilename(file.name)}`;
      const blob = await upload(pathname, file, {
        access: 'public',
        handleUploadUrl: '/api/media/client-upload',
        clientPayload: JSON.stringify({ kind, scope }),
        multipart: kind === 'video' && file.size > 100 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      onChange(blob.url);
    } catch (cause: any) {
      setError(cause?.message || "Échec de l'upload vers Vercel Blob.");
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

      {value && (
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
        {uploading ? `Téléversement ${progress}%` : value ? 'Remplacer' : kind === 'image' ? 'Téléverser une image' : 'Téléverser la vidéo'}
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
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {!compact && (
        <p className="text-[10px] text-white/30">
          {kind === 'image' ? 'JPG, PNG, WEBP, GIF ou AVIF — 15 Mo max.' : 'MP4, WebM ou MOV — 1 Go max. Les gros fichiers utilisent un upload multipart.'}
        </p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
