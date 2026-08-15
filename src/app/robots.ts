import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/checkout/'],
    },
    sitemap: 'https://neeshiartique.com/sitemap.xml',
  };
}
