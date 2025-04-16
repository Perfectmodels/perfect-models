
import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, TikTok } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for form submission
    console.log('Form submitted:', formData);
    // Reset form after submission
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-6">
          <h1 className="font-playfair text-4xl md:text-5xl mb-6 text-center">Contact</h1>
          <div className="w-24 h-0.5 bg-model-gold mx-auto mb-12"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="font-playfair text-2xl mb-6">Coordonnées</h2>
              
              <div className="space-y-4 mb-8">
                <ContactItem icon={<Mail className="text-model-gold" />} 
                  label="Email" 
                  value="Perfectmodels.ga@gmail.com"
                  href="mailto:Perfectmodels.ga@gmail.com" />
                
                <ContactItem icon={<Phone className="text-model-gold" />} 
                  label="WhatsApp & Téléphone" 
                  value="+241 77 50 79 50"
                  href="tel:+24177507950" />
                
                <ContactItem icon={<MapPin className="text-model-gold" />} 
                  label="Adresse" 
                  value="Libreville, Gabon" />
              </div>
              
              <h3 className="font-playfair text-xl mb-4">Suivez-nous</h3>
              <div className="flex space-x-4 mb-8">
                <SocialLink 
                  href="https://www.facebook.com/perfectmodels.ga?locale=fr_FR" 
                  icon={<Facebook size={20} />} 
                  label="Facebook" />
                <SocialLink 
                  href="https://www.instagram.com/perfectmodels.ga/" 
                  icon={<Instagram size={20} />} 
                  label="Instagram" />
                <SocialLink 
                  href="https://www.youtube.com/@PMM241" 
                  icon={<Youtube size={20} />} 
                  label="YouTube" />
                <SocialLink 
                  href="https://www.tiktok.com/@perfectmodels.ga" 
                  icon={<TikTok size={20} />} 
                  label="TikTok" />
              </div>

              <h2 className="font-playfair text-2xl mb-4">Événements</h2>
              <p className="text-gray-700 mb-2">Nous participons à de nombreux événements de mode au Gabon :</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>CLOFAS 241</li>
                <li>Fashion Showchou / Awards de la mode Gabonaise</li>
                <li>Perfect Fashion Day</li>
                <li>K'elle Pour Elle</li>
                <li>FEMOGA</li>
                <li>La semaine de la Mode (UCREATE)</li>
                <li>Gala Femmes actives du Gabon</li>
                <li>Edele A</li>
              </ul>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-playfair text-2xl mb-6">Envoyez-nous un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-model-gold"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-model-gold"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-model-gold"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-model-gold"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="px-6 py-3 bg-model-gold text-white font-medium rounded-md hover:bg-yellow-700 transition-colors duration-300"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ContactItem = ({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) => (
  <div className="flex items-start">
    <div className="mt-1 mr-3">{icon}</div>
    <div>
      <h4 className="font-medium text-gray-900">{label}</h4>
      {href ? (
        <a href={href} className="text-gray-700 hover:text-model-gold transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-gray-700">{value}</p>
      )}
    </div>
  </div>
);

const SocialLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-model-gold hover:text-white transition-colors duration-300"
    aria-label={label}
  >
    {icon}
  </a>
);

export default Contact;
