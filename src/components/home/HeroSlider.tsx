
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SliderImage {
  id: number;
  url: string;
  alt: string;
  modelName: string;
  category: string;
  link: string;
}

const sliderImages: SliderImage[] = [
  {
    id: 1,
    url: "https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg",
    alt: "Model in fashion pose",
    modelName: "Sophia Laurent",
    category: "Haute Couture",
    link: "/models/sophia-laurent"
  },
  {
    id: 2,
    url: "https://images.pexels.com/photos/1485781/pexels-photo-1485781.jpeg",
    alt: "Male model in business attire",
    modelName: "Alexandre Dubois",
    category: "Commercial",
    link: "/models/alexandre-dubois"
  },
  {
    id: 3,
    url: "https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg",
    alt: "Fashion model in editorial shot",
    modelName: "Emma Moreau",
    category: "Éditorial",
    link: "/models/emma-moreau"
  }
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === sliderImages.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentSlide((prev) => (prev === 0 ? sliderImages.length - 1 : prev - 1));
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {sliderImages.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === index ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${image.url})` }}
          ></div>
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16">
            <div className="container mx-auto">
              <div className="max-w-xl animate-slide-up">
                <h2 className="font-playfair text-model-white text-4xl md:text-6xl mb-2">{image.modelName}</h2>
                <div className="w-20 h-0.5 bg-model-gold mb-6"></div>
                <p className="text-model-white text-lg mb-8">{image.category}</p>
                <Link 
                  to={image.link}
                  className="inline-block px-8 py-3 border border-model-gold text-model-white hover:bg-model-gold transition-colors duration-300"
                >
                  DÉCOUVRIR
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center text-model-white hover:text-model-gold z-10"
      >
        <ChevronLeft size={32} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center text-model-white hover:text-model-gold z-10"
      >
        <ChevronRight size={32} />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              currentSlide === index ? 'bg-model-gold w-8' : 'bg-model-white'
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
