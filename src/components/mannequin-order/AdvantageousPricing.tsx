
import React from 'react';

const AdvantageousPricing = () => {
  return (
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
  );
};

export default AdvantageousPricing;
