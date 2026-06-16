import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { RichText, JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'posts',
    where: { or: [{ slug: { equals: slug } }, { slug: { equals: `/${slug}` } }] },
  });
  const post = docs[0];
  
  if (!post) return { title: '文章未找到' };
  
  return {
    title: `${post.title} | 夏至原點`,
    description: post.excerpt || `${post.title} 的詳細內容。`,
    openGraph: {
      title: post.title,
      description: post.excerpt || undefined,
      images: post.heroImage?.url ? [post.heroImage.url] : [],
    }
  };
}

const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    map: ({ node }) => (
      <div 
        className="w-full aspect-video my-10 rounded-2xl overflow-hidden shadow-sm" 
        dangerouslySetInnerHTML={{ __html: node.fields.embedHtml }} 
      />
    ),
    video: ({ node }) => {
      let embedUrl = node.fields.url;
      if (embedUrl.includes('watch?v=')) {
        embedUrl = embedUrl.replace('watch?v=', 'embed/');
      }
      return (
        <div className="w-full aspect-video my-10 rounded-2xl overflow-hidden shadow-sm bg-stone-100 flex items-center justify-center">
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen frameBorder="0" />
        </div>
      );
    }
  }
});

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      or: [
        { slug: { equals: slug } },
        { slug: { equals: `/${slug}` } },
      ],
    },
    depth: 1, // ensure categories are populated
  });

  const post = docs[0];

  if (!post) {
    notFound();
  }

  const dateStr = post.publishedDate || post.createdAt;
  const date = dateStr ? new Date(dateStr) : new Date();
  const formattedDate = date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', year: 'numeric' });

  const categories = post.category || [];
  const primaryCategory = categories[0]?.title || categories[0] || '';
  const seriesTag = post.series ? `連載：${post.series}` : '';

  return (
    <article className="w-full bg-[#F9F8F6] pt-16 pb-32">
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="text-sm font-semibold tracking-widest text-[#3B2D2A]/60 uppercase mb-4 flex items-center justify-center gap-3">
            <span>{formattedDate}</span>
            {(primaryCategory || seriesTag) && <span>•</span>}
            <span className="text-amber-700/80">{primaryCategory}</span>
            {seriesTag && <span className="text-[#3B2D2A]/40">{seriesTag}</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3B2D2A] leading-[1.3] mb-10 text-balance">
            {post.title}
          </h1>
          <div className="w-16 h-px bg-[#3B2D2A]/20 mx-auto"></div>
        </header>

        {/* Feature Image Placeholder or Actual Image */}
        <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-stone-200 mb-16 overflow-hidden rounded-sm shadow-sm">
           <img 
             src={post.heroImage?.url || `https://picsum.photos/seed/${post.id}/1200/600`} 
             alt={post.heroImage?.alt || post.title}
             className="w-full h-full object-cover"
           />
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-stone max-w-[680px] mx-auto prose-headings:font-serif prose-headings:text-[#3B2D2A] prose-p:text-[#3B2D2A]/90 prose-a:text-amber-800 hover:prose-a:text-amber-600 prose-img:rounded-xl">
          {/* @ts-ignore */}
          <RichText data={post.content} converters={jsxConverters} />
        </div>
      </div>
    </article>
  );
}
