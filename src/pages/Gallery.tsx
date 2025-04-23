
import React from 'react';
import { Layout } from '@/components/layout';
import { useGalleryData } from '@/hooks/useGalleryData';
import GalleryLoading from '@/components/gallery/GalleryLoading';
import GalleryTabs from '@/components/gallery/GalleryTabs';

const PhotoGallery = () => {
  const { data, isLoading, error } = useGalleryData();

  if (isLoading) {
    return (
      <Layout>
        <GalleryLoading />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-playfair text-center mb-8">Galerie Photo</h1>
          <div className="text-center text-red-500">
            Une erreur s'est produite lors du chargement de la galerie. Veuillez réessayer plus tard.
          </div>
        </div>
      </Layout>
    );
  }

  const { themes, images } = data || { themes: [], images: [] };

  // If we don't have any themes, show a message
  if (!themes.length) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl md:text-4xl font-playfair text-center mb-8">Galerie Photo</h1>
          <div className="text-center text-muted-foreground">
            Aucune galerie disponible pour le moment.
          </div>
        </div>
      </Layout>
    );
  }

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
