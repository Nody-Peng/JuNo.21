import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerAuth, logoutAction } from '@/lib/auth';
import { getMyPosts } from '@/lib/api';

export const metadata = { title: '我的文章 · 夏至原點' };

export default async function MyPostsPage() {
  const auth = await getServerAuth();
  if (!auth) redirect('/studio');

  const data = await getMyPosts(auth.token, auth.user.id);
  const posts = data?.docs || [];

  const published = posts.filter(p => p._status === 'published');
  const drafts    = posts.filter(p => p._status !== 'published');

  return (
    <div className="min-h-screen bg-[#F9F8F6] py-16 px-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/20 via-[#F9F8F6] to-[#F9F8F6]">
      <div className="max-w-[800px] mx-auto">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <h1 className="font-serif text-4xl font-bold text-[#3B2D2A] tracking-wider mb-2">我的文章</h1>
            <p className="text-[13px] text-[#3B2D2A]/40 tracking-widest uppercase ml-1">{auth.user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[13px] font-medium text-[#3B2D2A]/40 hover:text-[#3B2D2A] transition-colors uppercase tracking-widest px-2"
              >
                Sign Out
              </button>
            </form>
            <Link
              href="/newsletter"
              className="px-6 py-3 rounded-full bg-white/50 text-[#3B2D2A] text-[13px] font-semibold tracking-[0.15em] border border-[#3B2D2A]/10 hover:bg-white hover:border-[#3B2D2A]/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              發送電子報
            </Link>
            <Link
              href="/write"
              className="px-6 py-3 rounded-full bg-[#3B2D2A] text-[#F9F8F6] text-[13px] font-medium tracking-[0.15em] hover:bg-[#2a1f1c] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-lg leading-none mt-[-2px]">+</span> 新增文章
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-6 mb-16">
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-white/40 shadow-[0_8px_32px_rgba(59,45,42,0.03)] hover:shadow-[0_8px_32px_rgba(59,45,42,0.06)] transition-all duration-500">
            <div className="text-5xl font-bold font-serif text-[#3B2D2A] mb-2">{published.length}</div>
            <div className="text-[11px] font-semibold text-[#3B2D2A]/40 tracking-[0.2em] uppercase">Published</div>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-white/40 shadow-[0_8px_32px_rgba(59,45,42,0.03)] hover:shadow-[0_8px_32px_rgba(59,45,42,0.06)] transition-all duration-500">
            <div className="text-5xl font-bold font-serif text-[#3B2D2A] mb-2">{drafts.length}</div>
            <div className="text-[11px] font-semibold text-[#3B2D2A]/40 tracking-[0.2em] uppercase">Drafts</div>
          </div>
        </div>

        {/* ── Posts List ── */}
        {posts.length === 0 ? (
          <div className="text-center py-32 bg-white/40 backdrop-blur-sm rounded-[2rem] border border-white/40 border-dashed">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl opacity-50">✍️</span>
            </div>
            <p className="text-[#3B2D2A]/60 font-medium mb-6 tracking-widest">還沒有任何文章</p>
            <Link href="/write" className="inline-flex items-center gap-2 text-[13px] font-semibold text-amber-700 hover:text-amber-600 transition-colors tracking-widest uppercase">
              開始寫第一篇文章 <span className="text-lg">→</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Published */}
            {published.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-[10px] font-bold text-[#3B2D2A]/40 uppercase tracking-[0.2em]">已發布</h2>
                  <div className="flex-1 h-px bg-[#3B2D2A]/5"></div>
                </div>
                <div className="space-y-4">
                  {published.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
            )}

            {/* Drafts */}
            {drafts.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-[10px] font-bold text-[#3B2D2A]/40 uppercase tracking-[0.2em]">草稿</h2>
                  <div className="flex-1 h-px bg-[#3B2D2A]/5"></div>
                </div>
                <div className="space-y-4">
                  {drafts.map(post => (
                    <PostCard key={post.id} post={post} isDraft />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Post Card ───────────────────────────────────────────────

interface PostItem {
  id: string;
  title: string;
  slug?: string;
  publishedDate: string;
  _status?: string;
  heroImage?: { url?: string };
}

function PostCard({ post, isDraft }: { post: PostItem; isDraft?: boolean }) {
  return (
    <div className="group relative bg-white/70 backdrop-blur-sm rounded-[1.5rem] p-4 pr-6 flex items-center gap-6 border border-white hover:border-amber-200/50 hover:shadow-[0_8px_30px_rgba(59,45,42,0.04)] transition-all duration-300">
      {post.heroImage?.url ? (
        <div className="w-24 h-20 rounded-xl overflow-hidden shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <img src={post.heroImage.url} alt="" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
        </div>
      ) : (
        <div className="w-24 h-20 rounded-xl bg-[#F5F2EE] shrink-0 flex items-center justify-center text-[#3B2D2A]/20">
          <span className="text-xl">📝</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          {isDraft && (
            <span className="text-[9px] font-bold bg-amber-100/50 text-amber-700 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Draft
            </span>
          )}
          <h3 className="font-serif text-lg font-medium text-[#3B2D2A] truncate group-hover:text-amber-800 transition-colors">
            {post.title}
          </h3>
        </div>
        <p className="text-[11px] text-[#3B2D2A]/40 tracking-wider">
          {new Date(post.publishedDate).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
        {!isDraft && (
          <Link
            href={`/post/${post.slug || post.id}`}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#3B2D2A]/40 hover:text-[#3B2D2A] hover:bg-[#F5F2EE] transition-colors"
            title="查看文章"
            target="_blank"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </Link>
        )}
        <Link
          href={`/my-posts/${post.id}/edit`}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F5F2EE] text-[#3B2D2A] hover:bg-amber-100 hover:text-amber-900 transition-colors shadow-sm"
          title="編輯"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </Link>
      </div>
    </div>
  );
}
