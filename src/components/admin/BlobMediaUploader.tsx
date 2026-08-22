'use client';

import React, { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BlobMediaUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  scope: string;
  label?: string;
  required?: boolean;
}

const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);
const VIDEO_ACCEPT = Array.from(VIDEO_TYPES).join(',');
const VIDEO_MAX = 1024 * 1024 * 1024;

const safeFilename = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'media';

export default function BlobMediaUploader({
  value = '',
  onChange,
  scope,
  label,
  required = false,
}: BlobMediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const validateFile = (file: File) => {
    if (!VIDEO_TYPES.has(file.type)) {
      throw new Error('Format vidéo non accepté. Utilisez MP4, WebM ou MOV.');
    }
    if (file.size > VIDEO_MAX) {
      throw new Error('Vidéo trop lourde (1 Go maximum).');
    }
  };

  const uploadSingle = async (file: File) => {
    const pathname = `pmm/${scope}/${Date.now()}-${safeFilename(file.name)}`;
    const blob = await upload(pathname, file, {
      access: 'public',
      handleUploadUrl: '/api/media/client-upload',
      clientPayload: JSON.stringify({ kind: 'video', scope }),
      multipart: file.size > 100 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
    });
    return blob.url;
  };

  const handleFile = async (file: File) => {
    setError('');
    setProgress(0);

    try {
      validateFile(file);
    } catch (cause: any) {
      setError(cause?.message || 'Fichier vidéo invalide.');
      return;
    }

    setUploading(true);
    try {
      onChange(await uploadSingle(file));
    } catch (cause: any) {
      setError(cause?.message || 'Échec du téléversement de la vidéo.');
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
          <video src={value} controls preload="metadata" className="max-h-72 w-full bg-black" />
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-pm-gold/30 px-4 py-5 text-xs font-bold uppercase tracking-widest text-pm-gold transition-colors hover:bg-pm-gold/10 disabled:opacity-50"
      >
        <ArrowUpTrayIcon className="h-4 w-4" />
        {uploading ? `Téléversement ${progress}%` : value ? 'Remplacer' : 'Téléverser la vidéo'}
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
        accept={VIDEO_ACCEPT}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      <p className="text-[10px] text-white/30">MP4, WebM ou MOV — 1 Go max. Les gros fichiers utilisent Vercel Blob.</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
