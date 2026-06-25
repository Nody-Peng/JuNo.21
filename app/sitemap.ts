import { MetadataRoute } from 'next';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise });

  // Fetch all posts (drafts feature is not enabled so all posts are public)
  const { docs: posts } = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 1000,
  });

  const baseUrl = 'https://juno21.com';

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // Post routes
  const postRoutes = posts.map((post) => {
    // Some posts might have a custom slug, otherwise fallback to id
    const slug = post.slug ? (post.slug.startsWith('/') ? post.slug.slice(1) : post.slug) : post.id;
    return {
      url: `${baseUrl}/post/${slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    };
  });

  return [...routes, ...postRoutes];
}
