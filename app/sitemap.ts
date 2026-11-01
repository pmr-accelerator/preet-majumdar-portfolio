
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://preet-majumdar-portfolio.onrender.com';

const routes = [
  '',
  '/about',
  '/experience',
  '/projects',
  '/achievements',
  '/creative',
  '/creative/singing',
  '/creative/guitar',
  '/creative/tabla',
  '/creative/drama',
  '/contact',
  '/reviews',
  '/privacy',
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.6,
  }));
}
