import Link from 'next/link';

export default function FeaturedPosts({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section className="w-full bg-stone-50 py-16 border-y border-stone-100">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="flex items-center gap-3 mb-10">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm">
            置頂精選
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
            必讀文章
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <Link 
              href={`/post/${post.slug || post.id}`} 
              key={post.id}
              className="group flex flex-col bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-lg hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 to-orange-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <h3 className="text-2xl font-bold text-stone-800 mb-4 group-hover:text-amber-700 transition-colors duration-200">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-stone-500 leading-relaxed">
                  {post.excerpt}
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
