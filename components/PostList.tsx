import Link from 'next/link';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function PostList({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) return null;

  return (
    <section id="writings" className="w-full max-w-[1200px] mx-auto px-6 md:px-12 py-20">
      <h2 className="text-2xl font-semibold tracking-tight text-stone-900 mb-12 flex items-center gap-3">
        最新隨筆
        <span className="flex-1 h-px bg-stone-200 ml-4"></span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link 
            href={`/post/${post.slug || post.id}`} 
            key={post.id}
            className="group flex flex-col bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md hover:border-stone-200 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="text-xs text-stone-400 mb-4 font-medium">
              {post.publishedDate ? formatDate(post.publishedDate) : '近期'}
            </div>
            <h3 className="text-xl font-semibold text-stone-800 mb-3 group-hover:text-stone-500 transition-colors duration-200">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="text-stone-500 text-sm leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
