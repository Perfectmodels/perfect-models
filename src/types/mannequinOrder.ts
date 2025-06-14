
export interface ServiceTarif {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  features: string[];
  category: 'shooting' | 'defile' | 'evenement' | 'publicite';
  recommended?: boolean;
}

export interface OrderFormData {
  clientName: string;
  email: string;
  phone: string;
  company: string;
  eventDate: string;
  eventLocation: string;
  mannequinGender: string;
  additionalRequests: string;
  budget: string;
}
