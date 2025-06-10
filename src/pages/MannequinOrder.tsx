
import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Phone, Mail, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceTarif {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  features: string[];
  category: 'shooting' | 'defile' | 'evenement' | 'publicite';
  recommended?: boolean;
}

const serviceTarifs: ServiceTarif[] = [
  {
    id: 'shooting-basic',
    name: 'Shooting Photo Basique',
    description: 'Séance photo professionnelle en studio',
    basePrice: 150,
    duration: '2-3 heures',
    features: ['1 mannequin', 'Studio inclus', '20 photos retouchées', 'Éclairage professionnel'],
    category: 'shooting'
  },
  {
    id: 'shooting-premium',
    name: 'Shooting Photo Premium',
    description: 'Séance photo avec mannequin expérimenté et décors multiples',
    basePrice: 300,
    duration: '4-6 heures',
    features: ['1 mannequin expérimenté', 'Multiple décors', '50 photos retouchées', 'Maquillage inclus', 'Styling conseil'],
    category: 'shooting',
    recommended: true
  },
  {
    id: 'defile-local',
    name: 'Défilé Local',
    description: 'Participation à un défilé de mode local',
    basePrice: 200,
    duration: '1 journée',
    features: ['1 mannequin', 'Répétitions incluses', 'Maquillage/coiffure', 'Transport local'],
    category: 'defile'
  },
  {
    id: 'defile-fashion-week',
    name: 'Fashion Week',
    description: 'Défilé haute couture pour événement majeur',
    basePrice: 800,
    duration: '2-3 jours',
    features: ['Mannequin professionnel', 'Formation intensive', 'Hébergement inclus', 'Équipe styling complète'],
    category: 'defile',
    recommended: true
  },
  {
    id: 'evenement-corporate',
    name: 'Événement Corporate',
    description: 'Présence lors d\'événements d\'entreprise',
    basePrice: 250,
    duration: '4-8 heures',
    features: ['Mannequin expérimenté', 'Tenue fournie', 'Formation protocole', 'Disponibilité flexible'],
    category: 'evenement'
  },
  {
    id: 'publicite-campagne',
    name: 'Campagne Publicitaire',
    description: 'Tournage pour spot publicitaire ou campagne marketing',
    basePrice: 500,
    duration: '1-2 jours',
    features: ['Mannequin professionnel', 'Droits d\'image inclus', 'Multiple prises', 'Post-production'],
    category: 'publicite',
    recommended: true
  }
];

const MannequinOrder = () => {
  const [selectedService, setSelectedService] = useState<ServiceTarif | null>(null);
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    company: '',
    eventDate: '',
    eventLocation: '',
    mannequinGender: '',
    mannequinCategory: '',
    additionalRequests: '',
    budget: ''
  });
  const { toast } = useToast();

  const handleServiceSelect = (service: ServiceTarif) => {
    setSelectedService(service);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    let total = selectedService.basePrice;
    
    // Réduction pour réservation anticipée
    const eventDate = new Date(formData.eventDate);
    const today = new Date();
    const daysInAdvance = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (daysInAdvance > 30) {
      total *= 0.85; // 15% de réduction
    } else if (daysInAdvance > 14) {
      total *= 0.9; // 10% de réduction
    }
    
    return Math.round(total);
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

    // Créer le message WhatsApp
    const total = calculateTotal();
    const discount = selectedService.basePrice - total;
    
    const message = `🎭 COMMANDE MANNEQUIN 🎭

📋 INFORMATIONS CLIENT:
👤 Nom: ${formData.clientName}
📧 Email: ${formData.email}
📱 Téléphone: ${formData.phone}
🏢 Entreprise: ${formData.company || 'Particulier'}

🎯 SERVICE SÉLECTIONNÉ:
✨ ${selectedService.name}
📝 ${selectedService.description}
⏰ Durée: ${selectedService.duration}

📅 DÉTAILS ÉVÉNEMENT:
📆 Date: ${formData.eventDate}
📍 Lieu: ${formData.eventLocation}
👥 Profil mannequin: ${formData.mannequinGender} - ${formData.mannequinCategory}

💰 TARIFICATION:
💵 Prix de base: ${selectedService.basePrice}€
${discount > 0 ? `🎉 Réduction: -${discount}€` : ''}
💳 TOTAL: ${total}€

📝 Demandes spéciales:
${formData.additionalRequests || 'Aucune'}

🎁 Avantages inclus:
${selectedService.features.map(feature => `✅ ${feature}`).join('\n')}`;

    const whatsappUrl = `https://wa.me/24177123456?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    toast({
      title: "Commande envoyée !",
      description: "Votre demande a été transmise via WhatsApp. Nous vous recontacterons rapidement."
    });
  };

  const getServicesByCategory = (category: string) => {
    return serviceTarifs.filter(service => service.category === category);
  };

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
            <h2 className="text-2xl font-bold text-model-gold mb-2">🎉 Tarifs Avantageux 🎉</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-model-white">
              <div>
                <div className="text-lg font-semibold">📅 Réservation anticipée</div>
                <div className="text-sm">+30 jours: <span className="text-model-gold">-15%</span></div>
                <div className="text-sm">+14 jours: <span className="text-model-gold">-10%</span></div>
              </div>
              <div>
                <div className="text-lg font-semibold">🎁 Services inclus</div>
                <div className="text-sm">Maquillage, styling, transport</div>
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
              
              {selectedService && (
                <div className="bg-model-gold/10 border border-model-gold/30 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-model-black mb-2">Service sélectionné:</h3>
                  <p className="text-model-black">{selectedService.name}</p>
                  <p className="text-sm text-gray-600">{selectedService.description}</p>
                  <div className="mt-2">
                    <span className="text-lg font-bold text-model-gold">
                      {calculateTotal()}€
                    </span>
                    {calculateTotal() < selectedService.basePrice && (
                      <span className="ml-2 text-sm line-through text-gray-500">
                        {selectedService.basePrice}€
                      </span>
                    )}
                  </div>
                </div>
              )}

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mannequinGender">Genre souhaité</Label>
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
                  <div>
                    <Label htmlFor="mannequinCategory">Catégorie</Label>
                    <Select value={formData.mannequinCategory} onValueChange={(value) => handleInputChange('mannequinCategory', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debutant">Débutant</SelectItem>
                        <SelectItem value="experimente">Expérimenté</SelectItem>
                        <SelectItem value="professionnel">Professionnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

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
                  disabled={!selectedService}
                >
                  Envoyer la Commande via WhatsApp
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>+241 77 12 34 56</span>
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

interface ServiceCardProps {
  service: ServiceTarif;
  isSelected: boolean;
  onSelect: () => void;
}

const ServiceCard = ({ service, isSelected, onSelect }: ServiceCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'ring-2 ring-model-gold bg-model-gold/5' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{service.name}</CardTitle>
          {service.recommended && (
            <Badge className="bg-model-gold text-model-black">
              <Star className="w-3 h-3 mr-1" />
              Recommandé
            </Badge>
          )}
        </div>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-model-gold">{service.basePrice}€</span>
          <span className="text-sm text-gray-500">{service.duration}</span>
        </div>
        <div className="space-y-1">
          {service.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Check className="w-3 h-3 text-green-500" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MannequinOrder;
