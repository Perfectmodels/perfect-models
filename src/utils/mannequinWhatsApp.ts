
import { ServiceTarif, OrderFormData } from '@/types/mannequinOrder';
import { DetailedModel } from '@/types/modelTypes';

export const createMannequinWhatsAppMessage = (
  selectedService: ServiceTarif,
  selectedModels: string[],
  formData: OrderFormData,
  models: DetailedModel[],
  total: number
) => {
  const discount = (selectedService.basePrice * selectedModels.length) - total;
  const selectedModelsInfo = selectedModels.map(id => {
    const model = models.find(m => m.id === id);
    return model ? `${model.name} (${model.category} - ${model.experience || 'N/A'})` : '';
  }).filter(Boolean);
  
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

👥 MANNEQUINS SÉLECTIONNÉS (${selectedModels.length}):
${selectedModelsInfo.map(info => `• ${info}`).join('\n')}

📅 DÉTAILS ÉVÉNEMENT:
📆 Date: ${formData.eventDate}
📍 Lieu: ${formData.eventLocation}
👥 Préférence genre: ${formData.mannequinGender || 'Aucune'}

💰 TARIFICATION:
💵 Prix de base: ${selectedService.basePrice.toLocaleString('fr-FR')} FCFA
${selectedModels.length > 1 ? `👥 Mannequins supplémentaires (${selectedModels.length - 1}): ${((selectedModels.length - 1) * selectedService.basePrice * 0.5).toLocaleString('fr-FR')} FCFA` : ''}
${discount > 0 ? `🎉 Réduction: -${discount.toLocaleString('fr-FR')} FCFA` : ''}
💳 TOTAL: ${total.toLocaleString('fr-FR')} FCFA

📝 Demandes spéciales:
${formData.additionalRequests || 'Aucune'}

🎁 Avantages inclus:
${selectedService.features.map(feature => `✅ ${feature}`).join('\n')}`;

  return `https://wa.me/24107507950?text=${encodeURIComponent(message)}`;
};
