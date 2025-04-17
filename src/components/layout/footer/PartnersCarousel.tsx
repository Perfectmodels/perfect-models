
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const PartnersCarousel = () => {
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
  
  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        dragFree: true,
      }}
      className="w-full"
    >
      <div className="flex items-center justify-between mb-4">
        {/* Navigation buttons will be rendered by CarouselPrevious and CarouselNext */}
      </div>
      
      <CarouselContent className="-ml-2 md:-ml-4">
        {partners.map((partner, index) => (
          <CarouselItem key={index} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/5">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-md p-2 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-300/30 flex items-center justify-center rounded-full">
                  <span className="text-xs md:text-sm text-gray-400">{partner.name.substring(0, 2)}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-center text-light-gray">{partner.name}</p>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
      <div className="flex items-center justify-center mt-4 gap-4">
        <CarouselPrevious 
          variant="outline" 
          className="bg-dark-gray/80 border-dark-gray text-model-white hover:bg-model-gold hover:text-model-black relative left-0 translate-y-0 rounded-full"
        />
        <CarouselNext 
          variant="outline"
          className="bg-dark-gray/80 border-dark-gray text-model-white hover:bg-model-gold hover:text-model-black relative right-0 translate-y-0 rounded-full"
        />
      </div>
    </Carousel>
  );
};

export default PartnersCarousel;
