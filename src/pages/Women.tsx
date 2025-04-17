
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
    { id: 1, name: "Annie Flora", image: "https://i.ibb.co/ShShsp0/DSC-0369.jpg" },
    { id: 2, name: "Diane Vanessa", image: "https://i.ibb.co/LhxkbmDD/PMM0179.jpg" },
    { id: 3, name: "Cassandra", image: "https://i.ibb.co/78q5My4/PMM0161.jpg" },
    { id: 4, name: "Duchesse", image: "https://i.ibb.co/Mkp5TVjf/AJC-1553.jpg" },
    { id: 5, name: "Lea Danielle", image: "https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg" },
    { id: 6, name: "Aimée Mawili", image: "https://i.ibb.co/6cHHfSn2/476255617-604882875586826-616826477806477607-n.jpg" },
    { id: 7, name: "Jodelle Juliana", image: "https://images.pexels.com/photos/1848886/pexels-photo-1848886.jpeg" },
    { id: 8, name: "Noemi Kim", image: "https://i.ibb.co/pv6kmGnk/DSC-0208.jpg" },
    { id: 9, name: "Leene Wheeler", image: "https://images.pexels.com/photos/1394499/pexels-photo-1394499.jpeg" },
    { id: 10, name: "Noé Mak's", image: "https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg" },
    { id: 11, name: "Brie Ballet", image: "https://images.pexels.com/photos/1375849/pexels-photo-1375849.jpeg" },
    { id: 12, name: "Kendra Mebiame", image: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg" },
    { id: 13, name: "Merveille Aworet", image: "https://i.ibb.co/tnMZ3NJ/MG-0666.jpg" },
    { id: 14, name: "Mikamona Maurille", image: "https://images.pexels.com/photos/1382734/pexels-photo-1382734.jpeg" },
    { id: 15, name: "Mirabelle Medza", image: "https://images.pexels.com/photos/1702238/pexels-photo-1702238.jpeg", category: "Miss Tourisme Gabon" },
    { id: 16, name: "Khelany Allogho", image: "https://i.ibb.co/5gZzS0pV/DSC-0457.jpg" },
    { id: 17, name: "Stecy Glappier", image: "https://images.pexels.com/photos/1572878/pexels-photo-1572878.jpeg" },
    { id: 18, name: " Lesly Zomo", image: "https://i.ibb.co/PZL0tjD4/DSC-0372.jpg" },
    { id: 19, name: "Nice Ska", image: "https://scontent.flbv4-1.fna.fbcdn.net/v/t39.30808-6/485907263_640515812030867_7295734330866953028_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeF0V5Aol5uaId0vuPj6zIhlKYa3LOuP-sIphrcs64_6wiommdr26Dut8vks4FbaErQo4CYX2aN46fHw8HSm6gp9&_nc_ohc=uqDzhDpI23kQ7kNvwHES_8j&_nc_oc=AdmQmg9JVu2XgJybiFmdf-dzDqlj9NNNliGSwDLSLzbbB9l2hBgQID6IE7fKm64dJeE&_nc_zt=23&_nc_ht=scontent.flbv4-1.fna&_nc_gid=7tpO_ViJ0ZBzJ6Mjc5fEuA&oh=00_AfHB-aBL4ScPoUpUb746jfMDq19Cl20CRz9rFwZBtIGY9A&oe=6806358F" },
    { id: 20, name: "Ruth Jussy", image: "https://i.ibb.co/Cs7RpWCq/482961374-623650043916904-6278220035000086504-n.jpg" },
    { id: 21, name: "Nynelle Mbazoghe", image: "https://i.ibb.co/j95xqjHT/DSC-0053.jpg" },
    { id: 22, name: "Aimée Pambou", image: "https://i.ibb.co/ksmky1Sn/DSC01388-Modifier.jpg" },
    { id: 23, name: "Priscillia Mezui", image: "https://images.pexels.com/photos/1812634/pexels-photo-1812634.jpeg" },
    { id: 24, name: "Kerenne Hurielle", image: "https://images.pexels.com/photos/1821095/pexels-photo-1821095.jpeg" },
    { id: 25, name: "Sadia", image: "https://images.pexels.com/photos/1386604/pexels-photo-1386604.jpeg" },
    { id: 26, name: "Sephora Nawele", image: "https://images.pexels.com/photos/1437912/pexels-photo-1437912.jpeg" },
    { id: 27, name: "Cegolaine Biye", image: "https://i.ibb.co/fz5jtwfG/448406365-449418894385926-3540828592057987599-n.jpg" },
    { id: 28, name: "Venusia Olery", image: "https://i.ibb.co/BV1HFbft/MG-0695.jpg" }
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
