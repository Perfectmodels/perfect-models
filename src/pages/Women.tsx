import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsList from '../components/models/ModelsList';

const Women = () => {
  // Données des mannequins féminins
  const femaleModels = [
    { id: 1, name: "Annie Flora", image: "https://i.ibb.co/ShShsp0/DSC-0369.jpg" },
    { id: 2, name: "Diane Vanessa", image: "https://i.ibb.co/yc1fYcqB/DSC-0261.jpg" },
    { id: 3, name: "Noémi Kim", image: "https://i.ibb.co/QFMs75yF/480772387-617829161101429-7604127548633621221-n.jpg" },
    { id: 4, name: "Duchesse", image: "https://i.ibb.co/gMYnh7Mz/AJC-1549.jpg" },
    { id: 5, name: "Aimée Mawili", image: "https://i.ibb.co/CpmMPQ8b/476223692-604882878920159-1798037705929760559-n.jpg" },
    { id: 6, name: "Cegolaine Biye", image: "https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg" },
    { id: 7, name: "Barbie Black", image: "https://i.ibb.co/78q5My4/PMM0161.jpg" },
    { id: 8, name: "Sephora Nawelle", image: "https://i.ibb.co/kgdjvvN9/DSC01394-Modifier.jpg" },
    { id: 9, name: "AJ Caramela", image: "https://i.ibb.co/Kcq2dMW7/DSC01379-Modifier.jpg" },
    { id: 10, name: "Nynelle Mbazogho", image: "https://i.ibb.co/j95xqjHT/DSC-0053.jpg" },
    { id: 11, name: "Khellany Allogho", image: "https://i.ibb.co/jPtxQN0F/DSC-0457.jpg" },
    { id: 12, name: "Mebiame Ayito Kendra", image: "https://i.ibb.co/ksdXSfpY/474134983-590912627126416-4665446951991920838-n.jpg" },
    { id: 13, name: "Lesly Zomo", image: "https://i.ibb.co/3QGcXdb/DSC-0124.jpg" },
    { id: 14, name: "Stecy Glappier", image: "https://i.ibb.co/fdKk7PQL/PMM0249.jpg" },
    { id: 15, name: "Mirabelle Medza", image: "https://i.ibb.co/RpkcngtM/484178713-631586356392376-6790495192437511142-n.jpg", category: "Miss Tourisme Gabon" },
    { id: 16, name: "Ruth Jussy", image: "https://i.ibb.co/jZMn9H0d/482961374-623650043916904-6278220035000086504-n.jpg" },
    { id: 17, name: "Jodelle Juliana", image: "https://i.ibb.co/HT252kvW/MG-9959.jpg" },
    { id: 18, name: "Venusia Olery", image: "https://i.ibb.co/BV1HFbft/MG-0695.jpg" },
    { id: 19, name: "Nice Ska", image: "https://i.ibb.co/W4zHs7sf/486183952-640518082030640-7522139050699292417-n.jpg" },
    { id: 20, name: "Lyne Moussavou", image: "https://i.ibb.co/7thKmdTt/DSC-0445.jpg" },
    { id: 21, name: "Merveille Aworet", image: "https://i.ibb.co/fYNh5b7v/485747370-636810719203273-4287383373947579383-n.jpg" },
    { id: 22, name: "Danara Prefna", image: "https://i.ibb.co/mCwz8JYy/483828066-629699233247755-7611737956009481678-n.jpg" },
    { id: 23, name: "Indiana Delice", image: "https://i.ibb.co/xSYQStFP/474075436-590917630459249-8713999334098259478-n.jpg" },
    { id: 24, name: "Léa Danielle", image: "https://i.ibb.co/1GgZSPcG/MG-9621-2.jpg" },
    { id: 25, name: "Sadia", image: "https://i.ibb.co/1t6zbJm3/484135904-630949926456019-7069478021622378576-n.jpg" },
    { id: 26, name: "Maurille Mikamona", image: "https://i.ibb.co/7ddhchhx/477796995-609018678649144-702919669220791660-n.jpg" },
    { id: 27, name: "Noé Mak's", image: "https://i.ibb.co/4ncX4Brk/481054309-617829164434762-185712014482056867-n.jpg" },
    { id: 28, name: "Val De Mays", image: "https://i.ibb.co/1G0FZkkG/480261062-612919161592429-831797797968609645-n.jpg" }
  ];

  // Tabs configuration
  const tabs = [
    {
      value: "models",
      label: "NOS MODÈLES",
      content: <ModelsList models={femaleModels} />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-6">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Nos Modèles Femmes</h1>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>
          
          <TabContent tabs={tabs} defaultValue="models" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Women;
