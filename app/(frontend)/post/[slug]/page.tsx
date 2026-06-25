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

const createConverters = (headings: { text: string; id: string; tag: string }[]): JSXConvertersFunction => ({ defaultConverters }) => ({
  ...defaultConverters,
  heading: ({ node, nodesToJSX }: { node: any, nodesToJSX: any }) => {
    const tag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const text = node.children?.map((c: any) => c.text || '').join('') || '';
    const id = text.toLowerCase().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '') || undefined;
    const Tag = tag;
    return <Tag id={id} className="scroll-mt-24">{nodesToJSX({ nodes: node.children })}</Tag>;
  },
  blocks: {
    map: ({ node }: { node: any }) => (
      <div 
        className="w-full aspect-video my-10 rounded-2xl overflow-hidden shadow-sm" 
        dangerouslySetInnerHTML={{ __html: node.fields.embedHtml }} 
      />
    ),
    video: ({ node }: { node: any }) => {
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
    toc: () => {
      if (headings.length === 0) return null;
      return (
        <div className="my-10 bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm not-prose">
          <h4 className="text-sm font-bold tracking-widest text-[#8A6A5C] uppercase mb-4 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
            目錄 (Table of Contents)
          </h4>
          <ul className="flex flex-col gap-3 m-0 p-0 list-none">
            {headings.map((h, i) => (
              <li key={i} className={`m-0 p-0 ${h.tag === 'h2' ? 'ml-6' : ''}`}>
                <a href={`#${h.id}`} className="text-[#3B2D2A]/80 hover:text-amber-700 transition-colors text-[15px] md:text-base decoration-amber-700/30 underline-offset-4 hover:underline">
                  {h.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    },
    table: ({ node }: { node: any }) => {
      const { title, header, rows } = node.fields;
      return (
        <div className="my-10 w-full rounded-xl border border-gray-200 bg-white shadow-sm not-prose">
          {title && <div className="bg-gray-50 px-4 py-3 font-medium text-gray-800 border-b border-gray-200 rounded-t-xl">{title}</div>}
          <div className="overflow-x-auto rounded-b-xl hide-scrollbar">
            <table className="w-full text-left text-[15px] min-w-[700px]">
              {header && header.length > 0 && (
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    {header.map((h: any, i: number) => (
                      <th key={i} className="px-5 py-3.5 font-semibold whitespace-nowrap">{h.text}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-gray-100">
                {rows && rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
                    {row.cells && row.cells.map((cell: any, cIdx: number) => {
                      let textContent = cell.text || '';
                      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
                      let parts = [];
                      let lastIndex = 0;
                      let match;
                      while ((match = linkRegex.exec(textContent)) !== null) {
                        if (match.index > lastIndex) {
                          parts.push(textContent.slice(lastIndex, match.index));
                        }
                        parts.push(<a key={`link-${rIdx}-${cIdx}-${match.index}`} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">{match[1]}</a>);
                        lastIndex = linkRegex.lastIndex;
                      }
                      if (lastIndex < textContent.length) {
                        parts.push(textContent.slice(lastIndex));
                      }
                      return (
                        <td key={cIdx} className="px-5 py-4 align-top text-gray-800 leading-relaxed whitespace-pre-wrap">
                          <div className="flex flex-col gap-3">
                            {parts.length > 0 ? <div>{parts}</div> : null}
                            {cell.imageUrl && (
                              <img src={cell.imageUrl} alt="" className="w-full max-w-[300px] rounded-lg object-cover shadow-sm" />
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
    product: ({ node }: { node: any }) => {
      const { sectionTitle, items } = node.fields;
      if (!items || items.length === 0) return null;

      return (
        <div className="not-prose my-16 w-full">
          {sectionTitle && (
            <h3 className="text-2xl font-serif text-[#3B2D2A] mb-8 px-2 font-bold tracking-wide border-l-4 border-amber-700 pl-4">
              {sectionTitle}
            </h3>
          )}
          
          <div className="w-full overflow-x-auto pb-8 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory flex gap-6 hide-scrollbar">
            {items.map((item: any, idx: number) => {
              const { productName, price, description, link, image } = item;
              const imageUrl = typeof image === 'object' && image?.url ? image.url : 'https://picsum.photos/seed/product/600/600';
              const imageAlt = typeof image === 'object' && image?.alt ? image.alt : productName;

              return (
                <div 
                  key={idx} 
                  className="shrink-0 w-[85vw] md:w-[400px] lg:w-[450px] snap-center bg-white/80 backdrop-blur-2xl border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden flex flex-col transition-transform hover:-translate-y-1 duration-300"
                >
                  {/* Image Section */}
                  <div className="w-full relative aspect-square bg-stone-100 overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={imageAlt} 
                      className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-700" 
                    />
                  </div>

                  {/* Content Section */}
                  <div className="w-full p-8 flex flex-col flex-1 bg-white/50 relative">
                    <span className="inline-block text-[10px] font-bold tracking-widest text-[#8A6A5C] mb-3 uppercase">
                      Editor's Pick
                    </span>
                    
                    <h4 className="text-xl font-serif text-[#3B2D2A] leading-snug mb-2">
                      {productName}
                    </h4>
                    
                    {price && (
                      <p className="text-sm font-sans font-medium text-[#5C4F4A] mb-4">
                        {price}
                      </p>
                    )}
                    
                    <div className="text-[#3B2D2A]/80 leading-relaxed font-sans mb-6 text-sm whitespace-pre-wrap flex-1">
                      {description}
                    </div>
                    
                    {link && (
                      <a 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group w-full flex items-center justify-center gap-3 bg-[#2C2422] text-[#F9F8F6] px-6 py-3 rounded-xl hover:bg-[#8A6A5C] transition-colors duration-300 shadow-sm font-sans text-xs font-medium tracking-widest mt-auto"
                      >
                        查看詳情
                        <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  }
});

export const dynamic = 'force-dynamic';

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

  // Extract headings for TOC
  const headings: { text: string; id: string; tag: string }[] = [];
  if (post.content?.root?.children) {
    for (const node of post.content.root.children) {
      if (node.type === 'heading' && (node.tag === 'h1' || node.tag === 'h2')) {
        const text = node.children?.map((c: any) => c.text || '').join('') || '';
        const id = text.toLowerCase().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '') || `heading-${headings.length}`;
        if (text) headings.push({ text, id, tag: node.tag });
      }
    }
  }

  const jsxConverters = createConverters(headings);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.heroImage?.url ? [post.heroImage.url] : [],
    datePublished: date.toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: [{
      '@type': 'Person',
      name: '夏至原點',
      url: 'https://juno21.com'
    }]
  };

  return (
    <article className="w-full bg-[#F9F8F6] pt-16 pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[800px] mx-auto px-6 md:px-12">
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="text-sm font-semibold tracking-widest text-[#3B2D2A]/60 uppercase mb-4 flex items-center justify-center gap-3">
            <span>{formattedDate}</span>
            {(primaryCategory || seriesTag) && <span>•</span>}
            <span className="text-amber-700/80">{primaryCategory}</span>
            {seriesTag && <span className="text-[#3B2D2A]/40">{seriesTag}</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[#3B2D2A] leading-[1.3] mb-10 text-balance whitespace-pre-line">
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
