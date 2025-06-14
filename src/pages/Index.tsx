
import React from 'react';
import { Layout } from '@/components/layout';
import HeroSlider from '@/components/home/HeroSlider';
import AboutSection from '@/components/home/AboutSection';
import Services from '@/components/home/Services';
import Benefits from '@/components/home/Benefits';
import LatestNews from '@/components/home/LatestNews';
import StatsSection from '@/components/home/StatsSection';
import Testimonials from '@/components/home/Testimonials';
import FeaturedModels from '@/components/home/FeaturedModels';
import MetaTags from '@/components/seo/MetaTags';

const Index = () => {
  return (
    <Layout>
      <MetaTags 
        title="Accueil" 
        description="Perfect Models Management - Découvrez l'excellence dans le monde du mannequinat. Agence de mannequins de premier plan."
        url="https://perfectmodels.ga/"
      />
      <HeroSlider />
      <AboutSection />
      <FeaturedModels />
      <Services />
      <StatsSection />
      <Benefits />
      <LatestNews />
      <Testimonials />
    </Layout>
  );
};

export default Index;
