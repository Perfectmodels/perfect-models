import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ModelsList from '../components/models/ModelsList';

const femaleModels = [
  {
    id: 1,
    name: "Cassandra",
    image: "URL_IMAGE_CASSANDRA",
    gender: 'women',
    measurements: {
      epaule: 43,
      hanche: 95,
      poitrine: 82,
      tourDeTaille: 70
    }
  },
  {
    id: 2,
    name: "Stecy",
    image: "URL_IMAGE_STECY",
    gender: 'women',
    measurements: {
      epaule: 46,
      hanche: 97,
      poitrine: 85,
      tourDeTaille: 72
    }
  },
  {
    id: 3,
    name: "Juliana",
    image: "URL_IMAGE_JULIANA",
    gender: 'women',
    measurements: {
      epaule: 44,
      hanche: 97,
      poitrine: 86,
      tourDeTaille: 72
    }
  },
  {
    id: 4,
    name: "Merveille",
    image: "URL_IMAGE_MERVEILLE",
    gender: 'women',
    measurements: {
      epaule: 46,
      hanche: 96,
      poitrine: 84,
      tourDeTaille: 66
    }
  },
  {
    id: 5,
    name: "Sephora",
    image: "URL_IMAGE_SEPHORA",
    gender: 'women',
    measurements: {
      epaule: 42,
      hanche: 85,
      poitrine: 76,
      tourDeTaille: 66
    }
  },
  {
    id: 6,
    name: "Eunice",
    image: "URL_IMAGE_EUNICE",
    gender: 'women',
    measurements: {
      epaule: 44,
      hanche: 94,
      poitrine: 84,
      tourDeTaille: 68
    }
  },
  {
    id: 7,
    name: "Nynelle",
    image: "URL_IMAGE_NYNELLE",
    gender: 'women',
    measurements: {
      epaule: 42,
      hanche: 88,
      poitrine: 83,
      tourDeTaille: 65
    }
  },
  {
    id: 8,
    name: "Duchesse",
    image: "URL_IMAGE_DUCHESSE",
    gender: 'women',
    measurements: {
      epaule: 50,
      hanche: 97,
      poitrine: 86,
      tourDeTaille: 96
    }
  },
  {
    id: 9,
    name: "Sadia",
    image: "URL_IMAGE_SADIA",
    gender: 'women',
    measurements: {
      epaule: 47,
      hanche: 88,
      poitrine: 96,
      tourDeTaille: 65
    }
  }
];

const Women = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-grow pt-24">
      <div className="container mx-auto px-6">
        <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Nos Modèles Femmes</h1>
        <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>
        <ModelsList models={femaleModels} />
      </div>
    </main>
    <Footer />
  </div>
);

export default Women;
