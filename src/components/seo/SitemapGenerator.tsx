
import React, { useEffect, useState } from 'react';
import { generateSitemap } from '../../utils/siteMapGenerator';

interface SitemapGeneratorProps {
  baseURL: string;
}

const SitemapGenerator: React.FC<SitemapGeneratorProps> = ({ baseURL }) => {
  const [sitemap, setSitemap] = useState<string>('');

  useEffect(() => {
    // Generate sitemap when component mounts
    const generatedSitemap = generateSitemap(baseURL);
    setSitemap(generatedSitemap);
  }, [baseURL]);

  return (
    <div className="hidden">
      {/* This component doesn't render anything visible */}
      {/* The sitemap content can be accessed via a ref or directly in the component state */}
    </div>
  );
};

export default SitemapGenerator;
