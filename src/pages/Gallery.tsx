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

const galleryData = [
  {
    id: "forest",
    title: "L'appel de la forêt",
    images: [
      { id: "forest-1", src: "https://i.ibb.co/SXQTyYWC/AJC-1596-Modifier.jpg", alt: "AJC-1596-Modifier" },
      { id: "forest-2", src: "https://i.ibb.co/M5GxCfW2/AJC-1598-Modifier.jpg", alt: "AJC-1598-Modifier" },
      { id: "forest-3", src: "https://i.ibb.co/1tpZRXfX/AJC-1605-Modifier.jpg", alt: "AJC-1605-Modifier" },
      { id: "forest-4", src: "https://i.ibb.co/WN8DCfLC/AJC-1608.jpg", alt: "AJC-1608" },
      { id: "forest-5", src: "https://i.ibb.co/PzChjwTw/AJC-1609-Modifier.jpg", alt: "AJC-1609-Modifier" },
      { id: "forest-6", src: "https://i.ibb.co/FL50zyvL/AJC-1622.jpg", alt: "AJC-1622" },
      { id: "forest-7", src: "https://i.ibb.co/0pzSTYxf/AJC-1626.jpg", alt: "AJC-1626" },
      { id: "forest-8", src: "https://i.ibb.co/dJ1kTGNd/AJC-1628.jpg", alt: "AJC-1628" },
      { id: "forest-9", src: "https://i.ibb.co/FqDcjwW7/AJC-1631.jpg", alt: "AJC-1631" },
      { id: "forest-10", src: "https://i.ibb.co/JFQrv27h/AJC-1633.jpg", alt: "AJC-1633" },
      { id: "forest-11", src: "https://i.ibb.co/VYy5MsWc/AJC-1634.jpg", alt: "AJC-1634" },
      { id: "forest-12", src: "https://i.ibb.co/MybNwcDK/AJC-1635.jpg", alt: "AJC-1635" },
      { id: "forest-13", src: "https://i.ibb.co/99R5P92C/AJC-1638.jpg", alt: "AJC-1638" },
      { id: "forest-14", src: "https://i.ibb.co/rGcR8qr7/AJC-1640.jpg", alt: "AJC-1640" },
      { id: "forest-15", src: "https://i.ibb.co/Hf5X1qB6/AJC-1641.jpg", alt: "AJC-1641" },
      { id: "forest-16", src: "https://i.ibb.co/VYRygXQR/AJC-1642.jpg", alt: "AJC-1642" },
      { id: "forest-17", src: "https://i.ibb.co/6c4FPbGs/AJC-1644.jpg", alt: "AJC-1644" },
      { id: "forest-18", src: "https://i.ibb.co/ccymsg87/AJC-1652.jpg", alt: "AJC-1652" },
      { id: "forest-19", src: "https://i.ibb.co/qSXHXpR/AJC-1653.jpg", alt: "AJC-1653" },
      { id: "forest-20", src: "https://i.ibb.co/Y7YxBy54/AJC-1664.jpg", alt: "AJC-1664" },
      { id: "forest-21", src: "https://i.ibb.co/rYp5dKx/AJC-1670.jpg", alt: "AJC-1670" },
      { id: "forest-22", src: "https://i.ibb.co/Mk2DxDXY/AJC-1670-Modifier.jpg", alt: "AJC-1670-Modifier" },
      { id: "forest-23", src: "https://i.ibb.co/JWj3hYjD/AJC-1671.jpg", alt: "AJC-1671" },
      { id: "forest-24", src: "https://i.ibb.co/n4q7jN9/AJC-1672.jpg", alt: "AJC-1672" },
      { id: "forest-25", src: "https://i.ibb.co/Qy2hFt9/AJC-1672-Modifier.jpg", alt: "AJC-1672-Modifier" },
      { id: "forest-26", src: "https://i.ibb.co/4Zp2NNWJ/AJC-1673.jpg", alt: "AJC-1673" },
      { id: "forest-27", src: "https://i.ibb.co/5WJX8GF2/AJC-1674.jpg", alt: "AJC-1674" },
      { id: "forest-28", src: "https://i.ibb.co/GfcYHx3b/AJC-1675.jpg", alt: "AJC-1675" },
      { id: "forest-29", src: "https://i.ibb.co/fYF00RQD/AJC-1680-Modifier.jpg", alt: "AJC-1680-Modifier" },
      { id: "forest-30", src: "https://i.ibb.co/v4ppFBk0/AJC-1685.jpg", alt: "AJC-1685" },
      { id: "forest-31", src: "https://i.ibb.co/m5XKMDyq/AJC-1687.jpg", alt: "AJC-1687" },
      { id: "forest-32", src: "https://i.ibb.co/3mVYZGLj/AJC-1688.jpg", alt: "AJC-1688" },
      { id: "forest-33", src: "https://i.ibb.co/v4NK9mZy/AJC-1689.jpg", alt: "AJC-1689" },
      { id: "forest-34", src: "https://i.ibb.co/TDGzKLWT/AJC-1692-Modifier.jpg", alt: "AJC-1692-Modifier" },
      { id: "forest-35", src: "https://i.ibb.co/zVzrVfHg/AJC-1694-Modifier.jpg", alt: "AJC-1694-Modifier" },
      { id: "forest-36", src: "https://i.ibb.co/21vcWTk4/AJC-1697-Modifier.jpg", alt: "AJC-1697-Modifier" },
      { id: "forest-37", src: "https://i.ibb.co/Rpxs7vmF/AJC-1698-Modifier.jpg", alt: "AJC-1698-Modifier" },
      { id: "forest-38", src: "https://i.ibb.co/LdFvzrtS/AJC-1701.jpg", alt: "AJC-1701" },
      { id: "forest-39", src: "https://i.ibb.co/JwSWN68C/AJC-1704-Modifier.jpg", alt: "AJC-1704-Modifier" },
      { id: "forest-40", src: "https://i.ibb.co/NdjzFVNv/AJC-1706-Modifier.jpg", alt: "AJC-1706-Modifier" },
      { id: "forest-41", src: "https://i.ibb.co/v61h3ktw/AJC-1714-Modifier.jpg", alt: "AJC-1714-Modifier" },
      { id: "forest-42", src: "https://i.ibb.co/spYxvNWj/AJC-1716-Modifier.jpg", alt: "AJC-1716-Modifier" },
      { id: "forest-43", src: "https://i.ibb.co/fGpDgC7Q/AJC-1722-Modifier.jpg", alt: "AJC-1722-Modifier" },
      { id: "forest-44", src: "https://i.ibb.co/MxbytKhn/AJC-1726-Modifier.jpg", alt: "AJC-1726-Modifier" },
      { id: "forest-45", src: "https://i.ibb.co/tMKrQNzh/AJC-1729-Modifier.jpg", alt: "AJC-1729-Modifier" },
      { id: "forest-46", src: "https://i.ibb.co/zkZpbN7/AJC-1732-Modifier.jpg", alt: "AJC-1732-Modifier" },
      { id: "forest-47", src: "https://i.ibb.co/VWcN9V2d/AJC-1734-Modifier.jpg", alt: "AJC-1734-Modifier" },
      { id: "forest-48", src: "https://i.ibb.co/gbMTVzvC/AJC-1746-Modifier.jpg", alt: "AJC-1746-Modifier" },
      { id: "forest-49", src: "https://i.ibb.co/WpPyKGPS/AJC-1749-Modifier.jpg", alt: "AJC-1749-Modifier" },
      { id: "forest-50", src: "https://i.ibb.co/QBq2TD6/AJC-1755-Modifier.jpg", alt: "AJC-1755-Modifier" },
      { id: "forest-51", src: "https://i.ibb.co/gFB7CpNh/AJC-1758-Modifier.jpg", alt: "AJC-1758-Modifier" },
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
