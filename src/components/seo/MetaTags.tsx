
// src/components/seo/MetaTags.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  siteName?: string;
  lang?: string;
}

const MetaTags: React.FC<MetaTagsProps> = ({
  title,
  description,
  image = "https://scontent.flbv4-1.fna.fbcdn.net/v/t39.30808-6/480946208_616728137878198_6925216743970681454_n.jpg",
  url = "https://perfectmodels.ga",
  siteName = "Perfect Model Management",
  lang = "fr",
}) => {
  const fullTitle = `${title} | ${siteName}`;
  const locale = lang === 'fr' ? 'fr_FR' : 'en_US'; // Basic logic for locale

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default MetaTags;
