
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

// Données pour les carousels thématiques
const galleryData = [
  {
    id: "forest",
    title: "L'appel de la forêt",
    images: [
      { id: "forest-1", src: "https://i.ibb.co/SXQTyYWC/AJC-1596-Modifier.jpg", alt: "Image 1" },
      { id: "forest-2", src: "https://i.ibb.co/M5GxCfW2/AJC-1598-Modifier.jpg", alt: "Image 2" },
      { id: "forest-3", src: "https://i.ibb.co/1tpZRXfX/AJC-1605-Modifier.jpg", alt: "Image 3" },
      { id: "forest-4", src: "https://i.ibb.co/WN8DCfLC/AJC-1608.jpg", alt: "Image 4" },
      { id: "forest-5", src: "https://i.ibb.co/PzChjwTw/AJC-1609-Modifier.jpg", alt: "Image 5" },
      { id: "forest-6", src: "https://i.ibb.co/FL50zyvL/AJC-1622.jpg", alt: "Image 6" },
      { id: "forest-7", src: "https://i.ibb.co/0pzSTYxf/AJC-1626.jpg", alt: "Image 7" },
      { id: "forest-8", src: "https://i.ibb.co/dJ1kTGNd/AJC-1628.jpg", alt: "Image 8" },
      { id: "forest-9", src: "https://i.ibb.co/FqDcjwW7/AJC-1631.jpg", alt: "Image 9" },
      { id: "forest-10", src: "https://i.ibb.co/JFQrv27h/AJC-1633.jpg", alt: "Image 10" },
      // Ajoutez les autres liens ici si nécessaire…
    ],
  },
  {
    id: "90s",
    title: "La mode dans les années 90",
    images: Array.from({ length: 10 }, (_, i) => ({
      id: `90s-${i}`,
      src: `https://picsum.photos/seed/90s${i}/800/1000`,
      alt: `Mode années 90 ${i + 1}`,
    })),
  },
];
  },
  {
    id: "90s",
    title: "La mode dans les années 90",
    images: Array.from({ length: 10 }, (_, i) => ({
      id: `90s-${i}`,
      src: `https://picsum.photos/seed/90s${i}/800/1000`,
      alt: `Mode années 90 ${i + 1}`,
    })),
  },
];

const PhotoGallery = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-playfair text-center mb-8">Galerie Photo</h1>
        
        <Tabs defaultValue="forest" className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="mb-8 w-full flex justify-center">
              {galleryData.map(theme => (
                <TabsTrigger key={theme.id} value={theme.id} className="px-6">
                  {theme.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>
          
          {galleryData.map(theme => (
            <TabsContent key={theme.id} value={theme.id} className="p-4">
              <div className="mb-8">
                <h2 className="text-2xl font-playfair mb-6 text-center">{theme.title}</h2>
                
                <div className="mx-auto max-w-5xl">
                  <Carousel
                    opts={{
                      align: "start",
                    }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {theme.images.map((image) => (
                        <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                          <div className="p-1">
                            <Card>
                              <CardContent className="flex aspect-[3/4] items-center justify-center p-0">
                                <AspectRatio ratio={3/4}>
                                  <img
                                    src={image.src}
                                    alt={image.alt}
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
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default PhotoGallery;
