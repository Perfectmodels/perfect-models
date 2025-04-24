
import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AboutAgency from '../components/about/AboutAgency';
import TeamSection from '../components/about/TeamSection';
import ValuesSection from '../components/about/ValuesSection';
import ServicesList from '../components/models/ServicesList';
import EventsList from '../components/models/EventsList';
import { Separator } from '@/components/ui/separator';
import type { Service, Event } from '../types/modelTypes';
import { services, events } from '../components/layout/navigation/NavbarData';

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
