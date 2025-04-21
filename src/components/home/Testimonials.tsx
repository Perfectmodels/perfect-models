
import { useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "Edele A.",
    role: "Styliste Modeliste",
    image: "https://i.ibb.co/BV1HFbft/edele-a.jpg",
    quote: "Perfect Models Management offre un service de qualité exceptionnelle. Leur professionnalisme et leur attention aux détails sont incomparables."
  },
  {
    name: "NR Pictures",
    role: "Studio Photo",
    image: "https://i.ibb.co/yc1fYqB/NR.jpg",
    quote: "PMM offre une expérience photographique exceptionnelle. Leur créativité et leur professionnalisme capturent des moments inoubliables."
  },
  {
    name: "Djeffrey Ekogha",
    role: "Responsable Marketing, Yarden Hotel Appart",
    image: "https://i.ibb.co/fz5jtwG/djeff.jpg",
    quote: "Perfect Models Management a transformé notre événement en une expérience inoubliable. Leur professionnalisme est incomparable."
  }
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-model-black text-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl mb-4">Témoignages</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
          <p className="max-w-2xl mx-auto text-gray-400">
            Découvrez ce que nos clients et partenaires disent de nous
          </p>
        </div>

        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-6">
                  <div className="bg-white/5 p-8 rounded-lg backdrop-blur-sm border border-white/10">
                    <div className="flex items-center mb-6">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover mr-4"
                      />
                      <div>
                        <h4 className="text-lg font-medium text-model-gold">{testimonial.name}</h4>
                        <p className="text-sm text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                    <blockquote className="text-gray-300 italic">
                      "{testimonial.quote}"
                    </blockquote>
                  </div>
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

export default Testimonials;
