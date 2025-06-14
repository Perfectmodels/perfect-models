
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail } from 'lucide-react';
import { ServiceTarif, OrderFormData } from '@/types/mannequinOrder';
import { DetailedModel } from '@/types/modelTypes';
import ModelSelection from '@/components/mannequin-order/ModelSelection';
import PricingInfo from '@/components/mannequin-order/PricingInfo';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderFormProps {
  formData: OrderFormData;
  handleInputChange: (field: keyof OrderFormData, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  selectedService: ServiceTarif | null;
  selectedModels: string[];
  handleModelSelection: (modelId: string, checked: boolean) => void;
  calculateTotal: () => number;
  isLoadingModels: boolean;
  filteredModels: DetailedModel[];
}

const OrderForm = ({
  formData,
  handleInputChange,
  handleSubmit,
  selectedService,
  selectedModels,
  handleModelSelection,
  calculateTotal,
  isLoadingModels,
  filteredModels,
}: OrderFormProps) => {
  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-model-black mb-6">Formulaire de Commande</h2>
      
      <PricingInfo 
        selectedService={selectedService}
        selectedModelsCount={selectedModels.length}
        eventDate={formData.eventDate}
        calculateTotal={calculateTotal}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="clientName">Nom complet *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="company">Entreprise</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="eventDate">Date de l'événement *</Label>
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="eventLocation">Lieu *</Label>
            <Input
              id="eventLocation"
              value={formData.eventLocation}
              onChange={(e) => handleInputChange('eventLocation', e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="mannequinGender">Préférence de genre</Label>
          <Select value={formData.mannequinGender} onValueChange={(value) => handleInputChange('mannequinGender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="femme">Femme</SelectItem>
              <SelectItem value="homme">Homme</SelectItem>
              <SelectItem value="mixte">Mixte (tous)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoadingModels ? (
          <div className="space-y-3 p-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <ModelSelection 
            models={filteredModels}
            selectedModels={selectedModels}
            onModelSelection={handleModelSelection}
          />
        )}

        <div>
          <Label htmlFor="additionalRequests">Demandes spéciales</Label>
          <Textarea
            id="additionalRequests"
            value={formData.additionalRequests}
            onChange={(e) => handleInputChange('additionalRequests', e.target.value)}
            placeholder="Décrivez vos besoins spécifiques..."
            rows={3}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-model-gold hover:bg-model-gold/90 text-model-black font-semibold"
          disabled={!selectedService || selectedModels.length === 0 || isLoadingModels}
        >
          Envoyer la Commande via WhatsApp
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            <span>+241 07 50 79 50</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            <span>info@agencemannequin.ga</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
