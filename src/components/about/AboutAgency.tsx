import React from 'react';

const AboutAgency = () => {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-12">
        <div>
          <h2 className="font-playfair text-3xl mb-6">Notre Histoire</h2>
          <p className="text-light-gray mb-6 leading-relaxed">
            Fondée en 2021, Perfect Models Management est née de la passion pour la mode et de la volonté de créer une agence différente dans l'industrie. Notre fondateur, avec aucune d'expérience préalable, a transformé une vision en réalité.
          </p>
          <p className="text-light-gray mb-6 leading-relaxed">
            Depuis notre création, nous avons collaboré avec les plus grandes marques nationales et participé aux événements les plus prestigieux du Gabon et à la Nuit du Textile Africain à Abidjan.
          </p>
          <p className="text-light-gray leading-relaxed">
            Aujourd'hui, Perfect Models Management représente plus de 100 mannequins (débutants et professionnels) de différentes nationalités et continue d'étendre son influence dans le monde.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-playfair text-3xl mb-8 text-center">Notre Mission</h2>
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h3 className="text-xl font-medium mb-2 text-model-gold">Découverte de Talents</h3>
            <p className="text-light-gray">
              Nous recherchons et développons les talents les plus prometteurs du monde entier, en accordant une attention particulière à la diversité et à l'unicité.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2 text-model-gold">Développement de Carrière</h3>
            <p className="text-light-gray">
              Nous accompagnons nos mannequins dans chaque étape de leur carrière, en leur fournissant des conseils professionnels et un soutien personnalisé.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-medium mb-2 text-model-gold">Excellence Créative</h3>
            <p className="text-light-gray">
              Nous nous efforçons de maintenir les plus hauts standards de créativité et de professionnalisme dans tous nos projets et collaborations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutAgency;
