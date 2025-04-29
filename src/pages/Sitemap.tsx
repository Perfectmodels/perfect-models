
import React from 'react';
import { generateSitemap } from '../utils/siteMapGenerator';
import MetaTags from '../components/seo/MetaTags';

const Sitemap = () => {
  const baseURL = "https://perfectmodels.ga";
  const sitemap = generateSitemap(baseURL);

  return (
    <>
      <MetaTags 
        title="Plan du site"
        description="Plan du site Perfect Model Management - Découvrez toutes les pages de notre site pour naviguer facilement"
      />
      <div className="container mx-auto p-6">
        <h1 className="font-playfair text-3xl mb-6">Plan du site</h1>
        <p className="mb-4">Voici le plan du site complet de Perfect Model Management pour faciliter votre navigation.</p>
        <div className="bg-gray-100 p-4 rounded-md">
          <pre className="whitespace-pre-wrap overflow-auto">{sitemap}</pre>
        </div>
      </div>
    </>
  );
};

export default Sitemap;
