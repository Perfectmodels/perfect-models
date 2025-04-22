
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GalleryTheme, GalleryImage } from '@/hooks/useGalleryData';
import GalleryThemeContent from './GalleryThemeContent';

interface GalleryTabsProps {
  themes: GalleryTheme[];
  images: GalleryImage[];
}

const GalleryTabs = ({ themes, images }: GalleryTabsProps) => {
  return (
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
  );
};

export default GalleryTabs;
