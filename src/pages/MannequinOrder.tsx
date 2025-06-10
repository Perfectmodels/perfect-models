
import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ServiceTarif, OrderFormData } from '@/types/mannequinOrder';
import { serviceTarifs } from '@/data/serviceTarifs';
import { availableModels } from '@/data/availableModels';
import ServiceCard from '@/components/mannequin-order/ServiceCard';
import ModelSelection from '@/components/mannequin-order/ModelSelection';
import PricingInfo from '@/components/mannequin-order/PricingInfo';
import { createMannequinWhatsAppMessage } from '@/utils/mannequinWhatsApp';

const MannequinOrder = () => {
  const [selectedService, setSelectedService] = useState<ServiceTarif | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [formData, setFormData] = useState<OrderFormData>({
    clientName: '',
    email: '',
    phone: '',
    company: '',
    eventDate: '',
    eventLocation: '',
    mannequinGender: '',
    additionalRequests: '',
    budget: ''
  });
  const { toast } = useToast();

  const handleServiceSelect = (service: ServiceTarif) => {
    setSelectedService(service);
  };

  const handleModelSelection = (modelId: string, checked: boolean) => {
    if (checked) {
      setSelectedModels(prev => [...prev, modelId]);
    } else {
      setSelectedModels(prev => prev.filter(id => id !== modelId));
    }
  };

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    
    let baseTotal = selectedService.basePrice;
    
    // Tarif par mannequin supplémentaire (50% du tarif de base)
    if (selectedModels.length > 1) {
      baseTotal += (selectedModels.length - 1) * (selectedService.basePrice * 0.5);
    }
    
    // Réduction pour réservation anticipée
    const eventDate = new Date(formData.eventDate);
    const today = new Date();
    const daysInAdvance = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysInAdvance > 30) {
      baseTotal *= 0.85; // 15% de réduction
    } else if (daysInAdvance > 14) {
      baseTotal *= 0.9; // 10% de réduction
    }
    
    return Math.round(baseTotal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService) {
      toast({
        title: "Service requis",
        description: "Veuillez sélectionner un service avant de continuer.",
        variant: "destructive"
      });
      return;
    }

    if (selectedModels.length === 0) {
      toast({
        title: "Mannequin requis",
        description: "Veuillez sélectionner au moins un mannequin.",
        variant: "destructive"
      });
      return;
    }

    const whatsappUrl = createMannequinWhatsAppMessage(
      selectedService,
      selectedModels,
      formData,
      availableModels,
      calculateTotal()
    );

    window.open(whatsappUrl, '_blank');

    toast({
      title: "Commande envoyée !",
      description: "Votre demande a été transmise via WhatsApp. Nous vous recontacterons rapidement."
    });
  };

  const getServicesByCategory = (category: string) => {
    return serviceTarifs.filter(service => service.category === category);
  };

  const filteredModels = formData.mannequinGender && formData.mannequinGender !== 'mixte' 
    ? availableModels.filter(model => 
        model.category.toLowerCase() === formData.mannequinGender.toLowerCase()
      )
    : availableModels;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-model-black via-gray-900 to-model-black py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-model-white mb-4">
              Commande de <span className="text-model-gold">Mannequin</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Réservez nos mannequins professionnels pour vos événements, shootings et campagnes
            </p>
          </div>

          {/* Tarifs avantageux */}
          <div className="bg-model-gold/10 border border-model-gold/30 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-2xl font-bold text-model-gold mb-2">🎉 Tarifs Avantageux en FCFA 🎉</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-model-white">
              <div>
                <div className="text-lg font-semibold">📅 Réservation anticipée</div>
                <div className="text-sm">+30 jours: <span className="text-model-gold">-15%</span></div>
                <div className="text-sm">+14 jours: <span className="text-model-gold">-10%</span></div>
              </div>
              <div>
                <div className="text-lg font-semibold">👥 Mannequins multiples</div>
                <div className="text-sm">2ème mannequin: <span className="text-model-gold">50% du tarif</span></div>
              </div>
              <div>
                <div className="text-lg font-semibold">⭐ Qualité garantie</div>
                <div className="text-sm">Mannequins professionnels certifiés</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Services Selection */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-model-white mb-6">Nos Services</h2>
              
              {/* Shooting */}
              <div>
                <h3 className="text-lg font-semibold text-model-gold mb-3">📸 Shooting Photo</h3>
                <div className="space-y-3">
                  {getServicesByCategory('shooting').map(service => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      isSelected={selectedService?.id === service.id}
                      onSelect={() => handleServiceSelect(service)}
                    />
                  ))}
                </div>
              </div>

              {/* Défilé */}
              <div>
                <h3 className="text-lg font-semibold text-model-gold mb-3">👗 Défilé de Mode</h3>
                <div className="space-y-3">
                  {getServicesByCategory('defile').map(service => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      isSelected={selectedService?.id === service.id}
                      onSelect={() => handleServiceSelect(service)}
                    />
                  ))}
                </div>
              </div>

              {/* Événement */}
              <div>
                <h3 className="text-lg font-semibold text-model-gold mb-3">🎉 Événements</h3>
                <div className="space-y-3">
                  {getServicesByCategory('evenement').map(service => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      isSelected={selectedService?.id === service.id}
                      onSelect={() => handleServiceSelect(service)}
                    />
                  ))}
                </div>
              </div>

              {/* Publicité */}
              <div>
                <h3 className="text-lg font-semibold text-model-gold mb-3">📺 Publicité</h3>
                <div className="space-y-3">
                  {getServicesByCategory('publicite').map(service => (
                    <ServiceCard 
                      key={service.id} 
                      service={service} 
                      isSelected={selectedService?.id === service.id}
                      onSelect={() => handleServiceSelect(service)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Form */}
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
                      <SelectItem value="mixte">Mixte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <ModelSelection 
                  models={filteredModels}
                  selectedModels={selectedModels}
                  onModelSelection={handleModelSelection}
                />

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
                  disabled={!selectedService || selectedModels.length === 0}
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
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MannequinOrder;
