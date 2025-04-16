
import { Link } from 'react-router-dom';

const AboutSection = () => {
  return (
    <section className="py-20 bg-dark-gray text-model-white">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-playfair text-4xl md:text-5xl mb-6">Perfect Models Management</h2>
            <div className="w-24 h-0.5 bg-model-gold mb-8"></div>
            <p className="text-light-gray mb-6 leading-relaxed">
              Perfect Models Management est une agence de mannequins de premier plan spécialisée dans la découverte et la promotion des talents les plus prometteurs du monde entier.
            </p>
            <p className="text-light-gray mb-8 leading-relaxed">
              Notre vision est de représenter des mannequins qui définissent l'esthétique contemporaine tout en préservant l'élégance intemporelle qui caractérise les plus grandes maisons de couture.
            </p>
            <Link 
              to="/about"
              className="inline-block px-8 py-3 border border-model-gold text-model-gold hover:bg-model-gold hover:text-model-black transition-colors duration-300"
            >
              EN SAVOIR PLUS
            </Link>
          </div>
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg" 
              alt="Perfect Models Management team" 
              className="w-full h-auto"
            />
            <div className="absolute inset-0 border-2 border-model-gold transform translate-x-4 translate-y-4 -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
