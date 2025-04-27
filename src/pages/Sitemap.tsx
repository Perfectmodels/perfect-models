
import React from 'react';
import { generateSitemap } from '../utils/siteMapGenerator';
import MetaTags from '../components/seo/MetaTags';

const Sitemap = () => {
  const baseURL = "https://perfectmodels.ga";
  const sitemap = generateSitemap(baseURL);

  return (
    <>
      <MetaTags 
        title="Sitemap"
        description="Sitemap for Perfect Model Management website"
      />
      <div className="container mx-auto p-6">
        <h1 className="font-playfair text-3xl mb-6">Sitemap</h1>
        <div className="bg-gray-100 p-4 rounded-md">
          <pre className="overflow-auto">{sitemap}</pre>
        </div>
      </div>
    </>
  );
};

export default Sitemap;
