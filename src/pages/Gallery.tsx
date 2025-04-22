
import React from 'react';
import { Layout } from '@/components/layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGalleryData } from '@/hooks/useGalleryData';

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
          
          {themes.map(theme => {
            const themeImages = images.filter(img => img.theme_id === theme.id);
            
            return (
              <TabsContent key={theme.id} value={theme.slug} className="p-4">
                <div className="mb-8">
                  <h2 className="text-2xl font-playfair mb-6 text-center">{theme.title}</h2>
                  {theme.description && (
                    <p className="text-center text-muted-foreground mb-6">{theme.description}</p>
                  )}
                  
                  <div className="mx-auto max-w-5xl">
                    <Carousel
                      opts={{
                        align: "start",
                      }}
                      className="w-full"
                    >
                      <CarouselContent>
                        {themeImages.map((image) => (
                          <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                              <Card>
                                <CardContent className="flex aspect-[3/4] items-center justify-center p-0">
                                  <AspectRatio ratio={3/4}>
                                    <img
                                      src={image.src}
                                      alt={image.alt || theme.title}
                                      className="w-full h-full object-cover rounded-md"
                                    />
                                  </AspectRatio>
                                </CardContent>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <div className="flex justify-center mt-4">
                        <CarouselPrevious className="relative -left-0 mr-2" />
                        <CarouselNext className="relative -right-0 ml-2" />
                      </div>
                    </Carousel>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </Layout>
  );
};

export default PhotoGallery;
