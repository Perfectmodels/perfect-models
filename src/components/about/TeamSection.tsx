import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const TeamSection = () => {
  const teamMembers = [
    {
      name: "Parfait Asseko",
      role: "Fondateur & Directeur",
      image: "https://scontent.flbv4-1.fna.fbcdn.net/v/t39.30808-6/486544561_9573230226125952_3761372655484517182_n.jpg",
      instagram: "#",
      linkedin: "#",
      email: "Asseko19@gmail.com",
      bio: "Fondateur passionné, Parfait dirige l'agence avec vision et détermination."
    },
    {
      name: "Gabrielle Ayatebe",
      role: "Directrice du Développement",
      image: "https://scontent.flbv4-1.fna.fbcdn.net/v/t1.6435-9/119631826_114872113690501_3218468596502015912_n.jpg",
      instagram: "#",
      linkedin: "#",
      email: "Gabrielle@perfectmodels.fr",
      bio: "Gabrielle excelle dans le développement de l'agence, favorisant la croissance et l'innovation."
    },
    {
      name: "Aimée Pambou",
      role: "Directrice du Casting",
      image: "https://i.ibb.co/ksmky1Sn/DSC01388-Modifier.jpg",
      instagram: "#",
      linkedin: "#",
      email: "aimee@perfectmodels.fr",
      bio: "Aimée sélectionne les meilleurs talents avec un œil expert et une grande passion."
    },
    {
      name: "Donatien Anani",
      role: "Responsable Relations Publiques",
      image: "https://i.ibb.co/KphCBxM6/DSC-0016-Modifier.jpg",
      instagram: "#",
      linkedin: "#",
      email: "donatien@perfectmodels.fr",
      bio: "Donatien construit des ponts entre l'agence et ses partenaires avec énergie et professionnalisme."
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
            <p className="text-slate-600 text-sm mt-2">{member.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TeamSection;
