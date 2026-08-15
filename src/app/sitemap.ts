import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://neeshiartique.com';
  const lastModified = new Date();

  const routes = [
    '',
    '/shop',
    '/custom-orders',
    '/about',
    '/gallery',
    '/contact',
    '/wishlist',
    '/cart',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/shop' ? 0.9 : 0.7,
  }));
}
