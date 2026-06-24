import Link from 'next/link';
import ScrollReveal from './ScrollReveal';

export default function LatestPosts({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section id="latest" className="w-full bg-[#F9F8F6] py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between mb-12 border-b border-[#3B2D2A]/10 pb-6">
          <ScrollReveal direction="right">
            <h2 className="text-4xl md:text-5xl font-serif text-[#3B2D2A] tracking-widest">
              最新文章
            </h2>
          </ScrollReveal>
          
          <ScrollReveal direction="left" delay={150}>
            <Link 
              href="/blog" 
              className="hidden md:flex border border-[#3B2D2A] text-[#3B2D2A] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#3B2D2A] hover:text-[#F9F8F6] transition-all items-center gap-2"
            >
              瀏覽所有文章 <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            </Link>
          </ScrollReveal>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {posts.slice(0,3).map((post, index) => {
            const categories = post.category || [];
            const primaryCategory = categories[0]?.title || categories[0] || '';
            const seriesTag = post.series ? `連載：${post.series}` : '';

            return (
              <ScrollReveal key={post.id} direction="up" delay={index * 150} className="h-full">
                <Link 
                  href={`/post/${post.slug || post.id}`} 
                  className="group flex flex-col h-full"
                >
                  <div className="w-full aspect-[4/5] bg-stone-200 overflow-hidden mb-5 rounded-sm shadow-sm">
                    <img 
                      src={post.heroImage?.url || `https://picsum.photos/seed/${post.id}/600/800`} 
                      alt={post.heroImage?.alt || post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  
                  <div className="text-xs font-bold text-[#3B2D2A]/60 mb-3 tracking-widest flex items-center gap-2 flex-wrap">
                    {primaryCategory && <span className="text-amber-700/90">{primaryCategory}</span>}
                    {(primaryCategory && seriesTag) && <span>•</span>}
                    {seriesTag && <span>{seriesTag}</span>}
                  </div>
                  
                  <h3 className="text-2xl font-serif text-[#3B2D2A] mb-3 group-hover:text-amber-800 transition-colors leading-[1.3]">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-stone-600 text-sm leading-relaxed line-clamp-2 font-sans">
                      {post.excerpt}
                    </p>
                  )}
                </Link>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
