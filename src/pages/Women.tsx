
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsList from '../components/models/ModelsList';

const femaleModels = [
  { id: '1', name: "Annie Flora", image: "https://i.ibb.co/ShShsp0/DSC-0369.jpg" },
  { id: '2', name: "Diane Vanessa", image: "https://i.ibb.co/yc1fYcqB/DSC-0261.jpg" },
  { id: '3', name: "Noémi Kim", image: "https://i.ibb.co/QFMs75yF/480772387-617829161101429-7604127548633621221-n.jpg" },
  { id: '4', name: "Duchesse", image: "https://i.ibb.co/gMYnh7Mz/AJC-1549.jpg" },
  { id: '5', name: "Aimée Mawili", image: "https://i.ibb.co/CpmMPQ8b/476223692-604882878920159-1798037705929760559-n.jpg" },
  { id: '6', name: "Cegolaine Biye", image: "https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg" },
  { id: '7', name: "Barbie Black", image: "https://i.ibb.co/78q5My4/PMM0161.jpg" },
  { id: '8', name: "Sephora Nawelle", image: "https://i.ibb.co/kgdjvvN9/DSC01394-Modifier.jpg" },
  { id: '9', name: "AJ Caramela", image: "https://i.ibb.co/Kcq2dMW7/DSC01379-Modifier.jpg" },
  { id: '10', name: "Nynelle Mbazogho", image: "https://i.ibb.co/j95xqjHT/DSC-0053.jpg" },
  { id: '11', name: "Khellany Allogho", image: "https://i.ibb.co/jPtxQN0F/DSC-0457.jpg" },
  { id: '12', name: "Mebiame Ayito Kendra", image: "https://i.ibb.co/ksdXSfpY/474134983-590912627126416-4665446951991920838-n.jpg" },
];

const Women = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-24">
      <div className="container mx-auto px-6">
        <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Nos Modèles Femmes</h1>
        <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>
        <ModelsList models={femaleModels} />
      </div>
    </main>
    <Footer />
  </div>
);

export default Women;
