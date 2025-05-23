
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import MetaTags from '../components/seo/MetaTags';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <MetaTags 
        title="Page non trouvée - Perfect Models Management"
        description="La page que vous recherchez ne semble pas exister."
      />
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-white">
        <div className="text-center px-6">
          <h1 className="font-playfair text-6xl md:text-8xl mb-6">404</h1>
          <div className="w-16 h-0.5 bg-black mx-auto mb-6"></div>
          <p className="text-lg mb-8">
            La page que vous recherchez ne semble pas exister.
          </p>
          <Link 
            to="/"
            className="inline-block px-8 py-3 border border-black text-black hover:bg-black hover:text-white transition-colors duration-300"
          >
            RETOUR À L'ACCUEIL
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
