import React from 'react';
import SEO from '../components/SEO';
import ArticleGenerator from '../components/ArticleGenerator';

const ImageGeneration: React.FC = () => (
  <div className="bg-pm-dark min-h-screen text-pm-off-white">
    <SEO title="Génération d'Image IA" noIndex />
    <div className="page-container">
      <h1 className="text-4xl font-playfair font-black italic mb-8">Génération d'Image IA</h1>
      <ArticleGenerator />
    </div>
  </div>
);

export default ImageGeneration;
