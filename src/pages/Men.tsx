import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsList from '../components/models/ModelsList';

const Men = () => {
  // Données des mannequins masculins
  const maleModels = [
    { id: 1, name: "Donatien Anani", image: "https://i.ibb.co/q3wBhxpS/MG-0651.jpg", gender: 'men' },
    { id: 2, name: "Davy", image: "https://i.ibb.co/KcWyzrx/DSC-0163.jpg", gender: 'men' },
    { id: 3, name: "Osée JN", image: "https://i.ibb.co/7tk4pKvr/474620403-594457843438561-7313394165363117491-n.jpg", gender: 'men' },
    { id: 4, name: "Moustapha Nziengui", image: "https://i.ibb.co/C5Z1N6Zp/481335188-618392171045128-1143329793191383014-n.jpg", gender: 'men' },
    { id: 5, name: "Pablo Zapatero", image: "https://i.ibb.co/9HtWHDDZ/DSC-0350.jpg", gender: 'men' },
    { id: 6, name: "Rosly Biyoghe", image: "https://i.ibb.co/5hNTMd2H/476836105-4020224331539840-2275745508852289673-n.jpg", gender: 'men' },
    { id: 7, name: "Rosnel Ayo", image: "https://i.ibb.co/gbb1sBsX/481850366-17957549744909537-119699887645910338-n.jpg", gender: 'men' }
  ];

  // Tabs configuration
  const tabs = [
    {
      value: "models",
      label: "NOS MODÈLES",
      content: <ModelsList models={maleModels} />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-6">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Nos Modèles Hommes</h1>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>
          
          <TabContent tabs={tabs} defaultValue="models" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Men;
