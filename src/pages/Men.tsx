import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsList from '../components/models/ModelsList';
import TabContent from '../components/common/TabContent';
import EventsList from '../components/models/EventsList';
import ServicesList from '../components/models/ServicesList';
import { Event, Service } from '@/types/modelTypes';

const Men = () => {
  // Données des mannequins masculins
  const maleModels = [
    { id: 1, name: "Donatien Anani", image: "https://images.pexels.com/photos/2887718/pexels-photo-2887718.jpeg" },
    { id: 2, name: "Davy", image: "https://i.ibb.co/KcWyzrx/DSC-0163.jpg" },
    { id: 3, name: "Osée JN", image: "https://images.pexels.com/photos/1860367/pexels-photo-1860367.jpeg" },
    { id: 4, name: "Moustapha Nziengui", image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg" },
    { id: 5, name: "Pablo Zapatero", image: "https://i.ibb.co/tpXDpGG/DSC-0350.jpg" },
    { id: 6, name: "Rosly Biyoghe", image: "https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg" }
  ];

  // Données des événements (mêmes que pour les femmes)
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

  // Données des services (mêmes que pour les femmes)
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
      content: <ModelsList models={maleModels} />
    },
    {
      value: "services",
      label: "NOS SERVICES",
      content: <div id="services-section"><ServicesList services={services} /></div>
    },
    {
      value: "events",
      label: "NOS ÉVÉNEMENTS",
      content: <div id="events-section"><EventsList events={events} /></div>
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
