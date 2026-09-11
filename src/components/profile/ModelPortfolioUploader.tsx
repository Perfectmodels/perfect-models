'use client';

import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { Images, Loader2, UploadCloud } from 'lucide-react';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB, uploadToImgbb, validateFile } from '@/utils/imgbbService';

type Props = {
  modelId: string;
  disabled?: boolean;
  remainingSlots?: number;
  onUploaded: (urls: string[]) => Promise<void> | void;
};

type UploadState = {
  completed: number;
  total: number;
  currentName: string;
};

const MAX_BATCH_SIZE = 8;

export default function ModelPortfolioUploader({ modelId, disabled = false, remainingSlots = 24, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [upload, setUpload] = useState<UploadState | null>(null);
  const [error, setError] = useState('');

  const busy = Boolean(upload);

  async function handleFiles(files: FileList | File[]) {
    setError('');
    const selected = Array.from(files);
    if (!selected.length) return;
    if (remainingSlots <= 0) {
      setError('Votre portfolio contient déjà le nombre maximal de photos.');
      return;
    }

    const accepted = selected.slice(0, Math.min(remainingSlots, MAX_BATCH_SIZE));
    const validationError = accepted.map((file) => validateFile(file, 'image')).find(Boolean);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (selected.length > accepted.length) {
      setError(`Seules ${accepted.length} photo(s) peuvent être ajoutées en une fois.`);
    }

    try {
      const urls: string[] = [];
      const failed: string[] = [];
      for (let index = 0; index < accepted.length; index += 1) {
        const file = accepted[index];
        setUpload({ completed: index, total: accepted.length, currentName: file.name });
        try {
          const url = await uploadToImgbb(file, { scope: `models/${modelId}/portfolio` });
          urls.push(url);
        } catch {
          failed.push(file.name);
        }
      }
      if (urls.length) {
        setUpload({ completed: accepted.length, total: accepted.length, currentName: 'Enregistrement du portfolio' });
        await onUploaded(urls);
      }
      if (failed.length) {
        setError(urls.length
          ? `${failed.length} photo(s) n’ont pas pu être téléversées. Les autres ont bien été conservées.`
          : 'Aucune des photos sélectionnées n’a pu être téléversée.');
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Le téléversement des photos a échoué.');
    } finally {
      setUpload(null);
    }
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void handleFiles(event.target.files);
    event.target.value = '';
  }

  function onDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setDragging(false);
    if (!disabled && !busy && event.dataTransfer.files.length) void handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        disabled={disabled || busy || remainingSlots <= 0}
        className={`flex min-h-14 w-full min-w-0 items-center justify-center gap-3 rounded-2xl border border-dashed px-5 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto sm:min-w-[19rem] ${dragging ? 'border-pm-gold bg-pm-gold/15' : 'border-white/30 bg-white/5 hover:border-pm-gold/70 hover:bg-white/10'}`}
      >
        {busy ? <Loader2 size={20} className="shrink-0 animate-spin text-pm-gold-light" /> : <UploadCloud size={20} className="shrink-0 text-pm-gold-light" />}
        <span className="min-w-0">
          <span className="block text-[10px] font-black uppercase tracking-[.1em] text-white">{busy ? `${upload?.completed || 0}/${upload?.total || 0} photo(s)` : 'Ajouter des photos'}</span>
          <span className="mt-1 block max-w-[16rem] truncate text-[10px] text-white/50">{busy ? upload?.currentName : `Sélection multiple · ${MAX_IMAGE_SIZE_MB} Mo max/photo`}</span>
        </span>
      </button>
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES} multiple onChange={onInputChange} className="hidden" />
      <p className="mt-2 flex items-center gap-2 text-[10px] text-white/45"><Images size={13} className="shrink-0" />{remainingSlots > 0 ? `${remainingSlots} emplacement(s) disponible(s)` : 'Portfolio complet'}</p>
      {error && <p role="alert" className="mt-3 max-w-lg rounded-xl border border-red-300/25 bg-red-950/30 px-3 py-2 text-xs font-semibold leading-5 text-red-100">{error}</p>}
    </div>
  );
}
