
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AboutAgency from '../components/about/AboutAgency';
import TeamSection from '../components/about/TeamSection';
import ValuesSection from '../components/about/ValuesSection';
import ServicesList from '../components/models/ServicesList';
import EventsList from '../components/models/EventsList';
import { Separator } from '@/components/ui/separator';

const services = [
  {
    id: 1,
    name: "Mannequinat",
    description: "Formation et placement de mannequins professionnels",
    image: "https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg"
  },
  {
    id: 2,
    name: "Défilés de Mode",
    description: "Organisation et participation à des défilés de mode",
    image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
  },
  {
    id: 3,
    name: "Shooting Photo",
    description: "Séances photo professionnelles pour books et campagnes",
    image: "https://images.pexels.com/photos/2811087/pexels-photo-2811087.jpeg"
  }
];

const events = [
  {
    id: 1,
    name: "Perfect Fashion Day",
    description: "Notre événement annuel de mode",
    date: "Juin 2024",
    location: "Libreville",
    image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg"
  },
  {
    id: 2,
    name: "Fashion Week Gabon",
    description: "Participation à la semaine de la mode",
    date: "Septembre 2024",
    location: "Libreville",
    image: "https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg"
  }
];

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24">
        <div className="container mx-auto px-6">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">À Propos</h1>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>
          
          <AboutAgency />
          <Separator className="my-16 bg-model-gold/20" />
          <ValuesSection />
          <Separator className="my-16 bg-model-gold/20" />
          
          <section className="py-12">
            <h2 className="font-playfair text-3xl mb-8 text-center">Nos Services</h2>
            <ServicesList services={services} />
          </section>
          
          <Separator className="my-16 bg-model-gold/20" />
          
          <section className="py-12">
            <h2 className="font-playfair text-3xl mb-8 text-center">Nos Événements</h2>
            <EventsList events={events} />
          </section>
          
          <Separator className="my-16 bg-model-gold/20" />
          <TeamSection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
