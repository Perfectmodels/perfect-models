
import React from 'react';
import { Layout } from '@/components/layout';
import { useGalleryData } from '@/hooks/useGalleryData';
import GalleryLoading from '@/components/gallery/GalleryLoading';
import GalleryTabs from '@/components/gallery/GalleryTabs';

const PhotoGallery = () => {
  const { data, isLoading } = useGalleryData();

  if (isLoading) {
    return (
      <Layout>
        <GalleryLoading />
      </Layout>
    );
  }

  const { themes, images } = data || { themes: [], images: [] };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl md:text-4xl font-playfair text-center mb-8">Galerie Photo</h1>
        <GalleryTabs themes={themes} images={images} />
      </div>
    </Layout>
  );
};

export default PhotoGallery;
