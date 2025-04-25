
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

const GalleryLoading = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl md:text-4xl font-playfair text-center mb-8">Galerie Photo</h1>
      <div className="max-w-5xl mx-auto">
        <Skeleton className="h-8 w-64 mx-auto mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-1">
              <Skeleton className="w-full aspect-[3/4]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryLoading;
