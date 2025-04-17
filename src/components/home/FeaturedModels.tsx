
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Model {
  id: number;
  name: string;
  image: string;
  category?: string;
  link: string;
}

// Données des mannequins féminins mis en avant
const femaleModels: Model[] = [
  {
    id: 1,
    name: "ANNIE FLORA",
    image: "https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg",
    category: "Haute Couture",
    link: "/women"
  },
  {
    id: 2,
    name: "Diane Vanessa",
    image: "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg",
    category: "Commercial",
    link: "/women"
  },
  {
    id: 3,
    name: "Mirabelle",
    image: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg",
    category: "Miss Tourisme Gabon",
    link: "/women"
  },
  {
    id: 4,
    name: "Sephora Nawele",
    image: "https://images.pexels.com/photos/1372134/pexels-photo-1372134.jpeg",
    category: "Éditorial",
    link: "/women"
  }
];

// Données des mannequins masculins mis en avant
const maleModels: Model[] = [
  {
    id: 5,
    name: "Donatien Anani",
    image: "https://images.pexels.com/photos/2887718/pexels-photo-2887718.jpeg",
    category: "Commercial",
    link: "/men"
  },
  {
    id: 6,
    name: "Moustapha",
    image: "https://images.pexels.com/photos/1860367/pexels-photo-1860367.jpeg",
    category: "Éditorial",
    link: "/men"
  },
  {
    id: 7,
    name: "Pablo Zapatero",
    image: "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg",
    category: "Haute Couture",
    link: "/men"
  },
  {
    id: 8,
    name: "Kevin",
    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
    category: "Commercial",
    link: "/men"
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
        <Tabs 
          defaultValue="women" 
          onValueChange={(value) => setActiveCategory(value as ModelCategory)}
          className="w-full"
        >
          <div className="flex justify-center mb-12">
            <TabsList className="inline-flex border-b border-model-black bg-transparent">
              <TabsTrigger 
                value="women"
                className="px-6 py-2 text-sm tracking-wider data-[state=active]:text-model-gold data-[state=active]:border-b-2 data-[state=active]:border-model-gold data-[state=active]:-mb-px data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
              >
                FEMMES
              </TabsTrigger>
              <TabsTrigger 
                value="men"
                className="px-6 py-2 text-sm tracking-wider data-[state=active]:text-model-gold data-[state=active]:border-b-2 data-[state=active]:border-model-gold data-[state=active]:-mb-px data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none"
              >
                HOMMES
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="women" className="mt-0">
            {/* Female models grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {femaleModels.map((model) => (
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
            <div className="text-center mt-12">
              <Link
                to="/women"
                className="inline-block px-8 py-3 border border-model-black text-model-black hover:bg-model-black hover:text-model-white transition-colors duration-300"
              >
                VOIR TOUS NOS MODÈLES FEMMES
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="men" className="mt-0">
            {/* Male models grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {maleModels.map((model) => (
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
            <div className="text-center mt-12">
              <Link
                to="/men"
                className="inline-block px-8 py-3 border border-model-black text-model-black hover:bg-model-black hover:text-model-white transition-colors duration-300"
              >
                VOIR TOUS NOS MODÈLES HOMMES
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default FeaturedModels;
