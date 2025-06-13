
import React from 'react';
import { Layout } from '@/components/layout';
import HeroSlider from '@/components/home/HeroSlider';
import AboutSection from '@/components/home/AboutSection';
import Services from '@/components/home/Services';
import Benefits from '@/components/home/Benefits';
import LatestNews from '@/components/home/LatestNews';
import StatsSection from '@/components/home/StatsSection';
import Testimonials from '@/components/home/Testimonials';

const Index = () => {
  return (
    <Layout>
      <HeroSlider />
      <AboutSection />
      <Services />
      <StatsSection />
      <Benefits />
      <LatestNews />
      <Testimonials />
    </Layout>
  );
};

export default Index;
