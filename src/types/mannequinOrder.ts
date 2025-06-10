
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

export interface Model {
  id: string;
  name: string;
  category: string;
  experience: string;
  image?: string;
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
