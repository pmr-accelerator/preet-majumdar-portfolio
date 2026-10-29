import type { MetadataRoute } from 'next';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const paths = ['', '/about', '/experience', '/projects', '/achievements', '/creative', '/creative/singing', '/creative/guitar', '/creative/tabla', '/creative/drama', '/contact', '/privacy'];
  return paths.map(path => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === '' ? 'weekly' : 'monthly', priority: path === '' ? 1 : 0.6 }));
}
