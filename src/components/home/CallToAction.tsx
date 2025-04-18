
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-20 bg-model-black text-model-white relative">
      {/* Background overlay to improve text readability */}
      <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
      
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://i.ibb.co/jZMn9H0d/482961374-623650043916904-6278220035000086504-n.jpg"
          alt="Perfect Models Background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-playfair text-4xl md:text-5xl mb-6">Rejoignez Notre Agence</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
          <p className="text-light-gray mb-10 leading-relaxed text-lg">
            Vous avez ce qu'il faut pour devenir mannequin ? Perfect Models Management recherche constamment de nouveaux visages pour représenter les plus grandes marques mondiales.
          </p>
          <Link 
            to="/casting"
            className="inline-flex items-center px-8 py-3 bg-model-gold text-model-black hover:bg-model-white transition-colors duration-300"
          >
            POSTULEZ MAINTENANT
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
