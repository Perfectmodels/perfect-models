
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout';
import { useGalleryData } from '@/hooks/useGalleryData';
import GalleryLoading from '@/components/gallery/GalleryLoading';
import GalleryTabs from '@/components/gallery/GalleryTabs';
import { toast } from 'sonner';

const PhotoGallery = () => {
  const { data, isLoading, error } = useGalleryData();

  // Afficher une erreur si quelque chose ne va pas avec le chargement des données
  useEffect(() => {
    if (error) {
      console.error("Erreur de chargement de la galerie:", error);
      toast.error("Impossible de charger la galerie. Veuillez réessayer plus tard.");
    }
  }, [error]);

  // Afficher les données chargées pour débugger
  useEffect(() => {
    if (data) {
      console.log("Données chargées:", data);
    }
  }, [data]);

  if (isLoading) {
    return (
      <Layout>
        <GalleryLoading />
      </Layout>
    );
  }

  const { themes = [], images = [] } = data || {};

  // Vérifiez si nous avons des données valides
  if (!themes.length) {
    return (
      <Layout>
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-playfair text-center mb-8">Galerie Photo</h1>
          <p className="text-muted-foreground">
            {error ? "Une erreur s'est produite lors du chargement de la galerie." : "Aucun thème n'est disponible pour le moment."}
          </p>
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
