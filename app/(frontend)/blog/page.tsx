import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import BlogFilter from '@/components/BlogFilter';

export default async function BlogPage() {
  const payload = await getPayload({ config: configPromise });

  // Fetch all categories
  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
  });

  // Fetch all posts with depth to populate categories
  const { docs: posts } = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 100,
    sort: '-publishedDate',
  });

  return (
    <div className="w-full bg-[#F9F8F6] min-h-screen pt-24 pb-32">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-5xl md:text-[6rem] font-serif text-[#3B2D2A] leading-tight mb-6 tracking-widest">
            所有文章
          </h1>
          <p className="text-[#3B2D2A]/60 font-sans text-lg tracking-widest max-w-[500px] mx-auto uppercase">
            All Stories & Journal
          </p>
          <div className="w-12 h-px bg-[#3B2D2A]/20 mx-auto mt-8"></div>
        </header>

        {/* Dynamic Filter Section */}
        {/* @ts-ignore */}
        <BlogFilter posts={posts} categories={categories} />

      </div>
    </div>
  );
}
