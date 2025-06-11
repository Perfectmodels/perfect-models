import React, { useMemo } from 'react';
import { generateSitemap } from '../../utils/siteMapGenerator';
import { useLocation } from 'react-router-dom';

interface SitemapGeneratorProps {
  baseURL: string;
}

const SitemapGenerator: React.FC<SitemapGeneratorProps> = ({ baseURL }) => {
  const location = useLocation();

  // Génère le sitemap uniquement si baseURL ou le chemin changent
  const sitemap = useMemo(
    () => generateSitemap(baseURL),
    [baseURL, location.pathname]
  );

  // Ajoute ici ce que tu veux faire avec le sitemap (par exemple, l’exporter)
  // Exemple : console.log(sitemap);

  return null; // Ce composant n’affiche rien dans le DOM
};

export default SitemapGenerator;
