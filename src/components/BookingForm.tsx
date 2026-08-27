import React, { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { notifyAdmin } from '../utils/adminNotify';

interface BookingFormProps {
  prefilledModelName?: string;
  onSuccess?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ prefilledModelName, onSuccess }) => {
  const { addDocument } = useData();
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientCompany: '',
    requestedModels: prefilledModelName || '',
    startDate: '',
    endDate: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (prefilledModelName) setFormData((current) => ({ ...current, requestedModels: prefilledModelName }));
  }, [prefilledModelName]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setStatusMessage('');

    try {
      const id = await addDocument('bookingRequests', {
        submissionDate: new Date().toISOString(),
        status: 'Nouveau',
        ...formData,
      });
      if (!id) throw new Error('La demande n’a pas pu être enregistrée.');

      notifyAdmin('booking', `${formData.clientName} — ${formData.requestedModels}`, '/admin/bookings').catch(() => undefined);
      setStatus('success');
      setStatusMessage('Demande de booking envoyée ! Un email de confirmation vous a été adressé.');
      setFormData({
        clientName: '', clientEmail: '', clientCompany: '', requestedModels: prefilledModelName || '', startDate: '', endDate: '', message: '',
      });
      onSuccess?.();
    } catch (error) {
      console.error(error);
      setStatus('error');
      setStatusMessage("Une erreur est survenue lors de l'envoi de votre demande.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Votre Nom Complet" name="clientName" value={formData.clientName} onChange={handleChange} required />
        <FormInput label="Votre Email" name="clientEmail" type="email" value={formData.clientEmail} onChange={handleChange} required />
      </div>
      <FormInput label="Société (optionnel)" name="clientCompany" value={formData.clientCompany} onChange={handleChange} />
      <FormInput label="Mannequin(s) souhaité(s)" name="requestedModels" value={formData.requestedModels} onChange={handleChange} required disabled={!!prefilledModelName} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormInput label="Date de début (souhaitée)" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
        <FormInput label="Date de fin (souhaitée)" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
      </div>
      <FormTextArea label="Message / Détails du projet" name="message" value={formData.message} onChange={handleChange} required />

      <button type="submit" disabled={status === 'loading'} className="w-full px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest rounded-full transition-all hover:bg-white disabled:opacity-50">
        {status === 'loading' ? 'Envoi...' : 'Envoyer la demande'}
      </button>

      {statusMessage && (
        <p className={`text-center text-sm p-3 rounded-md ${status === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
          {statusMessage}
        </p>
      )}
    </form>
  );
};

const FormInput: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; disabled?: boolean }> = (props) => (
  <div>
    <label htmlFor={props.name} className="admin-label">{props.label}</label>
    <input {...props} id={props.name} className="admin-input" />
  </div>
);

const FormTextArea: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; required?: boolean }> = (props) => (
  <div>
    <label htmlFor={props.name} className="admin-label">{props.label}</label>
    <textarea {...props} id={props.name} rows={5} className="admin-input admin-textarea" />
  </div>
);

export default BookingForm;