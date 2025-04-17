
import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const TeamSection = () => {
  const teamMembers = [
    {
      name: "Sophie Laurent",
      role: "Fondatrice & Directrice",
      image: "https://i.ibb.co/RQpwCsc/team-1.jpg",
      instagram: "#",
      linkedin: "#",
      email: "sophie@perfectmodels.fr"
    },
    {
      name: "Marc Dubois",
      role: "Directeur du Développement",
      image: "https://i.ibb.co/L871CPH/team-2.jpg",
      instagram: "#",
      linkedin: "#",
      email: "marc@perfectmodels.fr"
    },
    {
      name: "Camille Moreau",
      role: "Directrice du Casting",
      image: "https://i.ibb.co/59c0T9j/team-3.jpg",
      instagram: "#",
      linkedin: "#",
      email: "camille@perfectmodels.fr"
    },
    {
      name: "Thomas Leroy",
      role: "Responsable Relations Publiques",
      image: "https://i.ibb.co/nPrJWpk/team-4.jpg",
      instagram: "#",
      linkedin: "#",
      email: "thomas@perfectmodels.fr"
    }
  ];

  return (
    <section className="py-8 mb-12">
      <h2 className="font-playfair text-3xl mb-10 text-center">Notre Équipe</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, index) => (
          <div key={index} className="group">
            <div className="relative overflow-hidden mb-4">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-auto aspect-[3/4] object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                <div className="flex gap-4">
                  <a href={member.instagram} className="text-white hover:text-model-gold">
                    <Instagram size={20} />
                  </a>
                  <a href={member.linkedin} className="text-white hover:text-model-gold">
                    <Linkedin size={20} />
                  </a>
                  <a href={`mailto:${member.email}`} className="text-white hover:text-model-gold">
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-medium mb-1">{member.name}</h3>
            <p className="text-model-gold text-sm">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
