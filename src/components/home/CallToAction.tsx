
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-20 bg-model-black text-model-white relative">
      {/* Background overlay to improve contrast with video */}
      <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
      
      {/* Vidéo intégrée with proper parameters */}
      <div className="absolute inset-0">
        <iframe
          width="100%"
          height="100%"
          src="https://www.youtube.com/embed/KlzhJYhw_I0?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=KlzhJYhw_I0"
          title="Extrait des Passages de nos mannequins au Gala de Charité"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          loading="lazy"
          className="w-full h-full object-cover"
        ></iframe>
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
