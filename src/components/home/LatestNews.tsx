import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LatestNews = () => {
  const news = [
    {
      id: 1,
      title: "Double succès aux Awards de la mode Gabonaise 2022-2024",
      date: "15 Mai 2024",
      image: "https://i.ibb.co/s9RB3KL7/476860403-1135943161655103-823567436486785042-n.jpg",
      image: "https://i.ibb.co/Txv7x23g/485119951-1165969115319174-7070669252660737028-n.jpg",
      description: "Les Mannequins Kendra Mebiame et Ruth Jussy remportent l'une apres l'autre le trophé de meilleure mannequin espoir du gabon."
    },
    {
      id: 2,
      title: "Ouverture des Inscriptions",
      date: "Mai 2025", // Ajout de la virgule ici
      image: "https://i.ibb.co/LDzx7JgX/470506390-575121368705542-822202287511994230-n.jpg",
      description: "Les inscriptions pour la nouvelle saison de formation sont maintenant ouvertes."
    },
    {
      id: 3,
      title: "Collaboration Internationale",
      date: "14 Mai 2024",
      image: "https://scontent.flbv4-1.fna.fbcdn.net/v/t39.30808-6/448406365_449418894385926_3540828592057987599_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGjZJCfEh6lSGo7dwMT94iaqbFQnVq-z86psVCdWr7PzuiXCAJT_Jmegfr6y5vr8sXwPgZNhVRLYLAz1As8SJGI&_nc_ohc=5QIH03xRRVIQ7kNvwGXF0_d&_nc_oc=Adl_CJRdMDMwQX2YVnboGLJZNmK58s6eOUqOJetQamvNJs_n6Yn4Pu8_gebdbJiwOUA&_nc_zt=23&_nc_ht=scontent.flbv4-1.fna&_nc_gid=Q4AlFujuaIrb_uZ0xV0D_Q&oh=00_AfFMKys9YW8DwImkXRgZGgd_iKAb97jGTcDaFVLUZl0r5w&oe=680F1C52",
      description: "La Nuit du Textile Africain a Bamako."
    }
  ];

  return (
    <section className="py-20 bg-model-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl mb-4">Actualités</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {news.map((item) => (
            <div key={item.id} className="group">
              <div className="relative overflow-hidden mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-model-gold px-3 py-1 text-model-black text-sm">
                  {item.date}
                </div>
              </div>
              <h3 className="text-xl font-playfair mb-2">{item.title}</h3>
              <p className="text-gray-600 mb-4">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestNews;
