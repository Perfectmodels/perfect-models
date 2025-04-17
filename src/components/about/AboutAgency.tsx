
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const AboutAgency = () => {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="font-playfair text-3xl mb-6">Notre Histoire</h2>
          <p className="text-light-gray mb-6 leading-relaxed">
            Fondée en 2021, Perfect Models Management est née de la passion pour la mode et de la volonté de créer une agence différente dans l'industrie. Notre fondateur, avec aucune d'expérience dans le secteur, a voulu créer un espace où les talents peuvent s'épanouir sans compromis.
          </p>
          <p className="text-light-gray mb-6 leading-relaxed">
            Depuis notre création, nous avons collaboré avec les plus grandes marques nationales et participé aux évenements les plus prestigieuses du Gabon et à la Nuit du Textile Africain a Bamako au Mali. Notre croissance rapide témoigne de notre engagement envers l'excellence et la qualité de notre travail.
          </p>
          <p className="text-light-gray leading-relaxed">
            Aujourd'hui, Perfect Models Management représente plus de 100 mannequins (debutants et professionnels) de différentes nationalités et continue d'étendre son influence dans le monde de la mode au Gabon.
          </p>
        </div>
        <div className="order-1 md:order-2 relative">
          <img 
            src="https://i.ibb.co/ksmky1S/DSC01388-Modifier.jpg" 
            alt="L'équipe Perfect Models" 
            className="w-full h-auto rounded-md"
          />
          <div className="absolute inset-0 border-2 border-model-gold transform translate-x-4 translate-y-4 -z-10 rounded-md"></div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-playfair text-3xl mb-8 text-center">Notre Mission</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-dark-gray border-model-gold/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-2 text-model-gold">Découverte de Talents</h3>
              <p className="text-light-gray">
                Nous recherchons et développons les talents les plus prometteurs du monde entier, en accordant une attention particulière à la diversité et à l'unicité.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-dark-gray border-model-gold/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-2 text-model-gold">Développement de Carrière</h3>
              <p className="text-light-gray">
                Nous accompagnons nos mannequins dans chaque étape de leur carrière, en leur fournissant des conseils professionnels et un soutien personnalisé.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-dark-gray border-model-gold/20">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-2 text-model-gold">Excellence Créative</h3>
              <p className="text-light-gray">
                Nous nous efforçons de maintenir les plus hauts standards de créativité et de professionnalisme dans tous nos projets et collaborations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutAgency;
