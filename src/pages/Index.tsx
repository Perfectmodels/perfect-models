
import { Layout } from '../components/layout';
import HeroSlider from '../components/home/HeroSlider';
import AboutSection from '../components/home/AboutSection';
import CallToAction from '../components/home/CallToAction';

const Index = () => {
  return (
    <Layout>
      <HeroSlider />
      <AboutSection />
      <CallToAction />
    </Layout>
  );
};

export default Index;
