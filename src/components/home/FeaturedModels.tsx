
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Model {
  id: number;
  name: string;
  image: string;
  category: string;
  link: string;
}

const femaleModels: Model[] = [
  {
    id: 1,
    name: "Clara Martin",
    image: "https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg",
    category: "Haute Couture",
    link: "/models/clara-martin"
  },
  {
    id: 2,
    name: "Lily Dubois",
    image: "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg",
    category: "Commercial",
    link: "/models/lily-dubois"
  },
  {
    id: 3,
    name: "Sophie Bernard",
    image: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg",
    category: "Éditorial",
    link: "/models/sophie-bernard"
  },
  {
    id: 4,
    name: "Emma Rousseau",
    image: "https://images.pexels.com/photos/1372134/pexels-photo-1372134.jpeg",
    category: "Runway",
    link: "/models/emma-rousseau"
  }
];

const maleModels: Model[] = [
  {
    id: 5,
    name: "Louis Girard",
    image: "https://images.pexels.com/photos/2887718/pexels-photo-2887718.jpeg",
    category: "Commercial",
    link: "/models/louis-girard"
  },
  {
    id: 6,
    name: "Thomas Leroy",
    image: "https://images.pexels.com/photos/1860367/pexels-photo-1860367.jpeg",
    category: "Éditorial",
    link: "/models/thomas-leroy"
  },
  {
    id: 7,
    name: "Antoine Mercier",
    image: "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg",
    category: "Haute Couture",
    link: "/models/antoine-mercier"
  },
  {
    id: 8,
    name: "Nicolas Petit",
    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
    category: "Runway",
    link: "/models/nicolas-petit"
  }
];

type ModelCategory = "women" | "men";

const FeaturedModels = () => {
  const [activeCategory, setActiveCategory] = useState<ModelCategory>("women");
  const models = activeCategory === "women" ? femaleModels : maleModels;

  return (
    <section className="py-20 bg-model-white">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="font-playfair text-4xl md:text-5xl mb-4">Nos Modèles</h2>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-8"></div>
        </div>

        {/* Category tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex border-b border-model-black">
            <button
              onClick={() => setActiveCategory("women")}
              className={`px-6 py-2 text-sm tracking-wider ${
                activeCategory === "women"
                  ? "text-model-gold border-b-2 border-model-gold -mb-px"
                  : "text-model-black hover:text-model-gold"
              }`}
            >
              FEMMES
            </button>
            <button
              onClick={() => setActiveCategory("men")}
              className={`px-6 py-2 text-sm tracking-wider ${
                activeCategory === "men"
                  ? "text-model-gold border-b-2 border-model-gold -mb-px"
                  : "text-model-black hover:text-model-gold"
              }`}
            >
              HOMMES
            </button>
          </div>
        </div>

        {/* Model grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {models.map((model) => (
            <Link to={model.link} key={model.id} className="group">
              <div className="overflow-hidden">
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-[400px] object-cover object-center transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-playfair text-xl group-hover:text-model-gold transition-colors duration-300">
                  {model.name}
                </h3>
                <p className="text-medium-gray text-sm mt-1">{model.category}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* View all link */}
        <div className="text-center mt-12">
          <Link
            to={`/${activeCategory}`}
            className="inline-block px-8 py-3 border border-model-black text-model-black hover:bg-model-black hover:text-model-white transition-colors duration-300"
          >
            VOIR TOUS NOS MODÈLES
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedModels;
