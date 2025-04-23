
import React from 'react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface GalleryFallbackProps {
  themeTitle: string;
  count?: number;
}

const defaultImages = [
  "/placeholder.svg",
  "/placeholder.svg",
  "/placeholder.svg"
];

const GalleryFallback = ({ themeTitle, count = 3 }: GalleryFallbackProps) => {
  // Generate an array of placeholder images based on count
  const placeholders = Array.from({ length: count }, (_, i) => ({
    id: `fallback-${i}`,
    src: defaultImages[i % defaultImages.length],
    alt: `${themeTitle} - Image ${i + 1}`
  }));

  return (
    <div className="mx-auto max-w-5xl">
      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent>
          {placeholders.map((image) => (
            <CarouselItem key={image.id} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-[3/4] items-center justify-center p-0">
                    <AspectRatio ratio={3/4}>
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover rounded-md bg-muted"
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
  );
};

export default GalleryFallback;
