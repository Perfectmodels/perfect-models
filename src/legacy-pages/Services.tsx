import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useData } from '../contexts/DataContext';
import { Service } from '../types';
import { 
    AcademicCapIcon, CameraIcon, UserGroupIcon, SparklesIcon, ClipboardDocumentCheckIcon, 
    MegaphoneIcon, IdentificationIcon, ScissorsIcon, PaintBrushIcon, CalendarDaysIcon, 
    PresentationChartLineIcon, ChatBubbleLeftRightIcon, VideoCameraIcon, PhotoIcon, StarIcon, HeartIcon, 
    UsersIcon, BriefcaseIcon, MicrophoneIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';


const iconMap: { [key: string]: React.ElementType } = {
  AcademicCapIcon, CameraIcon, UserGroupIcon, SparklesIcon, ClipboardDocumentCheckIcon, 
  MegaphoneIcon, IdentificationIcon, ScissorsIcon, PaintBrushIcon, CalendarDaysIcon, 
  PresentationChartLineIcon, ChatBubbleLeftRightIcon, VideoCameraIcon, PhotoIcon, StarIcon,
  UsersIcon, BriefcaseIcon, MicrophoneIcon, BuildingStorefrontIcon, ClipboardDocumentListIcon
};

const ServiceListItem: React.FC<{ service: Service }> = ({ service }) => {
    const Icon = iconMap[service.icon] || HeartIcon;

    return (
        <div className="bg-black border border-pm-gold/20 rounded-lg p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start transform transition-all duration-300 hover:border-pm-gold hover:shadow-2xl hover:shadow-pm-gold/10">
            <div className="flex-shrink-0 bg-pm-dark p-4 rounded-full border border-pm-gold/30 mt-1">
                <Icon className="w-10 h-10 text-pm-gold" />
            </div>
            <div className="flex-grow">
                <h3 className="text-3xl font-playfair text-pm-gold mb-3">{service.title}</h3>
                <p className="text-pm-off-white/80 leading-relaxed mb-4">{service.description}</p>
                
                {service.details && (
                    <div className="mb-6 mt-5 bg-pm-dark/50 p-4 rounded-md border-l-4 border-pm-gold">
                        <h4 className="font-bold text-pm-off-white mb-2">{service.details.title}</h4>
                        <ul className="list-disc list-inside space-y-1 text-pm-off-white/70">
                            {service.details.points.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <Link 
                    to={service.buttonLink}
                    className="inline-block px-8 py-3 bg-pm-gold text-pm-dark font-bold uppercase tracking-widest text-sm rounded-full transition-all duration-300 hover:bg-white hover:scale-105 shadow-lg shadow-pm-gold/20"
                >
                    {service.buttonText}
                </Link>
            </div>
        </div>
    );
};

const Services: React.FC = () => {
    const { data } = useData();
    const services = data?.agencyServices || [];

    const servicesByCategory = services.reduce((acc, service) => {
        const category = service.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(service);
        return acc;
    }, {} as Record<string, Service[]>);

    const categoryOrder: (keyof typeof servicesByCategory)[] = [
        'Services Mannequinat',
        'Services Mode et Stylisme',
        'Services Événementiels'
    ];

    return (
        <div className="bg-pm-dark text-pm-off-white">
            <SEO
                title="Nos Services | Accompagnement & Production"
                description="Découvrez l'ensemble des services conçus pour répondre aux besoins des créateurs, marques, et particuliers. Réservez directement depuis notre site."
                image={data?.siteImages.about}
            />
            <div className="page-container">
                <h1 className="page-title">Nos Services sur Mesure</h1>
                <p className="page-subtitle">
                    Découvrez l’ensemble de nos services conçus pour répondre aux besoins des créateurs, marques, entreprises et particuliers. Chaque service peut être réservé directement depuis notre site.
                </p>
                
                <div className="space-y-16">
                    {categoryOrder.map(category => (
                        servicesByCategory[category] && (
                             <section key={category}>
                                <h2 className="section-title">{category}</h2>
                                <div className="space-y-8">
                                    {servicesByCategory[category].map((service, index) => (
                                        <ServiceListItem key={index} service={service} />
                                    ))}
                                </div>
                            </section>
                        )
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;
