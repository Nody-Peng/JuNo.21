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
    },
    product: ({ node }) => {
      const { productName, price, description, link, image } = node.fields;
      const imageUrl = typeof image === 'object' && image?.url ? image.url : 'https://picsum.photos/seed/product/600/600';
      const imageAlt = typeof image === 'object' && image?.alt ? image.alt : productName;

      return (
        <div className="not-prose my-16 w-full bg-white/80 backdrop-blur-2xl border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-stretch">
          
          {/* Image Section */}
          <div className="w-full md:w-2/5 relative h-[350px] md:h-auto bg-stone-100 shrink-0">
            <img 
              src={imageUrl} 
              alt={imageAlt} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          </div>

          {/* Content Section */}
          <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center bg-white/50 relative">
            {/* Decorative Top Right Badge */}
            <div className="absolute top-8 right-8 text-[#8A6A5C] opacity-30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>

            <span className="inline-block text-xs font-bold tracking-widest text-[#8A6A5C] mb-4 uppercase">
              Editor's Pick
            </span>
            
            <h3 className="text-2xl md:text-3xl font-serif text-[#3B2D2A] leading-snug mb-2 text-balance">
              {productName}
            </h3>
            
            {price && (
              <p className="text-lg font-sans font-medium text-[#5C4F4A] mb-6">
                {price}
              </p>
            )}
            
            <div className="text-[#3B2D2A]/80 leading-relaxed font-sans mb-8 text-sm md:text-base whitespace-pre-wrap">
              {description}
            </div>
            
            {link && (
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group w-fit flex items-center gap-3 bg-[#2C2422] text-[#F9F8F6] px-8 py-3.5 rounded-full hover:bg-[#8A6A5C] transition-colors duration-300 shadow-md font-sans text-sm font-medium tracking-widest"
              >
                查看詳情
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            )}
          </div>
          
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
