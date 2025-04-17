
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const PartnersCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Partner list with names and placeholder logos
  const partners = [
    { name: 'Darain Visual', logo: '/placeholder.svg' },
    { name: 'Legrand Product\'s', logo: '/placeholder.svg' },
    { name: 'Amplitude Libreville', logo: '/placeholder.svg' },
    { name: 'Symbiose Concept Store', logo: '/placeholder.svg' },
    { name: 'Edele A', logo: '/placeholder.svg' },
    { name: 'NR Pictures', logo: '/placeholder.svg' },
    { name: 'Indi Hair', logo: '/placeholder.svg' },
    { name: 'Le Wap - Restaurant Bar Lounge', logo: '/placeholder.svg' },
    { name: 'Yarden Hotel Appart', logo: '/placeholder.svg' },
    { name: 'Graphik Studio', logo: '/placeholder.svg' },
    { name: 'Lady Riaba', logo: '/placeholder.svg' },
    { name: 'Madam Luc', logo: '/placeholder.svg' },
    { name: 'Sabo Fashion', logo: '/placeholder.svg' },
    { name: 'Ecole de Mode de Nzeng Ayong', logo: '/placeholder.svg' },
    { name: 'VitriClean', logo: '/placeholder.svg' },
    { name: 'Beitch Faro', logo: '/placeholder.svg' },
  ];
  
  const itemsPerSlide = 5;
  const totalSlides = Math.ceil(partners.length / itemsPerSlide);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [currentSlide, totalSlides]);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className="relative px-10">
      {/* Navigation buttons */}
      <button 
        onClick={prevSlide}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-model-black/80 p-1 rounded-full hover:bg-model-gold transition-colors duration-300"
        aria-label="Précédent"
      >
        <ChevronLeft size={24} />
      </button>
      
      {/* Simplified Carousel */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div key={slideIndex} className="min-w-full flex justify-center items-center gap-4">
              {partners
                .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                .map((partner, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col items-center"
                  >
                    <div className="bg-white/10 rounded-md p-2 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
                      <img 
                        src={partner.logo} 
                        alt={`${partner.name} logo`} 
                        className="max-w-full max-h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <p className="mt-2 text-xs text-center text-light-gray">{partner.name}</p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={nextSlide}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-model-black/80 p-1 rounded-full hover:bg-model-gold transition-colors duration-300"
        aria-label="Suivant"
      >
        <ChevronRight size={24} />
      </button>
      
      {/* Slide indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              currentSlide === index ? "bg-model-gold w-4" : "bg-gray-500"
            )}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PartnersCarousel;
