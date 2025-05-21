
import React, { useState } from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryImage } from '@/hooks/useGalleryData';
import { toast } from 'sonner';

interface GalleryCarouselProps {
  images: GalleryImage[];
  themeTitle: string;
}

const GalleryCarousel = ({ images, themeTitle }: GalleryCarouselProps) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageError = (imageId: string, src: string) => {
    console.error(`Échec de chargement de l'image: ${src}`);
    setErrorImages(prev => ({ ...prev, [imageId]: true }));
    setLoadedImages(prev => ({ ...prev, [imageId]: true })); // Retirer le skeleton
    toast.error(`Impossible de charger une image: ${src.substring(0, 30)}...`);
  };
  
  return (
    <div className="mx-auto max-w-5xl">
      {images.length === 0 ? (
        <p className="text-center text-muted-foreground">Aucune image disponible pour ce thème.</p>
      ) : (
        <Carousel opts={{ loop: true, align: "start" }} className="w-full">
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-[3/4] items-center justify-center p-0 relative">
                      <AspectRatio ratio={3/4}>
                        {!loadedImages[image.id] && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Skeleton className="w-full h-full absolute" />
                          </div>
                        )}
                        {errorImages[image.id] ? (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <p className="text-sm text-muted-foreground px-4 text-center">
                              Image non disponible
                            </p>
                          </div>
                        ) : (
                          <img
                            src={image.src}
                            alt={image.alt || themeTitle}
                            className={`w-full h-full object-cover rounded-md transition-opacity duration-300 ${loadedImages[image.id] ? 'opacity-100' : 'opacity-0'}`}
                            loading={index < 3 ? "eager" : "lazy"}
                            decoding="async"
                            fetchPriority={index < 3 ? "high" : "auto"}
                            onLoad={() => handleImageLoad(image.id)}
                            onError={() => handleImageError(image.id, image.src)}
                          />
                        )}
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
      )}
    </div>
  );
};

export default GalleryCarousel;
