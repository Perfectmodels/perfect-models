
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

const MetaTags = ({ 
  title, 
  description, 
  image = "https://scontent.flbv4-1.fna.fbcdn.net/v/t39.30808-6/480946208_616728137878198_6925216743970681454_n.jpg",
  url = "https://perfectmodels.ga"
}: MetaTagsProps) => {
  const siteName = "Perfect Model Management";
  const fullTitle = `${title} | ${siteName}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="French" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default MetaTags;
