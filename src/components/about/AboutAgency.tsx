import React from 'react';
// Tu peux ajouter ici des imports d’icônes personnalisées si tu le souhaites

const AboutAgency = () => {
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-12">
        <article className="bg-slate-50 p-8 rounded-lg shadow">
          <h2 className="font-playfair text-3xl mb-6 text-model-gold">Notre Histoire</h2>
          <p className="text-slate-700 mb-6 leading-relaxed">
            Fondée en 2021, Perfect Models Management est née d’une passion profonde pour la mode et l’envie de bousculer les codes du secteur. Notre fondateur, sans expérience préalable, a su transformer une vision ambitieuse en un projet concret et inspirant.
          </p>
          <p className="text-slate-700 mb-6 leading-relaxed">
            Depuis nos débuts, nous avons collaboré avec les plus grandes marques nationales, participant à des événements prestigieux au Gabon et à la Nuit du Textile Africain à Bamako.
          </p>
          <p className="text-slate-900 leading-relaxed">
            Aujourd’hui, Perfect Models Management représente plus de 100 mannequins, débutants ou professionnels, issus de différentes nationalités, et poursuit son expansion à l’échelle internationale.
          </p>
        </article>
      </div>

      <div className="mt-16">
        <h2 className="font-playfair text-3xl mb-8 text-center text-model-gold">Notre Mission</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            {/* <YourDiscoveryIcon className="mx-auto mb-2 text-model-gold" /> */}
            <h3 className="text-xl font-semibold mb-2 text-model-gold">Découverte de Talents</h3>
            <p className="text-slate-700">
              Nous dénichons et accompagnons les talents les plus prometteurs du monde entier, en valorisant la diversité et l’unicité de chacun.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            {/* <YourCareerIcon className="mx-auto mb-2 text-model-gold" /> */}
            <h3 className="text-xl font-semibold mb-2 text-model-gold">Développement de Carrière</h3>
            <p className="text-slate-700">
              Nos mannequins sont guidés à chaque étape de leur parcours grâce à des conseils experts et un accompagnement personnalisé.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center">
            {/* <YourExcellenceIcon className="mx-auto mb-2 text-model-gold" /> */}
            <h3 className="text-xl font-semibold mb-2 text-model-gold">Excellence Créative</h3>
            <p className="text-slate-700">
              Nous visons l’excellence et l’innovation à travers chacun de nos projets et collaborations.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutAgency;
