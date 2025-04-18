
const partners = [
  { name: "Darain Visual", logo: "/placeholder.svg" },
  { name: "Legrand Product's", logo: "/placeholder.svg" },
  { name: "Amplitude Libreville", logo: "/placeholder.svg" },
  { name: "Symbiose Concept Store", logo: "/placeholder.svg" },
  { name: "Edele A", logo: "/placeholder.svg" },
  { name: "NR Pictures", logo: "/placeholder.svg" },
  { name: "Indi Hair", logo: "/placeholder.svg" },
  { name: "Le Wap - Restaurant Bar Lounge", logo: "/placeholder.svg" },
  { name: "Yarden Hotel Appart", logo: "/placeholder.svg" },
  { name: "Graphik Studio", logo: "/placeholder.svg" },
  { name: "Lady Riaba", logo: "/placeholder.svg" },
  { name: "Madam Luc", logo: "/placeholder.svg" },
  { name: "Sabo Fashion", logo: "/placeholder.svg" },
  { name: "Ecole de Mode de Nzeng Ayong", logo: "/placeholder.svg" },
  { name: "VitriClean", logo: "/placeholder.svg" },
  { name: "Beitch Faro", logo: "/placeholder.svg" },
];

const Partners = () => {
  return (
    <div className="py-8 border-t border-model-gold/20">
      <div className="container mx-auto px-6">
        <h3 className="font-playfair text-xl mb-6 text-center">Nos Partenaires</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {partners.map((partner, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-20 h-20 object-contain mb-2"
              />
              <p className="text-xs text-center text-gray-600">{partner.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Partners;
