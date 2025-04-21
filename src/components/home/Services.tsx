
import { Star, Camera, Users, Award } from 'lucide-react';

const Services = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl mb-4">Nos Services</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceCard 
            icon={<Star className="w-8 h-8" />}
            title="Développement de Talents"
            description="Formation professionnelle et accompagnement personnalisé pour nos mannequins"
          />
          <ServiceCard 
            icon={<Camera className="w-8 h-8" />}
            title="Shooting Photos"
            description="Services photo professionnels et création de books"
          />
          <ServiceCard 
            icon={<Users className="w-8 h-8" />}
            title="Casting & Events"
            description="Organisation de castings et placement pour événements"
          />
          <ServiceCard 
            icon={<Award className="w-8 h-8" />}
            title="Management de Carrière"
            description="Gestion complète de la carrière de nos mannequins"
          />
        </div>
      </div>
    </section>
  );
};

const ServiceCard = ({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="text-center p-6 transition-transform duration-300 hover:transform hover:-translate-y-2">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-model-gold/10 text-model-gold mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-playfair mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Services;
