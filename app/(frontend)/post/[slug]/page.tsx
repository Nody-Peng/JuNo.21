import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { RichText, JSXConvertersFunction } from '@payloadcms/richtext-lexical/react';
import type { Metadata } from 'next';
import ProductCarousel from '@/components/ProductCarousel';
import React from 'react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayload({ config: configPromise });
  const { docs } = await payload.find({
    collection: 'posts',
    where: { 
      and: [
        { or: [{ slug: { equals: slug } }, { slug: { equals: `/${slug}` } }] },
        { status: { equals: 'published' } }
      ]
    },
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
  text: ({ node }: { node: any }) => {
    let text = node.text || '';
    const colorRegex = /\{color:([^}]+)\}([\s\S]*?)\{\/color\}/g;
    
    let rendered: React.ReactNode = text;
    if (text.includes('{color:')) {
      const parts = [];
      let lastIndex = 0;
      let match;
      let idx = 0;
      while ((match = colorRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.slice(lastIndex, match.index));
        }
        parts.push(<span key={`c-${idx++}`} style={{ color: match[1] }}>{match[2]}</span>);
        lastIndex = colorRegex.lastIndex;
      }
      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
      }
      rendered = <React.Fragment>{parts}</React.Fragment>;
    }
    
    if (node.format & 1) rendered = <strong key="b">{rendered}</strong>;
    if (node.format & 2) rendered = <em key="i">{rendered}</em>;
    if (node.format & 8) rendered = <u key="u">{rendered}</u>;
    if (node.format & 16) rendered = <code key="c">{rendered}</code>;
    
    return rendered;
  },
  heading: ({ node, nodesToJSX }: { node: any, nodesToJSX: any }) => {
    const tag = node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
    const text = node.children?.map((c: any) => c.text || '').join('') || '';
    const id = text.toLowerCase().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '') || undefined;
    const Tag = tag;
    return <Tag id={id} className="scroll-mt-24">{nodesToJSX({ nodes: node.children })}</Tag>;
  },
  upload: ({ node }: { node: any }) => {
    return (
      <div className="w-full my-10 flex justify-center">
        <img 
          src={node.value?.url} 
          alt={node.value?.alt || ''} 
          className="max-w-full rounded-2xl shadow-sm object-contain" 
          style={{ maxHeight: '600px' }}
        />
      </div>
    );
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
                      
                      const colorRegex = /\{color:([^}]+)\}([\s\S]*?)\{\/color\}/g;
                      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

                      const colorNodes = [];
                      let colorLastIndex = 0;
                      let colorMatch;
                      while ((colorMatch = colorRegex.exec(textContent)) !== null) {
                        if (colorMatch.index > colorLastIndex) {
                          colorNodes.push({ text: textContent.slice(colorLastIndex, colorMatch.index), color: '' });
                        }
                        colorNodes.push({ text: colorMatch[2], color: colorMatch[1] });
                        colorLastIndex = colorRegex.lastIndex;
                      }
                      if (colorLastIndex < textContent.length) {
                        colorNodes.push({ text: textContent.slice(colorLastIndex), color: '' });
                      }

                      let parts: React.ReactNode[] = [];
                      let partIdx = 0;
                      for (const node of colorNodes) {
                        let linkLastIndex = 0;
                        let linkMatch;
                        while ((linkMatch = linkRegex.exec(node.text)) !== null) {
                          if (linkMatch.index > linkLastIndex) {
                            const t = node.text.slice(linkLastIndex, linkMatch.index);
                            parts.push(node.color ? <span key={`t-${rIdx}-${cIdx}-${partIdx++}`} style={{ color: node.color }}>{t}</span> : <React.Fragment key={`t-${rIdx}-${cIdx}-${partIdx++}`}>{t}</React.Fragment>);
                          }
                          parts.push(
                            <a key={`l-${rIdx}-${cIdx}-${partIdx++}`} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline">
                              {node.color ? <span style={{ color: node.color }}>{linkMatch[1]}</span> : linkMatch[1]}
                            </a>
                          );
                          linkLastIndex = linkRegex.lastIndex;
                        }
                        if (linkLastIndex < node.text.length) {
                          const t = node.text.slice(linkLastIndex);
                          parts.push(node.color ? <span key={`t-${rIdx}-${cIdx}-${partIdx++}`} style={{ color: node.color }}>{t}</span> : <React.Fragment key={`t-${rIdx}-${cIdx}-${partIdx++}`}>{t}</React.Fragment>);
                        }
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
      return <ProductCarousel items={items} sectionTitle={sectionTitle} />;
    },
    button: ({ node }: { node: any }) => {
      const { text, url } = node.fields;
      if (!text || !url) return null;
      return (
        <div className="my-12 flex justify-center w-full not-prose">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center px-10 py-4 bg-[#3B2D2A] text-white !text-white !no-underline rounded-full font-medium tracking-widest transition-all shadow-[0_8px_30px_rgb(59,45,42,0.2)] hover:shadow-[0_12px_40px_rgb(59,45,42,0.3)] hover:-translate-y-1 text-[15px] overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {text}
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
            <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
          </a>
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
      and: [
        {
          or: [
            { slug: { equals: slug } },
            { slug: { equals: `/${slug}` } },
          ],
        },
        { status: { equals: 'published' } }
      ]
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
        <div className="w-full aspect-[1200/630] bg-stone-200 mb-16 overflow-hidden rounded-sm shadow-sm flex items-center justify-center">
           <img 
             src={post.heroImage?.url || `https://picsum.photos/seed/${post.id}/1200/630`} 
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
