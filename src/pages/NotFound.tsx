
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-model-white">
        <div className="text-center px-6">
          <h1 className="font-playfair text-6xl md:text-8xl mb-6">404</h1>
          <div className="w-16 h-0.5 bg-model-gold mx-auto mb-6"></div>
          <p className="text-lg mb-8">
            La page que vous recherchez ne semble pas exister.
          </p>
          <Link 
            to="/"
            className="inline-block px-8 py-3 border border-model-black text-model-black hover:bg-model-black hover:text-model-white transition-colors duration-300"
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
