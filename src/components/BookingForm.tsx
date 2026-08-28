'use client';

import React, { useEffect, useId, useState } from 'react';

interface BookingFormProps {
  prefilledModelName?: string;
  modelId?: string;
  onSuccess?: () => void;
}

const fieldClass = 'min-h-12 w-full rounded-xl border border-pm-ink/15 bg-white px-4 py-3 text-[15px] text-pm-ink outline-none transition placeholder:text-pm-ink/35 focus-visible:border-pm-coral focus-visible:ring-4 focus-visible:ring-pm-coral/10 disabled:cursor-not-allowed disabled:bg-pm-ink/[.04]';
const labelClass = 'mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-pm-ink/65';

const BookingForm: React.FC<BookingFormProps> = ({ prefilledModelName, modelId, onSuccess }) => {
  const baseId = useId();
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    requestedModels: prefilledModelName || '',
    startDate: '',
    endDate: '',
    projectType: 'Shooting photo',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (prefilledModelName) setFormData((current) => ({ ...current, requestedModels: prefilledModelName }));
  }, [prefilledModelName]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setStatusMessage('');

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      setStatus('error');
      setStatusMessage('La date de fin doit être postérieure à la date de début.');
      return;
    }

    try {
      const response = await fetch('/api/intake/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, modelId: modelId || null }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'La demande n’a pas pu être enregistrée.');

      setStatus('success');
      setStatusMessage('Demande de booking enregistrée. Notre équipe vous recontactera.');
      setFormData({
        clientName: '', clientEmail: '', clientCompany: '', requestedModels: prefilledModelName || '', startDate: '', endDate: '', projectType: 'Shooting photo', message: '',
      });
      onSuccess?.();
    } catch (error) {
      setStatus('error');
      setStatusMessage(error instanceof Error ? error.message : "Une erreur est survenue lors de l'envoi de votre demande.");
    }
  };

  const id = (name: string) => `${baseId}-${name}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-describedby={statusMessage ? id('status') : undefined}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div><label htmlFor={id('clientName')} className={labelClass}>Votre nom complet <span aria-hidden="true">*</span></label><input id={id('clientName')} name="clientName" className={fieldClass} value={formData.clientName} onChange={handleChange} required autoComplete="name" /></div>
        <div><label htmlFor={id('clientEmail')} className={labelClass}>Votre e-mail <span aria-hidden="true">*</span></label><input id={id('clientEmail')} name="clientEmail" type="email" inputMode="email" autoComplete="email" className={fieldClass} value={formData.clientEmail} onChange={handleChange} required /></div>
      </div>
      <div><label htmlFor={id('clientCompany')} className={labelClass}>Société / marque</label><input id={id('clientCompany')} name="clientCompany" className={fieldClass} value={formData.clientCompany} onChange={handleChange} autoComplete="organization" /></div>
      <div><label htmlFor={id('requestedModels')} className={labelClass}>Mannequin souhaité <span aria-hidden="true">*</span></label><input id={id('requestedModels')} name="requestedModels" className={fieldClass} value={formData.requestedModels} onChange={handleChange} required disabled={Boolean(prefilledModelName)} aria-describedby={prefilledModelName ? id('model-help') : undefined} />{prefilledModelName && <p id={id('model-help')} className="mt-2 text-sm text-pm-ink/50">Le mannequin est pré-sélectionné depuis sa fiche publique.</p>}</div>
      <div><label htmlFor={id('projectType')} className={labelClass}>Type de projet</label><select id={id('projectType')} name="projectType" className={fieldClass} value={formData.projectType} onChange={handleChange}><option>Shooting photo</option><option>Défilé de mode</option><option>Publicité / campagne</option><option>Vidéo / audiovisuel</option><option>Événement / accueil</option><option>Essayage / showroom</option><option>Influence / contenu digital</option><option>Autre</option></select></div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div><label htmlFor={id('startDate')} className={labelClass}>Date de début souhaitée</label><input id={id('startDate')} name="startDate" type="date" className={fieldClass} value={formData.startDate} onChange={handleChange} /></div>
        <div><label htmlFor={id('endDate')} className={labelClass}>Date de fin souhaitée</label><input id={id('endDate')} name="endDate" type="date" min={formData.startDate || undefined} className={fieldClass} value={formData.endDate} onChange={handleChange} /></div>
      </div>
      <div><label htmlFor={id('message')} className={labelClass}>Détails du projet <span aria-hidden="true">*</span></label><textarea id={id('message')} name="message" value={formData.message} onChange={handleChange} required rows={5} maxLength={3000} className={`${fieldClass} min-h-36 resize-y`} placeholder="Lieu, horaires, usage des images, équipe, attentes particulières…" /><p className="mt-2 text-right text-xs text-pm-ink/45">{formData.message.length}/3000</p></div>

      <button type="submit" disabled={status === 'loading'} className="min-h-12 w-full rounded-full bg-pm-coral px-8 py-3 text-sm font-extrabold uppercase tracking-[.1em] text-white transition hover:bg-pm-wine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-pm-coral disabled:opacity-50">
        {status === 'loading' ? 'Envoi…' : 'Envoyer la demande'}
      </button>

      <div aria-live={status === 'error' ? 'assertive' : 'polite'} aria-atomic="true">
        {statusMessage && <p id={id('status')} role={status === 'error' ? 'alert' : 'status'} className={`rounded-xl border p-3 text-center text-sm font-semibold ${status === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-800'}`}>{statusMessage}</p>}
      </div>
    </form>
  );
};

export default BookingForm;
