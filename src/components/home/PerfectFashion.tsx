
import { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const fashionImages = [
  "https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg",
  "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg",
  "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg",
  "https://images.pexels.com/photos/1372134/pexels-photo-1372134.jpeg",
  // Ajoutez ici les autres images du carrousel
];

const PerfectFashion = () => {
  return (
    <section className="py-20 bg-model-white">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl mb-4">Perfect Fashion</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
        </div>

        <Carousel className="w-full max-w-5xl mx-auto">
          <CarouselContent>
            {fashionImages.map((image, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <AspectRatio ratio={16/9}>
                    <img
                      src={image}
                      alt={`Fashion image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </AspectRatio>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};

export default PerfectFashion;
