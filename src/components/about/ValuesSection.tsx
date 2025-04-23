import React from 'react';
import { CheckCircle2, Heart, Globe, Shield, Sparkles, Users } from 'lucide-react';
const ValuesSection = () => {
  const values = [{
    icon: <Heart className="text-model-gold" />,
    title: "Passion",
    description: "La passion pour la mode et le talent guide chacune de nos décisions et actions."
  }, {
    icon: <CheckCircle2 className="text-model-gold" />,
    title: "Intégrité",
    description: "Nous agissons avec honnêteté et transparence dans toutes nos relations professionnelles."
  }, {
    icon: <Users className="text-model-gold" />,
    title: "Diversité",
    description: "Nous célébrons la diversité sous toutes ses formes et promouvons l'inclusion dans l'industrie."
  }, {
    icon: <Shield className="text-model-gold" />,
    title: "Protection",
    description: "La santé et le bien-être de nos mannequins sont notre priorité absolue."
  }, {
    icon: <Sparkles className="text-model-gold" />,
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque projet et ne nous contentons pas de la médiocrité."
  }, {
    icon: <Globe className="text-model-gold" />,
    title: "Durabilité",
    description: "Nous nous engageons pour une mode plus responsable et respectueuse de l'environnement."
  }];
  return <section className="py-8">
      <h2 className="font-playfair text-3xl mb-10 text-center">Nos Valeurs</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {values.map((value, index) => <div key={index} className="flex gap-4 items-start">
            <div className="p-2">
              {value.icon}
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2">{value.title}</h3>
              <p className="text-light-gray text-slate-900">{value.description}</p>
            </div>
          </div>)}
      </div>
    </section>;
};
export default ValuesSection;