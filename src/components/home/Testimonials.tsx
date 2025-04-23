
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
    image: "https://scontent.flbv4-1.fna.fbcdn.net/v/t39.30808-6/489946152_122223850502231407_7759825436890322704_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_eui2=AeEnQAu2_j7HbZjiNeC6pWiXjyZpFwoMlNKPJmkXCgyU0vNZvGfS2rq4ZBN1xiLBoaCf3pMhVuEU-rL73gd3t31E&_nc_ohc=WnFBuxr_89AQ7kNvwHwsEhQ&_nc_oc=AdlcdCb70GlLHy8UUQztuw8hS8pX8nRFfZkZNvU3SrZQ8vrVZCVRopCGglpFCdd2V7w&_nc_zt=23&_nc_ht=scontent.flbv4-1.fna&_nc_gid=JpPUSSMGd3RR6OXZAp9JCA&oh=00_AfFChscKP1JyX8y2HI2CKZ_c29Sip1-e0c9fqSAyO0zzPA&oe=680F26A4",
    quote: "Perfect Models Management offre un service de qualité exceptionnelle. Leur professionnalisme et leur attention aux détails sont incomparables."
  },
  {
    name: "NR Pictures",
    role: "Studio Photo",
    image: "https://scontent.flbv4-1.fna.fbcdn.net/v/t39.30808-6/348590633_273972625048821_6724562378134660531_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeEjyJh0UcVEpU3NjQ7od3Xl4bhATVQxVifhuEBNVDFWJ0CP5niCPiuC-yHB2jeBZmgSwTZrZbrn0NXEZRQDaia6&_nc_ohc=qZJOoT2UQLsQ7kNvwGSMyM6&_nc_oc=AdnvENrD_9fLI2WI8dg9tYNVkRbBKaJe_Jl_joUQp3alhKgWbgKQvb5uFGMYSdXCoDQ&_nc_zt=23&_nc_ht=scontent.flbv4-1.fna&_nc_gid=t0tIhXtyjp5s8NWwsRdV6Q&oh=00_AfE4JgIITO7750RZn0yC00DHUNCW_iU5YymsEzD3fY3BMQ&oe=680F1456",
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
