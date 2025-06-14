
import { useQuery } from "@tanstack/react-query";

export interface AgencyContact {
  id: string;
  email: string;
  phone: string;
  whatsapp: string | null;
  address: string;
  city: string;
  country: string;
}

export interface SocialMedia {
  id: string;
  platform: string;
  url: string;
  icon_name: string | null;
  is_active: boolean;
  display_order: number;
}

export interface FooterLink {
  id: string;
  section_name: string;
  link_text: string;
  link_url: string;
  display_order: number;
  is_active: boolean;
}

export const useFooterData = () => {
  return useQuery({
    queryKey: ["footer-data"],
    queryFn: async () => {
      // Utiliser les données par défaut car les tables ne sont pas encore créées
      const defaultContact: AgencyContact = {
        id: '1',
        email: 'Contact@perfectmodels.ga',
        phone: '+241 77 50 79 50',
        whatsapp: '+241 77 50 79 50',
        address: 'Libreville',
        city: 'Libreville',
        country: 'Gabon'
      };

      const defaultSocialMedia: SocialMedia[] = [
        { 
          id: '1',
          platform: 'Facebook', 
          url: 'https://www.facebook.com/perfectmodels.ga?locale=fr_FR', 
          icon_name: 'Facebook',
          is_active: true,
          display_order: 1
        },
        { 
          id: '2',
          platform: 'Instagram', 
          url: 'https://www.instagram.com/perfectmodels.ga/', 
          icon_name: 'Instagram',
          is_active: true,
          display_order: 2
        },
        { 
          id: '3',
          platform: 'YouTube', 
          url: 'https://www.youtube.com/@PMM241', 
          icon_name: 'Youtube',
          is_active: true,
          display_order: 3
        },
        { 
          id: '4',
          platform: 'TikTok', 
          url: 'https://www.tiktok.com/@perfectmodels.ga', 
          icon_name: 'TikTok',
          is_active: true,
          display_order: 4
        }
      ];

      const defaultFooterLinks: FooterLink[] = [
        { id: '1', section_name: 'LIENS RAPIDES', link_text: 'Femmes', link_url: '/women', display_order: 1, is_active: true },
        { id: '2', section_name: 'LIENS RAPIDES', link_text: 'Hommes', link_url: '/men', display_order: 2, is_active: true },
        { id: '3', section_name: 'LIENS RAPIDES', link_text: 'Casting', link_url: '/casting', display_order: 3, is_active: true },
        { id: '4', section_name: 'LIENS RAPIDES', link_text: 'À Propos', link_url: '/about', display_order: 5, is_active: true },
        { id: '5', section_name: 'LIENS RAPIDES', link_text: 'Contact', link_url: '/contact', display_order: 6, is_active: true },
        { id: '6', section_name: 'SERVICES', link_text: 'Commander un Mannequin', link_url: '/mannequin-order', display_order: 2, is_active: true },
        { id: '7', section_name: 'LÉGAL', link_text: 'Politique de Confidentialité', link_url: '/privacy', display_order: 1, is_active: true },
        { id: '8', section_name: 'LÉGAL', link_text: 'Conditions d\'Utilisation', link_url: '/terms', display_order: 2, is_active: true }
      ];

      return {
        contact: defaultContact,
        socialMedia: defaultSocialMedia,
        footerLinks: defaultFooterLinks,
      };
    },
    retry: 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
