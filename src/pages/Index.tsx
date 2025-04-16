
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSlider from '../components/home/HeroSlider';
import FeaturedModels from '../components/home/FeaturedModels';
import AboutSection from '../components/home/AboutSection';
import CallToAction from '../components/home/CallToAction';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main>
        <HeroSlider />
        <FeaturedModels />
        <AboutSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
