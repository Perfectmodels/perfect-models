
import { Star, Camera, Award, Users, Heart, Globe } from 'lucide-react';

const Benefits = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl mb-4">Pourquoi Nous Choisir</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
          <p className="max-w-2xl mx-auto text-gray-600">
            Découvrez les avantages uniques de collaborer avec Perfect Models Management
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BenefitCard 
            icon={<Star className="w-8 h-8" />}
            title="Expertise Reconnue"
            description="Plus de 10 ans d'expérience dans l'industrie de la mode et du mannequinat"
          />
          <BenefitCard 
            icon={<Heart className="w-8 h-8" />}
            title="Accompagnement Personnalisé"
            description="Un suivi individuel pour développer le potentiel unique de chaque mannequin"
          />
          <BenefitCard 
            icon={<Camera className="w-8 h-8" />}
            title="Opportunités Exclusives"
            description="Accès privilégié aux castings et événements majeurs de l'industrie"
          />
          <BenefitCard 
            icon={<Award className="w-8 h-8" />}
            title="Formation Continue"
            description="Des workshops et formations régulières pour perfectionner vos compétences"
          />
          <BenefitCard 
            icon={<Globe className="w-8 h-8" />}
            title="Réseau International"
            description="Des partenariats avec les plus grandes agences et marques mondiales"
          />
          <BenefitCard 
            icon={<Users className="w-8 h-8" />}
            title="Communauté Soudée"
            description="Une famille de professionnels passionnés qui s'entraident et évoluent ensemble"
          />
        </div>
      </div>
    </section>
  );
};

const BenefitCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm transition-transform duration-300 hover:transform hover:-translate-y-2">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-model-gold/10 text-model-gold mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-playfair mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Benefits;
