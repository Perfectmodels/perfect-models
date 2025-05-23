
import React from 'react';
import { Instagram, Linkedin, Mail } from 'lucide-react';

const TeamSection = () => {
  const teamMembers = [
    {
      name: "Parfait Asseko",
      role: "Fondateur & Directeur",
      image: "https://scontent.flbv4-1.fna.fbcdn.net/v/t39.30808-6/486544561_9573230226125952_3761372655484517182_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeGtsSsxPZ3ss0bQZI_DNK-_toy3gKm0jzm2jLeAqbSPOZWwx_XnYKSjTTOWEf6-wCECTlVsRNJjFenBETosehBS&_nc_ohc=2_3-zz0Hw08Q7kNvwHkF78t&_nc_oc=AdlQdRw_yyuD_dJDFxo2WWe-fEk0DB1mAtPySBjdk_RbMsDl5yYpFk0kQBw-3SMpZpM&_nc_zt=23&_nc_ht=scontent.flbv4-1.fna&_nc_gid=MFhlyrmLIYexYuInft5VKg&oh=00_AfEFIq3M8EA1r3U3HJaKrpgH67dcu3j3Hp0mSeuHWJVn4g&oe=6806475A",
      instagram: "#",
      linkedin: "#",
      email: "Asseko19@gmail.com"
    },
    {
      name: "Gabrielle Ayatebe",
      role: "Directrice du Développement",
      image: "https://scontent.flbv4-1.fna.fbcdn.net/v/t1.6435-9/119631826_114872113690501_3218468596502015912_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeFgLGPwKrjvyt_pDU7HD_CYBuZPYhLcEBkG5k9iEtwQGVxJr5xcx0CYJ5A_P7xxYSpYgjjIx0oUqVsfaggTJzO5&_nc_ohc=ZJG5UzFNhEoQ7kNvwH3NeOG&_nc_oc=AdlhQFQoucz2JYPI7Acc_fSE6UUAxkdtZa_kx2TMCkj8J-qADSd8LR05D3Gzndu1y4Q&_nc_zt=23&_nc_ht=scontent.flbv4-1.fna&_nc_gid=f-6lNl0MQ5LEUa1XtNQ5Mw&oh=00_AfHPDp17aCNUr724gaz1VIVKXQ_45cIJxYWUbXnH1C9teg&oe=6827F176",
      instagram: "#",
      linkedin: "#",
      email: "Gabrielleayatebe@gmail.com"
    },
    {
      name: "Aimée Pambou",
      role: "Directrice du Casting",
      image: "https://i.ibb.co/ksmky1Sn/DSC01388-Modifier.jpg",
      instagram: "#",
      linkedin: "#",
      email: "jeanliciadihiba@gmail.com"
    },
    {
      name: "Donatien Anani",
      role: "Responsable Relations Publiques",
      image: "https://i.ibb.co/KphCBxM6/DSC-0016-Modifier.jpg",
      instagram: "#",
      linkedin: "#",
      email: "donatienanani@gmail.com"
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
