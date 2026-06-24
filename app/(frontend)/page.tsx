import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import Hero from '@/components/Hero';
import LatestPosts from '@/components/LatestPosts';
import AboutSection from '@/components/AboutSection';
import Newsletter from '@/components/Newsletter';

export const revalidate = 60;

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise });
  
  const { docs: posts } = await payload.find({
    collection: 'posts',
    sort: '-publishedDate',
    limit: 3, // Changed to 3 to match the design
  });

  return (
    <div className="w-full">
      <Hero />
      <LatestPosts posts={posts} />
      <AboutSection />
      <Newsletter />
    </div>
  );
}
