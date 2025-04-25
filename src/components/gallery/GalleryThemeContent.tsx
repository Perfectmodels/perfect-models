
import React, { useEffect } from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { GalleryTheme, GalleryImage } from '@/hooks/useGalleryData';
import GalleryCarousel from './GalleryCarousel';

interface GalleryThemeContentProps {
  theme: GalleryTheme;
  images: GalleryImage[];
}

const GalleryThemeContent = ({ theme, images }: GalleryThemeContentProps) => {
  const themeImages = images.filter(img => img.theme_id === theme.id);

  // Préchargez les premières images pour améliorer l'expérience utilisateur
  useEffect(() => {
    const preloadImages = themeImages.slice(0, 3).map(img => {
      const image = new Image();
      image.src = img.src;
      return image;
    });
    
    return () => {
      // Nettoyer les références si nécessaire
      preloadImages.forEach(img => img.onload = null);
    };
  }, [themeImages]);

  return (
    <TabsContent value={theme.slug} className="p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-playfair mb-6 text-center">{theme.title}</h2>
        {theme.description && (
          <p className="text-center text-muted-foreground mb-6">{theme.description}</p>
        )}
        
        {themeImages.length > 0 ? (
          <GalleryCarousel images={themeImages} themeTitle={theme.title} />
        ) : (
          <p className="text-center text-muted-foreground">
            Pas d'images disponibles pour cette section
          </p>
        )}
      </div>
    </TabsContent>
  );
};

export default GalleryThemeContent;
