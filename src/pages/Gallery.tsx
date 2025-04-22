
import React from 'react';
import { Layout } from '@/components/layout';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGalleryData } from '@/hooks/useGalleryData';
import GalleryThemeContent from '@/components/gallery/GalleryThemeContent';

const PhotoGallery = () => {
  const { data, isLoading } = useGalleryData();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-playfair text-center mb-8">Chargement...</h1>
        </div>
      </Layout>
    );
  }

  const { themes, images } = data || { themes: [], images: [] };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-playfair text-center mb-8">Galerie Photo</h1>
        
        <Tabs defaultValue={themes[0]?.slug} className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="mb-8 w-full flex justify-center">
              {themes.map(theme => (
                <TabsTrigger key={theme.id} value={theme.slug} className="px-6">
                  {theme.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          {themes.map(theme => (
            <GalleryThemeContent 
              key={theme.id}
              theme={theme}
              images={images}
            />
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default PhotoGallery;
