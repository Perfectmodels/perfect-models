
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import HeroSlider from '../components/home/HeroSlider';
import AboutSection from '../components/home/AboutSection';
import CallToAction from '../components/home/CallToAction';
import PerfectFashion from '../components/home/PerfectFashion';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSlider />
        <AboutSection />
        <PerfectFashion />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
