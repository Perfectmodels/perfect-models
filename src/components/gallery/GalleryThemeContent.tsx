
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { GalleryTheme, GalleryImage } from '@/hooks/useGalleryData';
import GalleryCarousel from './GalleryCarousel';
import GalleryFallback from './GalleryFallback';

interface GalleryThemeContentProps {
  theme: GalleryTheme;
  images: GalleryImage[];
}

const GalleryThemeContent = ({ theme, images }: GalleryThemeContentProps) => {
  const themeImages = images.filter(img => img.theme_id === theme.id);
  const hasImages = themeImages.length > 0;

  return (
    <TabsContent value={theme.slug} className="p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-playfair mb-6 text-center">{theme.title}</h2>
        {theme.description && (
          <p className="text-center text-muted-foreground mb-6">{theme.description}</p>
        )}
        
        {hasImages ? (
          <GalleryCarousel images={themeImages} themeTitle={theme.title} />
        ) : (
          <GalleryFallback themeTitle={theme.title} />
        )}
      </div>
    </TabsContent>
  );
};

export default GalleryThemeContent;
