import type { MetadataRoute } from 'next';

const BASE_URL = 'https://example.com';

const publicRoutes = [''];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return publicRoutes.map((route) => ({
    url: `${BASE_URL}/${route}`.replace(/\/$/, ''),
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }));
}
