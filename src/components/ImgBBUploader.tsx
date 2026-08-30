/**
 * ImgBBUploader — point d'entrée unique pour les images PMM.
 * Les fichiers passent toujours par /api/media/imgbb : aucune clé ImgBB n'est exposée au navigateur.
 */
import React, { useCallback, useRef, useState } from 'react';
import { ArrowUpTrayIcon, ExclamationTriangleIcon, PhotoIcon, Square2StackIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MediaPicker from './admin/MediaPicker';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB, uploadToImgbb, validateFile } from '../utils/imgbbService';

interface ImgBBUploaderProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  scope?: string;
  publicMode?: boolean;
  /** Compatibilité seulement : les URL manuelles restent volontairement désactivées. */
  allowUrl?: boolean;
  compact?: boolean;
  className?: string;
}

const ImgBBUploader: React.FC<ImgBBUploaderProps> = ({ label, value, onChange, folder, scope, publicMode = false, compact = false, className = '' }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const uploadScope = scope || folder || 'media';

  const registerInMediaLibrary = useCallback(async (url: string, file: File) => {
    try {
      const response = await fetch('/api/admin/resources/gallery', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'imgbb', url, file_name: file.name, mime_type: file.type, size_bytes: file.size, category: 'Autres', source: folder || 'upload', alt_text: file.name, metadata: { scope: uploadScope, verified: true } }),
      });
      if (!response.ok) console.warn('Impossible d’enregistrer le média dans la médiathèque');
    } catch (libraryError) {
      console.warn('Médiathèque indisponible pour ce média', libraryError);
    }
  }, [folder, uploadScope]);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setPreviewError(false);
    const validationError = validateFile(file, 'image');
    if (validationError) { setError(validationError); return; }
    try {
      setProgress(10);
      const url = await uploadToImgbb(file, { scope: uploadScope, onProgress: setProgress });
      if (!publicMode) await registerInMediaLibrary(url, file);
      onChange(url);
    } catch (uploadError: unknown) {
      setError(uploadError instanceof Error ? uploadError.message : "Erreur lors de l’envoi de l’image");
    } finally {
      setProgress(null);
    }
  }, [onChange, publicMode, registerInMediaLibrary, uploadScope]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleFile(file);
    event.target.value = '';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className={publicMode ? 'block text-[8px] font-black uppercase tracking-[.24em] text-white/40' : 'admin-label'}>{label}</label>}

      {value ? (
        <div className="group relative aspect-[4/5] w-full overflow-hidden border border-pm-gold/20 bg-black/30">
          {!previewError ? (
            <img src={value} alt="Prévisualisation" className="h-full w-full object-cover" onLoad={() => setPreviewError(false)} onError={() => setPreviewError(true)} />
          ) : (
            <div className="grid h-full w-full place-items-center p-5 text-center"><div><ExclamationTriangleIcon className="mx-auto h-8 w-8 text-red-300"/><p className="mt-3 text-xs font-semibold text-red-200">Image inaccessible. Téléversez un nouveau fichier ImgBB.</p></div></div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-4 pt-10">
            <span className="text-[8px] font-black uppercase tracking-[.22em] text-white/70">{previewError ? 'Lien image invalide' : 'Image ImgBB'}</span>
            <button type="button" onClick={() => { setPreviewError(false); onChange(''); }} aria-label="Supprimer l’image" className="grid h-9 w-9 place-items-center border border-white/20 bg-black/50 text-white transition hover:border-red-300 hover:text-red-300"><XMarkIcon className="h-4 w-4" /></button>
          </div>
        </div>
      ) : null}

      {progress !== null && <div className="h-1 w-full overflow-hidden bg-white/8"><div className="h-full bg-pm-gold transition-all duration-200" style={{ width: `${progress}%` }} /></div>}

      {!compact && (
        <button type="button" onDrop={(event) => { event.preventDefault(); setDragging(false); const file = event.dataTransfer.files?.[0]; if (file) void handleFile(file); }} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onClick={() => inputRef.current?.click()} className={`flex min-h-36 w-full flex-col items-center justify-center gap-3 border border-dashed px-5 py-7 text-center transition ${dragging ? 'border-pm-gold bg-pm-gold/[.08]' : 'border-white/15 bg-white/[.02] hover:border-pm-gold/50 hover:bg-pm-gold/[.04]'} ${progress !== null ? 'pointer-events-none opacity-60' : ''}`}>
          <PhotoIcon className="h-7 w-7 text-pm-gold/60" />
          <span className="text-[9px] font-black uppercase tracking-[.2em] text-white/55">{progress !== null ? `Envoi ${progress}%` : value ? 'Remplacer la photo' : 'Choisir une photo'}</span>
          <span className="max-w-xs text-[10px] leading-5 text-white/25">Téléversement sécurisé via ImgBB · JPG, PNG, WEBP, GIF ou AVIF · {MAX_IMAGE_SIZE_MB} Mo max.</span>
        </button>
      )}

      {compact && <button type="button" onClick={() => inputRef.current?.click()} disabled={progress !== null} className="inline-flex items-center gap-2 border border-pm-gold/30 px-4 py-2 text-[9px] font-black uppercase tracking-[.2em] text-pm-gold transition hover:bg-pm-gold/10 disabled:opacity-50"><ArrowUpTrayIcon className="h-3.5 w-3.5" />{progress !== null ? `${progress}%` : value ? 'Remplacer' : 'Téléverser'}</button>}
      <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_TYPES} onChange={handleInputChange} className="hidden" />

      {!publicMode && (
        <div className="flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => setShowPicker(true)} className="flex items-center gap-1 text-[9px] text-pm-gold/60 underline transition hover:text-pm-gold"><Square2StackIcon className="h-3 w-3" /> Bibliothèque ImgBB</button>
          <span className="text-[9px] text-white/25">Les URL manuelles sont désactivées pour éviter les liens cassés.</span>
        </div>
      )}

      {!publicMode && <MediaPicker isOpen={showPicker} onClose={() => setShowPicker(false)} onSelect={(urls) => { setPreviewError(false); onChange(urls[0]); }} multiple={false} resourceType="image" />}
      {error && <p className="border-l-2 border-red-400 px-3 py-2 text-xs text-red-300">{error}</p>}
    </div>
  );
};

export default ImgBBUploader;
