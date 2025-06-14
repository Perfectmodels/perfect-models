
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      try {
        // Récupérer les informations de contact
        const { data: contact, error: contactError } = await supabase
          .from("agency_contact")
          .select("*")
          .single();

        if (contactError) {
          console.error("Erreur lors du chargement des contacts:", contactError);
        }

        // Récupérer les réseaux sociaux
        const { data: socialMedia, error: socialError } = await supabase
          .from("social_media")
          .select("*")
          .eq("is_active", true)
          .order("display_order");

        if (socialError) {
          console.error("Erreur lors du chargement des réseaux sociaux:", socialError);
        }

        // Récupérer les liens du footer
        const { data: footerLinks, error: linksError } = await supabase
          .from("footer_links")
          .select("*")
          .eq("is_active", true)
          .order("section_name, display_order");

        if (linksError) {
          console.error("Erreur lors du chargement des liens:", linksError);
        }

        return {
          contact: contact as AgencyContact | null,
          socialMedia: (socialMedia || []) as SocialMedia[],
          footerLinks: (footerLinks || []) as FooterLink[],
        };
      } catch (error) {
        console.error("Erreur lors du chargement des données du footer:", error);
        return {
          contact: null,
          socialMedia: [],
          footerLinks: [],
        };
      }
    },
    retry: 2,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
