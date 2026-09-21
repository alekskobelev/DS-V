import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
}

export const useSEO = ({
  title,
  description,
  keywords,
  ogType = 'website',
  ogImage = '/logo.svg',
}: SEOProps) => {
  useEffect(() => {
    // 1. Update Title
    const fullTitle = title.includes('ДС‑Инжиниринг') || title.includes('ДС-Инжиниринг')
      ? title
      : `${title} | ДС‑Инжиниринг`;
    document.title = fullTitle;

    // 2. Helper to set meta tags
    const setMetaTag = (attr: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Standard Meta Tags
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }

    // 4. Update Open Graph Meta Tags
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    if (ogImage) {
      setMetaTag('property', 'og:image', ogImage);
    }

    // 5. Update Twitter Cards
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', description);
    if (ogImage) {
      setMetaTag('name', 'twitter:image', ogImage);
    }

  }, [title, description, keywords, ogType, ogImage]);
};
