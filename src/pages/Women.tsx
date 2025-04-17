
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsList from '../components/models/ModelsList';
import TabContent from '../components/common/TabContent';
import EventsList from '../components/models/EventsList';
import ServicesList from '../components/models/ServicesList';
import { Event, Service } from '@/types/modelTypes';

const Women = () => {
  // Données des mannequins féminins
  const femaleModels = [
    { id: 1, name: "ANNIE FLORA", image: "https://images.pexels.com/photos/1321943/pexels-photo-1321943.jpeg" },
    { id: 2, name: "Diane Vanessa", image: "https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg" },
    { id: 3, name: "DICKAMBI NGOMA Horlane", image: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg" },
    { id: 4, name: "Duchesse", image: "https://images.pexels.com/photos/1372134/pexels-photo-1372134.jpeg" },
    { id: 5, name: "EYA BIYOGHE Rosly", image: "https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg" },
    { id: 6, name: "Flora", image: "https://images.pexels.com/photos/1382731/pexels-photo-1382731.jpeg" },
    { id: 7, name: "Jodelle Juliana", image: "https://images.pexels.com/photos/1848886/pexels-photo-1848886.jpeg" },
    { id: 8, name: "Lea Danielle", image: "https://images.pexels.com/photos/1898555/pexels-photo-1898555.jpeg" },
    { id: 9, name: "Leene", image: "https://images.pexels.com/photos/1394499/pexels-photo-1394499.jpeg" },
    { id: 10, name: "MAKOSSO ASSEKO Marie Noé", image: "https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg" },
    { id: 11, name: "MBADINGA Osée", image: "https://images.pexels.com/photos/1375849/pexels-photo-1375849.jpeg" },
    { id: 12, name: "MEBIAME AYITO Kendra", image: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg" },
    { id: 13, name: "Merveille", image: "https://images.pexels.com/photos/1308881/pexels-photo-1308881.jpeg" },
    { id: 14, name: "MIKAMONA Maurille", image: "https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg" },
    { id: 15, name: "Mirabelle", image: "https://images.pexels.com/photos/1702238/pexels-photo-1702238.jpeg", category: "Miss Tourisme Gabon" },
    { id: 16, name: "MOUKETOU Sandra", image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg" },
    { id: 17, name: "N'NOH Rebecca Stecy", image: "https://images.pexels.com/photos/1572878/pexels-photo-1572878.jpeg" },
    { id: 18, name: "NDOH ZOMO Lesly Myriam", image: "https://images.pexels.com/photos/1902479/pexels-photo-1902479.jpeg" },
    { id: 19, name: "Nicole", image: "https://images.pexels.com/photos/1391498/pexels-photo-1391498.jpeg" },
    { id: 20, name: "NGNARA Chancellia", image: "https://images.pexels.com/photos/1764564/pexels-photo-1764564.jpeg" },
    { id: 21, name: "Nynelle Mbazoghe", image: "https://images.pexels.com/photos/1336873/pexels-photo-1336873.jpeg" },
    { id: 22, name: "PAMBOU DIHIBA Aimée", image: "https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg" },
    { id: 23, name: "Priscillia Mezui", image: "https://images.pexels.com/photos/1812634/pexels-photo-1812634.jpeg" },
    { id: 24, name: "Rosnel Ayo", image: "https://images.pexels.com/photos/1821095/pexels-photo-1821095.jpeg" },
    { id: 25, name: "Sadia", image: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg" },
    { id: 26, name: "Sephora Nawele", image: "https://images.pexels.com/photos/1437912/pexels-photo-1437912.jpeg" },
    { id: 27, name: "Talia Viada", image: "https://images.pexels.com/photos/1520760/pexels-photo-1520760.jpeg" },
    { id: 28, name: "Venusia Olery", image: "https://images.pexels.com/photos/1539936/pexels-photo-1539936.jpeg" }
  ];

  // Données des événements
  const events: Event[] = [
    {
      id: "1",
      name: "CLOFAS 241",
      description: "Un événement majeur de la mode gabonaise mettant en valeur les créateurs locaux.",
      location: "Libreville, Gabon"
    },
    {
      id: "2",
      name: "Fashion Showchou/Awards de la mode Gabonaise",
      description: "Cérémonie de récompense célébrant les talents de la mode au Gabon.",
      location: "Libreville, Gabon"
    },
    {
      id: "3",
      name: "Perfect Fashion Day",
      description: "Une journée dédiée à la mode avec des défilés et des présentations.",
      location: "Libreville, Gabon"
    },
    {
      id: "4",
      name: "K'elle Pour Elle",
      description: "Événement de mode centré sur les créations féminines.",
      location: "Libreville, Gabon"
    },
    {
      id: "5",
      name: "FEMOGA",
      description: "Festival de la Mode Gabonaise réunissant les acteurs du secteur.",
      location: "Libreville, Gabon"
    },
    {
      id: "6",
      name: "La semaine de la Mode (UCREATE)",
      description: "Une semaine entière dédiée à la mode et à la création au Gabon.",
      location: "Libreville, Gabon"
    },
    {
      id: "7",
      name: "Gala Femmes actives du Gabon",
      description: "Un événement célébrant les femmes entreprenantes dans le domaine de la mode.",
      location: "Libreville, Gabon"
    },
    {
      id: "8",
      name: "Edele A",
      description: "Présentation de collections de mode contemporaine gabonaise.",
      location: "Libreville, Gabon"
    },
    {
      id: "9",
      name: "La Nuit du Textile Africain à Bamako",
      description: "Célébration des textiles africains avec participation gabonaise.",
      location: "Bamako, Mali"
    }
  ];

  // Données des services
  const services: Service[] = [
    {
      id: "1",
      name: "Défilés de mode",
      description: "Organisation et participation à des défilés de mode locaux et internationaux."
    },
    {
      id: "2",
      name: "Shootings photo",
      description: "Services de mannequins pour des séances photo professionnelles."
    },
    {
      id: "3",
      name: "Événements VIP",
      description: "Présence de mannequins lors d'événements exclusifs et lancements."
    },
    {
      id: "4",
      name: "Campagnes publicitaires",
      description: "Mannequins pour vos campagnes marketing et publicitaires."
    },
    {
      id: "5",
      name: "Formation de mannequins",
      description: "Cours et ateliers pour devenir mannequin professionnel."
    },
    {
      id: "6",
      name: "Organisation d'événements de mode",
      description: "Conception et réalisation complète de vos événements de mode."
    }
  ];

  // Tabs configuration
  const tabs = [
    {
      value: "models",
      label: "NOS MODÈLES",
      content: <ModelsList models={femaleModels} />
    },
    {
      value: "services",
      label: "NOS SERVICES",
      content: <ServicesList services={services} />
    },
    {
      value: "events",
      label: "NOS ÉVÉNEMENTS",
      content: <EventsList events={events} />
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
