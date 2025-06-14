
import { Users, Award, Calendar, Globe } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      number: "100+",
      label: "Mannequins",
      description: "Talents représentés"
    },
    {
      icon: <Award className="w-8 h-8" />,
      number: "50+",
      label: "Événements",
      description: "Défilés organisés"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      number: "3+",
      label: "Années",
      description: "D'expérience"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      number: "10+",
      label: "Partenaires",
      description: "Internationaux"
    }
  ];

  return (
    <section className="py-20 bg-model-black text-model-white relative">
      <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg')] bg-cover bg-center opacity-10 bg-fixed"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl mb-4">Perfect Models en Chiffres</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-model-gold/10 text-model-gold mb-4">
                {stat.icon}
              </div>
              <div className="text-4xl font-playfair text-model-gold mb-2">{stat.number}</div>
              <div className="text-xl mb-1">{stat.label}</div>
              <p className="text-gray-400">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
