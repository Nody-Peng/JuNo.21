import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/'], // Don't index the admin panel or raw APIs
    },
    sitemap: 'https://juno21.com/sitemap.xml',
  };
}
