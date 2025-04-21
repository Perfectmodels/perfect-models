
import { Layout } from '../components/layout';
import HeroSlider from '../components/home/HeroSlider';
import FeaturedModels from '../components/home/FeaturedModels';
import AboutSection from '../components/home/AboutSection';
import Services from '../components/home/Services';
import CallToAction from '../components/home/CallToAction';

const Index = () => {
  return (
    <Layout>
      <main className="min-h-screen">
        <HeroSlider />
        <AboutSection />
        <FeaturedModels />
        <Services />
        <CallToAction />
      </main>
    </Layout>
  );
};

export default Index;
