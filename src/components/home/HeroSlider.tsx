
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroSlider = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* YouTube video background */}
      <div className="absolute inset-0 w-full h-full">
        <div className={`absolute inset-0 bg-black ${isLoading ? 'opacity-100' : 'opacity-0'} transition-opacity duration-1000`}>
          {/* Loading placeholder */}
        </div>
        <div className={`absolute inset-0 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-1000`}>
          <iframe 
            src="https://www.youtube.com/embed/LaYmpru5zh4?autoplay=1&mute=1&loop=1&playlist=LaYmpru5zh4&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1" 
            title="Perfect Fashion Day"
            className="absolute w-[100%] h-[100%] top-0 left-0 object-cover"
            style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      
      {/* Overlay with gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center px-6 md:px-16">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto animate-slide-up">
            <h1 className="font-playfair text-model-white text-4xl md:text-6xl mb-4">Perfect Models Management</h1>
            <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
            <p className="text-model-white text-lg mb-10">Découvrez l'excellence dans le monde du mannequinat</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/casting"
                className="px-8 py-3 bg-model-gold text-black hover:bg-opacity-90 transition-colors duration-300"
              >
                POSTULER
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
