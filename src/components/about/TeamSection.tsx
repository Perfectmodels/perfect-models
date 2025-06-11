import React from 'react';

type TeamMember = {
  name: string;
  role: string;
  imageUrl: string; // Nouveau champ pour l'image
  bio?: string;
};

const teamMembers: TeamMember[] = [
  {
    name: "Parfait ",
    role: "Fondateur",
    imageUrl: "https://lien-de-ton-image.jpg",
    bio: "Quelques mots sur ce membre."
  },
  {
    name: "Nom Prénom 2",
    role: "Manager",
    imageUrl: "https://lien-image-2.jpg",
    bio: "Description du manager."
  },
  // Ajoute d'autres membres ici
];

const TeamSection = () => {
  return (
    <section className="py-12">
      <h2 className="text-3xl font-playfair text-center mb-10 text-model-gold">Notre Équipe</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow text-center">
            <img
              src={member.imageUrl}
              alt={member.name}
              className="w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-model-gold"
            />
            <h3 className="text-xl font-semibold text-model-gold mb-2">{member.name}</h3>
            <p className="text-slate-700 mb-2">{member.role}</p>
            {member.bio && <p className="text-slate-600 text-sm">{member.bio}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
