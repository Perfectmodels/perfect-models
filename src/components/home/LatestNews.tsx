
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const LatestNews = () => {
  const news = [
    {
      id: 1,
      title: "Double succès aux Awards de la mode Gabonaise 2022-2024",
      date: "15 Mai 2024",
      image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg",
      description: "Les Mannequins Kendra Mebiame et Ruth Jussy remportent l'une apres l'autre le trophé de meilleure mannequin espoir du gabon."
    },
    {
      id: 2,
      title: "Ouverture des Inscriptions",
      date: "Mai 2025"
      image: "https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg",
      description: "Les inscriptions pour la nouvelle saison de formation sont maintenant ouvertes."
    },
    {
      id: 3,
      title: "Collaboration Internationale",
      date: "14 Mai 2024",
      image: "https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg",
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
