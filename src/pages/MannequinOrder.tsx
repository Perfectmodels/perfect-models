
import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { useToast } from '@/hooks/use-toast';
import { ServiceTarif, OrderFormData } from '@/types/mannequinOrder';
import { useModels } from '@/hooks/useModels';
import { createMannequinWhatsAppMessage } from '@/utils/mannequinWhatsApp';
import MannequinOrderHeader from '@/components/mannequin-order/MannequinOrderHeader';
import AdvantageousPricing from '@/components/mannequin-order/AdvantageousPricing';
import ServiceSelectionList from '@/components/mannequin-order/ServiceSelectionList';
import OrderForm from '@/components/mannequin-order/OrderForm';

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
  const { data: allModels, isLoading: isLoadingModels } = useModels();

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
    
    if (!allModels) {
        toast({
            title: "Erreur",
            description: "Les mannequins ne sont pas encore chargés. Veuillez patienter.",
            variant: "destructive"
        });
        return;
    }

    const whatsappUrl = createMannequinWhatsAppMessage(
      selectedService,
      selectedModels,
      formData,
      allModels,
      calculateTotal()
    );

    window.open(whatsappUrl, '_blank');

    toast({
      title: "Commande envoyée !",
      description: "Votre demande a été transmise via WhatsApp. Nous vous recontacterons rapidement."
    });
  };

  const filteredModels = React.useMemo(() => {
    if (!allModels) return [];
    if (!formData.mannequinGender || formData.mannequinGender === 'mixte') {
      return allModels;
    }
    const genderMap = {
      femme: 'women',
      homme: 'men',
    };
    return allModels.filter(
      model => model.gender === genderMap[formData.mannequinGender as keyof typeof genderMap]
    );
  }, [allModels, formData.mannequinGender]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-model-black via-gray-900 to-model-black py-12">
        <div className="container mx-auto px-4">
          <MannequinOrderHeader />
          <AdvantageousPricing />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ServiceSelectionList
              selectedService={selectedService}
              onServiceSelect={handleServiceSelect}
            />
            <OrderForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              selectedService={selectedService}
              selectedModels={selectedModels}
              handleModelSelection={handleModelSelection}
              calculateTotal={calculateTotal}
              isLoadingModels={isLoadingModels}
              filteredModels={filteredModels}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MannequinOrder;
