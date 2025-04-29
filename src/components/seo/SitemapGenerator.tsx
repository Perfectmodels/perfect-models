
import React, { useEffect, useState } from 'react';
import { generateSitemap } from '../../utils/siteMapGenerator';
import { useLocation } from 'react-router-dom';

interface SitemapGeneratorProps {
  baseURL: string;
}

const SitemapGenerator: React.FC<SitemapGeneratorProps> = ({ baseURL }) => {
  const [sitemap, setSitemap] = useState<string>('');
  const location = useLocation();

  useEffect(() => {
    // Generate sitemap when component mounts or route changes
    const generatedSitemap = generateSitemap(baseURL);
    setSitemap(generatedSitemap);
    
    // Log for debugging purposes
    console.log(`Sitemap updated. Current route: ${location.pathname}`);
  }, [baseURL, location.pathname]);

  return (
    <div className="hidden">
      {/* Ce composant n'affiche rien de visible mais permet de générer 
          et stocker le sitemap à jour pour le reférencent sur différentes pages */}
    </div>
  );
};

export default SitemapGenerator;
