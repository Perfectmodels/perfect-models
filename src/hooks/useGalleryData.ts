
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryTheme {
  id: string;
  title: string;
  slug: string;
  description: string | null;
}

export interface GalleryImage {
  id: string;
  theme_id: string;
  src: string;
  alt: string | null;
  sequence: number | null;
}

export const useGalleryData = () => {
  return useQuery({
    queryKey: ["gallery-themes"],
    queryFn: async () => {
      const { data: themes, error: themesError } = await supabase
        .from("gallery_themes")
        .select("*")
        .order("created_at");

      if (themesError) {
        console.error("Error fetching themes:", themesError);
        throw themesError;
      }

      const { data: images, error: imagesError } = await supabase
        .from("gallery_images")
        .select("*")
        .order("sequence");

      if (imagesError) {
        console.error("Error fetching images:", imagesError);
        throw imagesError;
      }

      // Ensure we have at least the themes data even if there are no images
      return {
        themes: (themes as GalleryTheme[]) || [],
        images: (images as GalleryImage[]) || [],
      };
    },
    // Add refetch on window focus to ensure updated data
    refetchOnWindowFocus: true,
  });
};
